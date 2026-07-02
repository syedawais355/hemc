"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BRAND } from "@/lib/brand";

const BottleScene = dynamic(() => import("./BottleScene"), { ssr: false });

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const STATS = [
  { value: "100%", label: "natural" },
  { value: "30+", label: "years of practice" },
  { value: "PK-wide", label: "delivery" },
];

// how visible the bottle stays behind the content that scrolls over it
const BG_DIM = 0.5;

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function HeroBottle() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const footerTop = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallMem =
      typeof (navigator as unknown as { deviceMemory?: number }).deviceMemory ===
        "number" &&
      (navigator as unknown as { deviceMemory: number }).deviceMemory < 2;
    setCompact(window.matchMedia("(max-width: 780px)").matches);
    setUse3D(supportsWebGL() && !reduced && !smallMem);
  }, []);

  // scroll → opening progress + backdrop opacity (bottle stays fixed behind content)
  useEffect(() => {
    if (!use3D) return;
    const measureFooter = () => {
      const f = document.querySelector(".footer") as HTMLElement | null;
      footerTop.current = f ? f.getBoundingClientRect().top + window.scrollY : Infinity;
    };
    measureFooter();

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = window.innerHeight;
        const y = window.scrollY;
        const openDist = vh * 1.15;

        // lid-open + drift-to-centre progress
        progress.current = clamp(y / openDist);

        // copy + cue fade during the opening
        if (copyRef.current) {
          const f = clamp(1 - y / (vh * 0.6));
          copyRef.current.style.opacity = String(f);
          copyRef.current.style.transform = `translateY(${(1 - f) * -26}px)`;
          copyRef.current.style.pointerEvents = f < 0.15 ? "none" : "auto";
        }
        if (cueRef.current) cueRef.current.style.opacity = String(clamp(1 - y / (vh * 0.25)));

        // backdrop opacity: full while solo → dim once content overlays → 0 near footer
        const heroH = sectionRef.current?.offsetHeight ?? vh * 2.6;
        const overlayStart = heroH - vh; // where the content sheet starts entering
        let op = 1;
        if (y > overlayStart) op = lerp(1, BG_DIM, clamp((y - overlayStart) / (vh * 0.6)));
        const distToFooter = footerTop.current - (y + vh);
        if (distToFooter < vh * 0.5) op *= clamp(distToFooter / (vh * 0.5));

        if (stageRef.current) stageRef.current.style.opacity = op.toFixed(3);
        setActive(op > 0.02);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { measureFooter(); onScroll(); };
    window.addEventListener("resize", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [use3D]);

  const Copy = (
    <div className="hero3d__copy" ref={copyRef}>
      <h1 className="hero3d__title">
        Healing, the<br />
        natural <em>way.</em>
      </h1>
      <p className="hero3d__lead">
        Traditional Unani &amp; herbal remedies — formulated by hakeems, trusted for
        generations, delivered across Pakistan.
      </p>
      <div className="hero3d__actions">
        <Link className="btn btn--primary btn--lg" href="/shop">Browse remedies</Link>
        <Link className="btn btn--ghost btn--lg" href="/about">Meet the hakeem</Link>
      </div>
      <div className="hero3d__stats">
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Fallback: static brand visual, normal (non-pinned) hero
  if (mounted && !use3D) {
    return (
      <section className="hero3d hero3d--static">
        <div className="container hero3d__inner">
          {Copy}
          <div className="hero3d__fallback">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BRAND.bannerUrl} alt={BRAND.fullName} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* fixed 3D backdrop — stays behind the page while content scrolls over it */}
      <div className="bottle-stage" aria-hidden="true" ref={stageRef}>
        {mounted && use3D && (
          <BottleScene progress={progress} compact={compact} active={active} />
        )}
        <div className="bottle-stage__glow" aria-hidden />
      </div>

      <section className="hero3d" ref={sectionRef} aria-label="HEMC hero">
        <div className="hero3d__pin">
          <div className="container hero3d__inner">{Copy}</div>
          <div className="hero3d__cue" ref={cueRef} aria-hidden>
            <span>Scroll to open</span>
            <Icon name="arrow" size={16} />
          </div>
        </div>
      </section>
    </>
  );
}
