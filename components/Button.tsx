import Link from "next/link";

type ButtonProps = {
  label: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
};

export default function Button({
  label,
  href,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center border border-blue-700 rounded-xl px-6 py-2 text-black transition-all duration-150";
  const activeStyles =
    "hover:-translate-y-0.5 hover:shadow-md cursor-pointer";
  const disabledStyles =
    "opacity-50 cursor-not-allowed pointer-events-none";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #2563EB 0%, #93B4F5 45%, #ffffff 100%)",
  };

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`${baseStyles} ${activeStyles}`}
        style={styleObj}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? disabledStyles : activeStyles}`}
      style={styleObj}
    >
      {label}
    </button>
  );
}

export function SecondaryButton({
  label,
  href,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center border border-green-700 rounded-xl px-6 py-2 text-black transition-all duration-150";
  const activeStyles =
    "hover:-translate-y-0.5 hover:shadow-md cursor-pointer";
  const disabledStyles =
    "opacity-50 cursor-not-allowed pointer-events-none";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #22C55E 0%, #86EFAC 45%, #ffffff 100%)",
  };

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`${baseStyles} ${activeStyles}`}
        style={styleObj}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? disabledStyles : activeStyles}`}
      style={styleObj}
    >
      {label}
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
      className={`w-24 h-24 rounded-sm border-2 shadow-inner shadow-black/40 ${
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