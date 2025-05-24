<template>
  <div id="key-selection-area" :class="{ visible: selectedGameValueComputed }">
    <h2 class="keys-title">Choose Your Access Pass</h2>
    <div class="key-options-grid">
      <KeyCard
        v-for="card in keyCards"
        :key="card.title"
        :title="card.title"
        :price="card.price"
        :features="card.features"
        :isBestValue="card.isBestValue"
        :buyButtonText="card.buyButtonText"
        :gameSpecificFeature="getGameSpecificFeatureText(card.type)"
        :game-logo="selectedGameLogo"
        @purchase="(callback, startElement) => handlePurchaseAttempt(card, startElement, callback)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, inject } from 'vue'
import KeyCard from './KeyCard.vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  selectedGameValue: {
    type: String,
    default: '',
  },
  gamesData: {
    type: Array,
    required: true,
  },
})

const cartStore = useCartStore()
const flyToCart = inject('flyToCart') // Inject the animation function

// Computed property to ensure reactivity for visibility
const selectedGameValueComputed = computed(() => props.selectedGameValue)

const selectedGameLogo = computed(() => {
  const game = props.gamesData.find((g) => g.value === props.selectedGameValue)
  return game ? game.logoSrc : ''
})

const keyCardsData = [
  {
    type: 'Daily',
    title: 'Daily Pass',
    price: '$1.99',
    features: ['Instant Access', 'Core Features'],
    isBestValue: false,
    buyButtonText: 'Add to Cart',
  },
  {
    type: 'Monthly',
    title: 'Monthly Pass',
    price: '$19.99',
    features: ['Full Access', 'Unlock Everything'],
    isBestValue: true,
    buyButtonText: 'Add to Cart',
  },
  {
    type: 'Weekly',
    title: 'Weekly Pass',
    price: '$7.99',
    features: ['7-Day Access', 'All Features'],
    isBestValue: false,
    buyButtonText: 'Add to Cart',
  },
]

const keyCards = computed(() => keyCardsData)

const getGameSpecificFeatureText = (cardType) => {
  if (!props.selectedGameValue) return ''
  const game = props.gamesData.find((g) => g.value === props.selectedGameValue)
  const gameName = game ? game.name : 'Game'

  if (props.selectedGameValue === 'minecraft') return `+ Realmwalker's Boon`
  if (props.selectedGameValue === 'fortnite') return `+ Storm Rider's Edge`
  if (props.selectedGameValue === 'cod') return `+ Night Ops Advantage`
  return `+ ${gameName} Enhancements`
}

const handlePurchaseAttempt = (cardDetails, startElement, callback) => {
  const game = props.gamesData.find((g) => g.value === props.selectedGameValue)
  if (game) {
    const status = cartStore.addToCart(cardDetails, game, props.gamesData)
    if (status === 'added' && flyToCart && startElement) {
      flyToCart(startElement, game.logoSrc) // Trigger animation
    }
    callback(status)
  } else {
    console.error('Selected game not found in gamesData for cart addition.')
    callback('error')
  }
}
</script>

<style scoped>
#key-selection-area {
  display: none;
  position: relative;
  margin-top: 20px;
}
#key-selection-area.visible {
  display: block;
  animation: fadeInKeysSlow 0.8s 0.1s ease-out forwards;
  opacity: 0;
}
@keyframes fadeInKeysSlow {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.keys-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.3em;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 18px;
  position: relative;
  display: inline-block;
  padding-bottom: 4px;
  text-shadow: 0 0 4px rgba(var(--glow-accent-rgb), 0.3);
  transition:
    color var(--transition-speed) ease,
    text-shadow var(--transition-speed) ease;
}
.keys-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(var(--glow-primary-rgb), 0.3),
    rgba(var(--glow-secondary-rgb), 0.3)
  );
  border-radius: 1px;
  box-shadow: 0 0 4px rgba(var(--glow-primary-rgb), 0.1);
  transition:
    background var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}
.key-options-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  gap: 18px;
  margin-top: 12px;
  align-items: start;
}

@media (max-width: 650px) {
  .key-options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
