'use client';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 40 }}>
      <h2>관리자 페이지 오류가 발생했습니다.</h2>
      <pre>{error.message}</pre>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
} 