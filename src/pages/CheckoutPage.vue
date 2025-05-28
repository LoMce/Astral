<template>
  <div class="container page-container checkout-page">
    <h1 class="main-title">Checkout</h1>

    <div class="checkout-content">
      <div class="order-summary-and-cart">
        <h2>Your Order</h2>
        <div v-if="cartStore.items.length === 0" class="empty-cart-message-checkout">
          <p>Your cart is empty. Add some items to proceed!</p>
          <router-link to="/" class="styled-button">Continue Shopping</router-link>
        </div>
        <div v-else class="cart-items-container">
          <!-- This is the wrapper -->
          <div class="cart-items-list-checkout">
            <CartItem
              v-for="item in cartStore.items"
              :key="item.id"
              :item="item"
              @remove-item="cartStore.removeFromCart(item.id)"
              class="checkout-cart-item"
            />
          </div>
          <div class="summary-total-checkout">
            <span class="total-label">Total:</span>
            <span class="total-amount">${{ cartStore.cartTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="customer-details-payment">
        <form @submit.prevent="handleFormSubmit" class="checkout-form">
          <div class="form-group">
            <label for="email">Email Address for Receipt</label>
            <input
              type="email"
              id="email"
              v-model="customerDetails.email"
              required
              placeholder="your@email.com"
              @blur="validateEmailOnBlur"
              @input="clearEmailErrorOnInput"
              :aria-invalid="!!emailError"
              aria-describedby="email-error-message"
            />
            <div v-if="emailError" id="email-error-message" class="error-message" role="alert">
              {{ emailError }}
            </div>
          </div>

          <h2>Payment Method</h2>
          <div class="payment-methods">
            <p><em>(Payment system integration is a placeholder)</em></p>
            <button type="button" class="payment-button stripe-button">Pay with Stripe</button>
            <button type="button" class="payment-button crypto-button">Pay with Crypto</button>
          </div>

          <button
            type="submit"
            class="styled-button place-order-button"
            :disabled="cartStore.items.length === 0"
          >
            Place Order (Simulated)
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import CartItem from '@/components/CartItem.vue'

const cartStore = useCartStore()
const router = useRouter()

// --- Demo Data for Empty Cart Scenario ---
const demoGamesData = [
  {
    name: 'Minecraft',
    value: 'minecraft',
    logoSrc:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNzgwODY4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcng9IjAiIHJ5PSIwIiBmaWxsPSIjM2M0YjMyIi8+PHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgcng9IjAiIHJ5PSIwIiBmaWxsPSIjYTg4NjAiLz48cmVjdCB4PSI4IiB5PSI0IiB3aWR0aD0iOCIgaGVpZ2h0PSI0IiByeD0iMCIgcnk9IjAiIGZpbGw9IiM3MDYwNDAiLz48cmVjdCB4PSI0IiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiByeD0iMCIgcnk9IjAiIGZpbGw9IiM3MDYwNDAiLz48L3N2Zz4=',
  },
  {
    name: 'Fortnite',
    value: 'fortnite',
    logoSrc:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjOTA4MGE4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTNzcuNTIgMiAxMiAyek04LjUgMTVjLTEuMzggMC0yLjUtMS4xMi0yLjUtMi41UzcuMTIgMTAgOC41IDEwczEuNjcuMiAyLjI1LjVsMS4yNS0zLjc1QzExLjE3IDkuNSA5LjgzIDkgOC41IDljLTIuNDggMC00LjUgMi00LjUgNC41UzYuMDIgMTggOC41IDE4czIuODMtLjUgMy41My0xLjI1bC0xLjI1LTEuNzVjLS41OC4zLTEuMzcuNS0yLjI4LjV6bTcgMGMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNWMxLjMzIDAgMi42Ny41IDMuNSAxLjI1bC0xLjI1IDEuNzVjLS41OC0uMy0xLjM3LS41LTIuMjUtLjVzLTEuNjguMi0yLjI1LjVsMS4yNSAzLjc1Yy44My0uNyAxLjE3LTEuMjUgMy41My0xLjI1IDIuNDggMCA0LjUgMiA0LjUgNC41UzE3LjkSDE4IDE1LjUgMThzLTIuODMtLjUgMy41My0xLjI1bDEuMjUtMS43NWMuNTguMyAxLjM3LjUgMi4yOC41eiIgZmlsbD0iI2ZmNDBmZiIvPjwvc3ZnPg==',
  },
  {
    name: 'Call of Duty',
    value: 'cod',
    logoSrc:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNjg3MDY4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTNzcuNTIgMiAxMiAyek0xMiA0Yy0xLjEgMC0yIC45LTIgMnY5aDEuNVYxMS41aDF2NC41aDEuNVY2aC0xVjQuNWgtMVYzYy0xLjV2MXptLTQuNSA1aDEuNVYxNmgtMS41Vjl6bTkgMGgxLjVWMTZIMTYuNVY5eiIgZmlsbD0iI2NjNzcwMCIvPjwvc3ZnPg==',
  }
];

const demoKeyCardsData = [
  { type: 'Daily', title: 'Daily Pass', price: '$1.99', features: ['Instant Access', 'Core Features'] },
  { type: 'Monthly', title: 'Monthly Pass', price: '$19.99', features: ['Full Access', 'Unlock Everything'] },
  { type: 'Weekly', title: 'Weekly Pass', price: '$7.99', features: ['7-Day Access', 'All Features'] }
];

// Helper functions for random selection
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const customerDetails = ref({
  email: '',
})
/** @type {import('vue').Ref<String>} */
const emailError = ref('');

// --- Constants ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR_MSG_EMAIL_REQUIRED = 'Email address is required.';
const ERROR_MSG_EMAIL_INVALID = 'Please enter a valid email address.';

/**
 * Validates the customer's email address.
 * Sets the `emailError` ref if validation fails.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
const validateEmail = () => {
  if (!customerDetails.value.email) {
    emailError.value = ERROR_MSG_EMAIL_REQUIRED;
    return false;
  }
  if (!EMAIL_REGEX.test(customerDetails.value.email)) {
    emailError.value = ERROR_MSG_EMAIL_INVALID;
    return false;
  }
  emailError.value = '';
  return true;
}

/**
 * Validates the email when the input field loses focus.
 */
const validateEmailOnBlur = () => {
  validateEmail();
}

/**
 * Clears the email error message when the user starts typing in the email field.
 */
const clearEmailErrorOnInput = () => {
  if (emailError.value) {
    emailError.value = '';
  }
}

/**
 * Handles the checkout form submission.
 * Validates the email, then simulates order placement if valid and cart is not empty.
 * Clears the cart and navigates to the home page on successful "order".
 */
const handleFormSubmit = () => {
  if (!validateEmail()) {
    return; // Stop submission if email is invalid
  }

  if (cartStore.items.length === 0) {
    // Cart is empty, populate with dynamic demo data
    console.log('Cart is empty. Populating localStorage with dynamic demo data for purchase completion page.');
    const userEmail = customerDetails.value.email || 'demouser@example.com';
    
    const generatedDemoItems = [];
    const numberOfItemsToGenerate = getRandomInt(1, 3);
    const usedCombinations = new Set(); // To avoid duplicate game+pass items

    for (let i = 0; i < numberOfItemsToGenerate; i++) {
      let game, pass, combinationKey;
      let attempts = 0; // Safety break for loop
      do {
        game = getRandomElement(demoGamesData);
        pass = getRandomElement(demoKeyCardsData);
        combinationKey = `${game.value}_${pass.type}`;
        attempts++;
      } while (usedCombinations.has(combinationKey) && attempts < (demoGamesData.length * demoKeyCardsData.length));
      
      if (usedCombinations.has(combinationKey)) continue; // Skip if still duplicate after attempts (e.g. all combos used)

      usedCombinations.add(combinationKey);

      const quantity = getRandomInt(1, 2);
      const price = parseFloat(pass.price.replace('$', ''));

      generatedDemoItems.push({
        id: `${game.value}_${pass.type}_demo_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`,
        name: `${game.name} - ${pass.title}`, 
        price: price, 
        quantity: quantity,
        logoSrc: game.logoSrc, 
        gameName: game.name, 
        passTitle: pass.title,
        gameValue: game.value // Ensure gameValue is included for demo items
      });
    }
    
    let calculatedTotal = 0;
    generatedDemoItems.forEach(item => {
      calculatedTotal += item.quantity * item.price;
    });

    localStorage.setItem('purchaseEmail', userEmail);
    localStorage.setItem('purchaseItems', JSON.stringify(generatedDemoItems));
    localStorage.setItem('purchaseTotal', calculatedTotal.toFixed(2));
    
    console.log(
      `Simulating order placement with DYNAMIC DEMO data...\nEmail: ${userEmail}\nTotal: $${calculatedTotal.toFixed(2)}\nItems: ${JSON.stringify(generatedDemoItems, null, 2)}\nThank you for your purchase!`,
    );
    // Do not clear cartStore as it was already empty or not used for this fake transaction
  } else {
    // Cart is not empty, use actual cart data, map to desired structure for localStorage
    console.log(
      `Simulating order placement with ACTUAL cart data...\nEmail: ${customerDetails.value.email}\nTotal: $${cartStore.cartTotal.toFixed(2)}\nThank you for your purchase!`,
    );
    
    const itemsForStorage = cartStore.items.map(cartItem => {
      // Construct the 'name' field similar to how PurchaseCompletePage expects it if not already present
      // cart.js stores name as gameName + passTitle, so cartItem.name might not exist or be different.
      // The cart store items already have: gameName, passTitle.
      // The combined name is: `${cartItem.gameName} - ${cartItem.passTitle}`
      return {
        id: cartItem.id,
        name: `${cartItem.gameName} - ${cartItem.passTitle}`, // Ensure consistent name format
        price: cartItem.priceNumeric || 0, 
        quantity: cartItem.quantity,
        logoSrc: cartItem.gameLogo || '', 
        gameName: cartItem.gameName,
        passTitle: cartItem.passTitle,
        gameValue: cartItem.gameValue || '' // Ensure gameValue is included from cart items
      };
    });

    localStorage.setItem('purchaseEmail', customerDetails.value.email);
    localStorage.setItem('purchaseItems', JSON.stringify(itemsForStorage));
    localStorage.setItem('purchaseTotal', cartStore.cartTotal.toFixed(2)); // cartTotal is already numeric
    cartStore.clearCart(); // Clear the actual cart items
  }

  router.push('/purchase-complete');
}
</script>

<style scoped>
.checkout-page {
  margin-top: 60px;
  min-height: calc(100vh - 80px - 60px);
  max-height: calc(100vh - 80px - 60px);
}
.main-title {
  margin-bottom: 30px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px;
  text-align: left;
}

.order-summary-and-cart,
.customer-details-payment {
  padding: 20px;
  background-color: rgba(var(--card-bg-color-opaque), 0.6);
  border-radius: var(--border-radius);
  border: 1px solid rgba(var(--glow-secondary-rgb), 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.order-summary-and-cart h2,
.customer-details-payment h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2em;
  color: var(--glow-primary);
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--glow-primary-rgb), 0.25);
  flex-shrink: 0;
}

.empty-cart-message-checkout {
  padding: 30px 10px;
  text-align: center;
  color: var(--text-muted-color);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty-cart-message-checkout p {
  margin-bottom: 20px;
  font-size: 1.05em;
}

.cart-items-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.cart-items-list-checkout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  margin-right: -8px;
}
.cart-items-list-checkout::-webkit-scrollbar {
  width: 6px;
}
.cart-items-list-checkout::-webkit-scrollbar-track {
  background: rgba(var(--glow-secondary-rgb), 0.05);
  border-radius: 3px;
}
.cart-items-list-checkout::-webkit-scrollbar-thumb {
  background: rgba(var(--glow-primary-rgb), 0.3);
  border-radius: 3px;
}
.cart-items-list-checkout::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--glow-accent-rgb), 0.4);
}

