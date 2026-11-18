import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // VITE_ variables are bundled into the browser code. Logo.dev's secret keys
  // (sk_…) must never end up there; only publishable keys (pk_…) are safe.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (env.VITE_LOGO_DEV_KEY?.trim().startsWith("sk_")) {
    throw new Error(
      "VITE_LOGO_DEV_KEY is a Logo.dev SECRET key (sk_…). Use your publishable key (pk_…) instead; anything in a VITE_ variable is visible to every visitor.",
    );
  }

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
