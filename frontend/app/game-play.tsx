import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Vibration,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../src/stores/gameStore';
import { formatTime } from '../src/utils/helpers';

const { width } = Dimensions.get('window');

type GamePhase = 'waiting' | 'acting' | 'reveal' | 'between';

export default function GamePlayScreen() {
  const router = useRouter();
  const { currentGame, currentMovie, getRandomMovie, submitTurn, resetGame } = useGameStore();
  
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [timeLeft, setTimeLeft] = useState(currentGame?.settings.timerSeconds || 60);
  const [hintsRevealed, setHintsRevealed] = useState({
    words: false,
    year: false,
    hero: false,
    heroine: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.8)).current;

  // Start the round
  const startRound = useCallback(() => {
    const movie = getRandomMovie();
    if (!movie || !currentGame) return;

    setTimeLeft(currentGame.settings.timerSeconds);
    setHintsRevealed({ words: false, year: false, hero: false, heroine: false });
    setPhase('acting');

    // Animate card
    cardScaleAnim.setValue(0.8);
    Animated.spring(cardScaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Reset progress animation
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: currentGame.settings.timerSeconds * 1000,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [currentGame, getRandomMovie]);

  // Timer logic
  useEffect(() => {
    if (phase !== 'acting') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('reveal');
          if (Platform.OS !== 'web') {
            Vibration.vibrate(500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Handle correct/wrong answer
  const handleAnswer = (correct: boolean) => {
    submitTurn(correct);
    
    if (currentGame && currentGame.currentRound > currentGame.settings.totalRounds) {
      router.replace('/results');
    } else {
      setPhase('between');
    }
  };

  // Skip turn
  const skipTurn = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('reveal');
  };

  // Reveal a hint
  const revealHint = (hint: keyof typeof hintsRevealed) => {
    setHintsRevealed((prev) => ({ ...prev, [hint]: true }));
  };

  // Exit game
  const exitGame = () => {
    Alert.alert(
      'Exit Game',
      'Are you sure you want to quit? Progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            resetGame();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No active game found</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentTeam = currentGame.currentTurn === 'teamA' ? currentGame.teamA : currentGame.teamB;
  const currentActor = currentTeam.players[currentTeam.currentActorIndex];
  const teamColor = currentGame.currentTurn === 'teamA' ? '#4ecdc4' : '#e94560';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={exitGame} style={styles.exitButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.roundInfo}>
          <Text style={styles.roundText}>Round {currentGame.currentRound}/{currentGame.settings.totalRounds}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: '#4ecdc4' }]}>{currentGame.teamA.score}</Text>
          <Text style={styles.scoreDivider}>:</Text>
          <Text style={[styles.score, { color: '#e94560' }]}>{currentGame.teamB.score}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Waiting Phase */}
        {phase === 'waiting' && (
          <View style={styles.waitingContainer}>
            <Text style={[styles.teamTurn, { color: teamColor }]}>{currentTeam.name}'s Turn</Text>
            <Text style={styles.actorName}>{currentActor?.name || 'Player'} is acting</Text>
            <TouchableOpacity style={styles.startRoundButton} onPress={startRound}>
              <Ionicons name="play" size={32} color="#1a1a2e" />
              <Text style={styles.startRoundText}>Start Round</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Acting Phase */}
        {phase === 'acting' && currentMovie && (
          <Animated.View style={[styles.movieCard, { transform: [{ scale: cardScaleAnim }] }]}>
            {/* Timer */}
            <View style={styles.timerContainer}>
              <Text style={[styles.timerText, timeLeft <= 10 && styles.timerWarning]}>
                {formatTime(timeLeft)}
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: timeLeft <= 10 ? '#e94560' : '#f8d56b',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Movie Title */}
            <View style={styles.movieTitleContainer}>
              <Text style={styles.movieTitle}>{currentMovie.title}</Text>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{currentMovie.difficulty}</Text>
              </View>
            </View>

            {/* Hints */}
            <View style={styles.hintsContainer}>
              <TouchableOpacity
                style={[styles.hintButton, hintsRevealed.words && styles.hintRevealed]}
                onPress={() => revealHint('words')}
              >
                <Ionicons name="text" size={20} color={hintsRevealed.words ? '#1a1a2e' : '#f8d56b'} />
                <Text style={[styles.hintLabel, hintsRevealed.words && styles.hintLabelRevealed]}>
                  {hintsRevealed.words ? `${currentMovie.wordCount} words` : 'Words'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.hintButton, hintsRevealed.year && styles.hintRevealed]}
                onPress={() => revealHint('year')}
              >
                <Ionicons name="calendar" size={20} color={hintsRevealed.year ? '#1a1a2e' : '#f8d56b'} />
                <Text style={[styles.hintLabel, hintsRevealed.year && styles.hintLabelRevealed]}>
                  {hintsRevealed.year ? currentMovie.year.toString() : 'Year'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.hintButton, hintsRevealed.hero && styles.hintRevealed]}
                onPress={() => revealHint('hero')}
              >
                <Ionicons name="man" size={20} color={hintsRevealed.hero ? '#1a1a2e' : '#f8d56b'} />
                <Text style={[styles.hintLabel, hintsRevealed.hero && styles.hintLabelRevealed]}>
                  {hintsRevealed.hero ? currentMovie.hero : 'Hero'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.hintButton, hintsRevealed.heroine && styles.hintRevealed]}
                onPress={() => revealHint('heroine')}
              >
                <Ionicons name="woman" size={20} color={hintsRevealed.heroine ? '#1a1a2e' : '#f8d56b'} />
                <Text style={[styles.hintLabel, hintsRevealed.heroine && styles.hintLabelRevealed]}>
                  {hintsRevealed.heroine ? currentMovie.heroine : 'Heroine'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={skipTurn}>
              <Text style={styles.skipButtonText}>Skip / Time Up</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Reveal Phase */}
        {phase === 'reveal' && currentMovie && (
          <View style={styles.revealContainer}>
            <Text style={styles.timeUpText}>⏰ Time's Up!</Text>
            <Text style={styles.revealMovieTitle}>{currentMovie.title}</Text>
            <Text style={styles.revealQuestion}>Did they guess it?</Text>
            <View style={styles.answerButtons}>
              <TouchableOpacity
                style={[styles.answerButton, styles.correctButton]}
                onPress={() => handleAnswer(true)}
              >
                <Ionicons name="checkmark-circle" size={28} color="#fff" />
                <Text style={styles.answerButtonText}>Correct!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerButton, styles.wrongButton]}
                onPress={() => handleAnswer(false)}
              >
                <Ionicons name="close-circle" size={28} color="#fff" />
                <Text style={styles.answerButtonText}>Wrong</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Between Rounds Phase */}
        {phase === 'between' && (
          <View style={styles.betweenContainer}>
            <Text style={styles.betweenText}>Get Ready!</Text>
            <Text style={[styles.nextTeamText, { color: teamColor }]}>
              {currentTeam.name}'s Turn
            </Text>
            <Text style={styles.nextActorText}>
              {currentActor?.name || 'Player'} will act
            </Text>
            <TouchableOpacity style={styles.continueButton} onPress={startRound}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  exitButton: {
    padding: 8,
  },
  roundInfo: {
    alignItems: 'center',
  },
  roundText: {
    fontSize: 16,
    color: '#f8d56b',
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDivider: {
    fontSize: 24,
    color: '#666',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e94560',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#f8d56b',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  waitingContainer: {
    alignItems: 'center',
  },
  teamTurn: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actorName: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 32,
  },
  startRoundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d56b',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  startRoundText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginLeft: 12,
  },
  movieCard: {
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    maxWidth: 400,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f8d56b',
  },
  timerWarning: {
    color: '#e94560',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#2a2a4e',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  movieTitleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(248, 213, 107, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#f8d56b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  hintsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 213, 107, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f8d56b',
  },
  hintRevealed: {
    backgroundColor: '#f8d56b',
    borderColor: '#f8d56b',
  },
  hintLabel: {
    fontSize: 13,
    color: '#f8d56b',
    marginLeft: 6,
    fontWeight: '500',
  },
  hintLabelRevealed: {
    color: '#1a1a2e',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: '600',
  },
  revealContainer: {
    alignItems: 'center',
  },
  timeUpText: {
    fontSize: 24,
    color: '#e94560',
    marginBottom: 16,
  },
  revealMovieTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8d56b',
    textAlign: 'center',
    marginBottom: 24,
  },
  revealQuestion: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 24,
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  correctButton: {
    backgroundColor: '#4ecdc4',
  },
  wrongButton: {
    backgroundColor: '#e94560',
  },
  answerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  betweenContainer: {
    alignItems: 'center',
  },
  betweenText: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 16,
  },
  nextTeamText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextActorText: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#f8d56b',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 25,
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});
