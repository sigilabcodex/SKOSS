import type { AppData, Customer, Destination, Product, User } from '@/lib/domain/types';
import type {
  ActivityRepository,
  CatalogRepository,
  CustomersRepository,
  InstanceRepository,
  OrdersRepository,
  PersistenceReadContext,
  ProcurementRepository,
  ProductionRepository,
  RecurringTemplatesRepository,
  UsersRepository,
} from '@/lib/server/persistence/contracts';

class InMemoryInstanceRepository implements InstanceRepository {
  constructor(private readonly data: AppData) {}

  getWorkspace() { return this.data.workspace; }
  updateWorkspace(next: AppData['workspace']) { this.data.workspace = next; }
  getPreferences() { return this.data.preferences; }
  updatePreferences(next: AppData['preferences']) { this.data.preferences = next; }
  getInstanceState() { return this.data.instance; }
  updateInstanceState(next: AppData['instance']) { this.data.instance = next; }
  updateOnboardingProgress(next: Partial<AppData['instance']['onboardingProgress']>) {
    this.data.instance.onboardingProgress = {
      ...this.data.instance.onboardingProgress,
      ...next,
    };
  }
  updateModuleStates(next: Record<string, boolean>) {
    this.data.instance.moduleStates = {
      ...(this.data.instance.moduleStates ?? {}),
      ...next,
    };
  }
  setInitialized(initialized: boolean, onboardingStatus?: AppData['instance']['onboardingStatus']) {
    this.data.instance.initialized = initialized;
    if (onboardingStatus) {
      this.data.instance.onboardingStatus = onboardingStatus;
    }
  }
  getSessionState() { return this.data.session; }
  updateSessionState(next: AppData['session']) { this.data.session = next; }
  setSessionUser(userId: string | undefined, lastLoginAt?: string) {
    this.data.session.currentUserId = userId;
    this.data.session.lastLoginAt = lastLoginAt;
  }
}

class InMemoryUsersRepository implements UsersRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.users; }
  getById(userId: string) { return this.data.users.find((user) => user.id === userId); }
  upsert(user: User) {
    const existingIndex = this.data.users.findIndex((entry) => entry.id === user.id);
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = user;
    } else {
      this.data.users.push(user);
    }
    this.data.users.sort((left, right) => left.displayName.localeCompare(right.displayName));
  }
  replaceAll(next: AppData['users']) { this.data.users = next; }
}

class InMemoryCustomersRepository implements CustomersRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.customers; }
  private upsert(customer: Customer) {
    const existingIndex = this.data.customers.findIndex((entry) => entry.id === customer.id);
    if (existingIndex >= 0) {
      this.data.customers[existingIndex] = customer;
    } else {
      this.data.customers.push(customer);
    }
    this.data.customers.sort((left, right) => left.displayName.localeCompare(right.displayName));
  }
  upsertMany(customers: Customer[]) {
    for (const customer of customers) {
      this.upsert(customer);
    }
  }
  replaceAll(next: AppData['customers']) { this.data.customers = next; }
}

class InMemoryOrdersRepository implements OrdersRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.orders; }
  replaceAll(next: AppData['orders']) { this.data.orders = next; }
}

class InMemoryRecurringTemplatesRepository implements RecurringTemplatesRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.recurringTemplates; }
  replaceAll(next: AppData['recurringTemplates']) { this.data.recurringTemplates = next; }
}

class InMemoryCatalogRepository implements CatalogRepository {
  constructor(private readonly data: AppData) {}
  listProducts(): Product[] { return this.data.products; }
  listDestinations(): Destination[] { return this.data.destinations; }
}

class InMemoryProcurementRepository implements ProcurementRepository {
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

class InMemoryProductionRepository implements ProductionRepository {
  constructor(private readonly data: AppData) {}
  listWipEntries() { return this.data.wipEntries; }
  replaceWipEntries(next: AppData['wipEntries']) { this.data.wipEntries = next; }
  listShiftLogs() { return this.data.shiftLogs; }
  replaceShiftLogs(next: AppData['shiftLogs']) { this.data.shiftLogs = next; }
}

class InMemoryActivityRepository implements ActivityRepository {
  constructor(private readonly data: AppData) {}
  list() { return this.data.activities; }
  replaceAll(next: AppData['activities']) { this.data.activities = next; }
}

export function buildReadContext(data: AppData): PersistenceReadContext {
  return {
    raw: data,
    instance: new InMemoryInstanceRepository(data),
    users: new InMemoryUsersRepository(data),
    customers: new InMemoryCustomersRepository(data),
    orders: new InMemoryOrdersRepository(data),
    recurringTemplates: new InMemoryRecurringTemplatesRepository(data),
    catalog: new InMemoryCatalogRepository(data),
    procurement: new InMemoryProcurementRepository(data),
    production: new InMemoryProductionRepository(data),
    activities: new InMemoryActivityRepository(data),
  };
}
