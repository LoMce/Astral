<template>
  <div class="minecraft-effects">
    <div
      v-for="block in blocks"
      :key="'mc-block-' + block.id"
      class="mc-block-shadow"
      :style="block.style"
    ></div>
    <div
      v-for="dustParticle in dust"
      :key="'mc-dust-' + dustParticle.id"
      class="mc-pixel-dust"
      :style="dustParticle.style"
    ></div>
    <!-- Nostalgic Elements -->
    <div
      v-for="enderParticle in enderParticles"
      :key="'mc-ender-' + enderParticle.id"
      class="mc-ender-particle"
      :style="enderParticle.style"
    ></div>
    <div v-if="showCreeperFace" class="mc-creeper-face-silhouette" :style="creeperFaceStyle"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const blocks = ref([])
const dust = ref([])
const enderParticles = ref([])
const showCreeperFace = ref(false)
const creeperFaceStyle = ref({})
let creeperTimeout = null

const createMinecraftEffects = () => {
  blocks.value = []
  const numBlocks = 4
  for (let i = 0; i < numBlocks; i++) {
    const size = Math.random() * 8 + 10 // vw
    blocks.value.push({
      id: i,
      style: {
        width: `${size}vw`,
        height: `${size}vw`,
        '--x-start': `${Math.random() * 90}vw`,
        '--y-start': `${Math.random() * 90}vh`,
        '--x-end': `${Math.random() * 90}vw`,
        '--y-end': `${Math.random() * 90}vh`,
        animationDelay: `${Math.random() * 5}s, 0s`,
      },
    })
  }

  dust.value = []
  const numDust = 15
  for (let i = 0; i < numDust; i++) {
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    dust.value.push({
      id: i,
      style: {
        '--x-start': `${startX}vw`,
        '--y-start': `${startY}vh`,
        '--x-end': `${startX + (Math.random() - 0.5) * 40}vw`,
        '--y-end': `${startY + (Math.random() - 0.5) * 40}vh`,
        '--rot-end': `${(Math.random() - 0.5) * 90}deg`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${Math.random() * 10 + 10}s, ${Math.random() * 3 + 4}s`,
      },
    })
  }

  enderParticles.value = []
  const numEnderParticles = 10
  for (let i = 0; i < numEnderParticles; i++) {
    enderParticles.value.push({
      id: i,
      style: {
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${Math.random() * 5 + 5}s`, // For mcEnderParticleFloat
      },
    })
  }
}

const triggerCreeperFace = () => {
  if (creeperTimeout) clearTimeout(creeperTimeout)

  showCreeperFace.value = true
  const size = Math.random() * 50 + 80 // px
  creeperFaceStyle.value = {
    width: `${size}px`,
    height: `${size}px`,
    top: `${Math.random() * (100 - (size / window.innerHeight) * 100)}vh`, // Ensure it's somewhat visible
    left: `${Math.random() * (100 - (size / window.innerWidth) * 100)}vw`,
    animationDuration: '1.5s', // Quick fade in and out
  }

  setTimeout(() => {
    showCreeperFace.value = false
  }, 1500) // Match animation duration

  // Schedule next appearance
  creeperTimeout = setTimeout(triggerCreeperFace, Math.random() * 20000 + 15000) // 15-35 seconds
}

onMounted(() => {
  createMinecraftEffects()
  triggerCreeperFace()
})

onBeforeUnmount(() => {
  if (creeperTimeout) clearTimeout(creeperTimeout)
})
</script>

<style scoped>
.minecraft-effects {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: hidden; /* Keep effects contained */
}
.mc-block-shadow {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.03);
  opacity: 0;
  animation-name: mcDriftBlock, mcBlockFadeIn;
  animation-duration: 30s, 2s;
  animation-timing-function: linear, forwards;
  animation-iteration-count: infinite, 1;
  animation-fill-mode: none, forwards;
}
@keyframes mcDriftBlock {
  0% {
    transform: translate(var(--x-start), var(--y-start)) rotate(0deg);
  }
  100% {
    transform: translate(var(--x-end), var(--y-end)) rotate(90deg);
  }
}
@keyframes mcBlockFadeIn {
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

.mc-pixel-dust {
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: rgba(var(--glow-primary-rgb), 0.25);
  box-shadow: 0 0 2px rgba(var(--glow-primary-rgb), 0.3);
  opacity: 0;
  animation-name: mcDustDrift, mcDustPulse;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
  animation-direction: normal, alternate;
}
@keyframes mcDustDrift {
  0% {
    transform: translate(var(--x-start), var(--y-start)) rotate(0deg);
  }
  100% {
    transform: translate(var(--x-end), var(--y-end)) rotate(var(--rot-end));
  }
}
@keyframes mcDustPulse {
  0%,
  100% {
    opacity: 0.1;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.4;
    transform: scale(1);
  }
}

/* Nostalgic Elements */
.mc-ender-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #da70d6; /* Orchid - similar to Ender particles */
  border-radius: 1px; /* Slightly blocky */
  box-shadow:
    0 0 3px #da70d6,
    0 0 5px #da70d6;
  opacity: 0;
  animation-name: mcEnderParticleFloat;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes mcEnderParticleFloat {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.5);
  }
  20% {
    opacity: 0.7;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translateY(-80px) scale(1.5);
  }
}

.mc-creeper-face-silhouette {
  position: absolute;
  opacity: 0;
  /* Base64 encoded SVG for Creeper face, dark semi-transparent green with black features */
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PGcgc3R5bGU9Im9wYWNpdHk6MC43Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9InJnYmEoMCwzMCwwLDAuMykiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTAiIHk9IjQiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSI2IiB5PSI2IiB3aWR0aD0iNCIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iOCIgd2lkdGg9IjEiIGhlaWdodD0iMyIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjkiIHk9IjgiIHdpZHRoPSIxIiBoZWlnaHQ9IjMiIGZpbGw9IiMwMDAiLz48L2c+PC9zdmc+');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  animation-name: mcCreeperFade;
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
  filter: blur(1px);
  z-index: 1; /* Above other block shadows if needed */
}
@keyframes mcCreeperFade {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  20% {
    opacity: 0.15;
    transform: scale(1);
  } /* Max opacity quite low */
  80% {
    opacity: 0.15;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}
</style>
