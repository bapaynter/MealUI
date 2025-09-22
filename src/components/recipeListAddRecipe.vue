<script setup lang="ts">
import { ref } from 'vue'
import { mdiPlus } from '@mdi/js'

const emits = defineEmits(['addRecipe'])

interface Props {
  category: 'lunches' | 'dinners'
}

const props = defineProps<Props>()

const newRecipe = ref('')

function addRecipe() {
  emits('addRecipe', {
    category: props.category,
    recipe: { description: newRecipe.value },
  })
}
</script>
<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps"><v-icon :icon="mdiPlus" /></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="Add Recipe">
        <v-card-text>
          <v-text-field
            v-model="newRecipe"
            hide-details="auto"
            label="New Recipe Name"
            clearable
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="Cancel"
            @click="
              () => {
                isActive.value = false
                newRecipe = ''
              }
            "
          ></v-btn>
          <v-btn
            text="Add"
            @click="
              () => {
                addRecipe()
                isActive.value = false
                newRecipe = ''
              }
            "
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
