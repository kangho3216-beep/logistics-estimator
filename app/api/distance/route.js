export async function POST(req) {
  const { origin, destinations } = await req.json();

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  const results = [];

  for (let dest of destinations) {
    try {
      const res = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,

            // ⭐⭐⭐ 이게 핵심
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration",
          },
          body: JSON.stringify({
            origin: {
              address: origin,
            },
            destination: {
              address: dest,
            },
            travelMode: "DRIVE",
          }),
        }
      );

      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        results.push({
          destination: dest,
          distance: "계산 실패",
          detail: "ZERO_RESULTS",
        });
        continue;
      }

      const route = data.routes[0];

      results.push({
        destination: dest,
        distance: (route.distanceMeters / 1000).toFixed(1) + " km",
        duration: route.duration.replace("s", "초"),
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
