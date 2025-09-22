<script lang="ts" setup>
import { useMealState } from '@/composables/mealState'
import { useSettingStorage } from '@/composables/settingStorage'
const { generateMealPlan } = useMealState()
const { preferenceState, settingsState } = useSettingStorage()

function submit() {
  if (!settingsState.value.openrouter_api_key) {
    return
  }
  generateMealPlan()
}
</script>
<template>
  <form @submit.prevent="submit" id="data-entry-form">
    <v-textarea
      v-model="preferenceState.cuisinePreferences"
      label="Food Preferences"
      placeholder="e.g. Healthy meals with lots of beans, no red meat"
    ></v-textarea>
    <v-number-input
      controlVariant="split"
      label="Lunches per week"
      :min="0"
      :max="7"
      v-model="preferenceState.lunchesPerWeek"
    ></v-number-input>
    <v-number-input
      controlVariant="split"
      label="Dinners per week"
      :min="0"
      :max="7"
      v-model="preferenceState.dinnersPerWeek"
    ></v-number-input>
    <v-number-input
      controlVariant="split"
      label="Portions per meal"
      :min="1"
      :max="10"
      v-model="preferenceState.portionsPerMeal"
    ></v-number-input>
    <v-btn type="submit" color="primary">
      Generate Meal Plan
      <v-tooltip v-if="!settingsState.openrouter_api_key" activator="parent" location="top"
        >You must enter an OpenRouter API key first!</v-tooltip
      >
    </v-btn>
  </form>
</template>
<style scoped>
#data-entry-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: 600px;
  margin: 2em auto;
}
</style>
