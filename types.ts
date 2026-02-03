
export enum ParticipantStatus {
  AVAILABLE = 'available',
  WINNER = 'winner',
  DISQUALIFIED = 'disqualified'
}

export interface Participant {
  bib: string;
  status: ParticipantStatus;
}

export interface Prize {
  id: string;
  name: string;
  totalQuota: number;
  remainingQuota: number;
  actualWinnersCount: number;
}

export interface WinnerRecord {
  bib: string;
  prizeId: string;
  prizeName: string;
  timestamp: number;
}

export interface Candidate {
  bib: string;
  prizeId: string;
  status: 'pending';
}

export interface AppState {
  participants: Participant[];
  prizes: Prize[];
  winners: WinnerRecord[];
  isLoggedIn: boolean;
}
