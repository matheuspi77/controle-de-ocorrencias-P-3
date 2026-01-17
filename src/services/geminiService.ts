import { GoogleGenAI } from "@google/genai";
import { Incident } from "../types.ts";

export const analyzeIncidents = async (incidents: Incident[]) => {
  // Always initialize GoogleGenAI inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Como um analista sênior de segurança pública, analise a seguinte lista de ocorrências policiais e forneça um relatório estruturado:
    
    Ocorrências:
    ${JSON.stringify(incidents.map(i => ({
      numero: i.incidentNumber,
      sigma: i.sigma,
      tipo: i.type,
      data: i.date,
      local: i.location.address,
      descricao: i.description
    })))}

    Seu relatório deve conter:
    1. Identificação de padrões (horários, locais recorrentes, tipos de crimes, correlação com códigos SIGMA).
    2. Nível de alerta atual da região.
    3. Recomendações estratégicas para policiamento preventivo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    // Access the .text property directly
    return response.text;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return "Não foi possível realizar a análise no momento.";
  }
};

export const getSmartSummary = async (incident: Incident) => {
    // Always initialize GoogleGenAI inside the function to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Resuma de forma técnica e concisa esta ocorrência policial (N° ${incident.incidentNumber}, SIGMA ${incident.sigma}) para um boletim rápido: ${incident.description}`;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      // Access the .text property directly
      return response.text;
    } catch (error) {
      return incident.description;
    }
}