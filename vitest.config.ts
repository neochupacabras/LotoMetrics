import { defineConfig } from "vitest/config";
import path from "node:path";

// Espelha o alias "@/*" -> "./*" de tsconfig.json (paths) — sem isso,
// qualquer teste que importe (em runtime, não só como type) um módulo que
// use imports "@/..." falha com "Cannot find package '@/...'", porque o
// Vitest/Vite não resolve esse alias por padrão.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
