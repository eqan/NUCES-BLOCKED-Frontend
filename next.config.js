/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    trailingSlash: true,
    basePath: process.env.NODE_ENV === 'production' ? '/nuces-blocked' : '',
    publicRuntimeConfig: {
        contextPath: process.env.NODE_ENV === 'production' ? '/nuces-blocked' : '',
        uploadPath: process.env.NODE_ENV === 'production' ? '/nuces-blocked/upload.php' : '/api/upload'
    }
};

module.exports = nextConfig;
