import ShapeGrid from "@/components/GridBg";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 text-black">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ShapeGrid
          speed={0.1}
          squareSize={50}
          direction="down"
          borderColor="#BAE6FD"
          hoverFillColor="#E0F2FE"
          shape="square"
          hoverTrailAmount={0}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
