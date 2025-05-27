<template>
  <div class="immersive-background-effects">
    <div
      id="galaxy-layer"
      :style="{
        backgroundImage: `url('${galaxySvgUrl}')`,
        opacity: 'var(--galaxy-opacity, 0.15)',
      }"
    ></div>
    <canvas ref="backgroundCanvasRef" class="background-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'

// Import SVG strings
import { defaultGalaxySvgString } from '@/assets/svgs/defaultGalaxy.js'
import { minecraftGalaxySvgString } from '@/assets/svgs/minecraftGalaxy.js'
import { fortniteGalaxySvgString } from '@/assets/svgs/fortniteGalaxy.js'
import { codGalaxySvgString } from '@/assets/svgs/codGalaxy.js'

// --- Particle Configuration Constants ---
const NUM_STARS = 30;
const STAR_MIN_SIZE = 0.5;
const STAR_MAX_SIZE_ADD = 1.5; // Max size = MIN_SIZE + MAX_SIZE_ADD
const STAR_VX_VY_FACTOR = 0.05;
const STAR_TWINKLE_MIN_SPEED = 0.002;
const STAR_TWINKLE_MAX_SPEED_ADD = 0.005;
const STAR_MAX_OPACITY_BASE = 0.5;
const STAR_MAX_OPACITY_ADD = 0.2;
const STAR_MIN_OPACITY_BASE = 0.1;
const STAR_MIN_OPACITY_ADD = 0.1;

const NUM_RAIN_STREAKS = 15;
const RAIN_MIN_HEIGHT = 10;
const RAIN_MAX_HEIGHT_ADD = 20;
const RAIN_MIN_SPEED = 1;
const RAIN_MAX_SPEED_ADD = 1;
const RAIN_MIN_OPACITY = 0.01;
const RAIN_MAX_OPACITY_ADD = 0.05;

const NUM_ORBITALS = 1;
const ORBITAL_MIN_SIZE = 2;
const ORBITAL_MAX_SIZE_ADD = 4;
const ORBITAL_BASE_OPACITY_MIN = 0.1;
const ORBITAL_BASE_OPACITY_ADD = 0.2;
const ORBITAL_RADIUS_FACTOR_MIN = 0.1;
const ORBITAL_RADIUS_FACTOR_ADD = 0.15;
const ORBITAL_SPEED_MIN = 0.002;
const ORBITAL_SPEED_ADD = 0.005;
const ORBITAL_OPACITY_PULSATE_FACTOR = 0.5;
const ORBITAL_OPACITY_PULSATE_BASE_ADD = 0.5;


const props = defineProps({
  /**
   * The currently selected game theme value (e.g., 'minecraft', 'fortnite').
   * Determines which galaxy SVG and potentially theme colors are used.
   * @type {String}
   */
  selectedGame: {
    type: String,
    default: '',
  },
})

const backgroundCanvasRef = ref(null)
/** @type {CanvasRenderingContext2D | null} */
let ctx = null
let animationFrameId = null

// Particle arrays
/** @type {Array<Object>} */
let starsArray = []
/** @type {Array<Object>} */
let rainStreaksArray = []
/** @type {Array<Object>} */
let orbitalParticlesArray = []

/**
 * Reactive object holding theme-based colors for canvas drawing.
 * Updated by `updateThemeColors` based on CSS custom properties.
 */
const themeColors = ref({
  starColor: 'rgba(200, 190, 230, 0.5)',
  rainColor: 'rgba(255, 0, 255, 0.06)',
  orbitalPrimaryColor: 'rgba(138, 43, 226, 1)',
  orbitalAccentColor: 'rgba(255, 0, 255, 1)',
  orbitalSecondaryColor: 'rgba(72, 61, 139, 1)'
})

/**
 * Computes the appropriate galaxy SVG data string based on the selected game theme.
 * @returns {String} The SVG data string for the galaxy background.
 */
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

/**
 * Creates and initializes star particles.
 * Populates `starsArray` with star objects, each having properties for position,
 * size, opacity, velocity, and twinkle effect.
 */
