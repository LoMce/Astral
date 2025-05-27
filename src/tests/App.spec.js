import { mount, shallowMount } from '@vue/test-utils';
import { ref, nextTick, defineComponent } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { useCartStore } from '@/stores/cart'; // Assuming path is correct
import App from '../App.vue'; // Assuming App.vue is in src
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mocks ---

// localStorage Mock
let store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] || null),
  setItem: vi.fn((key, value) => { store[key] = String(value); }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { store = {}; })
};
vi.stubGlobal('localStorage', localStorageMock);

// vue-router Mock
const mockRoute = ref({ path: '/', name: 'Home', params: {}, query: {} });
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  resolve: vi.fn((to) => ({ href: typeof to === 'string' ? to : to.path || '/' })),
  options: { routes: [] }, // Provide a minimal routes array
  currentRoute: mockRoute, // Make currentRoute reactive for watchers
};

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => mockRoute.value,
    useRouter: () => mockRouter,
    // Stubbing components used by vue-router if not using RouterLinkStub globally
    RouterView: defineComponent({ template: '<div><slot :Component="component" :route="route" /></div>', props: ['name'], setup() { return { component: {}, route: mockRoute.value } } }),
    RouterLink: defineComponent({ template: '<a><slot /></a>', props: ['to'] })
  };
});


// --- Stubs for Child Components ---
const ImmersiveBackgroundStub = { template: '<div class="immersive-background-stub"></div>' };
const MinecraftEffectsStub = { template: '<div class="minecraft-effects-stub"></div>' };
const FortniteEffectsStub = { template: '<div class="fortnite-effects-stub"></div>' };
const CODEffectsStub = { template: '<div class="cod-effects-stub"></div>' };
const CartIconStub = { template: '<div class="cart-icon-stub"></div>' };
const MiniCartStub = { template: '<div class="mini-cart-stub" v-if="isOpen"></div>', props: ['isOpen', 'activeTheme'] };

// Stub for the component rendered by router-view
const RouterViewComponentStub = defineComponent({
  name: 'RouterViewComponentStub',
  template: '<div @click="$emit(\'update-active-theme-game\', \'minecraft\')">Router View Content</div>',
  emits: ['update-active-theme-game']
});


