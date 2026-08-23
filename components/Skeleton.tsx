export function SkeletonBarra({ largura = "100%", altura = 16 }: { largura?: string; altura?: number }) {
  return <div className="skeleton-barra" style={{ width: largura, height: altura }} />;
}

export function SkeletonResultado() {
  return (
    <div className="container secao" style={{ maxWidth: 720 }}>
      <SkeletonBarra largura="140px" altura={12} />
      <div style={{ marginTop: 12 }}>
        <SkeletonBarra largura="60%" altura={32} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-bola" />
        ))}
      </div>
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBarra key={i} largura={`${92 - i * 8}%`} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTabela() {
  return (
    <div className="container secao" style={{ maxWidth: 880 }}>
      <SkeletonBarra largura="120px" altura={12} />
      <div style={{ marginTop: 12 }}>
        <SkeletonBarra largura="50%" altura={30} />
      </div>
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBarra key={i} altura={38} />
        ))}
      </div>
    </div>
  );
}
