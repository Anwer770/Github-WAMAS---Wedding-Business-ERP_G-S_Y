import React, { useState } from 'react';
import { 
  Database, Copy, Check, Code, ShieldCheck, 
  FileCode, Sparkles, Terminal, Download
} from 'lucide-react';
import { POSTGRESQL_DDL, PRISMA_SCHEMA } from '../../db/schema';

export const DatabaseSchemaView: React.FC = () => {
  const [activeSchemaTab, setActiveSchemaTab] = useState<'POSTGRESQL' | 'PRISMA'>('POSTGRESQL');
  const [copied, setCopied] = useState(false);

  const activeCode = activeSchemaTab === 'POSTGRESQL' ? POSTGRESQL_DDL : PRISMA_SCHEMA;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">مخطط قاعدة البيانات الكامل (Database Schemas & DDL)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200">
              PostgreSQL 16 & Prisma
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            المخطط الهيكلي الكامل للمؤسسة: قيود الاستبعاد الزمني btree_gist، شجرة الحسابات، جداول المهام، والوسائط
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setActiveSchemaTab('POSTGRESQL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeSchemaTab === 'POSTGRESQL' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              PostgreSQL DDL
            </button>
            <button
              onClick={() => setActiveSchemaTab('PRISMA')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeSchemaTab === 'PRISMA' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              Prisma Schema
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
            {copied ? 'تم النسخ للحافظة!' : 'نسخ الكود بالكامل'}
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 rounded-2xl p-6 shadow-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>{activeSchemaTab === 'POSTGRESQL' ? 'postgres_schema_v1.sql' : 'schema.prisma'}</span>
          </div>
          <span className="text-slate-500">مُحسّن للإنتاجية العالية والـ Double-Entry</span>
        </div>

        <pre className="overflow-x-auto max-h-[600px] leading-relaxed text-slate-300 font-mono text-[11px]">
          <code>{activeCode}</code>
        </pre>
      </div>

    </div>
  );
};
