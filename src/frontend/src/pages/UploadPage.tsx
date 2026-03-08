import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileVideo,
  ImageIcon,
  Loader2,
  Lock,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUploadFilm } from "../hooks/useQueries";

const GENRES = [
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

interface FormErrors {
  title?: string;
  description?: string;
  genre?: string;
  releaseYear?: string;
  poster?: string;
  video?: string;
}

function FileDropZone({
  accept,
  label,
  icon: Icon,
  file,
  onFile,
  ocid,
}: {
  accept: string;
  label: string;
  icon: React.ElementType;
  file: File | null;
  onFile: (f: File) => void;
  ocid: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <button
      type="button"
      className={`relative w-full rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
        isDragging
          ? "border-gold bg-gold/5"
          : file
            ? "border-gold/40 bg-gold/5"
            : "border-border hover:border-gold/30 hover:bg-card/50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      data-ocid={ocid}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <div className="flex flex-col items-center justify-center gap-2.5 p-8 text-center">
        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 border border-gold/30">
              <Icon className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground line-clamp-1 max-w-[180px]">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <p className="text-xs text-gold/70">Click to replace</p>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/50 bg-card/60">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drop file here or click to browse
              </p>
            </div>
          </>
        )}
      </div>
    </button>
  );
}

export function UploadPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const uploadFilm = useUploadFilm();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterProgress, setPosterProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successId, setSuccessId] = useState<bigint | null>(null);

  const overallProgress = uploadFilm.isPending
    ? Math.round((posterProgress + videoProgress) / 2)
    : 0;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!genre) newErrors.genre = "Please select a genre";
    const year = Number.parseInt(releaseYear, 10);
    if (
      !releaseYear ||
      Number.isNaN(year) ||
      year < 1888 ||
      year > new Date().getFullYear() + 5
    ) {
      newErrors.releaseYear = `Enter a valid year (1888–${new Date().getFullYear() + 5})`;
    }
    if (!posterFile) newErrors.poster = "Poster image is required";
    if (!videoFile) newErrors.video = "Video file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!posterFile || !videoFile) return;

    try {
      const id = await uploadFilm.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        genre,
        releaseYear: BigInt(Number.parseInt(releaseYear, 10)),
        posterFile,
        videoFile,
        onPosterProgress: setPosterProgress,
        onVideoProgress: setVideoProgress,
      });
      setSuccessId(id);
      setTimeout(() => {
        void navigate({ to: "/film/$id", params: { id: id.toString() } });
      }, 2000);
    } catch {
      // error shown via uploadFilm.isError
    }
  };

  // Not logged in — gate the page
  if (!identity) {
    return (
      <main className="flex-1 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border/50 bg-card mx-auto mb-6">
            <Lock className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Sign in to upload
          </h1>
          <p className="mt-3 text-muted-foreground">
            You need to be signed in to upload films. Your films will be linked
            to your identity.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              variant="outline"
              className="border-border/50 hover:border-gold/30"
            >
              <Link to="/">Browse Films</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  // Success state
  if (successId !== null) {
    return (
      <main className="flex-1 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          data-ocid="upload.success_state"
          className="mx-auto max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10 mx-auto mb-6"
          >
            <CheckCircle2 className="h-9 w-9 text-gold" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Film uploaded!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your film has been uploaded successfully. Redirecting to the film
            page…
          </p>
          <div className="mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-gold mx-auto" />
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground transition-colors">
              Browse
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Upload Film</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 border border-gold/30">
              <Upload className="h-4.5 w-4.5 text-gold" size={18} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Upload a Film
              </h1>
              <p className="text-sm text-muted-foreground">
                Share your latest work with the world
              </p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          noValidate
          className="space-y-6"
        >
          {/* Error alert */}
          <AnimatePresence>
            {uploadFilm.isError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                data-ocid="upload.error_state"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {uploadFilm.error instanceof Error
                      ? uploadFilm.error.message
                      : "Upload failed. Please try again."}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload progress */}
          <AnimatePresence>
            {uploadFilm.isPending && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                data-ocid="upload.loading_state"
                className="rounded-lg border border-gold/30 bg-gold/5 p-4 overflow-hidden"
              >
                <p className="text-sm font-medium text-gold mb-3">
                  Uploading… {overallProgress}%
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-3 w-3" /> Poster
                    </span>
                    <span>{posterProgress}%</span>
                  </div>
                  <Progress value={posterProgress} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 mt-2">
                    <span className="flex items-center gap-1.5">
                      <FileVideo className="h-3 w-3" /> Video
                    </span>
                    <span>{videoProgress}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-1.5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form fields */}
          <div className="rounded-xl border border-border/50 bg-card p-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. The Last Frontier"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title)
                    setErrors((p) => ({ ...p, title: undefined }));
                }}
                data-ocid="upload.title_input"
                className={`bg-background/60 ${errors.title ? "border-destructive focus-visible:ring-destructive/20" : "border-border/50 focus:border-gold/40"}`}
                disabled={uploadFilm.isPending}
              />
              {errors.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="A brief synopsis of your film…"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors((p) => ({ ...p, description: undefined }));
                }}
                data-ocid="upload.description_textarea"
                rows={4}
                className={`resize-none bg-background/60 ${errors.description ? "border-destructive focus-visible:ring-destructive/20" : "border-border/50 focus:border-gold/40"}`}
                disabled={uploadFilm.isPending}
              />
              {errors.description && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Genre + Year row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Genre */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Genre <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={genre}
                  onValueChange={(v) => {
                    setGenre(v);
                    if (errors.genre)
                      setErrors((p) => ({ ...p, genre: undefined }));
                  }}
                  disabled={uploadFilm.isPending}
                >
                  <SelectTrigger
                    data-ocid="upload.genre_select"
                    className={`bg-background/60 ${errors.genre ? "border-destructive" : "border-border/50"}`}
                  >
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.genre && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.genre}
                  </p>
                )}
              </div>

              {/* Release Year */}
              <div className="space-y-1.5">
                <Label htmlFor="year" className="text-sm font-medium">
                  Release Year <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  placeholder={new Date().getFullYear().toString()}
                  value={releaseYear}
                  onChange={(e) => {
                    setReleaseYear(e.target.value);
                    if (errors.releaseYear)
                      setErrors((p) => ({ ...p, releaseYear: undefined }));
                  }}
                  data-ocid="upload.year_input"
                  min={1888}
                  max={new Date().getFullYear() + 5}
                  className={`bg-background/60 ${errors.releaseYear ? "border-destructive focus-visible:ring-destructive/20" : "border-border/50 focus:border-gold/40"}`}
                  disabled={uploadFilm.isPending}
                />
                {errors.releaseYear && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.releaseYear}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* File uploads */}
          <div className="rounded-xl border border-border/50 bg-card p-6 space-y-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              Media Files
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Poster */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Poster Image <span className="text-destructive">*</span>
                </Label>
                <FileDropZone
                  accept="image/*"
                  label="Upload Poster"
                  icon={ImageIcon}
                  file={posterFile}
                  onFile={(f) => {
                    setPosterFile(f);
                    if (errors.poster)
                      setErrors((p) => ({ ...p, poster: undefined }));
                  }}
                  ocid="upload.poster_upload_button"
                />
                {errors.poster && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.poster}
                  </p>
                )}
              </div>

              {/* Video */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Video File <span className="text-destructive">*</span>
                </Label>
                <FileDropZone
                  accept="video/*"
                  label="Upload Video"
                  icon={FileVideo}
                  file={videoFile}
                  onFile={(f) => {
                    setVideoFile(f);
                    if (errors.video)
                      setErrors((p) => ({ ...p, video: undefined }));
                  }}
                  ocid="upload.video_upload_button"
                />
                {errors.video && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.video}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-border/50 hover:border-gold/30"
              disabled={uploadFilm.isPending}
            >
              <Link to="/">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={uploadFilm.isPending}
              data-ocid="upload.submit_button"
              className="min-w-[140px] bg-gold text-background hover:bg-gold/90 font-semibold gap-2"
            >
              {uploadFilm.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Film
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </main>
  );
}
