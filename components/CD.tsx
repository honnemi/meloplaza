export default function CD() {
  return (
    <div
      className="w-35 h-35 rounded-full shrink-0 relative overflow-hidden"
      style={{
        border: "2px solid #2f8a99",
        boxShadow:
          "inset 2px 2px 3px rgba(255,255,255,0.8), inset -2px -2px 3px rgba(0,90,100,0.25), 2px 2px 0 rgba(0,90,100,0.2)",
      }}
    >
      {/* CD */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 20deg, #e6fafc, #7ee3ea, #ffb3c4, #fff0a0, #b3f0df, #a8d4ff, #e6fafc)",
        }}
      >
        {/* CD rings */}
        <div
          className="absolute inset-[15%] rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.5)" }}
        />

        <div
          className="absolute inset-[30%] rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.45)" }}
        />

        {/* CD hole */}
        <div
          className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "14%",
            height: "14%",
            background: "#0f4a52",
            border: "1px solid #072a30",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3)",
          }}
        />
      </div>

      {/* CD glare */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(125deg, transparent 25%, rgba(255,255,255,0.8) 42%, transparent 52%)",
        }}
      />
    </div>
  );
}