<template>
  <div class="key-card" :class="{ 'best-value': isBestValue }" @click="handleCardClick">
    <h3 class="key-card-title">{{ title }}</h3>
    <p class="key-card-price">{{ price }}</p>
    <ul class="key-card-features">
      <li v-for="feature in features" :key="feature">{{ feature }}</li>
      <li v-if="gameSpecificFeature" class="game-specific-dynamic key-card-feature-accent">
        {{ gameSpecificFeature }}
      </li>
    </ul>
    <button
      class="buy-button"
      @click.stop="triggerPurchase"
      :disabled="isAdding"
      :class="{ 'is-adding': isAdding, 'is-added': justAdded, 'already-exists': alreadyExists }"
      ref="buyButtonRef"
    >
      <span v-if="isAdding">Adding...</span>
      <span v-else-if="justAdded">Added ✔</span>
      <span v-else-if="alreadyExists">In Cart</span>
      <span v-else>{{ buyButtonText }}</span>
    </button>
    <div v-if="showParticles" class="particle-burst" :style="particleBurstPosition">
      <div v-for="p in NUM_PARTICLES_IN_BURST" :key="p" class="particle" :style="particleStyle()"></div>
    </div>
    <div class="visually-hidden" aria-live="polite" aria-atomic="true">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, defineProps, defineEmits, watch } from 'vue' 

// --- Configuration Constants ---
const JUST_ADDED_TIMEOUT = 1500; // ms for "Added ✔" button state
const PARTICLE_BURST_DURATION = 600; // ms for particle visibility
const NUM_PARTICLES_IN_BURST = 10;

// Particle style generation constants
const PARTICLE_RANDOM_MAX_ANGLE = 360;
const PARTICLE_RANDOM_BASE_DISTANCE = 30; // px
const PARTICLE_RANDOM_MAX_ADD_DISTANCE = 40; // px
const PARTICLE_RANDOM_BASE_DURATION = 0.4; // seconds
const PARTICLE_RANDOM_MAX_ADD_DURATION = 0.3; // seconds
const PARTICLE_HSL_SATURATION = '80%';
const PARTICLE_HSL_LIGHTNESS = '65%';
// Optional: const ALREADY_EXISTS_TIMEOUT = 3000; // If enabling timeout for "In Cart" state

const props = defineProps({
  /** The main title of the key card (e.g., pass type). */
  title: String,
  /** The price string to display (e.g., "$9.99"). */
  price: String,
  /** Array of feature strings to list. */
  features: Array,
  /** Boolean indicating if this card should have "best value" styling. */
  isBestValue: Boolean,
  /** Initial text for the buy button (e.g., "Buy Now"). */
  buyButtonText: String,
  /** Optional game-specific feature string. */
  gameSpecificFeature: String,
  /** Path to the game logo (used by watch to reset state on context change). */
  gameLogo: String,
})

/**
 * Emitted when the purchase button is clicked.
 * @event purchase
 * @type {Function}
 * @param {Function} callback - A callback function that the parent should invoke with the purchase status ('added', 'already_in_cart', or other).
 * @param {HTMLElement} buttonRef - A reference to the buy button DOM element, useful for animations.
 */
const emit = defineEmits(['purchase'])

const isAdding = ref(false)
const justAdded = ref(false)
const alreadyExists = ref(false)
const showParticles = ref(false)
const buyButtonRef = ref(null)
const particleBurstPosition = ref({})
/**
 * Holds the message for the ARIA live region, announcing button state changes.
 * @type {import('vue').Ref<String>}
 */
const statusMessage = ref('') 

// Watch for changes in game-specific props to reset button state
watch(
  () => props.gameSpecificFeature, // Also implicitly watches gameLogo if it causes this to change
  /**
   * Resets the button's visual and ARIA states when the card's context changes
   * (indicated by `gameSpecificFeature` or `gameLogo` prop changing).
   */
  () => {
    isAdding.value = false
    justAdded.value = false
    alreadyExists.value = false
    statusMessage.value = '' // Clear message on context change
  },
)

/**
 * Handles the purchase button click.
 * Sets the button state to "Adding...", emits the 'purchase' event,
 * and provides a callback for the parent to report the purchase status.
 * Updates button state and ARIA message based on the status.
 */
const triggerPurchase = () => {
  if (isAdding.value || justAdded.value || alreadyExists.value) return
  isAdding.value = true
  statusMessage.value = 'Adding to cart.'

  emit(
    'purchase',
    /**
     * Callback for the parent component to report purchase status.
     * @param {String} status - The status of the purchase attempt ('added', 'already_in_cart', or other).
     */
    (status) => {
      isAdding.value = false
      statusMessage.value = ''; // Clear "Adding to cart" before new message or if no specific message

      if (status === 'added') {
        justAdded.value = true
        statusMessage.value = 'Item successfully added to cart.'
        triggerParticleBurst()
        setTimeout(() => {
          justAdded.value = false
          // Clear message only if it's still the "added" confirmation
          if (statusMessage.value === 'Item successfully added to cart.') {
            statusMessage.value = ''
          }
        }, JUST_ADDED_TIMEOUT)
      } else if (status === 'already_in_cart') {
        alreadyExists.value = true
        statusMessage.value = 'Item is already in your cart.'
        // Example: Optionally clear "already in cart" message and state after a delay
        // setTimeout(() => {
        //   if (alreadyExists.value && statusMessage.value === 'Item is already in your cart.') {
        //     statusMessage.value = '';
        //     alreadyExists.value = false; // Reset visual state too
        //   }
        // }, ALREADY_EXISTS_TIMEOUT);
      } else {
        // If purchase failed or had another status, ensure loading message is cleared
        statusMessage.value = '';
      }
    },
    buyButtonRef.value, // Pass button ref for potential parent-driven animations
  )
}

