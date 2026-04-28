export async function POST(req) {
  const { origin, destinations } = await req.json();

  const API_KEY = "AIzaSyCr1qVtOAtl0tokrB8NWlWNcD4_kjhBA7I";

  const results = [];

  for (let dest of destinations) {
    const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: dest },
        travelMode: "DRIVE",
      }),
    });

    const data = await res.json();

    const distance =
      data.routes?.[0]?.distanceMeters
        ? (data.routes[0].distanceMeters / 1000).toFixed(1) + " km"
        : "에러";

    results.push({
      destination: dest,
      distance,
    });
  }

  return Response.json(results);
}
