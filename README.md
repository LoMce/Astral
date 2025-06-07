# My Thematic Game Key Store

Welcome to "My Thematic Game Key Store," a single-page application (SPA) designed to simulate the experience of purchasing game keys. This application showcases a dynamic, theme-based user interface that changes based on the selected game, providing an immersive browsing experience.

## Key Features

*   **Dynamic Theming:** The UI color scheme, background effects, and some visual elements adapt to the currently selected game (e.g., Minecraft, Fortnite, Call of Duty).
*   **Game Selection:** Users can browse and select from a list of available games.
*   **Key/Pass Selection:** For each game, different types of keys or passes are displayed with details and prices.
*   **Shopping Cart:** A fully functional shopping cart powered by Pinia, allowing users to add, remove, and update quantities of items. Cart contents persist across browser sessions using `localStorage`.
*   **Simulated Checkout:** A checkout process where users can enter an email and "place an order." The payment integration is currently a placeholder.
*   **Responsive Design:** The application is designed to be usable across different screen sizes.
*   **Accessibility Considerations:** Efforts have been made to include ARIA attributes and keyboard navigation support in key components.

## Technology Stack

*   **Vue 3:** Core JavaScript framework (using Composition API with `<script setup>`).
*   **Vite:** Frontend tooling for development and bundling.
*   **Vue Router:** For client-side routing.
*   **Pinia:** For state management (especially the shopping cart).
*   **Vitest:** For unit testing components and stores.
*   **ESLint & Prettier:** For code linting and formatting.

## Project Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd my-thematic-app
    ```

2.  **Install dependencies:**
    Make sure you have Node.js (version 16+ recommended) and npm installed.
    ```bash
    npm install
    ```

## Available Scripts

Once dependencies are installed, you can run the following scripts from the project root:

### `npm run dev`

Runs the app in development mode with hot-reload. Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view it in your browser.

### `npm run build`

Compiles and minifies the application for production into the `dist` folder.

### `npm run preview`

Locally previews the production build from the `dist` folder.

### `npm run lint`

Lints the project files using ESLint and attempts to automatically fix issues.

### `npm run format`

Formats the code in the `src/` directory using Prettier.

### `npm run test`

Runs the unit tests using Vitest.

## Recommended IDE Setup

*   [VSCode](https://code.visualstudio.com/)
*   [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (ensure Vetur is disabled if previously installed).
*   [ESLint Plugin for VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Notes

*   The payment system in the checkout process is a simulation. No real transactions occur.
*   Game data, including logos and pass details, is currently mocked within the application.
