import React, { useState } from 'react';
import { 
  CheckSquare, Clock, AlertTriangle, UserCheck, 
  MessageSquare, Paperclip, Plus, CheckCircle2, ChevronRight, Eye, Camera
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { Task, TaskStatus, TaskPriority, TaskType } from '../../types';

interface TaskKanbanProps {
  state: AppState;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, proofUrl?: string) => void;
  onOpenCreateTaskModal: () => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; badge: string }[] = [
  { id: 'NEW', title: 'جديدة (NEW)', color: 'border-blue-400 bg-blue-50/40', badge: 'bg-blue-100 text-blue-800' },
  { id: 'IN_PROGRESS', title: 'قيد التنفيذ (IN PROGRESS)', color: 'border-amber-400 bg-amber-50/40', badge: 'bg-amber-100 text-amber-800' },
  { id: 'PENDING_REVIEW', title: 'بانتظار المراجعة (REVIEW)', color: 'border-purple-400 bg-purple-50/40', badge: 'bg-purple-100 text-purple-800' },
  { id: 'COMPLETED', title: 'مكتملة (COMPLETED)', color: 'border-emerald-400 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800' }
];

export const TaskKanbanView: React.FC<TaskKanbanProps> = ({
  state,
  onUpdateTaskStatus,
  onOpenCreateTaskModal
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'MY_TASKS'>('ALL');
  const [selectedTaskForProof, setSelectedTaskForProof] = useState<Task | null>(null);
  const [proofImageInput, setProofImageInput] = useState<string>('https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600');

  const filteredTasks = state.tasks.filter(t => {
    if (filterMode === 'MY_TASKS') {
      return t.assignedToId === state.currentUser.id;
    }
    return true;
  });

  const handleAdvanceTask = (task: Task) => {
    let nextStatus: TaskStatus = 'IN_PROGRESS';
    if (task.status === 'NEW') nextStatus = 'IN_PROGRESS';
    else if (task.status === 'IN_PROGRESS') {
      // If task requires proof of completion (e.g. DELIVERY, INSPECTION), open proof modal
      if (task.taskType === 'DELIVERY' || task.taskType === 'INSPECTION') {
        setSelectedTaskForProof(task);
        return;
      }
      nextStatus = 'COMPLETED';
    } else if (task.status === 'PENDING_REVIEW') nextStatus = 'COMPLETED';

    onUpdateTaskStatus(task.id, nextStatus);
  };

  const handleCompleteWithProof = () => {
    if (!selectedTaskForProof) return;
    if (!proofImageInput) {
      alert('قاعدة صارمة BR-21: لا يمكن إغلاق هذه المهمة دون رفع صورة دليل الإنجاز الموثقة!');
      return;
    }
    onUpdateTaskStatus(selectedTaskForProof.id, 'COMPLETED', proofImageInput);
    setSelectedTaskForProof(null);
    alert('تم إغلاق المهمة وإرفاق دليل الإنجاز بنجاح!');
  };

  return (
    <div className="space-y-6">
      
      {/* Kanban Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">إدارة المهام والتكليفات التشغيلية (Tasks Kanban)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              أتمتة الأحداث الحية
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            الجسر بين قرارات الحجز والتنفيذ الميداني: خياطة، غسيل إجباري، تسليم بصور، وتقدير تلفيات
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterMode === 'ALL' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              جميع مهام الفريق ({state.tasks.length})
            </button>
            <button
              onClick={() => setFilterMode('MY_TASKS')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterMode === 'MY_TASKS' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              مهامي الخاصة ({state.tasks.filter(t => t.assignedToId === state.currentUser.id).length})
            </button>
          </div>

          <button
            onClick={onOpenCreateTaskModal}
            className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            إنشاء مهمة يدوية
          </button>
        </div>
      </div>

      {/* Proof of Completion Modal (BR-21) */}
      {selectedTaskForProof && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-900" />
                <h3 className="font-bold text-sm text-slate-900">رفع دليل إنجاز المهمة (شرط إجباري BR-21)</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForProof(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600">
                المهمة ({selectedTaskForProof.taskNumber}) تتطلب توثيقاً مصوراً لإثبات التسليم أو الفحص قبل الإغلاق.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط أو معاينة صورة الإنجاز:</label>
                <input
                  type="text"
                  value={proofImageInput}
                  onChange={(e) => setProofImageInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {proofImageInput && (
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 mt-2">
                  <img src={proofImageInput} alt="Proof" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedTaskForProof(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCompleteWithProof}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
              >
                اعتماد الصورة وإغلاق المهمة كمنجزة ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="bg-slate-100/70 rounded-2xl p-4 flex flex-col min-h-[500px]">
              
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-800">{col.title}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List in this column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => {
                  const isOverdue = new Date(task.dueDate).getTime() < Date.now() && task.status !== 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-xl p-4 shadow-sm border transition hover:shadow-md ${
                        isOverdue ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    >
                      {/* Tags & Priority */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                          task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority === 'URGENT' ? '🔴 عاجلة' : task.priority === 'HIGH' ? '🟠 عالية' : 'متوسطة'}
                        </span>
                        
                        {task.isAutoGenerated && (
                          <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded">
                            أتمتة ⚙️
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Linked Entity */}
                      {task.entityTitle && (
                        <div className="mt-2 text-[10px] text-purple-700 bg-purple-50 p-1.5 rounded-lg font-medium truncate">
                          مرتبط بـ: {task.entityTitle}
                        </div>
                      )}

                      {/* Assigned to & Due Date */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{task.assignedToName}</span>
                        </div>

                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                          <Clock className="w-3 h-3" />
                          <span>{task.dueDate.split('T')[0]}</span>
                        </div>
                      </div>

                      {/* Advance Stage Button */}
                      {task.status !== 'COMPLETED' && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleAdvanceTask(task)}
                            className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-purple-900 hover:text-white text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>
                              {task.status === 'NEW' ? 'بدء التنفيذ' : 'إنجاز المهمة'}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                          </button>
                        </div>
                      )}

                      {task.status === 'COMPLETED' && task.attachments.length > 0 && (
                        <div className="mt-2 text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          مرفق دليل الإنجاز المصور
                        </div>
                      )}

                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    لا توجد مهام في هذه المرحلة
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
