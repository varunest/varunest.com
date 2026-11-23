import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "redirects.spec.ts",
  webServer: {
    command: "npm run build && npx wrangler dev --port 8787",
    url: "http://localhost:8787",
    reuseExistingServer: true,
    timeout: 180_000,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
  use: { baseURL: "http://localhost:8787" },
});