/**
 * Handles click events on the entire card, triggering a purchase if appropriate.
 */
const handleCardClick = () => {
  // Only trigger purchase if the button isn't in a temporary disabled-like state
  if (buyButtonRef.value && !isAdding.value && !justAdded.value && !alreadyExists.value) {
    triggerPurchase()
  }
}

/**
 * Triggers a visual particle burst effect originating from the buy button.
 * Sets particle positions and toggles visibility.
 */
const triggerParticleBurst = () => {
  if (buyButtonRef.value) {
    const rect = buyButtonRef.value.getBoundingClientRect()
    const cardRect = buyButtonRef.value.closest('.key-card').getBoundingClientRect() // Get card's relative position
    // Calculate burst origin relative to the card itself
    particleBurstPosition.value = {
      top: `${rect.top - cardRect.top + rect.height / 2}px`,
      left: `${rect.left - cardRect.left + rect.width / 2}px`,
    }
  }
  showParticles.value = true
  nextTick(() => {
    setTimeout(() => {
      showParticles.value = false
    }, PARTICLE_BURST_DURATION)
  })
}

/**
 * Generates a random style object for an individual particle in the burst effect.
 * @returns {Object} A style object with CSS custom properties for particle animation.
 */
const particleStyle = () => {
  const angle = Math.random() * PARTICLE_RANDOM_MAX_ANGLE;
  const distance = Math.random() * PARTICLE_RANDOM_MAX_ADD_DISTANCE + PARTICLE_RANDOM_BASE_DISTANCE;
  const duration = Math.random() * PARTICLE_RANDOM_MAX_ADD_DURATION + PARTICLE_RANDOM_BASE_DURATION;
  return {
    '--angle': `${angle}deg`,
    '--distance': `${distance}px`,
    '--duration': `${duration}s`,
    background: `hsl(${Math.random() * PARTICLE_RANDOM_MAX_ANGLE}, ${PARTICLE_HSL_SATURATION}, ${PARTICLE_HSL_LIGHTNESS})`,
  }
}
</script>

<style scoped>
.key-card {
  background-color: rgba(var(--card-bg-color-opaque), 0.88);
  padding: 20px;
  border-radius: var(--border-radius);
  border: 1px solid rgba(var(--glow-primary-rgb), 0.3);
  text-align: left;
  transition:
    transform var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease,
    border-color var(--transition-speed) ease,
    background-color var(--transition-speed) ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 5px rgba(var(--glow-primary-rgb), 0.15),
    0 0 8px rgba(var(--glow-primary-rgb), 0.1),
    inset 0 0 4px rgba(0, 0, 0, 0.2);
}
.key-card:hover {
  transform: translateY(-5px) scale(1.015);
  border-color: rgba(var(--glow-secondary-rgb), 0.5);
  box-shadow:
    0 0 8px rgba(var(--glow-secondary-rgb), 0.3),
    0 0 12px rgba(var(--glow-secondary-rgb), 0.2),
    inset 0 0 5px rgba(var(--glow-secondary-rgb), 0.05);
}
.key-card-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.15em;
  font-weight: 600;
  color: var(--glow-primary);
  margin-bottom: 8px;
  text-shadow: 0 0 2px rgba(var(--glow-primary-rgb), 0.2);
  transition:
    color var(--transition-speed) ease,
    text-shadow var(--transition-speed) ease;
}
.key-card-price {
  font-size: 1.5em;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 12px;
  transition: color var(--transition-speed) ease;
}
.key-card-features {
  list-style: none;
  padding: 0;
  margin-bottom: 18px;
}
.key-card-features li {
  margin-bottom: 5px;
  color: var(--text-muted-color);
  display: flex;
  align-items: center;
  font-size: 0.8em;
  transition: color var(--transition-speed) ease;
}
.key-card-features li::before {
  content: '✧';
  color: var(--glow-accent);
  font-weight: bold;
  margin-right: 6px;
  font-size: 1em;
  text-shadow: 0 0 3px rgba(var(--glow-accent-rgb), 0.3);
  transition:
    color var(--transition-speed) ease,
    text-shadow var(--transition-speed) ease;
}
.key-card-features li.key-card-feature-accent {
  color: var(--glow-accent);
  font-weight: 600;
  text-shadow: 0 0 4px rgba(var(--glow-accent-rgb), 0.4);
}
.key-card-features li.key-card-feature-accent::before {
  content: '✦';
  font-size: 1.1em;
}

