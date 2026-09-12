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

export default function Button({
  label,
  icon,
  href,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 border-2 border-blue-600 rounded-full px-6 py-2 text-black transition-[filter,transform,box-shadow] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,60,160,0.4),0_2px_2px_rgba(0,0,0,0.25)]";

  const activeStyles =
    "hover:-translate-y-0.5 hover:brightness-110 active:translate-y-[1px] active:brightness-95 active:shadow-[inset_0_2px_4px_rgba(0,60,160,0.5),0_1px_1px_rgba(0,0,0,0.2)] cursor-pointer";

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #2563EB 0%, #93B4F5 45%, #ffffff 100%)",
  };

  const content = (
    <>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
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
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${
        disabled ? disabledStyles : activeStyles
      }`}
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
    "inline-flex items-center justify-center gap-2 border-2 border-green-700 rounded-full px-6 py-2 text-black transition-[filter,transform,box-shadow] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,100,40,0.4),0_2px_2px_rgba(0,0,0,0.25)]";

  const activeStyles =
    "hover:-translate-y-0.5 hover:brightness-110 active:translate-y-[1px] active:brightness-95 active:shadow-[inset_0_2px_4px_rgba(0,100,40,0.5),0_1px_1px_rgba(0,0,0,0.2)] cursor-pointer";

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #22C55E 0%, #86EFAC 45%, #ffffff 100%)",
  };

  const content = (
    <>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
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
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${
        disabled ? disabledStyles : activeStyles
      }`}
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
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-24 h-24 rounded-sm border-2 border-gray-500 border-t-gray-600 border-l-gray-600 border-b-gray-300 border-r-gray-300 ${
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
