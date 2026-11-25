import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Modal, SafeAreaView, StatusBar, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { STORAGE_KEY, WEEKDAYS, COLORS, ICONS, getDateStr } from './src/utils/constants';
import { calculateStreaks, calculateYesterdayDamage } from './src/utils/streakHelper';
import RPGHeader from './src/components/RPGHeader';
import CalendarHeatmap from './src/components/CalendarHeatmap';

export default function App() {
  const [activeTab, setActiveTab] = useState('Today');
  const [darkMode, setDarkMode] = useState(true);

  const [player, setPlayer] = useState({ hp: 90, maxHp: 100, xp: 60, level: 2 });
  const [habits, setHabits] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState('everyday');
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]);

  const todayStr = getDateStr();
  const todayDayIndex = new Date().getDay();

  useEffect(() => { loadData(); }, []);
  useEffect(() => { saveData(); }, [habits, player, darkMode]);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHabits(parsed.habits || []);
        setPlayer(parsed.player || { hp: 90, maxHp: 100, xp: 60, level: 2 });
        setDarkMode(parsed.darkMode ?? true);
      } else {
        // Date demo cu istoric bogat pe ultimele 2 săptămâni ca să arate bine Heatmap-ul
        const demoHabits = [
          {
            id: '1',
            name: '30m Coding / React Native',
            icon: 'code-slash',
            color: '#4ECDC4',
            frequency: 'everyday',
            selectedDays: [0, 1, 2, 3, 4, 5, 6],
            completedDates: [
              getDateStr(new Date(Date.now() - 86400000 * 10)),
              getDateStr(new Date(Date.now() - 86400000 * 9)),
              getDateStr(new Date(Date.now() - 86400000 * 6)),
              getDateStr(new Date(Date.now() - 86400000 * 5)),
              getDateStr(new Date(Date.now() - 86400000 * 3)),
              getDateStr(new Date(Date.now() - 86400000 * 2)),
              getDateStr(new Date(Date.now() - 86400000 * 1)),
            ],
            bestStreak: 4
          },
          {
            id: '2',
            name: 'Antrenament Forță',
            icon: 'barbell',
            color: '#FF6B6B',
            frequency: 'specific',
            selectedDays: [1, 3, 5],
            completedDates: [
              getDateStr(new Date(Date.now() - 86400000 * 9)),
              getDateStr(new Date(Date.now() - 86400000 * 7)),
              getDateStr(new Date(Date.now() - 86400000 * 4)),
              getDateStr(new Date(Date.now() - 86400000 * 2)),
            ],
            bestStreak: 5
          },
          {
            id: '3',
            name: '2L Hidratare',
            icon: 'water',
            color: '#45B7D1',
            frequency: 'everyday',
            selectedDays: [0, 1, 2, 3, 4, 5, 6],
            completedDates: [
              getDateStr(new Date(Date.now() - 86400000 * 5)),
              getDateStr(new Date(Date.now() - 86400000 * 2)),
              getDateStr(new Date(Date.now() - 86400000 * 1)),
            ],
            bestStreak: 3
          }
        ];
        setHabits(demoHabits);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, player, darkMode }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleHabitToday = (habitId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const isDone = h.completedDates.includes(todayStr);
      let updatedDates;

      if (isDone) {
        updatedDates = h.completedDates.filter(d => d !== todayStr);
        updatePlayerXP(-20);
      } else {
        updatedDates = [...h.completedDates, todayStr];
        updatePlayerXP(20);
      }

      const updatedHabit = { ...h, completedDates: updatedDates };
      const { bestStreak } = calculateStreaks(updatedHabit);
      return { ...updatedHabit, bestStreak };
    }));
  };

  const updatePlayerXP = (amount) => {
    setPlayer(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      if (newXp >= 100) { newLevel += 1; newXp -= 100; }
      else if (newXp < 0) {
        if (newLevel > 1) { newLevel -= 1; newXp += 100; }
        else { newXp = 0; }
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  // Aplică penalizarea de HP pentru zilele ratate (sau simulare pentru demo)
  // Aplică penalizarea de HP; dacă ajunge la 0, declanșează Respawn (Soft Reset)
  const applyMissedPenalty = () => {
    const dmg = calculateYesterdayDamage(habits) || 10;
    setPlayer(prev => {
      const nextHp = prev.hp - dmg;
      if (nextHp <= 0) {
        const msg = 'You fainted! Lost 1 Level and current XP. HP restored to 100.';
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(msg);
        } else {
          Alert.alert('Character Fainted 💀', msg);
        }
        return {
          ...prev,
          hp: prev.maxHp,
          xp: 0,
          level: Math.max(1, prev.level - 1),
        };
      }
      return { ...prev, hp: nextHp };
    });
  };

  const openCreateModal = () => {
    setEditingId(null); setName(''); setIcon(ICONS[0]); setColor(COLORS[0]);
    setFrequency('everyday'); setSelectedDays([1, 3, 5]); setModalVisible(true);
  };

  const openEditModal = (habit) => {
    setEditingId(habit.id); setName(habit.name); setIcon(habit.icon); setColor(habit.color);
    setFrequency(habit.frequency); setSelectedDays(habit.selectedDays || [1, 3, 5]);
    setSelectedHabit(null); setModalVisible(true);
  };

  const saveHabit = () => {
    if (!name.trim()) return Alert.alert('Eroare', 'Introdu un nume.');
    if (editingId) {
      setHabits(prev => prev.map(h => h.id === editingId ? { ...h, name, icon, color, frequency, selectedDays } : h));
    } else {
      const newHabit = { id: Date.now().toString(), name, icon, color, frequency, selectedDays, completedDates: [], bestStreak: 0 };
      setHabits(prev => [...prev, newHabit]);
    }
    setModalVisible(false);
  };

  const deleteHabit = (id) => { setHabits(prev => prev.filter(h => h.id !== id)); setSelectedHabit(null); };

  const toggleWeekday = (dayIndex) => {
    setSelectedDays(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]);
  };

  const dueTodayHabits = habits.filter(h => h.frequency === 'everyday' || (h.selectedDays && h.selectedDays.includes(todayDayIndex)));

  const theme = {
    bg: darkMode ? '#121212' : '#F5F7FA', card: darkMode ? '#1E1E1E' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#1A1A1A', subtext: darkMode ? '#A0A0A0' : '#666666',
    border: darkMode ? '#333333' : '#E0E0E0',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <RPGHeader player={player} darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />

      <ScrollView style={styles.content}>
        {activeTab === 'Today' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Due Today ({WEEKDAYS[todayDayIndex]})</Text>
            {dueTodayHabits.length === 0 ? (
              <Text style={{ color: theme.subtext, marginTop: 20 }}>No habits scheduled for today!</Text>
            ) : (
              dueTodayHabits.map(habit => {
                const isDone = habit.completedDates.includes(todayStr);
                const { currentStreak } = calculateStreaks(habit);
                return (
                  <TouchableOpacity key={habit.id} style={[styles.habitCard, { backgroundColor: theme.card, borderLeftColor: habit.color }]} onPress={() => toggleHabitToday(habit.id)}>
                    <View style={styles.habitLeft}>
                      <Ionicons name={habit.icon} size={24} color={habit.color} />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.habitName, { color: theme.text, textDecorationLine: isDone ? 'line-through' : 'none' }]}>{habit.name}</Text>
                        <Text style={{ color: theme.subtext, fontSize: 12 }}>🔥 Streak: {currentStreak} days</Text>
                      </View>
                    </View>
                    <Ionicons name={isDone ? 'checkbox' : 'square-outline'} size={28} color={isDone ? '#4ECDC4' : theme.subtext} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'Habits' && (
          <View>
            <View style={styles.rowBetween}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>All Habits</Text>
              <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>New</Text>
              </TouchableOpacity>
            </View>

            {habits.map(habit => {
              const { currentStreak, bestStreak } = calculateStreaks(habit);
              return (
                <TouchableOpacity key={habit.id} style={[styles.habitCard, { backgroundColor: theme.card, borderLeftColor: habit.color }]} onPress={() => setSelectedHabit(habit)}>
                  <View style={styles.habitLeft}>
                    <Ionicons name={habit.icon} size={24} color={habit.color} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
                      <Text style={{ color: theme.subtext, fontSize: 12 }}>{habit.frequency === 'everyday' ? 'Every day' : habit.selectedDays.map(d => WEEKDAYS[d]).join(', ')}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>🔥 {currentStreak}</Text>
                    <Text style={{ color: theme.subtext, fontSize: 11 }}>Best: {bestStreak}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeTab === 'Stats' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Consistency & Analytics</Text>
            <CalendarHeatmap habits={habits} theme={theme} />

            {habits.map(habit => {
              const { currentStreak, bestStreak } = calculateStreaks(habit);
              const totalDone = habit.completedDates.length;
              const rate = Math.min(100, Math.round((totalDone / 14) * 100));
              return (
                <View key={habit.id} style={[styles.statCard, { backgroundColor: theme.card }]}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
                    <Text style={{ color: habit.color, fontWeight: 'bold' }}>{rate}% (14d rate)</Text>
                  </View>
                  <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 6 }}>Total: {totalDone} | Streak: {currentStreak} | Best: {bestStreak}</Text>
                </View>
              );
            })}

            <TouchableOpacity style={styles.damageBtn} onPress={applyMissedPenalty}>
              <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>Test Missed-Day Penalty (-HP)</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{editingId ? 'Edit Habit' : 'Create Habit'}</Text>
            <TextInput placeholder="Habit name" placeholderTextColor={theme.subtext} value={name} onChangeText={setName} style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
            <Text style={[styles.label, { color: theme.subtext }]}>Color</Text>
            <View style={styles.selectorRow}>{COLORS.map(c => <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorCircle, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: theme.text }]} />)}</View>
            <Text style={[styles.label, { color: theme.subtext }]}>Icon</Text>
            <View style={styles.selectorRow}>{ICONS.map(ic => <TouchableOpacity key={ic} onPress={() => setIcon(ic)} style={[styles.iconBox, { backgroundColor: icon === ic ? color : 'transparent' }]}><Ionicons name={ic} size={20} color={icon === ic ? '#FFF' : theme.text} /></TouchableOpacity>)}</View>
            <Text style={[styles.label, { color: theme.subtext }]}>Frequency</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity style={[styles.freqBtn, frequency === 'everyday' && { backgroundColor: '#4ECDC4' }]} onPress={() => setFrequency('everyday')}><Text style={{ color: frequency === 'everyday' ? '#FFF' : theme.text }}>Every Day</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.freqBtn, frequency === 'specific' && { backgroundColor: '#4ECDC4' }]} onPress={() => setFrequency('specific')}><Text style={{ color: frequency === 'specific' ? '#FFF' : theme.text }}>Specific Days</Text></TouchableOpacity>
            </View>
            {frequency === 'specific' && (
              <View style={styles.selectorRow}>
                {WEEKDAYS.map((day, idx) => {
                  const active = selectedDays.includes(idx);
                  return <TouchableOpacity key={day} onPress={() => toggleWeekday(idx)} style={[styles.dayBtn, active && { backgroundColor: color }]}><Text style={{ color: active ? '#FFF' : theme.text, fontSize: 12 }}>{day}</Text></TouchableOpacity>;
                })}
              </View>
            )}
            <View style={[styles.rowBetween, { marginTop: 20 }]}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text style={{ color: theme.subtext }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveHabit} style={styles.saveBtn}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedHabit} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          {selectedHabit && (
            <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{selectedHabit.name}</Text>
              <Text style={{ color: theme.subtext, marginBottom: 12 }}>Streak: {calculateStreaks(selectedHabit).currentStreak} | Best: {calculateStreaks(selectedHabit).bestStreak}</Text>
              <Text style={[styles.label, { color: theme.text }]}>History:</Text>
              {selectedHabit.completedDates.length === 0 ? <Text style={{ color: theme.subtext }}>No completions yet.</Text> : selectedHabit.completedDates.map(d => <Text key={d} style={{ color: '#4ECDC4', marginVertical: 2 }}>✔ {d}</Text>)}
              <View style={[styles.rowBetween, { marginTop: 24 }]}>
                <TouchableOpacity onPress={() => deleteHabit(selectedHabit.id)}><Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>Delete</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => openEditModal(selectedHabit)}><Text style={{ color: '#45B7D1', fontWeight: 'bold' }}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedHabit(null)}><Text style={{ color: theme.text }}>Close</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <View style={[styles.bottomNav, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {[{ name: 'Today', icon: 'today' }, { name: 'Habits', icon: 'list' }, { name: 'Stats', icon: 'stats-chart' }].map(tab => (
          <TouchableOpacity key={tab.name} style={styles.navItem} onPress={() => setActiveTab(tab.name)}>
            <Ionicons name={tab.icon} size={22} color={activeTab === tab.name ? '#4ECDC4' : theme.subtext} />
            <Text style={{ color: activeTab === tab.name ? '#4ECDC4' : theme.subtext, fontSize: 12, marginTop: 2 }}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  habitCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 10, marginBottom: 10, borderLeftWidth: 5 },
  habitLeft: { flexDirection: 'row', alignItems: 'center' }, habitName: { fontSize: 16, fontWeight: '600' },
  addBtn: { flexDirection: 'row', backgroundColor: '#4ECDC4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  statCard: { padding: 16, borderRadius: 10, marginBottom: 10 },
  damageBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FF6B6B', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  bottomNav: { flexDirection: 'row', height: 60, borderTopWidth: 1 }, navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalBox: { borderRadius: 12, padding: 20 }, input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  colorCircle: { width: 28, height: 28, borderRadius: 14 }, iconBox: { padding: 8, borderRadius: 8 },
  freqBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#555' },
  dayBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#555' },
  cancelBtn: { padding: 10 }, saveBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});