<template>
  <div class="animation-toggle-container">
    <button @click="uiSettingsStore.toggleAnimations()" :aria-pressed="uiSettingsStore.animationsEnabled.toString()" class="toggle-button">
      <span v-if="uiSettingsStore.animationsEnabled">Disable Animations</span>
      <span v-else>Enable Animations</span>
    </button>
  </div>
</template>

<script setup>
import { useUiSettingsStore } from '@/stores/uiSettings'

const uiSettingsStore = useUiSettingsStore()
</script>

<style scoped>
.animation-toggle-container {
  display: flex;
  align-items: center;
}

.toggle-button {
  padding: 6px 10px;
  font-family: 'Poppins', sans-serif; /* Consistent with other UI elements */
  font-size: 0.8em;
  color: var(--text-muted-color);
  background-color: transparent;
  border: 1px solid var(--text-muted-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.toggle-button:hover,
.toggle-button:focus-visible {
  color: var(--text-color);
  border-color: var(--glow-accent);
  box-shadow: 0 0 5px rgba(var(--glow-accent-rgb), 0.3);
}

.toggle-button[aria-pressed="true"] {
  /* Optional: style for when animations are enabled */
  /* background-color: rgba(var(--glow-primary-rgb), 0.1); */
}

.toggle-button[aria-pressed="false"] {
  /* Optional: style for when animations are disabled */
  color: var(--text-color);
  border-color: var(--text-muted-color);
  background-color: rgba(var(--text-muted-color), 0.2);
}
</style>
