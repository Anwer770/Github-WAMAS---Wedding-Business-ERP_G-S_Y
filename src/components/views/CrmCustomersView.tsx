import React, { useState } from 'react';
import { 
  Users, Ruler, Plus, Calendar, Phone, Award, 
  FileText, CheckCircle2, Search, Edit3
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { Customer, CustomerMeasurements } from '../../types';

interface CrmCustomersProps {
  state: AppState;
  onAddCustomer: (customer: Customer) => void;
  onUpdateMeasurements: (customerId: string, measurements: CustomerMeasurements) => void;
}

export const CrmCustomersView: React.FC<CrmCustomersProps> = ({
  state,
  onAddCustomer,
  onUpdateMeasurements
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(state.customers[0]?.id || '');
  const selectedCustomer = state.customers.find(c => c.id === selectedCustomerId) || state.customers[0];

  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [eventType, setEventType] = useState<'WEDDING' | 'ENGAGEMENT' | 'HENNA' | 'EVENING'>('WEDDING');
  const [isVip, setIsVip] = useState(false);

  // Measurement editor
  const [bust, setBust] = useState(selectedCustomer?.measurements?.bust || 90);
  const [waist, setWaist] = useState(selectedCustomer?.measurements?.waist || 68);
  const [hips, setHips] = useState(selectedCustomer?.measurements?.hips || 96);
  const [hollowToHem, setHollowToHem] = useState(selectedCustomer?.measurements?.hollowToHem || 145);
  const [shoulderWidth, setShoulderWidth] = useState(selectedCustomer?.measurements?.shoulderWidth || 38);
  const [heelHeight, setHeelHeight] = useState(selectedCustomer?.measurements?.heelHeight || 8);
  const [sizeLabel, setSizeLabel] = useState(selectedCustomer?.measurements?.sizeLabel || '38 (M)');
  const [tailorNotes, setTailorNotes] = useState(selectedCustomer?.measurements?.tailorNotes || '');

  const handleSaveMeasurements = () => {
    if (!selectedCustomer) return;
    const m: CustomerMeasurements = {
      bust, waist, hips, hollowToHem, shoulderWidth, heelHeight, sizeLabel, tailorNotes
    };
    onUpdateMeasurements(selectedCustomer.id, m);
    alert('تم تحديث جدول مقاسات العميل والملاحظات المشغلية بنجاح!');
  };

  const handleSaveCustomer = () => {
    if (!fullName || !phone) {
      alert('الرجاء إدخال اسم العميل ورقم الهاتف');
      return;
    }
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      fullName,
      phone,
      whatsapp: phone,
      nationalId: nationalId || '1029384756',
      idDocumentType: 'NATIONAL_ID',
      eventDate,
      eventType,
      classification: isVip ? 'VIP' : 'NORMAL',
      createdAt: new Date().toISOString().split('T')[0],
      measurements: {
        bust: 90, waist: 70, hips: 96, hollowToHem: 142, shoulderWidth: 38, heelHeight: 8,
        sizeLabel: '38 (M)', tailorNotes: 'قياس أولي مبدئي'
      }
    };
    onAddCustomer(newCust);
    setShowAddModal(false);
    setSelectedCustomerId(newCust.id);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">إدارة علاقات العملاء والمقاسات الدقيقة (CRM)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              ملفات العرائس وجدول الـ 8 قياسات
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل بيانات العميل، المناسبة، الهوية الوطنية، ومقاسات الخياطة الدقيقة بالسنتيمتر للفساتين والكوتور
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          إضافة عميل / عروس جديدة
        </button>
      </div>

      {/* Main CRM Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customers Directory */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-900" />
            دليل العملاء ({state.customers.length})
          </h3>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {state.customers.map((c) => {
              const isSelected = c.id === selectedCustomer?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    if (c.measurements) {
                      setBust(c.measurements.bust);
                      setWaist(c.measurements.waist);
                      setHips(c.measurements.hips);
                      setHollowToHem(c.measurements.hollowToHem);
                      setShoulderWidth(c.measurements.shoulderWidth);
                      setHeelHeight(c.measurements.heelHeight);
                      setSizeLabel(c.measurements.sizeLabel);
                      setTailorNotes(c.measurements.tailorNotes || '');
                    }
                  }}
                  className={`w-full p-3 rounded-xl border text-right transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-950 font-bold shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs leading-snug">{c.fullName}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{c.phone} | مناسبة: {c.eventType}</div>
                  </div>
                  {c.classification === 'VIP' && (
                    <span className="text-[10px] bg-amber-400 text-purple-950 font-black px-2 py-0.5 rounded-full">
                      VIP ⭐
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8-Point Accurate Measurements Card */}
        {selectedCustomer && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-purple-900" />
                <h3 className="font-bold text-sm text-slate-900">
                  جدول المقاسات الدقيق للخياط — {selectedCustomer.fullName}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">تاريخ المناسبة: {selectedCustomer.eventDate}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block text-[11px] font-bold text-purple-900 mb-1">محيط الصدر (Bust):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={bust}
                    onChange={(e) => setBust(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg border border-purple-300 bg-white font-bold"
                  />
                  <span className="text-xs text-purple-800">سم</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block text-[11px] font-bold text-purple-900 mb-1">محيط الخصر (Waist):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg border border-purple-300 bg-white font-bold"
                  />
                  <span className="text-xs text-purple-800">سم</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block text-[11px] font-bold text-purple-900 mb-1">محيط الأرداف (Hips):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={hips}
                    onChange={(e) => setHips(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg border border-purple-300 bg-white font-bold"
                  />
                  <span className="text-xs text-purple-800">سم</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block text-[11px] font-bold text-purple-900 mb-1">من الكتف للأرض (Hollow):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={hollowToHem}
                    onChange={(e) => setHollowToHem(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg border border-purple-300 bg-white font-bold"
                  />
                  <span className="text-xs text-purple-800">سم</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block text-[11px] font-bold text-purple-900 mb-1">الكتف إلى الكتف:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={shoulderWidth}
                    onChange={(e) => setShoulderWidth(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg border border-purple-300 bg-white font-bold"
                  />
                  <span className="text-xs text-purple-800">سم</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block text-[11px] font-bold text-purple-900 mb-1">ارتفاع الكعب (Heel):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={heelHeight}
                    onChange={(e) => setHeelHeight(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg border border-purple-300 bg-white font-bold"
                  />
                  <span className="text-xs text-purple-800">سم</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ملاحظات الخياطة وتعديلات البروفة:
              </label>
              <textarea
                rows={3}
                value={tailorNotes}
                onChange={(e) => setTailorNotes(e.target.value)}
                placeholder="تضييق خصر، رفع أطراف، تركيب مشابك خفية..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveMeasurements}
                className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                حفظ وتحديث المقاسات في ملف العميل
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">إضافة ملف عميل جديد</h3>
            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المناسبة:</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vipCheck"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="vipCheck" className="text-xs font-bold text-amber-900">تصنيف كعميل VIP ⭐</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl text-xs">إلغاء</button>
              <button onClick={handleSaveCustomer} className="px-4 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold">حفظ العميل</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
