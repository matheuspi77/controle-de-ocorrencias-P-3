
import { Incident, IncidentType, IncidentStatus } from './types.ts';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: IncidentType.ROUBO_VEICULO,
    incidentNumber: 'BO-2023-001',
    sigma: 'S-4421',
    description: 'Vítima abordada por dois indivíduos em uma moto. Veículo subtraído mediante ameaça.',
    location: { address: 'Av. Paulista, 1000 - São Paulo, SP' },
    date: '2023-10-25T14:30:00Z',
    status: IncidentStatus.PENDENTE,
    reportedBy: 'Oficial Silva',
    createdAt: '2023-10-25T15:00:00Z'
  },
  {
    id: '2',
    type: IncidentType.VEICULO_RECUPERADO,
    incidentNumber: 'BO-2023-002',
    sigma: 'S-8890',
    description: 'Veículo com queixa de roubo localizado abandonado em via pública.',
    location: { address: 'Rua Augusta, 500 - São Paulo, SP' },
    date: '2023-10-26T08:15:00Z',
    status: IncidentStatus.CONCLUIDO,
    reportedBy: 'Oficial Rocha',
    createdAt: '2023-10-26T09:00:00Z'
  },
  {
    id: '3',
    type: IncidentType.DROGAS,
    incidentNumber: 'BO-2023-003',
    sigma: 'S-1123',
    description: 'Indivíduo em atitude suspeita portando entorpecentes diversos prontos para comercialização.',
    location: { address: 'Pça da Sé - São Paulo, SP' },
    date: '2023-10-27T22:00:00Z',
    status: IncidentStatus.PENDENTE,
    reportedBy: 'Sargento Gomes',
    createdAt: '2023-10-27T22:30:00Z'
  },
  {
    id: '4',
    type: IncidentType.CVLI,
    incidentNumber: 'BO-2023-004',
    sigma: 'S-9901',
    description: 'Homicídio doloso confirmado no local. Perícia acionada.',
    location: { address: 'Rua dos Pinheiros, 120 - São Paulo, SP' },
    date: '2023-10-28T19:45:00Z',
    status: IncidentStatus.PENDENTE,
    reportedBy: 'Oficial Lima',
    createdAt: '2023-10-28T20:00:00Z'
  }
];
