<template>
  <div class="game-selector-container" ref="selectorContainerRef">
    <label class="game-selector-label" for="custom-game-select-input-search">Select Game:</label>
    <div
      class="custom-select-selected"
      :class="{ open: isOpen }"
      tabindex="0"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen.toString()"
      aria-controls="game-options-list"
      @click="toggleDropdown"
      @keydown.enter.prevent="handleKeydownEnterOnSelected"
      @keydown.space.prevent="toggleDropdown"
      @keydown.esc.prevent="closeDropdown"
      @keydown.down.prevent="navigateOptions('down')"
      @keydown.up.prevent="navigateOptions('up')"
    >
      <!-- TODO: Image Optimization: If game logos are raster images, consider WebP format with <picture> element fallback. If SVGs, ensure they are optimized. -->
      <img
        :src="selectedGameDisplayLogo"
        :alt="selectedGameDisplayName ? `${selectedGameDisplayName} logo` : 'Select game icon'"
        class="selected-logo"
      />
      <span class="selected-text" :class="{ placeholder: !selectedGameDisplayName }">
        {{ selectedGameDisplayName || '-- Select Game --' }}
      </span>
    </div>
    <div class="custom-select-options" :class="{ show: isOpen }">
      <input
        type="text"
        class="custom-select-search-input"
        placeholder="Search games..."
        id="custom-game-select-input-search"
        aria-autocomplete="list"
        aria-controls="game-options-list"
        v-model="searchTerm"
        @input="filterOptions"
        @keydown.enter.prevent="selectHighlightedOption"
        @keydown.esc.prevent="closeDropdown"
        @keydown.down.prevent="navigateOptions('down')"
        @keydown.up.prevent="navigateOptions('up')"
        ref="searchInputRef"
      />
      <ul
        class="custom-select-options-list"
        id="game-options-list"
        role="listbox"
        ref="optionsListRef"
      >
        <li
          v-for="(game, index) in filteredGames"
          :key="game.value"
          class="custom-select-option"
          :class="{
            highlighted: index === highlightedIndex,
            'selected-item': game.value === currentSelectedValueProp,
          }"
          :data-value="game.value"
          :data-name="game.name"
          :data-logo="game.logoSrc"
          tabindex="-1"
          role="option"
          :id="`option-${game.value}-${index}`"
          :aria-selected="game.value === currentSelectedValueProp ? 'true' : 'false'"
          @click="selectOption(game)"
          @mouseenter="highlightedIndex = index"
        >
          <!-- TODO: Image Optimization: If game logos are raster images, consider WebP format with <picture> element fallback. If SVGs, ensure they are optimized. -->
          <img :src="game.logoSrc" :alt="`${game.name} logo`" />
          <span>{{ game.name }}</span>
        </li>
      </ul>
      <div class="no-results-message" v-if="filteredGames.length === 0 && searchTerm">
        No games found.
      </div>
    </div>
    <input
      type="hidden"
      id="selected-game-value-hidden"
      name="selected_game"
      :value="currentSelectedValueProp"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  games: {
    type: Array,
    required: true,
  },
  currentSelectedValueProp: {
    // Renamed for clarity
    type: String,
    default: '',
  },
})

const emit = defineEmits(['game-selected'])

const defaultLogoSVG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiBmaWxsPSIjNzE1ODg4Ij48cGF0aCBkPSJNMTYuNSA5TDEzIDUuNUw5LjUgOUgxMnYzSDlMMTMgMTUuNUwxNi41IDEySDE0VjloMi41ek0xOCAySDZDNC4zNCAyIDMgMy4zNCAzIDV2MTRjMCAxLjY2IDEuMzQgMyAzIDNoMTJjMS42NiAwIDMtMS4zNCAzLTNWNWMwLTEuNjYtMS4zNC0zLTMtM3ptMSAxN2MwIC41NS0uNDUgMS0xIDFILTZjLS41NSAwLTEtLjQ1LTEtMVY1YzAtLjU1LjQ1LTEgMS0xaDEyYy41NSAwIDEgLjQ1IDEgMXYxNHpNODAxMnYtMmgwdjJIOHptNiAwdjYtMmgwdjJILTR6Ii8+PC9zdmc+'

