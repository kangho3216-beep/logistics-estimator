export async function POST(req) {
  const { origin, destinations } = await req.json();
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  // 🔹 주소 → 좌표 변환 함수
  async function getLatLng(address) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${API_KEY}`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0].geometry.location;
  }

  const originLatLng = await getLatLng(origin);

  if (!originLatLng) {
    return Response.json([
      {
        destination: "전체",
        distance: "출발지 좌표 실패",
      },
    ]);
  }

  const results = [];

  for (let dest of destinations) {
    try {
      const destLatLng = await getLatLng(dest);

      if (!destLatLng) {
        results.push({
          destination: dest,
          distance: "좌표 변환 실패",
        });
        continue;
      }

      const res = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: originLatLng,
              },
            },
            destination: {
              location: {
                latLng: destLatLng,
              },
            },
            travelMode: "DRIVE",
          }),
        }
      );

      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        results.push({
          destination: dest,
          distance: "경로 없음",
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
      });
    }
  }

  return Response.json(results);
}
