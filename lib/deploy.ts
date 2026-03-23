export async function triggerKalkunesiaDeploy(): Promise<boolean> {
  const hookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    console.warn('CLOUDFLARE_DEPLOY_HOOK_URL tidak diset');
    return false;
  }

  try {
    const response = await fetch(hookUrl, { method: 'POST' });
    return response.ok;
  } catch (error) {
    console.error('Deploy hook error:', error);
    return false;
  }
}
