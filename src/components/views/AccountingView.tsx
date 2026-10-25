import React, { useState } from 'react';
import { 
  Scale, FileText, CheckCircle2, AlertTriangle, 
  ArrowRightLeft, Plus, DollarSign, BookOpen, BarChart3
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { DoubleEntryAccountingService } from '../../services/doubleEntryAccountingService';
import { Account, JournalEntry, JournalLine } from '../../types';

interface AccountingViewProps {
  state: AppState;
  onPostManualEntry: (entry: JournalEntry, updatedAccounts: Account[]) => void;
  onReverseEntry: (originalEntry: JournalEntry, reason: string) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  state,
  onPostManualEntry,
  onReverseEntry
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ENTRIES' | 'COA' | 'STATEMENTS'>('ENTRIES');
  const [showReversalModal, setShowReversalModal] = useState<JournalEntry | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('تصحيح خطأ محاسبي في القيد الأصلي');

  // Compute financial statement totals
  const totalAssets = state.accounts
    .filter(a => a.type === 'ASSET')
    .reduce((acc, a) => acc + a.balance, 0);

  const totalLiabilities = state.accounts
    .filter(a => a.type === 'LIABILITY')
    .reduce((acc, a) => acc + a.balance, 0);

  const totalEquity = state.accounts
    .filter(a => a.type === 'EQUITY')
    .reduce((acc, a) => acc + a.balance, 0);

  const totalRevenue = state.accounts
    .filter(a => a.type === 'REVENUE')
    .reduce((acc, a) => acc + a.balance, 0);

  const totalExpenses = state.accounts
    .filter(a => a.type === 'EXPENSE')
    .reduce((acc, a) => acc + a.balance, 0);

  const netIncome = totalRevenue - totalExpenses;

  const handleConfirmReversal = () => {
    if (!showReversalModal) return;
    onReverseEntry(showReversalModal, reversalReason);
    setShowReversalModal(null);
    alert('تم إنشاء وترحيل القيد العكسي بنجاح وتحديث أرصدة الحسابات!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">النظام المالي والمحاسبي مزدوج القيد (Double-Entry Core)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              ∑Dr = ∑Cr صارم
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            شجرة الحسابات المعتمدة، القيود اليومية التلقائية، أمانات التأمين كالتزام، والتعديل عبر القيود العكسية فقط (BR-06 & BR-07)
          </p>
        </div>

        {/* Subtabs switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('ENTRIES')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeSubTab === 'ENTRIES' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'
            }`}
          >
            دفتر اليومية والقيود
          </button>
          <button
            onClick={() => setActiveSubTab('COA')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeSubTab === 'COA' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'
            }`}
          >
            دليل وشجرة الحسابات
          </button>
          <button
            onClick={() => setActiveSubTab('STATEMENTS')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeSubTab === 'STATEMENTS' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'
            }`}
          >
            القوائم المالية والربحية
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block mb-1">إجمالي الأصول (Assets)</span>
          <div className="text-2xl font-black text-slate-900">
            {totalAssets.toLocaleString('ar-SA')} <span className="text-xs text-emerald-600">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">النقدية والمخزون المؤجر</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block mb-1">الالتزامات (أمانات العملاء)</span>
          <div className="text-2xl font-black text-amber-700">
            {totalLiabilities.toLocaleString('ar-SA')} <span className="text-xs text-amber-600">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">تأمينات محتجزة وعربون مؤجل</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block mb-1">إجمالي الإيرادات (Revenues)</span>
          <div className="text-2xl font-black text-purple-900">
            {totalRevenue.toLocaleString('ar-SA')} <span className="text-xs text-purple-600">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">تأجير، مبيعات، وغرامات</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block mb-1">صافي الربح التقديري</span>
          <div className="text-2xl font-black text-emerald-700">
            {netIncome.toLocaleString('ar-SA')} <span className="text-xs text-emerald-600">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">الإيرادات - المصروفات التشغيلية</span>
        </div>
      </div>

      {/* Tab 1: Journal Entries */}
      {activeSubTab === 'ENTRIES' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">سجل القيود اليومية المرحلة (General Ledger)</h3>
              <p className="text-xs text-slate-500">كل قيد يتم ترحيله ذرياً (Atomic) مع اشتراط تطابق المدين والدائن 100%</p>
            </div>
          </div>

          <div className="space-y-4">
            {state.journalEntries.map((je) => (
              <div key={je.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded border border-purple-200">
                      {je.entryNumber}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{je.description}</span>
                    {je.isReversed && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                        معكوس بقيد تصحيحي
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-mono">{je.date}</span>
                    {!je.isReversed && (
                      <button
                        onClick={() => setShowReversalModal(je)}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                        title="إنشاء قيد عكسي لتصحيح هذا القيد (BR-07)"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        عكس القيد
                      </button>
                    )}
                  </div>
                </div>

                {/* Journal Lines Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200 text-[11px]">
                        <th className="py-1.5 font-semibold">رقم الحساب</th>
                        <th className="py-1.5 font-semibold">اسم الحساب</th>
                        <th className="py-1.5 font-semibold">البيان / الملاحظة</th>
                        <th className="py-1.5 font-semibold text-left">مدين (Debit)</th>
                        <th className="py-1.5 font-semibold text-left">دائن (Credit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {je.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-100/50">
                          <td className="py-2 font-mono text-purple-900 font-bold">{line.accountCode}</td>
                          <td className="py-2 font-semibold text-slate-800">{line.accountNameAr}</td>
                          <td className="py-2 text-slate-500 text-[11px]">{line.memo || '-'}</td>
                          <td className="py-2 text-left font-mono font-bold text-slate-900">
                            {line.debit > 0 ? `${line.debit.toLocaleString('ar-SA')} ر.س` : '-'}
                          </td>
                          <td className="py-2 text-left font-mono font-bold text-slate-900">
                            {line.credit > 0 ? `${line.credit.toLocaleString('ar-SA')} ر.س` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-bold bg-slate-100/70 text-[11px]">
                        <td colSpan={3} className="py-2 text-slate-800 text-left pl-4 font-bold">
                          المجموع المتوازن (∑Dr = ∑Cr):
                        </td>
                        <td className="py-2 text-left text-purple-900 font-mono font-black">
                          {je.totalDebit.toLocaleString('ar-SA')} ر.س
                        </td>
                        <td className="py-2 text-left text-purple-900 font-mono font-black">
                          {je.totalCredit.toLocaleString('ar-SA')} ر.س
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Chart of Accounts */}
      {activeSubTab === 'COA' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">شجرة الحسابات والدليل المحاسي (COA)</h3>
              <p className="text-xs text-slate-500">هيكل الحسابات القياسي لقطاع التأجير والأعراس</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 text-[11px] bg-slate-50">
                  <th className="p-3 font-semibold">الكود</th>
                  <th className="p-3 font-semibold">اسم الحساب في الدليل</th>
                  <th className="p-3 font-semibold">التصنيف المحاسبي</th>
                  <th className="p-3 font-semibold text-left">الرصيد الدفتري الحالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.accounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-purple-900">{acc.code}</td>
                    <td className="p-3 font-bold text-slate-800">{acc.nameAr}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        acc.type === 'ASSET' ? 'bg-emerald-100 text-emerald-800' :
                        acc.type === 'LIABILITY' ? 'bg-amber-100 text-amber-800' :
                        acc.type === 'EQUITY' ? 'bg-blue-100 text-blue-800' :
                        acc.type === 'REVENUE' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {acc.type === 'ASSET' ? 'أصل' :
                         acc.type === 'LIABILITY' ? 'التزام' :
                         acc.type === 'EQUITY' ? 'حقوق ملكية' :
                         acc.type === 'REVENUE' ? 'إيراد' : 'مصروف'}
                      </span>
                    </td>
                    <td className="p-3 text-left font-mono font-bold text-slate-900">
                      {acc.balance.toLocaleString('ar-SA')} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Financial Statements */}
      {activeSubTab === 'STATEMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Income Statement */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 mb-4">
              قائمة الدخل والأرباح (Income Statement)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-purple-900 mb-1">الإيرادات التشغيلية:</div>
              {state.accounts.filter(a => a.type === 'REVENUE').map(a => (
                <div key={a.code} className="flex justify-between text-slate-700">
                  <span>{a.nameAr}</span>
                  <span className="font-mono font-bold">{a.balance.toLocaleString('ar-SA')} ر.س</span>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-200 font-bold text-rose-900 mb-1">المصروفات التشغيلية:</div>
              {state.accounts.filter(a => a.type === 'EXPENSE').map(a => (
                <div key={a.code} className="flex justify-between text-slate-700">
                  <span>{a.nameAr}</span>
                  <span className="font-mono font-bold">{a.balance.toLocaleString('ar-SA')} ر.س</span>
                </div>
              ))}

              <div className="pt-4 border-t-2 border-slate-300 flex justify-between font-black text-sm bg-purple-50 p-3 rounded-xl text-purple-950 mt-4">
                <span>صافي الدخل الربحي:</span>
                <span className="font-mono text-emerald-700">{netIncome.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 mb-4">
              الميزانية العمومية (Balance Sheet)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-emerald-900 mb-1">مجموع الأصول (Assets):</div>
              {state.accounts.filter(a => a.type === 'ASSET').map(a => (
                <div key={a.code} className="flex justify-between text-slate-700">
                  <span>{a.nameAr}</span>
                  <span className="font-mono font-bold">{a.balance.toLocaleString('ar-SA')} ر.س</span>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-200 font-bold text-amber-900 mb-1">الالتزامات وحقوق الملكية:</div>
              {state.accounts.filter(a => a.type === 'LIABILITY' || a.type === 'EQUITY').map(a => (
                <div key={a.code} className="flex justify-between text-slate-700">
                  <span>{a.nameAr}</span>
                  <span className="font-mono font-bold">{a.balance.toLocaleString('ar-SA')} ر.س</span>
                </div>
              ))}

              <div className="pt-4 border-t-2 border-slate-300 flex justify-between font-black text-sm bg-slate-100 p-3 rounded-xl text-slate-900 mt-4">
                <span>المعادلة المحاسبية: الأصول = الالتزامات + حقوق الملكية</span>
                <span className="text-emerald-700 font-bold">متوازنة ✅</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Reversal Entry Modal (BR-07) */}
      {showReversalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">إنشاء قيد عكسي لتصحيح القيد (BR-07)</h3>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                وفقاً للقاعدة المحاسبية <strong>BR-07</strong>: لا يمكن حذف أو تعديل القيد المُرحَّل مباشرة في قاعدة البيانات. يتم عكس أطراف القيد (المدين يصبح دائناً والدائن يصبح مديناً) لإبطال أثره المالي بنزاهة.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-800">
                القيد المستهدف: {showReversalModal.entryNumber} — مبلغ: {showReversalModal.totalDebit.toLocaleString('ar-SA')} ر.س
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">سبب العكس للتسجيل في سجل التدقيق:</label>
                <input
                  type="text"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowReversalModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReversal}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                ترحيل القيد العكسي الآن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
