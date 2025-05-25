<template>
  <div class="cod-effects">
    <div
      v-for="patch in hazePatches"
      :key="'cod-haze-' + patch.id"
      class="cod-haze-patch"
      :style="patch.style"
    ></div>
    <div class="cod-scanline-glitch"></div>

    <!-- Nostalgic Elements -->
    <div v-if="showPredatorOverlay" class="cod-predator-missile-overlay">
      <div class="cod-predator-targeting-box"></div>
      <div class="cod-predator-timer"></div>
    </div>
    <div
      v-for="tag in dogTags"
      :key="'cod-dogtag-' + tag.id"
      class="cod-dog-tag"
      :style="tag.style"
    >
      <!-- Simple SVG for dog tag shape -->
      <svg viewBox="0 0 20 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 0C4.477 0 0 2.239 0 5V25C0 27.761 4.477 30 10 30C15.523 30 20 27.761 20 25V5C20 2.239 15.523 0 10 0ZM10 2C14.418 2 18 3.791 18 5V25C18 26.209 14.418 28 10 28C5.582 28 2 26.209 2 25V5C2 3.791 5.582 2 10 2Z"
        />
        <circle cx="5" cy="5" r="1.5" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// useUiSettingsStore and watch removed

// uiSettingsStore removed
const hazePatches = ref([])
const showPredatorOverlay = ref(false)
let predatorTimeout = null
const dogTags = ref([])

