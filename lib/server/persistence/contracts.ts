import type {
  ActivityEntry,
  AppData,
  Customer,
  Destination,
  InstanceState,
  Order,
  Product,
  RawMaterial,
  Recipe,
  RecurringTemplate,
  SessionState,
  ShiftLog,
  Supplier,
  SupplierPriceEntry,
  User,
  WipEntry,
  Workspace,
  WorkspacePreferences,
} from '@/lib/domain/types';

export interface InstanceRepository {
  getWorkspace(): Workspace;
  updateWorkspace(next: Workspace): void;
  getPreferences(): WorkspacePreferences;
  updatePreferences(next: WorkspacePreferences): void;
  getInstanceState(): InstanceState;
  updateInstanceState(next: InstanceState): void;
  updateOnboardingProgress(next: Partial<InstanceState['onboardingProgress']>): void;
  updateModuleStates(next: Record<string, boolean>): void;
  setInitialized(initialized: boolean, onboardingStatus?: InstanceState['onboardingStatus']): void;
  getSessionState(): SessionState;
  updateSessionState(next: SessionState): void;
  setSessionUser(userId: string | undefined, lastLoginAt?: string): void;
}

export interface UsersRepository {
  list(): User[];
  getById(userId: string): User | undefined;
  upsert(user: User): void;
  replaceAll(next: User[]): void;
}

export interface CustomersRepository {
  list(): Customer[];
  upsertMany(customers: Customer[]): void;
  replaceAll(next: Customer[]): void;
}

export interface OrdersRepository {
  list(): Order[];
  replaceAll(next: Order[]): void;
}

export interface RecurringTemplatesRepository {
  list(): RecurringTemplate[];
  replaceAll(next: RecurringTemplate[]): void;
}

export interface CatalogRepository {
  listProducts(): Product[];
  listDestinations(): Destination[];
}

export interface ProcurementRepository {
  listSuppliers(): Supplier[];
  replaceSuppliers(next: Supplier[]): void;
  listRawMaterials(): RawMaterial[];
  replaceRawMaterials(next: RawMaterial[]): void;
  listSupplierPriceEntries(): SupplierPriceEntry[];
  replaceSupplierPriceEntries(next: SupplierPriceEntry[]): void;
  listRecipes(): Recipe[];
  replaceRecipes(next: Recipe[]): void;
}

export interface ProductionRepository {
  listWipEntries(): WipEntry[];
  replaceWipEntries(next: WipEntry[]): void;
  listShiftLogs(): ShiftLog[];
  replaceShiftLogs(next: ShiftLog[]): void;
}

export interface ActivityRepository {
  list(): ActivityEntry[];
  replaceAll(next: ActivityEntry[]): void;
}

export interface PersistenceReadContext {
  readonly raw: AppData;
  readonly instance: InstanceRepository;
  readonly users: UsersRepository;
  readonly customers: CustomersRepository;
  readonly orders: OrdersRepository;
  readonly recurringTemplates: RecurringTemplatesRepository;
  readonly catalog: CatalogRepository;
  readonly procurement: ProcurementRepository;
  readonly production: ProductionRepository;
  readonly activities: ActivityRepository;
}

export interface PersistenceWriteContext extends PersistenceReadContext {
  commit(): Promise<void>;
}

export interface PersistenceGateway {
  readSeed(): Promise<AppData>;
  reseedRuntime(): Promise<void>;
  read(): Promise<PersistenceReadContext>;
  write(mutator: (context: PersistenceWriteContext) => Promise<void> | void): Promise<void>;
}
