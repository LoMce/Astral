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

  <div v-if="flyingItem.visible" class="flying-item" :style="flyingItem.style">
    <img :src="flyingItem.logo" alt="flying item" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import ImmersiveBackground from './components/BackgroundEffects/ImmersiveBackground.vue'
import MinecraftEffects from './components/BackgroundEffects/MinecraftEffects.vue'
import FortniteEffects from './components/BackgroundEffects/FortniteEffects.vue'
import CODEffects from './components/BackgroundEffects/CODEffects.vue'
import CartIcon from './components/CartIcon.vue'
import MiniCart from './components/MiniCart.vue'

const activeThemeGame = ref(localStorage.getItem('activeThemeGame') || '')
const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const isMiniCartOpen = ref(false)
const cartIconRef = ref(null)

const gamesListForTheme = [{ value: 'minecraft' }, { value: 'fortnite' }, { value: 'cod' }]

const flyingItem = ref({
  visible: false,
  style: {},
  logo: '',
})

const setActiveTheme = (gameValue) => {
  const newTheme = gameValue || ''
  if (activeThemeGame.value !== newTheme) {
    activeThemeGame.value = newTheme
    if (newTheme) {
      localStorage.setItem('activeThemeGame', newTheme)
    } else {
      localStorage.removeItem('activeThemeGame')
    }
  }
}

const handleLogoClick = () => {
  if (route.path === '/') {
    setActiveTheme('')
  }
}

watch(
  activeThemeGame,
  (newGameValue, oldGameValue) => {
    const oldVal = oldGameValue || ''
    const newVal = newGameValue || ''

    document.body.classList.remove(`theme-${oldVal}`)
    gamesListForTheme.forEach((game) => {
      if (game.value !== newVal) {
        // Ensure only the current new theme is not removed
        document.body.classList.remove(`theme-${game.value}`)
      }
    })

    if (newVal) {
      document.body.classList.add(`theme-${newVal}`)
      document.body.classList.add('theme-active')
    } else {
      // Ensure all theme classes are removed if newVal is empty
      gamesListForTheme.forEach((game) => {
        document.body.classList.remove(`theme-${game.value}`)
      })
      document.body.classList.remove('theme-active')
    }
  },
  { immediate: true },
)

watch(route, (to) => {
  closeMiniCart()
  // HomePage's onMounted will now handle theme neutralization when navigating to '/'
  // So, we don't need to explicitly set it to neutral here anymore for that case.
  // However, if navigating AWAY from home, and a theme was set, it should persist
  // if localStorage has it, unless the new page sets its own theme.
  // This logic remains tricky if pages don't manage their own themes.
  // For now, keeping it simple: child pages are responsible for emitting their desired theme.
  // If a page doesn't emit, the theme might revert to localStorage or stay as is.
  if (
    to.path !== '/' &&
    localStorage.getItem('activeThemeGame') &&
    activeThemeGame.value !== localStorage.getItem('activeThemeGame')
  ) {
    // This could be a scenario where we navigate from a themed page to another non-home page
    // and want to ensure the persisted theme is re-applied if it got cleared somehow.
    // setActiveTheme(localStorage.getItem('activeThemeGame'));
  }
})

onMounted(() => {
  // When App.vue mounts, establish the initial theme state.
  // If the current path is home, HomePage.vue's onMounted will emit to neutralize.
  // If not on home, and a theme is in localStorage, apply it.
  // If no theme in localStorage and not on home, it defaults to neutral ('').
  const storedTheme = localStorage.getItem('activeThemeGame')
  if (route.path !== '/' && storedTheme) {
    setActiveTheme(storedTheme)
  } else if (route.path === '/') {
    // Let HomePage handle neutralization via its onMounted emit
    // but ensure App's state is consistent if it wasn't already neutral
    if (activeThemeGame.value !== '') {
      // setActiveTheme(''); // This will be done by HomePage emit
    }
  } else {
    // Not on home, no stored theme
    setActiveTheme('')
  }
})

const toggleMiniCart = () => {
  isMiniCartOpen.value = !isMiniCartOpen.value
}
const closeMiniCart = () => {
  isMiniCartOpen.value = false
}

const startFlyToCartAnimation = (startElement, itemLogo) => {
  if (!startElement || !cartIconRef.value) return

  const startRect = startElement.getBoundingClientRect()
  const endRect = cartIconRef.value.getBoundingClientRect()

  flyingItem.value.logo = itemLogo
  flyingItem.value.style = {
    position: 'fixed',
    left: `${startRect.left + startRect.width / 2 - 15}px`,
    top: `${startRect.top + startRect.height / 2 - 15}px`,
    width: '30px',
    height: '30px',
    opacity: 1,
    transform: 'scale(1)',
    transition:
      'left 0.5s cubic-bezier(0.29, 0.03, 0.43, 1.43), top 0.5s ease-out, opacity 0.4s 0.2s ease-out, transform 0.5s ease-out',
    zIndex: 2000,
  }
  flyingItem.value.visible = true

  requestAnimationFrame(() => {
    flyingItem.value.style.left = `${endRect.left + endRect.width / 2 - 15}px`
    flyingItem.value.style.top = `${endRect.top + endRect.height / 2 - 15}px`
    flyingItem.value.style.opacity = 0
    flyingItem.value.style.transform = 'scale(0.3)'
  })

  setTimeout(() => {
    flyingItem.value.visible = false
  }, 600)
}

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
  transition: color var(--transition-speed) ease;
  text-align: center;
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
  padding: 0;
  margin: 0;
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
</style>
