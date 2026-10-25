import React, { useState } from 'react';
import {
  Truck, ShoppingCart, CheckCircle2, Clock, AlertTriangle, Plus,
  FileText, ShieldCheck, DollarSign, Building2, Phone, Mail,
  Star, Check, ArrowRight, UserCheck, PackageCheck, Send
} from 'lucide-react';
import { Supplier, PurchaseOrder, PurchaseOrderItem, UserRole } from '../../types';
import { AppState } from '../../services/storageService';

interface SuppliersPurchasingViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserRole: UserRole;
}

export const SuppliersPurchasingView: React.FC<SuppliersPurchasingViewProps> = ({
  state,
  onUpdateState,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'POS' | 'SUPPLIERS' | 'PAYABLES'>('POS');
  const [showNewPoModal, setShowNewPoModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(state.purchaseOrders[0] || null);

  // New PO Form state
  const [poSupplierId, setPoSupplierId] = useState(state.suppliers[0]?.id || '');
  const [poDeliveryDate, setPoDeliveryDate] = useState('2026-11-10');
  const [poItemName, setPoItemName] = useState('قماش حرير إيطالي كوتور');
  const [poItemQty, setPoItemQty] = useState(30);
  const [poItemPrice, setPoItemPrice] = useState(190);
  const [poNotes, setPoNotes] = useState('');

  // New Supplier Form state
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState<'FABRICS' | 'ACCESSORIES' | 'EQUIPMENT'>('FABRICS');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supTax, setSupTax] = useState('');
  const [supCr, setSupCr] = useState('');
  const [supTerms, setSupTerms] = useState<'CASH' | 'NET_30' | 'NET_60'>('NET_30');
  const [supLimit, setSupLimit] = useState(40000);

  // Metrics
  const pendingApprovalCount = state.purchaseOrders.filter(p => p.status === 'DRAFT' && p.needsApproval).length;
  const totalPayables = state.suppliers.reduce((sum, s) => sum + s.currentBalance, 0);
  const totalPurchasesAmount = state.purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0);

  // Approve PO (Owner or GM only)
  const handleApprovePo = (poId: string) => {
    const isAuthorized = currentUserRole === 'OWNER' || currentUserRole === 'GENERAL_MANAGER';
    if (!isAuthorized) {
      alert('عذراً: اعتماد أوامر الشراء التي تتجاوز حد الاعتماد (5,000 ريال) يتطلب صلاحية المالك أو المدير العام فقط.');
      return;
    }

    const updatedOrders = state.purchaseOrders.map(po => {
      if (po.id === poId) {
        return {
          ...po,
          status: 'APPROVED' as const,
          approvedBy: state.currentUser.name,
          approvedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return po;
    });

    const newState: AppState = {
      ...state,
      purchaseOrders: updatedOrders,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'اعتماد أمر شراء',
          details: `تم اعتماد أمر الشراء ${selectedPo?.poNumber} بقيمة ${selectedPo?.totalAmount} ريال`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    const refreshed = updatedOrders.find(p => p.id === poId);
    if (refreshed) setSelectedPo(refreshed);
  };

  // Receive Goods & Post Journal Entry
  const handleReceiveGoods = (poId: string) => {
    const target = state.purchaseOrders.find(p => p.id === poId);
    if (!target) return;

    // 1. Mark PO Received
    const updatedOrders = state.purchaseOrders.map(p => {
      if (p.id === poId) {
        return { ...p, status: 'RECEIVED' as const };
      }
      return p;
    });

    // 2. Update Supplier Balance (Accounts Payable)
    const updatedSuppliers = state.suppliers.map(s => {
      if (s.id === target.supplierId) {
        return { ...s, currentBalance: s.currentBalance + target.totalAmount };
      }
      return s;
    });

    // 3. Post Double-Entry Journal Entry (Dr Inventory / Cr Accounts Payable)
    const newJournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: `JE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().slice(0, 10),
      description: `استلام بضاعة ومواد خام بموجب أمر الشراء ${target.poNumber} من المورد ${target.supplierName}`,
      referenceType: 'MANUAL' as const,
      referenceId: target.id,
      totalDebit: target.totalAmount,
      totalCredit: target.totalAmount,
      isPosted: true,
      createdBy: state.currentUser.id,
      createdAt: new Date().toISOString(),
      lines: [
        {
          accountId: '4',
          accountCode: '1155',
          accountNameAr: 'مخزون المواد الخام ومستلزمات الخياطة (Dr)',
          debit: target.subtotal,
          credit: 0,
          memo: `استلام خامات أمر شراء ${target.poNumber}`
        },
        {
          accountId: '12',
          accountCode: '2150',
          accountNameAr: 'ضريبة القيمة المضافة المدفوعة / مستحقة (Dr)',
          debit: target.taxAmount,
          credit: 0,
          memo: `ضريبة VAT 15% على المشتريات`
        },
        {
          accountId: '7',
          accountCode: '2110',
          accountNameAr: 'الذمم الدائنة - الموردون (Accounts Payable Cr)',
          debit: 0,
          credit: target.totalAmount,
          memo: `مستحقات ${target.supplierName} بموجب أمر ${target.poNumber}`
        }
      ]
    };

    const newState: AppState = {
      ...state,
      purchaseOrders: updatedOrders,
      suppliers: updatedSuppliers,
      journalEntries: [newJournalEntry, ...state.journalEntries],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'استلام بضاعة أمر شراء وترحيل قيد مالي',
          details: `تم استلام بضاعة ${target.poNumber} وتحديث المخزون وقيد الذمم الدائنة بقيمة ${target.totalAmount} ريال`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    const refreshed = updatedOrders.find(p => p.id === poId);
    if (refreshed) setSelectedPo(refreshed);
  };

  // Create PO
  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = state.suppliers.find(s => s.id === poSupplierId);
    const subtotal = poItemQty * poItemPrice;
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    const threshold = state.settings?.poApprovalThreshold || 5000;
    const needsApproval = total > threshold;

    const newPoNumber = `PO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: newPoNumber,
      supplierId: poSupplierId,
      supplierName: sup?.name || 'مورد عام',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: poDeliveryDate,
      branchId: 'br-1',
      items: [
        {
          id: `poi-${Date.now()}`,
          rawMaterialId: 'mat-custom',
          name: poItemName,
          quantity: Number(poItemQty),
          unit: 'متر',
          unitPrice: Number(poItemPrice),
          taxPercent: 15,
          subtotal: subtotal,
          total: total
        }
      ],
      subtotal: subtotal,
      taxAmount: vat,
      discountAmount: 0,
      totalAmount: total,
      status: 'DRAFT',
      paymentTerms: sup?.paymentTerms === 'NET_30' ? 'آجل 30 يوم' : 'نقداً',
      needsApproval: needsApproval,
      notes: poNotes || 'توريد خامات مستعجلة للمشغل.',
      createdAt: new Date().toISOString()
    };

    const newState: AppState = {
      ...state,
      purchaseOrders: [newPo, ...state.purchaseOrders],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'إنشاء أمر شراء',
          details: `تم إنشاء أمر الشراء ${newPoNumber} بإجمالي ${total} ريال (${needsApproval ? 'يتطلب اعتماد مدير' : 'معتمد تلقائياً'})`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    setSelectedPo(newPo);
    setShowNewPoModal(false);
  };

  // Create Supplier
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code: `SUP-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: supName,
      category: supCategory,
      contactPerson: supContact || 'المسؤول التجاري',
      phone: supPhone || '0500000000',
      email: supEmail || 'vendor@example.com',
      address: 'المملكة العربية السعودية',
      taxNumber: supTax || '310000000000003',
      crNumber: supCr || '1010000000',
      paymentTerms: supTerms,
      creditLimit: Number(supLimit),
      currentBalance: 0,
      rating: 5,
      status: 'ACTIVE'
    };

    const newState: AppState = {
      ...state,
      suppliers: [newSup, ...state.suppliers],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'إضافة مورد جديد',
          details: `تمت إضافة المورد ${newSup.name} في دليل الموردين المعتمدين.`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    setShowNewSupplierModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-purple-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-purple-950 font-bold shadow-lg shadow-amber-950/40">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-amber-300">وحدة الموردين والمشتريات (Suppliers & Purchasing)</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold">
                  Unit 7 — WAMAS v2.0
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1">
                دورة أوامر الشراء، فحص حدود الاعتماد، استلام البضاعة وتوليد قيود الذمم الدائنة والمخزون آلياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewPoModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              أمر شراء جديد (PO)
            </button>
            <button
              onClick={() => setShowNewSupplierModal(true)}
              className="px-4 py-2 bg-purple-800/80 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-purple-600/50 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              إضافة مورد
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-800/60">
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">أوامر شراء معلقة الاعتماد</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{pendingApprovalCount} أمر معلق</div>
          </div>
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">إجمالي الموردين المعتمدين</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">{state.suppliers.length} موردين</div>
          </div>
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">رصيد الذمم الدائنة للموردين (AP)</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{totalPayables.toLocaleString()} ريال</div>
          </div>
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">حد الاعتماد الإلزامي (BR-25)</div>
            <div className="text-xl font-bold text-teal-300 mt-1">{state.settings?.poApprovalThreshold || 5000} ريال</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('POS')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'POS'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          أوامر الشراء والتوريد (Purchase Orders)
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/40 text-amber-300 border border-amber-400/30">
            {state.purchaseOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'SUPPLIERS'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          دليل الموردين وبطاقات الشركات (Suppliers)
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/40 text-amber-300 border border-amber-400/30">
            {state.suppliers.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Purchase Orders Workflow */}
      {activeTab === 'POS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 text-sm">أوامر الشراء المسجلة</span>
              {state.purchaseOrders.map(po => {
                const isSelected = selectedPo?.id === po.id;
                return (
                  <div
                    key={po.id}
                    onClick={() => setSelectedPo(po)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 shadow-md ring-1 ring-purple-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-purple-950 bg-purple-100 px-2 py-0.5 rounded">
                            {po.poNumber}
                          </span>
                          {po.needsApproval && po.status === 'DRAFT' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-300">
                              يتطلب موافقة مدير
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{po.supplierName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">تاريخ الأمر: {po.orderDate} • تسليم متوقع: {po.expectedDeliveryDate}</p>
                      </div>

                      <div className="text-left">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-block ${
                          po.status === 'RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : po.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {po.status === 'RECEIVED' ? 'مستلم بالمستودع' : po.status === 'APPROVED' ? 'معتمد' : 'مسودة'}
                        </span>
                        <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                          {po.totalAmount.toLocaleString()} ريال
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected PO Details Card */}
          <div className="lg:col-span-7">
            {selectedPo ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-purple-100 text-purple-950 font-bold">
                        {selectedPo.poNumber}
                      </span>
                      <span className="text-xs text-slate-500">شروط الدفع: {selectedPo.paymentTerms}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedPo.supplierName}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedPo.notes}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {selectedPo.status === 'DRAFT' && (
                      <button
                        onClick={() => handleApprovePo(selectedPo.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        اعتماد أمر الشراء (BR-25)
                      </button>
                    )}

                    {selectedPo.status === 'APPROVED' && (
                      <button
                        onClick={() => handleReceiveGoods(selectedPo.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4" />
                        استلام البضاعة وقيد الذمم (BR-19)
                      </button>
                    )}

                    {selectedPo.status === 'RECEIVED' && (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        تم الاستلام وتحديث المخزون وقيد الذمم الدائنة
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2">بنود الشراء والأصناف المطلوبة</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">البند / المادة الخام</th>
                          <th className="p-2.5">الكمية</th>
                          <th className="p-2.5">سعر الوحدة</th>
                          <th className="p-2.5">ضريبة VAT</th>
                          <th className="p-2.5">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPo.items.map(item => (
                          <tr key={item.id}>
                            <td className="p-2.5 font-semibold text-slate-800">{item.name}</td>
                            <td className="p-2.5 font-mono">{item.quantity} {item.unit}</td>
                            <td className="p-2.5 font-mono">{item.unitPrice} ريال</td>
                            <td className="p-2.5 font-mono">15%</td>
                            <td className="p-2.5 font-mono font-bold text-slate-900">{item.total.toLocaleString()} ريال</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الفرعي (قبل الضريبة):</span>
                    <span className="font-mono font-semibold">{selectedPo.subtotal.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ضريبة القيمة المضافة (VAT 15%):</span>
                    <span className="font-mono font-semibold">{selectedPo.taxAmount.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                    <span>الإجمالي المستحق للمورد:</span>
                    <span className="font-mono text-purple-950 font-bold">{selectedPo.totalAmount.toLocaleString()} ريال</span>
                  </div>
                </div>

                {/* Audit Approval info */}
                {selectedPo.approvedBy && (
                  <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold">المعتمد:</span> {selectedPo.approvedBy}
                    </div>
                    <div>
                      <span className="font-bold">تاريخ الاعتماد:</span> {selectedPo.approvedAt}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                اختر أمر شراء لعرض التفاصيل
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers Directory */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {state.suppliers.map(sup => (
            <div key={sup.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-purple-950 bg-purple-100 px-2 py-0.5 rounded">
                    {sup.code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-1.5">{sup.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{sup.address}</p>
                </div>
                <div className="flex text-amber-500 text-xs">
                  {Array.from({ length: sup.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span>الشخص المسؤول:</span>
                  <span className="font-semibold text-slate-800">{sup.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span>الهاتف / واتساب:</span>
                  <span className="font-mono text-slate-800">{sup.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>الرقم الضريبي:</span>
                  <span className="font-mono text-slate-800">{sup.taxNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>السجل التجاري:</span>
                  <span className="font-mono text-slate-800">{sup.crNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>شروط الدفع:</span>
                  <span className="font-semibold text-purple-900">{sup.paymentTerms}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500">حد الائتمان:</span>
                  <div className="font-mono font-bold text-slate-800">{sup.creditLimit.toLocaleString()} ريال</div>
                </div>
                <div className="text-left">
                  <span className="text-slate-500">الرصيد الدائن المستحق:</span>
                  <div className="font-mono font-bold text-rose-700">{sup.currentBalance.toLocaleString()} ريال</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Purchase Order */}
      {showNewPoModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-800" />
                إنشاء أمر شراء وتوريد جديد (Purchase Order)
              </h3>
              <button
                onClick={() => setShowNewPoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">المورد المعتمد</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-semibold"
                >
                  {state.suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - {s.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الصنف أو المادة الخام</label>
                <input
                  type="text"
                  required
                  value={poItemName}
                  onChange={(e) => setPoItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الكمية المطلوبة</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poItemQty}
                    onChange={(e) => setPoItemQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">سعر الوحدة قبل الضريبة (ريال)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poItemPrice}
                    onChange={(e) => setPoItemPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">تاريخ التسليم المتوقع للمستودع</label>
                <input
                  type="date"
                  required
                  value={poDeliveryDate}
                  onChange={(e) => setPoDeliveryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              {/* Calculated Total preview & BR-25 Notice */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950">
                <div className="flex justify-between font-bold">
                  <span>الإجمالي مع ضريبة VAT (15%):</span>
                  <span className="font-mono text-sm">{((poItemQty * poItemPrice) * 1.15).toLocaleString()} ريال</span>
                </div>
                {((poItemQty * poItemPrice) * 1.15) > (state.settings?.poApprovalThreshold || 5000) && (
                  <p className="text-[11px] text-amber-800 font-semibold mt-1">
                    ⚠️ تنبيه قانوني: يتجاوز هذا الأمر حد الاعتماد ({state.settings?.poApprovalThreshold || 5000} ريال) وسيتطلب موافقة المدير العام قبل إرساله.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-amber-300 rounded-xl font-bold shadow-md cursor-pointer"
                >
                  حفظ أمر الشراء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Supplier */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                إضافة مورد جديد
              </h3>
              <button
                onClick={() => setShowNewSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم المورد / الشركة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة الحرير الإيطالي"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  >
                    <option value="FABRICS">أقمشة وحرير</option>
                    <option value="ACCESSORIES">إكسسوارات وكريستال</option>
                    <option value="EQUIPMENT">معدات وكوش</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">شروط الدفع</label>
                  <select
                    value={supTerms}
                    onChange={(e) => setSupTerms(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  >
                    <option value="NET_30">آجل 30 يوم</option>
                    <option value="NET_60">آجل 60 يوم</option>
                    <option value="CASH">نقداً فوري</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الشخص المسؤول</label>
                  <input
                    type="text"
                    placeholder="الاسم"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="05xxxxxxxx"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرقم الضريبي</label>
                  <input
                    type="text"
                    placeholder="310xxxxxxxxxx03"
                    value={supTax}
                    onChange={(e) => setSupTax(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">السجل التجاري</label>
                  <input
                    type="text"
                    placeholder="1010xxxxxx"
                    value={supCr}
                    onChange={(e) => setSupCr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSupplierModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-amber-300 rounded-xl font-bold shadow-md cursor-pointer"
                >
                  إضافة المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
