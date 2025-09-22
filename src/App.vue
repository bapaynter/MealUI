<script setup lang="ts">
import dataEntry from '@/components/dataEntry.vue'
import recipeList from '@/components/recipeList.vue'
import groceryList from './components/groceryList.vue'
import settingsDialog from './components/settingsDialog.vue'
import loadSpinner from './components/loadSpinner.vue'
import { useMealState } from './composables/mealState'

const { mealState, tokensUsed, searchesDone } = useMealState()
</script>

<template>
  <h1 style="text-align: center">MealUI</h1>
  <h4 style="text-align: center">A BYOK Meal Planner</h4>
  <settingsDialog />
  <header>
    <v-tabs v-model="mealState" :disabled="true">
      <v-tab value="data_entry"> Home </v-tab>
      <v-tab value="recipe_list">Meal Plan</v-tab>
      <v-tab value="grocery_list">Grocery List</v-tab>
    </v-tabs>
  </header>

  <v-tabs-window v-model="mealState">
    <v-tabs-window-item value="data_entry"><dataEntry /></v-tabs-window-item>

    <v-tabs-window-item value="recipe_list"><recipeList /></v-tabs-window-item>

    <v-tabs-window-item value="grocery_list"><groceryList /></v-tabs-window-item>
    <v-tabs-window-item value="loading">
      <loadSpinner />
    </v-tabs-window-item>
  </v-tabs-window>

  <p style="font-size: 0.6em; text-align: center; margin-bottom: 1em">
    Token Usage:
    {{ tokensUsed.in }} In | {{ tokensUsed.out }} Out | Search Usage: {{ searchesDone }} * $0.003 |
    Total Cost: ~${{
      (tokensUsed.in / 1000000) * 0.5 + (tokensUsed.out / 1000000) * 1.6 + searchesDone * 0.003
    }}
  </p>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1em;
}
</style>
