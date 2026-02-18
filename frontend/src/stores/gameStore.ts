import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Team, Player, GameSettings, Movie, Difficulty } from '../types';
import { generateId, generateShareCode, shuffleArray } from '../utils/helpers';
import { MOVIES } from '../data/movies';

interface GameState {
  // Current game
  currentGame: Game | null;
  currentMovie: Movie | null;
  
  // Stats
  totalGamesPlayed: number;
  
  // Actions
  createGame: (teamAPlayers: string[], teamBPlayers: string[], settings: GameSettings) => void;
  getRandomMovie: () => Movie | null;
  submitTurn: (correct: boolean) => void;
  resetGame: () => void;
  getStats: () => { totalMovies: number; easyMovies: number; mediumMovies: number; hardMovies: number; };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGame: null,
      currentMovie: null,
      totalGamesPlayed: 0,

      createGame: (teamAPlayers, teamBPlayers, settings) => {
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

        set({ currentGame: game, currentMovie: null });
      },

      getRandomMovie: () => {
        const { currentGame } = get();
        if (!currentGame) return null;

        let availableMovies = MOVIES.filter(
          movie => !currentGame.usedMovieIds.includes(movie.id)
        );

        // Filter by difficulty if not 'all'
        if (currentGame.settings.difficulty !== 'all') {
          availableMovies = availableMovies.filter(
            movie => movie.difficulty === currentGame.settings.difficulty
          );
        }

        // If no movies available, reset used movies
        if (availableMovies.length === 0) {
          set(state => ({
            currentGame: state.currentGame ? {
              ...state.currentGame,
              usedMovieIds: []
            } : null
          }));
          availableMovies = currentGame.settings.difficulty === 'all' 
            ? MOVIES 
            : MOVIES.filter(m => m.difficulty === currentGame.settings.difficulty);
        }

        const randomIndex = Math.floor(Math.random() * availableMovies.length);
        const selectedMovie = availableMovies[randomIndex];

        // Add to used movies
        set(state => ({
          currentMovie: selectedMovie,
          currentGame: state.currentGame ? {
            ...state.currentGame,
            usedMovieIds: [...state.currentGame.usedMovieIds, selectedMovie.id]
          } : null
        }));

        return selectedMovie;
      },

      submitTurn: (correct) => {
        set(state => {
          if (!state.currentGame) return state;

          const game = { ...state.currentGame };

          // Update score if correct
          if (correct) {
            if (game.currentTurn === 'teamA') {
              game.teamA = { ...game.teamA, score: game.teamA.score + 1 };
            } else {
              game.teamB = { ...game.teamB, score: game.teamB.score + 1 };
            }
          }

          // Rotate actor
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

          // Switch turns
          if (game.currentTurn === 'teamA') {
            game.currentTurn = 'teamB';
          } else {
            game.currentTurn = 'teamA';
            game.currentRound += 1;
          }

          // Check if game is over
          if (game.currentRound > game.settings.totalRounds) {
            game.status = 'completed';
            if (game.teamA.score > game.teamB.score) {
              game.winner = 'Team A';
            } else if (game.teamB.score > game.teamA.score) {
              game.winner = 'Team B';
            } else {
              game.winner = 'Draw';
            }
          }

          return {
            currentGame: game,
            currentMovie: null,
            totalGamesPlayed: game.status === 'completed' ? state.totalGamesPlayed + 1 : state.totalGamesPlayed
          };
        });
      },

      resetGame: () => {
        set({ currentGame: null, currentMovie: null });
      },

      getStats: () => {
        return {
          totalMovies: MOVIES.length,
          easyMovies: MOVIES.filter(m => m.difficulty === 'easy').length,
          mediumMovies: MOVIES.filter(m => m.difficulty === 'medium').length,
          hardMovies: MOVIES.filter(m => m.difficulty === 'hard').length,
        };
      },
    }),
    {
      name: 'dumb-charades-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentGame: state.currentGame,
        totalGamesPlayed: state.totalGamesPlayed,
      }),
    }
  )
);
