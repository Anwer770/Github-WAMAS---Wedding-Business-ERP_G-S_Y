/**
 * WAMAS ERP - Realistic Arabic Mock Data
 * High-end Wedding Boutique & Rental Operations
 */

import {
  User, Product, ProductUnit, Customer, Booking, RentalContract,
  Collateral, Inspection, Task, Account, JournalEntry, KoshaProject,
  ManufacturingOrder, JobOrder, Supplier, PurchaseOrder,
  RolePermissionMatrix, SystemSettings, SyncOutboxItem, UserRole, SystemModule, PermissionAction
} from '../types';
import { INITIAL_CHART_OF_ACCOUNTS } from './doubleEntryAccountingService';

export const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'أ. عبد الله باحارث', username: 'owner', role: 'OWNER', phone: '0501234567', email: 'owner@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 10:30', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'usr-2', name: 'سارة القحطاني', username: 'gm_sarah', role: 'GENERAL_MANAGER', phone: '0559876543', email: 'gm@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 09:15', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'usr-3', name: 'أحمد المنصوري', username: 'acc_ahmed', role: 'ACCOUNTANT', phone: '0561122334', email: 'finance@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 08:45', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'usr-4', name: 'نورة العتيبي', username: 'sales_noura', role: 'SALES', phone: '0543322114', email: 'sales@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 11:00', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: 'usr-5', name: 'فهد الشمري', username: 'rent_fahad', role: 'RENTAL_AGENT', phone: '0537788990', email: 'rentals@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-24 16:20', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: 'usr-6', name: 'مريم الحربي', username: 'cashier_maryam', role: 'CASHIER', phone: '0594455667', email: 'cashier@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 10:00', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { id: 'usr-7', name: 'طارق العسيري', username: 'store_tariq', role: 'WAREHOUSE', phone: '0581239876', email: 'warehouse@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 07:30', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
  { id: 'usr-8', name: 'المعلم رضوان خان', username: 'tailor_radwan', role: 'TAILOR', phone: '0578899112', email: 'tailor@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-24 18:00', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { id: 'usr-9', name: 'سلطان الدوسري', username: 'driver_sultan', role: 'DELIVERY', phone: '0523344556', email: 'delivery@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 09:40', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { id: 'usr-10', name: 'خالد الرويلي', username: 'proc_khaled', role: 'PURCHASING_MANAGER', phone: '0519988776', email: 'purchasing@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-25 08:00', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'usr-11', name: 'منى السليمان', username: 'audit_mona', role: 'VIEWER', phone: '0533322119', email: 'viewer@wamas-app.com', branchId: 'br-1', status: 'ACTIVE', lastLogin: '2026-10-23 14:10', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'WD-ROYAL-01',
    nameAr: 'فستان زفاف ملكي "لؤلؤة الخليج"',
    nameEn: 'Royal Pearl Gulf Wedding Gown',
    category: 'DRESSES_WEDDING',
    type: 'RENT',
    rentalPriceDaily: 4500,
    rentalPriceWeekly: 8500,
    purchaseCost: 14000,
    requiredCollateral: 2500,
    description: 'فستان زفاف كوتور استثنائي بطرحة ملكية 3 أمتار، مطرز يدوياً بحبات اللؤلؤ الطبيعي والدانتيل الفرنسي الفاخر مع كورسيه نحت وقصة كلاسيكية فخمة.',
    coverImage: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800',
    images: [
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800',
      'https://images.unsplash.com/photo-1546804784-896d0dca3805?w=800',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800'
    ],
    totalRentalsCount: 14,
    totalRevenue: 63000,
    totalMaintenanceCost: 4200
  },
  {
    id: 'prod-2',
    sku: 'WD-SWAROVSKI-02',
    nameAr: 'فستان زفاف برنسيس "رويال ألف ليلة"',
    nameEn: 'Princess Thousand Nights Gown',
    category: 'DRESSES_WEDDING',
    type: 'BOTH',
    rentalPriceDaily: 5200,
    rentalPriceWeekly: 9800,
    salePrice: 28000,
    purchaseCost: 16500,
    requiredCollateral: 3000,
    description: 'تصميم أميري منفوش بتطريز كريستال سواروفسكي عاكس للضوء مع أكمام أوف شولدر وذيل مطرز ممتد يضفي هيبة ملكية في الممشى.',
    coverImage: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800',
    images: [
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
    ],
    totalRentalsCount: 9,
    totalRevenue: 46800,
    totalMaintenanceCost: 3100
  },
  {
    id: 'prod-3',
    sku: 'ED-EMERALD-03',
    nameAr: 'فستان سهرة مخملي زمردي فخم',
    nameEn: 'Emerald Velvet Luxury Evening Gown',
    category: 'DRESSES_EVENING',
    type: 'RENT',
    rentalPriceDaily: 1800,
    rentalPriceWeekly: 3400,
    purchaseCost: 6500,
    requiredCollateral: 900,
    description: 'قماش مخملي إيطالي بلون الزمرد الملكي بقصة انسيابية وشك خرز ذهبي على الأكتاف ومحيط الخصر.',
    coverImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
    images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'],
    totalRentalsCount: 18,
    totalRevenue: 32400,
    totalMaintenanceCost: 1800
  },
  {
    id: 'prod-4',
    sku: 'ED-ROSE-04',
    nameAr: 'فستان خطوبة روز جولد شانتييه',
    nameEn: 'Rose Gold Chantilly Engagement Dress',
    category: 'DRESSES_ENGAGEMENT',
    type: 'RENT',
    rentalPriceDaily: 2200,
    rentalPriceWeekly: 4000,
    purchaseCost: 7500,
    requiredCollateral: 1200,
    description: 'فستان خطوبة أنيق بدرجات الروز جولد مع تول متموج وتطريز أزهار ثلاثية الأبعاد تنبض بالنعومة.',
    coverImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'],
    totalRentalsCount: 11,
    totalRevenue: 24200,
    totalMaintenanceCost: 1400
  },
  {
    id: 'prod-5',
    sku: 'KOSHA-ORCHID-05',
    nameAr: 'كوشة زفاف أسطورية "زهرة الأوركيد الذهبية"',
    nameEn: 'Golden Orchid Royal Kosha Set',
    category: 'KOSHA_DECOR',
    type: 'RENT',
    rentalPriceDaily: 12500,
    purchaseCost: 45000,
    requiredCollateral: 4000,
    description: 'مشروع كوشة متكامل يشمل المنصة الملكية، أقواس الزهور الطبيعية، كراسي العرسان المذهبة، إضاءة سينمائية مبرمجة وممر العروس الزجاجي المضيء.',
    coverImage: 'https://images.unsplash.com/photo-1519225429950-006f1d828d5d?w=800',
    images: ['https://images.unsplash.com/photo-1519225429950-006f1d828d5d?w=800'],
    totalRentalsCount: 7,
    totalRevenue: 87500,
    totalMaintenanceCost: 6500
  }
];

export const INITIAL_UNITS: ProductUnit[] = [
  // Units for Royal Pearl
  { id: 'unit-1', productId: 'prod-1', serialNumber: 'WD-01-A (38/M)', size: 'M (38)', color: 'أوف وايت عاجي', status: 'DELIVERED', warehouseLocation: 'جناح الكوتور - خزانة A1', currentBookingId: 'bk-101' },
  { id: 'unit-2', productId: 'prod-1', serialNumber: 'WD-01-B (40/L)', size: 'L (40)', color: 'أوف وايت عاجي', status: 'AVAILABLE', warehouseLocation: 'جناح الكوتور - خزانة A2' },
  { id: 'unit-3', productId: 'prod-1', serialNumber: 'WD-01-C (36/S)', size: 'S (36)', color: 'أبيض ناصع', status: 'CLEANING', warehouseLocation: 'مغسلة التعقيم الجاف', cleaningDueUntil: '2026-10-23T18:00:00Z' },

  // Units for Swarovski
  { id: 'unit-4', productId: 'prod-2', serialNumber: 'WD-02-A (38/M)', size: 'M (38)', color: 'أبيض ثلجي', status: 'PENDING_INSPECTION', warehouseLocation: 'منطقة الفحص والاستلام', currentBookingId: 'bk-102' },
  { id: 'unit-5', productId: 'prod-2', serialNumber: 'WD-02-B (42/XL)', size: 'XL (42)', color: 'أوف وايت', status: 'BOOKED', warehouseLocation: 'جناح الكوتور - خزانة B1', currentBookingId: 'bk-103' },
  { id: 'unit-6', productId: 'prod-2', serialNumber: 'WD-02-C (38/M)', size: 'M (38)', color: 'أبيض ثلجي', status: 'DAMAGED', warehouseLocation: 'مشغل الصيانة والترميم', conditionNotes: 'تمزق طفيف في طبقة التول السفلية وبقعة قهوة تحتاج معالجة خاصة' },

  // Units for Emerald
  { id: 'unit-7', productId: 'prod-3', serialNumber: 'ED-03-A (M)', size: 'M (38)', color: 'أخضر زمردي', status: 'AVAILABLE', warehouseLocation: 'قسم السهرات - رف E3' },
  { id: 'unit-8', productId: 'prod-3', serialNumber: 'ED-03-B (L)', size: 'L (40)', color: 'أخضر زمردي', status: 'AVAILABLE', warehouseLocation: 'قسم السهرات - رف E4' },

  // Units for Rose Gold
  { id: 'unit-9', productId: 'prod-4', serialNumber: 'ED-04-A (38/M)', size: 'M (38)', color: 'روز جولد', status: 'READY_FOR_DELIVERY', warehouseLocation: 'منطقة التسليم المباشر' },

  // Kosha unit
  { id: 'unit-10', productId: 'prod-5', serialNumber: 'KSH-ORC-01', size: 'منصة 8x4 متر', color: 'ذهبي مع عاجي', status: 'AVAILABLE', warehouseLocation: 'مستودع الديكور المركزي - سكشن D' }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'الأميرة ريم بنت سلطان آل سعود',
    phone: '0505551234',
    whatsapp: '0505551234',
    nationalId: '1098765432',
    idDocumentType: 'NATIONAL_ID',
    eventDate: '2026-11-05',
    eventType: 'WEDDING',
    classification: 'VIP',
    guarantorName: 'سلطان بن عبد العزيز آل سعود',
    guarantorPhone: '0501112233',
    measurements: {
      bust: 92,
      waist: 68,
      hips: 98,
      hollowToHem: 145,
      shoulderWidth: 39,
      heelHeight: 9,
      sizeLabel: '38 (M)',
      tailorNotes: 'تضييق بسيط 1 سم عند محيط الخصر، تركيب مشابك خفية لرفع الذيل أثناء الرقصة الأولى.'
    },
    createdAt: '2026-10-10'
  },
  {
    id: 'cust-2',
    fullName: 'دانة خالد الغامدي',
    phone: '0554443322',
    whatsapp: '0554443322',
    nationalId: '1087654321',
    idDocumentType: 'NATIONAL_ID',
    eventDate: '2026-10-28',
    eventType: 'ENGAGEMENT',
    classification: 'NORMAL',
    measurements: {
      bust: 88,
      waist: 70,
      hips: 94,
      hollowToHem: 140,
      shoulderWidth: 38,
      heelHeight: 7,
      sizeLabel: '38 (M)',
      tailorNotes: 'المقاس مطابق تماماً ولا يحتاج تعديل.'
    },
    createdAt: '2026-10-15'
  },
  {
    id: 'cust-3',
    fullName: 'منيرة عبد الرحمن الدوسري',
    phone: '0541122998',
    whatsapp: '0541122998',
    nationalId: '1076543210',
    idDocumentType: 'NATIONAL_ID',
    eventDate: '2026-11-12',
    eventType: 'WEDDING',
    classification: 'VIP',
    measurements: {
      bust: 95,
      waist: 74,
      hips: 102,
      hollowToHem: 148,
      shoulderWidth: 40,
      heelHeight: 10,
      sizeLabel: '40 (L)',
      tailorNotes: 'تقصير الذيل 5 سم من الأمام لسهولة الحركة مع كعب 10 سم.'
    },
    createdAt: '2026-10-18'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    bookingNumber: 'BOOK-2026-0042',
    customerId: 'cust-1',
    customerName: 'الأميرة ريم بنت سلطان آل سعود',
    customerPhone: '0505551234',
    items: [
      {
        id: 'bi-1',
        bookingId: 'bk-101',
        productId: 'prod-1',
        productUnitId: 'unit-1',
        unitSerialNumber: 'WD-01-A (38/M)',
        productName: 'فستان زفاف ملكي "لؤلؤة الخليج"',
        rentalPrice: 4500,
        collateralAmount: 2500,
        startDate: '2026-11-04',
        endDate: '2026-11-07',
        bufferStartDate: '2026-11-02',
        bufferEndDate: '2026-11-09'
      }
    ],
    startDate: '2026-11-04',
    endDate: '2026-11-07',
    status: 'DELIVERED',
    totalRentAmount: 4500,
    discountAmount: 0,
    taxAmount: 675,
    depositRequired: 1125, // 25%
    depositPaid: 1500,
    depositPaymentDate: '2026-10-12',
    collateralRequired: 2500, // >= 30%
    collateralPaid: 2500,
    versionNumber: 1,
    createdAt: '2026-10-12',
    createdBy: 'usr-4'
  },
  {
    id: 'bk-102',
    bookingNumber: 'BOOK-2026-0038',
    customerId: 'cust-2',
    customerName: 'دانة خالد الغامدي',
    customerPhone: '0554443322',
    items: [
      {
        id: 'bi-2',
        bookingId: 'bk-102',
        productId: 'prod-2',
        productUnitId: 'unit-4',
        unitSerialNumber: 'WD-02-A (38/M)',
        productName: 'فستان زفاف برنسيس "رويال ألف ليلة"',
        rentalPrice: 5200,
        collateralAmount: 3000,
        startDate: '2026-10-18',
        endDate: '2026-10-21',
        bufferStartDate: '2026-10-16',
        bufferEndDate: '2026-10-23'
      }
    ],
    startDate: '2026-10-18',
    endDate: '2026-10-21',
    status: 'RETURNED',
    totalRentAmount: 5200,
    discountAmount: 200,
    taxAmount: 750,
    depositRequired: 1300,
    depositPaid: 2000,
    depositPaymentDate: '2026-10-15',
    collateralRequired: 3000,
    collateralPaid: 3000,
    versionNumber: 1,
    createdAt: '2026-10-15',
    createdBy: 'usr-4'
  },
  {
    id: 'bk-103',
    bookingNumber: 'BOOK-2026-0035',
    customerId: 'cust-3',
    customerName: 'منيرة عبد الرحمن الدوسري',
    customerPhone: '0541122998',
    items: [
      {
        id: 'bi-3',
        bookingId: 'bk-103',
        productId: 'prod-3',
        productUnitId: 'unit-7',
        unitSerialNumber: 'ED-03-A (M)',
        productName: 'فستان سهرة مخملي زمردي فخم',
        rentalPrice: 3600,
        collateralAmount: 1500,
        startDate: '2026-10-17',
        endDate: '2026-10-19',
        bufferStartDate: '2026-10-15',
        bufferEndDate: '2026-10-21'
      }
    ],
    startDate: '2026-10-17',
    endDate: '2026-10-19',
    status: 'DELIVERED',
    totalRentAmount: 3600,
    discountAmount: 0,
    taxAmount: 540,
    depositRequired: 900,
    depositPaid: 1200,
    depositPaymentDate: '2026-10-14',
    collateralRequired: 1500,
    collateralPaid: 1500,
    versionNumber: 1,
    createdAt: '2026-10-14',
    createdBy: 'usr-4'
  }
];

export const INITIAL_CONTRACTS: RentalContract[] = [
  {
    id: 'cnt-1',
    contractNumber: 'CONT-2026-0042',
    bookingId: 'bk-101',
    customerId: 'cust-1',
    currentStage: 7, // مُسلَّم للعميل DELIVERED
    startDate: '2026-11-04',
    expectedReturnDate: '2026-11-07',
    daysLate: 0,
    latePenaltyFee: 0,
    damagePenaltyFee: 0,
    lostFee: 0,
    totalDeductions: 0,
    refundedCollateral: 0,
    additionalDueAmount: 0,
    digitalSignature: 'ريم آل سعود - توقيع إلكتروني موثق',
    signedAt: '2026-10-13T14:30:00Z',
    deliveryInspectionDone: true,
    returnInspectionDone: false,
    status: 'ACTIVE',
    createdAt: '2026-10-12'
  },
  {
    id: 'cnt-2',
    contractNumber: 'CONT-2026-0038',
    bookingId: 'bk-102',
    customerId: 'cust-2',
    currentStage: 9, // مُعاد من العميل - بانتظار الفحص والتسوية
    startDate: '2026-10-18',
    expectedReturnDate: '2026-10-20',
    actualReturnDate: '2026-10-21',
    daysLate: 1, // متأخر 24 ساعة (يوم كامل)
    latePenaltyFee: 780, // 1 day * 15% of 5200 = 780 SAR
    damagePenaltyFee: 450,
    lostFee: 0,
    totalDeductions: 1230,
    refundedCollateral: 1770,
    additionalDueAmount: 0,
    digitalSignature: 'دانة خالد الغامدي - موثق',
    signedAt: '2026-10-15T11:00:00Z',
    deliveryInspectionDone: true,
    returnInspectionDone: true,
    status: 'ACTIVE',
    createdAt: '2026-10-15'
  },
  {
    id: 'cnt-3',
    contractNumber: 'CONT-2026-0035',
    bookingId: 'bk-103',
    customerId: 'cust-3',
    currentStage: 8, // فترة الاستخدام - لم يتم الإرجاع وتجاوز 48 ساعة
    startDate: '2026-10-17',
    expectedReturnDate: '2026-10-19', // تجاوزت موعد الإرجاع بأكثر من 48 ساعة
    daysLate: 2, // متأخر يومين (> 48 ساعة)
    latePenaltyFee: 0, // بانتظار التوليد والتطبيق الفوري
    damagePenaltyFee: 0,
    lostFee: 0,
    totalDeductions: 0,
    refundedCollateral: 0,
    additionalDueAmount: 0,
    digitalSignature: 'منيرة الدوسري - توقيع موثق',
    signedAt: '2026-10-14T15:00:00Z',
    deliveryInspectionDone: true,
    returnInspectionDone: false,
    status: 'ACTIVE',
    createdAt: '2026-10-14'
  }
];

export const INITIAL_COLLATERALS: Collateral[] = [
  {
    id: 'col-3',
    receiptNumber: 'COL-2026-0078',
    contractId: 'cnt-3',
    customerId: 'cust-3',
    customerName: 'منيرة عبد الرحمن الدوسري',
    type: 'CASH',
    amount: 1500,
    currency: 'SAR',
    description: 'تأمين نقدي مودع في الصندوق لعقد تأجير فستان السهرة الزمردي.',
    photos: ['https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500'],
    status: 'HELD',
    receivedBy: 'usr-6',
    receivedAt: '2026-10-14T15:30:00Z'
  },

  {
    id: 'col-1',
    receiptNumber: 'COL-2026-0089',
    contractId: 'cnt-1',
    customerId: 'cust-1',
    customerName: 'الأميرة ريم بنت سلطان آل سعود',
    type: 'CASH',
    amount: 2500,
    currency: 'SAR',
    description: 'تأمين نقدي مودع في الصندوق الرئيسي كأمانة قابلة للرد عند فحص الفستان سليماً.',
    photos: ['https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500'],
    status: 'HELD',
    receivedBy: 'usr-6',
    receivedAt: '2026-10-13T14:00:00Z'
  },
  {
    id: 'col-2',
    receiptNumber: 'COL-2026-0084',
    contractId: 'cnt-2',
    customerId: 'cust-2',
    customerName: 'دانة خالد الغامدي',
    type: 'GOLD',
    goldType: 'إسوارة ذهب بحريني عيار 21',
    goldWeightGrams: 22.4,
    goldKarat: 21,
    goldEstimatedValue: 6200,
    description: 'إسوارة ذهب عيار 21 وزن 22.4 جرام - موديل بحريني مجدول مع دمغة العيار الرسمية.',
    photos: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'],
    status: 'HELD',
    receivedBy: 'usr-2',
    receivedAt: '2026-10-15T11:30:00Z'
  }
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-1',
    contractId: 'cnt-1',
    unitSerialNumber: 'WD-01-A (38/M)',
    type: 'PRE_DELIVERY',
    timestamp: '2026-10-14T10:00:00Z',
    inspectedBy: 'usr-5',
    photos: [
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800'
    ],
    damageMarkers: [],
    generalCondition: 'EXCELLENT',
    notes: 'تم فحص الفستان قبل خروجه من المعرض، سليم 100% بدون أي شوائب أو بقع، ومكوي وجاهز.'
  },
  {
    id: 'insp-2',
    contractId: 'cnt-2',
    unitSerialNumber: 'WD-02-A (38/M)',
    type: 'PRE_DELIVERY',
    timestamp: '2026-10-18T09:00:00Z',
    inspectedBy: 'usr-5',
    photos: [
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800'
    ],
    damageMarkers: [],
    generalCondition: 'EXCELLENT',
    notes: 'تم التسليم بحالة كوتور ممتازة.'
  },
  {
    id: 'insp-3',
    contractId: 'cnt-2',
    unitSerialNumber: 'WD-02-A (38/M)',
    type: 'POST_RETURN',
    timestamp: '2026-10-21T16:00:00Z',
    inspectedBy: 'usr-7',
    photos: [
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800'
    ],
    damageMarkers: [
      {
        id: 'dm-1',
        xPercent: 42,
        yPercent: 78,
        type: 'SPOT',
        description: 'بقعة مشروب ملون على ذيل الفستان السفلي تحتاج تنظيفاً جافاً احترافياً فائقاً',
        estimatedCost: 250
      },
      {
        id: 'dm-2',
        xPercent: 65,
        yPercent: 60,
        type: 'TEAR',
        description: 'تفكك خياطة وتلف في تطريز الكريستال الجانبي بطول 4 سم',
        estimatedCost: 200
      }
    ],
    generalCondition: 'DAMAGED',
    notes: 'تم توثيق التلفيات المكتشفة ومقارنتها بصور ما قبل التسليم بحضور العميل، وتم احتساب تكلفة إصلاح 450 ريال وغرامة تأخير يوم 780 ريال.'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-1',
    taskNumber: 'TASK-2026-00101',
    title: 'تجهيز وخياطة وتعديل فستان الزفاف الملكي للعميلة ريم آل سعود',
    description: 'تطبيق التعديلات المعتمدة: تضييق 1 سم عند الخصر وتركيب مشابك رفع الذيل ومراجعة سلامة السحاب.',
    taskType: 'PREPARATION',
    priority: 'HIGH',
    status: 'COMPLETED',
    assignedToId: 'usr-8',
    assignedToName: 'المعلم رضوان خان',
    createdById: 'usr-4',
    createdByName: 'نورة العتيبي',
    dueDate: '2026-10-14T18:00:00Z',
    completedAt: '2026-10-14T16:30:00Z',
    progressPercent: 100,
    entityType: 'CONTRACT',
    entityId: 'cnt-1',
    entityTitle: 'عقد CONT-2026-0042',
    isAutoGenerated: true,
    triggerEvent: 'تأكيد الحجز ودفع العربون',
    attachments: [
      {
        id: 'att-1',
        url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600',
        fileType: 'IMAGE',
        isCompletionEvidence: true,
        uploadedAt: '2026-10-14T16:30:00Z'
      }
    ],
    comments: [
      {
        id: 'cm-1',
        userId: 'usr-8',
        userName: 'المعلم رضوان خان',
        userRole: 'TAILOR',
        content: 'تم الانتهاء من التعديل وجاهز للكي والتسليم.',
        createdAt: '2026-10-14T16:25:00Z'
      }
    ]
  },
  {
    id: 'tsk-2',
    taskNumber: 'TASK-2026-00102',
    title: 'فحص فستان برنسيس رويال (WD-02-A) بعد الإرجاع وحصر التلفيات',
    description: 'فحص الأطراف والتطريز ومقارنة الحالة مع صور التسليم الأصلية وتسجيل أي بقع أو تلف في التطريز.',
    taskType: 'INSPECTION',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assignedToId: 'usr-7',
    assignedToName: 'طارق العسيري',
    createdById: 'usr-5',
    createdByName: 'فهد الشمري',
    dueDate: '2026-10-21T20:00:00Z',
    progressPercent: 75,
    entityType: 'CONTRACT',
    entityId: 'cnt-2',
    entityTitle: 'عقد CONT-2026-0038',
    isAutoGenerated: true,
    triggerEvent: 'إرجاع الصنف من العميل',
    attachments: [],
    comments: []
  },
  {
    id: 'tsk-3',
    taskNumber: 'TASK-2026-00103',
    title: 'غسيل جاف وتعقيم إجباري (24 ساعة) للقطعة WD-01-C',
    description: 'إدخال القطعة لبروتوكول التنظيف الجاف الخاص بأقمشة التول والدانتيل الفرنسي مع كي بالبخار.',
    taskType: 'CLEANING',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedToId: 'usr-7',
    assignedToName: 'طارق العسيري',
    createdById: 'usr-2',
    createdByName: 'سارة القحطاني',
    dueDate: '2026-10-23T18:00:00Z',
    progressPercent: 40,
    entityType: 'PRODUCT_UNIT',
    entityId: 'unit-3',
    entityTitle: 'القطعة WD-01-C (36/S)',
    isAutoGenerated: true,
    triggerEvent: 'إغلاق عقد التأجير (BR-08)',
    attachments: [],
    comments: []
  },
  {
    id: 'tsk-4',
    taskNumber: 'TASK-2026-00104',
    title: 'تركيب كوشة "زهرة الأوركيد الذهبية" في قاعة نيارة - جناح الملوك',
    description: 'فريق التوصيل والتركيب: موعد الدخول للقاعة الساعة 10:00 صباحاً وإكمال التركيب والتشغيل قبل 04:00 عصراً.',
    taskType: 'KOSHA_SETUP',
    priority: 'URGENT',
    status: 'NEW',
    assignedToId: 'usr-9',
    assignedToName: 'سلطان الدوسري',
    createdById: 'usr-2',
    createdByName: 'سارة القحطاني',
    dueDate: '2026-10-25T16:00:00Z',
    progressPercent: 0,
    entityType: 'KOSHA',
    entityId: 'ksh-1',
    entityTitle: 'مشروع كوشة نيارة',
    isAutoGenerated: false,
    attachments: [],
    comments: []
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je-1',
    entryNumber: 'JE-2026-00120',
    date: '2026-10-12',
    description: 'استلام عربون حجز فستان لؤلؤة الخليج - عقد CONT-2026-0042',
    referenceType: 'DEPOSIT',
    referenceId: 'bk-101',
    totalDebit: 1500,
    totalCredit: 1500,
    isPosted: true,
    createdBy: 'usr-3',
    createdAt: '2026-10-12T11:00:00Z',
    lines: [
      { accountId: '1', accountCode: '1101', accountNameAr: 'الصندوق والخزينة النقدية', debit: 1500, credit: 0, memo: 'عربون حجز نقدي' },
      { accountId: '6', accountCode: '2201', accountNameAr: 'إيرادات الحجوزات المقدمة (عربون مؤجل)', debit: 0, credit: 1500, memo: 'عربون مؤجل حتى تاريخ المناسبة' }
    ]
  },
  {
    id: 'je-2',
    entryNumber: 'JE-2026-00121',
    date: '2026-10-13',
    description: 'استلام تأمين نقدي (أمانة) عقد CONT-2026-0042',
    referenceType: 'COLLATERAL',
    referenceId: 'col-1',
    totalDebit: 2500,
    totalCredit: 2500,
    isPosted: true,
    createdBy: 'usr-3',
    createdAt: '2026-10-13T14:15:00Z',
    lines: [
      { accountId: '1', accountCode: '1101', accountNameAr: 'الصندوق والخزينة النقدية', debit: 2500, credit: 0, memo: 'قبض مبلغ التأمين نقداً' },
      { accountId: '5', accountCode: '2101', accountNameAr: 'أمانات وتأمينات العملاء (Collateral Liability)', debit: 0, credit: 2500, memo: 'قيد التزام أمانة تأمين' }
    ]
  }
];

