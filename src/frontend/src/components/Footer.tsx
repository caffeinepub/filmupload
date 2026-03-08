import { Link } from "@tanstack/react-router";
import { Film, Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="mt-auto border-t border-border/50 bg-background/80 pt-8 pb-6">
      <div className="container mx-auto px-4">
        {/* Top row: logo + tagline + quick links */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-gold/70" />
              <span className="font-display text-sm font-semibold tracking-wide text-foreground/70">
                FilmUpload
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              सिनेमा की दुनिया में आपका स्वागत है
            </p>
            <p className="text-xs text-muted-foreground/60 italic">
              Welcome to the world of cinema
            </p>
          </div>

          {/* Quick links */}
          <nav className="flex flex-col gap-2" aria-label="Footer navigation">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
              Quick Links
            </p>
            <Link
              to="/"
              data-ocid="footer.browse_link"
              className="text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
            >
              Browse Films
            </Link>
            <Link
              to="/upload"
              data-ocid="footer.upload_link"
              className="text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
            >
              Upload a Film
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-border/30" />

        {/* Bottom row */}
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          © {year}. Built with{" "}
          <Heart className="inline h-3 w-3 text-gold/70 fill-gold/40" /> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline text-gold/70 hover:text-gold transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
