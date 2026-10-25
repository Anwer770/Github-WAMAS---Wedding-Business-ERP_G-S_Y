import React, { useState } from 'react';
import { 
  ShieldAlert, Lock, Unlock, Eye, EyeOff, Plus, 
  Receipt, CheckCircle, AlertTriangle, Sparkles, Printer, DollarSign
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { Collateral, CollateralType } from '../../types';

interface CollateralVaultProps {
  state: AppState;
  onAddCollateral: (collateral: Collateral) => void;
  onRefundCollateral: (collateralId: string) => void;
}

export const CollateralVaultView: React.FC<CollateralVaultProps> = ({
  state,
  onAddCollateral,
  onRefundCollateral
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [unlockedPhotos, setUnlockedPhotos] = useState<Record<string, boolean>>({});
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [activeUnlockId, setActiveUnlockId] = useState<string | null>(null);

  // New Collateral Form
  const [colType, setColType] = useState<CollateralType>('CASH');
  const [colAmount, setColAmount] = useState<number>(2000);
  const [goldType, setGoldType] = useState<string>('طقم ذهب لازوردي عيار 21');
  const [goldWeight, setGoldWeight] = useState<number>(18.5);
  const [goldKarat, setGoldKarat] = useState<number>(21);
  const [goldValuation, setGoldValuation] = useState<number>(5100);
  const [colDescription, setColDescription] = useState<string>('تأمين مسترد عند فحص الفستان');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(state.customers[0]?.id || '');
  const [selectedContractId, setSelectedContractId] = useState<string>(state.contracts[0]?.id || '');

  const totalHeldCash = state.collaterals
    .filter(c => c.status === 'HELD' && c.type === 'CASH')
    .reduce((acc, c) => acc + (c.amount || 0), 0);

  const totalHeldGoldValue = state.collaterals
    .filter(c => c.status === 'HELD' && c.type === 'GOLD')
    .reduce((acc, c) => acc + (c.goldEstimatedValue || 0), 0);

  const handleUnlockPhotos = (colId: string) => {
    // Check role or simulated security code
    if (state.currentUser.role === 'OWNER' || state.currentUser.role === 'GENERAL_MANAGER') {
      setUnlockedPhotos({ ...unlockedPhotos, [colId]: true });
    } else {
      setActiveUnlockId(colId);
    }
  };

  const verifyPasscode = () => {
    if (passcodeInput === '1234' || state.currentUser.role === 'OWNER') {
      if (activeUnlockId) {
        setUnlockedPhotos({ ...unlockedPhotos, [activeUnlockId]: true });
      }
      setActiveUnlockId(null);
      setPasscodeInput('');
    } else {
      alert('رمز الأمان غير صحيح! (استخدم 1234 للمحاكاة أو بدّل لدور المالك)');
    }
  };

  const handleSaveCollateral = () => {
    const customer = state.customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const newReceiptNumber = `COL-2026-${String(state.collaterals.length + 101).padStart(4, '0')}`;
    const newCol: Collateral = {
      id: `col-${Date.now()}`,
      receiptNumber: newReceiptNumber,
      contractId: selectedContractId,
      customerId: customer.id,
      customerName: customer.fullName,
      type: colType,
      amount: colType === 'CASH' ? colAmount : undefined,
      currency: 'SAR',
      goldType: colType === 'GOLD' ? goldType : undefined,
      goldWeightGrams: colType === 'GOLD' ? goldWeight : undefined,
      goldKarat: colType === 'GOLD' ? goldKarat : undefined,
      goldEstimatedValue: colType === 'GOLD' ? goldValuation : undefined,
      description: colDescription,
      photos: [
        colType === 'GOLD' 
          ? 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600' 
          : 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600'
      ],
      status: 'HELD',
      receivedBy: state.currentUser.id,
      receivedAt: new Date().toISOString()
    };

    onAddCollateral(newCol);
    setShowAddModal(false);
    alert(`تم تسجيل الأمانة بسند رسمي رقم (${newReceiptNumber}) وترحيل قيد الالتزام في الحساب 2101.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">خزينة التأمينات والضمانات (Collateral Vault)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              أمانات التزام (حساب 2101)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة أمانات الذهب والأسلحة والوثائق والنقد مع تشفير الوسائط وقيود التسوية الصارمة (BR-03 & BR-05)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-purple-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer border border-amber-300/40"
        >
          <Plus className="w-4 h-4" />
          إيداع سند أمانة / تأمين جديد
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block mb-1">أمانات التأمين النقدي المحتجزة</span>
          <div className="text-2xl font-black text-slate-900">
            {totalHeldCash.toLocaleString('ar-SA')} <span className="text-xs text-emerald-600">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">محفوظة في صندوق الأمانات (1101)</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block mb-1">القيمة التقديرية للذهب المرهون</span>
          <div className="text-2xl font-black text-amber-700">
            {totalHeldGoldValue.toLocaleString('ar-SA')} <span className="text-xs text-amber-600">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">محفوظ في الخزينة المصفحة بتوثيق مصور</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block mb-1">إجمالي الضمانات النشطة</span>
          <div className="text-2xl font-black text-purple-900">
            {state.collaterals.filter(c => c.status === 'HELD').length} <span className="text-xs font-normal">سند أمانة</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">لا يمكن تسليم أي فستان بدون تأمين (BR-03)</span>
        </div>
      </div>

      {/* Passcode Modal for Non-Owner Roles */}
      {activeUnlockId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-center text-slate-900">تأكيد صلاحية عرض صور الأمانات المشفرة</h3>
            <p className="text-[11px] text-slate-500 text-center mt-1">
              أدخل رمز الأمان للمدير (رمز المحاكاة: 1234)
            </p>
            <input
              type="password"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="رمز الأمان..."
              className="w-full text-center tracking-widest text-lg p-2.5 rounded-xl border border-slate-300 mt-4 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setActiveUnlockId(null)}
                className="w-1/2 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={verifyPasscode}
                className="w-1/2 py-2 rounded-xl bg-purple-900 text-white text-xs font-bold"
              >
                فك التشفير والعرض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Collateral Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">تسجيل أمانة تأمين جديدة (BR-03 & BR-05)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع التأمين / الضمان:</label>
                <select
                  value={colType}
                  onChange={(e) => setColType(e.target.value as CollateralType)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                >
                  <option value="CASH">نقدي (Cash) - إيداع صندوق</option>
                  <option value="GOLD">ذهب ومجوهرات (Gold) - رهن عيني</option>
                  <option value="WEAPON">سلاح مرخص (Weapon) - أمانة خاصة</option>
                  <option value="ID_DOCUMENT">وثيقة هوية وطنية / جواز سفر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العميل صاحب الأمانة:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                >
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {colType === 'CASH' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ التأمين النقدي (ر.س):</label>
                  <input
                    type="number"
                    value={colAmount}
                    onChange={(e) => setColAmount(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              )}

              {colType === 'GOLD' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-amber-950 mb-1">نوع القطعة الذهبية:</label>
                    <input
                      type="text"
                      value={goldType}
                      onChange={(e) => setGoldType(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">الوزن (جرام):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={goldWeight}
                      onChange={(e) => setGoldWeight(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">العيار:</label>
                    <select
                      value={goldKarat}
                      onChange={(e) => setGoldKarat(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                    >
                      <option value={18}>عيار 18</option>
                      <option value={21}>عيار 21 (المعتمد)</option>
                      <option value={24}>عيار 24 (خالص)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-amber-950 mb-1">القيمة التقديرية الحالية (ر.س):</label>
                    <input
                      type="number"
                      value={goldValuation}
                      onChange={(e) => setGoldValuation(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وسند الاستلام:</label>
                <textarea
                  rows={2}
                  value={colDescription}
                  onChange={(e) => setColDescription(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveCollateral}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-purple-950 font-bold text-xs"
              >
                حفظ وإصدار سند قبض الأمانة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaterals List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
          سجل الأمانات والضمانات العينية والنقدية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.collaterals.map((col) => {
            const isUnlocked = unlockedPhotos[col.id] || state.currentUser.role === 'OWNER';
            return (
              <div key={col.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {col.receiptNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      col.status === 'HELD' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {col.status === 'HELD' ? 'أمانة محتجزة' : 'تم الرد'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">
                    العميل: {col.customerName}
                  </h4>

                  <p className="text-[11px] text-slate-600 mt-1">
                    {col.description}
                  </p>

                  {col.type === 'GOLD' && (
                    <div className="mt-2 text-[11px] bg-amber-100/60 text-amber-950 p-2 rounded-lg font-semibold flex items-center justify-between">
                      <span>{col.goldType}</span>
                      <span>{col.goldWeightGrams} جرام - عيار {col.goldKarat} (قيمة: {col.goldEstimatedValue?.toLocaleString('ar-SA')} ر.س)</span>
                    </div>
                  )}

                  {col.type === 'CASH' && (
                    <div className="mt-2 text-[11px] bg-emerald-100/60 text-emerald-950 p-2 rounded-lg font-semibold flex items-center justify-between">
                      <span>مبلغ نقدي مقبوض</span>
                      <span className="font-bold">{col.amount?.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  )}

                  {/* Photo Preview / Encrypted Guard */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <span className="text-slate-500 font-medium">صورة الأمانة الموثقة:</span>
                      <button
                        onClick={() => handleUnlockPhotos(col.id)}
                        className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {isUnlocked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isUnlocked ? 'إخفاء الصورة' : 'معاينة مشفرة'}</span>
                      </button>
                    </div>

                    <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-900 flex items-center justify-center">
                      {isUnlocked ? (
                        <img src={col.photos[0]} alt="Collateral proof" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <Lock className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                          <span className="text-[10px] text-slate-300 block font-mono">ENCRYPTED (AES-256)</span>
                          <span className="text-[9px] text-slate-400">خاص بالمدير والمالك</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">تاريخ الاستلام: {col.receivedAt.split('T')[0]}</span>
                  {col.status === 'HELD' && (
                    <button
                      onClick={() => {
                        if (confirm(`هل تؤكد رد الأمانة بالكامل للعميل (${col.customerName}) بعد إغلاق العقد سليماً؟`)) {
                          onRefundCollateral(col.id);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 transition cursor-pointer"
                    >
                      رد الأمانة بالكامل ✅
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
