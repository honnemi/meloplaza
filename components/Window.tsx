type WindowProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Window({ title, children, footer }: WindowProps) {
  return (
    <div className="relative z-10 flex flex-col w-[60%] h-150 overflow-hidden rounded-lg border-2 border-gray-400 shadow-md">
      {/* Top bar */}
      <div
        className="shrink-0 font-[Geist_Pixel] bg-gray-300 border-b-2 border-gray-400 p-4 text-lg font-bold text-black text-center shadow-md select-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 5px)",
        }}
      >
        {title}
      </div>

      {/* Main content */}
      <div
        className="flex-1 bg-gray-200 p-4 min-h-0 relative"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 5px)",
        }}
      >
        <div className="h-full bg-white p-6 text-black rounded-sm border-gray-300 border-2 overflow-y-auto relative z-10 shadow-inner shadow-black/40">
          {children}
        </div>
      </div>

      {/* Bottom bar */}
      {footer && (
        <div
          className="shrink-0 border-t-2 border-gray-400 bg-gray-300 p-4 shadow-md relative z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 5px)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
