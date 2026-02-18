import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../src/stores/gameStore';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const router = useRouter();
  const { currentGame, resetGame } = useGameStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ),
    ]).start();
  }, []);

  const playAgain = () => {
    resetGame();
    router.replace('/team-setup');
  };

  const goHome = () => {
    resetGame();
    router.replace('/');
  };

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No game data found</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { teamA, teamB, winner } = currentGame;
  const isDraw = winner === 'Draw';
  const winnerTeam = winner === 'Team A' ? teamA : winner === 'Team B' ? teamB : null;
  const winnerColor = winner === 'Team A' ? '#4ecdc4' : winner === 'Team B' ? '#e94560' : '#f8d56b';

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Trophy/Result Icon */}
        <Animated.View
          style={[
            styles.trophyContainer,
            {
              transform: [
                {
                  scale: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.trophyEmoji}>{isDraw ? '🤝' : '🏆'}</Text>
        </Animated.View>

        {/* Winner Announcement */}
        <Text style={styles.gameOverText}>Game Over!</Text>
        {isDraw ? (
          <Text style={styles.winnerText}>It's a Draw!</Text>
        ) : (
          <Text style={[styles.winnerText, { color: winnerColor }]}>
            {winner} Wins!
          </Text>
        )}

        {/* Score Cards */}
        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, winner === 'Team A' && styles.winnerCard]}>
            <Text style={[styles.teamName, { color: '#4ecdc4' }]}>{teamA.name}</Text>
            <Text style={styles.finalScore}>{teamA.score}</Text>
            <Text style={styles.pointsLabel}>points</Text>
            {winner === 'Team A' && (
              <View style={styles.winnerBadge}>
                <Ionicons name="trophy" size={16} color="#f8d56b" />
              </View>
            )}
          </View>

          <View style={styles.vsDivider}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={[styles.scoreCard, winner === 'Team B' && styles.winnerCard]}>
            <Text style={[styles.teamName, { color: '#e94560' }]}>{teamB.name}</Text>
            <Text style={styles.finalScore}>{teamB.score}</Text>
            <Text style={styles.pointsLabel}>points</Text>
            {winner === 'Team B' && (
              <View style={styles.winnerBadge}>
                <Ionicons name="trophy" size={16} color="#f8d56b" />
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.playAgainButton} onPress={playAgain}>
            <Ionicons name="refresh" size={24} color="#1a1a2e" />
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={goHome}>
            <Ionicons name="home-outline" size={24} color="#f8d56b" />
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  trophyContainer: {
    marginBottom: 20,
  },
  trophyEmoji: {
    fontSize: 80,
  },
  gameOverText: {
    fontSize: 20,
    color: '#aaa',
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f8d56b',
    marginBottom: 32,
  },
  scoreCards: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minWidth: 120,
    position: 'relative',
  },
  winnerCard: {
    borderWidth: 2,
    borderColor: '#f8d56b',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#888',
  },
  winnerBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 5,
  },
  vsDivider: {
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d56b',
    paddingVertical: 18,
    borderRadius: 30,
  },
  playAgainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginLeft: 10,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#f8d56b',
  },
  homeButtonText: {
    fontSize: 18,
    color: '#f8d56b',
    marginLeft: 10,
  },
});
