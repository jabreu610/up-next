/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [mkcert(), react() ],
  test: {
    includeSource: ["src/**/*.{js,ts}"],
    environment: 'jsdom',
    globals: true,
    deps: {
      moduleDirectories: ["node_modules", "src"],
    }
  },
  define: {
    "import.meta.vitest": undefined,
  },
});
