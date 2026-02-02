"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MintScore from "@/components/MintScore";

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [gameId, setGameId] = useState(() => crypto.randomUUID());
  const [hasMinted, setHasMinted] = useState(false);

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
    setGameId(crypto.randomUUID());
    setHasMinted(false);
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
    const delta = Math.abs((currentPhoto?.year_true ?? guessYear) - guessYear);
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
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-3 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-300/70 pb-3 sm:gap-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border-2 border-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] sm:text-xs">
              TimeGuesser
            </div>
            <div className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:block">
              Chrono Edition
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600 sm:gap-3 sm:text-xs">
            <span className="rounded-full border border-zinc-900 px-2 py-1 sm:px-3">
              Round {round}/{maxRounds}
            </span>
            <span className="rounded-full border border-zinc-300 bg-white px-2 py-1 sm:px-3">
              Score: {totalScore} pts
            </span>
          </div>
        </header>

        <section className="flex flex-col items-center gap-3 sm:gap-5">
          <div className="w-full rounded-3xl border-2 border-zinc-900 bg-white p-2 shadow-[0_10px_0_0_rgba(0,0,0,0.12)] sm:p-4 sm:shadow-[0_12px_0_0_rgba(0,0,0,0.12)]">
            <div className="relative rounded-2xl border border-zinc-300 bg-zinc-100 p-2 sm:p-3">
              {currentPhoto ? (
                <img
                  src={currentPhoto?.image_url}
                  alt="photo"
                  className="w-full h-auto max-h-[38vh] object-contain sm:max-h-[60vh]"
                  onError={handleImageError}
                />
              ) : (
                <div className="flex h-[40vh] items-center justify-center text-sm text-zinc-500">
                  No working photos in the database.
                </div>
              )}
              {currentPhoto && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute bottom-3 right-3 rounded-full border-2 border-zinc-900 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_4px_0_0_rgba(0,0,0,0.2)] sm:text-xs"
                >
                  Zoom
                </button>
              )}
            </div>
          </div>

          <div className="w-full rounded-3xl border-2 border-zinc-900 bg-white px-4 py-4 shadow-[0_10px_0_0_rgba(0,0,0,0.12)] sm:px-5 sm:py-6">
            {!showResult ? (
              <>
                <div className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:text-xs">
                  Your guess
                </div>
                <div className="mt-2 flex justify-center sm:mt-3">
                  <div className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 px-5 py-2 text-3xl font-black tracking-tight tabular-nums shadow-[0_5px_0_0_rgba(0,0,0,0.12)] sm:px-6 sm:py-3 sm:text-5xl">
                    {guessYear}
                  </div>
                </div>

                <div className="mt-4 flex w-full items-center gap-2 sm:mt-6 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setGuessYear((v) => clampYear(v - 1))}
                    className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-white text-lg font-black sm:h-12 sm:w-12 sm:text-xl"
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
                      className="mt-2 hidden h-2 w-full rounded-full border border-zinc-900 bg-white sm:block"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, rgba(0,0,0,0.65) 0, rgba(0,0,0,0.65) 1px, transparent 1px, transparent 22px)",
                      }}
                    />
                    <div className="mt-2 flex justify-between text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:text-[10px] sm:tracking-[0.25em]">
                      <span>{minYear}</span>
                      <span>{maxYear}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuessYear((v) => clampYear(v + 1))}
                    className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-white text-lg font-black sm:h-12 sm:w-12 sm:text-xl"
                    aria-label="Plus one year"
                  >
                    +
                  </button>
                </div>

                <div className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-600 sm:mt-5 sm:text-sm">
                  What year was this photo taken?
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!currentPhoto}
                  className="mt-3 w-full rounded-2xl border-2 border-zinc-900 bg-zinc-900 py-3 text-sm font-extrabold uppercase tracking-[0.22em] text-white shadow-[0_7px_0_0_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-5 sm:py-4 sm:text-lg"
                >
                  Submit
                </button>
              </>
            ) : (
              <div className="rounded-2xl border-2 border-zinc-900 bg-white px-4 py-4 text-center shadow-[0_8px_0_0_rgba(0,0,0,0.12)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Round summary
                </div>
                <div className="mt-2 text-[11px] font-black uppercase tracking-[0.2em] sm:text-sm">
                  Photo was taken in {currentPhoto?.year_true}
                </div>
                <div className="mt-2 text-xs text-zinc-600">
                  Your guess: <span className="font-semibold text-zinc-900">{guessYear}</span>
                </div>
                <div className="mt-3 text-2xl font-black text-zinc-900">
                  {lastScore} pts
                </div>
                <div className="mt-3 rounded-xl border-2 border-zinc-900 bg-zinc-50 px-4 py-2 text-xl font-black">
                  TOTAL: {totalScore}
                </div>

                {isGameOver ? (
                  <>
                    {!hasMinted ? (
                      <MintScore
                        gameId={gameId}
                        score={totalScore}
                        onMinted={() => setHasMinted(true)}
                      />
                    ) : (
                      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        Onchain verified. Leaderboard unlocked.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => startNewGame(photos)}
                      className="mt-4 w-full rounded-2xl border-2 border-zinc-900 bg-zinc-900 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white sm:text-base"
                    >
                      Play again
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="mt-4 w-full rounded-2xl border-2 border-zinc-900 bg-white py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 sm:text-base"
                  >
                    Next round
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {isZoomed && currentPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-2xl">
            <img
              src={currentPhoto?.image_url}
              alt="photo zoomed"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border-2 border-white bg-black"
            />
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 rounded-full border-2 border-white bg-black/80 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