.buy-button {
  display: block;
  width: 100%;
  padding: 10px;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9em;
  font-weight: 700;
  color: var(--text-color);
  background: linear-gradient(
    90deg,
    rgba(var(--glow-primary-rgb), 0.15),
    rgba(var(--glow-accent-rgb), 0.2)
  );
  border: 1px solid rgba(var(--glow-accent-rgb), 0.4);
  border-radius: var(--border-radius);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition:
    transform var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease,
    background var(--transition-speed) ease,
    border-color var(--transition-speed) ease,
    color var(--transition-speed) ease,
    background-color 0.1s ease-out;
  box-shadow:
    0 0 6px rgba(var(--glow-primary-rgb), 0.1),
    0 0 10px rgba(var(--glow-accent-rgb), 0.1);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}
.buy-button:hover:not(:disabled) {
  background: linear-gradient(
    90deg,
    rgba(var(--glow-primary-rgb), 0.2),
    rgba(var(--glow-accent-rgb), 0.25)
  );
  border-color: rgba(var(--glow-accent-rgb), 0.6);
  box-shadow:
    0 0 8px rgba(var(--glow-primary-rgb), 0.15),
    0 0 12px rgba(var(--glow-accent-rgb), 0.15),
    0 0 15px rgba(var(--glow-accent-rgb), 0.1);
  transform: translateY(-2px);
}
.buy-button:active:not(:disabled) {
  transform: translateY(0px);
  background: rgba(var(--glow-accent-rgb), 0.1);
}

.buy-button.is-adding {
  background: linear-gradient(
    90deg,
    rgba(var(--glow-secondary-rgb), 0.2),
    rgba(var(--glow-secondary-rgb), 0.25)
  );
  color: var(--text-muted-color);
  cursor: wait;
}
.buy-button.is-added {
  background: linear-gradient(90deg, rgba(0, 180, 80, 0.3), rgba(0, 200, 100, 0.35));
  color: #c8e6c9;
  border-color: rgba(0, 200, 100, 0.5);
}
.buy-button.already-exists {
  background: linear-gradient(
    90deg,
    rgba(var(--glow-primary-rgb), 0.15),
    rgba(var(--glow-secondary-rgb), 0.2)
  );
  color: var(--text-muted-color);
  cursor: default;
  opacity: 0.8;
}

.key-card.best-value {
  border: 2px solid var(--glow-best-value);
  transform: scale(1.02);
  box-shadow:
    0 0 8px var(--glow-best-value),
    0 0 12px var(--glow-best-value),
    0 0 18px var(--glow-best-value),
    inset 0 0 6px rgba(var(--glow-best-value), 0.1);
}
.key-card.best-value .buy-button {
  animation: pulseBestDealButtonSlow 3s infinite ease-in-out;
  background: linear-gradient(
    90deg,
    rgba(var(--glow-best-value), 0.25),
    rgba(var(--glow-accent-rgb), 0.3)
  );
  border-color: rgba(var(--glow-best-value), 0.5);
}
@keyframes pulseBestDealButtonSlow {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 6px rgba(var(--glow-best-value), 0.1),
      0 0 10px rgba(var(--glow-accent-rgb), 0.1);
  }
  50% {
    transform: scale(1.015);
    box-shadow:
      0 0 10px rgba(var(--glow-best-value), 0.15),
      0 0 15px rgba(var(--glow-accent-rgb), 0.15),
      0 0 20px rgba(var(--glow-accent-rgb), 0.1);
  }
}
.key-card.best-value:hover {
  border-color: var(--glow-best-value);
  transform: translateY(-5px) scale(1.03);
  box-shadow:
    0 0 10px var(--glow-best-value),
    0 0 18px var(--glow-best-value),
    0 0 30px var(--glow-best-value),
    inset 0 0 8px rgba(var(--glow-best-value), 0.15);
}
.key-card.best-value::before {
  content: 'RECOMMENDED';
  position: absolute;
  top: -1px;
  right: -1px;
  background-color: var(--glow-best-value);
  color: var(--bg-color-space);
  padding: 3px 7px;
  font-size: 0.65em;
  font-weight: 900;
  font-family: 'Orbitron', sans-serif;
  border-top-right-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  z-index: 1;
  text-shadow: none;
  box-shadow: 0 0 4px var(--glow-best-value);
  transition:
    background-color var(--transition-speed) ease,
    color var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}

.particle-burst {
  position: absolute;
  width: 1px;
  height: 1px;
  pointer-events: none;
  z-index: 5;
}

.particle {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  opacity: 0;
  animation-name: burst;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-duration: var(--duration);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@keyframes burst {
  0% {
    transform: translate(0, 0) scale(0.6);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateY(var(--distance)) scale(0);
    opacity: 0;
  }
}

@media (max-width: 650px) {
  .key-card.best-value {
    order: -1;
    transform: scale(1);
  }
  .key-card.best-value:hover {
    transform: translateY(-4px) scale(1.01);
  }
}
</style>