const createStars = () => {
  if (!backgroundCanvasRef.value) return;
  starsArray = []
  for (let i = 0; i < NUM_STARS; i++) {
    const size = Math.random() * STAR_MAX_SIZE_ADD + STAR_MIN_SIZE;
    starsArray.push({
      id: i,
      x: Math.random() * backgroundCanvasRef.value.width,
      y: Math.random() * backgroundCanvasRef.value.height,
      size: size,
      opacity: Math.random() * (STAR_MAX_OPACITY_BASE - STAR_MIN_OPACITY_BASE) + STAR_MIN_OPACITY_BASE,
      vx: (Math.random() - 0.5) * STAR_VX_VY_FACTOR,
      vy: (Math.random() - 0.5) * STAR_VX_VY_FACTOR,
      twinkleSpeed: Math.random() * STAR_TWINKLE_MAX_SPEED_ADD + STAR_TWINKLE_MIN_SPEED,
      twinkleDirection: Math.random() < 0.5 ? 1 : -1,
      maxOpacity: STAR_MAX_OPACITY_BASE + Math.random() * STAR_MAX_OPACITY_ADD,
      minOpacity: STAR_MIN_OPACITY_BASE + Math.random() * STAR_MIN_OPACITY_ADD
    })
  }
}

/**
 * Creates and initializes rain streak particles.
 * Populates `rainStreaksArray` with rain objects, each having properties for position,
 * height, speed, and opacity.
 */
const createRainStreaks = () => {
  if (!backgroundCanvasRef.value) return;
  rainStreaksArray = []
  for (let i = 0; i < NUM_RAIN_STREAKS; i++) {
    rainStreaksArray.push({
      id: i,
      x: Math.random() * backgroundCanvasRef.value.width,
      y: Math.random() * -backgroundCanvasRef.value.height, // Start off-screen top
      height: Math.random() * RAIN_MAX_HEIGHT_ADD + RAIN_MIN_HEIGHT,
      speed: Math.random() * RAIN_MAX_SPEED_ADD + RAIN_MIN_SPEED,
      opacity: Math.random() * RAIN_MAX_OPACITY_ADD + RAIN_MIN_OPACITY
    })
  }
}

/**
 * Creates and initializes orbital particles.
 * Populates `orbitalParticlesArray` with particle objects, each having properties for
 * position, size, color, opacity, and orbital movement parameters.
 */
const createOrbitalParticles = () => {
  if (!backgroundCanvasRef.value) return;
  orbitalParticlesArray = []
  if (NUM_ORBITALS > 0) {
    const orbitalColors = [
      themeColors.value.orbitalPrimaryColor,
      themeColors.value.orbitalAccentColor,
      themeColors.value.orbitalSecondaryColor
    ];
    for (let i = 0; i < NUM_ORBITALS; i++) {
      const size = Math.random() * ORBITAL_MAX_SIZE_ADD + ORBITAL_MIN_SIZE;
      orbitalParticlesArray.push({
        id: i,
        x: backgroundCanvasRef.value.width / 2,
        y: backgroundCanvasRef.value.height / 2,
        size: size,
        color: orbitalColors[i % orbitalColors.length],
        baseOpacity: Math.random() * ORBITAL_BASE_OPACITY_ADD + ORBITAL_BASE_OPACITY_MIN,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: Math.min(backgroundCanvasRef.value.width, backgroundCanvasRef.value.height) * 
                     (Math.random() * ORBITAL_RADIUS_FACTOR_ADD + ORBITAL_RADIUS_FACTOR_MIN),
        speed: (Math.random() * ORBITAL_SPEED_ADD + ORBITAL_SPEED_MIN) * (Math.random() < 0.5 ? 1 : -1),
        centerX: backgroundCanvasRef.value.width / 2,
        centerY: backgroundCanvasRef.value.height / 2,
      })
    }
  }
}

/**
 * Sets up or updates the canvas dimensions based on window size.
 * Also re-initializes all particle types to fit the new dimensions.
 */
const setupCanvasDimensions = () => {
  if (backgroundCanvasRef.value && ctx) {
    backgroundCanvasRef.value.width = window.innerWidth
    backgroundCanvasRef.value.height = window.innerHeight
    createStars()
    createRainStreaks()
    createOrbitalParticles() 
  }
}

/**
 * Updates the `themeColors` reactive object by reading CSS custom properties
 * from the document's root element. This allows canvas particle colors to
 * adapt to the current theme.
 */
const updateThemeColors = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const style = getComputedStyle(document.documentElement);
  const newStarColor = style.getPropertyValue('--star-color')?.trim() || 'rgba(200, 190, 230, 0.5)';
  
  const rainColorBase = style.getPropertyValue('--rain-color-rgb')?.trim() || '173, 216, 230'; // Default light blue
  const rainOpacity = parseFloat(style.getPropertyValue('--rain-opacity')?.trim()) || 0.06;
  const newRainColor = `rgba(${rainColorBase}, ${rainOpacity})`;

  themeColors.value = {
    starColor: newStarColor,
    rainColor: newRainColor,
    orbitalPrimaryColor: style.getPropertyValue('--glow-primary')?.trim() || 'rgba(138, 43, 226, 1)',
    orbitalAccentColor: style.getPropertyValue('--glow-accent')?.trim() || 'rgba(255, 0, 255, 1)',
    orbitalSecondaryColor: style.getPropertyValue('--glow-secondary')?.trim() || 'rgba(72, 61, 139, 1)',
  };
}

