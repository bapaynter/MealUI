<script setup lang="ts">
import { ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { useMealState } from '@/composables/mealState'
import { mdiClipboard } from '@mdi/js'
const { recipes, groceryList } = useMealState()

async function copyList() {
  let clipboardText = ''
  clipboardText += groceryList.value.replace(/\*\*/g, '')
  if (recipes.value.lunches.length) {
    clipboardText += '\n\nLunches:\n'
    recipes.value.lunches.forEach(
      (lunch) => (clipboardText += `\n${lunch.description}\n${lunch.link}`),
    )
  }
  if (recipes.value.dinners.length) {
    clipboardText += '\n\nDinners:\n'
    recipes.value.dinners.forEach(
      (dinner) => (clipboardText += `\n${dinner.description}\n${dinner.link}`),
    )
  }

  try {
    await navigator.clipboard.writeText(clipboardText)
    console.log('Content copied to clipboard')
    snackbarText.value = 'Meal Plan Copied'
    snackbar.value = true
  } catch (err) {
    console.error('Failed to copy: ', err)
    snackbarText.value = 'Error copying Meal Plan'
    snackbar.value = true
  }
}

const snackbar = ref(false)
const snackbarText = ref('')
</script>
<template>
  <div id="recipe_display">
    <v-card title="Grocery List">
      <v-card-text style="padding: 0em 2em 1em">
        <vue-markdown :source="groceryList" />
      </v-card-text>
    </v-card>
    <v-card title="Lunches">
      <v-card-text style="padding: 0em 2em 1em">
        <v-list-item
          v-for="lunch in recipes.lunches"
          :key="lunch.description"
          :title="lunch.description"
          :subtitle="lunch.link"
          :href="lunch.link"
        ></v-list-item>
      </v-card-text>
    </v-card>
    <v-card title="Dinners">
      <v-card-text style="padding: 0em 2em 1em">
        <v-list-item
          v-for="lunch in recipes.dinners"
          :key="lunch.description"
          :title="lunch.description"
          :subtitle="lunch.link"
          :href="lunch.link"
        ></v-list-item>
      </v-card-text>
    </v-card>
    <v-btn @click="copyList" color="primary">
      <v-icon :icon="mdiClipboard" />&nbsp;Copy to Clipboard</v-btn
    >
    <v-snackbar v-model="snackbar" timeout="2000">
      {{ snackbarText }}

      <template v-slot:actions>
        <v-btn color="blue" variant="text" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<style scoped>
#recipe_display {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: 600px;
  margin: 2em auto;
}
</style>
