import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" faz os caminhos dos arquivos serem relativos, o que funciona
// direto no GitHub Pages sem precisar saber o nome do repositório.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
