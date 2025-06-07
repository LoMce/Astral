<template>
  <transition name="minicart-fade">
    <div v-if="isOpen" class="mini-cart-overlay" @click.self="$emit('close')">
      <div
        ref="miniCartContainerRef"
        class="mini-cart-container"
        :class="themeClass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-cart-title"
        @keydown="handleKeyDown"
      >
        <div class="mini-cart-header">
          <h3 id="mini-cart-title">Your Cart</h3>
          <button @click="$emit('close')" class="close-button" aria-label="Close cart preview">
            ×
          </button>
        </div>
        <div v-if="cartStore.items.length === 0" class="mini-cart-empty">
          <p>Your cart is empty.</p>
        </div>
        <div v-else class="mini-cart-items">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            :class="['mini-cart-item', 'themed-item-card', item.gameValue ? 'game-' + item.gameValue : '', `theme-item-${item.gameValue}`]"
          >
            <img :src="item.gameLogo" :alt="item.gameName" class="mini-cart-item-logo" />
            <div class="mini-cart-item-details">
              <div class="item-info-main">
                <span class="item-name">{{ item.gameName }} - {{ item.passTitle }}</span>
                <span class="item-price">{{ item.passPrice }}</span>
              </div>
              <div class="item-info-qty">
                <span>Qty: {{ item.quantity }}</span>
              </div>
            </div>
            <button
              @click="cartStore.removeFromCart(item.id)"
              class="item-remove-button"
              aria-label="Remove item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="mini-cart-footer" v-if="cartStore.items.length > 0">
          <div class="mini-cart-total">
            <span>Subtotal:</span>
            <span class="total-amount">${{ cartStore.cartTotal.toFixed(2) }}</span>
          </div>
          <router-link
            to="/checkout"
            @click="$emit('close')"
            class="styled-button view-cart-button"
          >
            Proceed to Checkout
          </router-link>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, defineProps, defineEmits, watch, nextTick, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { RouterLink } from 'vue-router' 

// --- Constants ---
/**
 * CSS selector for finding focusable elements within the MiniCart.
 * @type {String}
 */
const FOCUSABLE_ELEMENTS_SELECTOR = 
  'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';


const props = defineProps({
  /** Controls the visibility of the MiniCart. */
  isOpen: Boolean,
  /** The active theme string (e.g., 'minecraft') to apply consistent styling. */
  activeTheme: String, 
})

/**
 * Emitted when the MiniCart requests to be closed.
 * @event close
 */
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const miniCartContainerRef = ref(null)

/**
 * Computes the theme class string for the MiniCart container.
 * @returns {String} The theme class, e.g., "theme-minecraft", or empty if no active theme.
 */
const themeClass = computed(() => {
  return props.activeTheme ? `theme-${props.activeTheme}` : ''
})

/**
 * Retrieves all visible, focusable elements within a given container.
 * @param {HTMLElement} container - The parent element to search within.
 * @returns {Array<HTMLElement>} An array of focusable HTML elements.
 */
function getFocusableElements(container) {
  if (!container) return []
  return Array.from(
    container.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR)
  ).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0) // Filter out hidden elements
}

/**
 * Sets focus to the first focusable element within the MiniCart container.
 * Typically called when the MiniCart is opened.
 */
function focusFirstElement() {
  if (miniCartContainerRef.value) {
    const focusable = getFocusableElements(miniCartContainerRef.value)
    if (focusable.length > 0) {
      focusable[0].focus()
    }
  }
}

/**
 * Watches the `isOpen` prop. When the MiniCart opens, it waits for the next DOM tick
 * and then calls `focusFirstElement` to manage focus.
 */
watch(
  () => props.isOpen,
  (newIsOpen) => {
    if (newIsOpen) {
      nextTick(() => {
        focusFirstElement()
      })
    }
  }
)

/**
 * Handles keyboard events within the MiniCart, primarily for focus trapping (Tab key).
 * @param {KeyboardEvent} event - The keyboard event object.
 */
