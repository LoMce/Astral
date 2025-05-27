<template>
  <div id="immersive-background-container">
    <ImmersiveBackground :selected-game="activeThemeGame" />
    <MinecraftEffects
      v-if="activeThemeGame === 'minecraft'"
      class="game-specific-effects-container active-effect"
    />
    <FortniteEffects
      v-if="activeThemeGame === 'fortnite'"
      class="game-specific-effects-container active-effect"
    />
    <CODEffects
      v-if="activeThemeGame === 'cod'"
      class="game-specific-effects-container active-effect"
    />
  </div>
  <div id="foreground-event-layer"></div>

  <header class="app-header">
    <nav>
      <!-- Empty div for spacing to help center the logo -->
      <div class="nav-spacer-left"></div>

      <router-link to="/" class="nav-logo-link" @click="handleLogoClick">
        <img src="/favicon.ico" alt="Site Logo" class="nav-logo-img" />
        Thematic Night Access
      </router-link>

      <div class="nav-links nav-spacer-right">
        <button
          @click="toggleMiniCart"
          class="cart-button-wrapper"
          aria-label="Open cart preview"
          ref="cartIconRef"
        >
          <CartIcon :animateTrigger="cartStore.triggerCartAnimation" />
        </button>
      </div>
    </nav>
  </header>

  <router-view v-slot="{ Component, route: currentRoute }">
    <transition name="fade" mode="out-in">
      <component
        :is="Component"
        :key="currentRoute.path"
        :active-page-theme-prop="activeThemeGame"
        @update-active-theme-game="setActiveTheme"
      />
      <!-- Prop name changed for clarity (comment moved to a valid location) -->
    </transition>
  </router-view>

  <MiniCart :is-open="isMiniCartOpen" @close="closeMiniCart" :active-theme="activeThemeGame" />

  <div
    v-for="item in flyingItems"
    :key="item.id"
    v-show="item.visible"
    class="flying-item"
    :style="item.style"
  >
    <!-- TODO: Image Optimization: If item.logo refers to raster images, consider WebP format with <picture> element fallback. If SVGs, ensure they are optimized. -->
    <img :src="item.logo" alt="flying item" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, provide, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import ImmersiveBackground from './components/BackgroundEffects/ImmersiveBackground.vue'
import CartIcon from './components/CartIcon.vue'

// --- Constants ---
const LOCAL_STORAGE_THEME_KEY = 'activeThemeGame';
const FLY_TO_CART_ANIMATION_DURATION = 600; // ms
const FLYING_ITEM_SIZE_PX = 30; // width and height
const FLYING_ITEM_SCALE_END = 0.3;
const FLYING_ITEM_OPACITY_END = 0;
const FLYING_ITEM_Z_INDEX = 2000;

// --- Lazy Loaded Components ---
const MinecraftEffects = defineAsyncComponent(() => 
  import('./components/BackgroundEffects/MinecraftEffects.vue')
);
const FortniteEffects = defineAsyncComponent(() =>
  import('./components/BackgroundEffects/FortniteEffects.vue')
);
const CODEffects = defineAsyncComponent(() =>
  import('./components/BackgroundEffects/CODEffects.vue')
);
const MiniCart = defineAsyncComponent(() =>
  import('./components/MiniCart.vue')
);

// --- Reactive State ---
/** @type {import('vue').Ref<String>} The current active game theme value (e.g., 'minecraft'). */
const activeThemeGame = ref(localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || '')
const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
/** @type {import('vue').Ref<Boolean>} Controls the visibility of the MiniCart. */
const isMiniCartOpen = ref(false)
/** @type {import('vue').Ref<HTMLElement|null>} Template ref for the cart icon button. */
const cartIconRef = ref(null)

/** 
 * List of game themes used for managing body classes.
 * @type {Array<{value: String}>}
 */
const gamesListForTheme = [{ value: 'minecraft' }, { value: 'fortnite' }, { value: 'cod' }]

/**
 * Reactive state for the "fly to cart" animation items.
 * @type {import('vue').Ref<Array<{id: Number | String, visible: Boolean, style: Object, logo: String}>>}
 */
