<template>
  <div class="purchase-success-container">
    <section class="header-section">
      <h1>Purchase Complete!</h1>
      <p v-if="email">Thank you for your purchase, {{ email }}!</p>
      <p v-else>Your order has been successfully processed.</p>
    </section>

    <section class="order-summary-section">
      <h2>Order Summary</h2>
      <div v-if="items.length">
        <ul>
          <li v-for="item in items" :key="item.id" :class="['purchase-item-card', 'themed-item-card', item.gameValue ? 'game-' + item.gameValue : '']">
            <div class="item-details">
              <img v-if="item.logoSrc" :src="item.logoSrc" :alt="item.name || 'Game Logo'" class="item-logo">
              <div class="item-info">
                <h4 class="item-name">{{ item.name || 'Unknown Item' }}</h4>
                <p class="item-meta">
                  <span>Quantity: {{ item.quantity || 0 }}</span>
                  <span class="item-price">Unit Price: ${{ item.price ? Number(item.price).toFixed(2) : 'N/A' }}</span>
                </p>
              </div>
            </div>

            <div v-if="item.generatedKeys && item.generatedKeys.length > 0" class="keys-display-area">
              <p class="keys-header">Your Key(s):</p>
              <ul>
                <li v-for="(key, index) in item.generatedKeys" :key="index" class="key-item">
                  {{ key }}
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <p class="total-amount">Total: ${{ total }}</p>
      </div>
      <div v-else>
        <p>No items found in your order. Your order might still be processing or details are unavailable.</p>
      </div>
    </section>

    <section class="incentive-section">
      <div class="incentive-banner">
        <h4>A Gift For Your Continued Journey!</h4>
        <p>As a token of our appreciation, enjoy <strong>15% off</strong> your next game key purchase with us.</p>
        <div class="discount-code-area">
          <span>NEXTGAME15</span>
        </div>
        <p class="discount-instruction">Use this code at checkout on your next order.</p>
      </div>
    </section>

    <section class="actions-section">
      <router-link to="/" class="action-button primary">Continue Shopping</router-link>
      <router-link to="/" class="action-button secondary">Explore More Games</router-link>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const email = ref('');
const items = ref([]);
const total = ref('0.00');

function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 4; i++) { // 4 segments
    for (let j = 0; j < 4; j++) { // 4 chars per segment
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += '-'; // Add hyphen between segments
  }
  return key;
}

