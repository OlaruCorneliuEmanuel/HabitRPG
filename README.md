# HabitRPG 🛡️

An offline-first mobile habit tracker built with **React Native (Expo)** that turns daily consistency into RPG character progression.

## Current Features

### Core (Base Tier)
* **Offline-First Persistence:** All habits, completion history, and RPG stats are stored locally using `AsyncStorage`.
* **Habit Management (CRUD):** Create, edit, and delete habits with custom names, icons, colors, and scheduling (`Every day` or specific weekdays).
* **Today View:** Dynamically filters and displays only habits due on the current weekday, with single-tap completion and same-day undo.
* **Streak Engine:** Automatically calculates `Current Streak` and `Best Streak`, ignoring non-scheduled days.
* **Habit Details:** Inspect full completion history and streak counters per habit.

### RPG & Plus Tier
* **Character Progression:** Earn XP (+20 XP per completed habit) to level up, with missed-day HP penalty calculation and a soft-reset respawn mechanic when HP reaches 0.
* **Activity Heatmap:** 28-day contribution grid and 14-day completion rates in the Stats tab.
* **UX Polish:** Smooth `Animated` transitions for HP/XP bars and level-up effects, Dark/Light mode toggle, and Haptic feedback.

## Project Structure
```text
HabitRPG/
├── src/
│   ├── components/
│   │   ├── CalendarHeatmap.js
│   │   └── RPGHeader.js
│   └── utils/
│       ├── constants.js
│       └── streakHelper.js
└── App.js