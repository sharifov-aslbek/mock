export function BrowserBar() {
  return (
    <div className="w-full select-none" style={{ backgroundColor: "#242424" }}>
      {/* Tab bar */}
      <div
        className="flex items-end px-2 pt-1.5 gap-0.5"
        style={{ backgroundColor: "#1c1c1c" }}
      >
        {/* Yandex tab */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs"
          style={{
            backgroundColor: "#2e2e2e",
            color: "#aaa",
            maxWidth: 200,
            minWidth: 150,
            fontSize: 11,
          }}
        >
          <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: "#e8382e" }} />
          <span className="truncate">Yandex — internetda tezkor qidir...</span>
          <span className="ml-auto text-gray-600 hover:text-gray-400 cursor-pointer shrink-0">✕</span>
        </div>

        {/* MilliyMock tab — active */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs"
          style={{
            backgroundColor: "#242424",
            color: "#fff",
            maxWidth: 180,
            minWidth: 140,
            fontSize: 11,
          }}
        >
          <div
            className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <span style={{ fontSize: 8, color: "#fff", lineHeight: 1 }}>M</span>
          </div>
          <span className="truncate font-medium">MilliyMock</span>
          <span className="ml-auto text-gray-500 hover:text-gray-300 cursor-pointer shrink-0">✕</span>
        </div>

        {/* Admin Dashboard tab */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs"
          style={{
            backgroundColor: "#2e2e2e",
            color: "#aaa",
            maxWidth: 200,
            minWidth: 160,
            fontSize: 11,
          }}
        >
          <span className="shrink-0" style={{ fontSize: 11 }}>🌐</span>
          <span className="truncate">Admin Dashboard UI Design</span>
          <span className="ml-auto text-gray-600 hover:text-gray-400 cursor-pointer shrink-0">✕</span>
        </div>

        {/* New tab */}
        <div
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 cursor-pointer rounded-full mb-0.5 text-base"
        >
          +
        </div>
      </div>

      {/* Address / toolbar bar */}
      <div className="flex items-center gap-3 px-3 py-2" style={{ backgroundColor: "#242424" }}>
        {/* Nav arrows */}
        <div className="flex items-center gap-0.5">
          {[
            <path key="back" d="M15 18l-6-6 6-6" />,
            <path key="fwd" d="M9 18l6-6-6-6" />,
            <><path key="r1" d="M1 4v6h6" /><path key="r2" d="M23 20v-6h-6" /><path key="r3" d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></>,
          ].map((p, i) => (
            <button
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition"
              style={{ color: i === 1 ? "#555" : "#aaa" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {p}
              </svg>
            </button>
          ))}
        </div>

        {/* URL bar */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#333", color: "#ccc", fontSize: 12 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span style={{ color: "#777" }}>https://</span>
          <span style={{ color: "#ccc" }}>milliysertifikat.netlify.app</span>
          <span style={{ color: "#888" }}>/natija</span>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium transition hover:opacity-90"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #444", fontSize: 11 }}
          >
            Verify it's you
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#2563eb" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
          </button>
          {["⋯", "Chat"].map((lbl) => (
            <button
              key={lbl}
              className="px-2 py-1 rounded text-xs hover:bg-white/10 transition"
              style={{ color: lbl === "Chat" ? "#60a5fa" : "#888" }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
