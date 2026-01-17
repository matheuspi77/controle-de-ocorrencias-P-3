
export enum IncidentType {
  CVLI = 'CVLI',
  MORTE_INTERVENCAO = 'MORTE POR INTERVENÇÃO POLICIAL',
  ARMA_FOGO = 'APREENSÃO DE ARMA DE FOGO',
  CADAVER = 'ACHADO DE CADÁVER',
  SUICIDIO = 'SUICÍDIO',
  MANDADO = 'MANDADO DE PRISÃO',
  DROGAS = 'APREENSÃO DE DROGAS',
  SIMULACRO = 'APREENSÃO DE SIMULACRO',
  VEICULO_RECUPERADO = 'VEÍCULO RECUPERADO',
  FURTO_VEICULO = 'FURTO DE VEÍCULO',
  ROUBO_RESIDENCIA = 'ROUBO À RESIDÊNCIA',
  ROUBO_COMERCIAL = 'ROUBO À ESTAB. COMERCIAL',
  ROUBO_VEICULO = 'ROUBO DE VEÍCULO',
  ROUBO_PESSOA = 'ROUBO À PESSOA',
  OUTRO = 'OUTRO (ESPECIFICAR)'
}

export enum IncidentStatus {
  PENDENTE = 'Pendente',
  CONCLUIDO = 'Concluído'
}

export interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export interface Incident {
  id: string;
  type: IncidentType | string;
  incidentNumber: string;
  sigma: string;
  description: string;
  location: Location;
  date: string;
  status: IncidentStatus;
  reportedBy: string;
  createdAt: string;
  weaponType?: string;
  weaponCount?: number;
  ammoIntactCount?: number;
  ammoDeflagratedCount?: number;
  garrison?: string;
  victim?: string;
  cvliType?: string;
  drugDetails?: string;
  conductedCount?: number;
  conductedSex?: string; // Mantido para compatibilidade, mas priorizaremos Profiles
  conductedProfiles?: string[];
  hasFlagrante?: string;
  photo?: string;
  vehicleDetails?: string;
  stolenDetails?: string;
  customType?: string;
}

export interface DailySummary {
  id: string;
  date: string;
  counts: Record<string, number>;
  conduzidos: {
    masculino: number;
    feminino: number;
    menor_infrator: number;
  };
  reportedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<IncidentStatus, number>;
}
