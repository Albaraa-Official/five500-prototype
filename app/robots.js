const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thefive500.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkout", "/account", "/orders", "/payment", "/success"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
