"use client";

import { useMemo, useState } from "react";

type GameSliderProps = {
  minYear: number;
  maxYear: number;
  initialYear?: number;
  onChange?: (year: number) => void;
};

export default function GameSlider({
  minYear,
  maxYear,
  initialYear,
  onChange,
}: GameSliderProps) {
  const clampedInitial = useMemo(() => {
    const base =
      typeof initialYear === "number"
        ? initialYear
        : Math.round((minYear + maxYear) / 2);
    return Math.min(maxYear, Math.max(minYear, base));
  }, [initialYear, minYear, maxYear]);

  const [year, setYear] = useState(clampedInitial);

  const handleChange = (value: number) => {
    setYear(value);
    onChange?.(value);
  };

  return (
    <div className="w-full">
      <div className="text-center text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
        {year}
      </div>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        step={1}
        value={year}
        onChange={(event) => handleChange(Number(event.target.value))}
        className="mt-5 w-full accent-zinc-900 dark:accent-zinc-50"
        aria-label="Select year"
      />
      <div className="mt-2 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}
