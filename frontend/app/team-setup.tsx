import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../src/stores/gameStore';
import { GameSettings, Difficulty } from '../src/types';

const TIMER_OPTIONS = [30, 45, 60, 90];
const ROUND_OPTIONS = [3, 5, 7, 10];
const DIFFICULTY_OPTIONS: { label: string; value: Difficulty }[] = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
  { label: 'All', value: 'all' },
];

export default function TeamSetupScreen() {
  const router = useRouter();
  const { createGame } = useGameStore();

  // Team A
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>(['', '']);
  
  // Team B
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>(['', '']);

  // Settings
  const [timer, setTimer] = useState(60);
  const [rounds, setRounds] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('all');

  const addPlayer = (team: 'A' | 'B') => {
    if (team === 'A' && teamAPlayers.length < 5) {
      setTeamAPlayers([...teamAPlayers, '']);
    } else if (team === 'B' && teamBPlayers.length < 5) {
      setTeamBPlayers([...teamBPlayers, '']);
    }
  };

  const removePlayer = (team: 'A' | 'B', index: number) => {
    if (team === 'A' && teamAPlayers.length > 1) {
      setTeamAPlayers(teamAPlayers.filter((_, i) => i !== index));
    } else if (team === 'B' && teamBPlayers.length > 1) {
      setTeamBPlayers(teamBPlayers.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (team: 'A' | 'B', index: number, name: string) => {
    if (team === 'A') {
      const newPlayers = [...teamAPlayers];
      newPlayers[index] = name;
      setTeamAPlayers(newPlayers);
    } else {
      const newPlayers = [...teamBPlayers];
      newPlayers[index] = name;
      setTeamBPlayers(newPlayers);
    }
  };

  const startGame = () => {
    const teamAFiltered = teamAPlayers.filter(p => p.trim());
    const teamBFiltered = teamBPlayers.filter(p => p.trim());

    if (teamAFiltered.length === 0 || teamBFiltered.length === 0) {
      Alert.alert('Error', 'Each team needs at least one player');
      return;
    }

    const settings: GameSettings = {
      timerSeconds: timer,
      totalRounds: rounds,
      difficulty,
    };

    createGame(teamAFiltered, teamBFiltered, settings);
    router.push('/game-play');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#f8d56b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Setup Game</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Team A */}
          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <Text style={[styles.teamTitle, { color: '#4ecdc4' }]}>Team A</Text>
              {teamAPlayers.length < 5 && (
                <TouchableOpacity onPress={() => addPlayer('A')} style={styles.addButton}>
                  <Ionicons name="add-circle" size={28} color="#4ecdc4" />
                </TouchableOpacity>
              )}
            </View>
            {teamAPlayers.map((player, index) => (
              <View key={index} style={styles.playerRow}>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor="#666"
                  value={player}
                  onChangeText={(text) => updatePlayer('A', index, text)}
                />
                {teamAPlayers.length > 1 && (
                  <TouchableOpacity onPress={() => removePlayer('A', index)}>
                    <Ionicons name="close-circle" size={24} color="#e94560" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* VS Divider */}
          <View style={styles.vsDivider}>
            <View style={styles.vsLine} />
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.vsLine} />
          </View>

          {/* Team B */}
          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <Text style={[styles.teamTitle, { color: '#e94560' }]}>Team B</Text>
              {teamBPlayers.length < 5 && (
                <TouchableOpacity onPress={() => addPlayer('B')} style={styles.addButton}>
                  <Ionicons name="add-circle" size={28} color="#e94560" />
                </TouchableOpacity>
              )}
            </View>
            {teamBPlayers.map((player, index) => (
              <View key={index} style={styles.playerRow}>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor="#666"
                  value={player}
                  onChangeText={(text) => updatePlayer('B', index, text)}
                />
                {teamBPlayers.length > 1 && (
                  <TouchableOpacity onPress={() => removePlayer('B', index)}>
                    <Ionicons name="close-circle" size={24} color="#e94560" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Game Settings</Text>

            {/* Timer */}
            <Text style={styles.settingLabel}>Timer (seconds)</Text>
            <View style={styles.optionsRow}>
              {TIMER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    timer === option && styles.optionButtonActive,
                  ]}
                  onPress={() => setTimer(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      timer === option && styles.optionTextActive,
                    ]}
                  >
                    {option}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rounds */}
            <Text style={styles.settingLabel}>Rounds</Text>
            <View style={styles.optionsRow}>
              {ROUND_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    rounds === option && styles.optionButtonActive,
                  ]}
                  onPress={() => setRounds(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      rounds === option && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Difficulty */}
            <Text style={styles.settingLabel}>Difficulty</Text>
            <View style={styles.optionsRow}>
              {DIFFICULTY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    difficulty === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setDifficulty(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      difficulty === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Ionicons name="play" size={24} color="#1a1a2e" />
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8d56b',
  },
  teamSection: {
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  playerInput: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8d56b',
    marginHorizontal: 16,
  },
  settingsSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8d56b',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
    marginTop: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonActive: {
    backgroundColor: '#f8d56b',
    borderColor: '#f8d56b',
  },
  optionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#1a1a2e',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d56b',
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginLeft: 10,
  },
});
