<template>
  <div class="purchase-complete-page">
    <h1>Purchase Successful!</h1>
    <div v-if="email">
      <p>Thank you for your purchase, {{ email }}!</p>
      <h2>Order Summary:</h2>
      <ul v-if="items.length">
        <li v-for="item in items" :key="item.id">
          {{ item.name }} - Quantity: {{ item.quantity }} - Price: ${{ item.price.toFixed(2) }}
        </li>
      </ul>
      <p v-else>No items found in your order.</p>
      <p class="total-amount">Total: ${{ total }}</p>
    </div>
    <div v-else>
      <p>Unable to retrieve purchase details.</p>
    </div>
    <router-link to="/" class="home-button">Go to Homepage</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const email = ref('');
const items = ref([]);
const total = ref('0.00');

onMounted(() => {
  email.value = localStorage.getItem('purchaseEmail') || '';
  const storedItems = localStorage.getItem('purchaseItems');
  if (storedItems) {
    try {
      items.value = JSON.parse(storedItems);
    } catch (e) {
      console.error('Error parsing purchase items:', e);
      items.value = [];
    }
  }
  total.value = localStorage.getItem('purchaseTotal') || '0.00';

  // Clear the stored data after displaying it
  localStorage.removeItem('purchaseEmail');
  localStorage.removeItem('purchaseItems');
  localStorage.removeItem('purchaseTotal');
});
</script>

<style scoped>
.purchase-complete-page {
  max-width: 700px; /* Consistent with .container */
  margin: 0 auto; /* Centering */
  padding: 85px 2rem 2rem; /* Approx 70px header + 15px extra space */
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius);
  border: 1px solid rgba(var(--glow-primary-rgb), 0.3);
  box-shadow:
    0 0 15px rgba(var(--glow-primary-rgb), 0.08),
    0 0 25px rgba(var(--glow-primary-rgb), 0.06),
    inset 0 0 10px rgba(0, 0, 0, 0.25);
  color: var(--text-color);
  text-align: center;
  animation: fadeInContainer var(--animation-speed-slow) 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInContainer {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

h1 {
  font-family: 'Orbitron', sans-serif;
  color: var(--glow-primary);
  text-shadow: 0 0 8px rgba(var(--glow-primary-rgb), 0.4), 0 0 12px rgba(var(--glow-primary-rgb), 0.2);
  margin-bottom: 1.5rem;
  font-size: 2.2em; /* Match .main-title if possible */
}

h2 {
  font-family: 'Orbitron', sans-serif;
  color: var(--text-color);
  text-shadow: 0 0 4px rgba(var(--text-color), 0.2);
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.6em;
}

p {
  margin-bottom: 0.75rem;
  line-height: 1.7;
  color: var(--text-muted-color);
}

p:first-of-type { /* "Thank you for your purchase..." */
  color: var(--text-color);
  font-size: 1.1em;
}

ul {
  list-style-type: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

li {
  background-color: rgba(var(--glow-secondary-rgb), 0.1);
  border: 1px solid rgba(var(--glow-secondary-rgb), 0.25);
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: calc(var(--border-radius) / 1.5);
  text-align: left;
  color: var(--text-color);
  transition:
    background-color var(--transition-speed) ease,
    border-color var(--transition-speed) ease;
}
li:hover {
  background-color: rgba(var(--glow-secondary-rgb), 0.15);
  border-color: rgba(var(--glow-secondary-rgb), 0.4);
}

.total-amount {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 1.4em;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  color: var(--glow-accent);
  text-shadow: 0 0 6px rgba(var(--glow-accent-rgb), 0.4);
}

.home-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 12px 24px;
  font-family: 'Orbitron', sans-serif;
  font-size: 1em;
  font-weight: 700;
  color: var(--text-color);
  background: linear-gradient(
    90deg,
    rgba(var(--glow-primary-rgb), 0.22),
    rgba(var(--glow-accent-rgb), 0.28)
  );
  border: 1px solid rgba(var(--glow-accent-rgb), 0.55);
  border-radius: var(--border-radius);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 0 8px rgba(var(--glow-accent-rgb), 0.2);
  text-decoration: none;
  text-shadow: 0 0 3px rgba(0,0,0,0.3);
}

.home-button:hover, .home-button:focus-visible {
  background: linear-gradient(
    90deg,
    rgba(var(--glow-primary-rgb), 0.3),
    rgba(var(--glow-accent-rgb), 0.35)
  );
  border-color: rgba(var(--glow-accent-rgb), 0.75);
  color: var(--glow-accent);
  box-shadow:
    0 0 12px rgba(var(--glow-accent-rgb), 0.3),
    0 0 18px rgba(var(--glow-accent-rgb), 0.15);
  transform: translateY(-2px) scale(1.02);
  outline: none; /* Ensure custom focus is cleaner */
}

.home-button:active {
  transform: translateY(0px) scale(1);
  background: rgba(var(--glow-accent-rgb), 0.15);
  box-shadow: 0 0 5px rgba(var(--glow-accent-rgb), 0.15);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .purchase-complete-page {
    padding: 75px 1rem 1rem; /* Adjust padding for smaller screens */
  }
  h1 {
    font-size: 1.8em;
  }
  h2 {
    font-size: 1.4em;
  }
  li {
    padding: 0.75rem;
  }
  .home-button {
    padding: 10px 20px;
    font-size: 0.9em;
  }
}
</style>
