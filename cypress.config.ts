import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "frontend-dlol.onrender.com",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});