export function getPublicSiteBaseUrl() {
  return process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
}
