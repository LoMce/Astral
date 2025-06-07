import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../cart';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gamesData } from '../../data/gamesData.js'; // Import gamesData

// Mock gamesDataArray as it's used by addToCart and other internal functions
// const mockGamesDataArray = [ ... removed ... ];

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock any external dependencies if necessary, e.g., localStorage for persistence (not used in this store directly)
  });

  it('initializes with empty items, zero item count, and zero total', () => {
    const cartStore = useCartStore();
    expect(cartStore.items).toEqual([]);
    expect(cartStore.cartItemCount).toBe(0);
    expect(cartStore.cartTotal).toBe(0);
    expect(cartStore.recentlyAddedItemId).toBeNull();
    expect(cartStore.triggerCartAnimation).toBe(0);
  });

  describe('addToCart Action', () => {
    it('adds a new item to the cart correctly', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };

      cartStore.addToCart(passDetails, gameDetails, gamesData); // Use gamesData

      expect(cartStore.items.length).toBe(1);
      const item = cartStore.items[0];
      expect(item.gameValue).toBe('minecraft');
      expect(item.passTitle).toBe('Standard Pass');
      expect(item.passPrice).toBe('$9.99');
      expect(item.quantity).toBe(1);
      expect(item.priceNumeric).toBe(9.99);
      expect(item.gameName).toBe('Minecraft');
      // Note: The logoSrc in gamesData is a base64 SVG, not '/img/logo-mc.png'. This test might need adjustment if it's strict about this exact path.
      // For now, we assume the primary goal is to replace mockGamesDataArray with gamesData.
      // The actual logoSrc from gamesData will be used by the function.
      expect(item.gameLogo).toBe(gamesData.find(g => g.value === 'minecraft').logoSrc);
      expect(item.gameSpecificFeature).toBe("+ Realmwalker's Boon");
      expect(item.id).toBe('minecraft-standard'); // Check generated ID format

      expect(cartStore.cartItemCount).toBe(1);
      expect(cartStore.cartTotal).toBe(9.99);
      expect(cartStore.recentlyAddedItemId).toBe(item.id);
      expect(cartStore.triggerCartAnimation).toBe(1);
    });

    it('increments quantity if the same item is added again', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };

      cartStore.addToCart(passDetails, gameDetails, gamesData); // First add
      const initialAnimationTrigger = cartStore.triggerCartAnimation;
      cartStore.addToCart(passDetails, gameDetails, gamesData); // Second add

      expect(cartStore.items.length).toBe(1);
      expect(cartStore.items[0].quantity).toBe(2);
      expect(cartStore.cartItemCount).toBe(2); // Total quantity
      expect(cartStore.cartTotal).toBe(9.99 * 2);
      expect(cartStore.recentlyAddedItemId).toBe(cartStore.items[0].id);
      expect(cartStore.triggerCartAnimation).toBe(initialAnimationTrigger + 1);
    });

    it('adds a different item correctly', () => {
        const cartStore = useCartStore();
        const passDetailsMc = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
        const gameDetailsMc = { value: 'minecraft', name: 'Minecraft' };
        const passDetailsFn = { id: 'fn-battle', title: 'Battle Pass', price: '$7.99', type: 'standard' };
        const gameDetailsFn = { value: 'fortnite', name: 'Fortnite' };

        cartStore.addToCart(passDetailsMc, gameDetailsMc, gamesData);
        cartStore.addToCart(passDetailsFn, gameDetailsFn, gamesData);

        expect(cartStore.items.length).toBe(2);
        expect(cartStore.cartItemCount).toBe(2);
        expect(cartStore.cartTotal).toBe(9.99 + 7.99);
        expect(cartStore.recentlyAddedItemId).toBe('fortnite-standard'); // ID of the last added item
    });
  });

  describe('removeFromCart Action', () => {
    it('removes an item from the cart', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };
      cartStore.addToCart(passDetails, gameDetails, gamesData);
      
      const itemIdToRemove = cartStore.items[0].id;
      cartStore.removeFromCart(itemIdToRemove);

      expect(cartStore.items.length).toBe(0);
      expect(cartStore.cartItemCount).toBe(0);
      expect(cartStore.cartTotal).toBe(0);
    });

    it('does nothing if trying to remove a non-existent item', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };
      cartStore.addToCart(passDetails, gameDetails, gamesData);

      cartStore.removeFromCart('non-existent-id');

      expect(cartStore.items.length).toBe(1);
      expect(cartStore.cartItemCount).toBe(1);
      expect(cartStore.cartTotal).toBe(9.99);
    });
  });

  describe('updateQuantity Action', () => {
    it('increases an item quantity', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };
      cartStore.addToCart(passDetails, gameDetails, gamesData);
      const itemId = cartStore.items[0].id;

      cartStore.updateQuantity(itemId, 3);
      expect(cartStore.items[0].quantity).toBe(3);
      expect(cartStore.cartItemCount).toBe(3);
      expect(cartStore.cartTotal).toBe(9.99 * 3);
    });

    it('decreases an item quantity', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };
      cartStore.addToCart(passDetails, gameDetails, gamesData);
      cartStore.updateQuantity(cartStore.items[0].id, 3); // Set initial to 3
      
      const itemId = cartStore.items[0].id;
      cartStore.updateQuantity(itemId, 1);
      expect(cartStore.items[0].quantity).toBe(1);
      expect(cartStore.cartItemCount).toBe(1);
      expect(cartStore.cartTotal).toBe(9.99);
    });

    it('removes item if quantity is updated to 0', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };
      cartStore.addToCart(passDetails, gameDetails, gamesData);
      const itemId = cartStore.items[0].id;

      cartStore.updateQuantity(itemId, 0);
      expect(cartStore.items.length).toBe(0);
      expect(cartStore.cartItemCount).toBe(0);
      expect(cartStore.cartTotal).toBe(0);
    });

    it('removes item if quantity is updated to less than 0', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };
      cartStore.addToCart(passDetails, gameDetails, gamesData);
      const itemId = cartStore.items[0].id;

      cartStore.updateQuantity(itemId, -1);
      expect(cartStore.items.length).toBe(0);
    });

    it('does nothing if item ID for quantity update does not exist', () => {
        const cartStore = useCartStore();
        cartStore.updateQuantity('non-existent-id', 5);
        expect(cartStore.items.length).toBe(0);
    });
  });

  describe('clearCart Action', () => {
    it('empties items and resets count and total', () => {
      const cartStore = useCartStore();
      const passDetailsMc = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetailsMc = { value: 'minecraft', name: 'Minecraft' };
      const passDetailsFn = { id: 'fn-battle', title: 'Battle Pass', price: '$7.99', type: 'standard' };
      const gameDetailsFn = { value: 'fortnite', name: 'Fortnite' };
      cartStore.addToCart(passDetailsMc, gameDetailsMc, gamesData);
      cartStore.addToCart(passDetailsFn, gameDetailsFn, gamesData);

      cartStore.clearCart();
      expect(cartStore.items).toEqual([]);
      expect(cartStore.cartItemCount).toBe(0);
      expect(cartStore.cartTotal).toBe(0);
    });
  });

  describe('clearRecentlyAdded Action', () => {
    it('nullifies recentlyAddedItemId', () => {
      const cartStore = useCartStore();
      const passDetails = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails = { value: 'minecraft', name: 'Minecraft' };
      cartStore.addToCart(passDetails, gameDetails, gamesData);
      expect(cartStore.recentlyAddedItemId).not.toBeNull();

      cartStore.clearRecentlyAdded();
      expect(cartStore.recentlyAddedItemId).toBeNull();
    });
  });
  
  describe('Computed Properties', () => {
    it('cartItemCount reflects total quantity of items', () => {
        const cartStore = useCartStore();
        const passMc = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
        const gameMc = { value: 'minecraft', name: 'Minecraft' };
        const passFn = { id: 'fn-battle', title: 'Battle Pass', price: '$7.99', type: 'standard' };
        const gameFn = { value: 'fortnite', name: 'Fortnite' };

        cartStore.addToCart(passMc, gameMc, gamesData); // qty 1
        cartStore.addToCart(passMc, gameMc, gamesData); // qty 2 for mc-standard
        cartStore.addToCart(passFn, gameFn, gamesData); // qty 1 for fn-battle
        
        expect(cartStore.cartItemCount).toBe(3); // 2 + 1
    });

    it('cartTotal sums prices of all items considering quantities', () => {
        const cartStore = useCartStore();
        const passMc = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
        const gameMc = { value: 'minecraft', name: 'Minecraft' };
        const passFn = { id: 'fn-battle', title: 'Battle Pass', price: '$7.99', type: 'standard' };
        const gameFn = { value: 'fortnite', name: 'Fortnite' };

        cartStore.addToCart(passMc, gameMc, gamesData);
        cartStore.addToCart(passMc, gameMc, gamesData);
        cartStore.addToCart(passFn, gameFn, gamesData);
        
        expect(cartStore.cartTotal).toBe((9.99 * 2) + 7.99);
    });
  });

  describe('Defensive cartTotal Calculation', () => {
    it('calculates total correctly with one item having a malformed price string', () => {
      const cartStore = useCartStore();
      const passDetails1 = { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard' };
      const gameDetails1 = { value: 'minecraft', name: 'Minecraft' };
      // This item has an invalid price
      const passDetails2 = { id: 'fn-corrupted', title: 'Corrupted Pass', price: '$invalidPrice', type: 'corrupted' };
      const gameDetails2 = { value: 'fortnite', name: 'Fortnite' };
      const passDetails3 = { id: 'cod-blackcell', title: 'BlackCell Pass', price: '$29.99', type: 'premium' };
      const gameDetails3 = { value: 'cod', name: 'Call of Duty'};

      cartStore.addToCart(passDetails1, gameDetails1, gamesData);
      cartStore.addToCart(passDetails2, gameDetails2, gamesData); // Malformed price
      cartStore.addToCart(passDetails3, gameDetails3, gamesData);
      
      expect(cartStore.items.length).toBe(3);
      expect(cartStore.items.find(item => item.id === 'fortnite-corrupted').priceNumeric).toBe(0); // Check that priceNumeric defaults to 0
      expect(cartStore.cartTotal).toBe(9.99 + 29.99); // Only valid prices are counted
    });

    it('calculates total as 0 if all items have malformed prices', () => {
        const cartStore = useCartStore();
        const passDetails1 = { id: 'mc-invalid', title: 'Invalid Pass MC', price: 'Free ninety nine', type: 'standard' };
        const gameDetails1 = { value: 'minecraft', name: 'Minecraft' };
        const passDetails2 = { id: 'fn-invalid', title: 'Invalid Pass FN', price: 'Twenty Dollars', type: 'standard' };
        const gameDetails2 = { value: 'fortnite', name: 'Fortnite' };

        cartStore.addToCart(passDetails1, gameDetails1, gamesData);
        cartStore.addToCart(passDetails2, gameDetails2, gamesData);

        expect(cartStore.cartTotal).toBe(0);
    });
  });
});
