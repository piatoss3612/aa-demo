/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
