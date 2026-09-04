async function checkService(name, url, checkFn, profileUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json, text/html",
      },
    });
    clearTimeout(timeout);
    const exists = await checkFn(res);
    return {
      platform: name,
      exists,
      url: profileUrl,
      status: exists ? "Profile Found" : "Not Found / Available",
    };
  } catch {
    return {
      platform: name,
      exists: false,
      error: true,
      url: profileUrl,
      status: "Check timed out / Blocked",
    };
  }
}

export async function POST(req) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/^@/, "");

    if (!/^[a-zA-Z0-9_\-\.]{1,39}$/.test(cleanUsername)) {
      return Response.json(
        { error: "Invalid username format (must be 1-39 alphanumeric characters, _, -, or .)" },
        { status: 400 }
      );
    }

    const checks = [
      checkService(
        "GitHub",
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}`,
        (res) => res.status === 200,
        `https://github.com/${cleanUsername}`
      ),
      checkService(
        "HackerNews",
        `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(cleanUsername)}.json`,
        async (res) => {
          if (res.status !== 200) return false;
          const data = await res.json();
          return data && data.id ? true : false;
        },
        `https://news.ycombinator.com/user?id=${cleanUsername}`
      ),
      checkService(
        "GitLab",
        `https://gitlab.com/api/v4/users?username=${encodeURIComponent(cleanUsername)}`,
        async (res) => {
          if (res.status !== 200) return false;
          const data = await res.json();
          return Array.isArray(data) && data.length > 0;
        },
        `https://gitlab.com/${cleanUsername}`
      ),
      checkService(
        "Reddit",
        `https://www.reddit.com/user/${encodeURIComponent(cleanUsername)}/about.json`,
        async (res) => {
          if (res.status === 200) {
            const data = await res.json();
            return !data?.error && !!data?.data?.name;
          }
          return false;
        },
        `https://www.reddit.com/user/${cleanUsername}`
      ),
      checkService(
        "Chess.com",
        `https://api.chess.com/pub/player/${encodeURIComponent(cleanUsername)}`,
        (res) => res.status === 200,
        `https://www.chess.com/member/${cleanUsername}`
      ),
    ];

    const results = await Promise.all(checks);
    const foundCount = results.filter((r) => r.exists).length;

    return Response.json({
      username: cleanUsername,
      foundCount,
      totalChecked: results.length,
      footprintStatus: foundCount > 0 ? "Exposed Footprint Detected" : "Low Digital Footprint",
      results,
      osintNotice:
        "Using the same handle across platforms allows threat actors to correlate your activity, location, and interests.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
