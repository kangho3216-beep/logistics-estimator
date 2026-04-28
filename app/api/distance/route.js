export async function POST(req) {
  const { origin, destinations } = await req.json();
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return Response.json([
      { destination: "전체", distance: "API 키 없음" }
    ]);
  }

  async function geocode(address) {
    const url =
      "https://maps.googleapis.com/maps/api/geocode/json" +
      `?address=${encodeURIComponent(address + " 대한민국")}` +
      `&language=ko` +
      `&region=kr` +
      `&key=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return { error: data.error_message || data.status };
    }

    const loc = data.results[0].geometry.location;
    return `${loc.lat},${loc.lng}`;
  }

  const originCoord = await geocode(origin);

  if (originCoord.error) {
    return Response.json([
      {
        destination: "전체",
        distance: "출발지 좌표 변환 실패",
        detail: originCoord.error,
      },
    ]);
  }

  const destCoords = [];

  for (const dest of destinations) {
    const coord = await geocode(dest);

    if (coord.error) {
      destCoords.push(null);
    } else {
      destCoords.push(coord);
    }
  }

  const validCoords = destCoords.filter(Boolean);

  if (validCoords.length === 0) {
    return Response.json([
      {
        destination: "전체",
        distance: "도착지 좌표 변환 실패",
      },
    ]);
  }

  const url =
    "https://maps.googleapis.com/maps/api/distancematrix/json" +
    `?origins=${encodeURIComponent(originCoord)}` +
    `&destinations=${encodeURIComponent(validCoords.join("|"))}` +
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
        distance: "Distance Matrix API 오류",
        detail: data.error_message || data.status,
      },
    ]);
  }

  const elements = data.rows?.[0]?.elements || [];
  let validIndex = 0;

  const results = destinations.map((dest, index) => {
    if (!destCoords[index]) {
      return {
        destination: dest,
        distance: "좌표 변환 실패",
      };
    }

    const item = elements[validIndex];
    validIndex++;

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
