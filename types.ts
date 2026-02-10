export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ROSARY = 'ROSARY',
  LITURGY = 'LITURGY',
  JOURNAL = 'JOURNAL',
  NOVENAS = 'NOVENAS',
  SETTINGS = 'SETTINGS',
  EXAMEN = 'EXAMEN',
  HELP = 'HELP',
  ASSIST = 'ASSIST',
  MY_REQUESTS = 'MY_REQUESTS',
  CHAT = 'CHAT',
}

export interface Novena {
  id: string;
  catalogId: string; // Reference to catalog
  title: string;
  image?: string;
  currentDay: number;
  totalDays: number;
  description: string;
  intention?: string;
  startedAt?: any;
  lastPrayedAt?: any;
  status: 'active' | 'completed';
}

export interface NovenaCatalog {
  id: string;
  title: string;
  image?: string;
  description: string;
  category: 'Santos' | 'Maria' | 'Cristo' | 'Espírito Santo' | 'Outros';
  history: string;
  instructions: string;
  totalDays: number;
  defaultPrayer: string;
  prayerSteps?: string[];
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
  rosaryFixedTask?: boolean;
  lastRosaryAt?: any;
}