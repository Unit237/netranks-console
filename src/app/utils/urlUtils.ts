/**
 * Builds a URL with query parameters
 * @param baseUrl - The base URL path (relative or absolute)
 * @param params - Object containing query parameters
 * @returns URL string with query parameters appended
 *
 * @example
 * urlParams('api/CreateVisitorSession', { secret: 'abc123' })
 * // Returns: 'api/CreateVisitorSession?secret=abc123'
 *
 * urlParams('/api/CreateVisitorSession', { secret: 'abc123' })
 * // Returns: '/api/CreateVisitorSession?secret=abc123'
 */
export function urlParams(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  // Handle absolute URLs
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  }

  // Handle relative URLs
  // Use a dummy base to construct the URL properly
  const url = new URL(baseUrl, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  // Return relative URL (pathname + search, preserving leading slash if present)
  const relativePath = url.pathname + url.search;
  // Preserve the original leading slash behavior
  if (baseUrl.startsWith("/") && !relativePath.startsWith("/")) {
    return "/" + relativePath;
  }
  if (!baseUrl.startsWith("/") && relativePath.startsWith("/")) {
    return relativePath.slice(1);
  }
  return relativePath;
}
