const PLATFORMS = [
  { name: "GitHub",        url: "https://github.com/{u}",                      check: "status" },
  { name: "Reddit",        url: "https://www.reddit.com/user/{u}",             check: "status" },
  { name: "Twitter / X",  url: "https://twitter.com/{u}",                      check: "status" },
  { name: "Instagram",    url: "https://www.instagram.com/{u}/",               check: "status" },
  { name: "TikTok",       url: "https://www.tiktok.com/@{u}",                  check: "status" },
  { name: "YouTube",      url: "https://www.youtube.com/@{u}",                 check: "status" },
  { name: "Pinterest",    url: "https://www.pinterest.com/{u}/",               check: "status" },
  { name: "Twitch",       url: "https://www.twitch.tv/{u}",                    check: "status" },
  { name: "Medium",       url: "https://medium.com/@{u}",                      check: "status" },
  { name: "Dev.to",       url: "https://dev.to/{u}",                           check: "status" },
  { name: "GitLab",       url: "https://gitlab.com/{u}",                       check: "status" },
  { name: "Bitbucket",    url: "https://bitbucket.org/{u}/",                   check: "status" },
  { name: "npm",          url: "https://www.npmjs.com/~{u}",                   check: "status" },
  { name: "PyPI",         url: "https://pypi.org/user/{u}/",                 check: "status" },
  { name: "Docker Hub",   url: "https://hub.docker.com/u/{u}/",                check: "status" },
  { name: "Replit",       url: "https://replit.com/@{u}",                      check: "status" },
  { name: "Stack Overflow", url: "https://stackoverflow.com/users/search?tab=Users&q={u}", check: "status" },
  { name: "Product Hunt", url: "https://www.producthunt.com/@{u}",             check: "status" },
  { name: "Behance",      url: "https://www.behance.net/{u}",                  check: "status" },
  { name: "Dribbble",     url: "https://dribbble.com/{u}",                     check: "status" },
  { name: "SoundCloud",   url: "https://soundcloud.com/{u}",                   check: "status" },
  { name: "Keybase",      url: "https://keybase.io/{u}",                       check: "json",   jsonField: "status.name" },
  { name: "Patreon",      url: "https://www.patreon.com/{u}",                 check: "status" },
  { name: "Substack",     url: "https://{u}.substack.com",                    check: "status" },
  { name: "Quora",        url: "https://www.quora.com/profile/{u}",            check: "status" },
  { name: "Fiverr",       url: "https://www.fiverr.com/{u}",                  check: "status" },
  { name: "Tumblr",       url: "https://{u}.tumblr.com",                      check: "status" },
  { name: "HackerNews",   url: "https://hacker-news.firebaseio.com/v0/user/{u}.json", check: "json_notnull" },
  { name: "Telegram",     url: "https://t.me/{u}",                             check: "status" },
  { name: "Steam",        url: "https://steamcommunity.com/id/{u}",            check: "status" },
  { name: "Mastodon",     url: "https://mastodon.social/@{u}",                check: "status" },
  { name: "Spotify",      url: "https://open.spotify.com/user/{u}",            check: "status" },
  { name: "Buy Me a Coffee", url: "https://buymeacoffee.com/{u}",             check: "status" },
  { name: "Ko-fi",        url: "https://ko-fi.com/{u}",                        check: "status" },
  { name: "Linktree",     url: "https://linktr.ee/{u}",                        check: "status" },
  { name: "LinkedIn",     url: "https://www.linkedin.com/in/{u}",              check: "status" },
];

// Platforms that return 200 for non-existent users (need special handling)
const UNRELIABLE = new Set(["Instagram", "Twitter / X", "TikTok", "LinkedIn", "Snapchat", "Pinterest"]);

async function checkPlatform(platform, username) {
  const url = platform.url.replace(/{u}/g, encodeURIComponent(username));
  const displayUrl = platform.url.replace(/{u}/g, username);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DataGuard/1.0)",
        "Accept": "text/html,application/json",
      },
    });

    clearTimeout(timeoutId);

    if (platform.check === "json_notnull") {
      const text = await res.text();
      const found = text && text.trim() !== "null" && text.trim() !== "";
      return { name: platform.name, url: displayUrl, found, unreliable: false };
    }

    if (platform.check === "json") {
      if (!res.ok) return { name: platform.name, url: displayUrl, found: false, unreliable: false };
      return { name: platform.name, url: displayUrl, found: true, unreliable: false };
    }

    // status check
    const found = res.status === 200 || res.status === 301 || res.status === 302;
    const unreliable = UNRELIABLE.has(platform.name);

    return {
      name: platform.name,
      url: displayUrl,
      found: unreliable ? null : found,  // null = cannot verify
      unreliable,
      status: res.status,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return { name: platform.name, url: displayUrl, found: null, unreliable: true, error: "Timeout" };
    }
    return { name: platform.name, url: displayUrl, found: null, unreliable: true, error: err.message };
  }
}

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username || typeof username !== "string") {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/^@/, "");
    if (cleanUsername.length < 2) {
      return Response.json({ error: "Username must be at least 2 characters" }, { status: 400 });
    }

    // Run all platform checks in parallel
    const results = await Promise.all(
      PLATFORMS.map((platform) => checkPlatform(platform, cleanUsername))
    );

    const found = results.filter((r) => r.found === true);
    const notFound = results.filter((r) => r.found === false);
    const unverifiable = results.filter((r) => r.found === null);

    return Response.json({
      username: cleanUsername,
      totalChecked: results.length,
      foundCount: found.length,
      notFoundCount: notFound.length,
      unverifiableCount: unverifiable.length,
      results,
      summary: `Found on ${found.length} of ${results.length - unverifiable.length} verified platforms.`,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
