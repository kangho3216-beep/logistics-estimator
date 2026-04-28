export async function POST(req) {
  const { origin, destinations } = await req.json();
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  const results = [];

  for (let dest of destinations) {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        dest
      )}&mode=driving&language=ko&region=kr&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        results.push({
          destination: dest,
          distance: "경로 없음",
        });
        continue;
      }

      const leg = data.routes[0].legs[0];

      results.push({
        destination: dest,
        distance: leg.distance.text,
        duration: leg.duration.text,
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
