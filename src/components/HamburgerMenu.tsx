interface HamburgerMenuProps {
  onClick: () => void;
  className?: string;
}

export default function HamburgerMenu({ onClick, className = '' }: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className={`lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors ${className}`}
      aria-label="Toggle sidebar"
      type="button"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
