import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type FilmId = bigint;
export interface Film {
    id: FilmId;
    title: string;
    video: ExternalBlob;
    createdAt: bigint;
    description: string;
    genre: string;
    releaseYear: bigint;
    uploadedBy: Principal;
    poster: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteFilm(id: FilmId): Promise<void>;
    getAllFilms(): Promise<Array<Film>>;
    getCallerUserRole(): Promise<UserRole>;
    getFilm(id: FilmId): Promise<Film>;
    getFilmCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    uploadFilm(title: string, description: string, genre: string, releaseYear: bigint, poster: ExternalBlob, video: ExternalBlob): Promise<FilmId>;
}
