// src/stores/cart.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// --- Constants ---
const CURRENCY_SYMBOL = '$';
const DEFAULT_GAME_NAME = 'Unknown Game';
const DEFAULT_GAME_LOGO = '';
const ADD_TO_CART_STATUS_ADDED = 'added';

export const useCartStore = defineStore('cart', () => {
  const CART_STORAGE_KEY = 'myThematicAppCartItems';

  /** @type {import('vue').Ref<Array<Object>>} The array of items currently in the cart. */
  const items = ref([])

  // Load from localStorage on Initialization
  const storedItems = localStorage.getItem(CART_STORAGE_KEY);
  if (storedItems) {
    try {
      const parsedItems = JSON.parse(storedItems);
      // Basic validation: check if it's an array
      if (Array.isArray(parsedItems)) {
        items.value = parsedItems;
      } else {
        console.warn('Invalid cart data found in localStorage, ignoring.');
        localStorage.removeItem(CART_STORAGE_KEY); // Clear invalid data
      }
    } catch (error) {
      console.error('Error parsing cart items from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY); // Clear corrupted data
    }
  }

  /** @type {import('vue').Ref<String|null>} The ID of the most recently added cart item. */
  const recentlyAddedItemId = ref(null)
  /** @type {import('vue').Ref<Number>} A counter that increments to trigger animations, e.g., on the cart icon. */
  const triggerCartAnimation = ref(0)

  /**
   * Computed property that calculates the total number of items in the cart,
   * considering the quantity of each item.
   * @returns {Number} The total count of all item quantities.
   */
  const cartItemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0)
  })

  /**
   * Computed property that calculates the total price of all items in the cart.
   * It safely parses the `passPrice` string to a number.
   * @returns {Number} The total price of all items.
   */
  const cartTotal = computed(() => {
    return items.value.reduce((total, item) => {
      const price = parseFloat(item.passPrice.replace(CURRENCY_SYMBOL, ''))
      // Ensure price is a number; otherwise, add 0 for this item.
      return total + (isNaN(price) ? 0 : price * item.quantity)
    }, 0)
  })

  /**
   * Finds a game object from the provided games data array by its value.
   * @param {Array<Object>} gamesData - The array of available game data.
   * @param {String} gameValue - The value of the game to find.
   * @returns {Object|undefined} The found game object, or undefined.
   */
  function findGameByValue(gamesData, gameValue) {
    return gamesData.find((g) => g.value === gameValue)
  }

  /**
   * Generates a game-specific feature text string based on game value and pass type.
   * This is a placeholder for potentially more complex logic.
   * @param {String} gameValue - The value of the game (e.g., 'minecraft').
   * @param {String} passType - The type of the pass (e.g., 'standard', 'deluxe').
   * @param {Array<Object>} gamesData - The array of available game data.
   * @returns {String} The game-specific feature text.
   */
  function getGameSpecificFeatureText(gameValue, passType, gamesData) {
    if (!gameValue) return ''
    const game = findGameByValue(gamesData, gameValue)
    const gameName = game ? game.name : 'Game' // Fallback to generic 'Game'

    // Example specific texts (can be expanded)
    if (gameValue === 'minecraft') return `+ Realmwalker's Boon`
    if (gameValue === 'fortnite') return `+ Storm Rider's Edge`
    if (gameValue === 'cod') return `+ Night Ops Advantage`
    return `+ ${gameName} Enhancements` // Generic fallback
  }

  /**
   * Adds a game pass to the cart or increments its quantity if it already exists.
   * @param {Object} passDetails - Details of the pass to add (e.g., id, title, price, type).
   * @param {Object} gameDetails - Details of the game the pass belongs to (e.g., value, name).
   * @param {Array<Object>} gamesDataArray - The global array of all available games data, used to enrich cart item.
   * @returns {String} Status of the addition, e.g., 'added'.
   */
  function saveItemsToLocalStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value));
  }

  function addToCart(passDetails, gameDetails, gamesDataArray) {
    const existingItemIndex = items.value.findIndex(
      (item) => item.gameValue === gameDetails.value && item.passTitle === passDetails.title,
    )

    const game = findGameByValue(gamesDataArray, gameDetails.value)
    // Generate a more unique ID format, including a timestamp for guaranteed uniqueness if added rapidly
    const newItemId = `${gameDetails.value}_${passDetails.type}_${Date.now()}`

    if (existingItemIndex > -1) {
      items.value[existingItemIndex].quantity++
    } else {
      items.value.push({
        id: newItemId, // Use the more unique ID
        gameValue: gameDetails.value,
        gameName: game ? game.name : DEFAULT_GAME_NAME,
        gameLogo: game ? game.logoSrc : DEFAULT_GAME_LOGO,
        passTitle: passDetails.title,
        passPrice: passDetails.price,
        priceNumeric: parseFloat(passDetails.price.replace(CURRENCY_SYMBOL, '')),
        gameSpecificFeature: getGameSpecificFeatureText(
          gameDetails.value,
          passDetails.type,
          gamesDataArray,
        ),
        quantity: 1,
      })
    }

    recentlyAddedItemId.value =
      existingItemIndex > -1 ? items.value[existingItemIndex].id : newItemId
    triggerCartAnimation.value++
    saveItemsToLocalStorage(); // Save to localStorage
    return ADD_TO_CART_STATUS_ADDED;
  }

  /**
   * Removes an item from the cart by its ID.
   * @param {String} itemId - The ID of the item to remove.
   */
  function removeFromCart(itemId) {
    items.value = items.value.filter((item) => item.id !== itemId)
    saveItemsToLocalStorage(); // Save to localStorage
  }

  /**
   * Updates the quantity of a specific item in the cart.
   * If the new quantity is less than or equal to 0, the item is removed.
   * @param {String} itemId - The ID of the item to update.
   * @param {Number} newQuantity - The new quantity for the item.
   */
  function updateQuantity(itemId, newQuantity) {
    const item = items.value.find((i) => i.id === itemId)
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(itemId) // removeFromCart already calls saveItemsToLocalStorage
      } else {
        item.quantity = newQuantity
        saveItemsToLocalStorage(); // Save to localStorage
      }
    }
  }

  /**
   * Clears all items from the cart.
   */
  function clearCart() {
    items.value = []
    // Optionally reset other cart-related state like recentlyAddedItemId or triggerCartAnimation if needed
    // recentlyAddedItemId.value = null;
    // triggerCartAnimation.value = 0; // Or handle as appropriate for animation logic
    saveItemsToLocalStorage(); // Save to localStorage
  }

  /**
   * Clears the `recentlyAddedItemId` state.
   */
  function clearRecentlyAdded() {
    recentlyAddedItemId.value = null
  }

  return {
    items,
    cartItemCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    recentlyAddedItemId,
    clearRecentlyAdded,
    triggerCartAnimation,
  }
})
