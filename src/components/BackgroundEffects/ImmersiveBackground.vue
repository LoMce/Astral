<template>
  <div class="immersive-background-effects" :class="{ 'animations-disabled': !uiSettingsStore.animationsEnabled }">
    <div
      id="galaxy-layer"
      :style="{
        backgroundImage: `url('${galaxySvgUrl}')`,
        opacity: 'var(--galaxy-opacity, 0.15)',
      }"
    ></div>
    <div v-for="star in stars" :key="'star-' + star.id" class="star" :style="star.style"></div>
    <div
      v-for="streak in rainStreaks"
      :key="'rain-' + streak.id"
      class="rain-streak"
      :style="streak.style"
    ></div>
    <div
      v-for="particle in orbitalParticles"
      :key="'orbital-' + particle.id"
      class="orbital-particle"
      :class="particle.particleClass"
      :style="particle.style"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useUiSettingsStore } from '@/stores/uiSettings'

const uiSettingsStore = useUiSettingsStore()

const props = defineProps({
  selectedGame: {
    type: String,
    default: '',
  },
})

// Import SVG strings
import { defaultGalaxySvgString } from '@/assets/svgs/defaultGalaxy.js'
import { minecraftGalaxySvgString } from '@/assets/svgs/minecraftGalaxy.js'
import { fortniteGalaxySvgString } from '@/assets/svgs/fortniteGalaxy.js'
import { codGalaxySvgString } from '@/assets/svgs/codGalaxy.js'

const stars = ref([])
const rainStreaks = ref([])
const orbitalParticles = ref([])

// Note: %23 is the URL encoding for #, used for hex colors in fill attributes within the SVG strings.

const galaxySvgUrl = computed(() => {
  switch (props.selectedGame) {
    case 'minecraft':
      return minecraftGalaxySvgString
    case 'fortnite':
      return fortniteGalaxySvgString
    case 'cod':
      return codGalaxySvgString
    default:
      return defaultGalaxySvgString
  }
})

const createStars = () => {
  stars.value = []
  if (!uiSettingsStore.animationsEnabled) return;
  const numStars = 30 // Reduced from 60
  for (let i = 0; i < numStars; i++) {
    const size = Math.random() * 1.2 + 0.15
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    const parallaxFactor = 0.15 + (size / 1.35) * 0.5
    const driftDistanceX = (Math.random() - 0.5) * 20 * parallaxFactor
    const driftDistanceY = (Math.random() - 0.5) * 20 * parallaxFactor
    stars.value.push({
      id: i,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${startX}vw`,
        top: `${startY}vh`,
        '--start-x': `${startX}vw`,
        '--start-y': `${startY}vh`,
        '--end-x': `${startX + driftDistanceX}vw`,
        '--end-y': `${startY + driftDistanceY}vh`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${Math.random() * 35 + 70}s, ${4 + Math.random() * 2.5}s`,
      },
    })
  }
}

const createRainStreaks = () => {
  rainStreaks.value = []
  if (!uiSettingsStore.animationsEnabled) return;
  const numRainStreaks = 15 // Reduced from 30
  for (let i = 0; i < numRainStreaks; i++) {
    rainStreaks.value.push({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        height: `${Math.random() * 30 + 8}px`,
        animationDuration: `${Math.random() * 0.6 + 0.7}s`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: `${Math.random() * 0.08 + 0.01}`,
      },
    })
  }
}

const createOrbitalParticles = () => {
  orbitalParticles.value = []
  if (!uiSettingsStore.animationsEnabled) return;
  const numOrbitals = 1 // Was 1, effectively showing only 'primary'. Set to 3 to see all.
  if (numOrbitals > 0) {
    const orbitalColorClasses = ['primary', 'accent', 'secondary']
    for (let i = 0; i < numOrbitals; i++) {
      const size = Math.random() * 7 + 3 // Range: 3px to 10px
      orbitalParticles.value.push({
        id: i,
        particleClass: orbitalColorClasses[i % orbitalColorClasses.length],
        style: {
          width: `${size}px`,
          height: `${size}px`,
          // Ensure particles are spread out across the viewport, not just center
          '--x-start': `${Math.random() * 60 + 20}vw`,
          '--y-start': `${Math.random() * 60 + 20}vh`,
          '--x-mid1': `${Math.random() * 60 + 20}vw`,
          '--y-mid1': `${Math.random() * 60 + 20}vh`,
          '--x-mid2': `${Math.random() * 60 + 20}vw`,
          '--y-mid2': `${Math.random() * 60 + 20}vh`,
          '--x-mid3': `${Math.random() * 60 + 20}vw`,
          '--y-mid3': `${Math.random() * 60 + 20}vh`,
          animationDelay: `${Math.random() * 7}s, 2.5s`,
          animationDuration: `${Math.random() * 20 + 25}s, 6s`,
        },
      })
    }
  }
}

onMounted(() => {
  if (uiSettingsStore.animationsEnabled) {
    createStars()
    createRainStreaks()
    createOrbitalParticles()
  }
})

