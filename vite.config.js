import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages sirve este proyecto en /Ligas-de-Padel/, así que el build
// necesita ese subpath como base. Dev/preview locales se quedan en "/".
const base = process.env.GH_PAGES ? "/Ligas-de-Padel/" : "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
});