const flyingItems = ref([])

// --- Functions ---
/**
 * Sets the active game theme, updates localStorage, and applies body classes.
 * @param {String} gameValue - The value of the game theme to activate (e.g., 'minecraft'). Empty string to clear.
 */
const setActiveTheme = (gameValue) => {
  const newTheme = gameValue || ''
  if (activeThemeGame.value !== newTheme) {
    activeThemeGame.value = newTheme
    if (newTheme) {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_THEME_KEY)
    }
  }
}

/**
 * Handles click on the navigation logo. Clears the active theme if on the home page.
 */
const handleLogoClick = () => {
  if (route.path === '/') {
    setActiveTheme('')
  }
}

/**
 * Toggles the visibility of the MiniCart.
 */
const toggleMiniCart = () => {
  isMiniCartOpen.value = !isMiniCartOpen.value
}

/**
 * Closes the MiniCart.
 */
const closeMiniCart = () => {
  isMiniCartOpen.value = false
}

/**
 * Initiates and manages the "fly to cart" animation for multiple items.
 * Provided to child components for triggering the animation.
 * @param {HTMLElement} startElement - The DOM element from which the animation should start.
 * @param {String} itemLogo - The source URL for the item's logo to be animated.
 */
const startFlyToCartAnimation = (startElement, itemLogo) => {
  if (!startElement || !cartIconRef.value) return;

  const itemId = Date.now() + Math.random(); // Simple unique ID

  const startRect = startElement.getBoundingClientRect();
  const endRect = cartIconRef.value.getBoundingClientRect();
  const itemSizeHalf = FLYING_ITEM_SIZE_PX / 2;

  const newItem = {
    id: itemId,
    logo: itemLogo,
    visible: true,
    style: {
      position: 'fixed',
      left: `${startRect.left + startRect.width / 2 - itemSizeHalf}px`,
      top: `${startRect.top + startRect.height / 2 - itemSizeHalf}px`,
      width: `${FLYING_ITEM_SIZE_PX}px`,
      height: `${FLYING_ITEM_SIZE_PX}px`,
      opacity: 1,
      transform: 'scale(1)',
      transition: 'left 0.5s cubic-bezier(0.29, 0.03, 0.43, 1.43), top 0.5s ease-out, opacity 0.4s 0.2s ease-out, transform 0.5s ease-out',
      zIndex: FLYING_ITEM_Z_INDEX,
    }
  };

  flyingItems.value.push(newItem);

  // Update style for animation destination shortly after adding
  requestAnimationFrame(() => {
    const itemToAnimate = flyingItems.value.find(i => i.id === itemId);
    if (itemToAnimate) {
      // Trigger reflow/repaint before applying transition styles if needed, though Vue's nextTick or direct style assignment usually handles this.
      // Forcing reflow can be done by accessing offsetHeight, but often not necessary.
      itemToAnimate.style.left = `${endRect.left + endRect.width / 2 - itemSizeHalf}px`;
      itemToAnimate.style.top = `${endRect.top + endRect.height / 2 - itemSizeHalf}px`;
      itemToAnimate.style.opacity = FLYING_ITEM_OPACITY_END;
      itemToAnimate.style.transform = `scale(${FLYING_ITEM_SCALE_END})`;
    }
  });

  setTimeout(() => {
    flyingItems.value = flyingItems.value.filter(i => i.id !== itemId);
  }, FLY_TO_CART_ANIMATION_DURATION);
};

// --- Watchers ---
/**
 * Watches for changes in `activeThemeGame` to update document body classes
 * for global theme styling.
 */
watch(
  activeThemeGame,
  (newGameValue, oldGameValue) => {
    const oldVal = oldGameValue || ''
    const newVal = newGameValue || ''

    document.body.classList.remove(`theme-${oldVal}`)
    gamesListForTheme.forEach((game) => {
      if (game.value !== newVal) {
        document.body.classList.remove(`theme-${game.value}`)
      }
    })

    if (newVal) {
      document.body.classList.add(`theme-${newVal}`)
      document.body.classList.add('theme-active')
    } else {
      gamesListForTheme.forEach((game) => {
        document.body.classList.remove(`theme-${game.value}`)
      })
      document.body.classList.remove('theme-active')
    }
  },
  { immediate: true },
)

