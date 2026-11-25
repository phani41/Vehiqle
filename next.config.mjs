/** @type {import('next').NextConfig} */
// Dynamically allow the Supabase hostname configured in env so next/image
// accepts uploaded object URLs without hardcoding the project subdomain.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let SUPABASE_HOSTNAME = "";
try {
  SUPABASE_HOSTNAME = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : "";
} catch (e) {
  SUPABASE_HOSTNAME = "";
}

const nextConfig = { 
    // Compress responses for faster delivery
    compress: true,
    images: {
        remotePatterns: SUPABASE_HOSTNAME
            ? [
                {
                    protocol: "https",
                    hostname: SUPABASE_HOSTNAME,
                    pathname: "/**",
                },
            ]
            : [],
        // Prefer modern formats: AVIF first, then WebP
        formats: ["image/avif", "image/webp"],
        // Cache optimized images for 24 hours in CDN / edge
        minimumCacheTTL: 86400,
        // Only allow reasonable image sizes
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },
    // Reduce server log noise in production
    logging: {
        fetches: {
            fullUrl: false,
        },
    },
    async headers() {
        return [
            { 
                source:"/embed",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "frame-src 'self' https://truckverse.com",
                    },
                ],
            },

        ];

    },
};

export default nextConfig;
