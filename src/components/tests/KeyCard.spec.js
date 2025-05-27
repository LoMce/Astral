import { mount } from '@vue/test-utils';
import KeyCard from '../KeyCard.vue';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { nextTick } from 'vue';

describe('KeyCard.vue', () => {
  let wrapper;

  const defaultProps = {
    title: 'Standard Pass',
    price: '$9.99',
    features: ['Feature 1', 'Feature 2'],
    isBestValue: false,
    buyButtonText: 'Buy Now',
    gameSpecificFeature: '',
    gameLogo: 'logo.png', // Though not directly rendered by KeyCard itself, used in watch
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Basic Rendering', () => {
    it('renders correctly with all props', () => {
      wrapper = mount(KeyCard, {
        props: {
          ...defaultProps,
          gameSpecificFeature: 'Exclusive Bonus!',
        },
      });
      expect(wrapper.find('.key-card-title').text()).toBe('Standard Pass');
      expect(wrapper.find('.key-card-price').text()).toBe('$9.99');
      const features = wrapper.findAll('.key-card-features li');
      expect(features.length).toBe(3); // 2 general + 1 game specific
      expect(features[0].text()).toBe('Feature 1');
      expect(features[1].text()).toBe('Feature 2');
      expect(features[2].text()).toBe('Exclusive Bonus!');
      expect(wrapper.find('.buy-button').text()).toBe('Buy Now');
      expect(wrapper.find('.key-card.best-value').exists()).toBe(false);
    });

    it('renders "RECOMMENDED" badge if isBestValue is true', () => {
      wrapper = mount(KeyCard, {
        props: { ...defaultProps, isBestValue: true },
      });
      expect(wrapper.find('.key-card.best-value').exists()).toBe(true);
      expect(wrapper.find('.key-card.best-value::before').exists()).toBe(false); // Pseudo-element, test via class
      // Note: Testing ::before content is tricky in JSDOM. We check for the class that applies it.
    });
  });

  describe('Button Interaction & Event Emission', () => {
    let purchaseCallbackArg;

    beforeEach(() => {
      purchaseCallbackArg = null; // Reset before each test
      wrapper = mount(KeyCard, {
        props: defaultProps,
        global: {
          // Mocking the emit function to capture its arguments
          mocks: {
            $emit: (event, ...args) => {
              if (event === 'purchase') {
                purchaseCallbackArg = args[0]; // Capture the callback function
              }
            }
          }
        }
      });
    });

    it('emits "purchase" event with a callback function and button ref on buy button click', async () => {
      const spyEmit = vi.spyOn(wrapper.vm, '$emit');
      await wrapper.find('.buy-button').trigger('click');
      
      expect(spyEmit).toHaveBeenCalledOnce();
      expect(spyEmit).toHaveBeenCalledWith('purchase', expect.any(Function), wrapper.vm.buyButtonRef);
    });
    
    it('updates button state to "Adding..." when purchase is initiated', async () => {
      await wrapper.find('.buy-button').trigger('click');
      // At this point, isAdding is true internally
      expect(wrapper.vm.isAdding).toBe(true);
      expect(wrapper.find('.buy-button').text()).toBe('Adding...');
      expect(wrapper.find('.buy-button').attributes('disabled')).toBeDefined();
      expect(wrapper.vm.statusMessage).toBe('Adding to cart.');
    });

    it('updates button state to "Added ✔", shows particles, and sets ARIA message on "added" status', async () => {
      await wrapper.find('.buy-button').trigger('click'); // This sets up purchaseCallbackArg

      expect(purchaseCallbackArg).toBeTypeOf('function');
      if (purchaseCallbackArg) {
        purchaseCallbackArg('added'); // Simulate parent invoking the callback
      }
      await nextTick();

      expect(wrapper.vm.isAdding).toBe(false);
      expect(wrapper.vm.justAdded).toBe(true);
      expect(wrapper.find('.buy-button').text()).toBe('Added ✔');
      expect(wrapper.vm.showParticles).toBe(true);
      expect(wrapper.find('.particle-burst').exists()).toBe(true);
      expect(wrapper.vm.statusMessage).toBe('Item successfully added to cart.');
    });

    it('updates button state to "In Cart" and sets ARIA message on "already_in_cart" status', async () => {
      await wrapper.find('.buy-button').trigger('click');
      
      expect(purchaseCallbackArg).toBeTypeOf('function');
      if (purchaseCallbackArg) {
        purchaseCallbackArg('already_in_cart');
      }
      await nextTick();

      expect(wrapper.vm.isAdding).toBe(false);
      expect(wrapper.vm.alreadyExists).toBe(true);
      expect(wrapper.find('.buy-button').text()).toBe('In Cart');
      expect(wrapper.vm.statusMessage).toBe('Item is already in your cart.');
    });

    it('resets "Added ✔" state after timeout', async () => {
      vi.useFakeTimers();
      await wrapper.find('.buy-button').trigger('click');
      if (purchaseCallbackArg) purchaseCallbackArg('added');
      await nextTick();

      expect(wrapper.vm.justAdded).toBe(true);
      expect(wrapper.find('.buy-button').text()).toBe('Added ✔');
      
      vi.advanceTimersByTime(1500);
      await nextTick();
      
      expect(wrapper.vm.justAdded).toBe(false);
      expect(wrapper.find('.buy-button').text()).toBe(defaultProps.buyButtonText);
      expect(wrapper.vm.statusMessage).toBe('');
      vi.useRealTimers();
    });
  });

  describe('Card Click Interaction', () => {
    it('triggers purchase on card click if button is not disabled', async () => {
      const spyTriggerPurchase = vi.spyOn(wrapper.vm, 'triggerPurchase');
      await wrapper.find('.key-card').trigger('click');
      expect(spyTriggerPurchase).toHaveBeenCalled();
    });

    it('does not trigger purchase on card click if button is in "isAdding" state', async () => {
      const spyTriggerPurchase = vi.spyOn(wrapper.vm, 'triggerPurchase');
      wrapper.vm.isAdding = true; // Manually set state
      await nextTick();
      
      await wrapper.find('.key-card').trigger('click');
      expect(spyTriggerPurchase).not.toHaveBeenCalled(); // Should not be called because of the guard
    });
  });
  
  describe('Particle Burst', () => {
    it('sets particleBurstPosition when particles are triggered', async () => {
      // Mock getBoundingClientRect for button and card
      const mockButtonRect = { top: 100, left: 100, width: 50, height: 30 };
      const mockCardRect = { top: 50, left: 50 };
      
      wrapper.vm.buyButtonRef = { // Mock the button ref
        getBoundingClientRect: () => mockButtonRect,
        closest: () => ({ getBoundingClientRect: () => mockCardRect })
      };
      
      wrapper.vm.triggerParticleBurst(); // Call manually as the emit path is complex
      await nextTick();

      expect(wrapper.vm.showParticles).toBe(true);
      expect(wrapper.vm.particleBurstPosition.top).toBe(`${100 - 50 + 30 / 2}px`); // 50 + 15 = 65px
      expect(wrapper.vm.particleBurstPosition.left).toBe(`${100 - 50 + 50 / 2}px`); // 50 + 25 = 75px
    });
  });

  describe('State Reset on Prop Change', () => {
    it('resets button states and ARIA message when gameSpecificFeature prop changes', async () => {
      wrapper = mount(KeyCard, { props: defaultProps });
      
      // Set some states manually
      wrapper.vm.isAdding = true;
      wrapper.vm.justAdded = true;
      wrapper.vm.alreadyExists = true;
      wrapper.vm.statusMessage = "Some message";
      await nextTick();

      await wrapper.setProps({ gameSpecificFeature: 'New Exclusive Bonus!' });
      await nextTick();

      expect(wrapper.vm.isAdding).toBe(false);
      expect(wrapper.vm.justAdded).toBe(false);
      expect(wrapper.vm.alreadyExists).toBe(false);
      expect(wrapper.vm.statusMessage).toBe('');
    });
  });
});
