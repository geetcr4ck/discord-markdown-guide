export type Lang = 'en' | 'id';
export const locales: Lang[] = ['en', 'id'];

export function home(lang: Lang) {
  return `/${lang}`;
}

export function article(lang: Lang, slug: string) {
  return `/${lang}/${slug}`;
}

export function play(lang: Lang) {
  return `/${lang}/play`;
}

export function switchLocale(pathname: string, lang: Lang) {
  const parts = pathname.split('/').filter(Boolean);
  parts[0] = lang;
  return `/${parts.join('/')}`;
}
