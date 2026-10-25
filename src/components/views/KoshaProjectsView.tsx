import React, { useState } from 'react';
import { 
  Sparkles, CheckSquare, Clock, MapPin, 
  Users, CheckCircle2, ChevronRight, Plus, Camera
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { KoshaProject } from '../../types';

interface KoshaProjectsProps {
  state: AppState;
  onUpdateComponentCheck: (projectId: string, componentIndex: number) => void;
}

export const KoshaProjectsView: React.FC<KoshaProjectsProps> = ({
  state,
  onUpdateComponentCheck
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(state.koshaProjects[0]?.id || '');
  const project = state.koshaProjects.find(p => p.id === selectedProjectId) || state.koshaProjects[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">مشاريع الكوش والديكور والتركيب الميداني</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              جدولة القاعات والفك
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الكوش كمشاريع هندسية: قوائم الفحص لكل مرحلة (خروج مستودع، تركيب، تسليم، فك، وعودة)
          </p>
        </div>
      </div>

      {project && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Project Details */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                  {project.projectNumber}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">{project.title}</h3>
                <p className="text-xs text-slate-500">العميل: {project.customerName}</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                مجدول للتنفيذ
              </span>
            </div>

            {/* Hall and Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 bg-slate-50 rounded-xl text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">{project.hallName}</span>
                  <div className="text-slate-500 text-[11px]">{project.hallLocation}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <div>موعد التركيب: <strong className="text-slate-900">{project.setupDateTime}</strong></div>
                  <div>موعد الفك: <strong className="text-slate-900">{project.teardownDateTime}</strong></div>
                </div>
              </div>
            </div>

            {/* Stage Checklist */}
            <div>
              <h4 className="font-bold text-xs text-slate-800 mb-3 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                قائمة فحص المكونات وخروج المستودع (Checklist):
              </h4>
              <div className="space-y-2">
                {project.componentsList.map((comp, idx) => (
                  <div
                    key={idx}
                    onClick={() => onUpdateComponentCheck(project.id, idx)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 transition cursor-pointer flex items-center justify-between text-xs bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={comp.checked}
                        onChange={() => {}}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className={comp.checked ? 'text-slate-900 font-bold' : 'text-slate-600'}>
                        {comp.name}
                      </span>
                    </div>
                    {comp.checked ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم الفحص والتحميل
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">بانتظار التحميل</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Team assignment */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>فريق التركيب والتوصيل: <strong>{project.assignedTeam.join('، ')}</strong></span>
              </div>
            </div>
          </div>

          {/* Project Approved Design Photo Album */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-bold text-xs text-slate-800 mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-purple-700" />
              ألبوم صور المشروع المعتمد:
            </h4>

            <div className="space-y-3">
              {project.photos.map((ph, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden aspect-video bg-slate-900 relative group">
                  <img src={ph.url} alt={ph.stage} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 left-2 bg-slate-950/80 backdrop-blur-sm p-2 rounded-lg text-white text-[10px]">
                    <span className="font-bold text-amber-300 block">{ph.stage}</span>
                    <span className="text-slate-400">تاريخ الاعتماد: {ph.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('تم توليد رابط مشاركة ألبوم الكوشة المؤقت للعميل (صلاحية 30 يوماً)!')}
              className="w-full mt-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition cursor-pointer"
            >
              مشاركة ألبوم المشروع مع العميل
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
