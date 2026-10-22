import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Le skill du Concierge est lu à l'exécution : on l'embarque dans la fonction serverless.
  outputFileTracingIncludes: {
    "/api/concierge": ["./.claude/skills/concierge-canape/**"],
  },
};

export default nextConfig;
