export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
        <span className="text-sm font-semibold text-text">
          © 2026 Candid. Honest feedback on where you actually stand.
        </span>
        <div className="flex gap-6 text-xs">
          <a
            className="hover:text-primary hover:underline transition-colors"
            href="/privacy"
          >
            Privacy Policy
          </a>
          <a
            className="hover:text-primary hover:underline transition-colors"
            href="/terms"
          >
            Terms of Service
          </a>
          <a
            className="hover:text-primary hover:underline transition-colors"
            href="/help"
          >
            Help
          </a>
        </div>
      </div>
    </footer>
  );
}
