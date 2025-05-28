<template>
  <div class="cart-item-card" :class="themeClasses">
    <img :src="item.gameLogo" :alt="`${item.gameName} logo`" class="cart-item-logo" />
    <div class="cart-item-details">
      <!-- Changed class from cart-item-game-name to item-name for global theme color, added layout class -->
      <h3 class="item-name cart-item-game-name-layout">{{ item.gameName }}</h3>
      <p class="cart-item-pass-title">{{ item.passTitle }}</p>
      <p v-if="item.gameSpecificFeature" class="cart-item-specific-feature">
        {{ item.gameSpecificFeature }}
      </p>
    </div>
    <div class="cart-item-quantity">
      <button
        @click="updateQty(item.quantity - 1)"
        :disabled="item.quantity <= 1"
        class="qty-button"
      >
        -
      </button>
      <input
        type="number"
        :value="item.quantity"
        @change="handleQtyInput($event.target.value)"
        @blur="handleQtyBlur($event.target.value)"
        min="1"
        class="qty-input"
      />
      <button @click="updateQty(item.quantity + 1)" class="qty-button">+</button>
    </div>
    <div class="cart-item-price-actions">
      <p class="cart-item-price">${{ (item.priceNumeric * item.quantity).toFixed(2) }}</p>
      <button @click="$emit('removeItem', item.id)" class="remove-button" aria-label="Remove item">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          ></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})
defineEmits(['removeItem'])

const cartStore = useCartStore()

const themeClasses = computed(() => {
  const classes = ['themed-item-card']; // Base class for global styles
  if (props.item && props.item.gameValue) {
    classes.push(`game-${props.item.gameValue}`); // Global game-specific theme (e.g., game-minecraft)
    classes.push(`theme-item-${props.item.gameValue}`); // Existing scoped theme (e.g., theme-item-minecraft)
  }
  return classes;
})

const updateQty = (newQuantity) => {
  const validatedQuantity = Math.max(1, parseInt(newQuantity, 10) || 1) // Ensure at least 1
  cartStore.updateQuantity(props.item.id, validatedQuantity)
}

const handleQtyInput = (value) => {
  // No immediate update on every input, wait for blur or +/-
  // This prevents issues if user is typing "10" and it tries to update on "1"
}
const handleQtyBlur = (value) => {
  const newQuantity = parseInt(value, 10)
  if (!isNaN(newQuantity)) {
    updateQty(newQuantity)
  } else {
    // If input is invalid on blur, revert to current store quantity
    // This requires the input to re-bind to item.quantity, which it does via :value
    // To force a visual update if the invalid input is still there:
    const inputEl = event.target
    inputEl.value = props.item.quantity
  }
}
</script>

<style scoped>
.cart-item-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-radius: var(--border-radius);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 0 5px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease-out,
    background-color var(--transition-speed) ease,
    border-color var(--transition-speed) ease,
    color var(--transition-speed) ease,
    box-shadow 0.2s ease-out; /* Explicitly add box-shadow to transition */

  /* background-color: var(--card-bg-color-opaque); */ /* Commented out to allow global theme */
  /* border: 1px solid rgba(var(--glow-secondary-rgb), 0.2); */ /* Commented out to allow global theme */
  color: var(--text-color); /* Base text color - can be overridden by theme */
  min-height: 80px; /* Ensure a minimum height */
  position: relative; /* For z-index stacking context */
  z-index: 1; /* Default z-index */
}
.cart-item-card:hover {
  transform: translateY(-2px) scale(1.01);
  z-index: 10; /* Elevate on hover */
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.2), /* Existing hover shadow */
    inset 0 0 8px rgba(var(--glow-accent-rgb), 0.05); /* Existing hover shadow */
    /* Consider enhancing shadow further if global theme provides a stronger one for active cards */
}

