"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Photo = {
  id: string;
  image_url: string;
  title: string | null;
  year_true: number;
  year_min: number | null;
  year_max: number | null;
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [guessYear, setGuessYear] = useState(1960);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [round, setRound] = useState(1);
  const [usedPhotoIds, setUsedPhotoIds] = useState<string[]>([]);
  const [failedPhotoIds, setFailedPhotoIds] = useState<string[]>([]);

  const minYear = 1900;
  const maxYear = useMemo(() => new Date().getFullYear(), []);
  const maxRounds = 5;

  const clampYear = (value: number) =>
    Math.min(maxYear, Math.max(minYear, value));

  const pickRandomPhoto = (source: Photo[], usedIds: string[]) => {
    const usedSet = new Set(usedIds);
    const unused = source.filter((photo) => !usedSet.has(photo.id));
    const pool = unused.length > 0 ? unused : source;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const nextUsedIds =
      unused.length > 0 ? [...usedIds, chosen.id] : usedIds;
    return { chosen, nextUsedIds };
  };

  const pickRandomPhotoExcludingFailed = (source: Photo[]) => {
    const failedSet = new Set(failedPhotoIds);
    const available = source.filter((photo) => !failedSet.has(photo.id));
    const pool = available.length > 0 ? available : source;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const startNewGame = (sourcePhotos: Photo[]) => {
    if (sourcePhotos.length === 0) return;
    const chosen = pickRandomPhotoExcludingFailed(sourcePhotos);
    const nextUsedIds = chosen ? [chosen.id] : [];
    setCurrentPhoto(chosen);
    setUsedPhotoIds(nextUsedIds);
    setFailedPhotoIds([]);
    setGuessYear(clampYear(1960));
    setShowResult(false);
    setLastScore(0);
    setTotalScore(0);
    setRound(1);
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("id,image_url,title,year_true,year_min,year_max");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data && data.length > 0) {
        const loaded = data as Photo[];
        setPhotos(loaded);
        startNewGame(loaded);
      }
    };

    fetchPhotos();
  }, []);

  const handleConfirm = () => {
    if (!currentPhoto) return;
    const delta = Math.abs(currentPhoto.year_true - guessYear);
    const score = Math.max(0, 1000 - delta * 10);
    setLastScore(score);
    setTotalScore((prev) => prev + score);
    setShowResult(true);
  };

  const handleNextRound = () => {
    if (photos.length === 0) return;
    const { chosen, nextUsedIds } = pickRandomPhoto(photos, usedPhotoIds);
    setCurrentPhoto(chosen);
    setUsedPhotoIds(nextUsedIds);
    setGuessYear(clampYear(1960));
    setShowResult(false);
    setRound((prev) => Math.min(maxRounds, prev + 1));
  };

  const handleImageError = () => {
    if (!currentPhoto) return;
    const nextFailed = failedPhotoIds.includes(currentPhoto.id)
      ? failedPhotoIds
      : [...failedPhotoIds, currentPhoto.id];
    setFailedPhotoIds(nextFailed);

    if (photos.length === 0 || nextFailed.length >= photos.length) {
      setCurrentPhoto(null);
      return;
    }

    const replacement = pickRandomPhotoExcludingFailed(photos);
    setCurrentPhoto(replacement);
  };

  const isGameOver = round >= maxRounds;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 py-6">
        <div className="rounded-2xl bg-zinc-200 p-2 dark:bg-zinc-900">
          {currentPhoto ? (
            <img
              src={currentPhoto.image_url}
              alt="photo"
              className="w-full h-auto max-h-[60vh] object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="flex h-[40vh] items-center justify-center text-sm text-zinc-500">
              Brak działających zdjęć w bazie.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          <span>
            Runda {round}/{maxRounds}
          </span>
          <span>Wynik: {totalScore} pkt</span>
        </div>

        <div className="text-center text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
          {guessYear}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuessYear((v) => clampYear(v - 1))}
            className="h-12 w-12 rounded-full bg-zinc-900 text-white text-xl font-bold dark:bg-white dark:text-black"
            aria-label="Minus one year"
          >
            -
          </button>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={guessYear}
            onChange={(event) => setGuessYear(Number(event.target.value))}
            className="w-full accent-zinc-900 dark:accent-zinc-50"
            aria-label="Select year"
          />
          <button
            type="button"
            onClick={() => setGuessYear((v) => clampYear(v + 1))}
            className="h-12 w-12 rounded-full bg-zinc-900 text-white text-xl font-bold dark:bg-white dark:text-black"
            aria-label="Plus one year"
          >
            +
          </button>
        </div>

        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!currentPhoto || showResult}
          className="mt-2 w-full rounded-2xl bg-zinc-900 py-4 text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
        >
          ZATWIERDŹ
        </button>
      </main>

      {showResult && currentPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-950 dark:text-zinc-50">
            {isGameOver ? (
              <>
                <div className="text-center text-3xl font-black">GAME OVER</div>
                <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
                  Twój wynik końcowy:{" "}
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {totalScore} / {maxRounds * 1000} pkt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => startNewGame(photos)}
                  className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-base font-bold text-white dark:bg-white dark:text-black"
                >
                  ZAGRAJ JESZCZE RAZ
                </button>
              </>
            ) : (
              <>
                <div className="text-center text-2xl font-black">Wynik rundy</div>
                <div className="mt-4 space-y-2 text-center text-sm text-zinc-600 dark:text-zinc-300">
                  <div>Rok zdjęcia: {currentPhoto.year_true}</div>
                  <div>Twój typ: {guessYear}</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Wynik: {lastScore} pkt
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-base font-bold text-white dark:bg-white dark:text-black"
                >
                  NASTĘPNA RUNDA
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
