import { Link } from "@tanstack/react-router";
import { Calendar, Play } from "lucide-react";
import { motion } from "motion/react";
import type { Film } from "../backend";

interface FilmCardProps {
  film: Film;
  index: number;
}

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

export function FilmCard({ film, index }: FilmCardProps) {
  const posterUrl = film.poster.getDirectURL();
  const genreClass = GENRE_COLORS[film.genre] ?? GENRE_COLORS.Other;
  const ocid = `browse.item.${index + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link
        to="/film/$id"
        params={{ id: film.id.toString() }}
        data-ocid={ocid}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        <div className="relative overflow-hidden rounded-lg bg-card border border-border/50 transition-all duration-300 group-hover:border-gold/30 group-hover:shadow-glow-sm">
          {/* Poster image */}
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            <img
              src={posterUrl}
              alt={`${film.title} poster`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/80 bg-gold/20 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-sm">
                <Play className="h-5 w-5 text-gold fill-gold translate-x-0.5" />
              </div>
            </div>

            {/* Genre badge */}
            <div className="absolute top-2 left-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide backdrop-blur-sm ${genreClass}`}
              >
                {film.genre}
              </span>
            </div>
          </div>

          {/* Card info */}
          <div className="p-3">
            <h3 className="font-display text-sm font-semibold leading-snug text-foreground line-clamp-1 group-hover:text-gold transition-colors duration-200">
              {film.title}
            </h3>
            {film.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {film.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{film.releaseYear.toString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function FilmCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-lg bg-card border border-border/50 overflow-hidden"
    >
      <div className="aspect-[2/3] animate-pulse bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
      </div>
    </motion.div>
  );
}
