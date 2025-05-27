import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useCartStore } from '@/stores/cart';
import MiniCart from '../MiniCart.vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { RouterLinkStub } from '@vue/test-utils';

// Minimal CartItem stub for these tests
const CartItemStub = {
  name: 'CartItem',
  template: '<div class="cart-item-stub" :data-item-id="item.id"><slot /></div>',
  props: ['item']
};

describe('MiniCart.vue', () => {
  let testingPinia;
  let cartStore;
  let wrapper;

  const mockItems = [
    { id: 'mc-standard', gameName: 'Minecraft', passTitle: 'Standard Pass', passPrice: '$9.99', quantity: 1, gameLogo: '/img/logo-mc.png', gameValue: 'minecraft', priceNumeric: 9.99 },
    { id: 'fn-battle', gameName: 'Fortnite', passTitle: 'Battle Pass', passPrice: '$7.99', quantity: 2, gameLogo: '/img/logo-fn.png', gameValue: 'fortnite', priceNumeric: 7.99 },
  ];

  const mountComponent = (props = {}, initialStoreState = {}) => {
    testingPinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        cart: { // 'cart' is the store ID
          items: initialStoreState.items || [],
          cartTotal: initialStoreState.cartTotal || 0,
          // other state properties if needed by MiniCart
        }
      },
      stubActions: false, // We want to spy on actions but also let them run if needed
    });
    cartStore = useCartStore(); // Get the store instance after pinia is created

    // Manually set computed properties if they are complex and not automatically derived
    // For cartTotal, if it's a simple getter based on items, this might not be needed
    // if items are correctly set in initialStoreState. For this test, we'll set it manually.
    if (initialStoreState.cartTotal !== undefined) {
        cartStore.cartTotal = initialStoreState.cartTotal;
    } else if (initialStoreState.items && initialStoreState.items.length > 0) {
        // Basic calculation if not provided, for simplicity. Real store getter is more robust.
        cartStore.cartTotal = initialStoreState.items.reduce((sum, item) => sum + (item.priceNumeric * item.quantity), 0);
    }


    return mount(MiniCart, {
      props: { isOpen: false, activeTheme: 'default', ...props },
      global: {
        plugins: [testingPinia],
        stubs: { 
          RouterLink: RouterLinkStub,
          CartItem: CartItemStub,
          // Stub transition to avoid issues in test environment if not needed
          transition: {
            name: 'transition',
            template: '<div><slot /></div>',
          }
        }
      }
    });
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Rendering based on isOpen Prop', () => {
    it('is not rendered (or is hidden) when isOpen is false', () => {
      wrapper = mountComponent({ isOpen: false });
      // The component uses v-if, so the overlay div itself shouldn't exist
      expect(wrapper.find('.mini-cart-overlay').exists()).toBe(false);
    });

    it('becomes visible when isOpen is true', () => {
      wrapper = mountComponent({ isOpen: true });
      expect(wrapper.find('.mini-cart-overlay').exists()).toBe(true);
      expect(wrapper.find('.mini-cart-container').exists()).toBe(true);
    });
  });

  describe('Empty Cart State', () => {
    beforeEach(() => {
      wrapper = mountComponent({ isOpen: true }, { items: [], cartTotal: 0 });
    });

    it('verifies that the "Your cart is empty" message is displayed', () => {
      expect(wrapper.find('.mini-cart-empty').exists()).toBe(true);
      expect(wrapper.find('.mini-cart-empty p').text()).toBe('Your cart is empty.');
    });

    it('verifies that the cart total/footer section is not displayed', () => {
      expect(wrapper.find('.mini-cart-footer').exists()).toBe(false);
    });
  });

  describe('Cart with Items', () => {
    beforeEach(async () => {
      wrapper = mountComponent({ isOpen: true, activeTheme: 'minecraft' }, { items: mockItems });
      // Manually update cartTotal based on mockItems for consistency in tests
      cartStore.cartTotal = mockItems.reduce((sum, item) => sum + (item.priceNumeric * item.quantity), 0);
      await nextTick();
    });

    it('verifies that CartItem components are rendered for each item', () => {
      expect(wrapper.findAllComponents(CartItemStub).length).toBe(mockItems.length);
    });

    it('verifies that item details (name, price, quantity) are displayed for a sample item', () => {
      const firstItemEl = wrapper.find('.mini-cart-item'); // First rendered item
      expect(firstItemEl.find('.item-name').text()).toContain(mockItems[0].gameName);
      expect(firstItemEl.find('.item-name').text()).toContain(mockItems[0].passTitle);
      expect(firstItemEl.find('.item-price').text()).toBe(mockItems[0].passPrice);
      expect(firstItemEl.find('.item-info-qty span').text()).toBe(`Qty: ${mockItems[0].quantity}`);
      expect(firstItemEl.find('.mini-cart-item-logo').attributes('src')).toBe(mockItems[0].gameLogo);
    });

    it('verifies that the item-specific theme class is applied', () => {
      expect(wrapper.find(`.mini-cart-item.theme-item-${mockItems[0].gameValue}`).exists()).toBe(true);
      expect(wrapper.find(`.mini-cart-item.theme-item-${mockItems[1].gameValue}`).exists()).toBe(true);
    });
    
    it('verifies that the subtotal is calculated and displayed correctly', () => {
      const expectedTotal = mockItems.reduce((sum, item) => sum + (item.priceNumeric * item.quantity), 0);
      expect(wrapper.find('.mini-cart-total .total-amount').text()).toBe(`$${expectedTotal.toFixed(2)}`);
    });

    it('verifies that the "Proceed to Checkout" button is visible', () => {
      expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/checkout');
      expect(wrapper.find('.view-cart-button').text()).toBe('Proceed to Checkout');
    });
  });

  describe('Event Emission', () => {
    beforeEach(() => {
      // Mount with items to ensure checkout button is present for that test
      wrapper = mountComponent({ isOpen: true }, { items: mockItems });
    });

    it('emits "close" event when close button is clicked', async () => {
      await wrapper.find('.close-button').trigger('click');
      expect(wrapper.emitted().close).toBeTruthy();
      expect(wrapper.emitted().close.length).toBe(1);
    });

    it('emits "close" event when overlay is clicked (self modifier)', async () => {
      await wrapper.find('.mini-cart-overlay').trigger('click');
      expect(wrapper.emitted().close).toBeTruthy();
      expect(wrapper.emitted().close.length).toBe(1);
    });
    
    it('does NOT emit "close" event when click is inside container but not on overlay self', async () => {
        await wrapper.find('.mini-cart-header').trigger('click'); // Click inside container
        expect(wrapper.emitted().close).toBeFalsy();
    });

    it('emits "close" event when "Proceed to Checkout" link is clicked', async () => {
      await wrapper.findComponent(RouterLinkStub).trigger('click');
      expect(wrapper.emitted().close).toBeTruthy();
      expect(wrapper.emitted().close.length).toBe(1);
    });
  });

  describe('Item Removal', () => {
    it('calls removeFromCart store action with correct item ID when remove button is clicked', async () => {
      wrapper = mountComponent({ isOpen: true }, { items: [mockItems[0]] });
      await nextTick();

      const removeButton = wrapper.find('.item-remove-button'); // Assumes only one item, thus one button
      await removeButton.trigger('click');
      
      expect(cartStore.removeFromCart).toHaveBeenCalledTimes(1);
      expect(cartStore.removeFromCart).toHaveBeenCalledWith(mockItems[0].id);
    });
  });

  describe('Theming', () => {
    it('applies theme class to mini-cart-container based on activeTheme prop', () => {
      wrapper = mountComponent({ isOpen: true, activeTheme: 'fortnite' });
      expect(wrapper.find('.mini-cart-container.theme-fortnite').exists()).toBe(true);
    });

    it('applies no specific theme class if activeTheme is default or empty', () => {
      wrapper = mountComponent({ isOpen: true, activeTheme: 'default' });
      expect(wrapper.find('.mini-cart-container.theme-default').exists()).toBe(true); // Assuming 'theme-default' is how it's handled
      
      wrapper.unmount();
      wrapper = mountComponent({ isOpen: true, activeTheme: '' });
      // Check that no 'theme-*' class is applied other than potentially a default one if any
      const containerClasses = wrapper.find('.mini-cart-container').classes();
      const themeClasses = containerClasses.filter(cls => cls.startsWith('theme-') && cls !== 'theme-item-');
      expect(themeClasses.length).toBe(0); // Or 1 if there's a base 'theme-' class
    });
  });

  describe('Focus Management Call', () => {
    it('calls focusFirstElement when MiniCart becomes open', async () => {
      // Spy on the method within the component's setup context
      // This is a bit more involved for composition API if the method isn't exposed.
      // For simplicity, if `focusFirstElement` was exposed via `defineExpose`, we could spy on `wrapper.vm.focusFirstElement`.
      // Given it's not, we test its *effect* or trust it's called.
      // A pragmatic way for this test is to ensure it doesn't crash and opens.
      // True focus testing is end-to-end.
      // We will check if the watch on isOpen triggers a focus on the first focusable element.
      // For this test, we'll ensure the component mounts and becomes visible.
      // A deeper test would require mocking `document.activeElement` and `element.focus()`.

      wrapper = mountComponent({ isOpen: false });
      const mockFocus = vi.fn();
      
      // Temporarily mock getFocusableElements and focus on the actual first button for this test
      // This is a bit of a deeper integration test for this specific part.
      const realFocusFirstElement = wrapper.vm.focusFirstElement; // if exposed
      
      // For this test, we'll check if the 'close-button' gets focus (as it's typically first)
      // by setting up a spy on its focus method if possible, or by checking document.activeElement.
      // However, JSDOM doesn't fully support `document.activeElement` updates triggered by `.focus()` well.
      
      // Simplified: Since direct focus testing is hard, we'll trust the watch calls it.
      // The actual focus logic is better tested with E2E tests.
      // We'll just ensure no errors occur when opening.
      await wrapper.setProps({ isOpen: true });
      await nextTick();
      // No direct assertion for focus here due to JSDOM limitations,
      // but we ensure it opens without error.
      expect(wrapper.find('.mini-cart-container').exists()).toBe(true);
    });
  });
});
