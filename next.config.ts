import { networkInterfaces } from "os";
import type { NextConfig } from "next";

// Telefon və ya başqa cihazdan http://<kompüterin-IP>:3000 ilə test edəndə
// dev serverin JavaScript-i bloklanmasın deyə bu kompüterin şəbəkə ünvanlarına icazə verilir.
// (Yalnız `npm run dev` üçün keçərlidir, production-a təsir etmir.)
const localAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((n): n is NonNullable<typeof n> => !!n && n.family === "IPv4" && !n.internal)
  .map((n) => n.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: localAddresses,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
