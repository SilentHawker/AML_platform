
export const API_BASE = "https://unexploited-abdominal-tangela.ngrok-free.dev";
const API_KEY = process.env.REACT_APP_API_KEY || "dev-key-please-change";

interface FetchApiOptions extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  auth?: boolean; // Add auth flag
}

/**
 * A wrapper around fetch for making authenticated API calls.
 * @param endpoint The API endpoint to call (e.g., '/clients').
 * @param options Standard fetch options, with body being pre-JSON.stringify.
 * @returns A promise that resolves to the JSON response.
 */
export async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const { body, auth = true, ...restOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Add this header to bypass Ngrok warnings
    ...options.headers,
  };

  if (auth) {
    headers['x-api-key'] = API_KEY;
  }

  const config: RequestInit = {
    ...restOptions,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      // Prefer a structured error message if the API provides one.
      errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch (jsonError) {
      // If the response is not JSON, fall back to plain text.
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      } catch (textError) {
        // If we can't even read text, the original status message is the best we have.
      }
    }
    throw new Error(errorMessage);
  }

  // Handle responses with no content (e.g., 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  
  return response.json();
}