import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testIgnore: "redirects.spec.ts",
  webServer: {
    command: "npm run build && npx astro preview --port 4322",
    url: "http://localhost:4322",
    reuseExistingServer: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  use: { baseURL: "http://localhost:4322" },
});
