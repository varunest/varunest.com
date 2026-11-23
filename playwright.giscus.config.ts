import { defineConfig, devices } from "@playwright/test";

// Comments need ids that are blank in the real build, so this config builds a
// separate copy with dummy ids (PUBLIC_GISCUS_TEST=1) into dist-giscus.
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "comments.spec.ts",
  webServer: {
    command:
      "PUBLIC_GISCUS_TEST=1 ASTRO_OUT_DIR=dist-giscus npx astro build && ASTRO_OUT_DIR=dist-giscus npx astro preview --ignore-lock --port 4323",
    url: "http://localhost:4323",
    reuseExistingServer: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  use: { baseURL: "http://localhost:4323" },
});
