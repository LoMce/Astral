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
            />
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

const customerDetails = ref({
  email: '',
})

const handleFormSubmit = () => {
  if (cartStore.items.length === 0) {
    console.warn('Your cart is empty. Please add items before placing an order.')
    router.push('/')
    return
  }
  console.log(
    `Simulating order placement...\nEmail: ${customerDetails.value.email}\nTotal: $${cartStore.cartTotal.toFixed(2)}\nThank you for your purchase!`,
  )
  // Store purchase data in localStorage
  localStorage.setItem('purchaseEmail', customerDetails.value.email);
  localStorage.setItem('purchaseItems', JSON.stringify(cartStore.items));
  localStorage.setItem('purchaseTotal', cartStore.cartTotal.toFixed(2));

  cartStore.clearCart()
  router.push('/purchase-complete')
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
  transition: all var(--transition-speed) ease;
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
.crypto-button {
  background-color: #f7931a;
  color: white;
  border-color: #e0800a;
}
.crypto-button:hover {
  background-color: #e0800a;
  box-shadow: 0 0 8px rgba(247, 147, 26, 0.5);
}
.styled-button.place-order-button {
  width: 100%;
  margin-top: 10px;
}

@media (max-width: 850px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  .order-summary-and-cart {
    margin-bottom: 30px;
  }
}
</style>
