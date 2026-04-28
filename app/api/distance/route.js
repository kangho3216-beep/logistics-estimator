export async function POST(req) {
  const { origin, destinations } = await req.json();

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return Response.json(
      [{ destination: "전체", distance: "API 키 없음" }],
      { status: 500 }
    );
  }

  async function getLatLng(address) {
    const url =
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      encodeURIComponent(address) +
      "&language=ko&region=kr&key=" +
      API_KEY;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return {
        error: data.error_message || data.status,
      };
    }

    const location = data.results[0].geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  }

  const originCoord = await getLatLng(origin);

  if (originCoord.error) {
    return Response.json([
      {
        destination: "전체",
        distance: "출발지 좌표 변환 실패",
        detail: originCoord.error,
      },
    ]);
  }

  const results = [];

  for (const dest of destinations) {
    const destCoord = await getLatLng(dest);

    if (destCoord.error) {
      results.push({
        destination: dest,
        distance: "도착지 좌표 변환 실패",
        detail: destCoord.error,
      });
      continue;
    }

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
            routingPreference: "TRAFFIC_UNAWARE",
            languageCode: "ko-KR",
            units: "METRIC",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        results.push({
          destination: dest,
          distance: "Routes API 오류",
          detail: data.error?.message || "알 수 없는 오류",
        });
        continue;
      }

      const meters = data.routes?.[0]?.distanceMeters;

      results.push({
        destination: dest,
        distance: meters ? `${(meters / 1000).toFixed(1)} km` : "경로 없음",
        duration: data.routes?.[0]?.duration || "",
      });
    } catch (error) {
      results.push({
        destination: dest,
        distance: "서버 오류",
        detail: error.message,
      });
    }
  }

  return Response.json(results);
}
