<template>
  <main class="container page-container" :class="{ 'neutral-state': !selectedGameInternal }">
    <h1 class="main-title" :class="{ 'neutral-title': !selectedGameInternal }">
      {{ selectedGameInternal ? 'Purchase Your Game Key' : 'Enter the Portal of Nightly Access' }}
    </h1>
    <p class="subtitle" :class="{ 'neutral-subtitle': !selectedGameInternal }">
      {{
        selectedGameInternal
          ? 'Choose your pass and dive into ' +
            (games.find((g) => g.value === selectedGameInternal)?.name || 'the adventure') +
            '.'
          : 'Select your realm. A unique thematic experience awaits with every choice.'
      }}
    </p>

    <GameSelector
      :games="games"
      @game-selected="handleGameSelected"
      class="game-selector-component"
      :class="{ 'pulsing-cta': !selectedGameInternal }"
      :current-selected-value-prop="selectedGameInternal"
      ref="gameSelectorRef"
    />
    <!-- Changed prop name for clarity (comment moved) -->

    <transition :name="keyAreaTransitionName">
      <!-- Dynamic transition name -->
      <KeySelectionArea
        v-if="selectedGameInternal"
        :selectedGameValue="selectedGameInternal"
        :gamesData="games"
      />
    </transition>
  </main>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router' // Import useRoute
import GameSelector from '../components/GameSelector.vue'
import KeySelectionArea from '../components/KeySelectionArea.vue'

const props = defineProps({
  activePageThemeProp: String, // Receives the global theme from App.vue
})

const selectedGameInternal = ref('')
const gameSelectorRef = ref(null)
const keyAreaTransitionName = ref('keys-fade-quick') // Start with quick fade for initial load/reset

const emit = defineEmits(['update-active-theme-game'])
const route = useRoute() // Get current route information

const games = ref([
  {
    name: 'Minecraft',
    value: 'minecraft',
    logoSrc:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNzgwODY4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcng9IjAiIHJ5PSIwIiBmaWxsPSIjM2M0YjMyIi8+PHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgcng9IjAiIHJ5PSIwIiBmaWxsPSIjYTg4NjAiLz48cmVjdCB4PSI4IiB5PSI0IiB3aWR0aD0iOCIgaGVpZ2h0PSI0IiByeD0iMCIgcnk9IjAiIGZpbGw9IiM3MDYwNDAiLz48cmVjdCB4PSI0IiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiByeD0iMCIgcnk9IjAiIGZpbGw9IiM3MDYwNDAiLz48L3N2Zz4=',
  },
  {
    name: 'Fortnite',
    value: 'fortnite',
    logoSrc:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjOTA4MGE4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTNzcuNTIgMiAxMiAyek04LjUgMTVjLTEuMzggMC0yLjUtMS4xMi0yLjUtMi41UzcuMTIgMTAgOC41IDEwczEuNjcuMiAyLjI1LjVsMS4yNS0zLjc1QzExLjE3IDkuNSA5LjgzIDkgOC41IDljLTIuNDggMC00LjUgMi00LjUgNC41UzYuMDIgMTggOC41IDE4czIuODMtLjUgMy41My0xLjI1bC0xLjI1LTEuNzVjLS41OC4zLTEuMzcuNS0yLjI4LjV6bTcgMGMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNWMxLjMzIDAgMi42Ny41IDMuNSAxLjI1bC0xLjI1IDEuNzVjLS41OC0uMy0xLjM3LS41LTIuMjUtLjVzLTEuNjguMi0yLjI1LjVsMS4yNSAzLjc1Yy44My0uNyAxLjE3LTEuMjUgMy41My0xLjI1IDIuNDggMCA0LjUgMiA0LjUgNC41UzE3LjkSDE4IDE1LjUgMThzLTIuODMtLjUgMy41My0xLjI1bDEuMjUtMS43NWMuNTguMyAxLjM3LjUgMi4yOC41eiIgZmlsbD0iI2ZmNDBmZiIvPjwvc3ZnPg==',
  },
  {
    name: 'Call of Duty',
    value: 'cod',
    logoSrc:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNjg3MDY4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTNzcuNTIgMiAxMiAyek0xMiA0Yy0xLjEgMC0yIC45LTIgMnY5aDEuNVYxMS41aDF2NC41aDEuNVY2aC0xVjQuNWgtMVYzYy0xLjV2MXptLTQuNSA1aDEuNVYxNmgtMS41Vjl6bTkgMGgxLjVWMTZIMTYuNVY5eiIgZmlsbD0iI2NjNzcwMCIvPjwvc3ZnPg==',
  },
])

const handleGameSelected = (gameValue) => {
  selectedGameInternal.value = gameValue
  emit('update-active-theme-game', gameValue)
  keyAreaTransitionName.value = 'keys-fade-normal' // Use normal fade for appearance
}