/* Minecraft Themed Item */
.cart-item-card.theme-item-minecraft {
  /* background-color: rgba(var(--mc-card-bg-opaque-rgb, 60, 75, 50), 0.92); */ /* Global theme will handle background */
  /* border: 1px solid rgba(var(--mc-glow-primary-rgb, 160, 136, 96), 0.4); */ /* Global theme will handle border */
  color: var(--mc-text-color, #c0b8a8); /* Overall text color for this theme */
}
/* .cart-item-card.theme-item-minecraft .cart-item-game-name { */ /* Color now handled by global .item-name */
  /* color: var(--mc-text-color-highlight, #d8ccb8); */
/* } */
.cart-item-card.theme-item-minecraft .cart-item-pass-title {
  color: var(--mc-text-muted-color, #a09078);
}
.cart-item-card.theme-item-minecraft .cart-item-price {
  color: var(--mc-text-color-strong, #e0d8c0);
}
.cart-item-card.theme-item-minecraft .cart-item-specific-feature {
  color: var(--mc-glow-accent, #50c878);
  text-shadow: 0 0 3px rgba(var(--mc-glow-accent-rgb, 80, 200, 120), 0.4);
}
.cart-item-card.theme-item-minecraft .remove-button,
.cart-item-card.theme-item-minecraft .qty-button {
  color: var(--mc-text-muted-color, #a09078);
}
.cart-item-card.theme-item-minecraft .remove-button:hover,
.cart-item-card.theme-item-minecraft .qty-button:hover:not(:disabled) {
  color: var(--mc-glow-accent, #50c878);
  background-color: rgba(var(--mc-glow-accent-rgb, 80, 200, 120), 0.1);
}
.cart-item-card.theme-item-minecraft .cart-item-logo,
.cart-item-card.theme-item-minecraft .qty-input {
  background-color: rgba(var(--mc-bg-darker-rgb, 30, 40, 25), 0.5);
  border-color: rgba(var(--mc-glow-primary-rgb, 160, 136, 96), 0.2);
  color: var(--mc-text-color, #c0b8a8);
}

/* Fortnite Themed Item */
.cart-item-card.theme-item-fortnite {
  /* background-color: rgba(var(--fn-card-bg-opaque-rgb, 25, 15, 50), 0.94); */ /* Global theme will handle background */
  /* border: 1px solid rgba(var(--fn-glow-primary-rgb, 138, 43, 226), 0.4); */ /* Global theme will handle border */
  color: var(--fn-text-color, #d8c8f0); /* Overall text color for this theme */
}
/* .cart-item-card.theme-item-fortnite .cart-item-game-name { */ /* Color now handled by global .item-name */
  /* color: var(--fn-text-color-highlight, #e8d8ff); */
/* } */
.cart-item-card.theme-item-fortnite .cart-item-pass-title {
  color: var(--fn-text-muted-color, #b0a0c8);
}
.cart-item-card.theme-item-fortnite .cart-item-price {
  color: var(--fn-text-color-strong, #f0e0ff);
}
.cart-item-card.theme-item-fortnite .cart-item-specific-feature {
  color: var(--fn-glow-accent, #00ffff);
  text-shadow: 0 0 4px rgba(var(--fn-glow-accent-rgb, 0, 255, 255), 0.5);
}
.cart-item-card.theme-item-fortnite .remove-button,
.cart-item-card.theme-item-fortnite .qty-button {
  color: var(--fn-text-muted-color, #b0a0c8);
}
.cart-item-card.theme-item-fortnite .remove-button:hover,
.cart-item-card.theme-item-fortnite .qty-button:hover:not(:disabled) {
  color: var(--fn-glow-accent, #00ffff);
  background-color: rgba(var(--fn-glow-accent-rgb, 0, 255, 255), 0.1);
}
.cart-item-card.theme-item-fortnite .cart-item-logo,
.cart-item-card.theme-item-fortnite .qty-input {
  background-color: rgba(var(--fn-bg-darker-rgb, 15, 5, 30), 0.5);
  border-color: rgba(var(--fn-glow-primary-rgb, 138, 43, 226), 0.2);
  color: var(--fn-text-color, #d8c8f0);
}

/* Call of Duty Themed Item */
.cart-item-card.theme-item-cod {
  /* background-color: rgba(var(--cod-card-bg-opaque-rgb, 28, 32, 28), 0.95); */ /* Global theme will handle background */
  /* border: 1px solid rgba(var(--cod-glow-primary-rgb, 255, 140, 0), 0.4); */ /* Global theme will handle border */
  color: var(--cod-text-color, #a8b0a8); /* Overall text color for this theme */
}
/* .cart-item-card.theme-item-cod .cart-item-game-name { */ /* Color now handled by global .item-name */
  /* color: var(--cod-text-color-highlight, #c0c8c0); */
/* } */
.cart-item-card.theme-item-cod .cart-item-pass-title {
  color: var(--cod-text-muted-color, #889088);
}
.cart-item-card.theme-item-cod .cart-item-price {
  color: var(--cod-text-color-strong, #d0d8d0);
}
.cart-item-card.theme-item-cod .cart-item-specific-feature {
  color: var(--cod-glow-accent, #f0e68c);
  text-shadow: 0 0 3px rgba(var(--cod-glow-accent-rgb, 240, 230, 140), 0.4);
}
.cart-item-card.theme-item-cod .remove-button,
.cart-item-card.theme-item-cod .qty-button {
  color: var(--cod-text-muted-color, #889088);
}
.cart-item-card.theme-item-cod .remove-button:hover,
.cart-item-card.theme-item-cod .qty-button:hover:not(:disabled) {
  color: var(--cod-glow-accent, #f0e68c);
  background-color: rgba(var(--cod-glow-accent-rgb, 240, 230, 140), 0.1);
}
.cart-item-card.theme-item-cod .cart-item-logo,
.cart-item-card.theme-item-cod .qty-input {
  background-color: rgba(var(--cod-bg-darker-rgb, 10, 12, 10), 0.5);
  border-color: rgba(var(--cod-glow-primary-rgb, 255, 140, 0), 0.2);
  color: var(--cod-text-color, #a8b0a8);
}

.cart-item-logo {
  width: 45px;
  height: 45px;
  object-fit: contain;
  border-radius: 4px;
  padding: 5px;
  flex-shrink: 0; /* Prevent logo from shrinking */
}

.cart-item-details {
  flex-grow: 1; /* Allow details to take up available space */
  text-align: left;
  overflow: hidden; /* Prevent long text from breaking layout */
  margin-right: 10px; /* Space before quantity */
}
/* This class now primarily handles layout/structure for the game name */
.cart-item-game-name-layout { 
  font-family: 'Orbitron', sans-serif; /* Retain font */
  font-size: 1em; /* Retain specific size for CartItem */
  font-weight: 600; /* Retain specific weight */
  margin-bottom: 2px; /* Retain specific margin */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Color will be inherited or set by global .item-name theme */
}
.cart-item-pass-title {
  font-size: 0.85em;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cart-item-specific-feature {
  font-size: 0.75em;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0; /* Prevent quantity controls from shrinking */
}
.qty-button {
  background: none;
  border: 1px solid rgba(var(--text-muted-color), 0.3);
  color: var(--text-muted-color);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.qty-button:hover:not(:disabled) {
  border-color: var(--glow-accent);
  background-color: rgba(var(--glow-accent-rgb), 0.1);
}
.qty-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.qty-input {
  width: 40px; /* Fixed width for quantity input */
  padding: 3px 5px;
  text-align: center;
  border: 1px solid rgba(var(--text-muted-color), 0.3);
  border-radius: 4px;
  font-size: 0.9em;
  -moz-appearance: textfield;
  flex-shrink: 0;
}
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-item-price-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  text-align: right;
  margin-left: auto;
  padding-left: 10px;
  flex-shrink: 0; /* Prevent this section from shrinking */
}
.cart-item-price {
  font-size: 1em;
  font-weight: 600;
  min-width: 70px; /* Ensure space for price like $XXX.XX */
  text-align: right;
}
.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition:
    color var(--transition-speed) ease,
    background-color var(--transition-speed) ease;
  flex-shrink: 0;
}
.remove-button svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 520px) {
  /* Adjusted breakpoint for better wrapping */
  .cart-item-card {
    flex-wrap: wrap;
    gap: 8px;
  }
  .cart-item-logo {
    width: 100%;
    height: 40px;
    margin-bottom: 5px;
    text-align: center; /* Center logo if full width */
  }
  .cart-item-logo img {
    margin: 0 auto;
  } /* If logo itself is smaller than container */
  .cart-item-details {
    width: 100%;
    margin-right: 0;
    order: 2;
    text-align: center;
  }
  .cart-item-quantity {
    width: 100%;
    justify-content: center;
    order: 3;
    margin-top: 8px;
  }
  .cart-item-price-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    order: 4;
    padding-left: 0;
  }
  .cart-item-price {
    min-width: auto;
  }
}
</style>
