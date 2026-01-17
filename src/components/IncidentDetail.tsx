
import React from 'react';
import { Incident, IncidentStatus, IncidentType } from '../types';

interface IncidentDetailProps {
  incident: Incident;
  onClose: () => void;
  onEdit: (incident: Incident) => void;
}

const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, onClose, onEdit }) => {
  const isWeaponSeizure = incident.type === IncidentType.ARMA_FOGO;
  const isSimulacro = incident.type === IncidentType.SIMULACRO;
  const isCVLI = incident.type === IncidentType.CVLI;
  const isMorteIntervencao = incident.type === IncidentType.MORTE_INTERVENCAO;
  const isCVLIStyle = isCVLI || isMorteIntervencao;
  const isCadaverOrSuicide = incident.type === IncidentType.CADAVER || incident.type === IncidentType.SUICIDIO;
  const isMandado = incident.type === IncidentType.MANDADO;
  const isDrogas = incident.type === IncidentType.DROGAS;
  const isRouboPessoa = incident.type === IncidentType.ROUBO_PESSOA;
  const isVeiculoRecuperado = incident.type === IncidentType.VEICULO_RECUPERADO;
  const isFurtoVeiculo = incident.type === IncidentType.FURTO_VEICULO;
  const isRouboVeiculo = incident.type === IncidentType.ROUBO_VEICULO;
  const isRouboPatrimonial = incident.type === IncidentType.ROUBO_RESIDENCIA || incident.type === IncidentType.ROUBO_COMERCIAL;
  const isPersonIncident = isCVLIStyle || isCadaverOrSuicide || isMandado || isRouboPessoa;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative bg-[#0f172a] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-800">
        
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ffd700] rounded-xl flex items-center justify-center text-[#002b5c] shadow-lg shadow-[#ffd700]/10">
              <i className="fa-solid fa-file-shield text-lg sm:text-xl"></i>
            </div>
            <div>
              <h2 className="text-sm sm:text-xl font-black text-white uppercase leading-none">Relatório de Ocorrência</h2>
              <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">43° Batalhão de Polícia Militar - MA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(incident)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1e293b] text-[#ffd700] font-bold rounded-lg hover:bg-[#ffd700] hover:text-[#002b5c] transition-all text-[10px] sm:text-xs flex items-center gap-2 border border-[#ffd700]/20"
            >
              <i className="fa-solid fa-pen"></i> <span className="hidden sm:inline">EDITAR</span>
            </button>
            <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-lg sm:text-xl"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-[#0f172a] custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#1e293b] p-3 sm:p-4 rounded-2xl border border-slate-800">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase mb-1">BO SIS</p>
              <p className="text-xs sm:text-sm font-black text-white">{incident.incidentNumber}</p>
            </div>
            <div className="bg-[#1e293b] p-3 sm:p-4 rounded-2xl border border-slate-800">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase mb-1">SIGMA</p>
              <p className="text-xs sm:text-sm font-mono font-black text-[#ffd700]">{incident.sigma}</p>
            </div>
            <div className="bg-[#1e293b] p-3 sm:p-4 rounded-2xl border border-slate-800">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase mb-1">Status</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase mt-1 ${
                incident.status === IncidentStatus.CONCLUIDO ? 'bg-green-900/40 text-green-400' : 'bg-amber-900/40 text-amber-400'
              }`}>
                {incident.status}
              </span>
            </div>
            <div className="bg-[#1e293b] p-3 sm:p-4 rounded-2xl border border-slate-800">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase mb-1">Data/Hora</p>
              <p className="text-xs sm:text-sm font-bold text-white">{new Date(incident.date).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="md:col-span-1 space-y-6">
              <div>
                <h3 className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Natureza</h3>
                <p className="text-xs sm:text-sm font-black text-red-500 bg-red-900/10 p-3 rounded-xl border border-red-900/20 uppercase">
                  {incident.type}
                </p>
              </div>
              
              {(incident.conductedCount && incident.conductedCount > 0) && (
                <div className="bg-red-600 p-4 rounded-2xl shadow-lg border border-red-500">
                  <p className="text-[9px] font-black text-white uppercase mb-2 tracking-widest opacity-80">Produtividade P3</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl sm:text-3xl font-black text-white">{incident.conductedCount}</span>
                    <span className="text-[9px] sm:text-[10px] font-black text-white uppercase leading-tight">
                      Conduzido(s)<br/>Identificado(s)
                    </span>
                  </div>
                  <div className="space-y-1 mt-2 pt-2 border-t border-white/20">
                    {(incident.conductedProfiles || [incident.conductedSex || 'Não Informado']).map((profile, i) => (
                      <div key={i} className="flex justify-between items-center text-[9px] font-black text-white/90 uppercase">
                        <span>Perfil #{i+1}</span>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded">{profile}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {incident.hasFlagrante && incident.hasFlagrante !== 'Não Informado' && (
                <div className={`p-4 rounded-2xl shadow-lg border flex items-center justify-between ${
                  incident.hasFlagrante === 'Sim' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <div>
                    <p className="text-[9px] font-black uppercase mb-0.5 tracking-widest opacity-80">Flagrante Delito</p>
                    <p className="text-base sm:text-lg font-black uppercase leading-none">{incident.hasFlagrante}</p>
                  </div>
                  <i className={`fa-solid ${incident.hasFlagrante === 'Sim' ? 'fa-handcuffs' : 'fa-ban'} text-lg sm:text-xl opacity-50`}></i>
                </div>
              )}

              <div>
                <h3 className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Localização</h3>
                <div className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed">
                  <i className="fa-solid fa-location-dot mr-2 text-red-600"></i>
                  {incident.location.address}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              {isPersonIncident ? (
                <div className="space-y-6">
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className={`fa-solid ${isMandado ? 'fa-user-lock' : 'fa-user-tag'} text-red-500`}></i> 
                      {isMandado ? 'Dados do Conduzido(a)' : 'Dados da Vítima'}
                    </h3>
                    <div className="space-y-4 italic">
                      {isCVLIStyle && (
                        <div className="flex flex-col border-b border-slate-700/50 pb-2">
                           <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1">
                             {isMorteIntervencao ? 'HISTÓRICO DA OCORRÊNCIA' : 'Detalhe'}
                           </span>
                           <span className="text-xs sm:text-sm font-bold text-white uppercase">{incident.cvliType}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-slate-700/50 pb-2">
                         <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">
                           {isMandado ? 'Conduzido(a)' : 'Vítima'}
                         </span>
                         <span className="text-xs sm:text-sm font-bold text-white uppercase">{incident.victim || 'Não informada'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-users text-[#ffd700]"></i> Guarnição Responsável
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#ffd700] uppercase italic">{incident.garrison || 'Não informada'}</p>
                  </div>
                </div>
              ) : isDrogas ? (
                <div className="space-y-6">
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-pills text-green-500"></i> Material Apreendido
                    </h3>
                    <div className="space-y-4 italic">
                      <div className="flex justify-between border-b border-slate-700/50 pb-2">
                         <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">Drogas</span>
                         <span className="text-xs sm:text-sm font-bold text-white uppercase">{incident.drugDetails || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-users text-[#ffd700]"></i> Guarnição Responsável
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#ffd700] uppercase italic">{incident.garrison || 'Não informada'}</p>
                  </div>
                </div>
              ) : (isWeaponSeizure || isSimulacro) ? (
                <div className="space-y-6">
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className={`fa-solid ${isWeaponSeizure ? 'fa-gun' : 'fa-skull'} text-blue-500`}></i> Material Apreendido
                    </h3>
                    <div className="grid grid-cols-2 gap-4 italic">
                      {isWeaponSeizure && (
                        <>
                          <div className="flex justify-between border-b border-slate-700/50 pb-2 col-span-2">
                             <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">Arma</span>
                             <span className="text-xs sm:text-sm font-bold text-white uppercase">{incident.weaponType || 'Não informada'}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700/50 pb-2 col-span-2">
                             <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">Qtd de Armas</span>
                             <span className="text-xs sm:text-sm font-bold text-white uppercase">{incident.weaponCount || 1}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700/50 pb-2">
                             <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">Intactas</span>
                             <span className="text-xs sm:text-sm font-bold text-white">{incident.ammoIntactCount || 0}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700/50 pb-2">
                             <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">Deflagradas</span>
                             <span className="text-xs sm:text-sm font-bold text-white">{incident.ammoDeflagratedCount || 0}</span>
                          </div>
                        </>
                      )}
                      {isSimulacro && (
                        <div className="flex justify-between border-b border-slate-700/50 pb-2 col-span-2">
                           <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">Item</span>
                           <span className="text-xs sm:text-sm font-bold text-white uppercase">Simulacro de Arma de Fogo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {incident.photo && (
                    <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                      <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-image text-blue-400"></i> Registro Fotográfico
                      </h3>
                      <img src={incident.photo} alt="Foto da Apreensão" className="w-full h-auto rounded-xl border border-white/5 shadow-2xl" />
                    </div>
                  )}

                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-users text-[#ffd700]"></i> Guarnição Responsável
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#ffd700] uppercase italic">{incident.garrison || 'Não informada'}</p>
                  </div>
                </div>
              ) : (isVeiculoRecuperado || isFurtoVeiculo || isRouboVeiculo) ? (
                <div className="space-y-6">
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-car text-blue-500"></i> Veículo {isVeiculoRecuperado ? 'Recuperado' : isFurtoVeiculo ? 'Furtado' : 'Roubado'}
                    </h3>
                    <div className="space-y-4 italic">
                      <div className="flex flex-col border-b border-slate-700/50 pb-2">
                         <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1">
                           Detalhes
                         </span>
                         <span className="text-xs sm:text-sm font-bold text-white uppercase leading-relaxed">{incident.vehicleDetails || 'Não informados'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-users text-[#ffd700]"></i> Guarnição Responsável
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#ffd700] uppercase italic">{incident.garrison || 'Não informada'}</p>
                  </div>
                </div>
              ) : isRouboPatrimonial ? (
                <div className="space-y-6">
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-house-chimney text-amber-500"></i> {incident.type}
                    </h3>
                    <div className="space-y-4 italic">
                      <div className="flex flex-col border-b border-slate-700/50 pb-2">
                         <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1">
                           Bens e Dinâmica
                         </span>
                         <span className="text-xs sm:text-sm font-bold text-white uppercase leading-relaxed whitespace-pre-wrap">{incident.stolenDetails || 'Não informados'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-users text-[#ffd700]"></i> Guarnição Responsável
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#ffd700] uppercase italic">{incident.garrison || 'Não informada'}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner h-full">
                  <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-align-left text-[#ffd700]"></i> Relato Técnico
                  </h3>
                  <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium italic">
                    {incident.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-800 bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-[#ffd700] text-[#002b5c] font-black rounded-xl hover:bg-[#ffea00] transition-all text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-[#ffd700]/10"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
