import { getDateStr } from './constants';

export const isHabitDueOnDate = (habit, dateObj) => {
  if (habit.frequency === 'everyday') return true;
  return (habit.selectedDays || []).includes(dateObj.getDay());
};

export const calculateStreaks = (habit) => {
  const { completedDates = [] } = habit;
  const completedSet = new Set(completedDates);
  const today = new Date();

  let currentStreak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = getDateStr(checkDate);
    const isToday = i === 0;

    if (isHabitDueOnDate(habit, checkDate)) {
      if (completedSet.has(dateStr)) {
        currentStreak++;
      } else if (!isToday) {
        break;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const bestStreak = Math.max(habit.bestStreak || 0, currentStreak);
  return { currentStreak, bestStreak };
};

// Calculează câte obiceiuri programate ieri au fost ratate (10 HP damage per obicei ratat)
export const calculateYesterdayDamage = (habits) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateStr(yesterday);

  let missedCount = 0;
  habits.forEach((h) => {
    if (isHabitDueOnDate(h, yesterday) && !(h.completedDates || []).includes(yesterdayStr)) {
      missedCount++;
    }
  });

  return missedCount * 10;
};