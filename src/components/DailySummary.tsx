
import React, { useState, useMemo } from 'react';
import { DailySummary } from '../types';

interface DailySummaryProps {
  summaries: DailySummary[];
  onSave: (summary: DailySummary) => void;
}

const DailySummaryView: React.FC<DailySummaryProps> = ({ summaries, onSave }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newFieldName, setNewFieldName] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [searchNatureTerm, setSearchNatureTerm] = useState('');

  const getTodayLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultCounts = {
    bo: 0, tco: 0, tentativa_homicidio: 0, tentativa_roubo: 0, tentativa_latrocinio: 0,
    tentativa_feminicidio: 0, violencia_domestica: 0, estupro_vulneravel: 0, apreensao_veiculo: 0,
    desacato: 0, importunacao_sexual: 0, ameaca: 0, assedio: 0, injuria: 0, arrombamento: 0,
    associacao_criminosa: 0, tentativa_estupro: 0, estelionato: 0, acidente_transito: 0,
    acidente_fatal: 0, embriaguez: 0, consumo_drogas: 0, vias_de_fato: 0, difamacao: 0,
    invasao_domiciliar: 0, preservacao_direito: 0, lesao_corporal: 0, lesao_arma_fogo: 0,
    flagrantes: 0, sequestro: 0, quebra_medida: 0, violacao_tornozeleira: 0
  };

  const initialFormState: Partial<DailySummary> = {
    date: getTodayLocal(),
    counts: { ...defaultCounts },
    conduzidos: {
      masculino: 0, feminino: 0, menor_infrator: 0
    }
  };

  const [formData, setFormData] = useState<Partial<DailySummary>>(initialFormState);

  const occurrenceLabels: Record<string, string> = {
    bo: 'BOLETIM DE OCORRÊNCIA', 
    tco: 'TERMO CIRCUNSTANCIADO', 
    tentativa_homicidio: 'TENTATIVA DE HOMICÍDIO', 
    tentativa_roubo: 'TENTATIVA DE ROUBO',
    tentativa_latrocinio: 'TENTATIVA DE LATROCÍNIO', 
    tentativa_feminicidio: 'TENTATIVA DE FEMINICÍDIO',
    violencia_domestica: 'VIOLÊNCIA DOMÉSTICA', 
    estupro_vulneravel: 'ESTUPRO DE VULNERÁVEL',
    apreensao_veiculo: 'APREENSÃO DE VEÍCULO', 
    desacato: 'DESACATO / DESOBEDIÊNCIA',
    importunacao_sexual: 'IMPORTUNAÇÃO SEXUAL', 
    ameaca: 'AMEAÇA', 
    assedio: 'ASSÉDIO',
    injuria: 'INJÚRIA', 
    arrombamento: 'ARROMBAMENTO', 
    associacao_criminosa: 'ASSOCIAÇÃO CRIMINOSA',
    tentativa_estupro: 'TENTATIVA DE ESTUPRO', 
    estelionato: 'ESTELIONATO', 
    acidente_transito: 'ACIDENTE DE TRÂNSITO',
    acidente_fatal: 'ACIDENTE COM VÍTIMA FATAL', 
    embriaguez: 'EMBRIAGUEZ AO VOLANTE',
    consumo_drogas: 'CONSUMO PESSOAL DE DROGAS', 
    vias_de_fato: 'VIAS DE FATO', 
    difamacao: 'DIFAMAÇÃO',
    invasao_domiciliar: 'INVASÃO DOMICILIAR', 
    preservacao_direito: 'PRESERVAÇÃO DE DIREITO',
    lesao_corporal: 'LESÃO CORPORAL', 
    lesao_arma_fogo: 'LESÃO CORPORAL (PAF)',
    flagrantes: 'FLAGRANTES', 
    sequestro: 'SEQUESTRO', 
    quebra_medida: 'QUEBRA DE MEDIDA PROTETIVA',
    violacao_tornozeleira: 'VIOLAÇÃO DE TORNOZELEIRA'
  };

  const conduzidosLabels: Record<string, string> = {
    masculino: 'SEXO MASCULINO', 
    feminino: 'SEXO FEMININO',
    menor_infrator: 'MENOR INFRATOR'
  };

  const handleInputChange = (category: 'counts' | 'conduzidos', field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [field]: value
      }
    }));
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    const name = newFieldName.trim().toUpperCase();
    setFormData(prev => ({
      ...prev,
      counts: { ...(prev.counts || {}), [name]: 0 }
    }));
    setNewFieldName('');
    setShowAddField(false);
    setSearchNatureTerm(name);
  };

  const handleRemoveCustomField = (key: string) => {
    if (Object.keys(defaultCounts).includes(key)) return;
    setFormData(prev => {
      const newCounts = { ...(prev.counts || {}) };
      delete newCounts[key];
      return { ...prev, counts: newCounts };
    });
  };

  const handleOpenNew = () => {
    setFormData({
      ...initialFormState,
      date: getTodayLocal()
    });
    setIsEditing(false);
    setShowForm(true);
    setSearchNatureTerm('');
  };

  const handleEditClick = (summary: DailySummary) => {
    setFormData(summary);
    setIsEditing(true);
    setShowForm(true);
    setSearchNatureTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newSummary: DailySummary = {
        ...formData,
        id: isEditing ? formData.id : Math.random().toString(36).substr(2, 9),
        reportedBy: 'P/3 - 43° BPM',
        createdAt: isEditing ? (formData.createdAt || new Date().toISOString()) : new Date().toISOString()
      } as DailySummary;
      onSave(newSummary);
      setShowForm(false);
      setFormData(initialFormState);
      setIsEditing(false);
      setIsSaving(false);
    }, 400);
  };

  const formatDateLocale = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  };

  const filteredNatureFields = useMemo(() => {
    if (!formData.counts) return [];
    const entries = Object.entries(formData.counts);
    if (!searchNatureTerm.trim()) return entries;
    const term = searchNatureTerm.toLowerCase();
    return entries.filter(([key]) => {
      const label = (occurrenceLabels[key] || key).toLowerCase();
      return label.includes(term) || key.toLowerCase().includes(term);
    });
  }, [formData.counts, searchNatureTerm, occurrenceLabels]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Histórico de Resumos Operacionais</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Controle de Outras Ocorrências e Conduções</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-[#ffd700] text-[#002b5c] px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-[#ffea00] transition-all shadow-lg flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Novo Lançamento Diário
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => !isSaving && setShowForm(false)}></div>
          <div className="relative bg-[#020617] rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-7xl max-h-[98vh] overflow-hidden flex flex-col border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <header className="px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#ffd700] text-[#002b5c] rounded-xl flex items-center justify-center shadow-lg shadow-[#ffd700]/10">
                  <i className={`fa-solid ${isEditing ? 'fa-pen-to-square' : 'fa-file-signature'} text-lg`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                    {isEditing ? 'Atualização de Resumo' : 'Novo Lançamento Diário (P/3)'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">43º Batalhão de Polícia Militar - MA</p>
                </div>
              </div>
              {!isSaving && (
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white p-2 transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              )}
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-[#020617]">
              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="w-full md:w-52 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data Referência</label>
                  <input 
                    type="date"
                    required
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#1e293b] text-white font-black text-sm outline-none focus:ring-2 focus:ring-[#ffd700]/50"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
                   <div className="relative flex-1">
                      <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-500 text-xs"></i>
                      <input 
                        type="text"
                        placeholder="Pesquisar natureza..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1e293b] text-white font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#ffd700]/50"
                        value={searchNatureTerm}
                        onChange={(e) => setSearchNatureTerm(e.target.value)}
                      />
                   </div>
                   <button 
                      type="button"
                      onClick={() => setShowAddField(!showAddField)}
                      className="text-[10px] font-black text-[#ffd700] uppercase bg-[#ffd700]/10 px-4 sm:px-6 py-3.5 rounded-xl border border-[#ffd700]/30 hover:bg-[#ffd700]/20 transition-all whitespace-nowrap"
                    >
                      <i className={`fa-solid ${showAddField ? 'fa-minus' : 'fa-plus'} mr-2`}></i> Natureza
                    </button>
                </div>
              </div>

              {showAddField && (
                <div className="bg-[#ffd700]/5 p-4 sm:p-5 rounded-2xl border border-[#ffd700]/20 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    placeholder="DIGITE O NOME COMPLETO DA NATUREZA..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-[#1e293b] text-white font-black text-xs uppercase outline-none focus:border-[#ffd700]"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddCustomField}
                    className="bg-[#ffd700] text-[#002b5c] px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg"
                  >Confirmar</button>
                </div>
              )}

              <section className="space-y-3">
                <div className="flex items-center gap-3 border-l-4 border-[#ffd700] pl-4 py-2 bg-[#ffd700]/5 rounded-r-xl">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-file-invoice text-[#ffd700]"></i> 
                    Controle de Ocorrências
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredNatureFields.map(([key, value]) => {
                    const isCustom = !Object.keys(occurrenceLabels).includes(key);
                    const isSpecial = key === 'bo' || key === 'tco' || key === 'flagrantes';
                    const label = occurrenceLabels[key] || key;
                    
                    return (
                      <div key={key} className={`group flex items-center border transition-all ${
                        isSpecial 
                          ? 'bg-[#ffd700]/10 border-[#ffd700]/30' 
                          : (isCustom ? 'bg-[#ffd700]/5 border-[#ffd700]/10' : 'bg-[#0f172a] border-slate-800 hover:border-slate-700')
                      } rounded-xl overflow-hidden`}>
                        <div className="flex-1 py-3 px-3 sm:px-4 flex flex-col min-w-0">
                          <label className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tight truncate leading-none ${
                            isSpecial ? 'text-[#ffd700]' : (isCustom ? 'text-[#ffd700]' : 'text-slate-400')
                          }`}>
                            {label}
                          </label>
                          {isCustom && (
                            <button 
                              type="button"
                              onClick={() => handleRemoveCustomField(key)}
                              className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-[9px] font-black uppercase"
                            >
                              <i className="fa-solid fa-trash-can"></i> Excluir
                            </button>
                          )}
                        </div>
                        <div className="w-16 sm:w-20 bg-black/40 border-l border-slate-800 self-stretch flex items-center">
                          <input 
                            type="number" 
                            min="0"
                            className="bg-transparent border-none w-full py-3 px-2 text-white font-black text-center text-sm focus:ring-0 focus:bg-white/5 outline-none"
                            value={value}
                            onChange={(e) => handleInputChange('counts', key, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 py-2 bg-red-600/5 rounded-r-xl">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-user-lock text-red-500"></i>
                    Controle de Conduzidos
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(conduzidosLabels).map(([key, label]) => (
                    <div key={key} className="bg-red-900/10 border border-red-900/20 flex items-center rounded-xl overflow-hidden">
                      <label className="text-[10px] sm:text-[11px] font-black text-red-400 uppercase tracking-tight flex-1 px-4 py-3 leading-none">
                        {label}
                      </label>
                      <div className="w-20 sm:w-24 bg-black/40 border-l border-red-900/20 self-stretch flex items-center">
                        <input 
                          type="number" 
                          min="0"
                          className="bg-transparent border-none w-full py-3 px-2 text-white font-black text-center text-sm focus:ring-0 outline-none"
                          value={(formData.conduzidos as any)[key]}
                          onChange={(e) => handleInputChange('conduzidos', key, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </form>

            <footer className="p-4 sm:p-6 border-t border-slate-800 bg-[#0f172a] flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 sm:py-3.5 bg-slate-800 text-slate-400 font-black rounded-xl hover:text-white transition-all text-[10px] sm:text-xs uppercase order-2 sm:order-1"
              >
                Descartar Alterações
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-10 py-3 sm:py-3.5 bg-[#ffd700] text-[#002b5c] font-black rounded-xl hover:bg-[#ffea00] transition-all text-[10px] sm:text-xs uppercase shadow-xl shadow-[#ffd700]/10 disabled:opacity-50 order-1 sm:order-2"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2 justify-center">
                    <i className="fa-solid fa-spinner animate-spin"></i> Gravando...
                  </span>
                ) : (
                  isEditing ? 'Confirmar Atualização' : 'Protocolar Relatório Diário'
                )}
              </button>
            </footer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {summaries.length > 0 ? (
          summaries.map((summary) => (
            <div key={summary.id} className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl hover:border-[#ffd700]/30 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Referência</span>
                  <p className="text-sm font-black text-white">{formatDateLocale(summary.date)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(summary)}
                    className="w-10 h-10 rounded-full bg-[#ffd700]/10 flex items-center justify-center text-[#ffd700] hover:bg-[#ffd700] hover:text-[#002b5c] transition-all border border-[#ffd700]/20"
                  ><i className="fa-solid fa-pen"></i></button>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 border border-white/10">
                    <i className="fa-solid fa-clipboard-check"></i>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Total (B.O + TCO)</span>
                    <p className="text-2xl font-black text-white">{(summary.counts.bo || 0) + (summary.counts.tco || 0)}</p>
                  </div>
                  <div className="bg-red-900/10 p-4 rounded-2xl border border-red-900/20">
                    <span className="text-[8px] font-black text-red-500 uppercase block mb-1">Conduzidos</span>
                    <p className="text-2xl font-black text-red-400">
                      {(summary.conduzidos.masculino || 0) + (summary.conduzidos.feminino || 0) + (summary.conduzidos.menor_infrator || 0)}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-800">
                  <h5 className="text-[10px] font-black text-[#ffd700] uppercase mb-3 flex items-center gap-2">Maiores Incidências</h5>
                  <div className="space-y-2">
                    {(Object.entries(summary.counts) as [string, number][])
                      .filter(([_, val]) => val > 0)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold text-slate-300 uppercase truncate pr-4">{occurrenceLabels[key] || key}</span>
                          <span className="text-xs font-black text-[#ffd700]">{val}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lançamento Validado</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-700 uppercase">P/3 - 43 BPM</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 bg-[#0f172a] rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-700 mb-8">
              <i className="fa-solid fa-file-circle-exclamation text-5xl"></i>
            </div>
            <h4 className="text-slate-500 font-black uppercase text-base tracking-widest">Nenhum registro operacional processado</h4>
            <p className="text-slate-600 text-xs font-bold mt-3 uppercase max-w-xs">Inicie um novo lançamento diário para gerir a produtividade do plantão.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySummaryView;
