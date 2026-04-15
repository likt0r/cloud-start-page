import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { keycloakify } from "keycloakify/vite-plugin";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const faviconPath = fileURLToPath(new URL("../../packages/assets/mean-robot-fat.svg", import.meta.url));

const faviconPlugin = {
    name: "assets-favicon",
    configureServer(server: { middlewares: { use: (path: string, handler: (req: unknown, res: { setHeader: (k: string, v: string) => void; end: (d: Buffer) => void }) => void) => void } }) {
        server.middlewares.use("/favicon.svg", (_req, res) => {
            res.setHeader("Content-Type", "image/svg+xml");
            res.end(readFileSync(faviconPath));
        });
    },
    generateBundle(this: { emitFile: (f: { type: string; fileName: string; source: string }) => void }) {
        this.emitFile({
            type: "asset",
            fileName: "favicon.svg",
            source: readFileSync(faviconPath, "utf-8"),
        });
    },
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    preserveSymlinks: true
  },
  plugins: [
    react(),
    tailwindcss(),
    faviconPlugin,
    keycloakify({
      accountThemeImplementation: "none",
      themeName: "mean-robot",
      keycloakVersionTargets: { "all-other-versions": true, "22-to-25": false }
    })
  ]
});
