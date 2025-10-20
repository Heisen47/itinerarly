
function isJwtToken(value: string): boolean {
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  return jwtPattern.test(value);
}

export function sanitizeCookieValue(value: string | undefined): string {
  if (!value) return '';
  
  if (value.includes('.')) {
    const jwtRegex = /([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)/g;
    const matches = [...value.matchAll(jwtRegex)];
    
    if (matches.length > 0) {
      matches.sort((a, b) => b[0].length - a[0].length);
      return matches[0][0];
    }
  }
  
  return value
    .replace(/"/g, '') 
    .replace(/;/g, '') 
    .replace(/,/g, '') 
    .replace(/\\/g, '') 
    .trim(); 
}

export function extractJwtToken(value: string | undefined): string {
  if (!value) return '';

  const jwtRegex = /([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)/g;
  const matches = [...value.matchAll(jwtRegex)];

  if (matches.length > 0) {
    matches.sort((a, b) => b[0].length - a[0].length);
    return matches[0][0];
  }

  return value
    .replace(/"/g, '')
    .replace(/;/g, '')
    .replace(/,/g, '')
    .replace(/\\/g, '')
    .trim();
}

export function setCookieSafely(
  Cookies: any, 
  name: string, 
  value: string | undefined,
  options?: any
): void {
  if (!Cookies || !name) return;
  if (typeof Cookies.set !== 'function') return; // no-op in non-browser/test env
  
  if (name === 'auth-token' || name === 'authToken' || name.toLowerCase().includes('jwt')) {
    const cleanValue = extractJwtToken(value);
    Cookies.set(name, cleanValue, options);
    return;
  }

  const sanitizedValue = sanitizeCookieValue(value);
  Cookies.set(name, sanitizedValue, options);
}

export function getCookieSafely(
  Cookies: any, 
  name: string
): string | undefined {
  if (!Cookies || !name) return undefined;
  
  try {
    return Cookies.get(name);
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return undefined;
  }
}
