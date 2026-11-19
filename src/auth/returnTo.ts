// Allow only in-site application destinations, never external URLs or protocol-relative URLs.
// Fragment navigation remains significant for the Vape Calculator and Smoke Less HashRouter.
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || value.length > 500 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f]/.test(value)) return null
  let decoded: string
  try { decoded = decodeURI(value) } catch { return null }
  if (decoded.startsWith('//') || decoded.includes('\\')) return null
  const path = decoded.split(/[?#]/,1)[0]
  if (path === '/vape-calculator/' || path === '/smoke-less/' || path === '/smoke-less/beta/' || path === '/smoke-less/admin/' || path === '/smoke-less/account/' || path === '/') return value
  return null
}
export function accountLink(returnTo: string, section: 'hub' | 'smoke' = 'hub'): string {
  const base = section === 'smoke' ? '/smoke-less/account/' : '/account/'
  const safe = safeReturnTo(returnTo)
  return safe ? base + '?returnTo=' + encodeURIComponent(safe) : base
}