const createCODEffects = () => {
  hazePatches.value = []
  dogTags.value = []

  // Removed check for uiSettingsStore.animationsEnabled
  // if (predatorTimeout) clearTimeout(predatorTimeout) // This logic is now only in the watcher/onBeforeUnmount
  // showPredatorOverlay.value = false 

  const numHaze = 2
  for (let i = 0; i < numHaze; i++) {
    hazePatches.value.push({
      id: i,
      style: {
        width: `${Math.random() * 15 + 20}vw`,
        height: `${Math.random() * 15 + 20}vh`,
        '--x-start': `${Math.random() * 80}vw`,
        '--y-start': `${Math.random() * 80}vh`,
        '--x-end': `${Math.random() * 80}vw`,
        '--y-end': `${Math.random() * 80}vh`,
        animationDelay: `${Math.random() * 6}s, 0s`,
      },
    })
  }

  const numDogTags = 5
  for (let i = 0; i < numDogTags; i++) {
    dogTags.value.push({
      id: i,
      style: {
        left: `${Math.random() * 95}vw`, // Start across the width
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${Math.random() * 5 + 7}s`, // Fall duration
      },
    })
  }
}

const triggerPredatorOverlay = () => {
  if (predatorTimeout) clearTimeout(predatorTimeout)
  // Removed check for uiSettingsStore.animationsEnabled
  // showPredatorOverlay.value = false

  showPredatorOverlay.value = true
  setTimeout(() => {
    showPredatorOverlay.value = false
  }, 1000) // Duration of the overlay effect (very short)

  predatorTimeout = setTimeout(triggerPredatorOverlay, Math.random() * 30000 + 20000) // 20-50 seconds
}

onMounted(() => {
  // Effects created and triggered unconditionally
  createCODEffects()
  triggerPredatorOverlay()
})

// Watch for uiSettingsStore.animationsEnabled removed

onBeforeUnmount(() => {
  if (predatorTimeout) clearTimeout(predatorTimeout)
})
</script>

<style scoped>
.cod-effects {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: hidden;
}

.cod-haze-patch {
  position: absolute;
  background-color: rgba(var(--glow-secondary-rgb), 0.03);
  border-radius: 50%;
  opacity: 0;
  filter: blur(20px);
  animation-name: codHazeDrift, codHazeFadeIn;
  animation-duration: 50s, 2s;
  animation-timing-function: ease-in-out, forwards;
  animation-iteration-count: infinite, 1;
  animation-direction: alternate, normal;
  animation-fill-mode: none, forwards;
  animation-play-state: running;
}
/* .animations-disabled .cod-haze-patch removed */
@keyframes codHazeDrift {
  0% {
    transform: translate(var(--x-start), var(--y-start)) scale(0.8);
  }
  100% {
    transform: translate(var(--x-end), var(--y-end)) scale(1.2);
  }
}
@keyframes codHazeFadeIn {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

.cod-scanline-glitch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
.cod-scanline-glitch::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200%;
  background: linear-gradient(
    transparent 50%,
    rgba(var(--glow-secondary-rgb), 0.02) 50.5%,
    rgba(var(--glow-secondary-rgb), 0.02) 51%,
    transparent 51.5%
  );
  background-size: 100% 8px;
  opacity: 0.3;
  animation: codScrollScanlines 10s linear infinite;
  animation-play-state: running;
}
/* .animations-disabled .cod-scanline-glitch::before removed */
@keyframes codScrollScanlines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-100%);
  }
}

/* Nostalgic Elements */
.cod-predator-missile-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(var(--glow-primary-rgb), 0.02); /* Very faint color wash */
  opacity: 0;
  animation: codPredatorFade 1s ease-in-out forwards;
  animation-play-state: running;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  overflow: hidden; /* Important */
}
.cod-predator-missile-overlay::before,
.cod-predator-missile-overlay::after {
  /* Scanlines for the overlay */
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(var(--glow-secondary-rgb), 0.05) 50%, transparent 50%);
  background-size: 100% 4px;
  opacity: 0.2;
}
.cod-predator-missile-overlay::after {
  /* Static/noise */
  background: repeating-linear-gradient(
    0deg,
    rgba(var(--glow-accent-rgb), 0.01),
    rgba(var(--glow-accent-rgb), 0.01) 1px,
    transparent 1px,
    transparent 2px
  );
  opacity: 0.05;
}

.cod-predator-targeting-box {
  width: 150px;
  height: 100px;
  border: 1px solid rgba(var(--glow-accent-rgb), 0.5);
  position: relative;
  opacity: 0.7;
}
.cod-predator-targeting-box::before,
.cod-predator-targeting-box::after {
  /* Crosshairs */
  content: '';
  position: absolute;
  background-color: rgba(var(--glow-accent-rgb), 0.5);
}
.cod-predator-targeting-box::before {
  /* Horizontal */
  top: 50%;
  left: -20px;
  width: calc(100% + 40px);
  height: 1px;
  transform: translateY(-50%);
}
.cod-predator-targeting-box::after {
  /* Vertical */
  left: 50%;
  top: -20px;
  height: calc(100% + 40px);
  width: 1px;
  transform: translateX(-50%);
}

.cod-predator-timer {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-family: 'Orbitron', monospace;
  font-size: 24px;
  color: rgba(var(--glow-accent-rgb), 0.7);
  opacity: 0;
  animation: codPredatorTimerCount 1s linear forwards;
  animation-play-state: running;
}
/* .animations-disabled .cod-predator-timer removed */
@keyframes codPredatorTimerCount {
  0% {
    content: '0:05';
    opacity: 0.7;
  }
  20% {
    content: '0:04';
  }
  40% {
    content: '0:03';
  }
  60% {
    content: '0:02';
  }
  80% {
    content: '0:01';
  }
  100% {
    content: '0:00';
    opacity: 0.7;
  }
}

@keyframes codPredatorFade {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0.3;
  } /* Quick flash, max opacity low */
  75% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
  }
}

.cod-dog-tag {
  position: absolute;
  top: -30px; /* Start above screen */
  width: 15px; /* Small */
  height: 22.5px;
  color: rgba(var(--text-muted-color), 0.2); /* Faint metal color */
  opacity: 0;
  animation-name: codDogTagFall;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-play-state: running;
  z-index: 1;
}
/* .animations-disabled .cod-dog-tag removed */
.cod-dog-tag svg {
  width: 100%;
  height: 100%;
}
@keyframes codDogTagFall {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  20% {
    opacity: 0.4;
  }
  100% {
    opacity: 0;
    transform: translateY(110vh) rotate(720deg);
  } /* Fall off screen and rotate */
}
</style>
