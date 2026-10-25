/**
 * WAMAS ERP - Core TypeScript Types & Domain Interfaces
 * Built strictly according to WAMAS Master Prompt PRD v1.1
 */

// 1. Roles & Permissions (RBAC)
export type UserRole =
  | 'OWNER' // المالك - كامل النظام + التقارير + الإعدادات + الحذف
  | 'GENERAL_MANAGER' // المدير العام - إدارة + اعتماد + تقارير
  | 'ACCOUNTANT' // المحاسب - كل العمليات والتقارير المالية
  | 'SALES' // موظف المبيعات / الاستقبال - عملاء + حجوزات + عقود
  | 'RENTAL_AGENT' // موظف التأجير - دورة التأجير: تسليم + استلام + فحص
  | 'CASHIER' // الكاشير - POS + سندات قبض وصرف + الصندوق
  | 'WAREHOUSE' // موظف المخزن - حالة الأصناف + تسليم/استلام QR
  | 'TAILOR' // الخياط - أوامر التعديل + المقاسات
  | 'DELIVERY' // موظف التوصيل - مهام التوصيل والتركيب
  | 'PURCHASING_MANAGER' // مدير المشتريات والموردين
  | 'VIEWER'; // مشاهد / تقارير فقط

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  phone: string;
  email: string;
  avatar?: string;
  branchId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin?: string;
}

// 2. 14 Operational Statuses for Product Units
export type ProductUnitStatus =
  | 'AVAILABLE' // متاحة
  | 'BOOKED' // محجوزة
  | 'READY_FOR_DELIVERY' // جاهزة للتسليم
  | 'DELIVERED' // مُسلَّمة
  | 'RETURNED' // مُعادة
  | 'CLEANING' // قيد الغسيل
  | 'REQUIRED_REPAIR' // مطلوب إصلاح
  | 'REPAIR' // قيد الإصلاح
  | 'ALTERATION' // قيد التعديل
  | 'MAINTENANCE' // قيد الصيانة
  | 'PENDING_INSPECTION' // بانتظار الفحص
  | 'DAMAGED' // تالفة
  | 'LOST' // مفقودة
  | 'ON_DISPLAY' // معروضة
  | 'CUSTOMIZED'; // مخصصة

export type ProductCategory =
  | 'DRESSES_WEDDING' // فساتين زفاف
  | 'DRESSES_EVENING' // فساتين سهرة
  | 'DRESSES_ENGAGEMENT' // فساتين خطوبة
  | 'DRESSES_HENNA' // فساتين حناء
  | 'SUITS_GROOM' // بدل عريس
  | 'ACCESSORIES' // إكسسوارات وطرح وتيجان
  | 'KOSHA_DECOR' // الكوش والديكور
  | 'FURNITURE' // طاولات وكراسي
  | 'SOUND_LIGHTING' // صوت وإضاءة
  | 'SERVICES'; // خدمات

export interface Product {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  category: ProductCategory;
  type: 'RENT' | 'SALE' | 'BOTH';
  rentalPriceDaily: number;
  rentalPriceWeekly?: number;
  salePrice?: number;
  purchaseCost: number;
  requiredCollateral: number; // مبلغ التأمين الإجباري (>= 30%)
  description: string;
  images: string[];
  coverImage: string;
  totalRentalsCount: number;
  totalRevenue: number;
  totalMaintenanceCost: number;
  isDeleted?: boolean;
}

export interface ProductUnit {
  id: string;
  productId: string;
  serialNumber: string; // QR code / Barcode
  size: string;
  color: string;
  status: ProductUnitStatus;
  warehouseLocation: string;
  conditionNotes?: string;
  currentBookingId?: string;
  cleaningDueUntil?: string; // timestamp if in CLEANING
  isDeleted?: boolean;
}

// 3. Customer & Accurate Measurements
export interface CustomerMeasurements {
  bust: number; // محيط الصدر (سم)
  waist: number; // محيط الخصر (سم)
  hips: number; // محيط الأرداف (سم)
  hollowToHem: number; // الطول من الكتف للأرض (سم)
  shoulderWidth: number; // الكتف إلى الكتف (سم)
  heelHeight: number; // ارتفاع الكعب (سم)
  sizeLabel: string; // S / M / L / XL / 40 / 42
  tailorNotes?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  nationalId: string;
  idDocumentType: 'NATIONAL_ID' | 'PASSPORT' | 'RESIDENCE';
  idPhotoFront?: string;
  idPhotoBack?: string;
  eventDate: string;
  eventType: 'WEDDING' | 'ENGAGEMENT' | 'HENNA' | 'EVENING' | 'OTHER';
  classification: 'NORMAL' | 'VIP' | 'BLOCKED';
  guarantorName?: string;
  guarantorPhone?: string;
  measurements?: CustomerMeasurements;
  createdAt: string;
  isDeleted?: boolean;
}

