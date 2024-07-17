/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [mkcert({
    mkcertPath: "/opt/homebrew/bin/mkcert"
  }), react() ],
  test: {
    includeSource: ["src/**/*.{js,ts}"],
  },
  define: {
    "import.meta.vitest": undefined,
  },
});