describe('App.vue', () => {
  let wrapper;
  let cartStore;

  const mountComponent = (routePath = '/') => {
    mockRoute.value = { path: routePath, name: routePath === '/' ? 'Home' : 'Other', params: {}, query: {} };
    
    const testingPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false, // Let actions run unless specifically spied/mocked
    });
    cartStore = useCartStore(); // Get store instance

    return mount(App, {
      global: {
        plugins: [testingPinia],
        stubs: {
          ImmersiveBackground: ImmersiveBackgroundStub,
          MinecraftEffects: MinecraftEffectsStub,
          FortniteEffects: FortniteEffectsStub,
          CODEffects: CODEffectsStub,
          CartIcon: CartIconStub,
          MiniCart: MiniCartStub,
          // RouterView will be complex to stub correctly with slots, so we mock useRoute/useRouter
          // And provide a simple component for the slot if needed
        },
        // Provide a simple component for the router-view slot for theme emit test
        components: {
          RouterViewComponentStub 
        }
      }
    });
  };

  beforeEach(() => {
    localStorageMock.clear();
    store = {}; // Ensure localStorage mock store is cleared
    mockRouter.push.mockClear();
    mockRouter.replace.mockClear();
    mockRouter.resolve.mockClear();
    // Reset document.body classes
    document.body.className = '';
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Initial Rendering', () => {
    beforeEach(() => {
      wrapper = mountComponent();
    });

    it('renders header, logo, and cart icon', () => {
      expect(wrapper.find('.app-header').exists()).toBe(true);
      expect(wrapper.find('.nav-logo-img').exists()).toBe(true);
      expect(wrapper.find('.cart-button-wrapper').exists()).toBe(true);
    });

    it('renders router-view placeholder (actual component depends on router setup)', () => {
      // We are not testing vue-router's <router-view> rendering itself,
      // but that App.vue provides the slot for it.
      // The mocked RouterView just renders a div.
      expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true);
    });
  });

  describe('Routing (Shallow Integration)', () => {
    it('updates router-view component key when route path changes', async () => {
      wrapper = mountComponent('/');
      const initialKey = wrapper.findComponent({ name: 'RouterView' }).vm.$.vnode.key; // Accessing key, might be brittle

      mockRoute.value = { ...mockRoute.value, path: '/checkout' };
      await nextTick(); // Wait for Vue to react to route change

      // The key on the <component :is="Component" :key="currentRoute.path"...> inside RouterView's slot
      // This is tricky to get directly. Instead, we check if the underlying 'route' prop of our RouterView mock changed.
      const routerViewInstance = wrapper.findComponent({ name: 'RouterView' });
      expect(routerViewInstance.vm.route.path).toBe('/checkout');
      
      // A more direct way if testing the <component :is="..."> inside App.vue's router-view slot
      // would require a more complex setup to inspect the slot content.
      // For this test, confirming the route prop of the RouterView stub changes is sufficient.
    });
  });
  
  describe('Theme Switching Logic', () => {
    it('initializes with theme from localStorage and applies body class', async () => {
      localStorageMock.setItem('activeThemeGame', 'minecraft');
      wrapper = mountComponent();
      await nextTick(); // Wait for onMounted and watchers

      expect(wrapper.vm.activeThemeGame).toBe('minecraft');
      expect(document.body.classList.contains('theme-minecraft')).toBe(true);
    });

    it('changes theme when child component emits update-active-theme-game', async () => {
      // For this test, we need to ensure the component rendered by router-view is our stub
      // that can emit the event. We'll modify mountComponent or pass a specific component.
      wrapper = mount(App, { // Direct mount with specific slot content
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })],
          stubs: {
            ImmersiveBackground: true, MinecraftEffects: true, FortniteEffects: true, 
            CODEffects: true, CartIcon: true, MiniCart: true,
            RouterView: defineComponent({ // Stub RouterView to pass through a specific component
              template: '<slot :Component="RouterViewComponentStub" :route="mockRoute" />',
              setup: () => ({ RouterViewComponentStub, mockRoute: mockRoute.value })
            }),
            RouterLink: {template: '<a><slot/></a>'}
          },
        }
      });
      cartStore = useCartStore(); // Initialize cart store

      const routerViewContent = wrapper.findComponent(RouterViewComponentStub);
      expect(routerViewContent.exists()).toBe(true);
      
      await routerViewContent.trigger('click'); // Stub emits 'minecraft' on click
      await nextTick();

      expect(wrapper.vm.activeThemeGame).toBe('minecraft');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeThemeGame', 'minecraft');
      expect(document.body.classList.contains('theme-minecraft')).toBe(true);
    });

    it('resets theme on logo click when on home page', async () => {
      // Setup initial state with a theme active
      localStorageMock.setItem('activeThemeGame', 'fortnite');
      document.body.classList.add('theme-fortnite'); // Simulate class being set

      wrapper = mountComponent('/'); // Mount on home page
      wrapper.vm.activeThemeGame = 'fortnite'; // Manually set for test clarity
      await nextTick();

      expect(document.body.classList.contains('theme-fortnite')).toBe(true);

      await wrapper.find('.nav-logo-link').trigger('click');
      await nextTick();
      
      expect(wrapper.vm.activeThemeGame).toBe('');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeThemeGame');
      expect(document.body.classList.contains('theme-fortnite')).toBe(false);
      expect(document.body.classList.contains('theme-active')).toBe(false);
    });

     it('does NOT reset theme on logo click when NOT on home page', async () => {
      localStorageMock.setItem('activeThemeGame', 'cod');
      wrapper = mountComponent('/checkout'); // Mount on a different page
      wrapper.vm.activeThemeGame = 'cod'; // Manually set
      document.body.classList.add('theme-cod');
      await nextTick();

      await wrapper.find('.nav-logo-link').trigger('click');
      await nextTick();
      
      expect(wrapper.vm.activeThemeGame).toBe('cod'); // Should not change
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('activeThemeGame');
      expect(document.body.classList.contains('theme-cod')).toBe(true); // Class should remain
    });
  });

  describe('MiniCart Toggle', () => {
    beforeEach(() => {
      wrapper = mountComponent();
    });

    it('toggles isMiniCartOpen ref on cart icon click', async () => {
      const cartButton = wrapper.find('.cart-button-wrapper');
      
      expect(wrapper.vm.isMiniCartOpen).toBe(false);
      await cartButton.trigger('click');
      expect(wrapper.vm.isMiniCartOpen).toBe(true);
      
      await cartButton.trigger('click');
      expect(wrapper.vm.isMiniCartOpen).toBe(false);
    });

    it('updates MiniCart isOpen prop (conceptual via ref change)', async () => {
        // This test relies on the previous one's logic for toggling isMiniCartOpen
        // and checks if the MiniCartStub receives the updated prop value.
        const cartButton = wrapper.find('.cart-button-wrapper');
        const miniCartStub = wrapper.findComponent(MiniCartStub);

        expect(miniCartStub.props('isOpen')).toBe(false);
        await cartButton.trigger('click');
        await nextTick(); // Wait for prop updates
        expect(miniCartStub.props('isOpen')).toBe(true);
    });
  });
});
