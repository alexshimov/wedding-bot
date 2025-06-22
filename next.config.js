/** @type {import('next').NextConfig} */
const nextConfig = {
    // ─── Skip TypeScript type-checking ───────────────────────────────
    typescript: {
      // DANGER: production build will succeed even with TS errors
      ignoreBuildErrors: true,
    },
  
    // ─── Skip ESLint during `next build` ─────────────────────────────
    eslint: {
      // DANGER: build will ignore lint errors & warnings
      ignoreDuringBuilds: true,
    },
  };
  
  module.exports = nextConfig;