onMounted(() => {
  email.value = localStorage.getItem('purchaseEmail') || '';
  const storedItemsString = localStorage.getItem('purchaseItems');
  let parsedItems = []; 

  if (storedItemsString) {
    try {
      parsedItems = JSON.parse(storedItemsString);
      if (!Array.isArray(parsedItems)) {
        console.error('Parsed items is not an array. Initializing to empty.', parsedItems);
        parsedItems = [];
      }
    } catch (e) {
      console.error('Error parsing purchaseItems from localStorage:', e);
      // parsedItems remains [], items.value will be empty.
    }
  }
  // Logging Step 1: Original parsedItems
  console.log('Original parsedItems:', JSON.parse(JSON.stringify(parsedItems)));

  if (parsedItems.length > 0) {
    try {
      let firstOriginalItemLogged = false;
      let firstMappedItemLogged = false;
      
      const mappedItems = parsedItems.map(originalItem => {
        if (!firstOriginalItemLogged && parsedItems.length > 0) {
          // Logging Step 2: Processing originalItem (first item only)
          console.log('Processing originalItem (first):', JSON.parse(JSON.stringify(originalItem)));
          firstOriginalItemLogged = true;
        }

        if (typeof originalItem !== 'object' || originalItem === null) {
          console.warn('Encountered invalid item in parsedItems:', JSON.parse(JSON.stringify(originalItem)));
          return { 
            id: `invalid_item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, 
            name: 'Invalid Item Data', 
            quantity: 0, 
            price: 0,
            logoSrc: '',
            generatedKeys: [] 
          };
        }

        const keys = [];
        const quantity = Number(originalItem.quantity) || 0;
        for (let i = 0; i < quantity; i++) {
          keys.push(generateRandomKey());
        }
        
        const mappedSingleItem = {
          id: originalItem.id || `fallback_id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: originalItem.name || 'Unknown Item',
          price: Number(originalItem.price) || 0,
          quantity: quantity,
          logoSrc: originalItem.logoSrc || '',
          gameName: originalItem.gameName || '', 
          passTitle: originalItem.passTitle || '', 
          gameValue: originalItem.gameValue || '', // Ensure gameValue is preserved
          generatedKeys: keys
        };

        if (!firstMappedItemLogged && parsedItems.length > 0) {
            // Logging Step 3: Mapped item (first item only)
            console.log('Mapped item (first, pre-filter):', JSON.parse(JSON.stringify(mappedSingleItem)));
            firstMappedItemLogged = true;
        }
        return mappedSingleItem;
      });
      
      items.value = mappedItems.filter(item => item && item.name !== 'Invalid Item Data');
      
      if (items.value.length === 0 && parsedItems.length > 0) {
        console.warn('All parsed items were invalid or filtered out.');
      }

      // Logging Step 4: Final items.value (first item if available)
      if (items.value.length > 0) {
        console.log('Final items.value (first):', JSON.parse(JSON.stringify(items.value[0])));
      } else {
        console.log('Final items.value is empty after mapping and filtering.');
      }

    } catch (mapError) {
      console.error('Error processing (mapping) parsed items or generating keys:', mapError);
      items.value = []; 
    }
  } else {
    items.value = [];
    console.log('No parsed items to process, items.value set to empty.');
  }

  total.value = localStorage.getItem('purchaseTotal') || '0.00';

  // Clear the stored data after displaying it
  localStorage.removeItem('purchaseEmail');
  localStorage.removeItem('purchaseItems');
  localStorage.removeItem('purchaseTotal');
});
</script>

<style scoped>
/* Base Variables (consider moving to a global style if not already there) */
:root {
  --glow-primary: #00aeff; /* Example: Bright Blue */
  --glow-primary-rgb: 0, 174, 255;
  --glow-accent: #00ffdd;  /* Example: Bright Cyan */
  --glow-accent-rgb: 0, 255, 221;
  --text-color: #e0e0e0;
  --card-bg-color: #1a1a1a;
  --border-radius: 8px;
  --transition-speed-fast: 0.2s;
  --transition-speed-medium: 0.4s;
}

.purchase-success-container {
  max-width: 700px; /* Consistent with original page style */
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius);
  color: var(--text-color);
  font-family: 'Inter', 'Arial', sans-serif; /* Modern Fallback font */
  opacity: 0; /* Initial state for animation */
  animation: fadeInContainer 0.8s 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes fadeInContainer {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
    filter: brightness(0.5);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: brightness(1);
  }
}

.header-section h1 {
  text-align: center;
  color: var(--glow-primary);
  margin-bottom: 1rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 2.2em;
  animation: textGlowPulse 2s infinite alternate, fadeInText 1s 0.5s ease-out forwards;
  opacity: 0; /* Initial state for fadeInText */
  line-height: 1.3;
}

@keyframes fadeInText {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes textGlowPulse {
  0% {
    text-shadow: 0 0 8px rgba(var(--glow-primary-rgb), 0.4), 0 0 12px rgba(var(--glow-primary-rgb), 0.2);
    color: var(--glow-primary);
  }
  100% {
    text-shadow: 0 0 12px rgba(var(--glow-primary-rgb), 0.7), 0 0 20px rgba(var(--glow-primary-rgb), 0.4);
    color: color-mix(in srgb, var(--glow-primary) 80%, white 20%);
  }
}

.header-section p {
  text-align: center;
  margin-bottom: 1.5rem;
  opacity: 0;
  animation: fadeInText 1s 0.8s ease-out forwards; /* Staggered fade in */
}

.order-summary-section {
  background-color: color-mix(in srgb, var(--card-bg-color) 90%, white 5%); /* Slightly lighter */
  padding: 1.5rem;
  border-radius: var(--border-radius); /* Consistent border-radius */
  margin-bottom: 2rem;
  opacity: 0;
  animation: sectionFadeIn 0.7s 1s ease-out forwards;
}

@keyframes sectionFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}


