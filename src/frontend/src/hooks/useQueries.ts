import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Film, FilmId } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useGetAllFilms() {
  const { actor, isFetching } = useActor();
  return useQuery<Film[]>({
    queryKey: ["films"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFilms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFilm(id: FilmId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Film>({
    queryKey: ["film", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getFilm(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteFilm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: FilmId) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteFilm(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["films"] });
    },
  });
}

export interface UploadFilmParams {
  title: string;
  description: string;
  genre: string;
  releaseYear: bigint;
  posterFile: File;
  videoFile: File;
  onPosterProgress?: (pct: number) => void;
  onVideoProgress?: (pct: number) => void;
}

export function useUploadFilm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadFilmParams): Promise<FilmId> => {
      if (!actor) throw new Error("Not authenticated");

      const [posterBytes, videoBytes] = await Promise.all([
        params.posterFile.arrayBuffer().then((b) => new Uint8Array(b)),
        params.videoFile.arrayBuffer().then((b) => new Uint8Array(b)),
      ]);

      const posterBlob = ExternalBlob.fromBytes(posterBytes).withUploadProgress(
        params.onPosterProgress ?? (() => {}),
      );
      const videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress(
        params.onVideoProgress ?? (() => {}),
      );

      const id = await actor.uploadFilm(
        params.title,
        params.description,
        params.genre,
        params.releaseYear,
        posterBlob,
        videoBlob,
      );

      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["films"] });
    },
  });
}