export const INITIAL_KOSHA_PROJECTS: KoshaProject[] = [
  {
    id: 'ksh-1',
    projectNumber: 'KSH-2026-001',
    title: 'كوشة زهرة الأوركيد الذهبية - حفل آل سعود',
    customerName: 'الأميرة ريم آل سعود',
    hallName: 'قاعة نيارة الكبرى - الرياض',
    hallLocation: 'طريق التخصصي، الرياض',
    setupDateTime: '2026-11-04 09:00',
    teardownDateTime: '2026-11-06 02:00',
    assignedTeam: ['سلطان الدوسري', 'عمر المطيري', 'يوسف الفهد'],
    status: 'SCHEDULED',
    componentsList: [
      { name: 'المنصة الملكية المرتفعة (8 × 4 متر)', checked: true },
      { name: 'خلفية أقواس الأوركيد والورود الطبيعية الهولندية', checked: true },
      { name: 'أرائك العرسان المذهبة (طراز فرنسي لويس الخامس عشر)', checked: true },
      { name: 'نظام الإضاءة السينمائية والتتبع الضوئي', checked: false },
      { name: 'ممشى العروس الزجاجي ثلاثي الأبعاد المضيء', checked: false }
    ],
    photos: [
      { stage: 'التصميم المعتمد', url: 'https://images.unsplash.com/photo-1519225429950-006f1d828d5d?w=800', timestamp: '2026-10-12' }
    ]
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-2026-001',
    name: 'شركة الحرير الملكي للأقمشة الفاخرة',
    category: 'FABRICS',
    contactPerson: 'الشيخ منصور القاسمي',
    phone: '0505544332',
    whatsapp: '966505544332',
    email: 'info@royal-silk.sa',
    address: 'الرياض - شارع المعيقلية التجاري، مبنى الأقمشة الفاخرة',
    taxNumber: '310234567800003',
    crNumber: '1010345678',
    paymentTerms: 'NET_30',
    creditLimit: 50000,
    currentBalance: 12400,
    rating: 5,
    status: 'ACTIVE',
    notes: 'المورد المعتمد لأقمشة الميكادو والحرير الإيطالي والدانتيل الفرنسي كوتور.'
  },
  {
    id: 'sup-2',
    code: 'SUP-2026-002',
    name: 'مصنع لوريكس للتطريز والإكسسوارات الكريستالية',
    category: 'ACCESSORIES',
    contactPerson: 'م. سامح الجوهري',
    phone: '0554433221',
    whatsapp: '966554433221',
    email: 'sales@lurex-crafts.com',
    address: 'جدة - حي الصفا الصناعي، مجمع الحرفيين',
    taxNumber: '310987654300003',
    crNumber: '4030987654',
    paymentTerms: 'NET_30',
    creditLimit: 30000,
    currentBalance: 8500,
    rating: 4,
    status: 'ACTIVE',
    notes: 'متخصص بتوريد حبات كريستال سواروفسكي الأصلية والخرز اللؤلؤي والشرائط المذهبة.'
  },
  {
    id: 'sup-3',
    code: 'SUP-2026-003',
    name: 'مؤسسة أفق الكوش للتجهيزات والديكور',
    category: 'EQUIPMENT',
    contactPerson: 'سلمان العوفي',
    phone: '0567788991',
    whatsapp: '966567788991',
    email: 'contact@ofok-kosha.com',
    address: 'الرياض - صناعية الشفاء، مستودع D-14',
    taxNumber: '311234598700003',
    crNumber: '1010654321',
    paymentTerms: 'CASH',
    creditLimit: 20000,
    currentBalance: 0,
    rating: 5,
    status: 'ACTIVE',
    notes: 'توريد هياكل الألمنيوم المقوى، الشاشات التفاعلية، ووحدات الإضاءة الذكية المتحركة.'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-00101',
    supplierId: 'sup-1',
    supplierName: 'شركة الحرير الملكي للأقمشة الفاخرة',
    orderDate: '2026-10-20',
    expectedDeliveryDate: '2026-10-28',
    branchId: 'br-1',
    items: [
      {
        id: 'poi-1',
        rawMaterialId: 'mat-1',
        name: 'قماش ميكادو حرير طبيعي ناصع البياض (إيطالي)',
        quantity: 50,
        unit: 'متر',
        unitPrice: 180,
        taxPercent: 15,
        subtotal: 9000,
        total: 10350
      },
      {
        id: 'poi-2',
        rawMaterialId: 'mat-2',
        name: 'دانتيل فرنسي كوردونيه مطرز باللؤلؤ',
        quantity: 20,
        unit: 'متر',
        unitPrice: 320,
        taxPercent: 15,
        subtotal: 6400,
        total: 7360
      }
    ],
    subtotal: 15400,
    taxAmount: 2310,
    discountAmount: 0,
    totalAmount: 17710,
    status: 'APPROVED',
    paymentTerms: 'آجل 30 يوم',
    needsApproval: true,
    approvedBy: 'سارة القحطاني (المدير العام)',
    approvedAt: '2026-10-21 11:30',
    notes: 'طلبية عاجلة لتصنيع موديلات الموسم الجديد ومجموعة أعراس الخريف.',
    createdAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-00102',
    supplierId: 'sup-2',
    supplierName: 'مصنع لوريكس للتطريز والإكسسوارات الكريستالية',
    orderDate: '2026-10-24',
    expectedDeliveryDate: '2026-10-30',
    branchId: 'br-1',
    items: [
      {
        id: 'poi-3',
        rawMaterialId: 'mat-3',
        name: 'أحجار كريستال سواروفسكي عاكسة (علبة 1440 حبة)',
        quantity: 10,
        unit: 'علبة',
        unitPrice: 240,
        taxPercent: 15,
        subtotal: 2400,
        total: 2760
      },
      {
        id: 'poi-4',
        rawMaterialId: 'mat-4',
        name: 'خيوط تطريز حرير مذهبة ومفضضة فاخرة',
        quantity: 15,
        unit: 'بكرة',
        unitPrice: 85,
        taxPercent: 15,
        subtotal: 1275,
        total: 1466.25
      }
    ],
    subtotal: 3675,
    taxAmount: 551.25,
    discountAmount: 0,
    totalAmount: 4226.25,
    status: 'DRAFT',
    paymentTerms: 'آجل 30 يوم',
    needsApproval: false, // Under 5000 threshold
    notes: 'مستلزمات مشغل الخياطة والتطريز الدقيق لأوامر التعديل.',
    createdAt: '2026-10-24T14:30:00Z'
  }
];

