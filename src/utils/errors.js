import { API_URL } from '../config';

// Turns an axios error into a message that tells the user what really went wrong.
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  if (data?.message) return data.message;

  const status = err?.response?.status;
  const notJson = typeof data === 'string' || data === undefined || data === null;

  // The request never reached the backend (backend stopped / wrong URL / blocked), or the dev proxy
  // could not reach it and answered with an empty 5xx.
  if ((err?.request && !err?.response) || (notJson && [500, 502, 503, 504].includes(status))) {
    const where = API_URL.startsWith('http') ? ` (${API_URL})` : '';
    return `Cannot reach the backend server${where}. Start it with "npm run dev" in E-Backend-main and check that the port matches (default 5001).`;
  }

  // A response came back but it is not from our API (e.g. HTML or "Forbidden" from another program on that port).
  if (err?.response && notJson) {
    return `Unexpected response from the server (HTTP ${status}). Check that the API URL points to the EcoBazar backend (on a Mac, port 5000 belongs to AirPlay).`;
  }
  return fallback;
};
