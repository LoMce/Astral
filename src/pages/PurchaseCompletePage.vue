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
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: var(--primary-color, #4CAF50); /* Assuming --primary-color is defined elsewhere */
  margin-bottom: 1.5rem;
}

p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

ul {
  list-style-type: none;
  padding: 0;
  margin-bottom: 1rem;
}

li {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  text-align: left;
}

.total-amount {
  font-weight: bold;
  font-size: 1.2em;
  margin-top: 1rem;
  color: var(--secondary-color, #333); /* Assuming --secondary-color is defined */
}

.home-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #4CAF50);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.home-button:hover {
  background-color: var(--primary-color-dark, #45a049); /* Assuming --primary-color-dark for hover */
}
</style>
