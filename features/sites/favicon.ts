// 사이트 아이콘 해석 — fetch는 사용자가 저장한 그 사이트로만 나간다 (docs/SITE_SYSTEM.md §2)
// 해석된 아이콘 URL을 DB에 저장하고, 렌더·디스크 캐시는 expo-image가 담당한다.
import { updateSiteFavicon } from '@/features/sites/api';

const attempted = new Set<string>(); // 세션당 1회만 시도 (실패 반복 트래픽 방지)

export function ensureFavicon(site: { id: string; url: string; favicon: string | null }): void {
  if (site.favicon) return;
  const key = `${site.id}:${site.url}`;
  if (attempted.has(key)) return;
  attempted.add(key);
  void resolveFaviconUrl(site.url).then((icon) => {
    if (icon) updateSiteFavicon(site.id, icon);
  });
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 사이트 홈 HTML에서 <link rel="icon">류를 찾아 아이콘 URL을 해석한다(PNG 우선).
 * HTML은 열렸는데 링크가 없으면 /favicon.ico 폴백, 네트워크 실패면 null(다음 기회에 재시도).
 */
export async function resolveFaviconUrl(siteUrl: string): Promise<string | null> {
  const m = siteUrl.match(/^(https?:\/\/[^/?#]+)/i);
  if (!m) return null;
  const origin = m[1];
  try {
    const res = await fetchWithTimeout(origin, 5000);
    if (!res.ok) return `${origin}/favicon.ico`;
    const html = (await res.text()).slice(0, 100_000); // head면 충분하다
    const links = Array.from(html.matchAll(/<link\b[^>]*>/gi), (match) => match[0]);
    const iconLinks = links.filter(
      (l) => /rel=["'][^"']*icon[^"']*["']/i.test(l) && !/mask-icon/i.test(l),
    );
    const hrefs = iconLinks
      .map((l) => l.match(/href=["']([^"']+)["']/i)?.[1])
      .filter((h): h is string => Boolean(h));
    const pick =
      hrefs.find((h) => /\.png(\?|$)/i.test(h)) ??
      hrefs.find((h) => /\.ico(\?|$)/i.test(h)) ??
      hrefs[0];
    return pick ? absolutize(pick, origin) : `${origin}/favicon.ico`;
  } catch {
    return null; // 오프라인 등 — favicon을 비워 두면 다음 세션에 다시 시도한다
  }
}

function absolutize(href: string, origin: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('//')) return `https:${href}`;
  if (href.startsWith('/')) return `${origin}${href}`;
  return `${origin}/${href}`;
}