export const INITIAL_MANUFACTURING_ORDERS: ManufacturingOrder[] = [
  {
    id: 'mo-1',
    orderNumber: 'MO-2026-00045',
    type: 'DRESS',
    outputProductId: 'prod-1',
    outputProductName: 'فستان زفاف كوتور "أميرة الأندلس"',
    outputProductSku: 'WD-ANDALUSIA-03',
    quantity: 1,
    customerSpecs: 'مقاس العروس: صدر 88 سم، خصر 66 سم، أرداف 96 سم. دانتيل ممتد للأكمام مع كورسيه شفاف مبطن وديل ملكي 2.5 متر.',
    startDate: '2026-10-15',
    targetEndDate: '2026-11-02',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedToName: 'المعلم رضوان خان',
    branchName: 'الفرع الرئيسي - مشغل الكوتور',
    bom: [
      {
        id: 'bom-1',
        rawMaterialId: 'mat-1',
        rawMaterialName: 'قماش ميكادو حرير طبيعي ناصع البياض',
        requiredQuantity: 12,
        unit: 'متر',
        costPerUnit: 180,
        availableStock: 25,
        status: 'AVAILABLE',
        isReserved: true
      },
      {
        id: 'bom-2',
        rawMaterialId: 'mat-2',
        rawMaterialName: 'دانتيل فرنسي كوتور مطرز',
        requiredQuantity: 6,
        unit: 'متر',
        costPerUnit: 320,
        availableStock: 14,
        status: 'AVAILABLE',
        isReserved: true
      },
      {
        id: 'bom-3',
        rawMaterialId: 'mat-3',
        rawMaterialName: 'أحجار كريستال سواروفسكي',
        requiredQuantity: 2,
        unit: 'علبة',
        costPerUnit: 240,
        availableStock: 8,
        status: 'AVAILABLE',
        isReserved: true
      }
    ],
    stages: [
      { stageNumber: 1, stageNameAr: 'قص الأقمشة والبطانة', supervisor: 'المعلم رضوان خان', dueDate: '2026-10-18', completionPercent: 100, laborCost: 350, completedAt: '2026-10-18 16:00', notes: 'تم القص بدقة متناهية حسب الباترون المعتمد.' },
      { stageNumber: 2, stageNameAr: 'الخياطة الأولية وتجميع الكورسيه', supervisor: 'المعلم رضوان خان', dueDate: '2026-10-22', completionPercent: 100, laborCost: 750, completedAt: '2026-10-22 17:30', notes: 'تم بناء دعامات العظام الداخلية والشاسيه النحيف.' },
      { stageNumber: 3, stageNameAr: 'التطريز اليدوي وتثبيت الكريستال', supervisor: 'مختصة الزينة ليلى', dueDate: '2026-10-28', completionPercent: 65, laborCost: 1100, notes: 'جاري تثبيت حبات الكريستال على الأكتاف ومحيط الخصر.' },
      { stageNumber: 4, stageNameAr: 'الكي البخاري والتشطيب النهائي', supervisor: 'فني التشطيب حسام', dueDate: '2026-10-30', completionPercent: 0, laborCost: 250 },
      { stageNumber: 5, stageNameAr: 'فحص الجودة والمقاسات بالمانيكان', supervisor: 'سارة القحطاني', dueDate: '2026-10-31', completionPercent: 0, laborCost: 150 },
      { stageNumber: 6, stageNameAr: 'التغليف الواقي والتعليق بصندوق مخملي', supervisor: 'طارق العسيري', dueDate: '2026-11-01', completionPercent: 0, laborCost: 100 }
    ],
    rawMaterialsCost: 4560,
    laborCost: 2700,
    overheadCost: 650,
    totalCost: 7910,
    createdAt: '2026-10-15T09:00:00Z'
  }
];

