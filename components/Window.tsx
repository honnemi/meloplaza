type WindowProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function Window({
  title,
  icon,
  children,
  footer,
  className = "",
  contentClassName = "",
}: WindowProps) {
  return (
    <div
      className={`relative z-10 flex flex-col md:w-[60%] md:h-150 sm:w-full sm:h-full overflow-hidden rounded-md
        border-2 border-win-border-dark
        shadow-[3px_3px_0px_rgba(0,90,100,0.3)]
        ${className}`}
    >
      {/* Top bar */}
      <div
        className="shrink-0
          bg-(image:--win-titlebar)
          border-b-2 border-win-border-dark
          p-3 text-lg font-bold 
          select-none
          shadow-[inset_0_1px_0px_rgba(255,255,255,0.9)]
          flex items-center justify-center gap-2"
      >
        {icon && (
          <span className="inline-flex h-5 w-5 items-center justify-center leading-none">
            {icon}
          </span>
        )}

        <h1 className="leading-none">{title}</h1>
      </div>

      {/* Main content */}
      <div
        className="flex-1 bg-win p-2 min-h-0 relative
          shadow-[inset_0_1px_0px_rgba(255,255,255,0.7)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.35) 3px, rgba(255,255,255,0.35) 5px)",
        }}
      >
        <div
          className={`h-full bg-white/60 p-6 
            rounded-sm
            border-2 border-win-border
            overflow-y-auto relative z-10 scroll-smooth
            shadow-[inset_1px_1px_0px_rgba(0,90,100,0.25),inset_-1px_-1px_0px_rgba(255,255,255,0.9)]
            ${contentClassName}`}
        >
          {children}
        </div>
      </div>

      {/* Bottom bar */}
      {footer && (
        <div
          className="shrink-0
            border-t-2 border-win-border-dark
            bg-win-alt
            p-3
            relative z-10
            shadow-[inset_0_1px_0px_rgba(255,255,255,0.8)]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #f4fcfd 0%, #d5f0f5 50%, #bfe6ec 100%)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
