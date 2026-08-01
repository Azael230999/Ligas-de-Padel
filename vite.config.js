import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages sirve este proyecto en /Ligas-de-Padel/, así que el build
// necesita ese subpath como base. Dev/preview locales se quedan en "/".
const base = process.env.GH_PAGES ? "/Ligas-de-Padel/" : "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // El SDK de Firebase (auth + firestore) es lo más pesado del bundle
        // y cambia mucho menos seguido que el código de la app: separarlo
        // en su propio chunk deja que el navegador lo cachee entre
        // despliegues en vez de re-descargarlo cada vez que se toca una
        // pantalla.
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
    },
  },
});