const handleKeyDown = (event) => {
  if (event.key === 'Tab' && miniCartContainerRef.value) {
    const focusableElements = getFocusableElements(miniCartContainerRef.value)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const currentElement = document.activeElement

    if (event.shiftKey) {
      // Shift + Tab
      if (currentElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (currentElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}
</script>

<style scoped>
.mini-cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: flex-end; /* Align to the right */
  align-items: flex-start; /* Align to the top */
  z-index: 1000;
  padding-top: 60px; /* Below header */
}

.mini-cart-container {
  background-color: var(--card-bg-color-opaque);
  color: var(--text-color);
  border: 1px solid rgba(var(--glow-primary-rgb), 0.3);
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 350px;
  max-height: calc(100vh - 80px); /* Respect header and some padding */
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius) 0 0 var(--border-radius); /* Rounded on left side */
  margin-right: 0; /* Stick to the right edge */
}

/* Transition for the overlay and container */
.minicart-fade-enter-active,
.minicart-fade-leave-active {
  transition: opacity 0.3s ease;
}
.minicart-fade-enter-active .mini-cart-container,
.minicart-fade-leave-active .mini-cart-container {
  transition: transform 0.3s ease-out;
}
.minicart-fade-enter-from,
.minicart-fade-leave-to {
  opacity: 0;
}
.minicart-fade-enter-from .mini-cart-container {
  transform: translateX(100%);
}
.minicart-fade-leave-to .mini-cart-container {
  transform: translateX(100%);
}

.mini-cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(var(--text-muted-color), 0.2);
}
.mini-cart-header h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1em;
  color: var(--glow-primary);
  margin: 0;
}
.close-button {
  background: none;
  border: none;
  color: var(--text-muted-color);
  font-size: 1.8em;
  line-height: 1;
  cursor: pointer;
  padding: 0 5px;
}
.close-button:hover {
  color: var(--glow-accent);
}

.mini-cart-empty {
  padding: 30px 15px;
  text-align: center;
  color: var(--text-muted-color);
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-cart-items {
  overflow-y: auto;
  padding: 10px 15px;
  flex-grow: 1;
}
.mini-cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0; /* Increased padding */
  border-bottom: 1px dashed rgba(var(--text-muted-color), 0.15);
  font-size: 0.9em;
}
.mini-cart-item:last-child {
  border-bottom: none;
}

/* Theming for items inside minicart - uses game-specific vars */
.mini-cart-item.theme-item-minecraft {
  border-left: 3px solid var(--glow-primary-minecraft);
  padding-left: 8px;
  background-color: rgba(var(--mc-card-bg-opaque-rgb, 60, 75, 50), 0.2);
}
.mini-cart-item.theme-item-fortnite {
  border-left: 3px solid var(--glow-primary-fortnite);
  padding-left: 8px;
  background-color: rgba(var(--fn-card-bg-opaque-rgb, 25, 15, 50), 0.2);
}
.mini-cart-item.theme-item-cod {
  border-left: 3px solid var(--glow-primary-cod);
  padding-left: 8px;
  background-color: rgba(var(--cod-card-bg-opaque-rgb, 28, 32, 28), 0.2);
}
/* Fallback if needed */
.mini-cart-item:not([class*='theme-item-']) {
  border-left: 3px solid var(--glow-secondary);
  padding-left: 8px;
}

.mini-cart-item-logo {
  width: 40px; /* Slightly larger */
  height: 40px;
  object-fit: contain;
  border-radius: 3px;
  background-color: rgba(var(--bg-color-space), 0.3);
  padding: 4px; /* Slightly larger padding */
  flex-shrink: 0;
}
.mini-cart-item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 2px; /* Small gap between name/price and qty */
}
.item-info-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.mini-cart-item-details .item-name {
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95em; /* Slightly larger */
  flex-grow: 1;
  margin-right: 5px; /* Space before price */
}
.mini-cart-item-details .item-price {
  color: var(--text-muted-color);
  font-size: 0.9em;
  font-weight: 500; /* Normal weight */
  white-space: nowrap; /* Prevent price from wrapping */
}
.item-info-qty {
  font-size: 0.8em;
  color: var(--text-muted-color);
  opacity: 0.8;
}

.item-remove-button {
  background: none;
  border: none;
  color: var(--text-muted-color);
  cursor: pointer;
  padding: 8px; /* Increased padding for better touch target size */
  opacity: 0.7;
  margin-left: 5px; /* Space from details */
}
.item-remove-button:hover {
  color: var(--glow-accent);
  opacity: 1;
}

.mini-cart-footer {
  padding: 15px;
  border-top: 1px solid rgba(var(--text-muted-color), 0.2);
  background-color: rgba(var(--card-bg-color-opaque), 0.7);
}
.mini-cart-total {
  display: flex;
  justify-content: space-between;
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 15px;
}
.mini-cart-total .total-amount {
  color: var(--glow-accent);
}
.view-cart-button {
  /* Uses .styled-button from main.css */
  width: 100%;
  text-align: center;
  font-size: 0.9em;
  padding: 10px 15px;
}
</style>
