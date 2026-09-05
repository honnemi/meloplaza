import Link from "next/link";

type ButtonProps = {
  label: string;
  href?: string;
  type?: "button" | "submit" | "reset";
};

export default function Button({ label, href, type = "button" }: ButtonProps) {
  const styles =
    "inline-flex items-center justify-center border border-blue-700 rounded-xl px-6 py-2 text-black transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #2563EB 0%, #93B4F5 45%, #ffffff 100%)",
  };

  if (href) {
    return (
      <Link href={href} className={styles} style={styleObj}>
        {label}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} style={styleObj}>
      {label}
    </button>
  );
}

export function SecondaryButton({ label, href, type = "button" }: ButtonProps) {
  const styles =
    "inline-flex items-center justify-center border border-green-700 rounded-xl px-6 py-2 text-black transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer";

  const styleObj = {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, #22C55E 0%, #86EFAC 45%, #ffffff 100%)",
  };

  if (href) {
    return (
      <Link href={href} className={styles} style={styleObj}>
        {label}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} style={styleObj}>
      {label}
    </button>
  );
}
