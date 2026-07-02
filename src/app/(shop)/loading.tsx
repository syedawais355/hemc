export default function Loading() {
  return (
    <div className="container" aria-busy="true" aria-label="Loading">
      <div className="skeleton-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="skel-card" key={i}>
            <div className="skel skel--media" />
            <div className="skel skel--line" style={{ width: "70%" }} />
            <div className="skel skel--line" style={{ width: "45%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
