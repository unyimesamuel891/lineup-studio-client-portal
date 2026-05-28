import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const workspaceRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  cacheDir: "node_modules/.vite",
  server: {
    fs: {
      strict: true,
      allow: [workspaceRoot]
    }
  },
  preview: {
    host: "127.0.0.1"
  }
});
