<template>
  <div class="fortnite-effects">
    <div
      v-for="wisp in wisps"
      :key="'fn-wisp-' + wisp.id"
      class="fn-rift-energy-wisps"
      :style="wisp.style"
    ></div>
    <div
      v-for="orb in energyOrbs"
      :key="'fn-orb-' + orb.id"
      class="fn-energy-orb"
      :style="orb.style"
    ></div>

    <div
      v-for="comet in comets"
      :key="'fn-comet-' + comet.id"
      class="fn-comet"
      :style="comet.style"
    >
      <div class="fn-comet-tail"></div>
    </div>
    <div
      v-for="butterfly in zeroPointButterflies"
      :key="'fn-butterfly-' + butterfly.id"
      class="fn-zero-point-butterfly"
      :style="butterfly.style"
    >
      <div class="fn-butterfly-wing fn-butterfly-wing-left"></div>
      <div class="fn-butterfly-wing fn-butterfly-wing-right"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// useUiSettingsStore and watch removed

// uiSettingsStore removed
const wisps = ref([])
const energyOrbs = ref([])
const comets = ref([])
const zeroPointButterflies = ref([])

const createFortniteEffects = () => {
  wisps.value = []
  energyOrbs.value = []
  comets.value = []
  zeroPointButterflies.value = []

  // Removed check for uiSettingsStore.animationsEnabled

  const numWisps = 6
  for (let i = 0; i < numWisps; i++) {
    wisps.value.push({
      id: i,
      style: {
        '--x-start': `${Math.random() * 100}vw`,
        '--y-start': `${Math.random() * 100}vh`,
        '--x-mid': `${Math.random() * 100}vw`,
        '--y-mid': `${Math.random() * 100}vh`,
        '--x-end': `${Math.random() * 100}vw`,
        '--y-end': `${Math.random() * 100}vh`,
        animationDelay: `${Math.random() * 7}s, 0s`,
        animationDuration: `${Math.random() * 5 + 6}s, 2s`,
      },
    })
  }

  const numOrbs = 8
  const orbSizeMin = 4,
    orbSizeMax = 10
  const insetMarginVw = 15
  const insetMarginVh = 15

  for (let i = 0; i < numOrbs; i++) {
    const size = Math.random() * (orbSizeMax - orbSizeMin) + orbSizeMin
    const effectiveMaxWidth = 100 - 2 * insetMarginVw
    const effectiveMaxHeight = 100 - 2 * insetMarginVh
    const startX = Math.random() * effectiveMaxWidth + insetMarginVw
    const startY = Math.random() * effectiveMaxHeight + insetMarginVh
    const driftRangeX = 60
    const driftRangeY = 60
    const deltaX = (Math.random() - 0.5) * 2 * driftRangeX
    const deltaY = (Math.random() - 0.5) * 2 * driftRangeY

    energyOrbs.value.push({
      id: i,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${startX}vw`,
        top: `${startY}vh`,
        '--dx-end': `${deltaX}vw`,
        '--dy-end': `${deltaY}vh`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 10 + 15}s, ${Math.random() * 2 + 3}s`,
      },
    })
  }

  const numComets = 1
  for (let i = 0; i < numComets; i++) {
    const startX = -10
    const startY = Math.random() * 40 + 10
    const endX = 110
    const endY = startY + (Math.random() * 40 - 20)
    comets.value.push({
      id: i,
      style: {
        '--x-start': `${startX}vw`,
        '--y-start': `${startY}vh`,
        '--x-end': `${endX}vw`,
        '--y-end': `${endY}vh`,
        animationDelay: `${Math.random() * 10 + 5}s`,
        animationDuration: `${Math.random() * 5 + 8}s`,
      },
    })
  }

  const numButterflies = 3
  const butterflyInsetMargin = 15

  for (let i = 0; i < numButterflies; i++) {
    const startX = Math.random() * (100 - 2 * butterflyInsetMargin) + butterflyInsetMargin
    const startY = Math.random() * (100 - 2 * butterflyInsetMargin) + butterflyInsetMargin

    const endX = Math.random() * (100 - 2 * butterflyInsetMargin) + butterflyInsetMargin
    const endY = Math.random() * (100 - 2 * butterflyInsetMargin) + butterflyInsetMargin

    // Midpoint with some random deviation for a more natural path
    const midX = startX + (endX - startX) / 2 + (Math.random() - 0.5) * 30
    const midY = startY + (endY - startY) / 2 + (Math.random() - 0.5) * 30

    const animationFullDuration = Math.random() * 7 + 9 // e.g., 9s to 16s

    zeroPointButterflies.value.push({
      id: i,
      style: {
        left: `${startX}vw`,
        top: `${startY}vh`,
        '--dx-mid': `${midX - startX}vw`,
        '--dy-mid': `${midY - startY}vh`,
        '--dx-end': `${endX - startX}vw`,
        '--dy-end': `${endY - startY}vh`,
        '--initial-rotation': `${(Math.random() - 0.5) * 30 - 15}deg`,
        '--mid-rotation': `${(Math.random() - 0.5) * 20}deg`,
        '--end-rotation': `${(Math.random() - 0.5) * 30 + 15}deg`,
        '--initial-scale': '0.5',
        '--mid-drift-scale': '1.1',
        '--normal-scale': '1',
        animationDelay: `${Math.random() * 8 + 2}s`,
        animationDuration: `${animationFullDuration}s, ${animationFullDuration}s`, // Drift and Opacity sync
      },
    })
  }
}

