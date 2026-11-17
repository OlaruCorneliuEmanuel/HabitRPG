export const STORAGE_KEY = '@habit_rpg_data_v3'; // v3 ca să încarce noile date demo
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
export const ICONS = ['fitness', 'book', 'water', 'code-slash', 'bed', 'barbell', 'flame', 'cafe'];

export const getDateStr = (date = new Date()) => date.toISOString().split('T')[0];