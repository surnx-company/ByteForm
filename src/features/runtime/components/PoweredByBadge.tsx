import Link from "next/link";

/**
 * Subtle "Made with ByteForm" attribution badge.
 * Shown on all published forms — the freemium growth loop.
 * Positioned absolutely so the parent (FormView) controls placement.
 */
export function PoweredByBadge() {
  return (
    <Link
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        bg-fg/5 hover:bg-fg/10 border border-fg/10 hover:border-fg/20
        text-fg-dim hover:text-fg-muted text-xs font-medium
        transition-all duration-200 select-none"
    >
      {/* Mini logo mark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-icon.svg"
        alt=""
        aria-hidden
        className="h-3.5 w-3.5 opacity-60 group-hover:opacity-80 transition-opacity"
      />
      Made with ByteForm
    </Link>
  );
}