/**
 * Watches for route changes to close the MiniCart.
 * Also contains logic to potentially re-apply persisted theme if navigating
 * between non-home pages (currently commented out).
 */
watch(route, (to) => {
  closeMiniCart()
  if (
    to.path !== '/' &&
    localStorage.getItem(LOCAL_STORAGE_THEME_KEY) &&
    activeThemeGame.value !== localStorage.getItem(LOCAL_STORAGE_THEME_KEY)
  ) {
    // setActiveTheme(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)); // Potential re-application
  }
})

/**
 * Watches for the MiniCart closing to return focus to the cart icon button.
 */
watch(isMiniCartOpen, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    if (cartIconRef.value) {
      cartIconRef.value.focus()
    }
  }
})

// --- Lifecycle Hooks ---
onMounted(() => {
  const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY)
  if (route.path !== '/' && storedTheme) {
    setActiveTheme(storedTheme)
  } else if (route.path === '/') {
    if (activeThemeGame.value !== '') {
      // setActiveTheme(''); // Handled by HomePage.vue's onMounted emit
    }
  } else {
    setActiveTheme('')
  }
})

// --- Provide/Inject ---
/**
 * Provides the `startFlyToCartAnimation` function to descendant components.
 * @see {@link startFlyToCartAnimation}
 */
provide('flyToCart', startFlyToCartAnimation)
</script>

<style>
#immersive-background-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}
.game-specific-effects-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-speed) ease-in-out;
  z-index: 1;
}
.game-specific-effects-container.active-effect {
  opacity: 1;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 10px 20px;
  background-color: rgba(var(--card-bg-color-opaque), 0.5);
  backdrop-filter: blur(5px);
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(var(--glow-primary-rgb), 0.1);
  transition:
    background-color var(--transition-speed) ease,
    border-color var(--transition-speed) ease;
}
.app-header nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between; /* This will push logo to center if spacers have equal flex basis */
  align-items: center;
}
/* Spacers for centering the logo link */
.nav-spacer-left,
.nav-spacer-right {
  flex: 1; /* Allows them to take up equal space */
  display: flex;
}
.nav-spacer-left {
  justify-content: flex-start;
}
.nav-spacer-right {
  justify-content: flex-end; /* Aligns cart icon to the far right */
}

.nav-logo-link {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 1.1em;
  color: var(--text-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: color var(--transition-speed) ease, text-shadow var(--transition-speed) ease;
  text-align: center;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.4); /* Added text shadow */
}
.nav-logo-link:hover {
  color: var(--glow-primary);
}
.nav-logo-img {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  filter: drop-shadow(0 0 3px rgba(var(--glow-primary-rgb), 0.3));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-container {
  padding-top: 70px;
}

.cart-button-wrapper {
  background: none;
  border: none;
  padding: 8px; /* Increased padding for better touch target size */
  margin: 0; /* Or adjust margin as needed if padding affects layout */
  cursor: pointer;
  color: var(--text-muted-color);
  transition: color var(--transition-speed) ease;
  display: inline-flex;
  align-items: center;
}
.cart-button-wrapper:hover,
.cart-button-wrapper.active {
  color: var(--glow-accent);
  text-shadow: 0 0 5px rgba(var(--glow-accent-rgb), 0.5);
}

.flying-item {
  position: fixed;
  background-color: rgba(var(--glow-accent-rgb), 0.3);
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(var(--glow-accent-rgb), 0.5);
  padding: 2px;
}
.flying-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

@media (max-width: 420px) {
  .nav-logo-link {
    font-size: 0.9em; /* Reduced from 1.1em for very narrow screens */
  }
  /* Optional: If cart icon needs adjustment, uncomment and modify below */
  /*
  .cart-button-wrapper {
    padding: 0 5px; 
  }
  */
}
</style>
