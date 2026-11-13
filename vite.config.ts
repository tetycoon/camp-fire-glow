import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const realRoot = fs.existsSync(process.cwd()) ? fs.realpathSync(process.cwd()) : process.cwd();
  return {
    root: realRoot,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      // Dev only: serve public/<dir>/index.html for "/<dir>" and "/<dir>/", as static hosting does in production.
      {
        name: "serve-public-dir-index",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const match = req.url?.match(/^\/([\w-]+)\/?(\?.*)?$/);
            if (match && fs.existsSync(path.join(realRoot, "public", match[1], "index.html"))) {
              req.url = `/${match[1]}/index.html${match[2] ?? ""}`;
            }
            next();
          });
        },
      },
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(realRoot, "./src"),
      },
    },
  };
});