.order-summary-section h2 {
  font-family: 'Orbitron', sans-serif;
  color: var(--text-color);
  margin-bottom: 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--text-color) 25%, transparent); /* Softer border */
  padding-bottom: 0.75rem; /* Increased padding */
  font-size: 1.5em; /* Adjusted size */
}

.order-summary-section ul {
  list-style-type: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

/* Styles for individual purchased item cards */
.purchase-item-card {
  /* background-color: color-mix(in srgb, var(--card-bg-color) 95%, white 2%); */ /* Removed to allow global theme background */
  padding: 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--text-color) 15%, transparent);
  border-radius: var(--border-radius); /* This will be complemented by the global theme's border */
  margin-bottom: 1rem;
  opacity: 0; /* Base style for animation */
  animation: itemAppear 0.5s ease-out forwards;
  transition: background-color var(--transition-speed-fast) ease;
}
.purchase-item-card:hover {
  background-color: rgba(var(--glow-primary-rgb), 0.05);
}
.purchase-item-card:last-child {
  border-bottom: none;
  margin-bottom: 0; /* No margin for the last item if it's directly before total */
}

/* Staggered animation delays for item cards */
.purchase-item-card:nth-child(1) { animation-delay: 1.2s; }
.purchase-item-card:nth-child(2) { animation-delay: 1.3s; }
.purchase-item-card:nth-child(3) { animation-delay: 1.4s; }
.purchase-item-card:nth-child(n+4) { animation-delay: 1.5s; }


.item-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem; /* Space before keys display area */
}

.item-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: calc(var(--border-radius) / 2);
  background-color: rgba(0,0,0,0.1); /* Subtle bg for transparent logos */
  border: 1px solid rgba(var(--glow-secondary-rgb), 0.1);
  flex-shrink: 0; /* Prevent logo from shrinking */
}

.item-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--glow-primary);
  margin: 0 0 0.35rem 0;
  line-height: 1.3;
}

.item-meta {
  font-size: 0.9em;
  color: color-mix(in srgb, var(--text-color) 80%, transparent 20%);
  line-height: 1.5;
}
.item-meta span {
  display: inline-block; /* Or block if they should stack by default */
  margin-right: 0.75rem;
}
.item-meta span:last-child {
  margin-right: 0;
}

.item-price { /* This is a span within .item-meta */
  font-weight: 500; /* Slightly bolder than regular meta text */
  color: var(--text-color); /* Brighter than muted meta text */
}


@keyframes itemAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.total-amount {
  font-family: 'Orbitron', sans-serif; /* Consistent font */
  font-weight: bold;
  font-size: 1.3em; /* Slightly larger */
  text-align: right;
  color: var(--glow-accent);
  margin-top: 1.5rem; /* More spacing */
  padding-top: 1rem; /* Spacing from list */
  border-top: 1px solid color-mix(in srgb, var(--text-color) 25%, transparent); /* Separator */
  opacity: 0;
  animation: fadeInText 1s 1.6s ease-out forwards;
}

.incentive-banner {
  background: linear-gradient(145deg, rgba(var(--glow-primary-rgb), 0.08), rgba(var(--glow-accent-rgb), 0.08)); /* Slightly more pronounced */
  padding: 1.5rem;
  border-radius: var(--border-radius);
  text-align: center;
  margin-bottom: 2rem;
  border: 1px solid var(--glow-accent);
  transition: transform var(--transition-speed-medium) ease,
              box-shadow var(--transition-speed-medium) ease,
              border-color var(--transition-speed-medium) ease;
  opacity: 0;
  animation: sectionFadeIn 0.7s 1.8s ease-out forwards;
}

