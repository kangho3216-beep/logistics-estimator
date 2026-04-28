"use client";

import { useState } from "react";

export default function Home() {
  const [start, setStart] = useState("");

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚛 물류 자동 견적기</h1>
      <p>출발지를 입력하면 전체 거리 계산 예정</p>

      <input
        value={start}
        onChange={(e) => setStart(e.target.value)}
        placeholder="출발지 입력 (예: 충남 아산시 수장로 67)"
        style={{ padding: "10px", width: "350px" }}
      />

      <br /><br />

      <button style={{ padding: "10px 20px" }}>
        거리 계산
      </button>
    </div>
  );
}
