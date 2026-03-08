import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Loader2,
  Play,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteFilm,
  useGetFilm,
  useIsCallerAdmin,
} from "../hooks/useQueries";

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

export function FilmDetailPage() {
  const { id } = useParams({ from: "/film/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const filmId = id ? BigInt(id) : null;
  const { data: film, isLoading, isError, error } = useGetFilm(filmId);
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteFilm = useDeleteFilm();

  const callerPrincipal = identity?.getPrincipal().toString();
  const uploaderPrincipal = film?.uploadedBy?.toText?.() ?? "";
  const canDelete =
    isAdmin || (!!callerPrincipal && callerPrincipal === uploaderPrincipal);

  const handleDelete = async () => {
    if (!filmId) return;
    await deleteFilm.mutateAsync(filmId);
    void navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <main
        className="flex-1 container mx-auto px-4 py-10 max-w-5xl"
        data-ocid="film.loading_state"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Skeleton className="h-3 w-12" />
          <ChevronRight className="h-3 w-3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !film) {
    return (
      <main className="flex-1 container mx-auto px-4 py-20 max-w-2xl">
        <Alert variant="destructive" data-ocid="film.error_state">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isError
              ? error instanceof Error
                ? error.message
                : "Failed to load film."
              : "Film not found."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4 border-border/50">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>
      </main>
    );
  }

  const posterUrl = film.poster.getDirectURL();
  const videoUrl = film.video.getDirectURL();
  const genreClass = GENRE_COLORS[film.genre] ?? GENRE_COLORS.Other;

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Browse
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-[200px]">
            {film.title}
          </span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]"
        >
          {/* Poster column */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-xl border border-border/50 shadow-film">
              <img
                src={posterUrl}
                alt={`${film.title} poster`}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${genreClass}`}
                >
                  {film.genre}
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground text-xs">
                  Release Year
                </span>
                <span className="ml-auto font-medium text-foreground">
                  {film.releaseYear.toString()}
                </span>
              </div>
              <div className="border-t border-border/50 pt-3 flex items-start gap-2.5 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Uploaded by</p>
                  <p className="text-xs font-mono text-foreground/70 truncate mt-0.5">
                    {uploaderPrincipal
                      ? `${uploaderPrincipal.slice(0, 16)}…`
                      : "Anonymous"}
                  </p>
                </div>
              </div>
            </div>

            {/* Delete button */}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    data-ocid="film.delete_button"
                    className="w-full gap-2"
                    disabled={deleteFilm.isPending}
                  >
                    {deleteFilm.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deleteFilm.isPending ? "Deleting…" : "Delete Film"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this film?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The film &ldquo;
                      {film.title}&rdquo; and all its media will be permanently
                      deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="film.dialog.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        void handleDelete();
                      }}
                      data-ocid="film.dialog.confirm_button"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Film
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Detail column */}
          <div className="flex flex-col gap-6">
            {/* Title + description */}
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground leading-tight sm:text-4xl">
                {film.title}
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {film.description}
              </p>
            </div>

            {/* Video player */}
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-film bg-black scanlines">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full aspect-video object-contain bg-black"
                  preload="metadata"
                  poster={posterUrl}
                >
                  <track kind="captions" srcLang="en" label="English" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-black/80">
                  <Play className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground/50">
                    Video unavailable
                  </p>
                </div>
              )}
            </div>

            {/* Back button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Link to="/">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Browse
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
