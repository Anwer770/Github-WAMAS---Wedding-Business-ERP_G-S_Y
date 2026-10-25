/**
 * WAMAS ERP - Storage & State Synchronization Service
 * Manages local persistence, audit trails, and cross-module atomic events
 */

import {
  User, Product, ProductUnit, Customer, Booking, RentalContract,
  Collateral, Inspection, Task, Account, JournalEntry, KoshaProject, UserRole,
  ManufacturingOrder, JobOrder, Supplier, PurchaseOrder,
  RolePermissionMatrix, SystemSettings, SyncOutboxItem, SyncStatus
} from '../types';
import {
  INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_UNITS, INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS, INITIAL_CONTRACTS, INITIAL_COLLATERALS, INITIAL_INSPECTIONS,
  INITIAL_TASKS, INITIAL_JOURNAL_ENTRIES, INITIAL_KOSHA_PROJECTS,
  INITIAL_SUPPLIERS, INITIAL_PURCHASE_ORDERS, INITIAL_MANUFACTURING_ORDERS,
  INITIAL_JOB_ORDERS, INITIAL_PERMISSIONS_MATRIX, INITIAL_SYSTEM_SETTINGS,
  INITIAL_OUTBOX
} from './mockData';
import { INITIAL_CHART_OF_ACCOUNTS } from './doubleEntryAccountingService';

const STORAGE_KEY = 'WAMAS_ERP_STATE_V2';

export interface AppState {
  currentUser: User;
  users: User[];
  products: Product[];
  units: ProductUnit[];
  customers: Customer[];
  bookings: Booking[];
  contracts: RentalContract[];
  collaterals: Collateral[];
  inspections: Inspection[];
  tasks: Task[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  koshaProjects: KoshaProject[];
  // v2.0 Extensions
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  manufacturingOrders: ManufacturingOrder[];
  jobOrders: JobOrder[];
  permissionMatrix: RolePermissionMatrix;
  settings: SystemSettings;
  outbox: SyncOutboxItem[];
  syncStatus: SyncStatus;
  lastSyncTime: string;
  auditLogs: { id: string; timestamp: string; userId: string; userName: string; action: string; details: string }[];
}

export class StorageService {
  public static loadState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure v2 defaults are present if loaded from partial cache
        if (!parsed.suppliers) parsed.suppliers = INITIAL_SUPPLIERS;
        if (!parsed.purchaseOrders) parsed.purchaseOrders = INITIAL_PURCHASE_ORDERS;
        if (!parsed.manufacturingOrders) parsed.manufacturingOrders = INITIAL_MANUFACTURING_ORDERS;
        if (!parsed.jobOrders) parsed.jobOrders = INITIAL_JOB_ORDERS;
        if (!parsed.permissionMatrix) parsed.permissionMatrix = INITIAL_PERMISSIONS_MATRIX;
        if (!parsed.settings) parsed.settings = INITIAL_SYSTEM_SETTINGS;
        if (!parsed.outbox) parsed.outbox = INITIAL_OUTBOX;
        if (!parsed.syncStatus) parsed.syncStatus = 'ONLINE';
        if (!parsed.lastSyncTime) parsed.lastSyncTime = 'منذ دقيقة واحدة';
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read from localStorage, using initial mock data', e);
    }

    const defaultState: AppState = {
      currentUser: INITIAL_USERS[0], // Default: Owner
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      units: INITIAL_UNITS,
      customers: INITIAL_CUSTOMERS,
      bookings: INITIAL_BOOKINGS,
      contracts: INITIAL_CONTRACTS,
      collaterals: INITIAL_COLLATERALS,
      inspections: INITIAL_INSPECTIONS,
      tasks: INITIAL_TASKS,
      accounts: INITIAL_CHART_OF_ACCOUNTS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      koshaProjects: INITIAL_KOSHA_PROJECTS,
      suppliers: INITIAL_SUPPLIERS,
      purchaseOrders: INITIAL_PURCHASE_ORDERS,
      manufacturingOrders: INITIAL_MANUFACTURING_ORDERS,
      jobOrders: INITIAL_JOB_ORDERS,
      permissionMatrix: INITIAL_PERMISSIONS_MATRIX,
      settings: INITIAL_SYSTEM_SETTINGS,
      outbox: INITIAL_OUTBOX,
      syncStatus: 'ONLINE',
      lastSyncTime: 'الآن (متزامن)',
      auditLogs: [
        {
          id: 'log-1',
          timestamp: '2026-10-12T11:00:00Z',
          userId: 'usr-4',
          userName: 'نورة العتيبي',
          action: 'إنشاء حجز',
          details: 'تم إنشاء الحجز BOOK-2026-0042 للعميلة ريم آل سعود'
        },
        {
          id: 'log-2',
          timestamp: '2026-10-13T14:15:00Z',
          userId: 'usr-6',
          userName: 'مريم الحربي',
          action: 'قبض تأمين',
          details: 'تم استلام سند تأمين COL-2026-0089 بمبلغ 2500 ريال نقداً'
        },
        {
          id: 'log-3',
          timestamp: '2026-10-21T11:30:00Z',
          userId: 'usr-2',
          userName: 'سارة القحطاني',
          action: 'اعتماد أمر شراء',
          details: 'تم اعتماد أمر الشراء PO-2026-00101 بمبلغ 17,710 ريال من شركة الحرير الملكي'
        }
      ]
    };

    this.saveState(defaultState);
    return defaultState;
  }

  public static saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  public static resetToDefault(): AppState {
    localStorage.removeItem(STORAGE_KEY);
    return this.loadState();
  }
}
