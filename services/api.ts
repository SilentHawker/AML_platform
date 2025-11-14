export const API_BASE = "https://unexploited-abdominal-tangela.ngrok-free.dev";
const API_KEY = process.env.REACT_APP_API_KEY || "dev-key-please-change";

interface FetchApiOptions extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

/**
 * A wrapper around fetch for making authenticated API calls.
 * @param endpoint The API endpoint to call (e.g., '/clients').
 * @param options Standard fetch options, with body being pre-JSON.stringify.
 * @returns A promise that resolves to the JSON response.
 */
export async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const { body, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorText = 'An unknown API error occurred.';
    try {
        errorText = await response.text();
    } catch (e) {
        // Ignore if can't read body
    }
    throw new Error(errorText || `API error: ${response.status} ${response.statusText}`);
  }

  // Handle responses with no content (e.g., 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  
  return response.json();
}