export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ROSARY = 'ROSARY',
  LITURGY = 'LITURGY',
  JOURNAL = 'JOURNAL',
  NOVENAS = 'NOVENAS',
  SETTINGS = 'SETTINGS',
}

export interface Novena {
  id: string;
  title: string;
  image: string;
  currentDay: number;
  totalDays: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  type: 'NOTE' | 'INTENTION' | 'THANKS' | 'REFLECTION';
  content: string;
}

export interface UserStats {
  massCount: number;
  rosariesPrayed: number;
  dailyStreak: number;
}