const isOpen = ref(false)
const searchTerm = ref('')
const selectedGameDisplayName = ref('')
const selectedGameDisplayLogo = ref(defaultLogoSVG)
const highlightedIndex = ref(-1)

const selectorContainerRef = ref(null)
const searchInputRef = ref(null)
const optionsListRef = ref(null)

watch(
  () => props.currentSelectedValueProp,
  (newValue) => {
    if (newValue) {
      const game = props.games.find((g) => g.value === newValue)
      if (game) {
        selectedGameDisplayName.value = game.name
        selectedGameDisplayLogo.value = game.logoSrc
      } else {
        selectedGameDisplayName.value = ''
        selectedGameDisplayLogo.value = defaultLogoSVG
      }
    } else {
      selectedGameDisplayName.value = ''
      selectedGameDisplayLogo.value = defaultLogoSVG
      searchTerm.value = ''
      highlightedIndex.value = -1
    }
  },
  { immediate: true },
)

const filteredGames = computed(() => {
  if (!searchTerm.value) {
    return props.games
  }
  return props.games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
    const currentIndexInFiltered = filteredGames.value.findIndex(
      (g) => g.value === props.currentSelectedValueProp,
    )
    if (currentIndexInFiltered !== -1) {
      highlightedIndex.value = currentIndexInFiltered
    } else if (filteredGames.value.length > 0) {
      highlightedIndex.value = 0
    } else {
      highlightedIndex.value = -1
    }
    if (highlightedIndex.value !== -1) scrollToHighlighted()
  } else {
    selectorContainerRef.value?.querySelector('.custom-select-selected').focus()
  }
}

function closeDropdown() {
  isOpen.value = false
}

function selectOption(game) {
  emit('game-selected', game.value)
  closeDropdown()
  nextTick(() => {
    selectorContainerRef.value?.querySelector('.custom-select-selected').focus()
  })
}

function filterOptions() {
  highlightedIndex.value = filteredGames.value.length > 0 ? 0 : -1
  if (highlightedIndex.value !== -1) scrollToHighlighted()
}

function navigateOptions(direction) {
  if (!isOpen.value && (direction === 'down' || direction === 'up')) {
    toggleDropdown()
    return
  }
  if (!filteredGames.value.length) return

  if (direction === 'down') {
    highlightedIndex.value = (highlightedIndex.value + 1) % filteredGames.value.length
  } else if (direction === 'up') {
    highlightedIndex.value =
      (highlightedIndex.value - 1 + filteredGames.value.length) % filteredGames.value.length
  }
  scrollToHighlighted()
}

function selectHighlightedOption() {
  if (isOpen.value && highlightedIndex.value > -1 && filteredGames.value[highlightedIndex.value]) {
    selectOption(filteredGames.value[highlightedIndex.value])
  }
}

function handleKeydownEnterOnSelected() {
  if (isOpen.value) {
    selectHighlightedOption()
  } else {
    toggleDropdown()
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const listElement = optionsListRef.value
    if (!listElement) return
    const highlightedItem = listElement.children[highlightedIndex.value]
    if (highlightedItem) {
      highlightedItem.scrollIntoView({ block: 'nearest' })
      searchInputRef.value?.setAttribute('aria-activedescendant', highlightedItem.id)
    } else {
      searchInputRef.value?.removeAttribute('aria-activedescendant')
    }
  })
}

