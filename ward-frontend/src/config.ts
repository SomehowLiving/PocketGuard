// App configuration
// When running locally with a backend at localhost:3000, the Vite proxy handles /api requests.
// For production, set these to your deployed backend URL.

export const CHAIN_ID = 11155111; // Sepolia

// Base URL for API calls — empty string means use the Vite proxy (relative paths)
// export const API_BASE_URL = 'https://lushier-rosalia-superearthly.ngrok-free.dev';
export const API_BASE_URL = 'http://localhost:3000';