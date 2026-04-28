export async function POST(req) {
  const { origin, destinations } = await req.json();
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return Response.json([
      { destination: "전체", distance: "API 키 없음" }
    ]);
  }

  const url =
    "https://maps.googleapis.com/maps/api/distancematrix/json" +
    `?origins=${encodeURIComponent(origin)}` +
    `&destinations=${encodeURIComponent(destinations.join("|"))}` +
    `&mode=driving` +
    `&language=ko` +
    `&region=kr` +
    `&units=metric` +
    `&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    return Response.json([
      {
        destination: "전체",
        distance: "API 오류",
        detail: data.error_message || data.status,
      },
    ]);
  }

  const elements = data.rows?.[0]?.elements || [];

  const results = destinations.map((dest, index) => {
    const item = elements[index];

    if (!item || item.status !== "OK") {
      return {
        destination: dest,
        distance: "계산 실패",
        detail: item?.status || "응답 없음",
      };
    }

    return {
      destination: dest,
      distance: item.distance.text,
      duration: item.duration.text,
    };
  });

  return Response.json(results);
}
