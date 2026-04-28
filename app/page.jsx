"use client";

import { useState } from "react";

const DESTINATIONS = [
  "서울특별시 강남구 테헤란로 152",
  "서울특별시 송파구 올림픽로 326",
  "인천광역시 남동구 남동대로 809",
  "경기도 수원시 팔달구 효원로 241",
  "충청남도 천안시 서북구 번영로 156",
  "대전광역시 서구 둔산로 100",
  "대구광역시 중구 공평로 88",
  "부산광역시 연제구 중앙대로 1001",
];

export default function Home() {
  const [start, setStart] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!start) {
      alert("출발지를 입력해라");
      return;
    }

    setLoading(true);
    setResult([]);

    const res = await fetch("/api/distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: start,
        destinations: DESTINATIONS,
      }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚛 물류 자동 견적기</h1>
      <p>출발지를 입력하면 등록된 도착지까지 거리 계산</p>

      <input
        value={start}
        onChange={(e) => setStart(e.target.value)}
        placeholder="출발지 입력"
        style={{ padding: "10px", width: "300px" }}
      />

      <br /><br />

      <button onClick={handleClick} style={{ padding: "10px 20px" }}>
        {loading ? "계산중..." : "거리 계산"}
      </button>

      <h3 style={{ marginTop: "30px" }}>📍 도착지 목록</h3>
      <ul>
        {DESTINATIONS.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>

      <h3 style={{ marginTop: "30px" }}>📊 계산 결과</h3>
      <ul>
{result.map((r, i) => (
  <li key={i}>
    {start} → {r.destination} : {r.distance}
    {r.detail && (
      <span style={{ color: "red" }}> ({r.detail})</span>
    )}
  </li>
))}
      </ul>
    </div>
  );
}