// Watch for changes in the global theme prop from App.vue
watch(
  () => props.activePageThemeProp,
  (newGlobalTheme) => {
    const newSelectedGame = newGlobalTheme || ''
    if (selectedGameInternal.value !== newSelectedGame) {
      if (selectedGameInternal.value !== '' && newSelectedGame === '') {
        // If changing from a selected game to neutral, use quick fade for disappearance
        keyAreaTransitionName.value = 'keys-fade-quick'
      }
      selectedGameInternal.value = newSelectedGame
    }
  },
  { immediate: true }, // important for initial sync
)

onMounted(() => {
  // When HomePage mounts, if it's the active route and the theme isn't already neutral, neutralize it.
  // This handles the case of navigating from Checkout (or any other page) to Home.
  if (route.path === '/') {
    // // If a theme is active (from prop, originating from localStorage via App.vue)
    // // tell App.vue to clear it because we are on the root path.
    // // This should now be primarily handled by App.vue's synchronous initialization
    // // and its route watcher for navigations to '/'.
    // if (props.activePageThemeProp !== '') {
    //   emit('update-active-theme-game', ''); 
    // } 

    // If App.vue's route watcher and initial setup are correct, 
    // selectedGameInternal should already be cleared by the prop watcher when activePageThemeProp becomes ''.
    // This secondary check acts as a safety net for HomePage's internal consistency if needed,
    // especially if HomePage was already mounted and is re-activated (though route watchers in App.vue should cover this).
    if (selectedGameInternal.value !== '') {
      selectedGameInternal.value = '';
      keyAreaTransitionName.value = 'keys-fade-quick';
    }
  }
})
</script>

<style scoped>
.container {
  margin-top: 60px;
  min-height: calc(100vh - 80px - 60px);
  max-height: calc(100vh - 80px - 60px);
  transition: all var(--transition-speed) ease-out;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center content vertically for neutral state */
}

.container.neutral-state {
  max-width: 600px;
}
.container:not(.neutral-state) {
  justify-content: flex-start; /* Revert to top alignment when a game is selected */
}

.main-title {
  /* Default title styles are in main.css */
  transition:
    font-size 0.4s ease-out,
    color var(--transition-speed) ease;
}
.main-title.neutral-title {
  font-size: 2.3em;
  margin-bottom: 15px;
  color: var(--text-color); /* Ensure it uses the neutral theme's text color */
  text-shadow:
    0 0 8px rgba(var(--glow-primary-rgb), 0.15),
    0 0 15px rgba(var(--glow-secondary-rgb), 0.1);
}

.subtitle {
  /* Default subtitle styles are in main.css */
  transition:
    font-size 0.4s ease-out,
    color var(--transition-speed) ease,
    max-width 0.4s ease-out;
}
.subtitle.neutral-subtitle {
  font-size: 1.05em;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.65;
  color: var(--text-muted-color);
  margin-bottom: 35px; /* More space before GameSelector */
}

.game-selector-component.pulsing-cta .custom-select-selected {
  animation: pulseBorder 2s infinite ease-in-out;
}
@keyframes pulseBorder {
  0%,
  100% {
    border-color: rgba(var(--glow-primary-rgb), 0.4);
    box-shadow:
      0 0 4px rgba(var(--glow-primary-rgb), 0.1),
      inset 0 0 4px rgba(0, 0, 0, 0.2),
      0 0 8px rgba(var(--glow-accent-rgb), 0.1);
  }
  50% {
    border-color: rgba(var(--glow-accent-rgb), 0.6);
    box-shadow:
      0 0 8px rgba(var(--glow-accent-rgb), 0.2),
      inset 0 0 6px rgba(var(--glow-accent-rgb), 0.05),
      0 0 15px rgba(var(--glow-accent-rgb), 0.15);
  }
}

/* Normal fade for KeySelectionArea appearing */
.keys-fade-normal-enter-active,
.keys-fade-normal-leave-active {
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}
.keys-fade-normal-enter-from,
.keys-fade-normal-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

/* Quicker fade for KeySelectionArea disappearing */
.keys-fade-quick-enter-active {
  /* Quick enter might not be used often here, but good to define */
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}
.keys-fade-quick-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out; /* Faster */
}
.keys-fade-quick-enter-from,
.keys-fade-quick-leave-to {
  opacity: 0;
  transform: translateY(5px); /* Less movement for quicker feel */
}

@media (max-width: 650px) {
  .container {
    min-height: calc(100vh - 40px - 60px);
    max-height: calc(100vh - 40px - 60px);
  }
}
@media (max-width: 480px) {
  .container {
    min-height: calc(100vh - 20px - 60px);
    max-height: calc(100vh - 20px - 60px);
  }
  .main-title.neutral-title {
    font-size: 1.9em;
  }
  .subtitle.neutral-subtitle {
    font-size: 0.9em;
  }
}
</style>
