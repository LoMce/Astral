import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiSettingsStore = defineStore('uiSettings', () => {
  const animationsEnabled = ref(true)

  function toggleAnimations() {
    animationsEnabled.value = !animationsEnabled.value
  }

  return { animationsEnabled, toggleAnimations }
})
