export default function Home() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚛 물류 자동 견적기</h1>
      <p>출발지를 입력하면 전체 거리 계산 예정</p>

      <input
        placeholder="출발지 입력"
        style={{ padding: "10px", width: "300px" }}
      />

      <br /><br />

      <button style={{ padding: "10px 20px" }}>
        거리 계산
      </button>
    </div>
  );
}
