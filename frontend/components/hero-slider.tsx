"use client";

import { useEffect, useMemo, useState } from "react";

type HeroSlide = {
  id: string;
  title: string;
  description: string;
  accent: "orange" | "green" | "navy";
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | "BANNER";
};

const SLIDES: HeroSlide[] = [
  {
    id: "repairs",
    title: "Reparatii & Mentenanta",
    description: "Interventii rapide pentru instalatii termice, sanitare si electrice, cu echipe verificate.",
    accent: "orange",
  },
  {
    id: "install",
    title: "Montaje & Punere in functiune",
    description: "Montaj complet, testare si punere in functiune pentru centrale, HVAC si instalatii critice.",
    accent: "navy",
  },
  {
    id: "rental",
    title: "Utilaje & Rental",
    description: "Alocare utilaje pentru lucrari AUR/PLATINA, tarife transparente si disponibilitate live.",
    accent: "green",
  },
];

function accentClass(accent: HeroSlide["accent"]) {
  return {
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    navy: "border-slate-200 bg-slate-50 text-slate-700",
  }[accent];
}

export function HeroSlider({
  slides: providedSlides,
  fullWidth = false,
}: {
  slides?: HeroSlide[];
  fullWidth?: boolean;
}) {
  const slides = useMemo(() => {
    const source = providedSlides && providedSlides.length ? providedSlides : SLIDES;
    return source.slice(0, 10);
  }, [providedSlides]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = slides[index] ?? slides[0];

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const sliderCore = (
    <section className="v3-section-card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="v3-eyebrow">Hero Slider</div>
          <h2 className="v3-section-title">Fluxuri principale My Darrin</h2>
          <p className="v3-page-description">
            Slider animat cu directiile strategice. Auto-rotire la 5.5 secunde, max 10 slide-uri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              className={`h-2.5 w-2.5 rounded-full border ${slideIndex === index ? "bg-orange-500 border-orange-500" : "border-slate-300 bg-white"}`}
              onClick={() => setIndex(slideIndex)}
              aria-label={`Mergi la ${slide.title}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Zona incarcare slide-uri</div>
        <div className="mt-2 text-sm text-slate-600">
          Recomandat 16:9 (1920x720). Spatiul acesta simuleaza viitoarele imagini din hero slider.
        </div>
        <div className="mt-4 aspect-[16/5] w-full rounded-xl border border-dashed border-orange-200 bg-white/80" />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/90">
        {activeSlide?.mediaUrl ? (
          activeSlide.mediaType === "VIDEO" ? (
            <video
              className="h-[320px] w-full object-cover sm:h-[380px] lg:h-[440px]"
              src={activeSlide.mediaUrl}
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <img
              className="h-[320px] w-full object-cover sm:h-[380px] lg:h-[440px]"
              src={activeSlide.mediaUrl}
              alt={activeSlide.title}
            />
          )
        ) : (
          <div className="flex h-[320px] w-full items-center justify-center bg-slate-50 text-sm text-slate-500 sm:h-[380px] lg:h-[440px]">
            Preview full pentru slide-ul selectat
          </div>
        )}
        <div className="grid gap-2 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {activeSlide?.mediaType ?? "SLIDE"} · Slide {slides.length ? index + 1 : 0}/{slides.length || 0}
          </div>
          <div className="text-2xl font-semibold text-slate-900">{activeSlide?.title ?? "Slide principal"}</div>
          <div className="text-sm text-slate-600">{activeSlide?.description ?? ""}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
              onClick={() => {
                setIsPaused(true);
                setIndex((current) => (current - 1 + slides.length) % slides.length);
              }}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
              onClick={() => {
                setIsPaused(true);
                setIndex((current) => (current + 1) % slides.length);
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((slide, slideIndex) => (
          <article
            key={slide.id}
            className={`rounded-2xl border p-5 transition-all ${accentClass(slide.accent)} ${
              slideIndex === index ? "shadow-lg" : "opacity-70"
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em]">{slide.title}</div>
            {slide.mediaUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/70 bg-white/80">
                {slide.mediaType === "VIDEO" ? (
                  <video
                    className="h-32 w-full object-cover"
                    src={slide.mediaUrl}
                    muted
                    playsInline
                    autoPlay
                    loop
                  />
                ) : (
                  <img className="h-32 w-full object-cover" src={slide.mediaUrl} alt={slide.title} />
                )}
              </div>
            ) : null}
            <div className="mt-3 text-sm leading-7 text-slate-700">{slide.description}</div>
          </article>
        ))}
      </div>
    </section>
  );

  if (!fullWidth) {
    return sliderCore;
  }

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen max-w-[100vw] overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-10">{sliderCore}</div>
    </div>
  );
}
