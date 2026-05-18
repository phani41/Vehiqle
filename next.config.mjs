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
    experimental:{
        serverComponentsHmrCache:false,
    },
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
