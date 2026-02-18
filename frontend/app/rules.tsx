import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RulesScreen() {
  const router = useRouter();

  const rules = [
    {
      icon: 'people',
      title: 'Form Two Teams',
      description: 'Divide players into Team A and Team B. Each team should have at least one player.',
    },
    {
      icon: 'person',
      title: 'Choose an Actor',
      description: 'One person from the acting team sees the movie name and acts it out without speaking.',
    },
    {
      icon: 'hand-left',
      title: 'No Talking',
      description: 'The actor cannot speak, point at objects, or mouth words. Only gestures allowed!',
    },
    {
      icon: 'timer',
      title: 'Beat the Clock',
      description: 'Each team has limited time (30-90 seconds) to guess the movie correctly.',
    },
    {
      icon: 'bulb',
      title: 'Use Hints Wisely',
      description: 'Tap hint buttons to reveal clues like word count, year, hero, or heroine.',
    },
    {
      icon: 'trophy',
      title: 'Score Points',
      description: 'Correct guess = 1 point. Team with most points after all rounds wins!',
    },
  ];

  const tips = [
    'Start by showing the number of words in the title',
    'Use common gestures for "sounds like"',
    'Act out key scenes from the movie',
    'Mime the hero/heroine\'s signature moves',
    'Break down long titles word by word',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#f8d56b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How to Play</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Rules Section */}
        <Text style={styles.sectionTitle}>📜 Rules</Text>
        {rules.map((rule, index) => (
          <View key={index} style={styles.ruleCard}>
            <View style={styles.ruleIcon}>
              <Ionicons name={rule.icon as any} size={24} color="#f8d56b" />
            </View>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
            </View>
          </View>
        ))}

        {/* Tips Section */}
        <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
        <View style={styles.tipsCard}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Quick Start */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/team-setup')}
        >
          <Ionicons name="play-circle" size={24} color="#1a1a2e" />
          <Text style={styles.startButtonText}>Start Playing</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8d56b',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  ruleCard: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  ruleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 213, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8d56b',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipBullet: {
    fontSize: 16,
    color: '#4ecdc4',
    marginRight: 10,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 14,
    color: '#ddd',
    flex: 1,
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d56b',
    paddingVertical: 18,
    borderRadius: 30,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginLeft: 10,
  },
});
