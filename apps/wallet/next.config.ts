import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Webpack configuration to exclude problematic modules
  webpack: (config, { webpack }) => {
    // Exclude problematic modules that are dependencies of development
    config.resolve.alias = {
      ...config.resolve.alias,
      'tap': false,
      'tape': false,
      'why-is-node-running': false,
    };

    // Ignore test files
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.test\.(js|ts|mjs)$/,
      })
    );

    return config;
  },
};

export default nextConfig;
