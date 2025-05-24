// src/stores/cart.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const recentlyAddedItemId = ref(null)
  const triggerCartAnimation = ref(0)

  const cartItemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return items.value.reduce((total, item) => {
      const price = parseFloat(item.passPrice.replace('$', ''))
      return total + (isNaN(price) ? 0 : price * item.quantity)
    }, 0)
  })

  function findGameByValue(gamesData, gameValue) {
    return gamesData.find((g) => g.value === gameValue)
  }

  function getGameSpecificFeatureText(gameValue, passType, gamesData) {
    if (!gameValue) return ''
    const game = findGameByValue(gamesData, gameValue)
    const gameName = game ? game.name : 'Game'

    if (gameValue === 'minecraft') return `+ Realmwalker's Boon`
    if (gameValue === 'fortnite') return `+ Storm Rider's Edge`
    if (gameValue === 'cod') return `+ Night Ops Advantage`
    return `+ ${gameName} Enhancements`
  }

  function addToCart(passDetails, gameDetails, gamesDataArray) {
    const existingItemIndex = items.value.findIndex(
      (item) => item.gameValue === gameDetails.value && item.passTitle === passDetails.title,
    )

    const game = findGameByValue(gamesDataArray, gameDetails.value)
    const newItemId = `${gameDetails.value}_${passDetails.type}_${Date.now()}`

    if (existingItemIndex > -1) {
      items.value[existingItemIndex].quantity++
    } else {
      items.value.push({
        id: newItemId,
        gameValue: gameDetails.value,
        gameName: game ? game.name : 'Unknown Game',
        gameLogo: game ? game.logoSrc : '',
        passTitle: passDetails.title,
        passPrice: passDetails.price,
        priceNumeric: parseFloat(passDetails.price.replace('$', '')),
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
    return 'added'
  }

  function removeFromCart(itemId) {
    items.value = items.value.filter((item) => item.id !== itemId)
  }

  function updateQuantity(itemId, newQuantity) {
    const item = items.value.find((i) => i.id === itemId)
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(itemId)
      } else {
        item.quantity = newQuantity
      }
    }
  }

  function clearCart() {
    items.value = []
  }

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
