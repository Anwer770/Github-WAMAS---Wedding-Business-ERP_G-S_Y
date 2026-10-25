/**
 * WAMAS ERP - Storage & State Synchronization Service
 * Manages local persistence, audit trails, and cross-module atomic events
 */

import {
  User, Product, ProductUnit, Customer, Booking, RentalContract,
  Collateral, Inspection, Task, Account, JournalEntry, KoshaProject, UserRole
} from '../types';
import {
  INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_UNITS, INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS, INITIAL_CONTRACTS, INITIAL_COLLATERALS, INITIAL_INSPECTIONS,
  INITIAL_TASKS, INITIAL_JOURNAL_ENTRIES, INITIAL_KOSHA_PROJECTS
} from './mockData';
import { INITIAL_CHART_OF_ACCOUNTS } from './doubleEntryAccountingService';

const STORAGE_KEY = 'WAMAS_ERP_STATE_V1';

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
  auditLogs: { id: string; timestamp: string; userId: string; userName: string; action: string; details: string }[];
}

export class StorageService {
  public static loadState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
