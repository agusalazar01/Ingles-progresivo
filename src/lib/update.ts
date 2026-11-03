/** Busca si hay una versión publicada más nueva en GitHub Releases. */
const REPO = 'agusalazar01/Ingles-progresivo';

export const APP_VERSION = __APP_VERSION__;
export const BUILD = __BUILD__;

export interface UpdateInfo {
  version: string;
  build: number;
  apkUrl: string;
  pageUrl: string;
}

export async function checkUpdate(): Promise<UpdateInfo | null> {
  if (!BUILD) return null; // versión de desarrollo
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const rel = (await res.json()) as { tag_name: string; html_url: string; assets: { name: string; browser_download_url: string }[] };
    const m = rel.tag_name.match(/^v(.+)-build(\d+)$/);
    if (!m) return null;
    const build = Number(m[2]);
    const apk = rel.assets.find((a) => a.name.endsWith('.apk'));
    if (build <= BUILD || !apk) return null;
    return { version: m[1], build, apkUrl: apk.browser_download_url, pageUrl: rel.html_url };
  } catch {
    return null;
  }
}
