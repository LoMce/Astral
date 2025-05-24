<template>
  <div class="cart-icon-container" :class="{ 'animate-pop': pop }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span v-if="cartStore.cartItemCount > 0" class="cart-count">{{ cartStore.cartItemCount }}</span>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue' // Added defineProps
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  // Defined props
  animateTrigger: Number,
})

const cartStore = useCartStore()
const pop = ref(false)

watch(
  () => props.animateTrigger,
  () => {
    if (props.animateTrigger > 0) {
      pop.value = true
      setTimeout(() => {
        pop.value = false
      }, 300)
    }
  },
)
</script>

<style scoped>
.cart-icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  color: currentColor;
}
.cart-icon-container svg {
  width: 20px;
  height: 20px;
}
.cart-count {
  position: absolute;
  top: -8px;
  right: -10px;
  background-color: var(--glow-accent);
  color: var(--card-bg-color-opaque); /* Ensure good contrast */
  border-radius: 50%;
  padding: 1px 5px;
  font-size: 0.7em;
  font-weight: bold;
  min-width: 18px; /* Ensures circle shape for single digit */
  text-align: center;
  line-height: 1.1; /* Adjust for vertical centering of text */
  box-shadow: 0 0 5px rgba(var(--glow-accent-rgb), 0.5);
  transition:
    background-color var(--transition-speed) ease,
    color var(--transition-speed) ease;
}

.animate-pop {
  animation: popEffect 0.3s ease-out;
}
@keyframes popEffect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>