.incentive-banner:hover, .incentive-banner:focus-visible {
  transform: scale(1.03) translateY(-3px); /* Consistent lift */
  box-shadow: 0 0 25px rgba(var(--glow-accent-rgb), 0.5); /* Enhanced glow */
  border-color: color-mix(in srgb, var(--glow-accent) 80%, white 20%);
  outline: none;
}
.incentive-banner:focus-visible {
   outline: 2px solid var(--glow-accent);
   outline-offset: 3px;
}

.incentive-banner h4 {
  font-family: 'Orbitron', sans-serif;
  color: var(--glow-accent);
  font-size: 1.4em;
  margin-bottom: 0.75rem;
  text-shadow: 0 0 6px rgba(var(--glow-accent-rgb), 0.4); /* Slightly stronger shadow */
}

.incentive-banner p {
  color: var(--text-color); /* Ensured consistency */
  margin-bottom: 1rem; /* Default for main paragraph */
  line-height: 1.6;
}
.incentive-banner p strong {
  color: var(--glow-accent);
  font-weight: bold;
}

.discount-code-area {
  background-color: color-mix(in srgb, var(--card-bg-color) 50%, black 50%); /* Darker background */
  border: 2px dashed var(--glow-primary);
  padding: 0.85rem 1.75rem; /* Adjusted padding */
  border-radius: calc(var(--border-radius) / 1.5);
  display: inline-block;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  transition: background-color var(--transition-speed-fast) ease,
              border-color var(--transition-speed-fast) ease,
              transform var(--transition-speed-fast) ease;
}
.incentive-banner:hover .discount-code-area,
.incentive-banner:focus-visible .discount-code-area {
  background-color: var(--card-bg-color); /* Solid on hover/focus of parent */
  border-color: color-mix(in srgb, var(--glow-primary) 80%, white 20%);
  transform: scale(1.02); /* Slight grow */
}

.discount-code-area span {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.7em;
  font-weight: 700;
  color: var(--glow-accent);
  letter-spacing: 1.5px;
  text-shadow: 0 0 5px rgba(var(--glow-accent-rgb),0.6); /* Slightly stronger shadow */
}

.discount-instruction {
  font-size: 0.85em;
  color: color-mix(in srgb, var(--text-color) 70%, transparent 30%);
  margin-top: 0.5rem;
  margin-bottom: 0; /* Removed bottom margin */
}


.actions-section {
  text-align: center;
  opacity: 0;
  animation: sectionFadeIn 0.7s 2s ease-out forwards;
}

.action-button {
  padding: 12px 25px;
  margin: 0.5rem 0.5rem; /* Adjusted margin for stacking */
  border: 1px solid transparent;
  border-radius: var(--border-radius); /* Consistent border-radius */
  text-decoration: none;
  font-size: 1em;
  font-weight: bold;
  font-family: 'Orbitron', sans-serif; /* Consistent font */
  cursor: pointer;
  transition: background-color var(--transition-speed-fast) ease,
              color var(--transition-speed-fast) ease,
              transform var(--transition-speed-fast) ease,
              box-shadow var(--transition-speed-fast) ease;
  transform: translateY(0); /* Initial state for transform */
}

.action-button.primary {
  background-color: var(--glow-primary);
  color: var(--card-bg-color);
  border-color: var(--glow-primary);
  box-shadow: 0 4px 8px rgba(var(--glow-primary-rgb), 0.2); /* Subtle initial shadow */
}
.action-button.primary:hover, .action-button.primary:focus-visible {
  background-color: color-mix(in srgb, var(--glow-primary) 80%, white 20%);
  color: var(--card-bg-color);
  transform: translateY(-3px) scale(1.02); /* Added scale */
  box-shadow: 0 7px 15px rgba(var(--glow-primary-rgb), 0.5); /* Enhanced shadow */
  border-color: color-mix(in srgb, var(--glow-primary) 70%, white 30%);
  outline: none;
}
.action-button.primary:focus-visible {
  outline: 2px solid var(--glow-primary);
  outline-offset: 2px;
}
.action-button.primary:active {
  transform: translateY(-1px) scale(0.98);
  background-color: color-mix(in srgb, var(--glow-primary) 70%, black 30%);
  box-shadow: 0 3px 6px rgba(var(--glow-primary-rgb), 0.3); /* Softer active shadow */
}

