type WindowProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function Window({
  title,
  children,
  footer,
  className = "",
  contentClassName = "",
}: WindowProps) {
  return (
    <div
      className={`relative z-10 flex flex-col w-[60%] h-150 overflow-hidden rounded-md
        border-2 border-gray-500
        shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
        ${className}`}
    >
      {/* Top bar */}
      <div
        className="shrink-0 
          bg-gray-300
          border-b-2 border-gray-500
          p-3 text-lg font-bold text-black text-center
          select-none
          shadow-[inset_0_1px_0px_rgba(255,255,255,0.9)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 5px)",
        }}
      >
        {title}
      </div>

      {/* Main content */}
      <div
        className="flex-1 bg-gray-200 p-4 min-h-0 relative
          shadow-[inset_0_1px_0px_rgba(255,255,255,0.7)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 5px)",
        }}
      >
        <div
          className={`h-full bg-gray-50 p-6 text-black
            rounded-sm
            border-2 border-gray-300
            overflow-y-auto relative z-10
            shadow-[inset_1px_1px_0px_rgba(0,0,0,0.18),inset_-1px_-1px_0px_rgba(255,255,255,0.9)]
            ${contentClassName}`}
        >
          {children}
        </div>
      </div>

      {/* Bottom bar */}
      {footer && (
        <div
          className="shrink-0
            border-t-2 border-gray-500
            bg-gray-300
            p-3
            relative z-10
            shadow-[inset_0_1px_0px_rgba(255,255,255,0.8)]"
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
