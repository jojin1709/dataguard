const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export async function GET(request) {
  const uuid = new URL(request.url).searchParams.get("uuid");
  if (!UUID.test(uuid || "")) return Response.json({ error: "Invalid urlscan result identifier." }, { status: 400 });

  const keys = [process.env.URLSCAN_API_KEY, process.env.URLSCAN_API_KEY_SECONDARY].filter(Boolean);
  if (!keys.length) return Response.json({ error: "urlscan.io is not configured." }, { status: 503 });

  for (const apiKey of keys) {
    try {
      const response = await fetch(`https://urlscan.io/api/v1/result/${uuid}/`, {
        headers: { "API-Key": apiKey, Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (response.status === 404) continue;
      if (!response.ok) continue;
      const data = await response.json();
      const domains = [...new Set((data.data?.requests || []).map((entry) => {
        try {
          return new URL(entry.request?.request || entry.request?.url || entry.url).hostname;
        } catch {
          return null;
        }
      }).filter(Boolean))].slice(0, 20);

      return Response.json({
        status: "complete",
        uuid,
        resultUrl: `https://urlscan.io/result/${uuid}/`,
        screenshotUrl: `https://urlscan.io/screenshots/${uuid}.png`,
        page: {
          url: data.page?.url || null,
          domain: data.page?.domain || null,
          title: data.page?.title || null,
          ip: data.page?.ip || null,
          server: data.page?.server || null,
          status: data.page?.status || null,
        },
        task: { visibility: data.task?.visibility || "unlisted", time: data.task?.time || null },
        domains,
        requestCount: data.data?.requests?.length || 0,
      }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("urlscan result error:", error.message);
    }
  }
  return Response.json({ status: "queued", uuid }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