.checkout-cart-item {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.summary-total-checkout {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(var(--glow-primary-rgb), 0.25);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 1.25em;
  font-weight: bold;
  color: var(--text-color);
  flex-shrink: 0;
}
.summary-total-checkout .total-label {
  margin-right: 10px;
  white-space: nowrap;
}
.summary-total-checkout .total-amount {
  color: var(--glow-accent);
  text-shadow: 0 0 5px rgba(var(--glow-accent-rgb), 0.5);
  text-align: right;
  flex-shrink: 0;
  min-width: 100px;
}

.checkout-form .form-group {
  margin-bottom: 20px;
}
.checkout-form label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.95em;
  font-weight: 600;
  color: var(--text-muted-color);
}
.checkout-form input[type='email'] {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(var(--glow-secondary-rgb), 0.3);
  border-radius: var(--border-radius);
  background-color: rgba(var(--bg-color-space), 0.8);
  color: var(--text-color);
  font-size: 0.95em;
  transition: all var(--transition-speed) ease;
}
.checkout-form input[type='email']:focus {
  outline: none;
  border-color: var(--glow-accent);
  box-shadow: 0 0 5px rgba(var(--glow-accent-rgb), 0.2);
}

.payment-methods {
  margin-top: 25px;
  margin-bottom: 25px;
}
.payment-methods p {
  font-size: 0.85em;
  color: var(--text-muted-color);
  margin-bottom: 10px;
  text-align: center;
}
.payment-button {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: var(--border-radius);
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed) ease, transform 0.1s ease; /* Ensure transform is part of transition */
  border: 1px solid transparent;
}
.stripe-button {
  background-color: #6772e5;
  color: white;
  border-color: #5460c7;
}
.stripe-button:hover {
  background-color: #5460c7;
  box-shadow: 0 0 8px rgba(103, 114, 229, 0.5);
}
.stripe-button:active {
  transform: scale(0.98);
  background-color: #505acc; /* Slightly darker/more intense */
}
.crypto-button {
  background-color: #f7931a;
  color: white;
  border-color: #e0800a;
}
.crypto-button:hover {
  background-color: #e0800a;
  box-shadow: 0 0 8px rgba(247, 147, 26, 0.5);
}
.crypto-button:active {
  transform: scale(0.98);
  background-color: #d87e09; /* Slightly darker/more intense */
}
.styled-button.place-order-button {
  width: 100%;
  margin-top: 10px;
}

/* Specific focus styles for payment buttons */
.stripe-button:focus-visible {
  outline: none; /* Override global outline to use box-shadow for focus */
  /* Inner white ring for separation, outer ring using a darker shade of the button's own color */
  box-shadow: 0 0 0 2px white, 0 0 0 4px #434f9c; /* Darker blue for Stripe */
}

.crypto-button:focus-visible {
  outline: none; /* Override global outline */
  /* Inner white ring, outer ring using a darker shade of the button's own color */
  box-shadow: 0 0 0 2px white, 0 0 0 4px #c47008; /* Darker orange for Crypto */
}


@media (max-width: 850px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  .order-summary-and-cart {
    margin-bottom: 30px;
  }
}

.error-message {
  color: #ff6b6b; /* A common error red color */
  /* Or use a CSS variable if defined in your global styles: var(--error-color, #ff6b6b); */
  font-size: 0.8em;
  margin-top: 5px;
}
</style>
