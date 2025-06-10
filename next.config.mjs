/** @type {import('next').NextConfig} */
const nextConfig = { 
    experimental:{
        serverComponentsHmrCache:false,
    },
    images: {
        remotePatterns:[
            {
                protocol:"https",
                hostname:"https://hsukaookqpjkihnjtvcx.supabase.co",
            },
        ],
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
