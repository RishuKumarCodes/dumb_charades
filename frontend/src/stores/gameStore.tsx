import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOVIES } from '../data/movies';
import { Game, Team, GameSettings, Movie } from '../types';
import { generateId, generateShareCode } from '../utils/helpers';

interface GameContextType {
  currentGame: Game | null;
  currentMovie: Movie | null;
  totalGamesPlayed: number;
  createGame: (teamAPlayers: string[], teamBPlayers: string[], settings: GameSettings) => void;
  getRandomMovie: () => Movie | null;
  submitTurn: (correct: boolean) => void;
  resetGame: () => void;
  getStats: () => { totalMovies: number; easyMovies: number; mediumMovies: number; hardMovies: number; };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);

  const createGame = (teamAPlayers: string[], teamBPlayers: string[], settings: GameSettings) => {
    const teamA: Team = {
      name: 'Team A',
      players: teamAPlayers.map(name => ({ id: generateId(), name })),
      score: 0,
      currentActorIndex: 0,
    };

    const teamB: Team = {
      name: 'Team B',
      players: teamBPlayers.map(name => ({ id: generateId(), name })),
      score: 0,
      currentActorIndex: 0,
    };

    const game: Game = {
      id: generateId(),
      teamA,
      teamB,
      settings,
      currentTurn: 'teamA',
      currentRound: 1,
      usedMovieIds: [],
      status: 'active',
      shareCode: generateShareCode(),
      createdAt: new Date(),
    };

    setCurrentGame(game);
    setCurrentMovie(null);
  };

  const getRandomMovie = (): Movie | null => {
    if (!currentGame) return null;

    let availableMovies = MOVIES.filter(
      movie => !currentGame.usedMovieIds.includes(movie.id)
    );

    if (currentGame.settings.difficulty !== 'all') {
      availableMovies = availableMovies.filter(
        movie => movie.difficulty === currentGame.settings.difficulty
      );
    }

    if (availableMovies.length === 0) {
      setCurrentGame(prev => prev ? { ...prev, usedMovieIds: [] } : null);
      availableMovies = currentGame.settings.difficulty === 'all'
        ? MOVIES
        : MOVIES.filter(m => m.difficulty === currentGame.settings.difficulty);
    }

    const randomIndex = Math.floor(Math.random() * availableMovies.length);
    const selectedMovie = availableMovies[randomIndex];

    setCurrentMovie(selectedMovie);
    setCurrentGame(prev => prev ? {
      ...prev,
      usedMovieIds: [...prev.usedMovieIds, selectedMovie.id]
    } : null);

    return selectedMovie;
  };

  const submitTurn = (correct: boolean) => {
    if (!currentGame) return;

    const game = { ...currentGame };

    if (correct) {
      if (game.currentTurn === 'teamA') {
        game.teamA = { ...game.teamA, score: game.teamA.score + 1 };
      } else {
        game.teamB = { ...game.teamB, score: game.teamB.score + 1 };
      }
    }

    if (game.currentTurn === 'teamA') {
      game.teamA = {
        ...game.teamA,
        currentActorIndex: (game.teamA.currentActorIndex + 1) % game.teamA.players.length
      };
    } else {
      game.teamB = {
        ...game.teamB,
        currentActorIndex: (game.teamB.currentActorIndex + 1) % game.teamB.players.length
      };
    }

    if (game.currentTurn === 'teamA') {
      game.currentTurn = 'teamB';
    } else {
      game.currentTurn = 'teamA';
      game.currentRound += 1;
    }

    if (game.currentRound > game.settings.totalRounds) {
      game.status = 'completed';
      if (game.teamA.score > game.teamB.score) {
        game.winner = 'Team A';
      } else if (game.teamB.score > game.teamA.score) {
        game.winner = 'Team B';
      } else {
        game.winner = 'Draw';
      }
      setTotalGamesPlayed(prev => prev + 1);
    }

    setCurrentGame(game);
    setCurrentMovie(null);
  };

  const resetGame = () => {
    setCurrentGame(null);
    setCurrentMovie(null);
  };

  const getStats = () => ({
    totalMovies: MOVIES.length,
    easyMovies: MOVIES.filter(m => m.difficulty === 'easy').length,
    mediumMovies: MOVIES.filter(m => m.difficulty === 'medium').length,
    hardMovies: MOVIES.filter(m => m.difficulty === 'hard').length,
  });

  return (
    <GameContext.Provider value={{
      currentGame,
      currentMovie,
      totalGamesPlayed,
      createGame,
      getRandomMovie,
      submitTurn,
      resetGame,
      getStats,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameStore() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameStore must be used within a GameProvider');
  }
  return context;
}
