const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '')

export function sitePath(path = '') {
  const suffix = String(path).replace(/^\/+/, '')
  return suffix ? `${basePath}/${suffix}` : `${basePath || ''}/`
}

export function isSiteRoute(pathname, route) {
  return pathname.replace(/\/+$/, '') === sitePath(route).replace(/\/+$/, '')
}
