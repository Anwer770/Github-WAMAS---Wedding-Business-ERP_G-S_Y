import React, { useState } from 'react';
import {
  Scissors, Factory, CheckCircle2, Clock, AlertTriangle, Plus,
  Layers, PackageCheck, Ruler, ArrowRight, ShieldCheck, DollarSign,
  User, Calendar, FileText, ChevronRight, Sparkles, Filter, Check
} from 'lucide-react';
import {
  ManufacturingOrder, JobOrder, BillOfMaterialItem,
  ProductionStageRecord, UserRole
} from '../../types';
import { AppState } from '../../services/storageService';

interface ManufacturingViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserRole: UserRole;
}

export const ManufacturingView: React.FC<ManufacturingViewProps> = ({
  state,
  onUpdateState,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'MO' | 'JO' | 'BOM'>('MO');
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(
    state.manufacturingOrders[0] || null
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showNewMoModal, setShowNewMoModal] = useState<boolean>(false);
  const [showNewJoModal, setShowNewJoModal] = useState<boolean>(false);

  // New MO Form state
  const [newMoTitle, setNewMoTitle] = useState('');
  const [newMoSku, setNewMoSku] = useState('');
  const [newMoSpecs, setNewMoSpecs] = useState('');
  const [newMoEndDate, setNewMoEndDate] = useState('2026-11-15');
  const [newMoPriority, setNewMoPriority] = useState<'URGENT' | 'HIGH' | 'NORMAL'>('HIGH');
  const [newMoTailor, setNewMoTailor] = useState('المعلم رضوان خان');

  // New JO Form state
  const [newJoUnit, setNewJoUnit] = useState(state.units[0]?.serialNumber || '');
  const [newJoType, setNewJoType] = useState<'SIZE_ALTERATION' | 'DAMAGE_REPAIR' | 'REFURBISHMENT'>('SIZE_ALTERATION');
  const [newJoSpecs, setNewJoSpecs] = useState('');
  const [newJoHours, setNewJoHours] = useState(3);
  const [newJoCost, setNewJoCost] = useState(200);

  // Filtered MOs
  const filteredMos = state.manufacturingOrders.filter(mo => {
    if (statusFilter === 'ALL') return true;
    return mo.status === statusFilter;
  });

  // Calculate Metrics
  const activeMosCount = state.manufacturingOrders.filter(m => m.status === 'IN_PROGRESS' || m.status === 'CONFIRMED').length;
  const activeJosCount = state.jobOrders.filter(j => j.status === 'IN_PROGRESS' || j.status === 'PENDING').length;
  const totalMoCost = state.manufacturingOrders.reduce((sum, m) => sum + m.totalCost, 0);

  // Handle Complete Stage
  const handleAdvanceStage = (moId: string, stageNumber: number) => {
    const updatedOrders = state.manufacturingOrders.map(mo => {
      if (mo.id !== moId) return mo;
      const updatedStages = mo.stages.map(st => {
        if (st.stageNumber === stageNumber) {
          return {
            ...st,
            completionPercent: 100,
            completedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          };
        }
        return st;
      });
      // Check if all stages are 100%
      const allComplete = updatedStages.every(s => s.completionPercent === 100);
      return {
        ...mo,
        stages: updatedStages,
        status: allComplete ? 'QUALITY_CHECK' : mo.status
      };
    });

    const newState: AppState = {
      ...state,
      manufacturingOrders: updatedOrders,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'تحديث مرحلة تصنيع',
          details: `تم إكمال المرحلة رقم ${stageNumber} لأمر التصنيع ${selectedOrder?.orderNumber}`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    if (selectedOrder && selectedOrder.id === moId) {
      const refreshed = updatedOrders.find(m => m.id === moId);
      if (refreshed) setSelectedOrder(refreshed);
    }
  };

  // Complete Manufacturing Order
  const handleCompleteOrder = (moId: string) => {
    const target = state.manufacturingOrders.find(m => m.id === moId);
    if (!target) return;

    // 1. Mark MO Completed
    const updatedOrders = state.manufacturingOrders.map(m => {
      if (m.id === moId) {
        return {
          ...m,
          status: 'COMPLETED' as const,
          completedAt: new Date().toISOString().slice(0, 10)
        };
      }
      return m;
    });

    // 2. Add New Product Unit to Inventory
    const newUnit = {
      id: `u-${Date.now()}`,
      productId: target.outputProductId || 'prod-1',
      serialNumber: `${target.outputProductSku}-SN01`,
      size: 'Custom M (عروس)',
      color: 'أبيض لؤلؤي ناصع',
      status: 'AVAILABLE' as const,
      warehouseLocation: 'الفرع الرئيسي - الجناح الملكي',
      conditionNotes: `تم تصنيعه بأمر شغل ${target.orderNumber} بجودة ممتازة كوتور.`
    };

    // 3. Automated Double-Entry Journal Entry (Dr Inventory Finished Goods / Cr Manufacturing Costs)
    const newJournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: `JE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().slice(0, 10),
      description: `قيد اكتمال تصنيع ${target.outputProductName} وإضافته للمخزون - أمر ${target.orderNumber}`,
      referenceType: 'MANUAL' as const,
      referenceId: target.id,
      totalDebit: target.totalCost,
      totalCredit: target.totalCost,
      isPosted: true,
      createdBy: state.currentUser.id,
      createdAt: new Date().toISOString(),
      lines: [
        {
          accountId: '3',
          accountCode: '1151',
          accountNameAr: 'مخزون فساتين الزفاف (أصول)',
          debit: target.totalCost,
          credit: 0,
          memo: `إضافة منتج تام تكلفة إجمالية ${target.totalCost} ريال`
        },
        {
          accountId: '8',
          accountCode: '5200',
          accountNameAr: 'تكاليف التصنيع ومواد خام (Cr)',
          debit: 0,
          credit: target.totalCost,
          memo: `استيعاب تكاليف تصنيع أمر ${target.orderNumber}`
        }
      ]
    };

    const newState: AppState = {
      ...state,
      manufacturingOrders: updatedOrders,
      units: [newUnit, ...state.units],
      journalEntries: [newJournalEntry, ...state.journalEntries],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'إكمال أمر تصنيع وإضافة للمخزون',
          details: `تم إكمال أمر التصنيع ${target.orderNumber} وإنشاء قيد مالي بقيمة ${target.totalCost} ريال وإضافة القطعة للمخزون.`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    const refreshed = updatedOrders.find(m => m.id === moId);
    if (refreshed) setSelectedOrder(refreshed);
  };

  // Create New MO
  const handleCreateMo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMoTitle) return;

    const newMoNumber = `MO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newMo: ManufacturingOrder = {
      id: `mo-${Date.now()}`,
      orderNumber: newMoNumber,
      type: 'DRESS',
      outputProductId: 'prod-1',
      outputProductName: newMoTitle,
      outputProductSku: newMoSku || 'WD-NEW-CUSTOM',
      quantity: 1,
      customerSpecs: newMoSpecs || 'تفصيل ملكي مخصص حسب جدول مقاسات العميل المعتمد.',
      startDate: new Date().toISOString().slice(0, 10),
      targetEndDate: newMoEndDate,
      priority: newMoPriority,
      status: 'CONFIRMED',
      assignedToName: newMoTailor,
      branchName: 'الفرع الرئيسي - مشغل الكوتور',
      bom: [
        {
          id: `bom-${Date.now()}-1`,
          rawMaterialId: 'mat-1',
          rawMaterialName: 'قماش ميكادو حرير طبيعي ناصع البياض',
          requiredQuantity: 10,
          unit: 'متر',
          costPerUnit: 180,
          availableStock: 25,
          status: 'AVAILABLE',
          isReserved: true // Auto-reserves stock upon confirmation!
        },
        {
          id: `bom-${Date.now()}-2`,
          rawMaterialId: 'mat-2',
          rawMaterialName: 'دانتيل فرنسي كوتور مطرز',
          requiredQuantity: 5,
          unit: 'متر',
          costPerUnit: 320,
          availableStock: 14,
          status: 'AVAILABLE',
          isReserved: true
        }
      ],
      stages: [
        { stageNumber: 1, stageNameAr: 'قص الأقمشة والبطانة', supervisor: newMoTailor, dueDate: '2026-11-05', completionPercent: 0, laborCost: 350 },
        { stageNumber: 2, stageNameAr: 'الخياطة الأولية وتجميع الكورسيه', supervisor: newMoTailor, dueDate: '2026-11-08', completionPercent: 0, laborCost: 750 },
        { stageNumber: 3, stageNameAr: 'التطريز اليدوي وتثبيت الكريستال', supervisor: 'مختصة الزينة ليلى', dueDate: '2026-11-12', completionPercent: 0, laborCost: 1100 },
        { stageNumber: 4, stageNameAr: 'الكي البخاري والتشطيب النهائي', supervisor: 'فني التشطيب حسام', dueDate: '2026-11-13', completionPercent: 0, laborCost: 250 },
        { stageNumber: 5, stageNameAr: 'فحص الجودة والمقاسات بالمانيكان', supervisor: 'سارة القحطاني', dueDate: '2026-11-14', completionPercent: 0, laborCost: 150 },
        { stageNumber: 6, stageNameAr: 'التغليف الواقي والتعليق بصندوق مخملي', supervisor: 'طارق العسيري', dueDate: '2026-11-15', completionPercent: 0, laborCost: 100 }
      ],
      rawMaterialsCost: 3400,
      laborCost: 2650,
      overheadCost: 550,
      totalCost: 6600,
      createdAt: new Date().toISOString()
    };

    const newState: AppState = {
      ...state,
      manufacturingOrders: [newMo, ...state.manufacturingOrders],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'إنشاء أمر تصنيع وحجز مواد خام',
          details: `تم إنشاء أمر التصنيع ${newMoNumber} وحجز أقمشة الميكادو والدانتيل تلقائياً من المخزون.`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    setSelectedOrder(newMo);
    setShowNewMoModal(false);
  };

  // Create New JO
  const handleCreateJo = (e: React.FormEvent) => {
    e.preventDefault();
    const newJoNumber = `JO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const matchedUnit = state.units.find(u => u.serialNumber === newJoUnit);
    const newJo: JobOrder = {
      id: `jo-${Date.now()}`,
      orderNumber: newJoNumber,
      type: newJoType,
      productUnitId: matchedUnit?.id || 'u-1',
      productUnitSerial: newJoUnit,
      productName: state.products.find(p => p.id === matchedUnit?.productId)?.nameAr || 'فستان زفاف كوتور',
      specs: newJoSpecs || 'تعديل وتضييق مقاسات حسب بروفة العروس.',
      materialsConsumed: 'خيوط حريرية + سحاب كوتور',
      laborHours: Number(newJoHours),
      totalCost: Number(newJoCost),
      assignedTailor: 'المعلم رضوان خان',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString()
    };

    const newState: AppState = {
      ...state,
      jobOrders: [newJo, ...state.jobOrders],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'إنشاء أمر شغل تعديل',
          details: `تم إنشاء أمر الشغل ${newJoNumber} للقطعة ${newJoUnit}`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    setShowNewJoModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-purple-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-purple-950 font-bold shadow-lg shadow-amber-950/40">
              <Factory className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-amber-300">وحدة التصنيع وأوامر الشغل (Manufacturing & Alterations)</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold">
                  Unit 6 — WAMAS v2.0
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1">
                إدارة أوامر تصنيع الفساتين والكوش، قوائم المواد (BOM)، مراحل الإنتاج الـ 6، وتكاليف العمالة والتشطيب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewMoModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              أمر تصنيع جديد (MO)
            </button>
            <button
              onClick={() => setShowNewJoModal(true)}
              className="px-4 py-2 bg-purple-800/80 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-purple-600/50 transition cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-amber-300" />
              أمر شغل وتعديل (JO)
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-800/60">
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">أوامر تصنيع جارية (MO)</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{activeMosCount} أمر نشط</div>
          </div>
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">أوامر شغل وتعديل (JO)</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">{activeJosCount} طلبات مشغل</div>
          </div>
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">إجمالي تكاليف التصنيع الملتزم بها</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{totalMoCost.toLocaleString()} ريال</div>
          </div>
          <div className="bg-purple-900/50 backdrop-blur rounded-xl p-3.5 border border-purple-700/50">
            <div className="text-xs text-purple-200/70">حجز المواد الخام التلقائي</div>
            <div className="text-xl font-bold text-teal-300 mt-1">مفعل 100% (BOM Locked)</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('MO')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'MO'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Factory className="w-4 h-4" />
          أوامر التصنيع الكاملة (MO)
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/40 text-amber-300 border border-amber-400/30">
            {state.manufacturingOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('JO')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'JO'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Scissors className="w-4 h-4" />
          أوامر الشغل والتعديلات (Job Orders)
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/40 text-amber-300 border border-amber-400/30">
            {state.jobOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('BOM')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'BOM'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          قوائم المواد الخام (BOM Architecture)
        </button>
      </div>

      {/* TAB 1: MO Orders View with Master-Detail Layout */}
      {activeTab === 'MO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: MO Orders List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-bold text-slate-800 text-sm">قائمة أوامر التصنيع</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
                >
                  <option value="ALL">جميع الحالات</option>
                  <option value="CONFIRMED">مؤكد (CONFIRMED)</option>
                  <option value="IN_PROGRESS">قيد التنفيذ (IN_PROGRESS)</option>
                  <option value="QUALITY_CHECK">فحص جودة (QUALITY_CHECK)</option>
                  <option value="COMPLETED">مكتمل (COMPLETED)</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredMos.map(mo => {
                  const isSelected = selectedOrder?.id === mo.id;
                  const completedStagesCount = mo.stages.filter(s => s.completionPercent === 100).length;
                  const progress = Math.round((completedStagesCount / mo.stages.length) * 100);

                  return (
                    <div
                      key={mo.id}
                      onClick={() => setSelectedOrder(mo)}
                      className={`p-4 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/60 shadow-md ring-1 ring-purple-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                              {mo.orderNumber}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              mo.priority === 'URGENT'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : mo.priority === 'HIGH'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {mo.priority === 'URGENT' ? 'عاجل جداً' : mo.priority === 'HIGH' ? 'أولوية عالية' : 'عادي'}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1.5">{mo.outputProductName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            المسؤول: {mo.assignedToName}
                          </p>
                        </div>

                        <div className="text-left">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${
                            mo.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : mo.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {mo.status === 'COMPLETED' ? 'مكتمل ومسلَّم' : mo.status === 'IN_PROGRESS' ? 'قيد الخياطة' : mo.status}
                          </span>
                          <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                            {mo.totalCost.toLocaleString()} ريال
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>مراحل الإنتاج ({completedStagesCount} من {mo.stages.length})</span>
                          <span className="font-bold text-purple-800">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Selected MO Detail & 6 Stages Stepper */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                {/* Header details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        {selectedOrder.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500">تاريخ البدء: {selectedOrder.startDate}</span>
                      <span className="text-xs text-rose-600 font-medium">موعد التسليم: {selectedOrder.targetEndDate}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedOrder.outputProductName}</h3>
                    <p className="text-xs text-slate-600 mt-1">{selectedOrder.customerSpecs}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedOrder.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleCompleteOrder(selectedOrder.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4" />
                        اكتمال وإضافة للمخزون
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        مكتمل وقيد مالي مرحَّل
                      </span>
                    )}
                  </div>
                </div>

                {/* Bill of Materials (BOM) Quick Table */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-700" />
                    المواد الخام المحجوزة من المخزون (Bill of Materials - BOM)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">المادة الخام</th>
                          <th className="p-2.5">الكمية المطلوبة</th>
                          <th className="p-2.5">سعر الوحدة</th>
                          <th className="p-2.5">الإجمالي</th>
                          <th className="p-2.5 text-center">حالة الحجز</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.bom.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-slate-800">{item.rawMaterialName}</td>
                            <td className="p-2.5 font-mono">{item.requiredQuantity} {item.unit}</td>
                            <td className="p-2.5 font-mono">{item.costPerUnit} ريال</td>
                            <td className="p-2.5 font-mono font-bold text-slate-900">
                              {(item.requiredQuantity * item.costPerUnit).toLocaleString()} ريال
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                محجوز تلقائياً
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6 Production Stages Stepper */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-amber-600" />
                      مراحل التصنيع الـ 6 الإلزامية (Production Pipeline)
                    </span>
                    <span className="text-xs font-normal text-slate-500">
                      كل مرحلة موثقة بالمسؤول وتكلفة ساعات العمل
                    </span>
                  </h4>

                  <div className="space-y-3">
                    {selectedOrder.stages.map((stage) => {
                      const isDone = stage.completionPercent === 100;

                      return (
                        <div
                          key={stage.stageNumber}
                          className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ${
                            isDone
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {isDone ? <Check className="w-4 h-4" /> : stage.stageNumber}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                {stage.stageNameAr}
                                {isDone && (
                                  <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                                    مكتمل {stage.completedAt ? `(${stage.completedAt})` : ''}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                المسؤول: <span className="font-semibold text-slate-700">{stage.supervisor}</span> • موعد الإنجاز: {stage.dueDate}
                                {stage.notes ? ` • ${stage.notes}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-left font-mono text-xs text-slate-600">
                              <span className="text-slate-400">أجر المرحلة:</span> {stage.laborCost} ريال
                            </div>
                            {!isDone && selectedOrder.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleAdvanceStage(selectedOrder.id, stage.stageNumber)}
                                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-amber-300 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                إكمال المرحلة
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cost Breakdown Summary Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="font-bold text-xs text-slate-700 mb-2">معادلة احتساب تكلفة التصنيع الإجمالية:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-[10px]">تكلفة المواد (BOM)</div>
                      <div className="font-mono font-bold text-purple-900 text-sm mt-0.5">{selectedOrder.rawMaterialsCost} ريال</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-[10px]">تكلفة العمالة (ساعات)</div>
                      <div className="font-mono font-bold text-purple-900 text-sm mt-0.5">{selectedOrder.laborCost} ريال</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-[10px]">تكاليف غير مباشرة (Overhead)</div>
                      <div className="font-mono font-bold text-purple-900 text-sm mt-0.5">{selectedOrder.overheadCost} ريال</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-300">
                      <div className="text-amber-800 text-[10px] font-bold">التكلفة النهائية للمنتج</div>
                      <div className="font-mono font-bold text-amber-900 text-sm mt-0.5">{selectedOrder.totalCost.toLocaleString()} ريال</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                اختر أمر تصنيع لعرض التفاصيل
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Job Orders (Alterations & Repairs) */}
      {activeTab === 'JO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">أوامر الشغل والتعديل بالمشغل (Job Orders)</h3>
            <button
              onClick={() => setShowNewJoModal(true)}
              className="px-3.5 py-1.5 bg-purple-900 hover:bg-purple-800 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              أمر شغل جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.jobOrders.map(jo => (
              <div key={jo.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {jo.orderNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      jo.type === 'SIZE_ALTERATION'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {jo.type === 'SIZE_ALTERATION' ? 'تعديل مقاس' : 'إصلاح تلف'}
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    jo.status === 'DONE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {jo.status === 'DONE' ? 'تم الإنجاز' : 'قيد العمل'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{jo.productName}</h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">رقم القطعة: {jo.productUnitSerial}</div>
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {jo.specs}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                  <div>الخياط: <span className="font-semibold text-slate-700">{jo.assignedTailor}</span></div>
                  <div>ساعات العمل: <span className="font-mono font-bold text-purple-900">{jo.laborHours} س</span></div>
                  <div>التكلفة: <span className="font-mono font-bold text-amber-800">{jo.totalCost} ريال</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOM Raw Materials Stock Architecture */}
      {activeTab === 'BOM' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">مخزون المواد الخام ومحرك حجز الـ BOM</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع الكميات المتاحة والمحجوزة لأوامر التصنيع مع التنبيه التلقائي في حال نقص المخزون
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-900 rounded-lg text-xs font-bold border border-purple-200">
              قيد حجز المخزون: نشط آلياً
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">رمز المادة</th>
                  <th className="p-3">اسم المادة الخام</th>
                  <th className="p-3">المخزون المتوفر</th>
                  <th className="p-3">المحجوز لأوامر MO</th>
                  <th className="p-3">الرصيد الحر المتاح</th>
                  <th className="p-3">تكلفة الوحدة</th>
                  <th className="p-3 text-center">حالة التوريد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-purple-950">RAW-MAT-01</td>
                  <td className="p-3 font-semibold text-slate-900">قماش ميكادو حرير طبيعي ناصع البياض (إيطالي)</td>
                  <td className="p-3 font-mono">25 متر</td>
                  <td className="p-3 font-mono text-amber-700 font-bold">12 متر</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">13 متر</td>
                  <td className="p-3 font-mono">180 ريال</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      مخزون كافي
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-purple-950">RAW-MAT-02</td>
                  <td className="p-3 font-semibold text-slate-900">دانتيل فرنسي كوتور كوردونيه مطرز باللؤلؤ</td>
                  <td className="p-3 font-mono">14 متر</td>
                  <td className="p-3 font-mono text-amber-700 font-bold">6 متر</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">8 متر</td>
                  <td className="p-3 font-mono">320 ريال</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      مخزون كافي
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-purple-950">RAW-MAT-03</td>
                  <td className="p-3 font-semibold text-slate-900">أحجار كريستال سواروفسكي عاكسة (علبة 1440 حبة)</td>
                  <td className="p-3 font-mono">8 علب</td>
                  <td className="p-3 font-mono text-amber-700 font-bold">2 علب</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">6 علب</td>
                  <td className="p-3 font-mono">240 ريال</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      مخزون كافي
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New MO */}
      {showNewMoModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Factory className="w-5 h-5 text-purple-800" />
                إنشاء أمر تصنيع جديد (Manufacturing Order)
              </h3>
              <button
                onClick={() => setShowNewMoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الموديل المراد تصنيعه</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فستان زفاف ملكي دانتيل فرنسي كوتور"
                  value={newMoTitle}
                  onChange={(e) => setNewMoTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرمز التعريفي (SKU)</label>
                  <input
                    type="text"
                    placeholder="WD-ROYAL-NEW"
                    value={newMoSku}
                    onChange={(e) => setNewMoSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الأولوية</label>
                  <select
                    value={newMoPriority}
                    onChange={(e) => setNewMoPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  >
                    <option value="NORMAL">عادي</option>
                    <option value="HIGH">عالي</option>
                    <option value="URGENT">عاجل 🔴</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ التسليم المستهدف</label>
                  <input
                    type="date"
                    required
                    value={newMoEndDate}
                    onChange={(e) => setNewMoEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الخياط المسؤول</label>
                  <input
                    type="text"
                    value={newMoTailor}
                    onChange={(e) => setNewMoTailor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">مواصفات العميل والمقاسات</label>
                <textarea
                  rows={3}
                  placeholder="صدر 90 سم، خصر 68 سم، طول 160 سم، مع ذيل ملكي 2 متر وتطريز لؤلؤي على الأكتاف..."
                  value={newMoSpecs}
                  onChange={(e) => setNewMoSpecs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  أتمتة BOM والمخزون (BR-26):
                </div>
                <p className="text-[11px] text-purple-800">
                  تأكيد هذا الأمر سيقوم تلقائياً بحجز 10 متر ميكادو و 5 متر دانتيل من المخزون وتوليد 6 مراحل عمل بالتعيين التلقائي.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewMoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-850 hover:to-indigo-850 text-amber-300 rounded-xl font-bold shadow-md cursor-pointer"
                >
                  تأكيد وحجز المواد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New JO */}
      {showNewJoModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-600" />
                أمر شغل وتعديل جديد (Job Order)
              </h3>
              <button
                onClick={() => setShowNewJoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">القطعة المراد تعديلها</label>
                <select
                  value={newJoUnit}
                  onChange={(e) => setNewJoUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                >
                  {state.units.map(u => (
                    <option key={u.id} value={u.serialNumber}>
                      {u.serialNumber} - مقاس {u.size} ({u.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">نوع الشغل</label>
                <select
                  value={newJoType}
                  onChange={(e) => setNewJoType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                >
                  <option value="SIZE_ALTERATION">تعديل مقاسات بروفة</option>
                  <option value="DAMAGE_REPAIR">إصلاح تلفيات بعد إرجاع</option>
                  <option value="REFURBISHMENT">تجديد وتلميع كامل</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">تفاصيل ومواصفات التعديل</label>
                <textarea
                  rows={3}
                  required
                  placeholder="تضييق خصر بمقدار 2 سم، تقصير الذيل 3 سم..."
                  value={newJoSpecs}
                  onChange={(e) => setNewJoSpecs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ساعات العمل المقدرة</label>
                  <input
                    type="number"
                    value={newJoHours}
                    onChange={(e) => setNewJoHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">التكلفة (ريال)</label>
                  <input
                    type="number"
                    value={newJoCost}
                    onChange={(e) => setNewJoCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewJoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-amber-300 rounded-xl font-bold shadow-md cursor-pointer"
                >
                  حفظ وتكليف المشغل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
