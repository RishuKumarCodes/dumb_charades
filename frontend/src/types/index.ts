// Type definitions for Dumb Charades App

export interface Movie {
  id: string;
  title: string;
  year: number;
  hero: string;
  heroine: string;
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  genre?: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  name: string;
  players: Player[];
  score: number;
  currentActorIndex: number;
}

export interface GameSettings {
  timerSeconds: number;
  totalRounds: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'all';
}

export interface Game {
  id: string;
  teamA: Team;
  teamB: Team;
  settings: GameSettings;
  currentTurn: 'teamA' | 'teamB';
  currentRound: number;
  usedMovieIds: string[];
  status: 'active' | 'completed';
  winner?: string;
  shareCode: string;
  createdAt: Date;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'all';
