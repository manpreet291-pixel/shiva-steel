import useTheme from '../hooks/useTheme.js';

export default function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const night = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={night ? 'Switch to day mode' : 'Switch to night mode'}
      title={night ? 'Day mode' : 'Night mode'}
    >
      <svg className="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" fill="currentColor" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.100 2.100M19.100 4.900 17 7M7 17l-2.100 2.100" />
      </svg>
      <svg className="ic-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.500 14.500A8.500 8.500 0 0 1 9.500 3.500a8.500 8.500 0 1 0 11 11Z" />
      </svg>
    </button>
  );
}