/**
 * Main animation loop for drawing particles on the canvas.
 * Clears the canvas and then draws each type of particle (stars, rain, orbitals)
 * with their updated positions and appearances.
 * Schedules the next frame using `requestAnimationFrame`.
 */
const animationLoop = () => {
  if (!ctx || !backgroundCanvasRef.value) {
    animationFrameId = requestAnimationFrame(animationLoop);
    return;
  }

  ctx.clearRect(0, 0, backgroundCanvasRef.value.width, backgroundCanvasRef.value.height);

  // Draw Stars
  starsArray.forEach(star => {
    star.opacity += star.twinkleSpeed * star.twinkleDirection;
    if (star.opacity > star.maxOpacity || star.opacity < star.minOpacity) {
      star.twinkleDirection *= -1;
      star.opacity = Math.max(star.minOpacity, Math.min(star.maxOpacity, star.opacity)); // Clamp
    }
    star.x += star.vx;
    star.y += star.vy;

    // Wrap around edges instead of bouncing for smoother parallax
    if (star.x < 0) star.x = backgroundCanvasRef.value.width;
    if (star.x > backgroundCanvasRef.value.width) star.x = 0;
    if (star.y < 0) star.y = backgroundCanvasRef.value.height;
    if (star.y > backgroundCanvasRef.value.height) star.y = 0;
    
    const starBaseColor = themeColors.value.starColor.substring(0, themeColors.value.starColor.lastIndexOf(','))
    ctx.fillStyle = `${starBaseColor}, ${star.opacity})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Rain Streaks
  ctx.strokeStyle = themeColors.value.rainColor;
  ctx.lineWidth = 1;
  rainStreaksArray.forEach(streak => {
    streak.y += streak.speed;
    if (streak.y > backgroundCanvasRef.value.height) {
      streak.y = Math.random() * -streak.height * 5; // Reset further above
      streak.x = Math.random() * backgroundCanvasRef.value.width;
    }
    ctx.beginPath();
    ctx.moveTo(streak.x, streak.y);
    ctx.lineTo(streak.x, streak.y + streak.height);
    ctx.stroke();
  });
  
  // Draw Orbital Particles
  orbitalParticlesArray.forEach(particle => {
    particle.angle += particle.speed;
    particle.x = particle.centerX + Math.cos(particle.angle) * particle.orbitRadius;
    particle.y = particle.centerY + Math.sin(particle.angle) * particle.orbitRadius;
    
    const currentOpacity = particle.baseOpacity * 
                           ((Math.sin(particle.angle * 2) + 1) / 2 * ORBITAL_OPACITY_PULSATE_FACTOR + ORBITAL_OPACITY_PULSATE_BASE_ADD);

    const particleBaseColor = particle.color.substring(0, particle.color.lastIndexOf(','))
    ctx.fillStyle = `${particleBaseColor}, ${currentOpacity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); // Use particle.size directly as radius
    ctx.fill();
  });

  animationFrameId = requestAnimationFrame(animationLoop);
}

onMounted(() => {
  if (backgroundCanvasRef.value) {
    ctx = backgroundCanvasRef.value.getContext('2d');
    setupCanvasDimensions(); // This will also call createParticles
    window.addEventListener('resize', setupCanvasDimensions);
    
    updateThemeColors(); // Initial theme colors
    
    // Particles are created within setupCanvasDimensions initially
    // and then again if resize occurs.
    
    animationLoop();
  }
})

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', setupCanvasDimensions);
})

watch(() => props.selectedGame, () => {
  nextTick(() => {
    updateThemeColors();
    // Re-create orbital particles as their base colors might change directly.
    // Stars and rain use themeColors.value directly in draw loop.
    createOrbitalParticles(); 
  });
});

</script>

<style scoped>
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
  top: -25%; /* Ensure it covers edges during rotation/scaling */
  left: -25%;
  width: 150%;
  height: 150%;
  background-size: cover;
  background-position: center center;
  animation-name: slowRotateGalaxy;
  animation-duration: 300s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: running;
  z-index: -1; /* Behind canvas */
  transition:
    opacity var(--transition-speed) ease,
    background-image var(--transition-speed) ease;
}

.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0; /* On top of galaxy layer */
}

@keyframes slowRotateGalaxy {
  0% {
    transform: rotate(0deg) scale(1.15);
  }
  100% {
    transform: rotate(360deg) scale(1.15);
  }
}

/* Removed .star, .rain-streak, .orbital-particle and their keyframes */
</style>
