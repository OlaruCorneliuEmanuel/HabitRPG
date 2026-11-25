import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RPGHeader({ player, darkMode, setDarkMode, theme }) {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const xpPercent = Math.max(0, Math.min(100, player.xp));

  // Valori animate care rețin progresul curent
  const hpAnim = useRef(new Animated.Value(hpPercent)).current;
  const xpAnim = useRef(new Animated.Value(xpPercent)).current;
  const levelScale = useRef(new Animated.Value(1)).current;
  const prevLevel = useRef(player.level);

  // Animație fluidă pentru bara de HP
  useEffect(() => {
    Animated.timing(hpAnim, {
      toValue: hpPercent,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [hpPercent]);

  // Animație fluidă pentru bara de XP
  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: xpPercent,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [xpPercent]);

  // Efect de "bounce" când crești în nivel
  useEffect(() => {
    if (player.level > prevLevel.current) {
      Animated.sequence([
        Animated.timing(levelScale, {
          toValue: 1.15,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.spring(levelScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: false,
        }),
      ]).start();
    }
    prevLevel.current = player.level;
  }, [player.level]);

  // Convertim valorile numerice (0..100) în procente ('0%'..'100%')
  const hpWidth = hpAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const xpWidth = xpAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.rpgHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={styles.rpgTopRow}>
        <Animated.View style={[styles.avatarBox, { transform: [{ scale: levelScale }] }]}>
          <Ionicons name="shield-half" size={32} color="#FFD700" />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.levelText, { color: theme.text }]}>Lvl {player.level} Adventurer</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Offline-First RPG Tracker</Text>
          </View>
        </Animated.View>
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={styles.themeBtn}>
          <Ionicons name={darkMode ? 'sunny' : 'moon'} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.barsContainer}>
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: '#FF6B6B' }]}>HP {player.hp}/{player.maxHp}</Text>
          <View style={styles.barBg}>
            <Animated.View style={[styles.barFill, { width: hpWidth, backgroundColor: '#FF6B6B' }]} />
          </View>
        </View>
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: '#4ECDC4' }]}>XP {player.xp}/100</Text>
          <View style={styles.barBg}>
            <Animated.View style={[styles.barFill, { width: xpWidth, backgroundColor: '#4ECDC4' }]} />
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