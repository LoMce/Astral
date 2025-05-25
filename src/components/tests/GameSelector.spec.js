import { mount } from '@vue/test-utils';
import GameSelector from '../GameSelector.vue';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { nextTick } from 'vue';

const mockGames = [
  { value: 'game1', name: 'Alpha Game', logoSrc: 'alpha.png' },
  { value: 'game2', name: 'Beta Game', logoSrc: 'beta.png' },
  { value: 'game3', name: 'Gamma Game', logoSrc: 'gamma.png' },
  { value: 'game4', name: 'Delta Game X', logoSrc: 'delta.png' },
];

const mockGamesEmpty = [];

// Helper to manage document event listeners for clickOutside
const eventMap = {};
document.addEventListener = vi.fn((event, callback) => {
  eventMap[event] = callback;
});
document.removeEventListener = vi.fn((event) => {
  delete eventMap[event];
});

describe('GameSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Reset any global state if necessary, e.g., Pinia stores (not directly used here)
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    // Clear any event listeners added by the component
    for (const event in eventMap) {
        delete eventMap[event];
    }
  });

  describe('Rendering', () => {
    it('renders with placeholder when no value is provided', () => {
      wrapper = mount(GameSelector, {
        props: { games: mockGames }
      });
      expect(wrapper.find('.selected-text').text()).toBe('-- Select Game --');
      expect(wrapper.find('.selected-logo').exists()).toBe(false); // No logo for placeholder
    });

    it('renders with a pre-selected game value and displays correct game name and logo', () => {
      wrapper = mount(GameSelector, {
        props: { games: mockGames, currentSelectedValueProp: 'game2' }
      });
      expect(wrapper.find('.selected-text').text()).toBe('Beta Game');
      expect(wrapper.find('.selected-logo').exists()).toBe(true);
      expect(wrapper.find('.selected-logo').attributes('src')).toBe('beta.png');
      expect(wrapper.find('.selected-logo').attributes('alt')).toBe('Beta Game logo');
    });

    it('renders correctly with an empty games array', () => {
        wrapper = mount(GameSelector, {
            props: { games: mockGamesEmpty }
        });
        expect(wrapper.find('.selected-text').text()).toBe('-- Select Game --');
        // Open dropdown
        wrapper.find('.custom-select-selected').trigger('click');
        return nextTick().then(() => {
            expect(wrapper.find('.custom-select-options').text()).toContain('No games available.');
        });
    });
  });

  describe('Dropdown Interaction', () => {
    beforeEach(() => {
      wrapper = mount(GameSelector, { props: { games: mockGames } });
    });

    it('opens dropdown on trigger click and sets aria-expanded', async () => {
      const trigger = wrapper.find('.custom-select-selected');
      await trigger.trigger('click');
      expect(wrapper.vm.isOpen).toBe(true);
      expect(trigger.attributes('aria-expanded')).toBe('true');
      expect(wrapper.find('.custom-select-options').classes()).toContain('show');
    });

    it('closes dropdown on second trigger click', async () => {
      const trigger = wrapper.find('.custom-select-selected');
      await trigger.trigger('click'); // Open
      await trigger.trigger('click'); // Close
      expect(wrapper.vm.isOpen).toBe(false);
      expect(trigger.attributes('aria-expanded')).toBe('false');
      expect(wrapper.find('.custom-select-options').classes()).not.toContain('show');
    });

    it('opens dropdown on Enter key press on trigger', async () => {
      const trigger = wrapper.find('.custom-select-selected');
      await trigger.trigger('keydown.enter');
      expect(wrapper.vm.isOpen).toBe(true);
    });

    it('closes dropdown on Enter key press on trigger when open', async () => {
        const trigger = wrapper.find('.custom-select-selected');
        await trigger.trigger('click'); // Open
        await trigger.trigger('keydown.enter'); // Close
        expect(wrapper.vm.isOpen).toBe(false);
    });
    
    it('opens dropdown on Space key press on trigger', async () => {
        const trigger = wrapper.find('.custom-select-selected');
        await trigger.trigger('keydown.space');
        expect(wrapper.vm.isOpen).toBe(true);
    });

    it('closes dropdown on Space key press on trigger when open', async () => {
        const trigger = wrapper.find('.custom-select-selected');
        await trigger.trigger('click'); // Open
        await trigger.trigger('keydown.space'); // Close
        expect(wrapper.vm.isOpen).toBe(false);
    });

    it('closes dropdown on Escape key press', async () => {
      const trigger = wrapper.find('.custom-select-selected');
      await trigger.trigger('click'); // Open
      expect(wrapper.vm.isOpen).toBe(true);
      
      // Simulate Escape key on the container, as events bubble up
      await wrapper.find('.custom-select-container').trigger('keydown.escape');
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('closes dropdown on click outside', async () => {
      await wrapper.find('.custom-select-selected').trigger('click'); // Open
      expect(wrapper.vm.isOpen).toBe(true);

      // Simulate click outside by invoking the document's mousedown listener
      if (eventMap.mousedown) {
        eventMap.mousedown({ target: document.createElement('div') }); // Simulate click on an element not part of the component
      }
      await nextTick();
      expect(wrapper.vm.isOpen).toBe(false);
    });
  });

  describe('Option Selection', () => {
    beforeEach(async () => {
      wrapper = mount(GameSelector, { props: { games: mockGames } });
      await wrapper.find('.custom-select-selected').trigger('click'); // Open dropdown
    });

    it('selects an option on click, emits event, updates display, and closes dropdown', async () => {
      const options = wrapper.findAll('.custom-select-option');
      await options[1].trigger('click'); // Click 'Beta Game' (index 1)

      expect(wrapper.emitted()['game-selected']).toBeTruthy();
      expect(wrapper.emitted()['game-selected'][0]).toEqual(['game2']);
      
      await nextTick(); // Allow display to update

      expect(wrapper.find('.selected-text').text()).toBe('Beta Game');
      expect(wrapper.find('.selected-logo').attributes('src')).toBe('beta.png');
      expect(wrapper.vm.isOpen).toBe(false); // Dropdown should close
    });
  });

  describe('Search/Filtering', () => {
    beforeEach(async () => {
      wrapper = mount(GameSelector, { props: { games: mockGames } });
      await wrapper.find('.custom-select-selected').trigger('click'); // Open dropdown
    });

    it('filters options based on search term', async () => {
      const searchInput = wrapper.find('.custom-select-search-input');
      await searchInput.setValue('Alpha');
      
      const options = wrapper.findAllComponents({ name: 'GameSelectorOption' });
      expect(options.length).toBe(1);
      expect(options[0].props().option.name).toBe('Alpha Game');
    });

    it('filters options case-insensitively', async () => {
        const searchInput = wrapper.find('.custom-select-search-input');
        await searchInput.setValue('beta');
        
        const options = wrapper.findAllComponents({ name: 'GameSelectorOption' });
        expect(options.length).toBe(1);
        expect(options[0].props().option.name).toBe('Beta Game');
    });

    it('shows "No games found" message if search yields no results', async () => {
      const searchInput = wrapper.find('.custom-select-search-input');
      await searchInput.setValue('NonExistentGame');
      
      const options = wrapper.findAllComponents({ name: 'GameSelectorOption' });
      expect(options.length).toBe(0);
      expect(wrapper.find('.custom-select-options').text()).toContain('No games found.');
    });

    it('clears search and shows all options when search input is cleared', async () => {
        const searchInput = wrapper.find('.custom-select-search-input');
        await searchInput.setValue('Alpha'); // Filter
        await searchInput.setValue(''); // Clear
        
        const options = wrapper.findAllComponents({ name: 'GameSelectorOption' });
        expect(options.length).toBe(mockGames.length);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      wrapper = mount(GameSelector, { props: { games: mockGames } });
      await wrapper.find('.custom-select-selected').trigger('click'); // Open dropdown
    });

    it('highlights first option on ArrowDown from search input', async () => {
        const searchInput = wrapper.find('.custom-select-search-input');
        await searchInput.trigger('keydown.arrowdown');
        await nextTick();
        expect(wrapper.vm.highlightedIndex).toBe(0);
        const firstOption = wrapper.findAll('.custom-select-option')[0];
        expect(firstOption.attributes('id')).toBe(wrapper.vm.activeDescendant);
        expect(firstOption.classes()).toContain('highlighted');
    });

    it('highlights next option on ArrowDown from an option', async () => {
        await wrapper.vm.setHighlightedIndex(0); // Manually set to first for test consistency
        await nextTick();
        const optionsContainer = wrapper.find('.custom-select-options');
        await optionsContainer.trigger('keydown.arrowdown'); // Assuming focus is on the options list
        await nextTick();
        expect(wrapper.vm.highlightedIndex).toBe(1);
    });
    
    it('highlights previous option on ArrowUp', async () => {
        await wrapper.vm.setHighlightedIndex(1);
        await nextTick();
        const optionsContainer = wrapper.find('.custom-select-options');
        await optionsContainer.trigger('keydown.arrowup');
        await nextTick();
        expect(wrapper.vm.highlightedIndex).toBe(0);
    });

    it('wraps highlight to last option on ArrowUp from first option', async () => {
        await wrapper.vm.setHighlightedIndex(0);
        await nextTick();
        const optionsContainer = wrapper.find('.custom-select-options');
        await optionsContainer.trigger('keydown.arrowup');
        await nextTick();
        expect(wrapper.vm.highlightedIndex).toBe(mockGames.length - 1);
    });

    it('wraps highlight to first option on ArrowDown from last option', async () => {
        await wrapper.vm.setHighlightedIndex(mockGames.length - 1);
        await nextTick();
        const optionsContainer = wrapper.find('.custom-select-options');
        await optionsContainer.trigger('keydown.arrowdown');
        await nextTick();
        expect(wrapper.vm.highlightedIndex).toBe(0);
    });

    it('selects highlighted option on Enter key press', async () => {
      await wrapper.vm.setHighlightedIndex(1); // Highlight 'Beta Game'
      await nextTick();
      const optionsContainer = wrapper.find('.custom-select-options');

      await optionsContainer.trigger('keydown.enter');
      
      expect(wrapper.emitted()['game-selected']).toBeTruthy();
      expect(wrapper.emitted()['game-selected'][0]).toEqual(['game2']);
      expect(wrapper.vm.isOpen).toBe(false);
      expect(wrapper.find('.selected-text').text()).toBe('Beta Game');
    });
  });

  describe('Props Handling', () => {
    it('updates displayed options when `games` prop changes', async () => {
      wrapper = mount(GameSelector, { props: { games: mockGames.slice(0, 2) } }); // Initial games
      await wrapper.find('.custom-select-selected').trigger('click'); // Open
      expect(wrapper.findAllComponents({ name: 'GameSelectorOption' }).length).toBe(2);

      await wrapper.setProps({ games: mockGames }); // Update games prop
      await nextTick();
      expect(wrapper.findAllComponents({ name: 'GameSelectorOption' }).length).toBe(mockGames.length);
    });

    it('updates selected game display when `currentSelectedValueProp` changes dynamically', async () => {
      wrapper = mount(GameSelector, {
        props: { games: mockGames, currentSelectedValueProp: 'game1' }
      });
      expect(wrapper.find('.selected-text').text()).toBe('Alpha Game');

      await wrapper.setProps({ currentSelectedValueProp: 'game3' });
      await nextTick();
      expect(wrapper.find('.selected-text').text()).toBe('Gamma Game');
      expect(wrapper.find('.selected-logo').attributes('src')).toBe('gamma.png');
    });

    it('clears selection if currentSelectedValueProp changes to an invalid value', async () => {
        wrapper = mount(GameSelector, {
            props: { games: mockGames, currentSelectedValueProp: 'game1' }
        });
        expect(wrapper.find('.selected-text').text()).toBe('Alpha Game');
        
        await wrapper.setProps({ currentSelectedValueProp: 'nonexistent' });
        await nextTick();
        expect(wrapper.find('.selected-text').text()).toBe('-- Select Game --');
    });

    it('reacts to currentSelectedValueProp being initially null or undefined', () => {
        wrapper = mount(GameSelector, {
            props: { games: mockGames, currentSelectedValueProp: null }
        });
        expect(wrapper.find('.selected-text').text()).toBe('-- Select Game --');
        
        wrapper.unmount();

        wrapper = mount(GameSelector, {
            props: { games: mockGames, currentSelectedValueProp: undefined }
        });
        expect(wrapper.find('.selected-text').text()).toBe('-- Select Game --');
    });
  });
});
