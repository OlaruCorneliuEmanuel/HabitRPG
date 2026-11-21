import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDateStr } from '../utils/constants';

export default function CalendarHeatmap({ habits, theme }) {
  // Generăm ultimele 28 de zile (4 săptămâni)
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getDateStr(d);

    let count = 0;
    habits.forEach((h) => {
      if ((h.completedDates || []).includes(dateStr)) count++;
    });

    days.push({ dateStr, count });
  }

  const getCellColor = (count) => {
    if (count === 0) return theme.border;
    if (count === 1) return '#2B7A78';
    if (count === 2) return '#3AAFA9';
    return '#4ECDC4';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Activity Heatmap (Last 28 Days)</Text>
      <View style={styles.grid}>
        {days.map((day) => (
          <View
            key={day.dateStr}
            style={[styles.cell, { backgroundColor: getCellColor(day.count) }]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={{ color: theme.subtext, fontSize: 11 }}>Less</Text>
        {[0, 1, 2, 3].map((lvl) => (
          <View key={lvl} style={[styles.legendCell, { backgroundColor: getCellColor(lvl) }]} />
        ))}
        <Text style={{ color: theme.subtext, fontSize: 11 }}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 10, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: 26, height: 26, borderRadius: 5 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 12 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});