const handleClickOutside = (event) => {
  if (selectorContainerRef.value && !selectorContainerRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
.game-selector-container {
  margin-bottom: 25px;
  position: relative;
  animation: popInSlow var(--animation-speed-slow) 1.8s ease-out forwards;
  opacity: 0;
  width: 100%;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
  z-index: 20; /* Ensure dropdown is above other elements within .container */
}
@keyframes popInSlow {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.game-selector-label {
  display: block;
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--glow-primary);
  text-shadow: 0 0 3px rgba(var(--glow-primary-rgb), 0.2);
  transition:
    color var(--transition-speed) ease,
    text-shadow var(--transition-speed) ease;
}
.custom-select-selected {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  font-size: 0.9em;
  border-radius: var(--border-radius);
  border: 1px solid rgba(var(--glow-primary-rgb), 0.4);
  background-color: rgba(var(--card-bg-color-opaque), 0.92);
  color: var(--text-color);
  cursor: pointer;
  transition:
    border-color var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease,
    background-color var(--transition-speed) ease,
    color var(--transition-speed) ease,
    transform var(--transition-speed) ease; /* Added transform to transition */
  box-shadow:
    0 0 4px rgba(var(--glow-primary-rgb), 0.1),
    inset 0 0 4px rgba(0, 0, 0, 0.2);
  position: relative;
}
.custom-select-selected:active {
  transform: scale(0.98);
  background-color: rgba(var(--card-bg-color-opaque), 0.85); /* Slightly darken */
}
.custom-select-selected.open {
  border-color: rgba(var(--glow-accent-rgb), 0.6);
  box-shadow:
    0 0 6px rgba(var(--glow-accent-rgb), 0.2),
    inset 0 0 5px rgba(var(--glow-accent-rgb), 0.05);
}
.custom-select-selected::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--glow-primary);
  transition:
    transform var(--transition-speed) ease,
    border-top-color var(--transition-speed) ease;
}
.custom-select-selected.open::after {
  transform: translateY(-50%) rotate(180deg);
  border-top-color: var(--glow-accent);
}
.custom-select-selected img.selected-logo {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px var(--text-muted-color));
}
.custom-select-selected span.selected-text {
  flex-grow: 1;
  text-align: left;
}
.custom-select-selected span.placeholder {
  color: var(--text-muted-color);
  transition: color var(--transition-speed) ease;
}

.custom-select-options {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--card-bg-color-opaque);
  border: 1px solid rgba(var(--glow-accent-rgb), 0.5);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(var(--glow-accent-rgb), 0.1);
  z-index: 1000; /* Ensure options are above everything else on the page */
  max-height: 220px;
  overflow-y: auto;
  padding-top: 5px;
  padding-bottom: 5px;
  backdrop-filter: blur(8px);
  transition:
    background-color var(--transition-speed) ease,
    border-color var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}
.custom-select-options.show {
  display: block;
}
.custom-select-search-input {
  width: calc(100% - 16px);
  padding: 8px;
  margin: 4px 8px 8px 8px;
  border: 1px solid rgba(var(--glow-primary-rgb), 0.3);
  border-radius: calc(var(--border-radius) - 4px);
  background-color: rgba(var(--bg-color-space), 0.95);
  color: var(--text-color);
  font-size: 0.85em;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.15);
  transition:
    border-color var(--transition-speed) ease,
    background-color var(--transition-speed) ease,
    color var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}
.custom-select-search-input:focus {
  outline: none;
  border-color: rgba(var(--glow-accent-rgb), 0.6);
  box-shadow: inset 0 0 5px rgba(var(--glow-accent-rgb), 0.1);
}
.custom-select-options-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.custom-select-option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition:
    background-color var(--transition-speed) ease,
    color var(--transition-speed) ease;
  text-align: left;
  font-size: 0.9em;
}
.custom-select-option img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px var(--text-muted-color));
}
.custom-select-option.highlighted {
  background-color: rgba(var(--glow-accent-rgb), 0.1);
  color: var(--glow-accent);
}
.custom-select-option.selected-item,
.custom-select-option[aria-selected='true'] {
  background-color: rgba(var(--glow-accent-rgb), 0.15);
  font-weight: 600;
  color: var(--glow-accent);
}
.no-results-message {
  padding: 8px 12px;
  color: var(--text-muted-color);
  text-align: center;
  font-size: 0.8em;
  transition: color var(--transition-speed) ease;
}
</style>
