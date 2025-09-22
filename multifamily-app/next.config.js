// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' }
        ],
      },
    ];
  },
};
