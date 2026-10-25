/**
 * WAMAS ERP - Strict Double-Entry Financial & Accounting Service
 * Enforces BR-05, BR-06, BR-07, BR-09, BR-10
 */

import { Account, JournalEntry, JournalLine } from '../types';

export const INITIAL_CHART_OF_ACCOUNTS: Account[] = [
  // الأصول (Assets) - 1000s
  { code: '1101', nameAr: 'الصندوق والخزينة النقدية', type: 'ASSET', balance: 45000 },
  { code: '1102', nameAr: 'حساب البنك / مدى / البطاقات', type: 'ASSET', balance: 128500 },
  { code: '1201', nameAr: 'مخزون الفساتين والأصول المؤجرة', type: 'ASSET', balance: 320000 },
  { code: '1301', nameAr: 'الذمم المدينة (العملاء)', type: 'ASSET', balance: 18500 },

  // الالتزامات (Liabilities) - 2000s
  { code: '2101', nameAr: 'أمانات وتأمينات العملاء (Collateral Liability)', type: 'LIABILITY', balance: 24000 },
  { code: '2201', nameAr: 'إيرادات الحجوزات المقدمة (عربون مؤجل)', type: 'LIABILITY', balance: 14500 },
  { code: '2301', nameAr: 'الذمم الدائنة (الموردين والمشاغل)', type: 'LIABILITY', balance: 12000 },

  // حقوق الملكية (Equity) - 3000s
  { code: '3101', nameAr: 'رأس مال المؤسسة', type: 'EQUITY', balance: 400000 },
  { code: '3201', nameAr: 'الأرباح المبقاة', type: 'EQUITY', balance: 46000 },

  // الإيرادات (Revenues) - 4000s
  { code: '4101', nameAr: 'إيرادات تأجير فساتين ومستلزمات', type: 'REVENUE', balance: 68000 },
  { code: '4102', nameAr: 'إيرادات بيع فساتين وإكسسوارات', type: 'REVENUE', balance: 35000 },
  { code: '4201', nameAr: 'إيرادات غرامات التأخير', type: 'REVENUE', balance: 4500 },
  { code: '4202', nameAr: 'إيرادات تعويضات التلفيات', type: 'REVENUE', balance: 3200 },

  // المصروفات (Expenses) - 5000s
  { code: '5101', nameAr: 'مصروفات الغسيل الجاف والتعقيم', type: 'EXPENSE', balance: 4800 },
  { code: '5102', nameAr: 'مصروفات الخياطة وتعديل المقاسات', type: 'EXPENSE', balance: 7200 },
  { code: '5201', nameAr: 'رواتب وأجور الموظفين', type: 'EXPENSE', balance: 28000 },
  { code: '5301', nameAr: 'إيجار المعرض والمستودعات', type: 'EXPENSE', balance: 15000 },
  { code: '5401', nameAr: 'مستهلكات وخيوط وأقمشة', type: 'EXPENSE', balance: 3700 }
];

export class DoubleEntryAccountingService {
  /**
   * Validate double-entry equilibrium: SUM(Dr) === SUM(Cr)
   */
  public static validateEntryEquilibrium(lines: JournalLine[]): { isValid: boolean; totalDr: number; totalCr: number; difference: number } {
    const totalDr = lines.reduce((acc, line) => acc + (line.debit || 0), 0);
    const totalCr = lines.reduce((acc, line) => acc + (line.credit || 0), 0);
    const diff = Math.abs(totalDr - totalCr);

    return {
      isValid: diff < 0.001, // floating-point precision guard
      totalDr,
      totalCr,
      difference: diff
    };
  }

