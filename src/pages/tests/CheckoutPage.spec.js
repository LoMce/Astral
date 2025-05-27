import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useCartStore } from '@/stores/cart';
import CheckoutPage from '../CheckoutPage.vue'; // Adjusted path
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { RouterLinkStub } from '@vue/test-utils';

// Minimal CartItem stub
const CartItemStub = {
  name: 'CartItem',
  template: '<div class="cart-item-stub" :data-item-id="item.id">Item: {{ item.gameName }}</div>',
  props: ['item']
};

// Mock vue-router
const mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

describe('CheckoutPage.vue', () => {
  let testingPinia;
  let cartStore;
  let wrapper;
  let consoleLogSpy;

  const mockCartItems = [
    { id: 'mc-standard', gameName: 'Minecraft', passTitle: 'Standard Pass', passPrice: '$9.99', quantity: 1, gameLogo: '/img/logo-mc.png', gameValue: 'minecraft', priceNumeric: 9.99 },
    { id: 'fn-battle', gameName: 'Fortnite', passTitle: 'Battle Pass', passPrice: '$7.99', quantity: 2, gameLogo: '/img/logo-fn.png', gameValue: 'fortnite', priceNumeric: 7.99 },
  ];

  const mountComponent = (initialStoreState = {}, props = {}) => {
    testingPinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        cart: {
          items: initialStoreState.items || [],
          cartTotal: initialStoreState.cartTotal || 0,
        }
      },
      stubActions: false,
    });
    cartStore = useCartStore();

    // Manually set cartTotal if items are provided and cartTotal isn't explicitly
    if (initialStoreState.items && initialStoreState.items.length > 0 && initialStoreState.cartTotal === undefined) {
        cartStore.cartTotal = initialStoreState.items.reduce((sum, item) => sum + (item.priceNumeric * item.quantity), 0);
    }


    return mount(CheckoutPage, {
      props,
      global: {
        plugins: [testingPinia],
        stubs: {
          RouterLink: RouterLinkStub,
          CartItem: CartItemStub,
        }
      }
    });
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockRouter.push.mockClear();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // Spy and suppress output
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    consoleLogSpy.mockRestore(); // Restore original console.log
  });

  describe('Empty Cart State', () => {
    beforeEach(() => {
      wrapper = mountComponent({ items: [], cartTotal: 0 });
    });

    it('verifies "Your cart is empty" message and "Continue Shopping" link', () => {
      expect(wrapper.find('.empty-cart-message-checkout p').text()).toBe('Your cart is empty. Add some items to proceed!');
      const continueShoppingLink = wrapper.findComponent(RouterLinkStub);
      expect(continueShoppingLink.exists()).toBe(true);
      expect(continueShoppingLink.props().to).toBe('/');
      expect(continueShoppingLink.text()).toBe('Continue Shopping');
    });

    it('verifies "Place Order" button is disabled', () => {
      const placeOrderButton = wrapper.find('.place-order-button');
      expect(placeOrderButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Cart with Items', () => {
    beforeEach(async () => {
      wrapper = mountComponent({ items: mockCartItems });
      await nextTick();
    });

    it('renders CartItem components in the order summary', () => {
      const cartItemStubs = wrapper.findAllComponents(CartItemStub);
      expect(cartItemStubs.length).toBe(mockCartItems.length);
      expect(cartItemStubs[0].props().item.id).toBe(mockCartItems[0].id);
    });

    it('displays the total amount correctly', () => {
      const expectedTotal = mockCartItems.reduce((sum, item) => sum + (item.priceNumeric * item.quantity), 0);
      expect(wrapper.find('.summary-total-checkout .total-amount').text()).toBe(`$${expectedTotal.toFixed(2)}`);
    });

    it('shows the email form and payment section', () => {
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('.payment-methods').exists()).toBe(true);
    });

    it('verifies "Place Order" button is enabled', () => {
      const placeOrderButton = wrapper.find('.place-order-button');
      expect(placeOrderButton.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Form Interaction & Submission', () => {
    it('updates customerDetails.email when typing in the email field', async () => {
      wrapper = mountComponent({ items: mockCartItems });
      const emailInput = wrapper.find('input[type="email"]');
      await emailInput.setValue('test@example.com');
      expect(wrapper.vm.customerDetails.email).toBe('test@example.com');
    });

    it('shows validation error for empty email on blur and submit, and sets aria-invalid', async () => {
      wrapper = mountComponent({ items: mockCartItems });
      const emailInput = wrapper.find('input[type="email"]');
      
      // Test on blur
      await emailInput.trigger('blur');
      await nextTick();
      expect(wrapper.find('.error-message').text()).toBe('Email address is required.');
      expect(emailInput.attributes('aria-invalid')).toBe('true');

      // Test on submit
      await wrapper.find('form.checkout-form').trigger('submit.prevent');
      await nextTick();
      expect(wrapper.find('.error-message').text()).toBe('Email address is required.');
      expect(emailInput.attributes('aria-invalid')).toBe('true');
    });

    it('shows validation error for invalid email format and sets aria-invalid', async () => {
      wrapper = mountComponent({ items: mockCartItems });
      const emailInput = wrapper.find('input[type="email"]');
      await emailInput.setValue('invalid-email');
      await emailInput.trigger('blur');
      await nextTick();
      expect(wrapper.find('.error-message').text()).toBe('Please enter a valid email address.');
      expect(emailInput.attributes('aria-invalid')).toBe('true');
    });
    
    it('clears email error on input', async () => {
        wrapper = mountComponent({ items: mockCartItems });
        const emailInput = wrapper.find('input[type="email"]');
        await emailInput.trigger('blur'); // Trigger error
        expect(wrapper.find('.error-message').exists()).toBe(true);
        
        await emailInput.setValue('t'); // Start typing
        await nextTick();
        expect(wrapper.find('.error-message').exists()).toBe(false);
        expect(emailInput.attributes('aria-invalid')).toBe('false'); // Or undefined, depending on how cleared
    });

    it('handles form submission with an empty cart - navigates, no cart clear', async () => {
      wrapper = mountComponent({ items: [], cartTotal: 0 });
      await wrapper.find('input[type="email"]').setValue('test@example.com'); // Valid email to pass that check
      
      await wrapper.find('form.checkout-form').trigger('submit.prevent');
      await nextTick();

      expect(cartStore.clearCart).not.toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Your cart is empty'));
    });

    it('handles form submission correctly with items and valid email', async () => {
      wrapper = mountComponent({ items: mockCartItems });
      const email = 'test@example.com';
      await wrapper.find('input[type="email"]').setValue(email);
      
      await wrapper.find('form.checkout-form').trigger('submit.prevent');
      await nextTick();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Simulating order placement...'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(`Email: ${email}`));
      expect(cartStore.clearCart).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('prevents submission and does not clear cart or navigate if email is invalid', async () => {
      wrapper = mountComponent({ items: mockCartItems });
      await wrapper.find('input[type="email"]').setValue('invalid-email');
      
      await wrapper.find('form.checkout-form').trigger('submit.prevent');
      await nextTick();

      expect(wrapper.find('.error-message').text()).toBe('Please enter a valid email address.');
      expect(cartStore.clearCart).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Payment Button Placeholders', () => {
    beforeEach(() => {
      wrapper = mountComponent({ items: mockCartItems });
    });

    it('renders Stripe and Crypto payment buttons', () => {
      expect(wrapper.find('.payment-button.stripe-button').exists()).toBe(true);
      expect(wrapper.find('.payment-button.stripe-button').text()).toBe('Pay with Stripe');
      expect(wrapper.find('.payment-button.crypto-button').exists()).toBe(true);
      expect(wrapper.find('.payment-button.crypto-button').text()).toBe('Pay with Crypto');
    });

    it('does not cause errors when payment buttons are clicked', async () => {
      // Simply ensure clicking doesn't throw an error
      const stripeButton = wrapper.find('.payment-button.stripe-button');
      const cryptoButton = wrapper.find('.payment-button.crypto-button');
      
      await stripeButton.trigger('click'); // No specific outcome other than not erroring
      await cryptoButton.trigger('click');
      
      // No explicit assertion needed if the goal is just to check for lack of errors.
      // If there were methods called, we'd spy on them.
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
