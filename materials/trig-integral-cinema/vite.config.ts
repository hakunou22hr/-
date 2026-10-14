import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      input: { lesson: "index.html", video: "video.html" },
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber"],
          math: ["katex"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
