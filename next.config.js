// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    dest: 'public'
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'app/styles')],
  },
  typescript: {
    //true == Dangerously allow production builds to successfully complete even if  your project has type errors.
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
})
