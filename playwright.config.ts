import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  webServer: {
    command: "npm run build && npx astro preview --port 4322",
    url: "http://localhost:4322",
    reuseExistingServer: true,
  },
  use: { baseURL: "http://localhost:4322" },
});
