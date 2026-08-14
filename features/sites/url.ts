// URL 정규화·이름 자동 제안 — 전부 오프라인 파싱 (docs/SITE_SYSTEM.md §2)
// RN의 URL 폴리필은 불완전하므로 정규식으로 파싱한다.

const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/** 스킴 보정 + 공백 제거. 형태가 URL이 아니면 null. */
export function normalizeUrl(input: string): string | null {
  let url = input.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  const host = hostnameOf(url);
  if (!host || !HOSTNAME_RE.test(host)) return null;
  // 호스트명만 소문자화 (경로·쿼리는 대소문자 구분 의미가 있어 보존)
  const m = url.match(/^(https?:\/\/)([^/?#]+)(.*)$/i);
  if (!m) return null;
  return `${m[1].toLowerCase()}${m[2].toLowerCase()}${m[3]}`;
}

export function hostnameOf(url: string): string | null {
  const m = url.match(/^https?:\/\/([^/:?#]+)/i);
  return m ? m[1].toLowerCase() : null;
}

/** 표시용 도메인 — www. 제거 */
export function displayDomain(url: string): string {
  const host = hostnameOf(url);
  return host ? host.replace(/^www\./, '') : url;
}

// 잘 알려진 도메인 → 공식 표기 (그 외에는 첫 라벨 capitalize 폴백)
const KNOWN_NAMES: Record<string, string> = {
  'github.com': 'GitHub',
  'notion.so': 'Notion',
  'google.com': 'Google',
  'gmail.com': 'Gmail',
  'youtube.com': 'YouTube',
  'naver.com': 'NAVER',
  'coupang.com': 'Coupang',
  'amazon.com': 'Amazon',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'x.com': 'X',
  'twitter.com': 'Twitter',
  'netflix.com': 'Netflix',
  'stackoverflow.com': 'Stack Overflow',
  'linkedin.com': 'LinkedIn',
  'reddit.com': 'Reddit',
  'ebay.com': 'eBay',
  'etsy.com': 'Etsy',
  'aliexpress.com': 'AliExpress',
  'figma.com': 'Figma',
  'vercel.com': 'Vercel',
  'supabase.com': 'Supabase',
  'npmjs.com': 'npm',
  'kakao.com': 'Kakao',
};

/** URL에서 사이트 이름 제안. 파싱 실패 시 입력 그대로. */
export function suggestSiteName(input: string): string {
  const normalized = normalizeUrl(input);
  if (!normalized) return input.trim();
  const domain = displayDomain(normalized);
  const known = KNOWN_NAMES[domain];
  if (known) return known;
  const label = domain.split('.')[0];
  return label.charAt(0).toUpperCase() + label.slice(1);
}
