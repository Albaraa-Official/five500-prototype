/** @type {import('next').NextConfig} */
const { validateEnv } = require("./lib/env");
validateEnv(); // يفشل بسرعة لو نقص سر حرج في الإنتاج

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    // unsafe-inline مطلوب لـ Next.js (inline hydration scripts).
    // connect-src تسمح بـ Moyasar API فقط بجانب نفس الأصل.
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://unpkg.com",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://api.moyasar.com",
      "frame-src https://api.moyasar.com https://secure.moyasar.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
module.exports = nextConfig;
