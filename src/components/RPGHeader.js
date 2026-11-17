import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RPGHeader({ player, darkMode, setDarkMode, theme }) {
  return (
    <View style={[styles.rpgHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={styles.rpgTopRow}>
        <View style={styles.avatarBox}>
          <Ionicons name="shield-half" size={32} color="#FFD700" />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.levelText, { color: theme.text }]}>Lvl {player.level} Adventurer</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Offline-First RPG Tracker</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={styles.themeBtn}>
          <Ionicons name={darkMode ? 'sunny' : 'moon'} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.barsContainer}>
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: '#FF6B6B' }]}>HP {player.hp}/{player.maxHp}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${(player.hp / player.maxHp) * 100}%`, backgroundColor: '#FF6B6B' }]} />
          </View>
        </View>
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: '#4ECDC4' }]}>XP {player.xp}/100</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${player.xp}%`, backgroundColor: '#4ECDC4' }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rpgHeader: { padding: 16, borderBottomWidth: 1 },
  rpgTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarBox: { flexDirection: 'row', alignItems: 'center' },
  levelText: { fontSize: 18, fontWeight: 'bold' },
  themeBtn: { padding: 6 },
  barsContainer: { marginTop: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  barLabel: { width: 85, fontSize: 12, fontWeight: 'bold' },
  barBg: { flex: 1, height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%' },
});