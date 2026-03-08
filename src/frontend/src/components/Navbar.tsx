import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Film, Loader2, LogIn, LogOut, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
      style={{ boxShadow: "0 1px 0 0 oklch(var(--gold) / 0.15)" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          data-ocid="nav.browse_link"
          className="group flex items-center gap-2.5"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-gold/10"
          >
            <Film className="h-4.5 w-4.5 text-gold" size={18} />
          </motion.div>
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="text-gold">Film</span>
            <span className="text-foreground">Upload</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            data-ocid="nav.browse_link"
            className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/")
                ? "text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive("/") && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute inset-0 rounded-md bg-gold/10"
              />
            )}
            <span className="relative z-10">Browse</span>
          </Link>

          {/* Upload link — always visible, disabled when not logged in */}
          {isLoggedIn ? (
            <Link
              to="/upload"
              data-ocid="nav.upload_link"
              className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/upload")
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive("/upload") && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-md bg-gold/10"
                />
              )}
              <Upload className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">Upload</span>
            </Link>
          ) : (
            <span
              title="Sign in to upload"
              data-ocid="nav.upload_link"
              className="relative flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/40 select-none"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload</span>
            </span>
          )}

          {/* Auth Button */}
          {isInitializing ? (
            <Button variant="ghost" size="sm" disabled className="ml-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              data-ocid="nav.logout_button"
              className="ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="nav.login_button"
              className="ml-2 gap-1.5 bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 font-medium"
            >
              {isLoggingIn ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogIn className="h-3.5 w-3.5" />
              )}
              <span>{isLoggingIn ? "Signing in…" : "Sign In"}</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
