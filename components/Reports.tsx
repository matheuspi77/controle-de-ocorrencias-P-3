
import React, { useState, useMemo } from 'react';
import { Incident, IncidentType, DailySummary } from '../types';

interface ReportsProps {
  incidents: Incident[];
  dailySummaries: DailySummary[];
}

const Reports: React.FC<ReportsProps> = ({ incidents, dailySummaries }) => {
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'summaries'>('incidents');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<Set<string>>(new Set());
  const [selectedSummaryIds, setSelectedSummaryIds] = useState<Set<string>>(new Set());

  const natureLabels: Record<string, string> = {
    bo: 'B.O', tco: 'TCO', tentativa_homicidio: 'TENT. HOMICÍDIO', tentativa_roubo: 'TENT. ROUBO',
    tentativa_latrocinio: 'TENT. LATROCÍNIO', tentativa_feminicidio: 'TENT. FEMINICÍDIO',
    violencia_domestica: 'VIOLÊNCIA DOMÉSTICA', estupro_vulneravel: 'ESTUPRO VULNERÁVEL',
    apreensao_veiculo: 'APREENSÃO VEÍCULO', desacato: 'DESACATO',
    ameaca: 'AMEAÇA', arrombamento: 'ARROMBAMENTO', acidente_transito: 'ACIDENTE TRÂNSITO',
    embriaguez: 'EMBRIAGUEZ', flagrantes: 'FLAGRANTES', quebra_medida: 'MEDIDA PROTETIVA'
  };

  const conduzidosLabels: Record<string, string> = {
    masculino: 'Masc', feminino: 'Fem',
    menor_infrator: 'Menor Infr',
    morte_intervencao: 'Morte Interv'
  };

  const getCleanDescription = (inc: Incident) => {
    const typeLabel = typeof inc.type === 'string' ? inc.type : '';
    const regex = new RegExp(`^${typeLabel}[:\\s-]*`, 'i');
    return inc.description.replace(regex, '').trim();
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const incDate = inc.date.split('T')[0];
      const matchesDate = (!reportStartDate || incDate >= reportStartDate) && 
                         (!reportEndDate || incDate <= reportEndDate);
      const matchesType = selectedType === 'TODOS' || inc.type === selectedType;
      return matchesDate && matchesType;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [incidents, reportStartDate, reportEndDate, selectedType]);

  const filteredSummaries = useMemo(() => {
    return dailySummaries.filter(sum => {
      const sumDate = sum.date;
      return (!reportStartDate || sumDate >= reportStartDate) && 
             (!reportEndDate || sumDate <= reportEndDate);
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [dailySummaries, reportStartDate, reportEndDate]);

  const toggleIncidentSelection = (id: string) => {
    const next = new Set(selectedIncidentIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIncidentIds(next);
  };

  const toggleSummarySelection = (id: string) => {
    const next = new Set(selectedSummaryIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedSummaryIds(next);
  };

  const selectAllVisible = () => {
    if (activeSubTab === 'incidents') {
      const next = new Set(selectedIncidentIds);
      filteredIncidents.forEach(i => next.add(i.id));
      setSelectedIncidentIds(next);
    } else {
      const next = new Set(selectedSummaryIds);
      filteredSummaries.forEach(s => next.add(s.id));
      setSelectedSummaryIds(next);
    }
  };

  const clearVisibleSelection = () => {
    if (activeSubTab === 'incidents') {
      const next = new Set(selectedIncidentIds);
      filteredIncidents.forEach(i => next.delete(i.id));
      setSelectedIncidentIds(next);
    } else {
      const next = new Set(selectedSummaryIds);
      filteredSummaries.forEach(s => next.delete(s.id));
      setSelectedSummaryIds(next);
    }
  };

  const totalSelected = selectedIncidentIds.size + selectedSummaryIds.size;

  const generatePDF = () => {
    if (totalSelected === 0) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        const exportIncidents = incidents.filter(i => selectedIncidentIds.has(i.id));
        const exportSummaries = dailySummaries.filter(s => selectedSummaryIds.has(s.id));
        
        doc.setFontSize(14);
        doc.setTextColor(0, 43, 92);
        doc.setFont("helvetica", "bold");
        doc.text("POLÍCIA MILITAR DO MARANHÃO", 105, 15, { align: "center" });
        doc.setFontSize(11);
        doc.text("43° BPM - P3", 105, 22, { align: "center" });
        doc.setDrawColor(180, 0, 0);
        doc.line(20, 30, 190, 30);
        doc.setFontSize(16);
        doc.text("RELATÓRIO ESTATÍSTICO OPERACIONAL", 105, 42, { align: "center" });
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const periodText = reportStartDate && reportEndDate ? `Período: ${reportStartDate} até ${reportEndDate}` : "Período: Integral";
        doc.text(periodText, 20, 52);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, 190, 52, { align: "right" });

        let currentY: number = 65;

        if (exportIncidents.length > 0) {
            const titleResumo = selectedType === 'TODOS' ? "RESUMO GERAL DE ATIVIDADES" : `DADOS CONSOLIDADOS: ${selectedType}`;
            doc.setFillColor(0, 43, 92);
            doc.roundedRect(20, currentY, 170, 10, 2, 2, 'F');
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(titleResumo, 105, currentY + 7, { align: "center" });
            currentY += 10;
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.rect(20, currentY, 170, 40, 'FD');
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "normal");

            const totalIncidents = exportIncidents.length;
            const totalConducted = exportIncidents.reduce((s, i) => s + (i.conductedCount || 0), 0);
            const flagranteCount = exportIncidents.filter(i => i.hasFlagrante === 'Sim').length;

            if (selectedType === IncidentType.ARMA_FOGO) {
                const totalWeapons = exportIncidents.reduce((s, i) => s + (i.weaponCount || 1), 0);
                const totalIntact = exportIncidents.reduce((s, i) => s + (i.ammoIntactCount || 0), 0);
                const totalDeflagrated = exportIncidents.reduce((s, i) => s + (i.ammoDeflagratedCount || 0), 0);
                const avgAmmo = totalWeapons > 0 ? (totalIntact / totalWeapons).toFixed(1) : 0;
                doc.setFont("helvetica", "bold");
                doc.text(`TOTAL DE ARMAS APREENDIDAS:`, 25, currentY + 10);
                doc.setFont("helvetica", "normal");
                doc.text(`${totalWeapons} un.`, 85, currentY + 10);
                doc.setFont("helvetica", "bold");
                doc.text(`Munições (Intactas/Def.):`, 25, currentY + 18);
                doc.setFont("helvetica", "normal");
                doc.text(`${totalIntact} / ${totalDeflagrated}`, 85, currentY + 18);
                doc.setFont("helvetica", "bold");
                doc.text(`Média Munição/Arma:`, 25, currentY + 26);
                doc.setFont("helvetica", "normal");
                doc.text(`${avgAmmo}`, 85, currentY + 26);
                doc.setFont("helvetica", "bold");
                doc.text(`Ocorrências c/ Flagrante:`, 115, currentY + 10);
                doc.setFont("helvetica", "normal");
                doc.text(`${flagranteCount}`, 165, currentY + 10);
                doc.setFont("helvetica", "bold");
                doc.text(`Pessoas Conduzidas:`, 115, currentY + 18);
                doc.setFont("helvetica", "normal");
                doc.text(`${totalConducted}`, 165, currentY + 18);
                doc.setFont("helvetica", "bold");
                doc.text(`Total de Ocorrências:`, 115, currentY + 26);
                doc.setFont("helvetica", "normal");
                doc.text(`${totalIncidents}`, 165, currentY + 26);
            } else if (selectedType === IncidentType.DROGAS) {
                const drugSummary = exportIncidents.map(i => i.drugDetails).filter(Boolean).join(', ');
                doc.text(`- Volume de Ocorrências: ${totalIncidents}`, 25, currentY + 10);
                doc.text(`- Total de Indivíduos Detidos: ${totalConducted}`, 25, currentY + 18);
                doc.text(`- Registros de Flagrante: ${flagranteCount}`, 25, currentY + 26);
                doc.text(`- Detalhes principais observados:`, 110, currentY + 10);
                const splitDrugs = doc.splitTextToSize(drugSummary || 'N/A', 60);
                doc.text(splitDrugs.slice(0, 3), 110, currentY + 15);
            } else {
                doc.text(`- Total de Registros Selecionados: ${totalIncidents}`, 25, currentY + 10);
                doc.text(`- Total de Conduções Efetuadas: ${totalConducted}`, 25, currentY + 18);
                doc.text(`- Flagrantes Delitos: ${flagranteCount}`, 25, currentY + 26);
                doc.text(`- Unidade Responsável: 43° BPM - P3`, 110, currentY + 10);
            }
            currentY += 50;
        }

        if (exportSummaries.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 43, 92);
          doc.setFont("helvetica", "bold");
          doc.text("1. ESTATÍSTICA DE PRODUÇÃO DIÁRIA (P3)", 20, currentY);
          currentY += 12;
          exportSummaries.forEach(sum => {
            if (currentY > 240) { doc.addPage(); currentY = 20; }
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            const sumDateFormatted = sum.date.split('-').reverse().join('/');
            doc.text(`Data: ${sumDateFormatted}`, 20, currentY);
            currentY += 8; // Espaço após a data

            const countsData = (Object.entries(sum.counts) as [string, number][]).filter(([_, val]) => val > 0).map(([key, val]) => [natureLabels[key] || key, val]);
            const condData = (Object.entries(sum.conduzidos) as [string, number][]).filter(([_, val]) => val > 0).map(([key, val]) => [conduzidosLabels[key] || key, val]);
            
            if (countsData.length > 0 || condData.length > 0) {
              const startYForTables = currentY;
              (doc as any).autoTable({ 
                startY: startYForTables, 
                head: [['Natureza/Produtividade', 'Qtd']], 
                body: countsData, 
                theme: 'grid', 
                headStyles: { fillColor: [0, 43, 92], textColor: [255, 255, 255], fontSize: 8 }, 
                bodyStyles: { fontSize: 7 }, 
                margin: { left: 25 }, 
                tableWidth: 80 
              });
              const finalY1 = (doc as any).lastAutoTable.finalY;
              
              (doc as any).autoTable({ 
                startY: startYForTables, 
                head: [['Perfil Conduzidos', 'Qtd']], 
                body: condData, 
                theme: 'grid', 
                headStyles: { fillColor: [180, 0, 0], textColor: [255, 255, 255], fontSize: 8 }, 
                bodyStyles: { fontSize: 7 }, 
                margin: { left: 110 }, 
                tableWidth: 75 
              });
              const finalY2 = (doc as any).lastAutoTable.finalY;
              
              // Define currentY como o maior finalY entre as duas tabelas + respiro
              currentY = Math.max(finalY1, finalY2) + 15;
            } else {
              doc.setFontSize(8); 
              doc.text("Sem registros quantitativos.", 25, currentY); 
              currentY += 10;
            }
          });
        }

        if (exportIncidents.length > 0) {
          if (currentY > 230) { doc.addPage(); currentY = 20; }
          doc.setFontSize(12); doc.setTextColor(0, 43, 92); doc.setFont("helvetica", "bold");
          doc.text("2. DETALHAMENTO DE OCORRÊNCIAS", 20, currentY);
          currentY += 12;
          exportIncidents.forEach((inc, idx) => {
            if (currentY > 250) { doc.addPage(); currentY = 20; }
            doc.setFontSize(9); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
            doc.text(`${idx + 1}. [${inc.incidentNumber}] - ${inc.type}`, 20, currentY);
            currentY += 6; doc.setFont("helvetica", "normal"); doc.setFontSize(8);
            doc.text(`SIGMA: ${inc.sigma} | Local: ${inc.location.address}`, 25, currentY);
            currentY += 5;
            const desc = getCleanDescription(inc);
            const splitDesc = doc.splitTextToSize(desc, 170);
            doc.text(splitDesc, 25, currentY);
            currentY += (splitDesc.length * 4) + 6;
            doc.setDrawColor(230, 230, 230); doc.line(25, currentY - 3, 185, currentY - 3); currentY += 2;
          });
        }
        doc.save(`Relatorio_Consolidado_P3_${new Date().getTime()}.pdf`);
      } catch (err) { alert("Erro ao gerar PDF."); } finally { setIsGenerating(false); }
    }, 500);
  };

  const generateWord = () => {
    if (totalSelected === 0) return;
    setIsGenerating(true);

    try {
        const exportIncidents = incidents.filter(i => selectedIncidentIds.has(i.id));
        const exportSummaries = dailySummaries.filter(s => selectedSummaryIds.has(s.id));
        const periodText = reportStartDate && reportEndDate ? `${reportStartDate} até ${reportEndDate}` : "Integral";
        
        // Dados do Dashboard
        const totalIncidents = exportIncidents.length;
        const totalConducted = exportIncidents.reduce((s, i) => s + (i.conductedCount || 0), 0);
        const flagranteCount = exportIncidents.filter(i => i.hasFlagrante === 'Sim').length;
        
        const totalWeapons = exportIncidents.reduce((s, i) => s + (i.weaponCount || 1), 0);
        const totalIntact = exportIncidents.reduce((s, i) => s + (i.ammoIntactCount || 0), 0);
        const totalDeflagrated = exportIncidents.reduce((s, i) => s + (i.ammoDeflagratedCount || 0), 0);

        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Relatório Operacional 43 BPM</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .header { text-align: center; border-bottom: 2px solid #b8102e; padding-bottom: 10px; margin-bottom: 20px; }
                .inst { color: #002b5c; font-weight: bold; margin-bottom: 0; }
                .title { font-size: 24px; font-weight: bold; margin-top: 20px; text-align: center; }
                .summary-box { background-color: #f8fafc; border: 2px solid #002b5c; padding: 15px; margin-bottom: 30px; border-radius: 5px; }
                .summary-grid { display: table; width: 100%; border-spacing: 10px; }
                .summary-item { display: table-cell; border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; }
                .section-title { font-size: 16px; font-weight: bold; color: #002b5c; border-bottom: 1px solid #002b5c; margin-top: 30px; margin-bottom: 15px; }
                .incident-item { border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px; }
                .inc-header { font-weight: bold; font-size: 12px; }
                .inc-meta { font-size: 10px; color: #666; }
                .inc-desc { font-size: 11px; font-style: italic; color: #333; margin-top: 5px; }
                .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #999; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #ddd; padding: 6px; font-size: 10px; text-align: left; }
                th { background-color: #002b5c; color: white; }
                .th-red { background-color: #b8102e; }
                .data-label { margin-bottom: 10px; font-size: 12px; }
            </style>
            </head>
            <body>
                <div class="header">
                    <p class="inst">POLÍCIA MILITAR DO MARANHÃO</p>
                    <p style="margin-top: 0;">43° BPM - P3</p>
                </div>
                
                <h1 class="title">RELATÓRIO ESTATÍSTICO OPERACIONAL</h1>
                <p style="text-align: center; font-size: 10px;">Período: ${periodText} | Gerado em: ${new Date().toLocaleString()}</p>

                <div class="summary-box">
                    <h2 style="margin-top:0; font-size: 14px; text-transform: uppercase; color: #002b5c;">
                        ${selectedType === 'TODOS' ? 'RESUMO GERAL DE ATIVIDADES' : 'DADOS CONSOLIDADOS: ' + selectedType}
                    </h2>
                    <table style="border:none;">
                        <tr>
                            <td style="border:none; width: 50%;">
                                <strong>Volume de Ocorrências:</strong> ${totalIncidents}<br/>
                                <strong>Pessoas Conduzidas:</strong> ${totalConducted}<br/>
                                <strong>Flagrantes Delitos:</strong> ${flagranteCount}
                            </td>
                            <td style="border:none; width: 50%;">
                                ${selectedType === IncidentType.ARMA_FOGO ? `
                                    <strong>TOTAL DE ARMAS:</strong> ${totalWeapons} un.<br/>
                                    <strong>Munição Intacta/Deflagrada:</strong> ${totalIntact} / ${totalDeflagrated}<br/>
                                    <strong>Média Munição/Arma:</strong> ${(totalWeapons > 0 ? (totalIntact / totalWeapons).toFixed(1) : 0)}
                                ` : `<strong>Unidade Responsável:</strong> 43° BPM - P3`}
                            </td>
                        </tr>
                    </table>
                </div>

                ${exportSummaries.length > 0 ? `
                    <div class="section-title">1. ESTATÍSTICA DE PRODUÇÃO DIÁRIA (P3)</div>
                    ${exportSummaries.map(sum => {
                        const counts = (Object.entries(sum.counts) as [string, number][]).filter(([_, val]) => val > 0);
                        const cond = (Object.entries(sum.conduzidos) as [string, number][]).filter(([_, val]) => val > 0);
                        return `
                            <div class="data-label"><strong>Data: ${sum.date.split('-').reverse().join('/')}</strong></div>
                            <div style="margin-bottom: 20px;">
                                <table style="width: 48%; float: left; margin-right: 4%;">
                                    <tr><th>Natureza</th><th>Qtd</th></tr>
                                    ${counts.length > 0 ? counts.map(([k, v]) => `<tr><td>${natureLabels[k] || k}</td><td>${v}</td></tr>`).join('') : '<tr><td colspan="2">N/A</td></tr>'}
                                </table>
                                <table style="width: 48%;">
                                    <tr><th class="th-red">Perfil Conduzido</th><th class="th-red">Qtd</th></tr>
                                    ${cond.length > 0 ? cond.map(([k, v]) => `<tr><td>${conduzidosLabels[k] || k}</td><td>${v}</td></tr>`).join('') : '<tr><td colspan="2">N/A</td></tr>'}
                                </table>
                            </div>
                            <div style="clear:both; height: 10px;"></div>
                        `;
                    }).join('')}
                ` : ''}

                ${exportIncidents.length > 0 ? `
                    <div class="section-title">2. DETALHAMENTO DE OCORRÊNCIAS</div>
                    ${exportIncidents.map((inc, idx) => `
                        <div class="incident-item">
                            <div class="inc-header">${idx + 1}. [${inc.incidentNumber}] - ${inc.type}</div>
                            <div class="inc-meta">SIGMA: ${inc.sigma} | Local: ${inc.location.address} | Data: ${new Date(inc.date).toLocaleString()}</div>
                            <div class="inc-desc">${getCleanDescription(inc)}</div>
                        </div>
                    `).join('')}
                ` : ''}

                <div class="footer">
                    <br/><br/>
                    <p>________________________________________________</p>
                    <p><strong>COORDENADOR DE OPERAÇÕES E ESTATÍSTICA (P-3) / 43° BPM</strong></p>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Relatorio_P3_${new Date().getTime()}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) { alert("Erro ao gerar Word."); } finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-file-export text-[#ffd700]"></i>
                Compilador de Relatórios Técnicos
            </h2>
            {selectedType !== 'TODOS' && (
                <span className="px-4 py-1.5 bg-[#ffd700]/10 text-[#ffd700] rounded-full text-[10px] font-black uppercase border border-[#ffd700]/30 animate-pulse">
                    Relatório Analítico Ativado
                </span>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data Inicial</label>
            <input type="date" style={{ colorScheme: 'dark' }} className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none focus:border-[#ffd700]" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data Final</label>
            <input type="date" style={{ colorScheme: 'dark' }} className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none focus:border-[#ffd700]" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Natureza</label>
            <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none focus:border-[#ffd700]" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="TODOS">TODAS AS OCORRÊNCIAS</option>
              {Object.values(IncidentType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="flex gap-2 lg:col-span-2">
            <button onClick={generatePDF} disabled={isGenerating || totalSelected === 0} className={`flex-1 px-4 py-3.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${totalSelected > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-file-pdf"></i>} PDF Consolidado
            </button>
            <button onClick={generateWord} disabled={isGenerating || totalSelected === 0} className={`flex-1 px-4 py-3.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${totalSelected > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-file-word"></i>} Word Consolidado
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex bg-white/5 border-b border-slate-800">
          <button onClick={() => setActiveSubTab('incidents')} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-b-4 ${activeSubTab === 'incidents' ? 'border-[#ffd700] text-white bg-[#ffd700]/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            <i className="fa-solid fa-list-check"></i> Ocorrências <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-black">{selectedIncidentIds.size}</span>
          </button>
          <button onClick={() => setActiveSubTab('summaries')} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-b-4 ${activeSubTab === 'summaries' ? 'border-[#ffd700] text-white bg-[#ffd700]/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            <i className="fa-solid fa-chart-simple"></i> Resumos Diários <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-black">{selectedSummaryIds.size}</span>
          </button>
        </div>

        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Registros Disponíveis para Seleção</h3>
          <div className="flex gap-2">
            <button onClick={selectAllVisible} className="text-[10px] font-black text-white uppercase bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">Marcar Todos</button>
            <button onClick={clearVisibleSelection} className="text-[10px] font-black text-red-500 uppercase bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/10 hover:bg-red-500/10 transition-colors">Desmarcar</button>
          </div>
        </div>

        <div className="p-8">
          {activeSubTab === 'incidents' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredIncidents.length > 0 ? filteredIncidents.map(inc => (
                <div key={inc.id} onClick={() => toggleIncidentSelection(inc.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedIncidentIds.has(inc.id) ? 'bg-[#ffd700]/10 border-[#ffd700] shadow-lg shadow-[#ffd700]/5' : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${selectedIncidentIds.has(inc.id) ? 'bg-[#ffd700] border-[#ffd700]' : 'border-slate-700'}`}>
                    {selectedIncidentIds.has(inc.id) && <i className="fa-solid fa-check text-[#002b5c] text-[10px]"></i>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-[#ffd700] uppercase tracking-tighter">{inc.incidentNumber}</span>
                      <span className="text-[9px] font-black text-slate-500">{new Date(inc.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <h4 className="text-xs font-black text-white uppercase truncate">{inc.type}</h4>
                  </div>
                </div>
              )) : <div className="col-span-full py-10 text-center text-slate-600 font-black uppercase text-[10px]">Nenhuma ocorrência encontrada</div>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSummaries.length > 0 ? filteredSummaries.map(sum => (
                <div key={sum.id} onClick={() => toggleSummarySelection(sum.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedSummaryIds.has(sum.id) ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5' : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${selectedSummaryIds.has(sum.id) ? 'bg-blue-600 border-blue-500' : 'border-slate-700'}`}>
                    {selectedSummaryIds.has(sum.id) && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter block mb-1">RESUMO DIÁRIO P3</span>
                    <h4 className="text-sm font-black text-white uppercase">{sum.date.split('-').reverse().join('/')}</h4>
                  </div>
                </div>
              )) : <div className="col-span-full py-10 text-center text-slate-600 font-black uppercase text-[10px]">Nenhum resumo encontrado</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