onMounted(() => {
  // createFortniteEffects called unconditionally
  createFortniteEffects()
})

// Watch for uiSettingsStore.animationsEnabled removed
</script>

<style scoped>
.fortnite-effects {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: hidden;
}

.fn-rift-energy-wisps {
  position: absolute;
  width: 2px;
  height: 80px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(var(--glow-accent-rgb), 0.2),
    transparent
  );
  opacity: 0;
  filter: blur(1px);
  animation-name: fnWispDrift, fnWispFadeIn;
  animation-timing-function: ease-in-out, forwards;
  animation-iteration-count: infinite, 1;
  animation-fill-mode: none, forwards;
  animation-play-state: running;
}
/* .animations-disabled .fn-rift-energy-wisps removed */
@keyframes fnWispDrift {
  0% {
    transform: translate(var(--x-start), var(--y-start)) scaleY(0.5);
    opacity: 0;
  }
  50% {
    transform: translate(var(--x-mid), var(--y-mid)) scaleY(1);
    opacity: 0.5;
  }
  100% {
    transform: translate(var(--x-end), var(--y-end)) scaleY(0.5);
    opacity: 0;
  }
}
@keyframes fnWispFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.5;
  }
}

.fn-energy-orb {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(var(--glow-accent-rgb), 0.15);
  box-shadow:
    0 0 6px rgba(var(--glow-accent-rgb), 0.2),
    0 0 10px rgba(var(--glow-accent-rgb), 0.1);
  filter: blur(2px);
  opacity: 0;
  animation-name: fnOrbDrift, fnOrbPulse;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
  animation-direction: normal, alternate;
  animation-play-state: running;
}
/* .animations-disabled .fn-energy-orb removed */
@keyframes fnOrbDrift {
  0% {
    transform: translate(0, 0) scale(var(--current-orb-scale, 0.7));
  }
  100% {
    transform: translate(var(--dx-end), var(--dy-end)) scale(var(--current-orb-scale, 0.7));
  }
}
@keyframes fnOrbPulse {
  0%,
  100% {
    opacity: 0.05;
    --current-orb-scale: 0.7;
  }
  50% {
    opacity: 0.3;
    --current-orb-scale: 1;
  }
}

