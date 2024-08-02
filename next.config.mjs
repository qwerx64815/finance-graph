/** @type {import('next').NextConfig} */

const isProductionENV = process.env.NODE_ENV === 'production'

const nextConfig = {
    images: {
        loader: "akamai",
        path: "",
    },
    assetPrefix: isProductionENV ? 'https://qwerx64815.github.io/finance-graph/' : undefined,
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
