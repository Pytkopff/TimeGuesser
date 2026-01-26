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
    <div className="min-h-screen bg-[#f5f3ee] text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-300/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border-2 border-zinc-900 px-3 py-1 text-xs font-black uppercase tracking-[0.3em]">
              TimeGuesser
            </div>
            <div className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:block">
              Chrono Edition
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            <span className="rounded-full border border-zinc-900 px-3 py-1">
              Runda {round}/{maxRounds}
            </span>
            <span className="rounded-full border border-zinc-300 bg-white px-3 py-1">
              Wynik: {totalScore} pkt
            </span>
          </div>
        </header>

        <section className="flex flex-col items-center gap-5">
          <div className="w-full rounded-2xl border-2 border-zinc-900 bg-white p-3 shadow-[0_8px_0_0_rgba(0,0,0,0.08)]">
            <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-2">
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
          </div>

          <div className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-zinc-600">
            What year was this photo taken?
          </div>

          <div className="rounded-2xl border-2 border-zinc-900 bg-white px-6 py-3 text-5xl font-black tracking-tight tabular-nums shadow-[0_6px_0_0_rgba(0,0,0,0.12)]">
            {guessYear}
          </div>

          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={() => setGuessYear((v) => clampYear(v - 1))}
              className="h-12 w-12 rounded-full border-2 border-zinc-900 bg-white text-xl font-black"
              aria-label="Minus one year"
            >
              -
            </button>
            <div className="flex-1">
              <input
                type="range"
                min={minYear}
                max={maxYear}
                step={1}
                value={guessYear}
                onChange={(event) => setGuessYear(Number(event.target.value))}
                className="w-full accent-zinc-900"
                aria-label="Select year"
              />
              <div
                className="mt-2 h-2 w-full rounded-full border border-zinc-900 bg-white"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(0,0,0,0.5) 0, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 24px)",
                }}
              />
              <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                <span>{minYear}</span>
                <span>{maxYear}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGuessYear((v) => clampYear(v + 1))}
              className="h-12 w-12 rounded-full border-2 border-zinc-900 bg-white text-xl font-black"
              aria-label="Plus one year"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!currentPhoto || showResult}
            className="mt-2 w-full rounded-2xl border-2 border-zinc-900 bg-zinc-900 py-4 text-lg font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_8px_0_0_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ZATWIERDŹ
          </button>
        </section>
      </main>

      {showResult && currentPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border-2 border-zinc-900 bg-white p-6 text-zinc-900 shadow-[0_12px_0_0_rgba(0,0,0,0.2)]">
            {isGameOver ? (
              <>
                <div className="text-center text-3xl font-black tracking-wide">GAME OVER</div>
                <div className="mt-4 text-center text-sm text-zinc-600">
                  Twój wynik końcowy:{" "}
                  <span className="text-lg font-bold text-zinc-900">
                    {totalScore} / {maxRounds * 1000} pkt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => startNewGame(photos)}
                  className="mt-6 w-full rounded-xl border-2 border-zinc-900 bg-zinc-900 py-3 text-base font-bold uppercase tracking-[0.2em] text-white"
                >
                  ZAGRAJ JESZCZE RAZ
                </button>
              </>
            ) : (
              <>
                <div className="text-center text-2xl font-black">Wynik rundy</div>
                <div className="mt-4 space-y-2 text-center text-sm text-zinc-600">
                  <div>Rok zdjęcia: {currentPhoto.year_true}</div>
                  <div>Twój typ: {guessYear}</div>
                  <div className="text-lg font-bold text-zinc-900">
                    Wynik: {lastScore} pkt
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="mt-6 w-full rounded-xl border-2 border-zinc-900 bg-zinc-900 py-3 text-base font-bold uppercase tracking-[0.2em] text-white"
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
