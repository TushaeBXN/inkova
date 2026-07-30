export async function storageGet(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

export async function storageSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export async function saveHistory(profileId, toolId, entry) {
  const key = `history:${profileId}:${toolId}`;
  const existing = await storageGet(key) || [];
  const updated = [{ ...entry, ts: Date.now() }, ...existing].slice(0, 5);
  await storageSet(key, updated);
}

export async function getHistory(profileId, toolId) {
  return await storageGet(`history:${profileId}:${toolId}`) || [];
}
