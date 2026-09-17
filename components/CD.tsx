export default function CD() {
  return (
    <div
      className="w-35 h-35 rounded-full shrink-0 relative overflow-hidden"
      style={{
        border: "2px solid #7C8992",
        boxShadow:
          "inset 2px 2px 3px rgba(255,255,255,0.8), inset -2px -2px 3px rgba(0,0,0,0.2), 2px 2px 0 rgba(0,0,0,0.15)",
      }}
    >
      {/* CD */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 20deg, #dce9ef, #a8c8d8, #e7bfd2, #f3dfad, #b9dfd0, #b8c8e8, #dce9ef)",
        }}
      >
        {/* CD rings */}
        <div
          className="absolute inset-[15%] rounded-full"
          style={{
            border: "1px solid rgba(255,255,255,0.45)",
          }}
        />

        <div
          className="absolute inset-[30%] rounded-full"
          style={{
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        />

        {/* Spindle */}
        <div
          className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "14%",
            height: "14%",
            background: "#26353A",
            border: "1px solid #10191C",
            boxShadow:
              "inset 0 1px 2px rgba(255,255,255,0.25)",
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