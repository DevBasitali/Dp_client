import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

(async () => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
    : 'http://localhost:5000';
  try {
    await fetch(backendUrl);
    console.log('\x1b[32m\n✅ SUCCESS: Frontend successfully connected to backend at ' + backendUrl + '\n\x1b[0m');
  } catch (error) {
    console.log('\x1b[31m\n❌ ERROR: Could not connect to backend at ' + backendUrl + '. Make sure the backend server is running!\n\x1b[0m');
  }
})();

export default nextConfig;