  /**
   * Post a balanced journal entry
   */
  public static postJournalEntry(
    entryNumber: string,
    description: string,
    referenceType: JournalEntry['referenceType'],
    referenceId: string | undefined,
    lines: JournalLine[],
    accounts: Account[],
    userId: string
  ): { success: boolean; entry?: JournalEntry; updatedAccounts?: Account[]; error?: string } {
    const validation = this.validateEntryEquilibrium(lines);
    if (!validation.isValid) {
      return {
        success: false,
        error: `رفض ترحيل القيد! القيد غير متوازن: مجموع المدين (${validation.totalDr.toFixed(2)}) لا يساوي مجموع الدائن (${validation.totalCr.toFixed(2)}). فارق: ${validation.difference.toFixed(2)}`
      };
    }

    const newEntry: JournalEntry = {
      id: `JE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entryNumber,
      date: new Date().toISOString().split('T')[0],
      description,
      referenceType,
      referenceId,
      lines,
      totalDebit: validation.totalDr,
      totalCredit: validation.totalCr,
      isPosted: true,
      createdBy: userId,
      createdAt: new Date().toISOString()
    };

    // Update account balances atomically
    const updatedAccounts = accounts.map(acc => {
      let currentBalance = acc.balance;
      for (const line of lines) {
        if (line.accountCode === acc.code) {
          if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
            currentBalance += (line.debit - line.credit);
          } else {
            // LIABILITY, EQUITY, REVENUE
            currentBalance += (line.credit - line.debit);
          }
        }
      }
      return { ...acc, balance: currentBalance };
    });

    return {
      success: true,
      entry: newEntry,
      updatedAccounts
    };
  }

  /**
   * BR-07: Create a reversal entry for a posted journal entry
   */
  public static createReversalEntry(
    originalEntry: JournalEntry,
    accounts: Account[],
    userId: string,
    reason: string
  ): { success: boolean; reversalEntry?: JournalEntry; updatedAccounts?: Account[]; error?: string } {
    if (originalEntry.isReversed) {
      return { success: false, error: 'هذا القيد تم عكسه سابقاً ولا يمكن تكرار عكسه.' };
    }

    // Invert debits and credits
    const invertedLines: JournalLine[] = originalEntry.lines.map(line => ({
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountNameAr: line.accountNameAr,
      debit: line.credit, // swap
      credit: line.debit, // swap
      memo: `قيد عكسي لتصحيح [${originalEntry.entryNumber}]: ${reason}`
    }));

    const reversalNumber = `REV-${originalEntry.entryNumber}-${Math.floor(Math.random() * 100)}`;
    const postRes = this.postJournalEntry(
      reversalNumber,
      `قيد عكسي لتصحيح القيد رقم ${originalEntry.entryNumber}: ${reason}`,
      originalEntry.referenceType,
      originalEntry.referenceId,
      invertedLines,
      accounts,
      userId
    );

    if (postRes.success && postRes.entry) {
      return {
        success: true,
        reversalEntry: postRes.entry,
        updatedAccounts: postRes.updatedAccounts
      };
    }

    return { success: false, error: postRes.error };
  }

  /**
   * Cash Sale accounting transaction
   */
  public static createCashSaleEntry(
    invoiceNumber: string,
    amount: number,
    costOfGoods: number,
    accounts: Account[],
    userId: string
  ) {
    const lines: JournalLine[] = [
      { accountId: '1', accountCode: '1101', accountNameAr: 'الصندوق والخزينة النقدية', debit: amount, credit: 0, memo: `مقبوضات بيع نقدي فاتورة ${invoiceNumber}` },
      { accountId: '2', accountCode: '4102', accountNameAr: 'إيرادات بيع فساتين وإكسسوارات', debit: 0, credit: amount, memo: `إيراد مبيعات فاتورة ${invoiceNumber}` }
    ];

    return this.postJournalEntry(`JE-SALE-${invoiceNumber}`, `بيع مباشر نقدي فاتورة رقم ${invoiceNumber}`, 'SALE', invoiceNumber, lines, accounts, userId);
  }

  /**
   * Collateral deposit (BR-05: Liability, not Revenue)
   */
  public static createCollateralReceivedEntry(
    receiptNumber: string,
    amount: number,
    customerName: string,
    accounts: Account[],
    userId: string
  ) {
    const lines: JournalLine[] = [
      { accountId: '1', accountCode: '1101', accountNameAr: 'الصندوق والخزينة النقدية', debit: amount, credit: 0, memo: `استلام تأمين نقدي من ${customerName}` },
      { accountId: '3', accountCode: '2101', accountNameAr: 'أمانات وتأمينات العملاء (Collateral Liability)', debit: 0, credit: amount, memo: `التزام أمانة تأمين للعميل ${customerName}` }
    ];

    return this.postJournalEntry(`JE-COL-${receiptNumber}`, `استلام أمانة تأمين نقدي سند ${receiptNumber}`, 'COLLATERAL', receiptNumber, lines, accounts, userId);
  }

  /**
   * Settlement with deductions (damages/delays) and remaining refund
   */
  public static createCollateralSettlementEntry(
    contractNumber: string,
    totalCollateral: number,
    delayPenalty: number,
    damageFee: number,
    refundAmount: number,
    customerName: string,
    accounts: Account[],
    userId: string
  ) {
    const lines: JournalLine[] = [
      // 1. Clear Collateral Liability (Debit)
      { accountId: '3', accountCode: '2101', accountNameAr: 'أمانات وتأمينات العملاء (Collateral Liability)', debit: totalCollateral, credit: 0, memo: `إقفال تأمين العقد ${contractNumber}` }
    ];

    // 2. Recognize Delay Penalty Revenue if any
    if (delayPenalty > 0) {
      lines.push({ accountId: '4', accountCode: '4201', accountNameAr: 'إيرادات غرامات التأخير', debit: 0, credit: delayPenalty, memo: `غرامة تأخير عقد ${contractNumber}` });
    }

    // 3. Recognize Damage Compensation Revenue if any
    if (damageFee > 0) {
      lines.push({ accountId: '5', accountCode: '4202', accountNameAr: 'إيرادات تعويضات التلفيات', debit: 0, credit: damageFee, memo: `تعويض تلفيات عقد ${contractNumber}` });
    }

    // 4. Refund remaining cash to customer
    if (refundAmount > 0) {
      lines.push({ accountId: '1', accountCode: '1101', accountNameAr: 'الصندوق والخزينة النقدية', debit: 0, credit: refundAmount, memo: `رد صافي التأمين للعميل ${customerName}` });
    }

    return this.postJournalEntry(`JE-SETTLE-${contractNumber}`, `تسوية تأمين وغرامات العقد ${contractNumber}`, 'SETTLEMENT', contractNumber, lines, accounts, userId);
  }
}
