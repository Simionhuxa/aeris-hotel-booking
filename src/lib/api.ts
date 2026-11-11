export const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...options, credentials: 'same-origin', signal: options.signal ?? AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json', ...(path.startsWith('/admin') ? { 'X-Aeris-Admin': '1' } : {}), ...options.headers } });
  } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw error; throw new ApiError(0, 'Cannot reach the API. Please try again.'); }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, body?.error ?? 'Request failed. Please try again.');
  if (!body) throw new ApiError(0, 'API returned an invalid response. Check your local server.');
  return body as T;
}
export interface ApiRoom { id: string; name: string; capacity: number; area: number; priceCents: number; totalCents?: number }
export interface Receipt { reference: string; cancellationToken: string; totalCents: number; nightlyCents: number; status: string; demo: true }
