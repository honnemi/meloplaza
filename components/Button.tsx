import { Link } from "next-view-transitions";
import type { ReactNode } from "react";

type ButtonProps = {
  label: string;
  icon?: ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
};

// Play sound on click
function playClickSound() {
  if (typeof window !== "undefined") {
    const clickAudio = new Audio("/assets/click.mp3");
    clickAudio.volume = 0.5;
    clickAudio.play().catch((err) => console.error("Audio blocked by browser:", err));
  }
}

export default function Button({
  label,
  icon,
  href,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "tracking-wide font-heading font-bold leading-none inline-flex items-center justify-center gap-2 border-2 border-[#0097A7] rounded-full px-6 py-2 transition-[filter,transform,box-shadow] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,90,100,0.4),0_2px_2px_rgba(0,0,0,0.25)]";

  const activeStyles =
    "hover:-translate-y-0.5 hover:brightness-110 active:translate-y-[1px] active:brightness-95 active:shadow-[inset_0_2px_4px_rgba(0,90,100,0.5),0_1px_1px_rgba(0,0,0,0.2)] cursor-pointer";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #00C3D0 0%, #7EE3EA 45%, #ffffff 100%)",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  const content = (
    <>
      {icon && (
        <span className="inline-flex h-4 w-4 items-center justify-center leading-none">
          {icon}
        </span>
      )}
      <span className="leading-none">{label}</span>
    </>
  );

  // Unified click handler that triggers sound + consumer logic
  const handleClick = (e: React.MouseEvent) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`${baseStyles} ${activeStyles}`}
        style={styleObj}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? disabledStyles : activeStyles}`}
      style={styleObj}
    >
      {content}
    </button>
  );
}

export function SecondaryButton({
  label,
  icon,
  href,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "tracking-wide font-heading font-bold leading-none inline-flex items-center justify-center gap-2 border-2 border-[#2BB37A] rounded-full px-6 py-2 transition-[filter,transform,box-shadow] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,110,70,0.4),0_2px_2px_rgba(0,0,0,0.25)]";

  const activeStyles =
    "hover:-translate-y-0.5 hover:brightness-110 active:translate-y-[1px] active:brightness-95 active:shadow-[inset_0_2px_4px_rgba(0,110,70,0.5),0_1px_1px_rgba(0,0,0,0.2)] cursor-pointer";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #4FE3A0 0%, #A6F3CF 45%, #ffffff 100%)",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  const content = (
    <>
      {icon && (
        <span className="inline-flex h-4 w-4 items-center justify-center leading-none">
          {icon}
        </span>
      )}
      <span className="leading-none">{label}</span>
    </>
  );

  const handleClick = (e: React.MouseEvent) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`${baseStyles} ${activeStyles}`}
        style={styleObj}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? disabledStyles : activeStyles}`}
      style={styleObj}
    >
      {content}
    </button>
  );
}

interface ColourButtonProps {
  colour: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export function ColourButton({
  colour,
  onClick,
  disabled = false,
}: ColourButtonProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
      className={`w-24 h-24 rounded-sm border-2 border-t-win-border-dark border-l-win-border-dark border-b-win-border-alt border-r-win-border-alt ${
        disabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "cursor-pointer"
      }`}
      style={{
        backgroundImage: `linear-gradient(to bottom, ${colour}, #fff)`,
      }}
    />
  );
}
