/**
 * WAMAS ERP - Database Schema Definition & Architectural Blueprint
 * PostgreSQL 16 DDL with btree_gist Exclusion Constraints & Prisma Schema
 */

export const POSTGRESQL_DDL = `-- ====================================================================
-- WAMAS (Wedding Business ERP) Enterprise PostgreSQL DDL v1.1
-- Optimized for High-Concurrency, Zero-Conflict Booking, and Double-Entry
-- ====================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Required for temporal exclusion constraints

-- 2. Enumerations
CREATE TYPE user_role AS ENUM (
  'OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT', 'SALES', 
  'RENTAL_AGENT', 'CASHIER', 'WAREHOUSE', 'TAILOR', 'DELIVERY'
);

CREATE TYPE product_unit_status AS ENUM (
  'AVAILABLE', 'BOOKED', 'READY_FOR_DELIVERY', 'DELIVERED', 
  'RETURNED', 'CLEANING', 'REQUIRED_REPAIR', 'REPAIR', 
  'ALTERATION', 'MAINTENANCE', 'PENDING_INSPECTION', 
  'DAMAGED', 'LOST', 'ON_DISPLAY', 'CUSTOMIZED'
);

CREATE TYPE booking_status AS ENUM (
  'PENDING', 'DEPOSIT_PAID', 'CONFIRMED', 'PREPARING', 
  'READY', 'DELIVERED', 'RETURNED', 'COMPLETED', 'LATE', 'CANCELLED'
);

CREATE TYPE collateral_type AS ENUM (
  'CASH', 'GOLD', 'WEAPON', 'ID_DOCUMENT', 'OTHER_ASSET'
);

CREATE TYPE collateral_status AS ENUM (
  'HELD', 'REFUNDED', 'CONFISCATED', 'PARTIALLY_SETTLED'
);

CREATE TYPE task_type AS ENUM (
  'PREPARATION', 'CLEANING', 'REPAIR', 'DELIVERY', 
  'INSPECTION', 'DAMAGE_ASSESSMENT', 'COLLECTION', 
  'KOSHA_SETUP', 'KOSHA_TEARDOWN', 'PURCHASE', 'ADMIN'
);

CREATE TYPE task_priority AS ENUM ('URGENT', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE task_status AS ENUM ('NEW', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED');
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- 3. Core Tables

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  commercial_reg_no VARCHAR(100),
  tax_number VARCHAR(100),
  phone VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'SAR',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) UNIQUE NOT NULL,
  whatsapp VARCHAR(50),
  national_id VARCHAR(50) NOT NULL,
  id_document_type VARCHAR(50) DEFAULT 'NATIONAL_ID',
  id_photo_front TEXT,
  id_photo_back TEXT,
  event_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  classification VARCHAR(20) DEFAULT 'NORMAL',
  guarantor_name VARCHAR(255),
  guarantor_phone VARCHAR(50),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  bust_cm NUMERIC(5,2) NOT NULL,
  waist_cm NUMERIC(5,2) NOT NULL,
  hips_cm NUMERIC(5,2) NOT NULL,
  hollow_to_hem_cm NUMERIC(5,2) NOT NULL,
  shoulder_width_cm NUMERIC(5,2) NOT NULL,
  heel_height_cm NUMERIC(5,2) NOT NULL,
  size_label VARCHAR(20) NOT NULL,
  tailor_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  product_type VARCHAR(20) DEFAULT 'BOTH',
  rental_price_daily NUMERIC(12,2) NOT NULL,
  rental_price_weekly NUMERIC(12,2),
  sale_price NUMERIC(12,2),
  purchase_cost NUMERIC(12,2) NOT NULL,
  required_collateral NUMERIC(12,2) NOT NULL,
  description TEXT,
  cover_image TEXT NOT NULL, -- BR-16: Mandatory photo
  total_rentals_count INT DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  total_maintenance_cost NUMERIC(14,2) DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  status product_unit_status DEFAULT 'AVAILABLE',
  warehouse_location VARCHAR(100),
  cleaning_due_until TIMESTAMPTZ,
  version_number INT DEFAULT 1,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  status booking_status DEFAULT 'PENDING',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_rent_amount NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  deposit_required NUMERIC(12,2) NOT NULL, -- BR-02: >= 25%
  deposit_paid NUMERIC(12,2) DEFAULT 0,
  collateral_required NUMERIC(12,2) NOT NULL, -- >= 30%
  collateral_paid NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  version_number INT DEFAULT 1, -- Optimistic Locking
  is_deleted BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BR-01: Temporal Exclusion Constraint with 48h Buffer
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  product_unit_id UUID NOT NULL REFERENCES product_units(id),
  rental_price NUMERIC(12,2) NOT NULL,
  collateral_amount NUMERIC(12,2) NOT NULL,
  start_timestamp TIMESTAMPTZ NOT NULL,
  end_timestamp TIMESTAMPTZ NOT NULL,
  buffer_range TSTZRANGE NOT NULL, -- [start - 48h, end + 48h]
  
  -- Anti-Double Booking exclusion constraint via btree_gist
  CONSTRAINT prevent_double_booking_buffer EXCLUDE USING gist (
    product_unit_id WITH =,
    buffer_range WITH &&
  )
);

CREATE TABLE rental_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id),
  current_stage INT DEFAULT 1, -- 1 to 12
  start_date DATE NOT NULL,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  days_late INT DEFAULT 0,
  late_penalty_fee NUMERIC(12,2) DEFAULT 0,
  damage_penalty_fee NUMERIC(12,2) DEFAULT 0,
  refunded_collateral NUMERIC(12,2) DEFAULT 0,
  additional_due_amount NUMERIC(12,2) DEFAULT 0,
  digital_signature TEXT,
  signed_at TIMESTAMPTZ,
  delivery_inspection_done BOOLEAN DEFAULT FALSE,
  return_inspection_done BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collaterals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  contract_id UUID NOT NULL REFERENCES rental_contracts(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  collateral_type collateral_type NOT NULL,
  amount NUMERIC(12,2),
  gold_type VARCHAR(100),
  gold_weight_grams NUMERIC(8,2),
  gold_karat INT,
  weapon_type VARCHAR(100),
  weapon_serial_number VARCHAR(100),
  description TEXT NOT NULL,
  status collateral_status DEFAULT 'HELD',
  received_by UUID REFERENCES users(id),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  returned_at TIMESTAMPTZ
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES rental_contracts(id),
  product_unit_id UUID NOT NULL REFERENCES product_units(id),
  inspection_type VARCHAR(50) NOT NULL, -- PRE_DELIVERY or POST_RETURN
  general_condition VARCHAR(50) NOT NULL,
  damage_markers JSONB DEFAULT '[]'::jsonb, -- X/Y pin, type, cost
  inspected_by UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Double-Entry Accounting
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  type account_type NOT NULL,
  balance NUMERIC(14,2) DEFAULT 0
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_number VARCHAR(100) UNIQUE NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  total_debit NUMERIC(14,2) NOT NULL,
  total_credit NUMERIC(14,2) NOT NULL,
  is_posted BOOLEAN DEFAULT TRUE,
  is_reversed BOOLEAN DEFAULT FALSE,
  reversal_entry_id UUID REFERENCES journal_entries(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- BR-06: Strict Double-Entry Balance
  CONSTRAINT balance_check CHECK (total_debit = total_credit)
);

CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  debit NUMERIC(14,2) DEFAULT 0,
  credit NUMERIC(14,2) DEFAULT 0,
  memo TEXT
);

-- Tasks Engine
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type task_type NOT NULL,
  priority task_priority NOT NULL,
  status task_status DEFAULT 'NEW',
  assigned_to UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  progress_percent INT DEFAULT 0,
  entity_type VARCHAR(50),
  entity_id UUID,
  is_auto_generated BOOLEAN DEFAULT FALSE,
  trigger_event VARCHAR(100),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export const PRISMA_SCHEMA = `// ====================================================================