// 4. Booking & Anti-Double Booking Engine
export type BookingStatus =
  | 'PENDING' // بانتظار دفع العربون
  | 'DEPOSIT_PAID' // دُفع العربون
  | 'CONFIRMED' // مؤكد - القطعة مقفولة
  | 'PREPARING' // قيد التجهيز والخياطة
  | 'READY' // جاهز للتسليم
  | 'DELIVERED' // مُسلَّم للعميل
  | 'RETURNED' // مُعاد من العميل
  | 'COMPLETED' // مكتمل وتمت التسوية
  | 'LATE' // متأخر عن موعد الإرجاع
  | 'CANCELLED'; // ملغي

export interface BookingItem {
  id: string;
  bookingId: string;
  productId: string;
  productUnitId: string;
  unitSerialNumber: string;
  productName: string;
  rentalPrice: number;
  collateralAmount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  bufferStartDate: string; // startDate - 48h
  bufferEndDate: string; // endDate + 48h
}

export interface Booking {
  id: string;
  bookingNumber: string; // BOOK-2026-XXXX
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: BookingItem[];
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalRentAmount: number;
  discountAmount: number;
  taxAmount: number;
  depositRequired: number; // >= 25% of totalRentAmount
  depositPaid: number;
  depositPaymentDate?: string;
  collateralRequired: number; // >= 30% of totalRentAmount
  collateralPaid: number;
  notes?: string;
  versionNumber: number; // Optimistic locking
  createdAt: string;
  createdBy: string;
  isDeleted?: boolean;
}

// 5. Rental Contract (12-Stage Lifecycle)
export type ContractStage =
  | 1 // تسجيل العميل + المناسبة
  | 2 // اختيار الأصناف + التواريخ + فحص التعارض
  | 3 // دفع العربون (>= 25%)
  | 4 // توقيع العقد رقمياً
  | 5 // تحصيل التأمين (التزام)
  | 6 // التجهيز (خياطة + غسيل)
  | 7 // التسليم بمسح QR + صور
  | 8 // فترة الاستخدام
  | 9 // الإرجاع بمسح QR + فحص
  | 10 // تقييم التلف والتأخير
  | 11 // التسوية وخصم الغرامات
  | 12; // إغلاق العقد والغسيل الإجباري

export interface RentalContract {
  id: string;
  contractNumber: string; // CONT-2026-XXXX
  bookingId: string;
  customerId: string;
  currentStage: ContractStage;
  startDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  daysLate: number;
  latePenaltyFee: number; // daysLate * 15% daily rental
  damagePenaltyFee: number;
  lostFee: number;
  totalDeductions: number;
  refundedCollateral: number;
  additionalDueAmount: number;
  digitalSignature?: string;
  signedAt?: string;
  deliveryInspectionDone: boolean;
  returnInspectionDone: boolean;
  status: 'ACTIVE' | 'SETTLED' | 'CLOSED' | 'CANCELLED';
  createdAt: string;
}

// 6. Collateral Vault (Tameena)
export type CollateralType = 'CASH' | 'GOLD' | 'WEAPON' | 'ID_DOCUMENT' | 'OTHER_ASSET';

export interface Collateral {
  id: string;
  receiptNumber: string; // COL-2026-XXXX
  contractId: string;
  customerId: string;
  customerName: string;
  type: CollateralType;
  amount?: number; // For Cash
  currency?: string;
  // For Gold
  goldType?: string; // إسوارة، طقم، عقد
  goldWeightGrams?: number;
  goldKarat?: number; // 18, 21, 24
  goldEstimatedValue?: number;
  // For Weapon
  weaponType?: string;
  weaponSerialNumber?: string;
  weaponLicenseNumber?: string;
  // For ID or General
  description: string;
  photos: string[]; // Encrypted URLs
  status: 'HELD' | 'REFUNDED' | 'CONFISCATED' | 'PARTIALLY_SETTLED';
  settledAmount?: number;
  receivedBy: string;
  receivedAt: string;
  returnedAt?: string;
  isDeleted?: boolean;
}

