/** @type {import('next').NextConfig} */
const nextFonts = require('next-fonts');

module.exports = nextFonts({
  reactStrictMode: true,
  trailingSlash: true,
  basePath: '',
  publicRuntimeConfig: {
    contextPath: process.env.NODE_ENV === 'production' ? '/nuces-blocked' : '',
  },
});