// WAMAS ERP - Prisma Schema
// ====================================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  OWNER
  GENERAL_MANAGER
  ACCOUNTANT
  SALES
  RENTAL_AGENT
  CASHIER
  WAREHOUSE
  TAILOR
  DELIVERY
}

enum ProductUnitStatus {
  AVAILABLE
  BOOKED
  READY_FOR_DELIVERY
  DELIVERED
  RETURNED
  CLEANING
  REQUIRED_REPAIR
  REPAIR
  ALTERATION
  MAINTENANCE
  PENDING_INSPECTION
  DAMAGED
  LOST
  ON_DISPLAY
  CUSTOMIZED
}

enum BookingStatus {
  PENDING
  DEPOSIT_PAID
  CONFIRMED
  PREPARING
  READY
  DELIVERED
  RETURNED
  COMPLETED
  LATE
  CANCELLED
}

model Organization {
  id               String    @id @default(uuid())
  name             String
  commercialRegNo  String?
  taxNumber        String?
  phone            String?
  currency         String    @default("SAR")
  branches         Branch[]
  users            User[]
  products         Product[]
  customers        Customer[]
  bookings         Booking[]
  createdAt        DateTime  @default(now())
}

model Product {
  id                   String        @id @default(uuid())
  organizationId       String
  organization         Organization  @relation(fields: [organizationId], references: [id])
  sku                  String        @unique
  nameAr               String
  nameEn               String?
  category             String
  rentalPriceDaily     Decimal       @db.Decimal(12, 2)
  salePrice            Decimal?      @db.Decimal(12, 2)
  purchaseCost         Decimal       @db.Decimal(12, 2)
  requiredCollateral   Decimal       @db.Decimal(12, 2)
  coverImage           String
  units                ProductUnit[]
  totalRentalsCount    Int           @default(0)
  totalRevenue         Decimal       @default(0) @db.Decimal(14, 2)
  totalMaintenanceCost Decimal       @default(0) @db.Decimal(14, 2)
  createdAt            DateTime      @default(now())
}

