import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Clapperboard,
  Film,
  LogIn,
  Search,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { Film as FilmType } from "../backend";
import { FilmCard, FilmCardSkeleton } from "../components/FilmCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllFilms } from "../hooks/useQueries";

// Sample films for initial display when backend has no content
const SAMPLE_FILMS: FilmType[] = [
  {
    id: BigInt(1),
    title: "Beyond the Horizon",
    genre: "Sci-Fi",
    releaseYear: BigInt(2024),
    description:
      "An epic journey to the edge of the known universe. One crew, one mission, no return.",
    uploadedBy: null as never,
    createdAt: BigInt(Date.now()),
    poster: {
      getDirectURL: () =>
        "/assets/generated/poster-beyond-horizon.dim_400x560.jpg",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
    video: {
      getDirectURL: () => "",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
  },
  {
    id: BigInt(2),
    title: "Dark City Reckoning",
    genre: "Thriller",
    releaseYear: BigInt(2023),
    description:
      "A seasoned detective follows a trail of cryptic clues through rain-soaked streets into a conspiracy that goes to the top.",
    uploadedBy: null as never,
    createdAt: BigInt(Date.now()),
    poster: {
      getDirectURL: () => "/assets/generated/poster-dark-city.dim_400x560.jpg",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
    video: {
      getDirectURL: () => "",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
  },
  {
    id: BigInt(3),
    title: "The Firefly Forest",
    genre: "Animation",
    releaseYear: BigInt(2024),
    description:
      "A young girl discovers a magical forest where glowing fireflies hold the secret to saving her family.",
    uploadedBy: null as never,
    createdAt: BigInt(Date.now()),
    poster: {
      getDirectURL: () =>
        "/assets/generated/poster-firefly-forest.dim_400x560.jpg",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
    video: {
      getDirectURL: () => "",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
  },
  {
    id: BigInt(4),
    title: "Ocean's Fury",
    genre: "Documentary",
    releaseYear: BigInt(2023),
    description:
      "Witness the raw power of nature as oceanographers risk everything to document the world's deadliest waves.",
    uploadedBy: null as never,
    createdAt: BigInt(Date.now()),
    poster: {
      getDirectURL: () => "/assets/generated/poster-ocean-fury.dim_400x560.jpg",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
    video: {
      getDirectURL: () => "",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
  },
  {
    id: BigInt(5),
    title: "The Last Dance",
    genre: "Romance",
    releaseYear: BigInt(2024),
    description:
      "Two strangers meet on a rooftop in Paris and share one unforgettable night that will change both their lives.",
    uploadedBy: null as never,
    createdAt: BigInt(Date.now()),
    poster: {
      getDirectURL: () => "/assets/generated/poster-last-dance.dim_400x560.jpg",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
    video: {
      getDirectURL: () => "",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
  },
  {
    id: BigInt(6),
    title: "Temple of the Dark",
    genre: "Horror",
    releaseYear: BigInt(2023),
    description:
      "An expedition team uncovers an ancient temple in the Amazon, releasing something that should have stayed buried.",
    uploadedBy: null as never,
    createdAt: BigInt(Date.now()),
    poster: {
      getDirectURL: () =>
        "/assets/generated/poster-temple-dark.dim_400x560.jpg",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
    video: {
      getDirectURL: () => "",
      getBytes: async () => new Uint8Array(),
      withUploadProgress: () => ({}) as never,
    } as never,
  },
];

const GENRES = [
  "All",
  "Action",
  "Drama",
  "Comedy",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Documentary",
  "Thriller",
  "Animation",
  "Other",
];

const GENRE_COLORS: Record<string, string> = {
  Action: "text-orange-300 bg-orange-300/10 border-orange-300/20",
  Drama: "text-blue-300 bg-blue-300/10 border-blue-300/20",
  Comedy: "text-yellow-300 bg-yellow-300/10 border-yellow-300/20",
  Horror: "text-red-400 bg-red-400/10 border-red-400/20",
  "Sci-Fi": "text-cyan-300 bg-cyan-300/10 border-cyan-300/20",
  Romance: "text-pink-300 bg-pink-300/10 border-pink-300/20",
  Documentary: "text-green-300 bg-green-300/10 border-green-300/20",
  Thriller: "text-purple-300 bg-purple-300/10 border-purple-300/20",
  Animation: "text-teal-300 bg-teal-300/10 border-teal-300/20",
  Other: "text-gray-300 bg-gray-300/10 border-gray-300/20",
};

export function BrowsePage() {
  const { data: backendFilms, isLoading, isError, error } = useGetAllFilms();
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const recentScrollRef = useRef<HTMLDivElement>(null);

  // Use backend films if available, otherwise sample data
  const allFilms = useMemo<FilmType[]>(() => {
    if (backendFilms && backendFilms.length > 0) return backendFilms;
    return SAMPLE_FILMS;
  }, [backendFilms]);

  // Recently added: last 6 films sorted by createdAt desc
  const recentFilms = useMemo(() => {
    return [...allFilms]
      .sort((a, b) => Number(b.createdAt - a.createdAt))
      .slice(0, 6);
  }, [allFilms]);

  // Genre counts
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allFilms.length };
    for (const film of allFilms) {
      counts[film.genre] = (counts[film.genre] ?? 0) + 1;
    }
    return counts;
  }, [allFilms]);

  const filteredFilms = useMemo(() => {
    return allFilms.filter((film) => {
      const matchesSearch =
        search === "" ||
        film.title.toLowerCase().includes(search.toLowerCase()) ||
        film.genre.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = activeGenre === "All" || film.genre === activeGenre;
      return matchesSearch && matchesGenre;
    });
  }, [allFilms, search, activeGenre]);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-cinema-bg.dim_1600x600.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
        <div className="grain absolute inset-0 pointer-events-none" />
        {/* Vignette sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/40 pointer-events-none" />

        <div className="container relative mx-auto px-4 py-20 sm:py-28 w-full">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-gold/80">
                Cinema Archive
              </span>
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Discover <span className="text-gold italic">Extraordinary</span>
              <br />
              Cinema
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-lg leading-relaxed">
              Upload and share your latest films. Browse a curated collection of
              independent and international cinema.
            </p>
            <p className="mt-1.5 text-sm text-gold/60 font-medium tracking-wide">
              अपनी नवीनतम फिल्में अपलोड करें और देखें
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => {
                  document
                    .getElementById("film-grid-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                data-ocid="hero.browse_button"
                className="bg-gold text-background hover:bg-gold/90 font-semibold shadow-glow"
              >
                <Film className="mr-2 h-4 w-4" />
                Browse Films
              </Button>
              {isLoggedIn ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60"
                >
                  <Link to="/upload" data-ocid="hero.upload_button">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Film
                  </Link>
                </Button>
              ) : null}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recently Added Horizontal Scroll */}
      {!isLoading && recentFilms.length > 0 && (
        <section className="py-8 border-b border-border/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                हाल ही में जोड़ी गई फ़िल्में
              </h2>
              <p className="text-xs text-muted-foreground mb-4 tracking-wide">
                Recently Added
              </p>
              <div
                ref={recentScrollRef}
                className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin"
                style={{ scrollbarWidth: "thin" }}
              >
                {recentFilms.map((film, i) => {
                  const genreClass =
                    GENRE_COLORS[film.genre] ?? GENRE_COLORS.Other;
                  return (
                    <motion.div
                      key={film.id.toString()}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="flex-shrink-0 w-64"
                    >
                      <Link
                        to="/film/$id"
                        params={{ id: film.id.toString() }}
                        data-ocid={`recent.item.${i + 1}`}
                        className="group block rounded-lg overflow-hidden border border-border/50 bg-card hover:border-gold/30 transition-all duration-300 hover:shadow-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={film.poster.getDirectURL()}
                            alt={`${film.title} poster`}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ${genreClass}`}
                            >
                              {film.genre}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-display text-sm font-semibold text-foreground line-clamp-1 group-hover:text-gold transition-colors duration-200">
                            {film.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {film.releaseYear.toString()}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <section className="sticky top-16 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search films…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="browse.search_input"
                className="pl-9 h-9 bg-card/60 border-border/50 text-sm focus:border-gold/40 focus:ring-gold/20"
              />
            </div>

            {/* Genre filter tabs with counts */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {GENRES.map((genre) => {
                const genreKey = genre.toLowerCase().replace(/[^a-z0-9]/g, "");
                const count = genreCounts[genre] ?? 0;
                const isAll = genre === "All";
                const isActive = activeGenre === genre;
                const isEmpty = !isAll && count === 0;
                return (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => setActiveGenre(genre)}
                    data-ocid={`browse.${genreKey}.tab`}
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? "bg-gold/20 text-gold border border-gold/30"
                        : isEmpty
                          ? "text-muted-foreground/30 border border-transparent cursor-default"
                          : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                    }`}
                    disabled={isEmpty}
                  >
                    <span>{genre}</span>
                    {!isAll && (
                      <span
                        className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-semibold tabular-nums ${
                          isActive
                            ? "bg-gold/30 text-gold"
                            : isEmpty
                              ? "bg-muted/20 text-muted-foreground/25"
                              : "bg-muted/60 text-muted-foreground/60"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Film Grid */}
      <section id="film-grid-section" className="container mx-auto px-4 py-8">
        {/* Error */}
        {isError && (
          <Alert
            variant="destructive"
            className="mb-6"
            data-ocid="browse.error_state"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load films."}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div
            data-ocid="browse.loading_state"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map(
              (key, i) => (
                <FilmCardSkeleton key={key} index={i} />
              ),
            )}
          </div>
        )}

        {/* Film grid */}
        {!isLoading && (
          <AnimatePresence mode="popLayout">
            {filteredFilms.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                data-ocid="browse.empty_state"
                className="flex flex-col items-center justify-center gap-5 py-24 text-center"
              >
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-border/50 bg-card">
                  <Film className="h-9 w-9 text-muted-foreground/50" />
                  <div className="absolute -inset-px rounded-full border border-gold/10 animate-pulse" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-foreground/70">
                    {search || activeGenre !== "All"
                      ? "No films found"
                      : "कोई फिल्म नहीं मिली"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {search || activeGenre !== "All"
                      ? "Try adjusting your search or filters"
                      : "Be the first to upload a film"}
                  </p>
                </div>
                {!search && activeGenre === "All" && (
                  <div className="mt-2">
                    {isLoggedIn ? (
                      <Button
                        asChild
                        className="bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 font-medium"
                        data-ocid="browse.upload_primary_button"
                      >
                        <Link to="/upload">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Your First Film
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-border/50 hover:border-gold/30 hover:text-gold"
                        data-ocid="browse.signin_button"
                        onClick={() => {
                          // Handled via Navbar sign-in
                          document
                            .querySelector<HTMLButtonElement>(
                              '[data-ocid="nav.login_button"]',
                            )
                            ?.click();
                        }}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In to Upload
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {filteredFilms.map((film, i) => (
                  <FilmCard key={film.id.toString()} film={film} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Count */}
        {!isLoading && filteredFilms.length > 0 && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Showing {filteredFilms.length} film
            {filteredFilms.length !== 1 ? "s" : ""}
          </p>
        )}
      </section>
    </main>
  );
}
