/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        loader: "akamai",
        path: "",
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: '/pages/api/:path*',
            },
        ];
    },
};

export default nextConfig;
