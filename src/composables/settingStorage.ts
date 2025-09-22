import { useStorage } from '@vueuse/core'

const mealPreferences = {
  cuisinePreferences: '',
  lunchesPerWeek: 0,
  dinnersPerWeek: 0,
  portionsPerMeal: 2,
}
const preferenceState = useStorage('mealui_mealPreferences', mealPreferences, localStorage)

const mealuiSettings = { brave_api_key: '', openrouter_api_key: '' }
const settingsState = useStorage('mealui_settings', mealuiSettings, localStorage)

export function useSettingStorage() {
  return { preferenceState, settingsState }
}
