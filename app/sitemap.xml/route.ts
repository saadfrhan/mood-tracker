import { NextResponse } from "next/server";

export async function GET() {
  // Base URL of your application
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://mood-tracker.vercel.app";

  // Define your static routes
  const routes = ["", "/auth", "/journal", "/stats", "/calendar"];

  // Generate XML sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  // Return the XML with proper content type
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
