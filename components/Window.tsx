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
      className={`relative z-10 flex flex-col
        w-[calc(100%-1rem)] sm:w-full md:w-[60%]
        max-h-[calc(100dvh-2rem)]
        h-150
        overflow-hidden rounded-md
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
          flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center leading-none">
              {icon}
            </span>
          )}
          <h1 className="leading-none truncate">{title}</h1>
        </div>

        {/* Window controls wrapper */}
        <div className="flex items-center gap-1.5 pl-4 shrink-0">
          {/* Green button */}
          <div
            className="w-4 h-4 rounded-full border border-green-800 transition-[filter,transform] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,100,20,0.4),0_1px_2px_rgba(0,0,0,0.25)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[1px] active:brightness-95 cursor-pointer"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 25%, transparent 45%),
                linear-gradient(to bottom, #28CD41 0%, #34E050 45%, #DDFCE5 100%)
              `,
            }}
          ></div>

          {/* Yellow button */}
          <div
            className="w-4 h-4 rounded-full border border-amber-700 transition-[filter,transform] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(150,80,0,0.4),0_1px_2px_rgba(0,0,0,0.25)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[1px] active:brightness-95 cursor-pointer"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 25%, transparent 45%),
                linear-gradient(to bottom, #FFBD2E 0%, #FFCC4D 45%, #FFF6D6 100%)
              `,
            }}
          ></div>

          {/* Red button */}
          <div
            className="w-4 h-4 rounded-full border border-red-800 transition-[filter,transform] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(140,0,20,0.4),0_1px_2px_rgba(0,0,0,0.25)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[1px] active:brightness-95 cursor-pointer"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 25%, transparent 45%),
                linear-gradient(to bottom, #FF5F56 0%, #FF7B73 45%, #FFEBEA 100%)
              `,
            }}
          ></div>
        </div>
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
          className={`h-full bg-white/60
            p-4 sm:p-6
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
