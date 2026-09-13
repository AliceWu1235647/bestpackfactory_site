const DEFAULT_REVALIDATE_SECONDS = 3600;

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function cleanPath(value = '') {
  const normalized = String(value || '').trim().replace(/^\/+|\/+$/g, '');
  if (!normalized || normalized.includes('..') || /^(?:https?:)?\/\//i.test(normalized)) return '';
  return normalized;
}

function baseUrl() {
  return env('R2_PUBLIC_BASE_URL').trim().replace(/\/+$/, '');
}

export function r2ReleaseManifestEnabled() {
  return Boolean(baseUrl() && cleanPath(env('R2_RELEASE_MANIFEST_PATH')));
}

export async function getR2ReleaseManifest(revalidateSeconds = DEFAULT_REVALIDATE_SECONDS) {
  if (!r2ReleaseManifestEnabled()) return null;
  const manifestPath = cleanPath(env('R2_RELEASE_MANIFEST_PATH'));
  try {
    const response = await fetch(`${baseUrl()}/${manifestPath}`, {
      next: {
        revalidate: revalidateSeconds,
        tags: ['r2-release', 'r2-release:current'],
      },
    });
    if (!response.ok) {
      console.error('[R2 release] manifest unavailable:', response.status);
      return null;
    }
    const manifest = await response.json();
    if (manifest?.schemaVersion !== 1 || !manifest?.releaseId || !manifest?.types) {
      console.error('[R2 release] invalid manifest schema');
      return null;
    }
    return manifest;
  } catch (error) {
    console.error('[R2 release] manifest fetch failed:', error?.message || error);
    return null;
  }
}

export async function resolveR2TypeLocation(type, legacy, revalidateSeconds = DEFAULT_REVALIDATE_SECONDS) {
  if (!r2ReleaseManifestEnabled()) return { ...legacy, releaseId: null };
  const manifest = await getR2ReleaseManifest(revalidateSeconds);
  const configured = manifest?.types?.[type];
  const prefix = cleanPath(configured?.jsonPrefix);
  const indexPath = cleanPath(configured?.indexPath);
  if (!manifest || !prefix || !indexPath) {
    console.error(`[R2 release] ${type} location is missing; refusing legacy-path fallback.`);
    return null;
  }
  return { prefix, indexPath, releaseId: manifest.releaseId };
}