watch(() => uiSettingsStore.animationsEnabled, (newValue) => {
  if (newValue) {
    // Re-create effects when animations are enabled
    createStars()
    createRainStreaks()
    createOrbitalParticles()
  } else {
    // Clear effects when animations are disabled
    stars.value = []
    rainStreaks.value = []
    orbitalParticles.value = []
  }
})

</script>

<style scoped>
/* Styles for ImmersiveBackground elements */
.immersive-background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

#galaxy-layer {
  position: absolute;
  top: -25%;
  left: -25%;
  width: 150%;
  height: 150%;
  background-size: cover;
  background-position: center center;
  animation-name: slowRotateGalaxy;
  animation-duration: 300s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: running; /* Default state */
  z-index: -1;
  transition:
    opacity var(--transition-speed) ease,
    background-image var(--transition-speed) ease; /* Smooth transition for new SVG */
}
.animations-disabled #galaxy-layer {
  animation-play-state: paused !important;
}
@keyframes slowRotateGalaxy {
  0% {
    transform: rotate(0deg) scale(1.15);
  }
  100% {
    transform: rotate(360deg) scale(1.15);
  }
}

.star {
  position: absolute;
  background-color: var(--star-color);
  border-radius: 50%;
  animation-name: twinkle-smooth, parallax-drift;
  animation-timing-function: ease-in-out, linear;
  animation-iteration-count: infinite, infinite;
  animation-direction: alternate, normal;
  animation-play-state: running; /* Default state */
  transition: background-color var(--transition-speed) ease;
}
.animations-disabled .star {
  animation-play-state: paused !important;
  /* Optionally hide them completely if paused state is not visually appealing */
  /* opacity: 0 !important; */
}
@keyframes twinkle-smooth {
  0% {
    opacity: var(--star-opacity-min);
    transform: scale(0.5) translate(var(--start-x), var(--start-y));
  }
  50% {
    opacity: var(--star-opacity-max);
    transform: scale(1) translate(var(--start-x), var(--start-y));
  }
  100% {
    opacity: var(--star-opacity-min);
    transform: scale(0.5) translate(var(--start-x), var(--start-y));
  }
}
@keyframes parallax-drift {
  0% {
    /* transform: translate(var(--start-x), var(--start-y)); Combined into twinkle */
  }
  100% {
    transform: translate(var(--end-x), var(--end-y)) scale(var(--current-scale, 1));
  }
}

.rain-streak {
  position: absolute;
  bottom: 100%;
  width: 1px;
  background: linear-gradient(
    to bottom,
    rgba(var(--rain-color-rgb), 0),
    rgba(var(--rain-color-rgb), var(--rain-opacity))
  );
  animation-name: fall-rain;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: running; /* Default state */
  transition: background var(--transition-speed) ease;
  border-radius: var(--rain-border-radius, 0);
}
.animations-disabled .rain-streak {
  animation-play-state: paused !important;
  /* opacity: 0 !important; */
}
@keyframes fall-rain {
  to {
    transform: translateY(120vh) scaleY(1.5);
    bottom: -50px;
    opacity: 0;
  }
}

.orbital-particle {
  position: fixed;
  border-radius: 50%;
  background-color: var(--glow-primary);
  box-shadow:
    0 0 8px var(--glow-primary),
    0 0 15px var(--glow-primary);
  opacity: 0;
  animation-name: drift-bokeh, fadeInOrbitals;
  animation-timing-function: linear, ease-out;
  animation-iteration-count: infinite, 1;
  animation-fill-mode: forwards;
  animation-play-state: running; /* Default state */
  z-index: 1;
  filter: blur(2.5px);
  transition:
    background-color var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}
.animations-disabled .orbital-particle {
  animation-play-state: paused !important;
  /* opacity: 0 !important; */
}
.orbital-particle.primary {
  background-color: var(--glow-primary);
  box-shadow:
    0 0 8px var(--glow-primary),
    0 0 15px var(--glow-primary);
}
.orbital-particle.accent {
  background-color: var(--glow-accent);
  box-shadow:
    0 0 8px var(--glow-accent),
    0 0 15px var(--glow-accent);
}
.orbital-particle.secondary {
  background-color: var(--glow-secondary);
  box-shadow:
    0 0 7px var(--glow-secondary),
    0 0 12px var(--glow-secondary);
}

@keyframes drift-bokeh {
  0% {
    transform: translate(var(--x-start), var(--y-start)) scale(0.3);
    opacity: var(--orbital-opacity-min);
  }
  25% {
    transform: translate(var(--x-mid1), var(--y-mid1)) scale(0.6);
    opacity: var(--orbital-opacity-mid);
  }
  50% {
    transform: translate(var(--x-mid2), var(--y-mid2)) scale(0.25);
    opacity: var(--orbital-opacity-max);
  }
  75% {
    transform: translate(var(--x-mid3), var(--y-mid3)) scale(0.7);
    opacity: var(--orbital-opacity-mid);
  }
  100% {
    transform: translate(var(--x-start), var(--y-start)) scale(0.3);
    opacity: var(--orbital-opacity-min);
  }
}
@keyframes fadeInOrbitals {
  0% {
    opacity: 0;
  }
  100% {
    opacity: var(--orbital-opacity-max);
  }
}
</style>
