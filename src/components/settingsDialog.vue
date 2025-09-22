<script setup lang="ts">
import { mdiCogs } from '@mdi/js'
import { useSettingStorage } from '@/composables/settingStorage'
const { settingsState } = useSettingStorage()
</script>
<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" style="position: absolute; top: 2em; right: 2em"
        ><v-icon :icon="mdiCogs"
      /></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="MealUI Settings">
        <v-card-text>
          <v-text-field
            v-model="settingsState.brave_api_key"
            hide-details="auto"
            label="Brave API Key"
            clearable
            style="margin-bottom: 1em"
          ></v-text-field>

          <v-text-field
            v-model="settingsState.openrouter_api_key"
            hide-details="auto"
            label="OpenRouter API Key"
            clearable
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Close" @click="isActive.value = false"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped></style>
