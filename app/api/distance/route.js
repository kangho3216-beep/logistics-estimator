export async function POST(req) {
  const { origin, destinations } = await req.json();

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  const results = [];

  // 🔹 주소 → 좌표 변환 함수
  const getLatLng = async (address) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${API_KEY}`
    );

    const data = await res.json();

    if (data.status !== "OK") return null;

    return data.results[0].geometry.location;
  };

  const originCoord = await getLatLng(origin);

  if (!originCoord) {
    return Response.json([{ error: "출발지 좌표 변환 실패" }]);
  }

  for (let dest of destinations) {
    const destCoord = await getLatLng(dest);

    if (!destCoord) {
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
          "X-Goog-FieldMask": "routes.distanceMeters",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: originCoord,
            },
          },
          destination: {
            location: {
              latLng: destCoord,
            },
          },
          travelMode: "DRIVE",
        }),
      }
    );

    const data = await res.json();

    const meters = data.routes?.[0]?.distanceMeters;

    results.push({
      destination: dest,
      distance: meters
        ? (meters / 1000).toFixed(1) + " km"
        : "경로 없음",
    });
  }

  return Response.json(results);
}
