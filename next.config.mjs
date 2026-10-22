/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Old inbound links stay alive (spec 1.1): no dead ends.
  async redirects() {
    return [
      { source: "/About", destination: "/#about", permanent: true },
      { source: "/Projects", destination: "/#work", permanent: true },
      { source: "/Articles", destination: "/", permanent: true },
    ];
  },
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
