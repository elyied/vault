/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // Tiptap peer dependency version mismatch causes type-only conflicts
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
};

module.exports = nextConfig;
