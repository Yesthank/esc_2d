const base = import.meta.env.BASE_URL;

/**
 * public/ 폴더의 asset 경로에 base URL을 적용.
 * config에서 '/rooms/north.svg' 같이 적으면
 * 로컬에서는 '/rooms/north.svg', GitHub Pages에서는 '/esc_2d/rooms/north.svg'로 변환됨.
 */
export function assetUrl(path: string): string {
  if (!path || path.startsWith('http') || path.startsWith('data:')) return path;
  // base가 '/'이면 그대로, '/esc_2d/'이면 앞에 붙임
  if (base === '/') return path;
  // path가 '/'로 시작하면 base + path(앞 / 제거)
  if (path.startsWith('/')) {
    return base + path.slice(1);
  }
  return base + path;
}