export const INITIAL_JOB_ORDERS: JobOrder[] = [
  {
    id: 'jo-1',
    orderNumber: 'JO-2026-00018',
    type: 'SIZE_ALTERATION',
    productUnitId: 'u-1',
    productUnitSerial: 'WD-01-SN001',
    productName: 'فستان زفاف ملكي "لؤلؤة الخليج"',
    specs: 'تضييق محيط الخصر بمقدار 2 سم وتقصير الطول 1.5 سم حسب بروفة العروس ريم آل سعود.',
    materialsConsumed: 'خيوط حريرية متينة + شريط سحاب داخلي',
    laborHours: 4,
    totalCost: 280,
    contractId: 'cnt-1',
    assignedTailor: 'المعلم رضوان خان',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-24T12:00:00Z'
  },
  {
    id: 'jo-2',
    orderNumber: 'JO-2026-00019',
    type: 'DAMAGE_REPAIR',
    productUnitId: 'u-2',
    productUnitSerial: 'WD-02-SN002',
    productName: 'فستان زفاف برنسيس "رويال ألف ليلة"',
    specs: 'إعادة تثبيت 14 حبة كريستال سواروفسكي مفقودة في محيط الذيل السفلي وإصلاح ثنية التول.',
    materialsConsumed: '14 حبة كريستال سواروفسكي + صمغ نسيج ألماني',
    laborHours: 2.5,
    totalCost: 175,
    contractId: 'cnt-2',
    assignedTailor: 'المعلم رضوان خان',
    status: 'DONE',
    createdAt: '2026-10-23T15:30:00Z'
  }
];