.action-button.secondary {
  background-color: color-mix(in srgb, var(--card-bg-color) 70%, white 10%); /* Theme consistent */
  color: var(--text-color);
  border-color: color-mix(in srgb, var(--text-color) 50%, transparent); /* Theme consistent */
  box-shadow: 0 4px 8px rgba(0,0,0, 0.2); /* Subtle initial shadow */
}
.action-button.secondary:hover, .action-button.secondary:focus-visible {
  background-color: color-mix(in srgb, var(--card-bg-color) 60%, white 15%); /* Theme consistent */
  color: var(--glow-accent); /* Highlight on hover */
  border-color: var(--glow-accent);
  transform: translateY(-3px) scale(1.02); /* Added scale */
  box-shadow: 0 7px 15px rgba(var(--glow-accent-rgb), 0.3); /* Enhanced shadow */
  outline: none;
}
.action-button.secondary:focus-visible {
  outline: 2px solid var(--glow-accent);
  outline-offset: 2px;
}
.action-button.secondary:active {
  transform: translateY(-1px) scale(0.98);
  background-color: color-mix(in srgb, var(--card-bg-color) 50%, black 50%);
  box-shadow: 0 3px 6px rgba(0,0,0, 0.3); /* Softer active shadow */
  color: var(--glow-accent);
}


/* Removing the old h1 selector as its properties are merged or replaced */

/* --- Responsive Adjustments --- */

@media (max-width: 768px) { /* Tablet */
  .purchase-success-container {
    margin: 1.5rem auto;
    padding: 1.5rem;
  }
  .header-section h1 {
    font-size: 2em;
  }
  .order-summary-section h2 {
    font-size: 1.4em;
  }
  .incentive-banner h4 {
    font-size: 1.3em;
  }
  .discount-code-area span {
    font-size: 1.5em;
  }
  .action-button {
    padding: 10px 20px;
    font-size: 0.95em;
  }
}

@media (max-width: 600px) { /* Mobile */
  .purchase-success-container {
    margin: 1rem; /* Remove auto for full width effect with padding */
    padding: 1rem;
  }
  .header-section h1 {
    font-size: 1.7em; 
  }
  .order-summary-section h2 {
    font-size: 1.3em;
  }
   .purchase-item-card { /* Was .order-summary-section li */
    padding: 0.75rem; 
  }
  .item-details {
    gap: 0.75rem;
  }
  .item-logo {
    width: 40px;
    height: 40px;
  }
  .item-name {
    font-size: 1em;
  }
  .item-meta {
    font-size: 0.85em;
  }
  .total-amount {
    font-size: 1.2em;
  }
  .incentive-banner h4 {
    font-size: 1.2em;
  }
  .discount-code-area span {
    font-size: 1.4em;
  }
  .discount-code-area {
    padding: 0.6rem 1rem;
  }
  .action-button {
    padding: 12px 15px; /* Adjusted padding for full width */
    font-size: 0.9em;
    display: block;
    width: 100%; 
    margin: 10px 0; /* Full width, so no auto margin */
  }
  .actions-section {
    padding: 0 10px; /* Add some padding to actions section if buttons are full width */
  }

  /* Key display responsive adjustments */
  .keys-header {
    font-size: 0.85em;
  }
  .key-item {
    font-size: 0.9em;
    padding: 0.4rem 0.6rem;
    letter-spacing: 0.5px;
  }
}

