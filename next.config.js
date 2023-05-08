/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  reactStrictMode: true,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(ttf)$/,
      include: path.resolve(__dirname, 'utils/resumer-generator/utils/fonts'),
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static/fonts/',
            publicPath: '/_next/static/fonts/',
          },
        },
      ],
    });
    return config;
  },
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/nuces-blocked' : '',
  publicRuntimeConfig: {
    contextPath: process.env.NODE_ENV === 'production' ? '/nuces-blocked' : '',
    uploadPath: process.env.NODE_ENV === 'production' ? '/nuces-blocked/upload.php' : '/api/upload',
  },
};