model ProductUnit {
  id               String            @id @default(uuid())
  productId        String
  product          Product           @relation(fields: [productId], references: [id])
  serialNumber     String            @unique
  size             String
  color            String
  status           ProductUnitStatus @default(AVAILABLE)
  cleaningDueUntil DateTime?
  versionNumber    Int               @default(1)
  bookingItems     BookingItem[]
}

model Booking {
  id                 String        @id @default(uuid())
  organizationId     String
  organization       Organization  @relation(fields: [organizationId], references: [id])
  bookingNumber      String        @unique
  customerId         String
  customer           Customer      @relation(fields: [customerId], references: [id])
  status             BookingStatus @default(PENDING)
  startDate          DateTime      @db.Date
  endDate            DateTime      @db.Date
  totalRentAmount    Decimal       @db.Decimal(12, 2)
  depositRequired    Decimal       @db.Decimal(12, 2)
  depositPaid        Decimal       @default(0) @db.Decimal(12, 2)
  collateralRequired Decimal       @db.Decimal(12, 2)
  collateralPaid     Decimal       @default(0) @db.Decimal(12, 2)
  versionNumber      Int           @default(1)
  items              BookingItem[]
  contracts          RentalContract[]
  createdAt          DateTime      @default(now())
}

model BookingItem {
  id             String      @id @default(uuid())
  bookingId      String
  booking        Booking     @relation(fields: [bookingId], references: [id])
  productUnitId  String
  productUnit    ProductUnit @relation(fields: [productUnitId], references: [id])
  rentalPrice    Decimal     @db.Decimal(12, 2)
  startDateTime  DateTime
  endDateTime    DateTime
}

model RentalContract {
  id                  String       @id @default(uuid())
  contractNumber      String       @unique
  bookingId           String
  booking             Booking      @relation(fields: [bookingId], references: [id])
  customerId          String
  customer            Customer     @relation(fields: [customerId], references: [id])
  currentStage        Int          @default(1)
  daysLate            Int          @default(0)
  latePenaltyFee      Decimal      @default(0) @db.Decimal(12, 2)
  damagePenaltyFee    Decimal      @default(0) @db.Decimal(12, 2)
  collaterals         Collateral[]
  inspections         Inspection[]
}

model Task {
  id               String       @id @default(uuid())
  taskNumber       String       @unique
  title            String
  description      String?
  priority         String
  status           String       @default("NEW")
  assignedToId     String
  dueDate          DateTime
  isAutoGenerated  Boolean      @default(false)
  triggerEvent     String?
  createdAt        DateTime     @default(now())
}
`;