.fn-comet {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: rgba(220, 220, 255, 0.7);
  border-radius: 50%;
  box-shadow:
    0 0 10px 2px rgba(150, 180, 255, 0.5),
    0 0 20px 5px rgba(var(--glow-accent-rgb), 0.3);
  opacity: 0;
  animation-name: fnCometArc;
  animation-timing-function: ease-in;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  animation-play-state: running;
  z-index: 1;
  filter: blur(1px);
}
/* .animations-disabled .fn-comet removed */
.fn-comet-tail {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 0px;
  background: linear-gradient(to top, rgba(var(--glow-accent-rgb), 0.01), rgba(200, 200, 255, 0.3));
  border-radius: 0 0 50% 50%;
  transform-origin: top center;
  transform: translate(-50%, -2px) rotate(180deg);
  opacity: 0;
  animation: fnCometTailGrow 1s 0.2s ease-out forwards;
  animation-duration: inherit; /* This might not work as expected for sub-elements if parent is paused */
  animation-delay: inherit; /* Same as above */
  animation-play-state: running; /* Default state */
}
/* .animations-disabled .fn-comet-tail removed */
@keyframes fnCometArc {
  0% {
    transform: translate(var(--x-start), var(--y-start)) scale(0.5);
    opacity: 0;
  }
  15% {
    opacity: 0.8;
  }
  85% {
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--x-end), var(--y-end)) scale(1.2);
    opacity: 0;
  }
}
@keyframes fnCometTailGrow {
  0% {
    height: 0px;
    opacity: 0;
  }
  100% {
    height: 80px;
    opacity: 0.7;
  }
}

.fn-zero-point-butterfly {
  position: absolute;
  width: 20px;
  height: 18px;
  opacity: 0;
  filter: blur(0.5px);
  /* Explicitly set initial transform state to match animation's 0% */
  transform: translate(0, 0) rotate(var(--initial-rotation)) scale(var(--initial-scale));
  animation-name: fnButterflyDrift, fnButterflyAppearOpacity;
  animation-timing-function: ease-in-out, ease-in-out;
  animation-iteration-count: 1, 1;
  animation-fill-mode: forwards, forwards;
  animation-play-state: running; /* Default state */
  z-index: 1;
}
/* .animations-disabled .fn-zero-point-butterfly removed */

@keyframes fnButterflyDrift {
  0% {
    transform: translate(0, 0) rotate(var(--initial-rotation)) scale(var(--initial-scale));
  }
  20% {
    transform: translate(calc(var(--dx-mid) * 0.4), calc(var(--dy-mid) * 0.4))
      rotate(calc(var(--initial-rotation) + (var(--mid-rotation) - var(--initial-rotation)) * 0.4))
      scale(var(--normal-scale));
  }
  50% {
    transform: translate(var(--dx-mid), var(--dy-mid)) rotate(var(--mid-rotation))
      scale(var(--mid-drift-scale));
  }
  80% {
    transform: translate(
        calc(var(--dx-mid) + (var(--dx-end) - var(--dx-mid)) * 0.6),
        calc(var(--dy-mid) + (var(--dy-end) - var(--dy-mid)) * 0.6)
      )
      rotate(calc(var(--mid-rotation) + (var(--end-rotation) - var(--mid-rotation)) * 0.6))
      scale(var(--normal-scale));
  }
  100% {
    transform: translate(var(--dx-end), var(--dy-end)) rotate(var(--end-rotation))
      scale(var(--initial-scale));
  }
}

@keyframes fnButterflyAppearOpacity {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 0.7;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
  }
}

.fn-butterfly-wing {
  position: absolute;
  width: 10px;
  height: 18px;
  background-color: rgba(var(--glow-accent-rgb), 0.5);
  box-shadow: 0 0 5px rgba(var(--glow-accent-rgb), 0.7);
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-delay: inherit; /* Inherits from .fn-zero-point-butterfly */
  animation-play-state: running; /* Default state for wings */
}
/* .animations-disabled .fn-butterfly-wing removed */
.fn-butterfly-wing-left {
  left: 0;
  border-radius: 80% 20% 20% 80% / 50% 50% 50% 50%;
  transform-origin: right center;
  animation-name: fnButterflyFlapLeft;
  animation-duration: 1.2s;
}
.fn-butterfly-wing-right {
  right: 0;
  border-radius: 20% 80% 80% 20% / 50% 50% 50% 50%;
  transform-origin: left center;
  animation-name: fnButterflyFlapRight;
  animation-duration: 1.2s;
}

@keyframes fnButterflyFlapLeft {
  0%,
  100% {
    transform: rotateY(0deg) scaleY(1);
  }
  50% {
    transform: rotateY(40deg) scaleY(0.95);
  }
}
@keyframes fnButterflyFlapRight {
  0%,
  100% {
    transform: rotateY(0deg) scaleY(1);
  }
  50% {
    transform: rotateY(-40deg) scaleY(0.95);
  }
}
</style>
