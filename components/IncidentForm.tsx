
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Incident, IncidentType, IncidentStatus } from '../types.ts';

interface IncidentFormProps {
  onSave: (incident: Partial<Incident>) => void;
  onCancel: () => void;
  initialData?: Incident | null;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSave, onCancel, initialData }) => {
  const isEditing = !!initialData;
  const photoInputRef = useRef<HTMLInputElement>(null);

  const getLocalDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  
  const [formData, setFormData] = useState<Partial<Incident>>({
    type: IncidentType.CVLI,
    status: IncidentStatus.PENDENTE,
    date: getLocalDatetime(),
    location: { address: '' },
    description: '',
    cvliType: '',
    conductedCount: 0,
    conductedProfiles: [],
    hasFlagrante: 'Não Informado',
    weaponType: '',
    weaponCount: 1,
    ammoIntactCount: 0,
    ammoDeflagratedCount: 0,
    garrison: '',
    photo: '',
    vehicleDetails: '',
    stolenDetails: '',
    customType: '',
    victim: ''
  });

  const isWeaponSeizure = formData.type === IncidentType.ARMA_FOGO;
  const isSimulacro = formData.type === IncidentType.SIMULACRO;
  const isCVLI = formData.type === IncidentType.CVLI;
  const isMorteIntervencao = formData.type === IncidentType.MORTE_INTERVENCAO;
  const isCVLIStyle = isCVLI || isMorteIntervencao;
  const isCadaverOrSuicide = formData.type === IncidentType.CADAVER || formData.type === IncidentType.SUICIDIO;
  const isMandado = formData.type === IncidentType.MANDADO;
  const isDrogas = formData.type === IncidentType.DROGAS;
  const isRouboPessoa = formData.type === IncidentType.ROUBO_PESSOA;
  const isVeiculoRecuperado = formData.type === IncidentType.VEICULO_RECUPERADO;
  const isFurtoVeiculo = formData.type === IncidentType.FURTO_VEICULO;
  const isRouboVeiculo = formData.type === IncidentType.ROUBO_VEICULO;
  const isRouboPatrimonial = formData.type === IncidentType.ROUBO_RESIDENCIA || formData.type === IncidentType.ROUBO_COMERCIAL;
  const isOther = formData.type === IncidentType.OUTRO;
  
  const isPersonIncident = isCVLIStyle || isCadaverOrSuicide || isMandado || isRouboPessoa;

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().slice(0, 16),
        conductedProfiles: initialData.conductedProfiles || (initialData.conductedSex ? [initialData.conductedSex] : [])
      });
    }
  }, [initialData]);

  // Sincroniza o array de perfis com a quantidade de conduzidos
  useEffect(() => {
    const count = formData.conductedCount || 0;
    const currentProfiles = formData.conductedProfiles || [];
    
    if (currentProfiles.length !== count) {
      const nextProfiles = [...currentProfiles];
      if (nextProfiles.length < count) {
        for (let i = nextProfiles.length; i < count; i++) {
          nextProfiles.push('Não Informado');
        }
      } else {
        nextProfiles.length = count;
      }
      setFormData(prev => ({ ...prev, conductedProfiles: nextProfiles }));
    }
  }, [formData.conductedCount]);

  const handleProfileChange = (index: number, value: string) => {
    const nextProfiles = [...(formData.conductedProfiles || [])];
    nextProfiles[index] = value;
    setFormData({ ...formData, conductedProfiles: nextProfiles });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDescription = formData.description;
    let finalType = formData.type;
    const garrisonText = formData.garrison ? formData.garrison : 'NÃO INFORMADA';

    if (isOther) {
      finalType = formData.customType?.toUpperCase() || 'OUTRA NATUREZA';
      finalDescription = `${finalType}: ${formData.description} | Guarnição: ${garrisonText}`;
    } else if (isCVLIStyle) {
      const prefix = isCVLI ? 'CVLI' : 'MORTE POR INTERVENÇÃO POLICIAL';
      finalDescription = `${prefix}: ${formData.cvliType || 'NÃO ESPECIFICADO'} | Vítima: ${formData.victim || 'NÃO IDENTIFICADA'} | Guarnição: ${garrisonText}`;
    } else if (isCadaverOrSuicide) {
      finalDescription = `${formData.type}: Vítima: ${formData.victim || 'NÃO IDENTIFICADA'} | Guarnição: ${garrisonText}`;
    } else if (isMandado) {
      finalDescription = `Mandado de Prisão: Conduzido(a): ${formData.victim || 'NÃO IDENTIFICADO(A)'} | Guarnição: ${garrisonText}`;
    } else if (isRouboPessoa) {
      finalDescription = `Roubo à Pessoa: Vítima: ${formData.victim || 'NÃO IDENTIFICADA'} | Guarnição: ${garrisonText}`;
    } else if (isDrogas) {
      finalDescription = `Apreensão de Drogas: ${formData.drugDetails} | Guarnição: ${garrisonText}`;
    } else if (isWeaponSeizure) {
      finalDescription = `Apreensão de Arma de Fogo: ${formData.weaponType} | Qtd Armas: ${formData.weaponCount || 1} | Munição Intacta: ${formData.ammoIntactCount} | Munição Deflagrada: ${formData.ammoDeflagratedCount} | Guarnição: ${garrisonText}`;
    } else if (isSimulacro) {
      finalDescription = `Apreensão de Simulacro de Arma de Fogo | Guarnição: ${garrisonText}`;
    } else if (isVeiculoRecuperado || isFurtoVeiculo || isRouboVeiculo) {
      const victimPart = (isFurtoVeiculo || isRouboVeiculo) && formData.victim ? ` | Vítima: ${formData.victim}` : '';
      finalDescription = `${formData.type}: ${formData.vehicleDetails}${victimPart} | Guarnição: ${garrisonText}`;
    } else if (isRouboPatrimonial) {
      finalDescription = `${formData.type}: ${formData.stolenDetails} | Guarnição: ${garrisonText}`;
    }

    onSave({
      ...formData,
      type: finalType,
      id: isEditing ? initialData?.id : Math.random().toString(36).substr(2, 9),
      createdAt: isEditing ? initialData?.createdAt : new Date().toISOString(),
      description: finalDescription || '',
      sigma: formData.sigma || 'N/A', 
      garrison: formData.garrison || '',
      conductedSex: formData.conductedProfiles?.[0] || 'Não Informado' // Legado
    });
  };

  return (
    <div className="bg-[#0f172a] rounded-3xl shadow-2xl border-t-8 border-[#ffd700] border-x border-b border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 relative z-10">
      <div className="bg-[#1e293b]/30 p-8 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            {isEditing ? 'Atualizar Registro' : 'Inclusão de Ocorrência'}
          </h2>
          <p className="text-[#ffd700] font-black text-[10px] mt-1 uppercase tracking-[0.2em]">
            {isEditing ? `BO: ${initialData?.incidentNumber}` : 'POLÍCIA MILITAR DO MARANHÃO'}
          </p>
        </div>
        <button onClick={onCancel} type="button" className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 hover:bg-red-900/20 hover:text-red-500 transition-all flex items-center justify-center border border-slate-700">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 bg-[#0f172a]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-[#ffd700] text-[#002b5c] flex items-center justify-center font-black text-xs">01</span>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Natureza do Fato</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Incidente</label>
              <div className="relative">
                <i className="fa-solid fa-list-check absolute left-4 top-3.5 text-slate-500 z-10"></i>
                <select
                  required
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as IncidentType })}
                >
                  {Object.values(IncidentType).map((type) => (
                    <option key={type} value={type} className="bg-[#1e293b]">{type}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-4.5 text-slate-300 pointer-events-none"></i>
              </div>
            </div>

            {isOther && (
              <div className="space-y-1.5 animate-in slide-in-from-left-2">
                <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest ml-1">Especificar Natureza</label>
                <div className="relative">
                  <i className="fa-solid fa-pen-nib absolute left-4 top-3.5 text-slate-500"></i>
                  <input
                    required
                    value={formData.customType || ''}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#ffd700]/30 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-700"
                    placeholder="Digite a natureza..."
                    onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Número Ocorrência</label>
              <div className="relative">
                <i className="fa-solid fa-hashtag absolute left-4 top-3.5 text-slate-500"></i>
                <input
                  required
                  value={formData.incidentNumber || ''}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-700"
                  placeholder="BO-00000"
                  onChange={(e) => setFormData({ ...formData, incidentNumber: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código SIGMA</label>
              <div className="relative">
                <i className="fa-solid fa-fingerprint absolute left-4 top-3.5 text-slate-500"></i>
                <input
                  value={formData.sigma || ''}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-700"
                  placeholder="S-0000"
                  onChange={(e) => setFormData({ ...formData, sigma: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-[#ffd700] text-[#002b5c] flex items-center justify-center font-black text-xs">02</span>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Status e Tempo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
              <select
                required
                className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
              >
                {Object.values(IncidentStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data e Hora</label>
              <input
                type="datetime-local"
                required
                style={{ colorScheme: 'dark' }}
                className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-[#ffd700] text-[#002b5c] flex items-center justify-center font-black text-xs">03</span>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Localização</h3>
          </div>
          <div className="space-y-1.5">
            <input
              required
              value={formData.location?.address || ''}
              className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-700"
              placeholder="Endereço completo da ocorrência"
              onChange={(e) => setFormData({ ...formData, location: { address: e.target.value } })}
            />
          </div>
        </div>

        {isPersonIncident ? (
          <div className="space-y-6 bg-slate-800/20 p-4 sm:p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">04. Detalhes {isCVLIStyle ? `da ${isCVLI ? 'CVLI' : 'Intervenção'}` : 'de Pessoas'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isCVLIStyle && (
                <div className="md:col-span-2 space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {isMorteIntervencao ? 'HISTÓRICO DA OCORRÊNCIA' : 'Detalhe da Ocorrência'}
                  </label>
                  <input
                    value={formData.cvliType || ''}
                    required={isCVLI}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                    placeholder={isCVLI ? "Ex: HOMICÍDIO POR ARMA DE FOGO..." : "Descreva brevemente o histórico..."}
                    onChange={(e) => setFormData({ ...formData, cvliType: e.target.value.toUpperCase() })}
                  />
                </div>
              )}
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {isMandado ? "Nome do Conduzido(a)" : "Nome da Vítima"}
                </label>
                <input
                  value={formData.victim || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder={isMandado ? "Nome do Conduzido(a)" : "Nome da Vítima"}
                  onChange={(e) => setFormData({ ...formData, victim: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VTR / Guarnição</label>
                <input
                  value={formData.garrison || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder="Ex: VTR 43-100"
                  onChange={(e) => setFormData({ ...formData, garrison: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : isDrogas ? (
          <div className="space-y-6 bg-slate-800/20 p-4 sm:p-6 rounded-3xl border border-slate-800">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">04. Detalhes de Entorpecentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Drogas (QTD/Tipo)</label>
                <input
                  required
                  value={formData.drugDetails || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder="QTD e Tipo de Drogas"
                  onChange={(e) => setFormData({ ...formData, drugDetails: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VTR / Guarnição</label>
                <input
                  value={formData.garrison || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder="VTR / Guarnição"
                  onChange={(e) => setFormData({ ...formData, garrison: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : isWeaponSeizure || isSimulacro ? (
          <div className="space-y-6 bg-slate-800/20 p-4 sm:p-6 rounded-3xl border border-slate-800">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">
              04. Detalhes da Apreensão {isWeaponSeizure ? 'de Arma' : 'de Simulacro'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isWeaponSeizure && (
                <>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Arma</label>
                    <input
                      required
                      value={formData.weaponType || ''}
                      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                      placeholder="Ex: Revólver .38"
                      onChange={(e) => setFormData({ ...formData, weaponType: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest ml-1">Quantidade de Armas</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black"
                      value={formData.weaponCount || 1}
                      onChange={(e) => setFormData({ ...formData, weaponCount: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VTR / Guarnição</label>
                <input
                  value={formData.garrison || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder="Ex: VTR 43-100"
                  onChange={(e) => setFormData({ ...formData, garrison: e.target.value })}
                />
              </div>
              {isWeaponSeizure && (
                <>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Qtd Munição Intacta</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ammoIntactCount || 0}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none"
                      onChange={(e) => setFormData({ ...formData, ammoIntactCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Qtd Munição Deflagrada</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ammoDeflagratedCount || 0}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none"
                      onChange={(e) => setFormData({ ...formData, ammoDeflagratedCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (isVeiculoRecuperado || isFurtoVeiculo || isRouboVeiculo) ? (
          <div className="space-y-6 bg-slate-800/20 p-4 sm:p-6 rounded-3xl border border-slate-800">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">
              04. Detalhes do Veículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Informações do Veículo</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-bold placeholder-slate-700"
                  placeholder="Descreva marca, modelo, placa, cor e estado do veículo..."
                  value={formData.vehicleDetails || ''}
                  onChange={(e) => setFormData({ ...formData, vehicleDetails: e.target.value })}
                />
              </div>
              
              {(isFurtoVeiculo || isRouboVeiculo) && (
                <div className="md:col-span-2 space-y-1.5 mb-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest ml-1">Nome da Vítima</label>
                  <input
                    value={formData.victim || ''}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                    placeholder="Nome completo da vítima, se houver"
                    onChange={(e) => setFormData({ ...formData, victim: e.target.value })}
                  />
                </div>
              )}

              <div className="md:col-span-2 space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VTR / Guarnição</label>
                <input
                  value={formData.garrison || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder="Ex: VTR 43-100"
                  onChange={(e) => setFormData({ ...formData, garrison: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : isRouboPatrimonial ? (
          <div className="space-y-6 bg-slate-800/20 p-4 sm:p-6 rounded-3xl border border-slate-800">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">
              04. Bens Subtraídos e Detalhes do Roubo
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relação de Bens e Dinâmica</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-bold placeholder-slate-700"
                  placeholder="Descreva o que foi levado, número de suspeitos..."
                  value={formData.stolenDetails || ''}
                  onChange={(e) => setFormData({ ...formData, stolenDetails: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VTR / Guarnição</label>
                <input
                  value={formData.garrison || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder="Ex: VTR 43-100"
                  onChange={(e) => setFormData({ ...formData, garrison: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
              {isOther ? '04. Detalhes da Ocorrência' : '04. Relato Policial'}
            </h3>
            <textarea
              required
              rows={4}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-bold placeholder-slate-700"
              placeholder={isOther ? "Descreva detalhadamente a ocorrência..." : "Descreva o fato..."}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {!isRouboPessoa && !isDrogas && !isMandado && !isCVLIStyle && !isCadaverOrSuicide && (
               <div className="space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VTR / Guarnição</label>
                  <input
                    value={formData.garrison || ''}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                    placeholder="Ex: VTR 43-100"
                    onChange={(e) => setFormData({ ...formData, garrison: e.target.value })}
                  />
               </div>
            )}
          </div>
        )}

        <div className="space-y-6 bg-red-900/5 p-4 sm:p-6 rounded-3xl border border-red-900/20">
          <div className="flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">05</span>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Produtividade P/3</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5 mb-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantidade de Conduzidos</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none focus:border-[#ffd700]"
                value={formData.conductedCount || 0}
                onChange={(e) => setFormData({ ...formData, conductedCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5 mb-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Houve Flagrante?</label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none appearance-none cursor-pointer focus:border-[#ffd700]"
                value={formData.hasFlagrante}
                onChange={(e) => setFormData({ ...formData, hasFlagrante: e.target.value })}
              >
                <option value="Não Informado">Não Informado</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>

          {/* Perfis Dinâmicos */}
          {(formData.conductedCount || 0) > 0 && (
            <div className="mt-6 pt-6 border-t border-red-900/20 animate-in fade-in slide-in-from-top-4">
              <h4 className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest mb-4">Perfil dos Conduzidos ({formData.conductedCount})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(formData.conductedProfiles || []).map((profile, idx) => (
                  <div key={idx} className="space-y-1.5 mb-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Conduzido #{idx + 1}</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-xs outline-none appearance-none cursor-pointer focus:border-[#ffd700]"
                      value={profile}
                      onChange={(e) => handleProfileChange(idx, e.target.value)}
                    >
                      <option value="Não Informado">Não Informado</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Menor (Infrator)">Menor (Infrator)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-800">
          <button type="button" onClick={onCancel} className="px-4 sm:px-6 py-3 bg-slate-800 text-slate-400 font-black rounded-xl hover:text-white transition-all text-xs uppercase">Cancelar</button>
          <button type="submit" className="flex-1 px-4 sm:px-6 py-3 bg-[#ffd700] text-[#002b5c] font-black rounded-xl hover:bg-[#ffea00] transition-all text-xs uppercase shadow-lg shadow-[#ffd700]/10">Salvar Registro</button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;