@media (max-width: 400px) { /* Small Mobile */
  .purchase-success-container {
    padding: 0.75rem;
    margin: 0.5rem;
  }
   .header-section {
    margin-bottom: 1rem;
  }
  .header-section h1 {
    font-size: 1.5em;
  }
  .header-section p {
    font-size: 0.9em;
    margin-bottom: 1rem;
  }
  .order-summary-section, .incentive-banner, .actions-section {
    padding: 1rem; /* Keep some padding for sections */
    margin-bottom: 1.5rem;
  }
  .purchase-item-card {
    padding: 0.5rem; /* Reduce padding on cards for very small screens */
  }
  .item-details {
    flex-direction: column; /* Stack logo and info */
    align-items: flex-start; /* Align to start when stacked */
    gap: 0.5rem; /* Reduce gap when stacked */
  }
  .item-logo {
    width: 35px; /* Smaller logo */
    height: 35px;
    margin-bottom: 0.5rem; /* Space below logo when stacked */
  }
  .item-name {
    font-size: 0.95em;
  }
  .item-meta span {
    display: block; /* Stack quantity and price */
    margin-right: 0;
    margin-bottom: 0.2rem;
  }
  .item-meta span:last-child {
    margin-bottom: 0;
  }
  .order-summary-section h2 {
    font-size: 1.2em;
  }
  .incentive-banner h4 {
    font-size: 1.1em;
  }
  .discount-code-area span {
    font-size: 1.2em;
  }
   .discount-code-area {
    padding: 0.5rem 0.8rem;
  }
  .incentive-banner p, .discount-instruction {
    font-size: 0.8em;
  }

  /* Key display responsive adjustments */
  .keys-display-area {
    padding: 0.5rem;
  }
  .keys-header {
    font-size: 0.8em;
  }
  .key-item {
    font-size: 0.8em; /* Adjusted for very small screens */
    padding: 0.3rem 0.5rem;
    letter-spacing: 0.25px;
  }
}

/* --- Styles for Generated Keys --- */
.keys-display-area {
  margin-top: 1rem;
  background-color: rgba(var(--glow-primary-rgb), 0.04);
  border-top: 1px solid rgba(var(--glow-primary-rgb), 0.15);
  padding: 0.75rem;
  border-radius: calc(var(--border-radius) / 1.5);
}

.keys-header {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9em;
  font-weight: 600;
  color: color-mix(in srgb, var(--text-color) 85%, white 15%);
  margin-bottom: 0.6rem;
}

.keys-display-area ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.key-item {
  font-family: 'Consolas', 'Menlo', 'Courier New', monospace;
  background-color: rgba(var(--card-bg-color), 0.6);
  border: 1px solid rgba(var(--glow-secondary-rgb), 0.3);
  color: var(--glow-accent);
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: calc(var(--border-radius) / 2.5);
  letter-spacing: 0.75px;
  font-size: 0.95em;
  transition: background-color var(--transition-speed-fast) ease,
              border-color var(--transition-speed-fast) ease,
              transform var(--transition-speed-fast) ease;
  overflow-wrap: break-word;
  word-break: break-all;
  cursor: default; /* Or 'text' if preferred for selection */
}

.key-item:hover {
  /* background-color: rgba(var(--glow-accent-rgb), 0.15); */ /* Commented out for theme-specific */
  /* border-color: var(--glow-accent); */ /* Commented out for theme-specific */
  transform: scale(1.01); /* Keep generic transform */
}

/* Minecraft Key Item Hover */
.purchase-item-card.game-minecraft .key-item:hover {
  background-color: rgba(var(--mc-glow-accent-rgb, 80, 200, 120), 0.25);
  border-color: var(--mc-glow-accent, #50c878);
  color: var(--mc-text-color-strong, #e0d8c0);
}

/* Fortnite Key Item Hover */
.purchase-item-card.game-fortnite .key-item:hover {
  background-color: rgba(var(--fn-glow-accent-rgb, 0, 255, 255), 0.2);
  border-color: var(--fn-glow-accent, #00ffff);
  color: var(--fn-text-color-strong, #f0e0ff);
}

/* Call of Duty Key Item Hover */
.purchase-item-card.game-cod .key-item:hover {
  background-color: rgba(var(--cod-glow-accent-rgb, 240, 230, 140), 0.25);
  border-color: var(--cod-glow-accent, #f0e68c);
  color: var(--cod-text-color-strong, #d0d8d0);
}

.keys-display-area ul .key-item:last-child {
  margin-bottom: 0;
}
</style>