// 14 Default Roles Permission Matrix
const ALL_MODULES: SystemModule[] = [
  'BOOKINGS', 'SALES', 'PURCHASING', 'MANUFACTURING', 'INVENTORY',
  'CHART_OF_ACCOUNTS', 'FINANCIAL_REPORTS', 'USER_MANAGEMENT',
  'COLLATERAL_VAULT', 'TASKS', 'KOSHA', 'SETTINGS'
];

const ALL_ACTIONS: PermissionAction[] = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'];

function createFullAccess(): Record<SystemModule, Record<PermissionAction, boolean>> {
  const result: any = {};
  ALL_MODULES.forEach(mod => {
    result[mod] = {};
    ALL_ACTIONS.forEach(act => {
      result[mod][act] = true;
    });
  });
  return result;
}

function createLimitedAccess(allowView: SystemModule[], allowCreateEdit: SystemModule[] = []): Record<SystemModule, Record<PermissionAction, boolean>> {
  const result: any = {};
  ALL_MODULES.forEach(mod => {
    result[mod] = {};
    const canView = allowView.includes(mod);
    const canMutate = allowCreateEdit.includes(mod);
    ALL_ACTIONS.forEach(act => {
      if (act === 'VIEW') result[mod][act] = canView;
      else if (act === 'CREATE' || act === 'EDIT') result[mod][act] = canMutate;
      else result[mod][act] = false;
    });
  });
  return result;
}

