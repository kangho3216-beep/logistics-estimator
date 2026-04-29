export async function POST(req) {
  const { origin, destinations } = await req.json();
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  const results = [];

  for (const dest of destinations) {
    try {
      const res = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
          },
          body: JSON.stringify({
            origin: {
              address: origin,
            },
            destination: {
              address: dest,
            },
            travelMode: "DRIVE",
            languageCode: "ko-KR",
            units: "METRIC",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        results.push({
          destination: dest,
          distance: "API 오류",
          detail: data.error?.message || "알 수 없는 오류",
        });
        continue;
      }

      const route = data.routes?.[0];

      if (!route?.distanceMeters) {
        results.push({
          destination: dest,
          distance: "경로 없음",
        });
        continue;
      }

      results.push({
        destination: dest,
        distance: `${(route.distanceMeters / 1000).toFixed(1)} km`,
        duration: route.duration || "",
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
