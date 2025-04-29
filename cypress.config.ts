import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://frontend-5xrj.onrender.com",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});