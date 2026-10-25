import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2, 
  Plus, Search, ChevronRight, ChevronLeft, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { BookingConflictService, ConflictCheckResult } from '../../services/bookingConflictService';
import { Booking, BookingItem, ProductUnit, Product, Customer } from '../../types';

interface BookingCalendarViewProps {
  state: AppState;
  onSaveBooking: (newBooking: Booking, updatedUnit: ProductUnit) => void;
  onSelectBooking?: (booking: Booking) => void;
}

export const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({
  state,
  onSaveBooking
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(state.products[0]?.id || '');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-11-15');
  const [endDate, setEndDate] = useState<string>('2026-11-18');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(state.customers[0]?.id || '');
  const [conflictResult, setConflictResult] = useState<ConflictCheckResult | null>(null);

  // Filter state for calendar
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const selectedProduct = state.products.find(p => p.id === selectedProductId);
  const unitsForProduct = state.units.filter(u => u.productId === selectedProductId);
  const currentUnit = state.units.find(u => u.id === selectedUnitId) || unitsForProduct[0];

  // Perform real-time conflict & 48h buffer validation
  const runConflictCheck = (unitToTest: ProductUnit, start: string, end: string) => {
    if (!unitToTest || !selectedProduct) return;
    const res = BookingConflictService.checkAvailability(
      unitToTest,
      start,
      end,
      state.bookings,
      state.units,
      selectedProduct.nameAr
    );
    setConflictResult(res);
  };

  const handleStartBookingWizard = () => {
    setShowWizard(true);
    if (unitsForProduct.length > 0) {
      setSelectedUnitId(unitsForProduct[0].id);
      runConflictCheck(unitsForProduct[0], startDate, endDate);
    }
  };

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = state.units.find(u => u.id === unitId);
    if (unit) {
      runConflictCheck(unit, startDate, endDate);
    }
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (currentUnit) {
      runConflictCheck(currentUnit, start, end);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedProduct || !currentUnit) return;
    if (conflictResult?.hasConflict) {
      alert('لا يمكن إتمام الحجز بسبب وجود تعارض زمني أو خرق لهامش 48 ساعة الإجباري!');
      return;
    }

    const customer = state.customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    // Calculate dates & amounts
    const diffDays = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)));
    const totalRent = selectedProduct.rentalPriceDaily * diffDays;
    const depositRequired = Math.round(totalRent * 0.25); // >= 25%
    const collateralRequired = Math.round(totalRent * 0.30); // >= 30%

    const newBookingNumber = `BOOK-2026-${String(state.bookings.length + 101).padStart(4, '0')}`;
    const newBookingItem: BookingItem = {
      id: `bi-${Date.now()}`,
      bookingId: `bk-${Date.now()}`,
      productId: selectedProduct.id,
      productUnitId: currentUnit.id,
      unitSerialNumber: currentUnit.serialNumber,
      productName: selectedProduct.nameAr,
      rentalPrice: totalRent,
      collateralAmount: collateralRequired,
      startDate,
      endDate,
      bufferStartDate: new Date(new Date(startDate).getTime() - 48 * 3600 * 1000).toISOString().split('T')[0],
      bufferEndDate: new Date(new Date(endDate).getTime() + 48 * 3600 * 1000).toISOString().split('T')[0]
    };

    const newBooking: Booking = {
      id: newBookingItem.bookingId,
      bookingNumber: newBookingNumber,
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      items: [newBookingItem],
      startDate,
      endDate,
      status: 'CONFIRMED', // Paid deposit in wizard
      totalRentAmount: totalRent,
      discountAmount: 0,
      taxAmount: Math.round(totalRent * 0.15),
      depositRequired,
      depositPaid: depositRequired,
      depositPaymentDate: new Date().toISOString().split('T')[0],
      collateralRequired,
      collateralPaid: 0,
      versionNumber: 1,
      createdAt: new Date().toISOString(),
      createdBy: state.currentUser.id
    };

    const updatedUnit: ProductUnit = {
      ...currentUnit,
      status: 'BOOKED',
      currentBookingId: newBooking.id
    };

    onSaveBooking(newBooking, updatedUnit);
    setShowWizard(false);
    alert(`تم تأكيد الحجز بنجاح برقم (${newBookingNumber}) وتوليد مهمة تجهيز وخياطة تلقائياً للمشغل!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">محرك الحجوزات والتقويم التفاعلي</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              Anti-Double Booking Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            فحص التعارض الزمني الرياضي مع هامش الأمان الإجباري (48 ساعة غسيل وتعقيم قبل وبعد كل حجز)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartBookingWizard}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-amber-300 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer border border-amber-400/40"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            معالج الحجز السريع الذكي (3 خطوات)
          </button>
        </div>
      </div>

      {/* 3-Step Rapid Booking Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">معالج الحجز الذكي وفحص التعارض الآني</h3>
                  <span className="text-[11px] text-slate-500">خوارزمية التحقق الصارم من التداخل الزمني و 48-Hour Buffer</span>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              
              {/* Step 1: Product & Unit Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. اختيار الصنف / الفستان / الكوشة:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const units = state.units.filter(u => u.productId === e.target.value);
                    if (units.length > 0) {
                      setSelectedUnitId(units[0].id);
                      runConflictCheck(units[0], startDate, endDate);
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  {state.products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr} ({p.sku}) — {p.rentalPriceDaily} ر.س/يوم
                    </option>
                  ))}
                </select>
              </div>

              {/* Units for this product */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  القطعة المادية الفردية المحددة (Serial / Unit):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {unitsForProduct.map(u => {
                    const isSelected = u.id === (selectedUnitId || currentUnit?.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => handleUnitChange(u.id)}
                        className={`p-2.5 rounded-xl text-xs text-right border transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900 text-white border-purple-950 font-bold shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-semibold truncate">{u.serialNumber}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">الحالة: {u.status} | المقاس: {u.size}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Date Picking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. تاريخ بدء الحجز (الاستلام):
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange(e.target.value, endDate)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                  />
                  <span className="text-[10px] text-purple-700 block mt-1">هامش التجهيز يبدأ قبل 48 ساعة</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    تاريخ انتهاء الحجز (الإرجاع):
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange(startDate, e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                  />
                  <span className="text-[10px] text-purple-700 block mt-1">هامش الغسيل يستمر بعد 48 ساعة</span>
                </div>
              </div>

              {/* Conflict Status Banner */}
              {conflictResult && (
                <div className={`p-4 rounded-xl border text-xs transition ${
                  conflictResult.hasConflict 
                    ? 'bg-rose-50 border-rose-300 text-rose-900' 
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {conflictResult.hasConflict ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {conflictResult.hasConflict ? 'تعارض حجز غير مسموح به!' : 'التاريخ متاح بالكامل ومطابق لهامش الأمان'}
                      </div>
                      <p className="mt-1 leading-relaxed">{conflictResult.message}</p>

                      {/* Alternatives suggestion */}
                      {conflictResult.hasConflict && conflictResult.alternativeUnits.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-rose-200">
                          <span className="font-bold text-rose-950 block mb-1.5">
                            💡 البدائل المتاحة المقترحة لنفس المقاس والفترة:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {conflictResult.alternativeUnits.map(alt => (
                              <button
                                key={alt.unitId}
                                onClick={() => handleUnitChange(alt.unitId)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 font-bold text-[11px] transition cursor-pointer"
                              >
                                اختر البديل: {alt.serialNumber} ({alt.size})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Customer and Deposit */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. اختيار العميل والمناسبة:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                >
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} — {c.phone} ({c.classification === 'VIP' ? 'عميل VIP ⭐' : 'عادي'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary Financial Calculation */}
              {selectedProduct && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-purple-700 block">العربون الإجباري المطلوب (≥25%)</span>
                    <span className="font-extrabold text-sm text-purple-900">
                      {Math.round(selectedProduct.rentalPriceDaily * 0.25).toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-purple-700 block">التأمين المطلوب عند التسليم (≥30%)</span>
                    <span className="font-extrabold text-sm text-amber-700">
                      {Math.round(selectedProduct.rentalPriceDaily * 0.30).toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-purple-700 block">إجمالي سعر التأجير</span>
                    <span className="font-extrabold text-sm text-purple-900">
                      {selectedProduct.rentalPriceDaily.toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={conflictResult?.hasConflict}
                onClick={handleConfirmBooking}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 ${
                  conflictResult?.hasConflict
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-900 to-indigo-900 text-amber-300 hover:from-purple-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                تأكيد الحجز وتوليد مهمة التجهيز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List and Calendar Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-900" />
            <h3 className="font-bold text-sm text-slate-900">جدول الحجوزات والمناسبات المؤكدة</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">فلترة بالحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 text-slate-700"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="CONFIRMED">مؤكد</option>
              <option value="DELIVERED">مُسلَّم</option>
              <option value="RETURNED">مُعاد</option>
              <option value="LATE">متأخر</option>
            </select>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {state.bookings.map((booking) => {
            const item = booking.items[0];
            return (
              <div key={booking.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {booking.status === 'DELIVERED' ? '👗' : '📅'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{booking.bookingNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        booking.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'RETURNED' ? 'bg-amber-100 text-amber-800' :
                        booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      العميل: {booking.customerName} | الهاتف: {booking.customerPhone}
                    </p>
                    <p className="text-xs text-purple-900 font-semibold mt-0.5">
                      الصنف: {item?.productName} ({item?.unitSerialNumber})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 text-xs text-slate-500">
                  <div>
                    <span className="block text-[11px] text-slate-400">فترة الاستخدام:</span>
                    <span className="font-bold text-slate-800">{booking.startDate} إلى {booking.endDate}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">العربون المدفوع:</span>
                    <span className="font-bold text-emerald-700">{booking.depositPaid.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">إجمالي العقد:</span>
                    <span className="font-bold text-purple-950">{booking.totalRentAmount.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