// 7. Inspections & Side-by-Side Damage Markup
export type DamageType =
  | 'SPOT' // بقعة
  | 'TEAR' // تمزق
  | 'MISSING_BEADS' // نقص في الزينة والخرز
  | 'BROKEN' // كسر
  | 'LOST_PIECE' // فقدان جزء
  | 'EMBROIDERY_DAMAGE' // تلف في التطريز
  | 'BURN' // حرق
  | 'OTHER'; // أخرى

export interface DamageMarker {
  id: string;
  xPercent: number; // 0 - 100 on image
  yPercent: number; // 0 - 100 on image
  type: DamageType;
  description: string;
  estimatedCost: number;
}

export interface Inspection {
  id: string;
  contractId: string;
  unitSerialNumber: string;
  type: 'PRE_DELIVERY' | 'POST_RETURN';
  timestamp: string;
  inspectedBy: string;
  photos: string[];
  damageMarkers: DamageMarker[];
  generalCondition: 'EXCELLENT' | 'GOOD' | 'NEEDS_CLEANING' | 'DAMAGED' | 'SEVERELY_DAMAGED';
  notes?: string;
}

// 8. Tasks Automation & Kanban
export type TaskType =
  | 'PREPARATION' // تجهيز وخياطة
  | 'CLEANING' // غسيل وكي
  | 'REPAIR' // إصلاح وصيانة
  | 'DELIVERY' // تسليم للعميل
  | 'INSPECTION' // فحص بعد الإرجاع
  | 'DAMAGE_ASSESSMENT' // تقدير تكلفة تلف
  | 'COLLECTION' // تحصيل قسط / مديونية
  | 'KOSHA_SETUP' // تركيب كوشة
  | 'KOSHA_TEARDOWN' // فك كوشة
  | 'PURCHASE' // طلب شراء مستهلكات
  | 'ADMIN'; // إدارية ومتابعة

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface TaskAttachment {
  id: string;
  url: string;
  fileType: 'IMAGE' | 'PDF';
  isCompletionEvidence: boolean; // دليل إنجاز إلزامي
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  taskNumber: string; // TASK-2026-XXXX
  title: string;
  description?: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
  assignedToName: string;
  createdById: string;
  createdByName: string;
  startDate?: string;
  dueDate: string;
  completedAt?: string;
  progressPercent: number;
  estimatedCost?: number;
  actualCost?: number;
  entityType?: 'BOOKING' | 'CONTRACT' | 'PRODUCT_UNIT' | 'CUSTOMER' | 'KOSHA' | 'MAINTENANCE';
  entityId?: string;
  entityTitle?: string;
  isAutoGenerated: boolean;
  triggerEvent?: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  isDeleted?: boolean;
}

// 9. Double-Entry Accounting
export interface Account {
  code: string; // e.g. 1101, 2101, 4101
  nameAr: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
}

export interface JournalLine {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // JE-2026-XXXX
  date: string;
  description: string;
  referenceType: 'SALE' | 'RENTAL' | 'DEPOSIT' | 'COLLATERAL' | 'SETTLEMENT' | 'MAINTENANCE' | 'MANUAL';
  referenceId?: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  isReversed?: boolean;
  reversalEntryId?: string;
  createdBy: string;
  createdAt: string;
}

