// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Proxy vers ton backend NestJS
      },
    ];
  },
};

module.exports = nextConfig;
