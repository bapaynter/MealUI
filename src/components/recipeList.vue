<script setup lang="ts">
import recipeListAddRecipe from './recipeListAddRecipe.vue'

import { useMealState } from '@/composables/mealState'
const { recipes, generateGroceryList } = useMealState()

import { useSettingStorage } from '@/composables/settingStorage'
const { settingsState } = useSettingStorage()

import { mdiMinus } from '@mdi/js'

function submit() {
  if (!settingsState.value.brave_api_key) {
    return
  }
  if (!recipes.value.lunches.length && !recipes.value.dinners.length) {
    return
  }
  generateGroceryList()
}

function removeRecipe(
  recipe: {
    description: string
    link?: string
    ingredients?: string
  },
  category: 'lunches' | 'dinners',
) {
  recipes.value[category] = recipes.value[category].filter(
    (rec) => rec.description !== recipe.description,
  )
}

function addRecipe(args: {
  recipe: {
    description: string
    link?: string
    ingredients?: string
  }
  category: 'lunches' | 'dinners'
}) {
  console.log('addRecipe args', args)
  recipes.value[args.category].push(args.recipe)
}
</script>
<template>
  <div id="recipe-list">
    <v-table>
      <thead>
        <tr>
          <th class="text-left">Lunches</th>
          <th class="text-right">
            <recipeListAddRecipe category="lunches" @addRecipe="addRecipe" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in recipes.lunches" :key="item.description">
          <td>{{ item.description }}</td>
          <td class="text-right">
            <v-btn @click="removeRecipe(item, 'lunches')"><v-icon :icon="mdiMinus" /></v-btn>
          </td>
        </tr>
        <tr v-if="recipes.lunches.length === 0">
          <td>No Lunches</td>
          <td></td>
        </tr>
      </tbody>
    </v-table>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">Dinners</th>
          <th class="text-right">
            <recipeListAddRecipe category="dinners" @addRecipe="addRecipe" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in recipes.dinners" :key="item.description">
          <td>{{ item.description }}</td>
          <td class="text-right">
            <v-btn @click="removeRecipe(item, 'dinners')"><v-icon :icon="mdiMinus" /></v-btn>
          </td>
        </tr>
        <tr v-if="recipes.dinners.length === 0">
          <td>No Dinners</td>
          <td></td>
        </tr>
      </tbody>
    </v-table>
    <v-btn @click="submit" color="primary">
      Generate Grocery List
      <v-tooltip
        v-if="!recipes.lunches.length && !recipes.dinners.length"
        activator="parent"
        location="top"
        >You must have some meals!</v-tooltip
      >
      <v-tooltip v-if="!settingsState.brave_api_key" activator="parent" location="top"
        >You must enter a Brave API key first!</v-tooltip
      >
    </v-btn>
  </div>
</template>
<style scoped>
#recipe-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: 600px;
  margin: 2em auto;
}
</style>
