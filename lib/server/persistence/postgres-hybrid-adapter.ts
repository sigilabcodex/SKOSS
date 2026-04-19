import type { AppData } from '@/lib/domain/types';
import { getPersistenceMode, isPostgresEnabled } from '@/lib/server/db/env';
import type {
  PersistenceGateway,
  PersistenceWriteContext,
} from '@/lib/server/persistence/contracts';
import { buildReadContext } from '@/lib/server/persistence/context';
import { JsonRuntimePersistenceGateway } from '@/lib/server/persistence/json-runtime-adapter';
import {
  loadMigratedDomains,
  migratedDomainsReady,
  saveMigratedDomains,
} from '@/lib/server/persistence/drizzle/migrated-domains';

let postgresUnavailableLogged = false;

function cloneAppData(data: AppData): AppData {
  return structuredClone(data);
}

export class PostgresHybridPersistenceGateway implements PersistenceGateway {
  constructor(private readonly jsonGateway: JsonRuntimePersistenceGateway = new JsonRuntimePersistenceGateway()) {}

  private async canUsePostgres() {
    if (!isPostgresEnabled()) {
      return false;
    }

    try {
      await migratedDomainsReady();
      return true;
    } catch (error) {
      if (!postgresUnavailableLogged) {
        postgresUnavailableLogged = true;
        console.error('[persistence] PostgreSQL unavailable. Falling back to JSON runtime adapter.', error);
      }
      return false;
    }
  }

  private async bootstrapMigratedDomainsIfNeeded() {
    const ready = await migratedDomainsReady();
    if (ready) {
      return;
    }

    const jsonContext = await this.jsonGateway.read();
    await saveMigratedDomains(jsonContext.raw);
  }

  private async composeDataFromSources(baseData: AppData): Promise<AppData> {
    const pgData = await loadMigratedDomains();
    if (!pgData) {
      return baseData;
    }

    return {
      ...baseData,
      workspace: pgData.workspace,
      preferences: pgData.preferences ?? baseData.preferences,
      instance: pgData.instance ?? baseData.instance,
      session: pgData.session ?? baseData.session,
      users: pgData.users,
      customers: pgData.customers,
    };
  }

  private async writeJsonBackedDomains(next: AppData) {
    await this.jsonGateway.write(({ raw }) => {
      raw.destinations = next.destinations;
      raw.products = next.products;
      raw.suppliers = next.suppliers;
      raw.rawMaterials = next.rawMaterials;
      raw.supplierPriceEntries = next.supplierPriceEntries;
      raw.recipes = next.recipes;
      raw.recurringTemplates = next.recurringTemplates;
      raw.orders = next.orders;
      raw.wipEntries = next.wipEntries;
      raw.shiftLogs = next.shiftLogs;
      raw.activities = next.activities;
    });
  }

  async readSeed() {
    return this.jsonGateway.readSeed();
  }

  async reseedRuntime() {
    await this.jsonGateway.reseedRuntime();

    if (!(await this.canUsePostgres())) {
      return;
    }

    await this.bootstrapMigratedDomainsIfNeeded();
    const jsonContext = await this.jsonGateway.read();
    await saveMigratedDomains(jsonContext.raw);
  }

  async read() {
    if (!(await this.canUsePostgres())) {
      return this.jsonGateway.read();
    }

    await this.bootstrapMigratedDomainsIfNeeded();
    const jsonContext = await this.jsonGateway.read();
    const composed = await this.composeDataFromSources(cloneAppData(jsonContext.raw));
    return buildReadContext(composed);
  }

  async write(mutator: (context: PersistenceWriteContext) => Promise<void> | void) {
    if (!(await this.canUsePostgres())) {
      return this.jsonGateway.write(mutator);
    }

    await this.bootstrapMigratedDomainsIfNeeded();

    const jsonContext = await this.jsonGateway.read();
    const workingData = await this.composeDataFromSources(cloneAppData(jsonContext.raw));

    let committed = false;
    const persist = async () => {
      await saveMigratedDomains(workingData);
      await this.writeJsonBackedDomains(workingData);
      committed = true;
    };

    const context: PersistenceWriteContext = {
      ...buildReadContext(workingData),
      commit: persist,
    };

    await mutator(context);

    if (!committed) {
      await persist();
    }
  }
}

export function createPersistenceGateway() {
  if (getPersistenceMode() === 'json') {
    return new JsonRuntimePersistenceGateway();
  }

  return new PostgresHybridPersistenceGateway();
}
