import type { AppData, Destination, Product } from '@/lib/domain/types';
import { readSeedStore, readStore, reseedRuntimeStore, writeStore } from '@/lib/server/store';
import type {
  ActivityRepository,
  CatalogRepository,
  CustomersRepository,
  InstanceRepository,
  OrdersRepository,
  PersistenceGateway,
  PersistenceReadContext,
  PersistenceWriteContext,
  ProcurementRepository,
  ProductionRepository,
  RecurringTemplatesRepository,
  UsersRepository,
} from '@/lib/server/persistence/contracts';

class JsonRuntimeInstanceRepository implements InstanceRepository {
  constructor(private readonly data: AppData) {}

  getWorkspace() { return this.data.workspace; }
  updateWorkspace(next: AppData['workspace']) { this.data.workspace = next; }
  getPreferences() { return this.data.preferences; }
  updatePreferences(next: AppData['preferences']) { this.data.preferences = next; }
  getInstanceState() { return this.data.instance; }
  updateInstanceState(next: AppData['instance']) { this.data.instance = next; }
  getSessionState() { return this.data.session; }
  updateSessionState(next: AppData['session']) { this.data.session = next; }
}

class JsonRuntimeUsersRepository implements UsersRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.users; }
  replaceAll(next: AppData['users']) { this.data.users = next; }
}

class JsonRuntimeCustomersRepository implements CustomersRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.customers; }
  replaceAll(next: AppData['customers']) { this.data.customers = next; }
}

class JsonRuntimeOrdersRepository implements OrdersRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.orders; }
  replaceAll(next: AppData['orders']) { this.data.orders = next; }
}

class JsonRuntimeRecurringTemplatesRepository implements RecurringTemplatesRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.recurringTemplates; }
  replaceAll(next: AppData['recurringTemplates']) { this.data.recurringTemplates = next; }
}

class JsonRuntimeCatalogRepository implements CatalogRepository {
  constructor(private readonly data: AppData) {}
  listProducts(): Product[] { return this.data.products; }
  listDestinations(): Destination[] { return this.data.destinations; }
}

class JsonRuntimeProcurementRepository implements ProcurementRepository {
  constructor(private readonly data: AppData) {}
  listSuppliers() { return this.data.suppliers; }
  replaceSuppliers(next: AppData['suppliers']) { this.data.suppliers = next; }
  listRawMaterials() { return this.data.rawMaterials; }
  replaceRawMaterials(next: AppData['rawMaterials']) { this.data.rawMaterials = next; }
  listSupplierPriceEntries() { return this.data.supplierPriceEntries; }
  replaceSupplierPriceEntries(next: AppData['supplierPriceEntries']) { this.data.supplierPriceEntries = next; }
  listRecipes() { return this.data.recipes; }
  replaceRecipes(next: AppData['recipes']) { this.data.recipes = next; }
}

class JsonRuntimeProductionRepository implements ProductionRepository {
  constructor(private readonly data: AppData) {}
  listWipEntries() { return this.data.wipEntries; }
  replaceWipEntries(next: AppData['wipEntries']) { this.data.wipEntries = next; }
  listShiftLogs() { return this.data.shiftLogs; }
  replaceShiftLogs(next: AppData['shiftLogs']) { this.data.shiftLogs = next; }
}

class JsonRuntimeActivityRepository implements ActivityRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.activities; }
  replaceAll(next: AppData['activities']) { this.data.activities = next; }
}

function buildReadContext(data: AppData): PersistenceReadContext {
  return {
    raw: data,
    instance: new JsonRuntimeInstanceRepository(data),
    users: new JsonRuntimeUsersRepository(data),
    customers: new JsonRuntimeCustomersRepository(data),
    orders: new JsonRuntimeOrdersRepository(data),
    recurringTemplates: new JsonRuntimeRecurringTemplatesRepository(data),
    catalog: new JsonRuntimeCatalogRepository(data),
    procurement: new JsonRuntimeProcurementRepository(data),
    production: new JsonRuntimeProductionRepository(data),
    activities: new JsonRuntimeActivityRepository(data),
  };
}

export class JsonRuntimePersistenceGateway implements PersistenceGateway {
  async readSeed() {
    return readSeedStore();
  }

  async reseedRuntime() {
    await reseedRuntimeStore();
  }

  async read() {
    const data = await readStore();
    return buildReadContext(data);
  }

  async write(mutator: (context: PersistenceWriteContext) => Promise<void> | void) {
    const data = await readStore();
    let committed = false;

    const context: PersistenceWriteContext = {
      ...buildReadContext(data),
      commit: async () => {
        await writeStore(data);
        committed = true;
      },
    };

    await mutator(context);

    if (!committed) {
      await writeStore(data);
    }
  }
}
