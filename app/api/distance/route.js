export async function POST(req) {
  const { origin, destinations } = await req.json();

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return Response.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const results = [];

  for (let dest of destinations) {
    try {
      const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
"X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline",
        },
body: JSON.stringify({
  origin: {
    address: origin,
  },
  destination: {
    address: dest,
  },
  travelMode: "DRIVE",
  routingPreference: "TRAFFIC_AWARE",
  computeAlternativeRoutes: false,
  languageCode: "ko-KR",
  units: "METRIC",
}),
      });

      const data = await res.json();

      if (!res.ok) {
        results.push({
          destination: dest,
          distance: "에러",
          detail: data.error?.message || "API 오류",
        });
        continue;
      }

      const meters = data.routes?.[0]?.distanceMeters;

      results.push({
        destination: dest,
        distance: meters ? `${(meters / 1000).toFixed(1)} km` : "경로 없음",
        duration: data.routes?.[0]?.duration || "",
      });
    } catch (err) {
      results.push({
        destination: dest,
        distance: "에러",
        detail: err.message,
      });
    }
  }

  return Response.json(results);
}
