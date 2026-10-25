import React, { useState } from 'react';
import { 
  ShoppingCart, Receipt, DollarSign, CreditCard, 
  Wallet, Printer, CheckCircle2, User, Sparkles, Plus
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { DoubleEntryAccountingService } from '../../services/doubleEntryAccountingService';

interface PosCashierProps {
  state: AppState;
  onRecordPayment: (voucherNumber: string, amount: number, method: string, customerName: string, category: string) => void;
}

export const PosCashierView: React.FC<PosCashierProps> = ({
  state,
  onRecordPayment
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(state.customers[0]?.id || '');
  const [paymentCategory, setPaymentCategory] = useState<string>('RENTAL_DEPOSIT');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BANK_TRANSFER'>('CASH');
  const [notes, setNotes] = useState<string>('مقبوضات نقدية في المعرض');
  const [showReceiptModal, setShowReceiptModal] = useState<any>(null);

  // Cashbox balance (Account 1101)
  const cashboxAccount = state.accounts.find(a => a.code === '1101');
  const bankAccount = state.accounts.find(a => a.code === '1102');

  const handleProcessPayment = () => {
    const customer = state.customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const voucherNumber = `VOU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    onRecordPayment(voucherNumber, amount, paymentMethod, customer.fullName, paymentCategory);

    setShowReceiptModal({
      voucherNumber,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      amount,
      paymentMethod,
      category: paymentCategory,
      notes,
      date: new Date().toLocaleString('ar-SA')
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">نقطة البيع والصندوق (POS & Cashbox)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-xs font-bold border border-teal-300">
              سندات حرارية معتمدة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل الدفعات، عربونات التأجير، تأمينات العقود، وإصدار سندات القبض والصرف الفورية
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left bg-purple-50 p-3 rounded-xl border border-purple-200">
            <span className="text-[11px] text-purple-700 block">رصيد الخزينة النقدية (1101):</span>
            <span className="font-mono font-black text-sm text-purple-950">
              {cashboxAccount?.balance.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
          <div className="text-left bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-700 block">رصيد البنك والشبكة (1102):</span>
            <span className="font-mono font-black text-sm text-emerald-950">
              {bankAccount?.balance.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* POS Quick Register Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Entry Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-800" />
            إصدار سند قبض جديد (Receipt Voucher)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العميل المستلم منه:</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                {state.customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع المقبوضات:</label>
                <select
                  value={paymentCategory}
                  onChange={(e) => setPaymentCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="RENTAL_DEPOSIT">عربون حجز تأجير (≥25%)</option>
                  <option value="RENTAL_FINAL">دفعة تأجير متبقية نهائية</option>
                  <option value="COLLATERAL">أمانة تأمين نقدي (Collateral)</option>
                  <option value="SALE">مبيعات مباشرة فستان/إكسسوار</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المقبوض (ر.س):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold font-mono text-purple-950 text-base"
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة السداد:</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-purple-900 text-white border-purple-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  نقداً (Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'bg-purple-900 text-white border-purple-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  شبكة / مدى (POS)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-purple-900 text-white border-purple-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  تحويل بنكي
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البيان والملاحظات:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <button
              onClick={handleProcessPayment}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              تأكيد القبض وإصدار السند الحراري وترحيل القيد
            </button>
          </div>
        </div>

        {/* Quick Receipt Preview */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="font-extrabold text-base text-purple-950">دار واحة العرائس الملكية WAMAS</div>
              <div className="text-[11px] text-slate-500">سند قبض مالي إلكتروني معتمد</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">الرقم الضريبي: 300129847500003</div>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المستلم منه:</span>
                <span className="font-bold text-slate-900">{state.customers.find(c => c.id === selectedCustomerId)?.fullName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>طريقة الدفع:</span>
                <span className="font-bold text-slate-900">{paymentMethod === 'CASH' ? 'نقدي' : 'شبكة/مدى'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>البند:</span>
                <span className="font-bold text-slate-900">{paymentCategory}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-bold">المبلغ المدفوع:</span>
                <span className="font-mono font-black text-purple-950 text-base">{amount.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400">
            شكراً لثقتكم بنا — WAMAS Wedding Business ERP
          </div>
        </div>

      </div>

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900">تم تسجيل السند وترحيل القيد بنجاح!</h3>
            <p className="text-xs text-slate-500 mt-1">سند قبض رقم: <strong className="text-purple-950 font-mono">{showReceiptModal.voucherNumber}</strong></p>

            <div className="my-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-right">
              <div>العميل: <strong>{showReceiptModal.customerName}</strong></div>
              <div>المبلغ: <strong className="text-emerald-700">{showReceiptModal.amount} ر.س</strong></div>
              <div>التاريخ: {showReceiptModal.date}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="w-1/2 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة حرارية A4
              </button>
              <button
                onClick={() => setShowReceiptModal(null)}
                className="w-1/2 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
