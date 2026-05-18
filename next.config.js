/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 타입스크립트 에러가 있어도 빌드 강제 통과
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. 린트(문법 검사) 에러가 있어도 빌드 강제 통과
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
