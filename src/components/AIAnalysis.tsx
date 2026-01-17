
import * as React from 'react';
import { useState } from 'react';
import { Incident } from '../types.ts';
import { analyzeIncidents } from '../services/geminiService.ts';

interface AIAnalysisProps {
  incidents: Incident[];
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ incidents }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeIncidents(incidents);
      setReport(result || "Erro ao processar análise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-blue-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-blue-400/30">
            <i className="fa-solid fa-brain text-4xl text-blue-300"></i>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Análise Inteligente de Criminalidade</h2>
            <p className="text-blue-100/70 mt-2 text-lg max-w-xl">
              Utilize Inteligência Artificial para identificar padrões ocultos e recomendações estratégicas baseadas nas ocorrências registradas.
            </p>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className={`px-8 py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-3 shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Analisando dados...
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i>
                Gerar Relatório Estratégico
              </>
            )}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 prose prose-slate max-w-none animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">IA</div>
            <h3 className="text-xl font-bold text-slate-800 m-0">Relatório de Inteligência Gerado</h3>
          </div>
          <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium">
            {report}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
            <span>Powered by Gemini AI</span>
            <span>Relatório Confidencial</span>
          </div>
        </div>
      )}

      {!report && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'fa-location-crosshairs', title: 'Hotspots', desc: 'Identifica zonas de maior incidência criminal.' },
            { icon: 'fa-clock', title: 'Padrão Temporal', desc: 'Análise de horários críticos de ocorrência.' },
            { icon: 'fa-user-shield', title: 'Prevenção', desc: 'Dicas práticas para alocação de viaturas.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                <i className={`fa-solid ${item.icon} text-xl`}></i>
              </div>
              <h4 className="font-bold text-slate-800">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
