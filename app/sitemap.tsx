import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of your application
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://mood-tracker.vercel.app";

  // Define your static routes
  const routes = ["", "/auth", "/journal", "/stats", "/calendar"];

  // Generate sitemap entries for static routes
  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return staticRoutes;
}
