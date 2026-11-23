export async function getStars(repo: string, fallback: number, fetchImpl: typeof fetch = fetch): Promise<number> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), 5000); });
  const request = (async () => {
    const res = await fetchImpl(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (res.status !== 200) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  })().catch(() => null);
  try {
    const stars = await Promise.race([request, timeout]);
    return stars ?? fallback;
  } finally {
    clearTimeout(timer);
  }
}