export const INITIAL_PERMISSIONS_MATRIX: RolePermissionMatrix = {
  OWNER: createFullAccess(),
  GENERAL_MANAGER: {
    ...createFullAccess(),
    SETTINGS: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true },
    USER_MANAGEMENT: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true }
  },
  ACCOUNTANT: createLimitedAccess(
    ['BOOKINGS', 'SALES', 'PURCHASING', 'CHART_OF_ACCOUNTS', 'FINANCIAL_REPORTS', 'COLLATERAL_VAULT', 'INVENTORY', 'SETTINGS'],
    ['SALES', 'PURCHASING', 'CHART_OF_ACCOUNTS', 'FINANCIAL_REPORTS', 'COLLATERAL_VAULT']
  ),
  SALES: createLimitedAccess(
    ['BOOKINGS', 'SALES', 'INVENTORY', 'TASKS', 'KOSHA'],
    ['BOOKINGS', 'SALES', 'TASKS']
  ),
  RENTAL_AGENT: createLimitedAccess(
    ['BOOKINGS', 'INVENTORY', 'COLLATERAL_VAULT', 'TASKS'],
    ['BOOKINGS', 'COLLATERAL_VAULT', 'TASKS']
  ),
  CASHIER: createLimitedAccess(
    ['SALES', 'BOOKINGS', 'COLLATERAL_VAULT'],
    ['SALES', 'COLLATERAL_VAULT']
  ),
  WAREHOUSE: createLimitedAccess(
    ['INVENTORY', 'PURCHASING', 'MANUFACTURING', 'TASKS'],
    ['INVENTORY', 'TASKS']
  ),
  TAILOR: createLimitedAccess(
    ['MANUFACTURING', 'INVENTORY', 'TASKS'],
    ['MANUFACTURING', 'TASKS']
  ),
  DELIVERY: createLimitedAccess(
    ['KOSHA', 'TASKS'],
    ['KOSHA', 'TASKS']
  ),
  PURCHASING_MANAGER: createLimitedAccess(
    ['PURCHASING', 'INVENTORY', 'MANUFACTURING', 'TASKS'],
    ['PURCHASING', 'TASKS']
  ),
  VIEWER: createLimitedAccess(
    ['BOOKINGS', 'SALES', 'PURCHASING', 'MANUFACTURING', 'INVENTORY', 'FINANCIAL_REPORTS', 'TASKS', 'KOSHA'],
    []
  )
};

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  companyNameAr: 'مؤسسة وهج العروس لمستلزمات وتجهيز الأعراس',
  companyNameEn: 'Wahaj Al-Arous Wedding Boutique & Operations',
  taxNumber: '310988776600003',
  crNumber: '1010887766',
  phone: '0112345678',
  email: 'info@wamas-app.com',
  address: 'المملكة العربية السعودية، الرياض، طريق الملك فهد',
  fiscalYearStart: '2026-01-01',
  fiscalYearEnd: '2026-12-31',
  isFiscalPeriodLocked: false,
  currency: 'ريال سعودي (SAR)',
  vatRatePercent: 15,
  poApprovalThreshold: 5000,
  minRentalDepositPercent: 25,
  minRentalCollateralPercent: 30,
  bookingBufferHours: 48,
  laundryBufferHours: 24,
  dailyLatePenaltyPercent: 15,
  paperSize: 'THERMAL_80MM',
  autoSyncIntervalMinutes: 5
};

export const INITIAL_OUTBOX: SyncOutboxItem[] = [
  {
    id: 'outbox-1',
    idempotencyKey: 'idemp-20261025-001',
    entityType: 'RENTAL_CONTRACT',
    action: 'UPDATE',
    payload: { contractNumber: 'CONT-2026-0042', status: 'ACTIVE', stage: 8 },
    createdAt: '2026-10-25 10:45:12',
    attempts: 0
  }
];

