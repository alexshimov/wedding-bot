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
    images: {
        // ↓ добавляем нужные хосты
        domains: [
          'img.youtube.com',   // превью  https://img.youtube.com/vi/…/hqdefault.jpg
          'i.ytimg.com',       // иногда YouTube отдаёт картинки с этого CDN
        ],
        // при желании: minimumCacheTTL: 60 * 60 * 24,  // сутки кэш
      },
  };
  
  module.exports = nextConfig;