// 10. Cashbox & POS
export interface PaymentVoucher {
  id: string;
  voucherNumber: string; // VOU-2026-XXXX
  type: 'RECEIPT' | 'PAYMENT'; // قبض أو صرف
  amount: number;
  currency: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'WALLET' | 'MIXED';
  cashAmount?: number;
  cardAmount?: number;
  customerId?: string;
  customerName?: string;
  category: 'RENTAL_DEPOSIT' | 'RENTAL_FINAL' | 'COLLATERAL' | 'SALE' | 'MAINTENANCE_COST' | 'EXPENSE';
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

// 11. Kosha Project
export interface KoshaProject {
  id: string;
  projectNumber: string;
  title: string;
  customerName: string;
  hallName: string;
  hallLocation: string;
  setupDateTime: string;
  teardownDateTime: string;
  assignedTeam: string[];
  status: 'SCHEDULED' | 'ON_WAY' | 'INSTALLING' | 'COMPLETED' | 'TEARDOWN_IN_PROGRESS' | 'FINISHED';
  componentsList: { name: string; checked: boolean }[];
  photos: { stage: string; url: string; timestamp: string }[];
}

// 12. Unit 6: Manufacturing Module (التصنيع وأوامر الشغل)
export type ManufacturingOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface BillOfMaterialItem {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  requiredQuantity: number;
  unit: string; // متر، كيلو، قطعة، حبة، بكرة
  costPerUnit: number;
  availableStock: number;
  status: 'AVAILABLE' | 'NEEDS_PURCHASE';
  isReserved: boolean;
}

export interface ProductionStageRecord {
  stageNumber: number;
  stageNameAr: string; // قص الأقمشة / الخياطة الأولية / التطريز والزينة / الكي والتشطيب / فحص الجودة / التغليف
  supervisor: string;
  dueDate: string;
  completionPercent: number; // 0 - 100
  laborCost: number;
  notes?: string;
  completedAt?: string;
}

export interface ManufacturingOrder {
  id: string;
  orderNumber: string; // MO-2026-XXXXX
  type: 'DRESS' | 'KOSHA' | 'DECOR' | 'ACCESSORY' | 'OTHER';
  outputProductId: string;
  outputProductName: string;
  outputProductSku: string;
  quantity: number;
  customerSpecs: string; // مقاسات، ألوان، تفاصيل
  startDate: string;
  targetEndDate: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  status: ManufacturingOrderStatus;
  assignedToName: string;
  branchName: string;
  bom: BillOfMaterialItem[];
  stages: ProductionStageRecord[];
  rawMaterialsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  createdAt: string;
  completedAt?: string;
}

export type JobOrderType = 'SIZE_ALTERATION' | 'DAMAGE_REPAIR' | 'REFURBISHMENT' | 'SPECIAL_CLEANING';

export interface JobOrder {
  id: string;
  orderNumber: string; // JO-2026-XXXXX
  type: JobOrderType;
  productUnitId: string;
  productUnitSerial: string;
  productName: string;
  specs: string;
  materialsConsumed: string;
  laborHours: number;
  totalCost: number;
  contractId?: string;
  assignedTailor: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
}

// 13. Unit 7: Suppliers & Purchasing (الموردون والمشتريات)
export type SupplierCategory = 'FABRICS' | 'ACCESSORIES' | 'EQUIPMENT' | 'SERVICES' | 'OTHER';

export interface Supplier {
  id: string;
  code: string; // SUP-2026-XXXX
  name: string;
  category: SupplierCategory;
  contactPerson: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address: string;
  taxNumber: string;
  crNumber: string;
  paymentTerms: 'CASH' | 'NET_30' | 'NET_60' | 'INSTALLMENTS';
  creditLimit: number;
  currentBalance: number; // مستحقات المورد
  rating: number; // 1 - 5
  status: 'ACTIVE' | 'SUSPENDED';
  notes?: string;
}

export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'SENT' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  rawMaterialId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxPercent: number; // 15%
  subtotal: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // PO-2026-XXXXX
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  branchId: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  paymentTerms: string;
  needsApproval: boolean; // if totalAmount > threshold (e.g. 5,000 SAR)
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

// 14. Flexible RBAC & Permission Matrix (الصلاحيات المرنة)
export type SystemModule =
  | 'BOOKINGS'
  | 'SALES'
  | 'PURCHASING'
  | 'MANUFACTURING'
  | 'INVENTORY'
  | 'CHART_OF_ACCOUNTS'
  | 'FINANCIAL_REPORTS'
  | 'USER_MANAGEMENT'
  | 'COLLATERAL_VAULT'
  | 'TASKS'
  | 'KOSHA'
  | 'SETTINGS';

export type PermissionAction = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'APPROVE' | 'EXPORT';

export type RolePermissionMatrix = Record<UserRole, Record<SystemModule, Record<PermissionAction, boolean>>>;

// 15. System Settings (الإعدادات الشاملة)
export interface SystemSettings {
  companyNameAr: string;
  companyNameEn: string;
  taxNumber: string;
  crNumber: string;
  phone: string;
  email: string;
  address: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  isFiscalPeriodLocked: boolean;
  currency: string;
  vatRatePercent: number;
  poApprovalThreshold: number; // e.g. 5000 SAR
  minRentalDepositPercent: number; // 25%
  minRentalCollateralPercent: number; // 30%
  bookingBufferHours: number; // 48
  laundryBufferHours: number; // 24
  dailyLatePenaltyPercent: number; // 15%
  paperSize: 'A4' | 'THERMAL_80MM';
  autoSyncIntervalMinutes: number;
}

// 16. Offline & Sync Engine
export type SyncStatus = 'ONLINE' | 'SYNCING' | 'OFFLINE';

export interface SyncOutboxItem {
  id: string;
  idempotencyKey: string;
  entityType: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  createdAt: string;
  attempts: number;
}
