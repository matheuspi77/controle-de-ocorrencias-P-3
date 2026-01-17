
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import IncidentForm from './components/IncidentForm.tsx';
import AIAnalysis from './components/AIAnalysis.tsx';
import IncidentDetail from './components/IncidentDetail.tsx';
import DailySummaryView from './components/DailySummary.tsx';
import Reports from './components/Reports.tsx';
import { Incident, IncidentStatus, DailySummary } from './types.ts';
import { MOCK_INCIDENTS } from './constants.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('pmma_incidents');
    if (saved) return JSON.parse(saved);
    return [...MOCK_INCIDENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>(() => {
    const saved = localStorage.getItem('pmma_daily_summaries');
    if (saved) return JSON.parse(saved);
    return [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<IncidentStatus | null>(null);
  
  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('pmma_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('pmma_daily_summaries', JSON.stringify(dailySummaries));
  }, [dailySummaries]);

  useEffect(() => {
    if (activeTab !== 'new') {
      setEditingIncident(null);
    }
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const handleSaveIncident = (incidentData: Partial<Incident>) => {
    const isEditing = !!editingIncident;
    if (isEditing) {
      setIncidents(prev => {
        const updated = prev.map(inc => 
          inc.id === incidentData.id ? { ...inc, ...incidentData } as Incident : inc
        );
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      setEditingIncident(null);
    } else {
      const completeIncident: Incident = {
        ...incidentData,
        reportedBy: 'P/3 - 43° BPM',
        createdAt: new Date().toISOString(),
      } as Incident;
      setIncidents(prev => [completeIncident, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setActiveTab('list');
  };

  const handleSaveDailySummary = (summary: DailySummary) => {
    setDailySummaries(prev => {
      const exists = prev.some(s => s.id === summary.id);
      let updated;
      if (exists) {
        updated = prev.map(s => s.id === summary.id ? summary : s);
      } else {
        updated = [summary, ...prev];
      }
      return updated.sort((a, b) => b.date.localeCompare(a.date));
    });
  };

  const handleDashboardFilterChange = (status: IncidentStatus | null) => {
    setDashboardStatusFilter(prev => prev === status ? null : status);
  };

  const handleStartEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setActiveTab('new');
    setViewingIncident(null);
  };

  const handleStartView = (incident: Incident) => setViewingIncident(incident);

  const handleDeleteRequest = (id: string) => {
    setIncidentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (incidentToDelete) {
      setIncidents(prev => prev.filter(inc => inc.id !== incidentToDelete));
      setShowDeleteModal(false);
      setIncidentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setIncidentToDelete(null);
  };

  const normalizeText = (text: string | undefined) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  const parseSearchDate = (str: string) => {
    const parts = str.split(/[/-]/);
    if (parts.length < 2) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parts[2] ? (parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10)) : null;
    return { day, month, year };
  };

  const filteredIncidents = useMemo(() => {
    let result = [...incidents];
    
    if (dashboardStatusFilter) {
      result = result.filter(i => i.status === dashboardStatusFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const searchDate = parseSearchDate(term);

      result = result.filter(i => {
        if (searchDate) {
          const d = new Date(i.date);
          const incDay = d.getUTCDate();
          const incMonth = d.getUTCMonth() + 1;
          const incYear = d.getUTCFullYear();
          const dayMatch = incDay === searchDate.day;
          const monthMatch = incMonth === searchDate.month;
          const yearMatch = searchDate.year ? incYear === searchDate.year : true;
          if (dayMatch && monthMatch && yearMatch) return true;
        }

        const matchText = 
          normalizeText(i.incidentNumber).includes(term) || 
          normalizeText(i.sigma).includes(term) || 
          normalizeText(i.location.address).includes(term) ||
          normalizeText(i.type).includes(term) ||
          normalizeText(i.description).includes(term) ||
          normalizeText(i.victim).includes(term) ||
          normalizeText(i.garrison).includes(term) ||
          normalizeText(i.vehicleDetails).includes(term) ||
          normalizeText(i.stolenDetails).includes(term);

        if (matchText) return true;
        const formattedDate = new Date(i.date).toLocaleDateString('pt-BR');
        if (formattedDate.includes(term)) return true;
        return false;
      });
    }
    
    if (startDate || endDate) {
      result = result.filter(inc => {
        const incDateStr = inc.date.split('T')[0];
        if (startDate && endDate) return incDateStr >= startDate && incDateStr <= endDate;
        if (startDate) return incDateStr >= startDate;
        if (endDate) return incDateStr <= endDate;
        return true;
      });
    }
    return result;
  }, [incidents, searchTerm, startDate, endDate, dashboardStatusFilter]);

  const filteredSummaries = useMemo(() => {
    let result = [...dailySummaries];
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      const searchDate = parseSearchDate(term);
      result = result.filter(sum => {
        if (searchDate) {
          const [y, m, d] = sum.date.split('-').map(Number);
          const dayMatch = d === searchDate.day;
          const monthMatch = m === searchDate.month;
          const yearMatch = searchDate.year ? y === searchDate.year : true;
          if (dayMatch && monthMatch && yearMatch) return true;
        }
        const naturesWithRecords = Object.keys(sum.counts).filter(k => sum.counts[k] > 0);
        const matchContent = naturesWithRecords.some(n => normalizeText(n).includes(term));
        if (matchContent) return true;
        const formattedDate = sum.date.split('-').reverse().join('/');
        if (formattedDate.includes(term)) return true;
        return false;
      });
    }

    if (startDate || endDate) {
      result = result.filter(sum => {
        const sumDateStr = sum.date;
        if (startDate && endDate) return sumDateStr >= startDate && sumDateStr <= endDate;
        if (startDate) return sumDateStr >= startDate;
        if (endDate) return sumDateStr <= endDate;
        return true;
      });
    }
    return result;
  }, [dailySummaries, searchTerm, startDate, endDate]);

  const isSearching = searchTerm.trim() !== '' || startDate !== '' || endDate !== '';

  const renderTable = (data: Incident[]) => (
    <div className="bg-[#0f172a] rounded-2xl shadow-xl border border-slate-800 overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[800px] lg:min-w-full">
          <thead className="bg-[#002b5c] text-white">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Número Ocorrência</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">SIGMA</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Local / Detalhes</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.length > 0 ? data.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4"><span className="font-black text-slate-100">{inc.incidentNumber}</span></td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-[#ffd700]/10 rounded text-xs font-mono font-black text-[#ffd700]">{inc.sigma}</span></td>
                <td className="px-6 py-4"><span className="text-[11px] text-red-500 font-black uppercase">{inc.type}</span></td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-300 max-w-[250px] truncate font-bold">{inc.location.address}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-1">
                    {new Date(inc.date).toLocaleString('pt-BR')} {inc.garrison ? `| GU: ${inc.garrison}` : ''}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border-2 ${
                      inc.status === IncidentStatus.CONCLUIDO ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-amber-900/20 text-amber-400 border-amber-900/50'
                    }`}>{inc.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleStartView(inc)} title="Ver Detalhes" className="p-2 text-slate-500 hover:text-white transition-colors relative z-10"><i className="fa-solid fa-eye"></i></button>
                    <button onClick={() => handleStartEdit(inc)} title="Editar" className="p-2 text-slate-500 hover:text-[#ffd700] transition-colors relative z-10"><i className="fa-solid fa-pen-to-square"></i></button>
                    <button onClick={() => handleDeleteRequest(inc.id)} title="Excluir" className="p-2 text-slate-500 hover:text-red-600 transition-colors relative z-10"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-600 font-black uppercase text-xs tracking-widest">Nenhum registro encontrado para esta busca.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col lg:flex-row text-slate-200 overflow-x-hidden relative">
      {/* Botão Hambúrguer Mobile */}
      <div className="lg:hidden bg-[#001021] border-b border-red-900/30 p-4 flex justify-between items-center sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ffd700] rounded-lg flex items-center justify-center text-[#001021]">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <span className="font-black text-xs uppercase tracking-widest">43° BPM - P/3</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#ffd700]"
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-10
        ${isMobileMenuOpen ? 'translate-x-0 z-[80]' : '-translate-x-full z-10'}
      `}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 min-w-0">
        <header className="mb-6 lg:mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 lg:gap-6 bg-[#0f172a] p-5 lg:p-6 rounded-3xl shadow-xl border border-slate-800">
          <div className="min-w-max">
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-[#002b5c] text-white text-[8px] lg:text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">PMMA</span>
               <span className="bg-[#ffd700] text-[#002b5c] text-[8px] lg:text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">43° BPM - P/3</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
              {activeTab === 'dashboard' && 'Painel de Controle'}
              {activeTab === 'list' && 'Gestão de Ocorrências'}
              {activeTab === 'daily' && 'Resumo Operacional'}
              {activeTab === 'reports' && 'Relatórios PDF'}
              {activeTab === 'analysis' && 'Inteligência IA'}
              {activeTab === 'new' && (editingIncident ? 'Atualização de Registro' : 'Inclusão de Ocorrência')}
            </h1>
          </div>

          {activeTab !== 'new' && activeTab !== 'analysis' && activeTab !== 'reports' && (
            <div className="flex flex-col md:flex-row flex-1 max-w-4xl gap-3 items-stretch md:items-center w-full animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative flex-[2]">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-500"></i>
                <input
                  type="text"
                  placeholder="Pesquise B.O, SIGMA, DATA..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] shadow-sm focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700] outline-none transition-all text-xs lg:text-sm font-black text-white placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-1 items-center gap-2 bg-[#1e293b] border-2 border-slate-800 rounded-xl px-2 py-1 shadow-sm">
                <div className="relative flex-1 group">
                  <i className="fa-solid fa-calendar-day absolute left-3 top-2.5 text-slate-500 text-[10px]"></i>
                  <input 
                    type="date" 
                    className="w-full pl-8 pr-1 py-2 bg-transparent outline-none text-[10px] lg:text-xs font-black text-white appearance-none cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); if(!endDate) setEndDate(e.target.value); }}
                  />
                </div>
                <div className="h-4 w-[1px] bg-slate-700"></div>
                <div className="relative flex-1 group">
                  <i className="fa-solid fa-calendar-check absolute left-3 top-2.5 text-slate-500 text-[10px]"></i>
                  <input 
                    type="date" 
                    className="w-full pl-8 pr-1 py-2 bg-transparent outline-none text-[10px] lg:text-xs font-black text-white appearance-none cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {(isSearching || dashboardStatusFilter) && (
                <button 
                  onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); setDashboardStatusFilter(null); }}
                  title="Limpar Filtros"
                  className="w-11 h-11 bg-red-900/20 text-red-500 rounded-xl shadow-sm flex items-center justify-center hover:bg-red-900/40 transition-colors border-2 border-red-900/50 flex-shrink-0"
                ><i className="fa-solid fa-filter-circle-xmark"></i></button>
              )}
            </div>
          )}
        </header>

        <div className="relative">
          {activeTab === 'dashboard' && (
            <Dashboard 
              incidents={incidents} 
              filteredIncidents={filteredIncidents} 
              summaries={dailySummaries}
              filteredSummaries={filteredSummaries}
              isSearching={isSearching} 
              activeFilter={dashboardStatusFilter}
              onFilterChange={handleDashboardFilterChange}
            />
          )}
          {activeTab === 'list' && renderTable(filteredIncidents)}
          {activeTab === 'daily' && <DailySummaryView summaries={filteredSummaries} onSave={handleSaveDailySummary} />}
          {activeTab === 'reports' && <Reports incidents={incidents} dailySummaries={dailySummaries} />}
          {activeTab === 'analysis' && <AIAnalysis incidents={filteredIncidents} />}
          {activeTab === 'new' && (
            <div className="max-w-4xl mx-auto">
              <IncidentForm onSave={handleSaveIncident} onCancel={() => setActiveTab('list')} initialData={editingIncident} />
            </div>
          )}
        </div>
      </main>

      {viewingIncident && <IncidentDetail incident={viewingIncident} onClose={() => setViewingIncident(null)} onEdit={handleStartEdit} />}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={cancelDelete}></div>
          <div className="relative bg-[#0f172a] rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border-t-8 border-red-600 border-x border-b border-slate-800">
            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 border border-red-900/30">
              <i className="fa-solid fa-triangle-exclamation text-xl lg:text-2xl"></i>
            </div>
            <h3 className="text-lg lg:text-xl font-black text-center text-white mb-2 uppercase tracking-tight">ATENÇÃO: EXCLUSÃO</h3>
            <p className="text-slate-400 text-center mb-6 lg:mb-8 font-medium text-sm">O registro será removido permanentemente. Deseja prosseguir?</p>
            <div className="flex gap-4">
              <button onClick={cancelDelete} className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 font-black rounded-xl text-[10px] uppercase">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-600 text-white font-black rounded-xl text-[10px] uppercase">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
