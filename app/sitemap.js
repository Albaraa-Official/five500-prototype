const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thefive500.com";

export default function sitemap() {
  const routes = ["", "/menu", "/about", "/contact", "/legal/privacy", "/legal/terms"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
