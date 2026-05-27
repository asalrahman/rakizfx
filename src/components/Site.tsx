"use client";
/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
// @ts-nocheck

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useI18n, useT, LANGS } from "@/lib/i18n";


// ─── from logo.jsx ────────────────────────────────────────────────────
// RakizFx Logo — uses the supplied logo PNG asset (transparent BG extracted).

function RakizLogo({ size = 32, showWord = true }) {
  // Image aspect ~ 196:44 ≈ 4.45:1. Height-driven.
  const h = size * 1.1;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>
      <img
        src="/assets/rakizfx-logo-light.png"
        alt="RakizFx"
        style={{
          height: h,
          width: "auto",
          display: "block",
          // invert in dark mode so the wordmark/R turn white; green candle stays green via hue-rotate compensation
          filter: "var(--logo-filter, none)",
        }}
      />
    </span>
  );
}


// ─── from sections.jsx ────────────────────────────────────────────────
// RakizFx sections — Hero, Markets, Why, Accounts, Platforms, Steps, CTA, Footer, Nav


// ─── Helpers ───────────────────────────────────────────────────────────────

function useTicker(initial, jitter = 0.0005, ms = 1400) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => {
      setVal(v => {
        const drift = (Math.random() - 0.5) * 2 * jitter * initial;
        return v + drift;
      });
    }, ms + Math.random() * 600);
    return () => clearInterval(t);
  }, [initial, jitter, ms]);
  return val;
}

function fmt(n, d = 4) {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

function Sparkline({ data, color = "var(--accent)", width = 120, height = 36 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = data[data.length - 1], first = data[0];
  const isUp = last >= first;
  const stroke = isUp ? "var(--up)" : "var(--down)";
  return (
    <svg className="mkt-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function randomWalk(n, base, vol) {
  const out = [base];
  for (let i = 1; i < n; i++) out.push(out[i-1] + (Math.random() - 0.5) * vol);
  return out;
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

// ─── Animated number ─────────────────────────────────────────────────────
function CountUp({ to, suffix = "", prefix = "", duration = 1400, decimals = 0 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    let started = false;
    const io = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const tick = (t) => {
            const k = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - k, 3);
            setVal(to * eased);
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

// ─── Mobile App section ────────────────────────────────────────────────────
function PhoneScreen() {
  const symbols = [
    { sym: "EUR/USD", base: 1.0842, d: 5, vol: 0.0006 },
    { sym: "XAU/USD", base: 2348.5, d: 2, vol: 0.6 },
    { sym: "BTC/USD", base: 67432, d: 1, vol: 40 },
    { sym: "NAS100",  base: 18472, d: 1, vol: 10 },
  ];
  const [rows, setRows] = useState(() => symbols.map(s => ({
    ...s, v: s.base, d0: s.base + (Math.random()-.5) * s.vol * 4,
    spark: randomWalk(20, s.base, s.vol),
  })));
  useEffect(() => {
    const t = setInterval(() => {
      setRows(rs => rs.map(r => ({
        ...r,
        v: r.v + (Math.random()-.5) * r.vol,
        spark: [...r.spark.slice(1), r.spark[r.spark.length-1] + (Math.random()-.5) * r.vol],
      })));
    }, 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="phone-screen">
      <div className="phone-notch" />
      <div className="phone-status"><span>9:41</span><span>••• 5G ▱</span></div>
      <div className="phone-content">
        <div className="phone-hd">
          <div><b>Watchlist</b><div><span>4 instruments · Live</span></div></div>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bg-2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>+</span>
        </div>
        {rows.map((r, i) => {
          const ch = ((r.v - r.d0) / r.d0) * 100;
          const up = ch >= 0;
          return (
            <div key={i} className="phone-card">
              <div className="row">
                <span className="sym">{r.sym}</span>
                <span className="px">{fmt(r.v, r.d)}</span>
              </div>
              <Sparkline data={r.spark} width={240} height={28} />
              <div className="row">
                <span style={{ fontSize: 10, color: "var(--fg-mute)" }}>Spread 0.{(i+2)} pips</span>
                <span className={`ch ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}%</span>
              </div>
            </div>
          );
        })}
        <div className="phone-cta-row">
          <button className="buy">Buy</button>
          <button className="sell">Sell</button>
        </div>
      </div>
      <div className="phone-tabs">
        {["Markets","Trade","Wallet","More"].map((l, i) => (
          <span key={l} className={`t ${i===0?"on":""}`}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: "currentColor", display: "block" }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function PhoneScreen2() {
  // Order ticket view
  const [px, setPx] = useState(67432.5);
  useEffect(() => {
    const t = setInterval(() => setPx(p => p + (Math.random()-.5)*40), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="phone-screen">
      <div className="phone-notch" />
      <div className="phone-status"><span>9:41</span><span>••• 5G ▱</span></div>
      <div className="phone-content">
        <div className="phone-hd">
          <div><b>BTC/USD</b><div><span>Bitcoin · Live</span></div></div>
          <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>● LIVE</span>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'Space Grotesk'", fontSize: 26, fontWeight: 600 }}>${fmt(px, 1)}</div>
        <div className="mono" style={{ color: "var(--up)", fontSize: 11, fontWeight: 600 }}>▲ +1.42% today</div>
        <div style={{ marginTop: 14, padding: 12, background: "var(--bg-2)", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-mute)", marginBottom: 8 }}>
            <span>Volume (lot)</span><span style={{ color: "var(--fg)", fontWeight: 600 }}>0.25</span>
          </div>
          <input type="range" defaultValue="25" style={{ width: "100%", accentColor: "var(--accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--fg-mute)", marginTop: 6 }}>
            <span>0.01</span><span>1.00</span>
          </div>
        </div>
        <div style={{ marginTop: 10, padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "var(--fg-mute)" }}>Margin required</span><span className="mono" style={{ fontWeight: 600 }}>$337.16</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--fg-mute)" }}>Leverage</span><span className="mono" style={{ fontWeight: 600, color: "var(--accent)" }}>1:50</span>
          </div>
        </div>
        <div className="phone-cta-row">
          <button className="buy">Buy {(px).toFixed(0)}</button>
          <button className="sell">Sell {(px-2).toFixed(0)}</button>
        </div>
      </div>
      <div className="phone-tabs">
        {["Markets","Trade","Wallet","More"].map((l, i) => (
          <span key={l} className={`t ${i===1?"on":""}`}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: "currentColor", display: "block" }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function MobileApp() {
  const feats = [
    { t: "Real-time market overview",  p: "Watch 1,200+ instruments stream live — bid, ask, spread and 24-hour change at a glance.",
      i: <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></> },
    { t: "Price & volatility alerts",  p: "Custom push notifications when your watchlist moves. Wake up to the move, not the news cycle.",
      i: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></> },
    { t: "Account & balance management",p: "View live equity, margin level, open positions and account history — no trade entry inside the app.",
      i: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></> },
    { t: "Quick deposit & withdraw",   p: "Fund via bank wire, card or crypto — request withdrawals from your phone in under a minute.",
      i: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></> },
  ];
  return (
    <section id="mobile" className="mobile-section mobile-section--no-bg">
      <div className="container mobile-grid mobile-grid--text-only" style={{ position: "relative" }}>
        <div className="reveal r-right d-200">
          <h2 className="sec-title">Your account, <em>in your pocket</em></h2>
          <p className="sec-sub">The RakizFx companion app gives you live market data, account balance, deposits and withdrawals on the go. For trade execution, use MetaTrader 5 — fully integrated with the same account.</p>
          <div className="mobile-features">
            {feats.map((f, i) => (
              <div key={i} className="mobile-feat">
                <span className="ic">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.i}</svg>
                </span>
                <div><h4>{f.t}</h4><p>{f.p}</p></div>
              </div>
            ))}
          </div>
          <div className="app-badges">
            <a href="#" className="app-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 12.5a4 4 0 0 1 2-3.4 4.2 4.2 0 0 0-3.3-1.8c-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.7a4.4 4.4 0 0 0-3.7 2.3c-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2-1.1 2.8-2.2.6-.8 1-1.7 1.3-2.6a3.9 3.9 0 0 1-2.6-3.6zM14.3 5.4a3.7 3.7 0 0 0 .9-2.7 3.9 3.9 0 0 0-2.5 1.3 3.6 3.6 0 0 0-.9 2.6 3.2 3.2 0 0 0 2.5-1.2z"/></svg>
              <span><span className="l">Download on the</span><br/><span className="b">App Store</span></span>
            </a>
            <a href="#" className="app-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3.6 2.8l13 9.7-2.6 2.6L3.6 21.2zm14.4 8L21 12l-3 2-2.4-2.4zm-3.4 3.4L4.5 22.7l9-9 1.1 1.1zm-2.6-2.6l-9-9 9.5 6.6z"/></svg>
              <span><span className="l">Get it on</span><br/><span className="b">Google Play</span></span>
            </a>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 22, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 28 }}>★ <CountUp to={4.8} decimals={1} duration={1600} /></span>
              <span style={{ fontSize: 11, color: "var(--fg-mute)", textTransform: "uppercase", letterSpacing: ".1em" }}>App Store rating</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 28 }}><CountUp to={180} duration={1800} />K+</span>
              <span style={{ fontSize: 11, color: "var(--fg-mute)", textTransform: "uppercase", letterSpacing: ".1em" }}>Active traders</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Bonus banner ──────────────────────────────────────────────────────────

function BonusBar({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const total = 23 * 3600 + 59 * 60 + 12 - tick;
  const h = Math.max(0, Math.floor(total / 3600));
  const m = Math.max(0, Math.floor((total % 3600) / 60));
  const s = Math.max(0, total % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="bonus-bar" role="region" aria-label="Promotional notification">
      <span className="bonus-bar-accent" aria-hidden="true" />
      <div className="container bonus-bar-inner">
        <span className="bonus-pill">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2 14.5 8.5 22 9.3l-5.5 5.3L18 22l-6-3.7L6 22l1.5-7.4L2 9.3l7.5-.8z"/>
          </svg>
          <span>{t("bonus.label")}</span>
        </span>

        <p className="bonus-text">
          <span className="bonus-text-main">
            {t("bonus.text")} <b>{t("bonus.amount")}</b> <span className="bonus-text-suffix">{t("bonus.suffix")}</span>
          </span>
          <span className="bonus-countdown mono" aria-label="Countdown">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span>{pad(h)}<i>h</i> {pad(m)}<i>m</i> {pad(s)}<i>s</i></span>
          </span>
        </p>

        <a
          href="#promotion"
          className="bonus-cta"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "#promotion";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {t("bonus.claim")}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
          </svg>
        </a>

        <button className="bonus-close" onClick={onClose} aria-label="Dismiss notification" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Search overlay ────────────────────────────────────────────────────────
function SearchOverlay({ onClose, onNav }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, []);

  const allItems = [
    // Markets
    { t: "Forex",                        r: "markets",   c: "Markets", k: "currency pairs eur usd gbp jpy" },
    { t: "Indices",                      r: "markets",   c: "Markets", k: "us500 nas100 dax ftse nikkei nifty index" },
    { t: "Metals",                       r: "markets",   c: "Markets", k: "gold silver platinum xau xag" },
    { t: "Commodities",                  r: "markets",   c: "Markets", k: "cocoa coffee sugar corn" },
    { t: "Energies",                     r: "markets",   c: "Markets", k: "oil wti brent natural gas crude" },
    { t: "Crypto",                       r: "markets",   c: "Markets", k: "bitcoin btc eth ethereum sol solana xrp ripple" },
    { t: "Shares / Stocks",              r: "markets",   c: "Markets", k: "aapl msft nvda tsla google apple meta" },
    { t: "Live market overview",         r: "markets",   c: "Markets", k: "prices bid ask spread" },
    { t: "Spreads & swaps",              r: "markets",   c: "Markets", k: "spread swap overnight rollover" },
    { t: "Contract specifications",      r: "markets",   c: "Markets", k: "margin lot size tick value" },
    { t: "Trading hours",                r: "markets",   c: "Markets", k: "session market hours open close" },

    // Accounts
    { t: "Standard account",             r: "accounts",  c: "Accounts", k: "stp $50 beginners" },
    { t: "Pro account",                  r: "accounts",  c: "Accounts", k: "$200 low spread active" },
    { t: "Elite account",                r: "accounts",  c: "Accounts", k: "$2000 vip ultra-low custom leverage" },
    { t: "Demo account",                 r: "accounts",  c: "Accounts", k: "virtual practice $50000" },
    { t: "Compare accounts",             r: "accounts",  c: "Accounts", k: "comparison table" },
    { t: "Open account",                 r: "register",  c: "Get started", k: "register sign up apply" },
    { t: "Log in",                       r: "login",     c: "Get started", k: "sign in client area" },
    { t: "Try demo",                     r: "register",  c: "Get started", k: "demo practice" },
    { t: "Fund your account",            r: "funding",   c: "Get started", k: "deposit wire card crypto" },

    // Tools
    { t: "Pip calculator",               r: "tools",     c: "Tools", k: "pip value calculator" },
    { t: "Margin calculator",            r: "tools",     c: "Tools", k: "margin requirement position" },
    { t: "Profit calculator",            r: "tools",     c: "Tools", k: "profit p&l calculator" },
    { t: "Swap calculator",              r: "tools",     c: "Tools", k: "overnight financing swap rollover" },
    { t: "Position size calculator",     r: "tools",     c: "Tools", k: "risk position sizing" },
    { t: "Risk / Reward calculator",     r: "tools",     c: "Tools", k: "risk reward ratio" },
    { t: "Currency converter",           r: "tools",     c: "Tools", k: "fx convert currency exchange" },
    { t: "Economic calendar",            r: "tools",     c: "Tools", k: "macro events fed ecb data" },
    { t: "Market analysis",              r: "tools",     c: "Tools", k: "research analysis report daily" },
    { t: "Heat map",                     r: "tools",     c: "Tools", k: "heatmap sector performance" },
    { t: "Trading holidays",             r: "tools",     c: "Tools", k: "market holidays closures" },
    { t: "Download platforms",           r: "tools",     c: "Tools", k: "download mt5 mobile app" },
    { t: "Trading academy",              r: "tools",     c: "Tools", k: "learn academy courses education" },
    { t: "Beginner course",              r: "tools",     c: "Tools", k: "beginner training" },
    { t: "Video tutorials",              r: "tools",     c: "Tools", k: "video learning" },
    { t: "Webinars",                     r: "tools",     c: "Tools", k: "live webinar education" },
    { t: "E-books",                      r: "tools",     c: "Tools", k: "ebook guide download" },

    // Partners
    { t: "Become a partner",             r: "partners",  c: "Partners", k: "ib affiliate partnership earn" },
    { t: "Introducing Broker (IB)",      r: "partners",  c: "Partners", k: "ib commission per lot" },
    { t: "Affiliate program",            r: "affiliate", c: "Partners", k: "cpa revenue share affiliate" },

    // Promotion
    { t: "Promotions",                   r: "promotion", c: "Promotion", k: "bonus offers rewards" },
    { t: "Welcome bonus",                r: "promotion", c: "Promotion", k: "deposit match first" },
    { t: "Refer & earn",                 r: "promotion", c: "Promotion", k: "referral invite reward" },
    { t: "Trade & win",                  r: "promotion", c: "Promotion", k: "competition contest prize" },
    { t: "Loyalty rewards",              r: "promotion", c: "Promotion", k: "loyalty vip benefits" },
    { t: "Cashback program",             r: "promotion", c: "Promotion", k: "cashback rebate per lot" },
    { t: "Seasonal campaigns",           r: "promotion", c: "Promotion", k: "seasonal limited time" },

    // Company
    { t: "About us",                     r: "about",     c: "Company", k: "who we are mission company" },
    { t: "Client protection",            r: "about",     c: "Company", k: "safe funds segregated" },
    { t: "FAQ",                          r: "faq",       c: "Company", k: "frequently asked questions" },
    { t: "Careers",                      r: "careers",   c: "Company", k: "jobs hiring work" },
    { t: "Help center",                  r: "help",      c: "Company", k: "support guides tutorials" },
    { t: "Contact us",                   r: "contact",   c: "Company", k: "email phone offices support" },
    { t: "Live chat",                    r: "contact",   c: "Company", k: "chat support agent" },
    { t: "Live WhatsApp",                r: "contact",   c: "Company", k: "whatsapp rm relationship manager" },

    // Brand
    { t: "RakizFx home",                 r: "home",      c: "RakizFx", k: "home homepage" },
    { t: "Why RakizFx",                  r: "home",      c: "RakizFx", k: "why choose us" },
    { t: "MetaTrader 5 (MT5)",           r: "home",      c: "Platform", k: "mt5 metatrader platform" },
    { t: "Mobile app",                   r: "home",      c: "Platform", k: "iphone android mobile companion" },
  ];

  const query = q.trim().toLowerCase();
  const results = query
    ? allItems.filter(it =>
        it.t.toLowerCase().includes(query) ||
        it.c.toLowerCase().includes(query) ||
        it.k.toLowerCase().includes(query)
      ).slice(0, 16)
    : [];

  // FXPro-style: group results by category for richer scanning
  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.c] = acc[r.c] || []).push(r);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped);

  // Popular suggestions shown when the input is empty
  const popular = [
    { t: "Forex",          r: "market-forex" },
    { t: "Gold (XAU/USD)", r: "market-metals" },
    { t: "Bitcoin",        r: "market-crypto" },
    { t: "US500",          r: "market-indices" },
    { t: "Apple (AAPL)",   r: "market-shares" },
    { t: "Standard account", r: "accounts" },
    { t: "Pip calculator", r: "tools" },
    { t: "Welcome bonus",  r: "promotion" },
  ];

  // Flat list for keyboard nav (only meaningful when there are results)
  const flatResults = results;
  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(flatResults.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = flatResults[activeIdx];
      if (hit) onNav(hit.r);
    }
  };

  // Reset highlight when the query changes
  useEffect(() => { setActiveIdx(0); }, [q]);

  // Map of category → small inline glyph for visual scanning
  const catGlyph: Record<string, string> = {
    Markets:       "M3 17l6-6 4 4 8-8M14 7h7v7",
    Accounts:      "M16 11a4 4 0 1 0-8 0v3a4 4 0 0 0 8 0v-3zM3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2",
    "Get started": "M5 12h14M13 5l7 7-7 7",
    Tools:         "M14.7 6.3a4 4 0 0 1 5.7 5.7L8.4 23.9l-5.4.6.6-5.4L14.7 6.3z",
    Partners:      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    Promotion:     "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    Company:       "M3 21h18M3 21V8l9-5 9 5v13",
    RakizFx:       "M12 2L4 7v6c0 5 3.5 9 8 9s8-4 8-9V7l-8-5z",
    Platform:      "M3 3h18v18H3zM3 9h18M9 21V9",
  };
  const glyphFor = (c: string) => catGlyph[c] || "M5 12h14";

  let runningIdx = 0;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel search-panel--fx" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={t("search.placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            autoComplete="off"
            spellCheck={false}
          />
          {q && (
            <button
              className="search-clear"
              aria-label="Clear"
              onClick={() => { setQ(""); inputRef.current?.focus(); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          )}
          <span className="search-kbd-row">
            <kbd>esc</kbd>
          </span>
        </div>

        <div className="search-body">
          {!query && (
            <>
              <div className="search-section-h">Popular</div>
              <div className="search-pills">
                {popular.map((p, i) => (
                  <button key={i} className="search-pill" onClick={() => onNav(p.r)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={glyphFor("Markets")}/></svg>
                    {p.t}
                  </button>
                ))}
              </div>

              <div className="search-section-h">Quick links</div>
              <div className="search-quicklinks">
                {[
                  ["markets",   "All markets"],
                  ["accounts",  "Account types"],
                  ["tools",     "Trading tools"],
                  ["promotion", "Welcome bonus"],
                  ["help",      "Help center"],
                  ["contact",   "Contact us"],
                ].map(([r, label]) => (
                  <button key={r} className="search-quicklink" onClick={() => onNav(r)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {query && results.length === 0 && (
            <div className="search-empty">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              <div>
                <b>{t("search.empty")} &ldquo;{q}&rdquo;</b>
                <span>Try a market name (forex, gold, bitcoin), an account tier or a tool.</span>
              </div>
            </div>
          )}

          {query && groupKeys.map((cat) => (
            <div key={cat} className="search-group">
              <div className="search-section-h search-section-h--cat">{cat}</div>
              {grouped[cat].map((r) => {
                const i = runningIdx++;
                return (
                  <button
                    key={`${r.c}-${r.t}-${i}`}
                    className={`search-result${i === activeIdx ? ' is-active' : ''}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => onNav(r.r)}
                  >
                    <span className="search-result-glyph">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={glyphFor(r.c)}/></svg>
                    </span>
                    <span className="search-result-title">{r.t}</span>
                    <svg className="search-result-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="search-hint">
          <span><kbd>↵</kbd> {t("search.hint_select")}</span>
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>esc</kbd> {t("search.hint_close")}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────

function Nav({ route, onNav }) {
  const [open, setOpen] = useState(false);
  const [hoverGroup, setHoverGroup] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang } = useI18n();
  const t = useT();
  // Open search on Cmd/Ctrl+K and "/" hotkey from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const inField = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '/' && !inField) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups = [
    {
      id: "markets", label: "Markets", route: "markets",
      cols: [
        { h: "Currencies & metals", items: [
          ["market-forex",  "Forex",   "60+ currency pairs"],
          ["market-metals", "Metals",  "Gold · Silver · Platinum"],
        ]},
        { h: "Indices & energies", items: [
          ["market-indices",  "Indices",  "Global index CFDs"],
          ["market-energies", "Energies", "WTI · Brent · Natural gas"],
        ]},
        { h: "Stocks & crypto", items: [
          ["market-shares", "Shares / Stocks", "100+ global stocks"],
          ["market-crypto", "Crypto",          "BTC · ETH · SOL & more"],
        ]},
        { h: "Overview", items: [
          ["markets", "All markets", "Explore every asset class"],
        ]},
      ],
    },
    {
      id: "accounts", label: "Accounts", route: "accounts",
      cols: [
        { h: "Account types", items: [
          ["accounts", "Standard", "Direct-to-market execution"],
          ["accounts", "Pro",      "For active traders"],
          ["accounts", "Elite",    "VIP & high-volume"],
        ]},
      ],
    },
    {
      id: "tools", label: "Tools", route: "tools",
      cols: [
        { h: "Trading tools", items: [
          ["tools", "Pip Calculator",    "Pip value & required margin"],
          ["tools", "Economic Calendar", "Macro events & data"],
        ]},
      ],
    },
    {
      id: "partner", label: "Become a Partner", route: "partners",
      cols: [
        { h: "Partner programs", items: [
          ["partners",  "Introducing Broker (IB)", "Refer & earn lifetime"],
          ["affiliate", "Affiliate",               "Performance-based payouts"],
        ]},
      ],
    },
    {
      id: "promotion", label: "Promotion", route: "promotion",
      cols: [
        { h: "Current offers", items: [
          ["promotion", "Welcome bonus", "Boost your first deposit"],
        ]},
      ],
    },
    {
      id: "company", label: "Company", route: "about",
      cols: [
        { h: "RakizFx", items: [
          ["about",    "About us",    "Who we are"],
          ["faq",      "FAQ",         "Common questions"],
          ["careers",  "Careers",     "Join the team"],
          ["help",     "Help center", "Guides & tutorials"],
          ["contact",  "Contact us",  "Offices & support"],
        ]},
      ],
    },
  ];

  const sideLinks = [
    ["home",      "Home",              "M3 12 12 3l9 9M5 10v10h14V10"],
    ["markets",   "Markets",           "M3 17l6-6 4 4 8-8M14 7h7v7"],
    ["accounts",  "Accounts",          "M16 11a4 4 0 1 0-8 0v3a4 4 0 0 0 8 0v-3zM3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"],
    ["tools",     "Tools",             "M14.7 6.3a4 4 0 0 1 5.7 5.7L8.4 23.9l-5.4.6.6-5.4L14.7 6.3z"],
    ["partners",  "Become a Partner",  "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"],
    ["promotion", "Promotion",         "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"],
    ["about",     "About us",          "M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM12 16v-4M12 8h0"],
    ["faq",       "FAQ",               "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h0M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z"],
    ["careers",   "Careers",           "M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"],
    ["help",      "Help center",       "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"],
    ["contact",   "Contact us",        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"],
  ];

  const go = (r) => (e) => {
    e.preventDefault();
    onNav(r);
    setOpen(false);
    setHoverGroup(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="nav-wrap" onMouseLeave={() => setHoverGroup(null)}>
        <div className="container nav">
          <a href="#home" onClick={go("home")} className="nav-brand"><RakizLogo size={40} /></a>
          <button className="side-burger" onClick={() => setOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>
            </svg>
          </button>
          <nav className="nav-links">
            <a href="#home" className={route === "home" ? "active" : ""} onClick={go("home")} onMouseEnter={() => setHoverGroup(null)}>{t("nav.home")}</a>
            {groups.map(g => {
              const labelKey = `nav.${g.id === 'partner' ? 'partner' : g.id}`;
              return (
                <div key={g.id} className="nav-group" onMouseEnter={() => setHoverGroup(g.id)}>
                  <a
                    href={`#${g.route}`}
                    className={`nav-group-trigger ${route === g.route ? "active" : ""} ${hoverGroup === g.id ? "hovered" : ""}`}
                    onClick={go(g.route)}
                  >
                    {t(labelKey) === labelKey ? g.label : t(labelKey)}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6"/></svg>
                  </a>
                </div>
              );
            })}
          </nav>
          <div className="nav-cta">
            <button className="nav-search" aria-label={t("nav.search")} title={`${t("nav.search")} (⌘K)`} onClick={() => setSearchOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <div className={`nav-lang ${langOpen ? "open" : ""}`}>
              <button className="nav-lang-btn" aria-label={t("nav.language")} onClick={() => setLangOpen(o => !o)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
                <span>{(LANGS.find(l => l.code === lang) || LANGS[0]).nav}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div className="nav-lang-menu">
                {LANGS.map(l => (
                  <a key={l.code} href="#" className={lang === l.code ? "active" : ""}
                     onClick={(e) => { e.preventDefault(); setLang(l.code); setLangOpen(false); }}>
                    <b>{l.short}</b><span>{l.name}</span>
                    {lang === l.code && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginInlineStart: "auto", color: "var(--accent)" }}><path d="M20 6 9 17l-5-5"/></svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
            <a href="#login" className="btn btn-ghost btn-sm nav-login" onClick={go("login")}>{t("cta.login")}</a>
            <a href="#register" className="btn btn-primary btn-sm nav-register" onClick={go("register")}>{t("cta.open_account")}</a>
          </div>
        </div>

        {hoverGroup && (
          <div className="mega-menu">
            <div className="container mega-grid">
              {(groups.find(g => g.id === hoverGroup)?.cols || []).map((col, ci) => (
                <div key={ci} className="mega-col">
                  <h6>{col.h}</h6>
                  <ul>
                    {col.items.map(([r, label, desc], i) => (
                      <li key={i}>
                        <a href={`#${r}`} onClick={go(r)}>
                          <b>{label}</b>
                          <span>{desc}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="mega-promo">
                <span className="mega-chip">Get started</span>
                <h5>Open a live account in 2 minutes</h5>
                <p>Standard tier from $50. Card, bank wire or crypto — instant deposit, same-day withdrawal.</p>
                <a href="#register" className="btn btn-primary btn-sm" onClick={go("register")}>
                  Open Account
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onNav={(r) => { onNav(r); setSearchOpen(false); }} />}

      {open && <div className="side-overlay" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="side-head">
          <a href="#home" onClick={go("home")} className="side-brand">
            <RakizLogo size={28} />
          </a>
          <button className="side-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="side-profile">
          <div className="side-avatar">R</div>
          <div className="side-id">
            <b>Welcome, trader</b>
            <span>Not signed in</span>
          </div>
        </div>

        <nav className="side-nav">
          {sideLinks.map(([r, label, d]) => (
            <a key={r} href={`#${r}`} className={`side-link ${route === r ? "active" : ""}`} onClick={go(r)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={d}/>
              </svg>
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="side-foot">
          <a href="#register" className="btn btn-primary side-cta" onClick={go("register")}>
            Open Account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
          </a>
          <a href="#login" className="btn btn-ghost side-cta" onClick={go("login")}>Log in</a>
          <div className="side-meta">24/5 support · Segregated funds</div>
        </div>
      </aside>
    </>
  );
}

// ─── Ticker ────────────────────────────────────────────────────────────────

function TickerStrip() {
  const initial = [
    { sym: "EUR/USD", base: 1.0842, d: 4 },
    { sym: "XAU/USD", base: 2348.50, d: 2 },
    { sym: "USD/JPY", base: 156.83, d: 3 },
    { sym: "GBP/USD", base: 1.2658, d: 4 },
    { sym: "BTC/USD", base: 67432.5, d: 1 },
    { sym: "USOIL",  base: 79.21,  d: 2 },
    { sym: "US500",   base: 5278.4, d: 1 },
    { sym: "AUD/USD", base: 0.6612, d: 4 },
    { sym: "NZD/USD", base: 0.6028, d: 4 },
    { sym: "NAS100",  base: 18472, d: 1 },
    { sym: "ETH/USD", base: 3142.8, d: 2 },
  ];
  // animate by setting state at top level
  const [vals, setVals] = useState(initial.map(x => ({ ...x, v: x.base, d0: x.base })));
  useEffect(() => {
    const t = setInterval(() => {
      setVals(prev => prev.map(p => {
        const drift = (Math.random() - 0.5) * 2 * 0.0006 * p.base;
        return { ...p, v: p.v + drift };
      }));
    }, 1500);
    return () => clearInterval(t);
  }, []);
  const row = (key) => vals.map((it, i) => {
    const ch = ((it.v - it.d0) / it.d0) * 100;
    const up = ch >= 0;
    return (
      <span className="ticker-item" key={key + i}>
        <span className="sym">{it.sym}</span>
        <span className="mono">{fmt(it.v, it.d)}</span>
        <span className={`mono ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}%</span>
      </span>
    );
  });
  return (
    <div className="ticker">
      <div className="ticker-track">
        {row("a")}{row("b")}
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function HeroChart() {
  const [data, setData] = useState(() => randomWalk(60, 100, 1.4));
  useEffect(() => {
    const t = setInterval(() => {
      setData(d => {
        const next = [...d.slice(1), d[d.length-1] + (Math.random() - 0.45) * 1.6];
        return next;
      });
    }, 900);
    return () => clearInterval(t);
  }, []);
  const w = 480, h = 220;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 20) - 10,
  ]);
  const linePts = points.map(p => p.join(",")).join(" ");
  const areaPts = `0,${h} ${linePts} ${w},${h}`;
  const last = data[data.length - 1], first = data[0];
  const ch = ((last - first) / first) * 100;

  const tfs = ["1m","5m","15m","1H","4H","1D"];
  const [tf, setTf] = useState("15m");

  return (
    <div className="chart-card">
      <div className="chart-head">
        <span style={{ width: 32, height: 32, borderRadius: 8, background: "color-mix(in oklab, var(--accent) 18%, transparent)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "'Space Grotesk'" }}>€</span>
        <div>
          <div className="chart-pair">EUR/USD</div>
          <div style={{ fontSize: 11, color: "var(--fg-mute)", letterSpacing: ".06em", marginTop: 2 }}>EURO / US DOLLAR · LIVE</div>
        </div>
        <div className="chart-price">{fmt(1.08 + last/10000, 5)}</div>
      </div>
      <div className="chart-change mono" style={{ marginBottom: 8, color: ch >= 0 ? "var(--up)" : "var(--down)" }}>
        {ch >= 0 ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}% · Spread 0.2 pips
      </div>
      <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0.25, 0.5, 0.75].map(p =>
          <line key={p} x1="0" y1={h*p} x2={w} y2={h*p} stroke="var(--line)" strokeDasharray="2 4" />
        )}
        <polygon points={areaPts} fill="url(#ga)" />
        <polyline points={linePts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        {/* last dot */}
        <circle cx={points[points.length-1][0]} cy={points[points.length-1][1]} r="4" fill="var(--accent)" />
        <circle cx={points[points.length-1][0]} cy={points[points.length-1][1]} r="8" fill="var(--accent)" opacity="0.25" />
      </svg>
      <div className="chart-axis mono">
        <span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span>
      </div>
      <div className="chart-toolbar">
        {tfs.map(t => <button key={t} className={t === tf ? "on" : ""} onClick={() => setTf(t)}>{t}</button>)}
        <button style={{ marginLeft: "auto" }}>Buy 1.08{(last % 100).toFixed(0).padStart(3,"0").slice(0,3)}</button>
        <button>Sell</button>
      </div>
    </div>
  );
}

// ─── Live Market Clip (premium hero panel) ───────────────────────────────────────
function MarketClip() {
  const pairs = [
    { sym: "EUR/USD", px: 1.08423, d: 5 },
    { sym: "XAU/USD", px: 2348.50, d: 2 },
    { sym: "BTC/USD", px: 67432.5, d: 1 },
    { sym: "NAS100",  px: 18472.4, d: 1 },
  ];
  const [activeIdx, setActiveIdx] = useState(0);
  const active = pairs[activeIdx];

  // Candle stream
  const [candles, setCandles] = useState(() => {
    let last = 100;
    return Array.from({ length: 28 }, () => {
      const o = last;
      const c = o + (Math.random() - .45) * 3.2;
      const h = Math.max(o, c) + Math.random() * 1.4;
      const l = Math.min(o, c) - Math.random() * 1.4;
      last = c;
      return { o, h, l, c };
    });
  });
  useEffect(() => {
    const t = setInterval(() => {
      setCandles(cs => {
        const last = cs[cs.length - 1].c;
        const o = last;
        const c = o + (Math.random() - .48) * 3.4;
        const h = Math.max(o, c) + Math.random() * 1.6;
        const l = Math.min(o, c) - Math.random() * 1.6;
        return [...cs.slice(1), { o, h, l, c }];
      });
    }, 700);
    return () => clearInterval(t);
  }, []);

  // Order book
  const [book, setBook] = useState(() => makeBook(active.px));
  useEffect(() => {
    const t = setInterval(() => setBook(makeBook(active.px + (Math.random()-.5)*0.0008*active.px)), 1100);
    return () => clearInterval(t);
  }, [activeIdx]);

  // Heatmap
  const heatSyms = [
    ["AAPL", 0.8], ["MSFT", 1.4], ["NVDA", 2.1], ["TSLA", -1.2],
    ["META", 0.6], ["GOOG", -0.4], ["AMZN", 1.1], ["NFLX", 0.3],
  ];
  const [heat, setHeat] = useState(heatSyms);
  useEffect(() => {
    const t = setInterval(() => {
      setHeat(h => h.map(([s, v]) => [s, +(v + (Math.random()-.5)*0.4).toFixed(2)]));
    }, 1400);
    return () => clearInterval(t);
  }, []);

  // ticker line
  const tickerLine = [
    "FED HOLDS RATES STEADY", "GOLD HITS NEW HIGH", "OIL +1.2%",
    "BTC RECLAIMS 67K", "FED HOLDS RATES", "DXY 104.20",
  ];

  const max = Math.max(...candles.map(c => c.h));
  const min = Math.min(...candles.map(c => c.l));
  const range = max - min || 1;
  const candleH = 110;

  return (
    <div className="market-clip">
      <div className="mc-head">
        <span className="live">● LIVE</span>
        <span style={{ fontSize: 11, opacity: .6 }}>Powered by Rakiz Quote Engine</span>
        <div className="mc-tabs">
          {pairs.map((p, i) => (
            <button key={p.sym} className={`mc-tab ${i === activeIdx ? "on" : ""}`} onClick={() => setActiveIdx(i)}>{p.sym}</button>
          ))}
        </div>
      </div>

      <div className="mc-quote">
        <span className="pair">{active.sym}</span>
        <span className="px">{fmt(active.px + (candles[candles.length-1].c - 100)/2000 * active.px, active.d)}</span>
        <span className="ch">▲ +{((candles[candles.length-1].c - candles[0].o) / candles[0].o * 100).toFixed(2)}%</span>
        <span style={{ marginLeft: "auto", fontSize: 11, opacity: .55 }}>Spread <b style={{ color: "var(--accent)" }}>0.2</b> pips</span>
      </div>

      <div className="mc-candles">
        {candles.map((c, i) => {
          const isUp = c.c >= c.o;
          const top = candleH - ((c.h - min) / range) * candleH;
          const bot = candleH - ((c.l - min) / range) * candleH;
          const bodyTop = candleH - ((Math.max(c.o, c.c) - min) / range) * candleH;
          const bodyBot = candleH - ((Math.min(c.o, c.c) - min) / range) * candleH;
          return (
            <div key={i} className="mc-candle" style={{ color: isUp ? "#1ad17a" : "#ef4444", height: candleH, position: "relative" }}>
              <div className="wick" style={{ position: "absolute", top, height: bot - top, left: "50%" }} />
              <div className="body" style={{ position: "absolute", top: bodyTop, height: Math.max(2, bodyBot - bodyTop), left: 0, right: 0 }} />
            </div>
          );
        })}
      </div>

      <div className="mc-row">
        <div className="mc-panel">
          <h6>Order book</h6>
          {book.asks.slice().reverse().map((r, i) => (
            <div key={"a"+i} className="mc-ob-row ask">
              <span className="px">{fmt(r.px, 5)}</span><span>{r.sz.toFixed(2)}</span>
              <span className="fill" style={{ width: `${r.sz*22}%` }} />
            </div>
          ))}
          <div style={{ borderTop: "1px dashed rgba(255,255,255,.12)", margin: "6px 0", paddingTop: 6, fontSize: 10, color: "rgba(255,255,255,.5)", textAlign: "center" }}>spread 0.2</div>
          {book.bids.map((r, i) => (
            <div key={"b"+i} className="mc-ob-row bid">
              <span className="px">{fmt(r.px, 5)}</span><span>{r.sz.toFixed(2)}</span>
              <span className="fill" style={{ width: `${r.sz*22}%` }} />
            </div>
          ))}
        </div>

        <div className="mc-panel">
          <h6>Top movers</h6>
          <div className="mc-heat">
            {heat.map(([s, v]) => {
              const up = v >= 0;
              const bg = up
                ? `rgba(26,209,122,${0.15 + Math.min(.55, Math.abs(v)/4)})`
                : `rgba(239,68,68,${0.15 + Math.min(.55, Math.abs(v)/4)})`;
              return (
                <div key={s} className="h" style={{ background: bg }}>
                  <b>{s}</b><span className="c" style={{ color: up ? "var(--accent)" : "#ef4444" }}>{up?"+":""}{v.toFixed(2)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mc-panel">
          <h6>One-tap</h6>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", marginBottom: 6 }}>Volume</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 600 }}>0.25</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>lot</span>
          </div>
          <button style={{ width: "100%", padding: 8, marginBottom: 6, background: "var(--accent)", color: "var(--accent-ink)", border: 0, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>BUY {fmt(active.px + .0001, active.d)}</button>
          <button style={{ width: "100%", padding: 8, background: "rgba(239,68,68,.18)", color: "#ff8a92", border: 0, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>SELL {fmt(active.px - .0001, active.d)}</button>
          <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,.5)", display: "flex", justifyContent: "space-between" }}>
            <span>Margin</span><span className="mono" style={{ color: "#fff" }}>$67.22</span>
          </div>
        </div>
      </div>

      <div className="mc-ticker">
        <div className="mc-ticker-track">
          {[...tickerLine, ...tickerLine].map((t, i) => (
            <span key={i}>· {t} <span className={i % 3 === 0 ? "down" : "up"}>{i%3===0 ? "▼" : "▲"}</span></span>
          ))}
        </div>
      </div>
    </div>
  );
}

function makeBook(mid) {
  const bids = [], asks = [];
  for (let i = 0; i < 5; i++) {
    bids.push({ px: mid - (i+1)*0.00012*mid, sz: 0.4 + Math.random()*2.6 });
    asks.push({ px: mid + (i+1)*0.00012*mid, sz: 0.4 + Math.random()*2.6 });
  }
  return { bids, asks };
}

function F1CarFX() {
  return (
    <div className="f1-stage" aria-hidden="true">
      {/* Road line */}
      <div className="f1-road" />
      <div className="f1-road-dash" />

      {/* Trailing speed lines behind the car */}
      <span className="f1-trail t1" />
      <span className="f1-trail t2" />
      <span className="f1-trail t3" />
      <span className="f1-trail t4" />

      {/* The F1 car */}
      <div className="f1-car">
        <svg viewBox="0 0 320 90" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1a1a"/>
              <stop offset="60%" stopColor="#0a0a0a"/>
              <stop offset="100%" stopColor="#000"/>
            </linearGradient>
            <linearGradient id="accentG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1ad17a" stopOpacity="0"/>
              <stop offset="30%" stopColor="#1ad17a"/>
              <stop offset="100%" stopColor="#0fb068"/>
            </linearGradient>
          </defs>

          {/* shadow */}
          <ellipse cx="160" cy="80" rx="135" ry="4" fill="#000" opacity=".5"/>

          {/* rear wing */}
          <rect x="245" y="22" width="38" height="3" rx="1" fill="#0a0a0a"/>
          <rect x="250" y="20" width="2.5" height="16" fill="#0a0a0a"/>
          <rect x="278" y="20" width="2.5" height="16" fill="#0a0a0a"/>
          <rect x="245" y="30" width="38" height="2" fill="#1ad17a"/>
          <rect x="259" y="34" width="12" height="2" fill="#0a0a0a"/>

          {/* engine intake/airbox */}
          <path d="M 200 26 Q 215 26, 220 36 L 220 42 L 200 42 Z" fill="#0a0a0a"/>
          <rect x="206" y="30" width="10" height="4" fill="#1ad17a" opacity=".5"/>

          {/* main body */}
          <path d="
            M 60 52
            L 60 42
            Q 75 32, 130 30
            L 180 28
            Q 215 28, 250 36
            L 270 44
            L 270 60
            L 50 60
            Z"
            fill="url(#bodyG)"/>

          {/* side accent stripe */}
          <path d="
            M 80 44
            Q 95 38, 130 36
            L 175 35
            Q 200 36, 230 42
            L 245 46
            L 245 50
            L 80 50 Z"
            fill="url(#accentG)" opacity=".85"/>

          {/* nose */}
          <path d="M 0 56 L 12 50 L 60 42 L 60 60 L 0 60 Z" fill="#0a0a0a"/>

          {/* front wing */}
          <rect x="0" y="54" width="64" height="3.5" fill="#0a0a0a"/>
          <rect x="0" y="54" width="64" height="1.5" fill="#1ad17a"/>
          <rect x="3" y="48" width="3" height="8" fill="#0a0a0a"/>
          <rect x="56" y="48" width="3" height="8" fill="#0a0a0a"/>

          {/* side pod intake detail */}
          <path d="M 105 42 L 145 39 L 145 50 L 105 52 Z" fill="#111"/>
          <rect x="112" y="44" width="28" height="3" fill="#1ad17a" opacity=".7"/>

          {/* cockpit */}
          <path d="M 140 32 Q 152 18, 180 18 L 200 18 Q 215 22, 215 32 L 215 38 L 140 38 Z" fill="#0a0a0a"/>

          {/* halo */}
          <path d="M 150 24 Q 180 0, 215 24" stroke="#0a0a0a" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 178 8 L 178 22" stroke="#0a0a0a" strokeWidth="2"/>

          {/* helmet */}
          <path d="M 168 20 Q 168 10, 180 10 L 192 10 Q 202 10, 202 20 L 202 28 L 168 28 Z" fill="#0a0a0a"/>
          <rect x="169" y="14" width="33" height="4" fill="#1ad17a"/>
          {/* visor */}
          <path d="M 172 19 L 200 19 L 200 24 L 172 24 Z" fill="#06281a"/>
          <path d="M 172 19 L 200 19" stroke="rgba(255,255,255,.18)" strokeWidth=".8"/>

          {/* livery number */}
          <text x="116" y="48" fontFamily="Space Grotesk, sans-serif" fontSize="9" fontWeight="700" fill="#fff">RX</text>

          {/* highlight gloss on body */}
          <path d="M 75 36 Q 130 31, 180 30 Q 220 31, 250 38"
            stroke="rgba(255,255,255,.1)" strokeWidth="1.2" fill="none"/>

          {/* WHEELS */}
          <g>
            <circle cx="55" cy="60" r="15" fill="#000"/>
            <circle cx="55" cy="60" r="13" fill="#1a1a1a"/>
            <circle cx="55" cy="60" r="6" fill="#1ad17a"/>
            <circle cx="55" cy="60" r="2" fill="#0a0a0a"/>
            <line x1="55" y1="49" x2="55" y2="71" stroke="rgba(255,255,255,.4)" strokeWidth=".6" className="f1-spoke"/>
            <line x1="44" y1="60" x2="66" y2="60" stroke="rgba(255,255,255,.4)" strokeWidth=".6" className="f1-spoke"/>
            <line x1="47" y1="52" x2="63" y2="68" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
            <line x1="63" y1="52" x2="47" y2="68" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
          </g>
          <g>
            <circle cx="247" cy="60" r="15" fill="#000"/>
            <circle cx="247" cy="60" r="13" fill="#1a1a1a"/>
            <circle cx="247" cy="60" r="6" fill="#1ad17a"/>
            <circle cx="247" cy="60" r="2" fill="#0a0a0a"/>
            <line x1="247" y1="49" x2="247" y2="71" stroke="rgba(255,255,255,.4)" strokeWidth=".6"/>
            <line x1="236" y1="60" x2="258" y2="60" stroke="rgba(255,255,255,.4)" strokeWidth=".6"/>
            <line x1="239" y1="52" x2="255" y2="68" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
            <line x1="255" y1="52" x2="239" y2="68" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
          </g>
        </svg>
      </div>
    </div>
  );
}


function HeroVideo() {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("muted", "");
    const tryPlay = () => {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    tryPlay();
    // iOS sometimes needs a user gesture; retry on first interaction
    const retry = () => { tryPlay(); cleanup(); };
    const cleanup = () => {
      document.removeEventListener("touchstart", retry);
      document.removeEventListener("click", retry);
      document.removeEventListener("scroll", retry);
    };
    document.addEventListener("touchstart", retry, { once: true });
    document.addEventListener("click", retry, { once: true });
    document.addEventListener("scroll", retry, { once: true });
    return cleanup;
  }, []);
  return (
    <video
      ref={ref}
      className="hero-video"
      src="/assets/hero-bg.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster=""
      aria-hidden="true"
    />
  );
}

function HeroSingle() {
  const t = useT();
  return (
    <section className="hero-single">
      <HeroVideo />
      <div className="hero-video-tint" aria-hidden="true" />

      <div className="hero-fx" aria-hidden="true">
        <div className="hero-grid-bg" />
        <span className="hero-orb hero-orb-1" />
        <span className="hero-orb hero-orb-2" />
      </div>

      <div className="container hero-single-grid">
        <div className="hero-copy">
          <span className="hero-slogan">{t("hero.slogan")}</span>
          <h1 className="hero-h1 hero-h1-industry hero-h1-oneline">
            {t("hero.title")} <em>{t("hero.title_em")}</em>
          </h1>
          <p className="hero-lede">{t("hero.lede")}</p>
          <div className="hero-ctas-row">
            <a href="#register" className="btn btn-primary btn-lg">
              {t("cta.open_account")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
            </a>
            <a href="#register" className="btn btn-ghost-light btn-lg">{t("cta.try_demo")}</a>
          </div>
        </div>
      </div>
    </section>
  );
}


function HeroSlider() {
  const slides = [
    {
      eyebrow: "Our promise",
      title: <>Grow without <em>limits</em></>,
      lede: "Institutional execution. Transparent pricing. The infrastructure you need to compound your edge — at any scale.",
      cta: "Open free account",
      sub: "From $50 · 1,200+ instruments · 24/5",
      bg: "linear-gradient(135deg, #050505 0%, #0a1a12 60%, #061008 100%)",
      art: "trust",
      f1: true,
    },
    {
      eyebrow: "Lightning execution",
      title: <>Fills in <em>28 milliseconds.</em><br/>No requotes. Ever.</>,
      lede: "Tier-1 liquidity from 25+ banks. Co-located servers in LD4, NY4 and TY3.",
      cta: "See execution stats",
      sub: "Spreads from 0.0 pips",
      bg: "linear-gradient(135deg, #0a0a0a 0%, #11261a 60%, #0a1410 100%)",
      art: "speed",
    },
    {
      eyebrow: "1,200+ instruments",
      title: <>One account. <em>Every market.</em></>,
      lede: "Forex, indices, metals, energies, crypto and shares — from a single login.",
      cta: "Explore markets",
      sub: "24/5 across all asset classes",
      bg: "linear-gradient(135deg, #0a0a0a 0%, #0d2418 100%)",
      art: "globe",
    },
    {
      eyebrow: "Global funding",
      title: <>Fund globally. <em>Withdraw fast.</em></>,
      lede: "Deposit and withdraw via bank wire, card or crypto. Same-day withdrawals across every method.",
      cta: "Start trading",
      sub: "From $50 · instant deposits",
      bg: "linear-gradient(135deg, #0a0a0a 0%, #102a1c 100%)",
      art: "india",
    },
  ];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <section className="hero-slider"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((sl, i) => (
        <div key={i} className={`hs-slide ${i === idx ? "on" : ""}`} style={{ background: sl.bg }}>
          {i === idx && (
            <div className="hs-fx" aria-hidden="true">
              <div className="hs-grid-bg" />
              <span className="hs-orb o1" />
              <span className="hs-orb o2" />
              <span className="hs-streak s1" />
              <span className="hs-streak s2" />
              <span className="hs-streak s3" />
              <span className="hs-streak s4" />
              <span className="hs-streak s5" />
              <span className="hs-streak s6" />
              <span className="hs-streak s7" />
              <span className="hs-streak s8" />
              {sl.f1 && <F1CarFX />}
            </div>
          )}
          <div className="hs-grid container">
            <div className="hs-text">
              <span className="hs-eb"><span className="dot" /> {sl.eyebrow}</span>
              <h1>{sl.title}</h1>
              <p>{sl.lede}</p>
              <div className="hs-ctas">
                <a href="#register" className="btn btn-primary btn-lg">{sl.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg></a>
                <a href="#register" className="btn btn-ghost-light btn-lg">Try Demo</a>
              </div>
              <div className="hs-sub">{sl.sub}</div>
            </div>
            <div className="hs-art"><HsArt kind={sl.art} /></div>
          </div>
        </div>
      ))}
      <div className="hs-dots">
        {slides.map((_, i) => (
          <button key={i} className={`hs-dot ${i === idx ? "on" : ""}`} onClick={() => setIdx(i)} aria-label={`Slide ${i+1}`}>
            <span className="hs-dot-fill" />
          </button>
        ))}
      </div>
      <div className="hs-trust container">
        <span>✓ Segregated funds</span>
        <span>✓ Negative balance protection</span>
        <span>✓ 24/5 human support</span>
        <span>✓ Same-day withdrawals</span>
      </div>
    </section>
  );
}

function HsArt({ kind }) {
  if (kind === "trust") return <div className="hs-stat-card">
    <div className="hs-stat"><b>180K+</b><span>active traders</span></div>
    <div className="hs-stat"><b>★ 4.8</b><span>app rating</span></div>
    <div className="hs-stat"><b>60+</b><span>countries</span></div>
    <div className="hs-stat"><b>$2.4B</b><span>monthly volume</span></div>
  </div>;
  if (kind === "speed") return <div className="hs-speed">
    <div className="hs-ring"><b>28<sup>ms</sup></b><span>avg fill</span></div>
    <div className="hs-bars"><span style={{height:"30%"}}/><span style={{height:"55%"}}/><span style={{height:"80%"}}/><span style={{height:"45%"}}/><span style={{height:"70%"}}/></div>
  </div>;
  if (kind === "globe") return <div className="hs-globe">
    {["Forex","Indices","Metals","Energies","Crypto","Shares"].map((c, i) =>
      <span key={c} className="hs-orbit" style={{ animationDelay: `-${i*2.3}s` }}>{c}</span>
    )}
    <span className="hs-globe-core">1,200+</span>
  </div>;
  return <div className="hs-india">
    <div className="hs-rupee">$</div>
    <div className="hs-payments">
      {["Wire","Card","USDT","Crypto"].map(p => <span key={p}>{p}</span>)}
    </div>
  </div>;
}

function CinemaScene_DEPRECATED() {
  const back = Array.from({ length: 30 }, () => ({ h: 18 + Math.random()*22, up: Math.random() > .4 }));
  const mid  = Array.from({ length: 26 }, () => ({ h: 28 + Math.random()*48, up: Math.random() > .42 }));
  const front= Array.from({ length: 20 }, () => ({ h: 50 + Math.random()*120, up: Math.random() > .4 }));
  const Tree = ({ h, up, w = 6 }) => {
    const body = h * (0.55 + Math.random()*0.3);
    return (
      <span className={`c-tree ${up ? "up" : "down"}`} style={{ width: w, height: h, position: "relative" }}>
        <span className="wick" style={{ position: "absolute", left: "50%", top: 0, height: h }} />
        <span className="body" style={{ position: "absolute", left: 0, right: 0, bottom: (h - body)/2, height: body }} />
      </span>
    );
  };
  return (
    <div className="cinema">
      <div className="cinema-sky" />
      <div className="cinema-hud">
        <div className="left">
          <span className="pill live">LIVE</span>
          <span style={{ opacity: .65 }}>EUR / USD · M5</span>
        </div>
        <div className="right">
          <span>BID <b>1.08421</b></span><span>ASK <b>1.08423</b></span><span>SPRD <b>0.2</b></span>
        </div>
      </div>

      <div className="cinema-layer l-back">
        {[...back, ...back].map((c, i) => <Tree key={"b"+i} h={c.h} up={c.up} w={4} />)}
      </div>
      <div className="cinema-layer l-mid">
        {[...mid, ...mid].map((c, i) => <Tree key={"m"+i} h={c.h} up={c.up} w={6} />)}
      </div>
      <div className="cinema-layer l-front">
        {[...front, ...front].map((c, i) => <Tree key={"f"+i} h={c.h} up={c.up} w={9} />)}
      </div>

      <svg className="cinema-trail" viewBox="0 0 720 460" preserveAspectRatio="none">
        <path d="M 0 380 C 120 360, 220 280, 320 240 S 520 120, 720 90" />
      </svg>
      <span className="cinema-spark" />

      <div className="cinema-ground" />
      <div className="cinema-grain" />

      <div className="cinema-caption">
        <div>
          <h4>Ride the trend.</h4>
          <p>From signal to fill in 28 milliseconds.</p>
        </div>
        <span className="badge">Open account <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg></span>
      </div>
    </div>
  );
}

function Hero({ variant = "split" }) {
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-bars" aria-hidden="true">
        <span/><span/><span/><span/><span/>
      </div>
      <div className="container hero-grid">
        <div>
          <span className="chip fade-up d1"><span className="dot" /> Live · Markets open · Spreads from 0.0 pips</span>
          <h1 className="fade-up d2">
            Trade with <em>momentum.</em><br />
            Execute with edge.
          </h1>
          <p className="lede fade-up d3">
            RakizFx gives ambitious traders institutional-grade execution on 1,200+ instruments —
            forex, indices, metals, energies and crypto — from a single account.
          </p>
          <div className="hero-ctas fade-up d4">
            <a href="#register" className="btn btn-primary btn-lg">
              Open live account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
            </a>
            <a href="#register" className="btn btn-ghost btn-lg">Try Demo · $50,000 Virtual</a>
          </div>
          <div className="hero-stats fade-up d5">
            <div><span className="n display">0.0</span><span className="l">Pips raw spread</span></div>
            <div><span className="n display">28ms</span><span className="l">Avg. execution</span></div>
            <div><span className="n display">1:500</span><span className="l">Max leverage</span></div>
            <div><span className="n display">1,200+</span><span className="l">Instruments</span></div>
          </div>
        </div>
        <div className="fade-up d3" style={{ position: "relative" }}>
          <CinemaScene />
        </div>
      </div>
    </section>
  );
}

// ─── Trust strip ───────────────────────────────────────────────────────────

function Trust() {
  return (
    <div className="trust">
      <div className="container trust-row">
        <strong>Trusted by 180,000+ traders</strong>
        <span className="badge"><b>Segregated</b> client funds</span>
        <span className="badge"><b>SSL</b> 256-bit · TLS 1.3</span>
        <span style={{ marginLeft: "auto", color: "var(--fg-mute)", fontSize: 12 }}>
          Trusted by 180k+ traders across 60+ countries
        </span>
      </div>
    </div>
  );
}

// ─── Markets ───────────────────────────────────────────────────────────────

const MARKETS = {
  Forex: [
    { sym: "EUR/USD", name: "Euro / US Dollar",        base: 1.0842, d: 5, vol: 0.0008 },
    { sym: "GBP/USD", name: "Pound / US Dollar",       base: 1.2658, d: 5, vol: 0.001 },
    { sym: "USD/JPY", name: "US Dollar / Japanese Yen",base: 156.83, d: 3, vol: 0.05 },
    { sym: "AUD/USD", name: "Aussie / US Dollar",      base: 0.6612, d: 5, vol: 0.0007 },
    { sym: "USD/CAD", name: "US Dollar / Canadian Dollar",base: 1.3721, d: 5, vol: 0.0008 },
    { sym: "USD/CHF", name: "Dollar / Swiss Franc",    base: 0.9072, d: 5, vol: 0.0006 },
    { sym: "EUR/JPY", name: "Euro / Japanese Yen",     base: 170.04, d: 3, vol: 0.07 },
    { sym: "NZD/USD", name: "Kiwi / US Dollar",        base: 0.6028, d: 5, vol: 0.0006 },
  ],
  Indices: [
    { sym: "US500",  name: "S&P 500",        base: 5278.4, d: 1, vol: 1.8 },
    { sym: "NAS100", name: "US Tech 100",    base: 18472,  d: 1, vol: 12 },
    { sym: "US30",   name: "Wall Street 30", base: 39654,  d: 0, vol: 22 },
    { sym: "GER40",  name: "Germany 40",     base: 18432,  d: 1, vol: 14 },
    { sym: "UK100",  name: "FTSE 100",       base: 8224.5, d: 1, vol: 6 },
    { sym: "JP225",  name: "Nikkei 225",     base: 38573,  d: 0, vol: 30 },
    { sym: "IN50",   name: "Nifty 50",       base: 22487,  d: 1, vol: 9 },
    { sym: "HK50",   name: "Hang Seng",      base: 18642,  d: 0, vol: 22 },
  ],
  Metals: [
    { sym: "XAU/USD", name: "Gold spot",     base: 2348.50, d: 2, vol: 0.8 },
    { sym: "XAG/USD", name: "Silver spot",   base: 28.34,   d: 3, vol: 0.04 },
    { sym: "XPT/USD", name: "Platinum spot", base: 962.40,  d: 2, vol: 0.7 },
    { sym: "XPD/USD", name: "Palladium",     base: 1024.5,  d: 2, vol: 1.2 },
  ],
  Energies: [
    { sym: "USOIL",  name: "WTI Crude",     base: 79.21, d: 2, vol: 0.06 },
    { sym: "UKOIL",  name: "Brent Crude",   base: 83.46, d: 2, vol: 0.05 },
    { sym: "NGAS",   name: "Natural Gas",   base: 2.612, d: 3, vol: 0.01 },
  ],
  Crypto: [
    { sym: "BTC/USD", name: "Bitcoin",  base: 67432.5, d: 1, vol: 60 },
    { sym: "ETH/USD", name: "Ethereum", base: 3142.8,  d: 2, vol: 8 },
    { sym: "SOL/USD", name: "Solana",   base: 168.42,  d: 2, vol: 0.8 },
    { sym: "XRP/USD", name: "Ripple",   base: 0.5142,  d: 4, vol: 0.003 },
  ],
};

function MarketCard({ m }) {
  const [v, setV] = useState(m.base);
  const [d0] = useState(m.base + (Math.random() - 0.5) * m.vol * 6);
  const [spark, setSpark] = useState(() => randomWalk(24, m.base, m.vol));
  useEffect(() => {
    const t = setInterval(() => {
      setV(prev => prev + (Math.random() - 0.5) * m.vol);
      setSpark(s => [...s.slice(1), s[s.length-1] + (Math.random() - 0.5) * m.vol]);
    }, 1200 + Math.random() * 800);
    return () => clearInterval(t);
  }, []);
  const ch = ((v - d0) / d0) * 100;
  const up = ch >= 0;
  return (
    <div className="mkt">
      <div className="mkt-h">
        <div>
          <div className="mkt-sym">{m.sym}</div>
          <div className="mkt-name">{m.name}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <Sparkline data={spark} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="mkt-price">{fmt(v, m.d)}</span>
        <span className={`mkt-change ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}%</span>
      </div>
    </div>
  );
}

function Markets() {
  const tabs = Object.keys(MARKETS);
  const [tab, setTab] = useState(tabs[0]);
  return (
    <section id="markets">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 22 }}>
          <div>
            <span className="eyebrow">Markets</span>
            <h2 className="sec-title">1,200+ instruments — one account</h2>
            <p className="sec-sub">Tight, transparent spreads across every major asset class — with no hidden markups, no requotes.</p>
          </div>
          <a href="#" className="btn btn-ghost">All Instruments
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
          </a>
        </div>
        <div className="markets-tabs">
          {tabs.map(t => (
            <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>
              {t} <span style={{ opacity: .55, marginLeft: 4, fontSize: 12 }}>{MARKETS[t].length}</span>
            </button>
          ))}
        </div>
        <div className="market-grid">
          {MARKETS[tab].map(m => <MarketCard key={m.sym} m={m} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Why RakizFx ───────────────────────────────────────────────────────────

function Why() {
  const items = [
    {
      t: "24/7 support",
      p: "Real humans, around the clock. Average first response under 90 seconds — every day of the year.",
      i: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>,
    },
    {
      t: "Fast deposit · easy withdraw",
      p: "Instant deposits via card, wire or crypto. Withdrawals processed same day — no friction, no hidden fees.",
      i: <><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/><path d="M19 12H5" transform="translate(0 6) scale(1 -1)"/></>,
    },
    {
      t: "Low spreads",
      p: "Tight, institutional spreads from 0.0 pips with deep liquidity across every major asset class.",
      i: <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
    },
    {
      t: "Zero commission accounts",
      p: "Every account tier — STP, Pro and Elite — trades commission-free. You pay only the spread.",
      i: <><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></>,
    },
  ];
  return (
    <section id="why" className="why-section">
      <div className="container">
        <div className="why-header">
          <h2 className="why-title">Why traders choose <em>RakizFx</em></h2>
          <p className="why-sub">Institutional execution, human support, and conditions that scale with your strategy.</p>
        </div>
        <div className="why-grid why-grid-4">
          {items.map((it, i) => (
            <div key={i} className="card why-card">
              <span className="ico why-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{it.i}</svg>
              </span>
              <h3>{it.t}</h3>
              <p>{it.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Accounts ──────────────────────────────────────────────────────────────

function Accounts() {
  const accts = [
    {
      name: "STP",
      tag: "Straight-through processing",
      tagline: "Fast, transparent execution routed directly to liquidity providers.",
      deposit: "$50",
      depositLabel: "minimum deposit",
      bullets: [
        ["Spread",        "Standard spreads"],
        ["Leverage",      "Up to 1:400"],
        ["Commission",    "Zero commission on trades"],
        ["Swap-free",     "Adjustable swap-free option"],
        ["Funding",       "Instant deposit & faster withdrawal"],
        ["Platform",      "MetaTrader 5"],
        ["Support",       "24/7 technical support"],
      ],
      cta: "Open STP",
      feat: false,
    },
    {
      name: "Pro",
      tag: "Best for regular traders",
      tagline: "Faster execution, priority support and advanced trading conditions.",
      deposit: "$200",
      depositLabel: "minimum deposit",
      bullets: [
        ["Spread",        "Low, competitive spreads"],
        ["Leverage",      "Up to 1:500"],
        ["Commission",    "Zero commission on trades"],
        ["Swap-free",     "Adjustable swap-free option"],
        ["Funding",       "Instant deposit & faster withdrawal"],
        ["Platform",      "MetaTrader 5"],
        ["Support",       "24×7 priority support"],
      ],
      cta: "Open Pro",
      feat: true,
    },
    {
      name: "Elite",
      tag: "Best for VIP / high-volume traders",
      tagline: "VIP treatment. Exclusive support. Built for serious traders who expect the best.",
      deposit: "$2,000",
      depositLabel: "minimum deposit",
      bullets: [
        ["Spread",        "Ultra-low, ultra-competitive spreads"],
        ["Leverage",      "Custom leverage"],
        ["Commission",    "Zero commission on trades"],
        ["Swap-free",     "Adjustable swap-free option"],
        ["Manager",       "Dedicated relationship manager"],
        ["Withdrawals",   "Highest withdrawal priority"],
        ["VIP perks",     "Exclusive events & VIP invitations"],
        ["Platform",      "Advanced trading on MetaTrader 5"],
        ["Support",       "Dedicated 24×7 technical & sales support"],
      ],
      cta: "Open Elite",
      feat: false,
      premium: true,
    },
  ];
  return (
    <section id="accounts">
      <div className="container">
        <div className="accts">
          {accts.map((a, i) => (
            <div key={i} className={`acct ${a.feat ? "feat" : ""} ${a.premium ? "premium" : ""}`}>
              {a.feat && <span className="pop">POPULAR</span>}
              {a.premium && <span className="pop pop-vip">VIP</span>}
              <span className="tag">{a.tag}</span>
              <div className="name">{a.name}</div>
              <p className="acct-tagline">{a.tagline}</p>
              <div className="spread">
                <b>{a.deposit}</b><span>{a.depositLabel}</span>
              </div>
              <ul>
                {a.bullets.map(([label, value], j) => (
                  <li key={j}>
                    <span className="li-label">{label}</span>
                    <span className="li-value">{value}</span>
                  </li>
                ))}
              </ul>
              <a href="#register" className={`btn ${a.feat ? "btn-primary" : "btn-ghost"}`} style={{ width: "100%", justifyContent: "center" }}>{a.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Platforms ─────────────────────────────────────────────────────────────

function Platforms() {
  return (
    <section id="platforms" style={{ background: "var(--bg-1)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container">
        <span className="eyebrow">Platforms</span>
        <h2 className="sec-title">Trade on what you already love</h2>
        <p className="sec-sub" style={{ marginBottom: 36 }}>Same account, every device. Pick your weapon.</p>
        <div className="platforms">
          <div className="card plat">
            <div>
              <h3>MetaTrader 5</h3>
              <p>The industry standard. Multi-asset, 21 timeframes, depth of market, algorithmic trading.</p>
            </div>
            <div className="plat-meta">
              <span>Windows · macOS · Web</span>
            </div>
            <svg className="plat-bg" width="180" height="120" viewBox="0 0 180 120" fill="none">
              <rect x="10" y="20" width="160" height="80" rx="6" stroke="var(--line-2)"/>
              <path d="M20 80 L40 60 L60 70 L80 45 L100 55 L120 35 L140 50 L160 30" stroke="var(--accent)" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div className="card plat" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--accent) 8%, var(--bg-1)) 0%, var(--bg-1) 60%)" }}>
            <div>
              <h3>Rakiz Web</h3>
              <p>Our in-house platform. Zero install, multi-chart, hotkeys, one-click execution.</p>
            </div>
            <div className="plat-meta">
              <span>Any browser · No download</span>
            </div>
            <svg className="plat-bg" width="180" height="120" viewBox="0 0 180 120" fill="none">
              <rect x="10" y="20" width="160" height="80" rx="6" stroke="var(--accent)" opacity=".4"/>
              <rect x="10" y="20" width="160" height="14" rx="6" fill="var(--accent)" opacity=".2"/>
              <rect x="20" y="46" width="60" height="46" rx="3" stroke="var(--accent)" opacity=".5"/>
              <rect x="92" y="46" width="68" height="46" rx="3" stroke="var(--accent)" opacity=".5"/>
            </svg>
          </div>
          <div className="card plat">
            <div>
              <h3>Rakiz Mobile</h3>
              <p>Trade, fund, withdraw on the go. Biometric login. Real-time push price alerts.</p>
            </div>
            <div className="plat-meta">
              <span>iOS · Android</span>
            </div>
            <svg className="plat-bg" width="180" height="120" viewBox="0 0 180 120" fill="none">
              <rect x="60" y="14" width="60" height="100" rx="10" stroke="var(--line-2)"/>
              <path d="M68 90 L80 70 L92 75 L104 55 L116 65" stroke="var(--accent)" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────

function Steps() {
  const steps = [
    { t: "Sign up in 2 minutes", p: "Email and phone — that's it. No paperwork to start." },
    { t: "Verify your identity", p: "Passport or government ID. Most users verified in under 10 minutes." },
    { t: "Fund your account", p: "Bank wire, card or crypto. From $50. Instant credits." },
    { t: "Start trading", p: "MetaTrader 5 — desktop, web or mobile. Live or demo — your call." },
  ];
  return (
    <section id="open">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span className="eyebrow">Get started</span>
          <h2 className="sec-title">From zero to your first trade — in 10 minutes</h2>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div key={i} className="card step">
              <span className="n">{String(i+1).padStart(2,"0")}</span>
              <h4>{s.t}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA banner ────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="cta-banner">
          <div>
            <h2 className="display">Markets don't wait.<br/>Neither should you.</h2>
            <p>Open a live account today and get a $100 trading credit on your first deposit.*</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#register" className="btn btn-primary btn-lg">Open Live Account</a>
              <a href="#contact" className="btn btn-ghost btn-lg">Talk to an Expert</a>
            </div>
            <p style={{ fontSize: 11, color: "var(--fg-mute)", marginTop: 14 }}>* Terms apply. Trading credit subject to volume requirements.</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RakizLogo size={120} showWord={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer({ onNav }) {
  const go = (r) => (e) => {
    e.preventDefault();
    if (onNav) onNav(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cols = [
    { h: "Trading",   l: [["markets","Markets"],["funding","Deposits & withdrawals"],["tools","Calculators"],["tools","Economic calendar"]] },
    { h: "Platforms", l: [["home","MetaTrader 5"],["home","MT5 Web"],["home","MT5 Mobile"],["partners","VPS hosting"]] },
    { h: "Company",   l: [["about","About"],["about","Regulation"],["partners","Partners (IB)"],["contact","Contact"]] },
    { h: "Learn",     l: [["academy","Academy"],["academy","Glossary"],["faq","Help centre"],["faq","FAQ"]] },
  ];
  const socials: Array<{ name: string; href: string; svg: React.ReactNode }> = [
    {
      name: "X",
      href: "https://x.com/rakizfx",
      svg: <path d="M18.244 2H21l-6.52 7.45L22 22h-6.828l-4.77-6.232L4.8 22H2l7.04-8.046L1.6 2h7l4.33 5.7L18.244 2zm-1.196 18.4h1.86L7.04 3.49H5.094L17.048 20.4z" />,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/rakizfx",
      svg: <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
      </>,
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@rakizfx",
      svg: <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.96-1.96C18.88 4 12 4 12 4s-6.88 0-8.58.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.96 1.96C5.12 20 12 20 12 20s6.88 0 8.58-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98" fill="currentColor" stroke="none" />
      </>,
    },
    {
      name: "Telegram",
      href: "https://t.me/rakizfx",
      svg: <path d="M22 3 2 11l6.4 2.2L11 21l3-4.6 4.8 3.6L22 3zM9.6 14.4 9 18l1.8-2.6 4.2 3.1L18.6 7 9.6 14.4z" />,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/rakizfx",
      svg: <>
        <rect x="2" y="2" width="20" height="20" rx="3" />
        <path d="M7 9v9M7 6.5h.01M11 18v-5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5M11 13v5" />
      </>,
    },
    {
      name: "Facebook",
      href: "https://facebook.com/rakizfx",
      svg: <path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.2.19 2.2.19v2.42h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.72l-.43 2.89h-2.29v6.98A10 10 0 0 0 22 12z" />,
    },
  ];
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <RakizLogo size={32} />
            <p className="foot-tagline">
              Institutional-grade trading for ambitious retail traders. Built in India, regulated globally.
            </p>
            <div className="foot-contact">
              <a href="mailto:support@rakizfx.com" className="foot-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                support@rakizfx.com
              </a>
              <a href="tel:+912269000000" className="foot-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91 22 6900 0000
              </a>
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h} className="foot-col">
              <h5>{c.h}</h5>
              {c.l.map(([r, label], i) => <a key={i} href={`#${r}`} onClick={go(r)}>{label}</a>)}
            </div>
          ))}
        </div>

        <div className="foot-social-bar">
          <span className="foot-social-label">Follow us</span>
          <div className="foot-socials">
            {socials.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="foot-social"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {s.svg}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="foot-risk">
          <strong>Risk warning:</strong> Trading leveraged derivatives carries a high level of risk and may not be suitable for all investors. You may lose more than your initial deposit. Past performance is not indicative of future results. Please ensure you fully understand the risks involved and seek independent advice if necessary. RakizFx is the trade name of Rakiz Capital Ltd, authorised and regulated by the FSA (Licence 23847). Services are not offered to residents of the United States, Canada, North Korea, or any other jurisdiction where they would be contrary to local law.
        </div>
        <div className="foot-end">
          <span>© 2026 Rakiz Capital Ltd. All rights reserved.</span>
          <span className="foot-end-links">
            <a href="#" onClick={(e)=>e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Cookies</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Risk disclosure</a>
          </span>
        </div>
      </div>
    </footer>
  );
}


// ─── from premium.jsx ─────────────────────────────────────────────────
// RakizFx — Premium broker sections
// Stat counters, asset showcase, awards strip, account comparison, education teaser, full-bleed CTA


// ─────────────────────────────────────────────────────────────
// 1. Stat counter strip (animated on scroll)
// ─────────────────────────────────────────────────────────────
function StatStrip() {
  const stats = [
    { v: "0.0",     l: "Pips raw spread" },
    { v: "28ms",    l: "Avg execution" },
    { v: "1:1,000", l: "Max leverage" },
    { v: "1,200+",  l: "Instruments" },
    { v: "0%",      l: "Commission" },
  ];
  return (
    <section className="stats-strip-section">
      <div className="container">
        <div className="stats-row">
          {stats.map((s, i) => (
            <div key={i} className="stats-cell" style={{ "--stat-delay": `${i * 0.08}s` }}>
              <span className="stats-num">{s.v}</span>
              <span className="stats-label">{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountVal({ to, decimals = 0, duration = 1600 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    let started = false;
    const io = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const tick = (t) => {
            const k = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - k, 3);
            setVal(to * eased);
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

// ─────────────────────────────────────────────────────────────
// 2. Asset class showcase (large tabbed cards with featured pairs)
// ─────────────────────────────────────────────────────────────
const ASSET_CLASSES = {
  Forex: {
    sub: "60+ currency pairs · spreads from 0.0 pips",
    pairs: [
      { sym: "EUR/USD", name: "Euro / US Dollar",        spread: "0.0", change: "+0.18%" },
      { sym: "GBP/USD", name: "Pound / US Dollar",       spread: "0.1", change: "+0.34%" },
      { sym: "USD/JPY", name: "US Dollar / Japanese Yen",spread: "0.1", change: "-0.12%" },
      { sym: "AUD/USD", name: "Aussie / US Dollar",      spread: "0.1", change: "+0.22%" },
      { sym: "USD/CAD", name: "US Dollar / Canadian", spread: "0.1", change: "-0.06%" },
    ],
  },
  Indices: {
    sub: "Major global indices · 24/5 trading",
    pairs: [
      { sym: "US500",  name: "S&P 500",        spread: "0.2", change: "+0.42%" },
      { sym: "NAS100", name: "US Tech 100",    spread: "0.4", change: "+0.78%" },
      { sym: "US30",   name: "Wall Street 30", spread: "0.6", change: "+0.31%" },
      { sym: "GER40",  name: "Germany 40",     spread: "0.4", change: "+0.14%" },
      { sym: "IN50",   name: "India 50 (Nifty)",spread: "1.5",change: "+0.22%" },
    ],
  },
  Metals: {
    sub: "Gold, silver, platinum · safe-haven assets",
    pairs: [
      { sym: "XAU/USD", name: "Gold spot",     spread: "12", change: "+0.85%" },
      { sym: "XAG/USD", name: "Silver spot",   spread: "1.2",change: "+1.42%" },
      { sym: "XPT/USD", name: "Platinum spot", spread: "35", change: "+0.34%" },
    ],
  },
  Energies: {
    sub: "Crude oil, brent, natural gas",
    pairs: [
      { sym: "USOIL", name: "WTI Crude Oil",   spread: "0.018", change: "+1.24%" },
      { sym: "UKOIL", name: "Brent Crude Oil", spread: "0.018", change: "+0.92%" },
      { sym: "NGAS",  name: "Natural Gas",     spread: "0.005", change: "-0.55%" },
    ],
  },
  Crypto: {
    sub: "Major cryptocurrencies · 24/7 markets",
    pairs: [
      { sym: "BTC/USD", name: "Bitcoin",  spread: "18", change: "+2.14%" },
      { sym: "ETH/USD", name: "Ethereum", spread: "2.0",change: "+1.86%" },
      { sym: "SOL/USD", name: "Solana",   spread: "0.18",change: "+3.24%" },
      { sym: "XRP/USD", name: "Ripple",   spread: "0.0004", change: "+0.45%" },
    ],
  },
  Commodities: {
    sub: "Soft & hard commodities · cocoa, coffee, sugar, corn",
    pairs: [
      { sym: "COCOA",  name: "Cocoa",           spread: "10",   change: "+2.42" },
      { sym: "COFFEE", name: "Coffee Arabica",  spread: "0.40", change: "+0.55" },
      { sym: "SUGAR",  name: "Sugar",           spread: "0.04", change: "-0.32" },
      { sym: "CORN",   name: "Corn",            spread: "0.60", change: "+0.18" },
      { sym: "USOIL",  name: "WTI Crude Oil",   spread: "0.018",change: "+1.24" },
    ],
  },
  "Shares / Stocks": {
    sub: "100+ global stocks as CFDs",
    pairs: [
      { sym: "AAPL",  name: "Apple Inc.",      spread: "0.08", change: "+0.62%" },
      { sym: "MSFT",  name: "Microsoft Corp.", spread: "0.10", change: "+0.41%" },
      { sym: "TSLA",  name: "Tesla Inc.",      spread: "0.14", change: "-1.22%" },
      { sym: "NVDA",  name: "NVIDIA Corp.",    spread: "0.12", change: "+2.85%" },
    ],
  },
};

function AssetShowcase() {
  const tabs = Object.keys(ASSET_CLASSES);
  const [tab, setTab] = useState(tabs[0]);
  const data = ASSET_CLASSES[tab];
  const heroImg = {
    Forex:              "/assets/asset-forex-v2.svg",
    Commodities:        "/assets/asset-commodities-v2.svg",
    Indices:            "/assets/asset-indices.svg",
    Metals:             "/assets/asset-metals-v2.svg",
    Energies:           "/assets/asset-energies-v2.svg",
    Crypto:             "/assets/asset-crypto-v2.svg",
    "Shares / Stocks":  "/assets/asset-shares-v2.svg",
  }[tab];
  return (
    <section className="asset-showcase">
      <div className="container">
        <div className="asset-header">
          <span className="eyebrow">Markets</span>
          <h2 className="sec-title">Trade every <em>major asset class</em></h2>
        </div>
        <div className="asset-tabs">
          {tabs.map(t => (
            <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div className="asset-card">
          <div className="asset-card-head">
            <h3>{tab}</h3>
            <span>{data.sub}</span>
          </div>
          <div className="asset-card-body">
            <div className="asset-table">
              <div className="asset-row asset-row-head">
                <span>Symbol</span><span>Instrument</span><span>Typical spread</span><span>24h change</span><span></span>
              </div>
              {data.pairs.map((p, i) => (
                <div key={i} className="asset-row">
                  <span className="asset-sym mono">{p.sym}</span>
                  <span className="asset-name">{p.name}</span>
                  <span className="asset-spread mono">{p.spread} pips</span>
                  <span className={`asset-change mono ${p.change.startsWith("+") ? "up" : "down"}`}>{p.change}</span>
                  <a href="#register" className="asset-trade">Trade →</a>
                </div>
              ))}
            </div>
            <div className="asset-img-frame">
              <img src={heroImg} alt={`${tab} markets`} />
              <div className="asset-img-cap">{tab} · LIVE</div>
            </div>
          </div>
          <a href="#markets" className="asset-more">View all {tab.toLowerCase()} instruments →</a>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Awards / regulation strip (logos row)
// ─────────────────────────────────────────────────────────────
function AwardsStrip() {
  const awards = [
    { yr: "2025", title: "Most Trusted Broker", body: "FX Empire Awards" },
    { yr: "2025", title: "Best Mobile Trading App", body: "Finance Magnates" },
    { yr: "2024", title: "Best Customer Service", body: "World Finance" },
    { yr: "2024", title: "Best Ethical Broker", body: "TradeON Summit" },
    { yr: "2024", title: "Most Innovative CFD Broker", body: "Global Forex Awards" },
  ];
  return (
    <section className="awards-strip">
      <div className="container">
        <div className="awards-head">
          <span className="eyebrow">Recognised globally</span>
          <h2 className="sec-title">Award-winning, year on year</h2>
        </div>
        <div className="awards-grid">
          {awards.map((a, i) => (
            <div key={i} className="award-card">
              <div className="award-medal">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="9" r="6"/>
                  <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11"/>
                </svg>
              </div>
              <span className="award-year">{a.yr}</span>
              <h4>{a.title}</h4>
              <span className="award-body">{a.body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Account comparison table
// ─────────────────────────────────────────────────────────────
function AccountCompare() {
  const t = useT();
  const accts = [
    { id: "stp",   name: "Standard",   tag: "Straight-through processing",
      summary: "Easy start with fast, direct-to-market execution.",
      feat: false },
    { id: "pro",   name: "Pro",        tag: "For active traders",
      summary: "Tighter spreads and priority execution for daily traders.",
      feat: true },
    { id: "elite", name: "Elite",      tag: "VIP / high-volume",
      summary: "Ultra-tight spreads and a dedicated relationship manager.",
      feat: false, premium: true },
  ];
  const goAccounts = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = "#accounts";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <section className="acct-compare-section">
      <div className="container">
        <div className="section-head">
          <h2 className="sec-title">{t("accts.choose")}</h2>
          <p className="sec-sub">{t("accts.sub")}</p>
        </div>
        <div className="acct-simple-grid acct-simple-grid--basic">
          {accts.map(a => (
            <div
              key={a.id}
              className={`acct-simple ${a.feat ? "feat" : ""} ${a.premium ? "premium" : ""}`}
            >
              {a.feat && <span className="pop">POPULAR</span>}
              {a.premium && <span className="pop pop-vip">VIP</span>}
              <span className="acct-simple-tag">{a.tag}</span>
              <div className="acct-simple-name">{a.name}</div>
              <p className="acct-simple-summary">{a.summary}</p>
              <a
                href="#register"
                className={`btn ${a.feat ? "btn-primary" : "btn-ghost"} acct-simple-cta`}
                onClick={(e) => { e.preventDefault(); /* CRM disabled — click intentionally no-ops */ }}
              >
                {t("cta.open_account")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Education hub teaser (3 featured tracks)
// ─────────────────────────────────────────────────────────────
function EducationTeaser() {
  const tracks = [
    {
      level: "Beginner",
      title: "Forex foundations",
      body: "Master the basics — quotes, lots, leverage and your first demo trade.",
      lessons: 8,
      icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5a8 8 0 0 0 12 0v-5"/></>,
    },
    {
      level: "Intermediate",
      title: "Technical analysis",
      body: "Candlestick patterns, support & resistance, indicators and chart structures.",
      lessons: 12,
      icon: <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
    },
    {
      level: "All levels",
      title: "Risk management",
      body: "Position sizing, R:R, drawdown control and the math behind survival.",
      lessons: 6,
      icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    },
  ];
  return (
    <section className="edu-teaser-section">
      <div className="container">
        <div className="edu-head">
          <div>
            <span className="eyebrow">Academy</span>
            <h2 className="sec-title">Learn from the ground up</h2>
            <p className="sec-sub">Self-paced tracks built by trading-desk veterans. Free for every RakizFx client.</p>
          </div>
          <a href="#academy" className="btn btn-ghost">All Tracks →</a>
        </div>
        <div className="edu-teaser-grid">
          {tracks.map((t, i) => (
            <a key={i} href="#academy" className="edu-teaser-card">
              <div className="edu-teaser-ic">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
              </div>
              <span className="edu-teaser-level">{t.level} · {t.lessons} lessons</span>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
              <span className="edu-teaser-go">Start Track →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. Full-bleed dark CTA (replaces old CTABanner on home)
// ─────────────────────────────────────────────────────────────
function FullCTA() {
  return (
    <section className="full-cta-section">
      <div className="full-cta-bg" aria-hidden="true">
        <div className="full-cta-orb full-cta-orb-1" />
        <div className="full-cta-orb full-cta-orb-2" />
      </div>
      <div className="container full-cta-grid">
        <div className="full-cta-copy">
          <span className="hero-chip">
            <span className="hero-chip-dot" />
            Start in 2 minutes
          </span>
          <h2>Markets don&rsquo;t wait<br/><em>Neither should you</em></h2>
          <p>Open a live account in under 2 minutes. Fund from $50 via bank wire, card or crypto. Trade 1,200+ instruments from a single MetaTrader 5 login.</p>
          <div className="full-cta-actions">
            <a href="#register" className="btn btn-primary btn-lg">
              Open live account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
            </a>
            <a href="#register" className="btn btn-ghost-light btn-lg">Try Free Demo</a>
          </div>
          <div className="full-cta-trust">
            <span>✓ From $50</span>
            <span>✓ Instant deposits</span>
            <span>✓ Same-day withdrawals</span>
            <span>✓ 24/5 support</span>
          </div>
        </div>
        <div className="full-cta-art">
          <div className="full-cta-photo">
            <img src="/assets/img-trader-screens.jpg" alt="Trader monitoring charts on laptop and phone" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. Platform showcase (Pro-style large mockup)
// ─────────────────────────────────────────────────────────────
function PlatformShowcase() {
  return (
    <section className="platform-showcase">
      <div className="container platform-grid">
        <div className="platform-copy">
          <span className="eyebrow">Platforms</span>
          <h2 className="sec-title">MetaTrader 5 — <em>everywhere you trade</em></h2>
          <p className="sec-sub">Desktop, web and mobile — your account stays in sync. One-click execution, 38 built-in indicators, depth of market, expert advisors and the MQL5 marketplace.</p>
          <ul className="platform-points">
            <li><span className="platform-tick">⚡</span><div><b>Lightning execution</b><span>28ms average fill across all markets</span></div></li>
            <li><span className="platform-tick">📊</span><div><b>Advanced charting</b><span>38 indicators, 21 timeframes, depth of market</span></div></li>
            <li><span className="platform-tick">🤖</span><div><b>Algorithmic trading</b><span>Expert Advisors (EAs) + MQL5 marketplace</span></div></li>
            <li><span className="platform-tick">📱</span><div><b>Mobile-first</b><span>Native iOS &amp; Android with biometric login</span></div></li>
          </ul>
          <div className="platform-ctas">
            <a href="#register" className="btn btn-primary">Open MT5 Account</a>
            <a href="#academy" className="btn btn-ghost">MT5 Tutorials</a>
          </div>
        </div>
        <div className="platform-art">
          <div className="mt5-devices">
            <img
              src="/assets/mt5-devices.jpg"
              alt="MetaTrader 5 on laptop, iPhone and Android with Windows, macOS, Linux, iOS, Android, Chrome, Safari, Edge, Firefox and Opera"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformMockup() {
  // Simple MT5-ish dashboard mockup
  return (
    <div className="pm-shell">
      <div className="pm-bar">
        <span className="pm-dot pm-r"/><span className="pm-dot pm-y"/><span className="pm-dot pm-g"/>
        <span className="pm-title">MetaTrader 5 — RakizFx</span>
      </div>
      <div className="pm-body">
        <aside className="pm-side">
          {["EUR/USD","GBP/USD","XAU/USD","NAS100","BTC/USD","USD/JPY"].map((s, i) => (
            <div key={s} className={`pm-watch ${i === 0 ? "on" : ""}`}>
              <span className="pm-sym">{s}</span>
              <span className={`pm-ch mono ${i % 2 ? "up" : "down"}`}>{i % 2 ? "▲" : "▼"} {(Math.random()*0.6).toFixed(2)}%</span>
            </div>
          ))}
        </aside>
        <div className="pm-chart">
          <div className="pm-chart-head">
            <b>EUR/USD</b>
            <span>M15 · 1.08423</span>
            <span className="pm-spread">Spread 0.2 pips</span>
          </div>
          <svg viewBox="0 0 400 180" className="pm-chart-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1ad17a" stopOpacity=".4"/>
                <stop offset="100%" stopColor="#1ad17a" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map(p => <line key={p} x1="0" y1={180*p} x2="400" y2={180*p} stroke="rgba(255,255,255,.08)" strokeDasharray="2 4"/>)}
            <polygon points="0,180 0,140 30,130 60,120 90,110 120,115 150,95 180,100 210,80 240,70 270,75 300,60 330,55 360,40 400,35 400,180" fill="url(#pmGrad)"/>
            <polyline points="0,140 30,130 60,120 90,110 120,115 150,95 180,100 210,80 240,70 270,75 300,60 330,55 360,40 400,35" fill="none" stroke="#1ad17a" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="400" cy="35" r="4" fill="#1ad17a"/>
            <circle cx="400" cy="35" r="8" fill="#1ad17a" opacity=".3"/>
          </svg>
          <div className="pm-orders">
            <button className="pm-buy">BUY 1.08423</button>
            <button className="pm-sell">SELL 1.08421</button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── from markets.jsx ─────────────────────────────────────────────────
// RakizFx — Markets page (FxPro-style live overview, no charts)


const MARKETS_DATA = {
  Forex: [
    { sym: "EUR/USD", name: "Euro / US Dollar",         bid: 1.08421, ask: 1.08423, spread: "0.2", change: "+0.18", d: 5 },
    { sym: "GBP/USD", name: "Pound / US Dollar",        bid: 1.26581, ask: 1.26584, spread: "0.3", change: "+0.34", d: 5 },
    { sym: "USD/JPY", name: "US Dollar / Japanese Yen", bid: 156.832, ask: 156.835, spread: "0.3", change: "-0.12", d: 3 },
    { sym: "AUD/USD", name: "Aussie / US Dollar",       bid: 0.66124, ask: 0.66127, spread: "0.3", change: "+0.22", d: 5 },
    { sym: "USD/CAD", name: "US Dollar / Canadian",     bid: 1.37214, ask: 1.37218, spread: "0.4", change: "-0.08", d: 5 },
    { sym: "USD/CHF", name: "US Dollar / Swiss Franc",  bid: 0.90724, ask: 0.90727, spread: "0.3", change: "+0.14", d: 5 },
    { sym: "NZD/USD", name: "Kiwi / US Dollar",         bid: 0.60284, ask: 0.60288, spread: "0.4", change: "+0.06", d: 5 },
    { sym: "EUR/GBP", name: "Euro / Pound",             bid: 0.85684, ask: 0.85687, spread: "0.3", change: "-0.09", d: 5 },
    { sym: "EUR/JPY", name: "Euro / Japanese Yen",      bid: 170.041, ask: 170.045, spread: "0.4", change: "+0.06", d: 3 },
    { sym: "USD/CAD", name: "US Dollar / Canadian Dollar", bid: 1.3721, ask: 1.3725, spread: "0.4", change: "-0.06", d: 5 },
  ],
  Indices: [
    { sym: "US500",  name: "S&P 500",        bid: 5278.4, ask: 5278.6, spread: "0.2", change: "+0.42", d: 1 },
    { sym: "NAS100", name: "US Tech 100",    bid: 18472,  ask: 18473,  spread: "0.4", change: "+0.78", d: 0 },
    { sym: "US30",   name: "Wall Street 30", bid: 39654,  ask: 39656,  spread: "0.6", change: "+0.31", d: 0 },
    { sym: "GER40",  name: "Germany 40",     bid: 18432,  ask: 18433,  spread: "0.4", change: "+0.14", d: 0 },
    { sym: "UK100",  name: "FTSE 100",       bid: 8224.5, ask: 8225.1, spread: "0.4", change: "-0.22", d: 1 },
    { sym: "JP225",  name: "Nikkei 225",     bid: 38573,  ask: 38576,  spread: "3.0", change: "+0.55", d: 0 },
    { sym: "IN50",   name: "India 50 (Nifty)",bid: 22487, ask: 22489,  spread: "1.5", change: "+0.22", d: 1 },
    { sym: "HK50",   name: "Hang Seng 50",   bid: 18642,  ask: 18645,  spread: "3.0", change: "-0.18", d: 0 },
  ],
  Metals: [
    { sym: "XAU/USD", name: "Gold spot",     bid: 2348.42, ask: 2348.54, spread: "12",  change: "+0.85", d: 2 },
    { sym: "XAG/USD", name: "Silver spot",   bid: 28.342,  ask: 28.354,  spread: "1.2", change: "+1.42", d: 3 },
    { sym: "XPT/USD", name: "Platinum spot", bid: 962.40,  ask: 962.75,  spread: "35",  change: "+0.34", d: 2 },
    { sym: "XPD/USD", name: "Palladium",     bid: 1024.5,  ask: 1025.2,  spread: "70",  change: "-0.42", d: 2 },
  ],
  Energies: [
    { sym: "USOIL", name: "WTI Crude Oil",   bid: 79.192, ask: 79.210, spread: "0.018", change: "+1.24", d: 3 },
    { sym: "UKOIL", name: "Brent Crude Oil", bid: 83.442, ask: 83.460, spread: "0.018", change: "+0.92", d: 3 },
    { sym: "NGAS",  name: "Natural Gas",     bid: 2.607,  ask: 2.612,  spread: "0.005", change: "-0.55", d: 3 },
  ],
  Crypto: [
    { sym: "BTC/USD", name: "Bitcoin",  bid: 67414, ask: 67432, spread: "18",   change: "+2.14", d: 0 },
    { sym: "ETH/USD", name: "Ethereum", bid: 3140.8, ask: 3142.8, spread: "2.0", change: "+1.86", d: 2 },
    { sym: "SOL/USD", name: "Solana",   bid: 168.24, ask: 168.42, spread: "0.18",change: "+3.24", d: 2 },
    { sym: "XRP/USD", name: "Ripple",   bid: 0.5138, ask: 0.5142, spread: "0.0004", change: "+0.45", d: 4 },
  ],
  Commodities: [
    { sym: "USOIL", name: "WTI Crude Oil",   bid: 79.192, ask: 79.210, spread: "0.018", change: "+1.24", d: 3 },
    { sym: "UKOIL", name: "Brent Crude Oil", bid: 83.442, ask: 83.460, spread: "0.018", change: "+0.92", d: 3 },
    { sym: "XAU/USD", name: "Gold spot",     bid: 2348.42, ask: 2348.54, spread: "12",  change: "+0.85", d: 2 },
    { sym: "COCOA", name: "Cocoa",           bid: 9842,   ask: 9852,    spread: "10",    change: "+2.42", d: 0 },
    { sym: "COFFEE",name: "Coffee Arabica",  bid: 218.45, ask: 218.85,  spread: "0.40",  change: "+0.55", d: 2 },
    { sym: "SUGAR",name: "Sugar",            bid: 19.62,  ask: 19.66,   spread: "0.04",  change: "-0.32", d: 2 },
    { sym: "CORN", name: "Corn",             bid: 458.2,  ask: 458.8,   spread: "0.6",   change: "+0.18", d: 1 },
  ],
  Shares: [
    { sym: "AAPL",  name: "Apple Inc.",      bid: 184.32, ask: 184.40, spread: "0.08", change: "+0.62", d: 2 },
    { sym: "MSFT",  name: "Microsoft Corp.", bid: 422.15, ask: 422.25, spread: "0.10", change: "+0.41", d: 2 },
    { sym: "TSLA",  name: "Tesla Inc.",      bid: 178.42, ask: 178.56, spread: "0.14", change: "-1.22", d: 2 },
    { sym: "NVDA",  name: "NVIDIA Corp.",    spread: "0.12", bid: 894.30, ask: 894.42, change: "+2.85", d: 2 },
    { sym: "GOOG",  name: "Alphabet Inc.",   bid: 167.84, ask: 167.94, spread: "0.10", change: "+0.55", d: 2 },
    { sym: "META",  name: "Meta Platforms",  bid: 472.62, ask: 472.76, spread: "0.14", change: "+0.88", d: 2 },
  ],
};

function fmtN(n, d) { return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }

function MarketsLiveTable() {
  const tabs = Object.keys(MARKETS_DATA);
  const [tab, setTab] = useState(tabs[0]);
  const [rows, setRows] = useState(() =>
    Object.fromEntries(tabs.map(t => [t, MARKETS_DATA[t].map(r => ({ ...r, baseBid: r.bid, baseAsk: r.ask, dir: 0 }))]))
  );
  useEffect(() => {
    const t = setInterval(() => {
      setRows(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          next[k] = next[k].map(r => {
            const drift = (Math.random() - 0.5) * Math.max(0.0001, r.baseBid * 0.0002);
            const newBid = r.bid + drift;
            const newAsk = newBid + (r.ask - r.bid);
            return { ...r, bid: newBid, ask: newAsk, dir: drift >= 0 ? 1 : -1 };
          });
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(t);
  }, []);
  const list = rows[tab];
  return (
    <div className="mkt-live">
      <div className="mkt-live-tabs">
        {tabs.map(t => (
          <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>
            {t} <span>{MARKETS_DATA[t].length}</span>
          </button>
        ))}
      </div>
      <div className="mkt-live-table">
        <div className="mkt-live-row mkt-live-head">
          <span>Symbol</span>
          <span>Instrument</span>
          <span>Bid</span>
          <span>Ask</span>
          <span>Spread</span>
          <span>24h</span>
          <span></span>
        </div>
        {list.map((r, i) => {
          const up = parseFloat(r.change) >= 0;
          return (
            <div key={r.sym} className="mkt-live-row">
              <span className="mkt-live-sym mono">{r.sym}</span>
              <span className="mkt-live-name">{r.name}</span>
              <span className={`mkt-live-px mono ${r.dir > 0 ? "flash-up" : r.dir < 0 ? "flash-down" : ""}`}>{fmtN(r.bid, r.d)}</span>
              <span className={`mkt-live-px mono ${r.dir > 0 ? "flash-up" : r.dir < 0 ? "flash-down" : ""}`}>{fmtN(r.ask, r.d)}</span>
              <span className="mono mkt-live-spread">{r.spread} pips</span>
              <span className={`mono mkt-live-ch ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(parseFloat(r.change)).toFixed(2)}%</span>
              <a href="#register" className="mkt-live-trade">Trade</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Why traders choose RakizFx
function WhyTraders() {
  const items = [
    { t: "Low spreads",                p: "Tight institutional spreads from 0.0 pips on Pro and Elite accounts.", i: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    { t: "24/7 support",               p: "Real humans, around the clock. Average reply time under 90 seconds.", i: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" },
    { t: "Fast deposits",              p: "Instant via card, bank wire and crypto. Same-day processing.", i: "M5 12h14M13 5l7 7-7 7" },
    { t: "Easy withdrawals",           p: "Same-day processing on every method. No hidden fees, no friction.", i: "M19 12H5M11 19l-7-7 7-7" },
    { t: "No commissions",             p: "Zero commission on Standard, Pro and Elite accounts on every trade.", i: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" },
    { t: "Negative balance protection",p: "You can never lose more than your deposit. Built in for every account.", i: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { t: "Tier-1 liquidity",           p: "25+ liquidity providers and deep market depth on every instrument.", i: "M2 22V12a10 10 0 0 1 20 0v10M2 17h20M2 12h20" },
    { t: "MetaTrader 5",               p: "The world's most advanced trading platform — desktop, web and mobile.", i: "M3 3h18v18H3zM3 9h18M9 21V9" },
  ];
  return (
    <section className="why-traders">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span className="eyebrow">Why traders choose RakizFx</span>
          <h2 className="sec-title">Eight reasons to trade with us</h2>
        </div>
        <div className="why-traders-grid">
          {items.map((it, i) => (
            <div key={i} className="why-traders-card">
              <span className="why-traders-ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.i}/></svg>
              </span>
              <h3>{it.t}</h3>
              <p>{it.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketsAccountTypes() {
  const accts = [
    { name: "STP",   tag: "Straight-through processing",
      mins: "$50",   spread: "Standard", lev: "1:400",  cta: "Open STP",   feat: false },
    { name: "Pro",   tag: "For active traders",
      mins: "$200",  spread: "Low",      lev: "1:1000",  cta: "Open Pro",   feat: true },
    { name: "Elite", tag: "VIP / high-volume",
      mins: "$2,000",spread: "Ultra-low",lev: "Custom", cta: "Open Elite", feat: false, premium: true },
  ];
  return (
    <section className="mkt-accounts">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span className="eyebrow">Account types</span>
          <h2 className="sec-title">Three accounts — one mission</h2>
          <p className="sec-sub" style={{ margin: "0 auto" }}>Pick the tier that matches your strategy. Upgrade anytime — no paperwork.</p>
        </div>
        <div className="accts">
          {accts.map((a, i) => (
            <div key={i} className={`acct ${a.feat ? "feat" : ""} ${a.premium ? "premium" : ""}`}>
              {a.feat && <span className="pop">POPULAR</span>}
              {a.premium && <span className="pop pop-vip">VIP</span>}
              <span className="tag">{a.tag}</span>
              <div className="name">{a.name}</div>
              <div className="spread">
                <b>{a.mins}</b><span>minimum deposit</span>
              </div>
              <ul>
                <li><span className="li-label">Spread</span><span className="li-value">{a.spread}</span></li>
                <li><span className="li-label">Leverage</span><span className="li-value">{a.lev}</span></li>
                <li><span className="li-label">Commission</span><span className="li-value">Zero</span></li>
                <li><span className="li-label">Swap-free</span><span className="li-value">Available</span></li>
                <li><span className="li-label">Platform</span><span className="li-value">MetaTrader 5</span></li>
                <li><span className="li-label">Support</span><span className="li-value">{a.premium ? "Dedicated 24×7" : a.feat ? "24×7 priority" : "24/7 technical"}</span></li>
              </ul>
              <a href="#register" className={`btn ${a.feat ? "btn-primary" : "btn-ghost"}`} style={{ width: "100%", justifyContent: "center" }}>{a.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketsNewsGrid() {
  const news = [
    { tag: "Forex",  date: "23 May 2026", h: "USD softens as Fed signals patience on rate cuts", p: "Dollar index slips 0.4% after dovish remarks from a senior Fed official, lifting EUR/USD above 1.0840.", img: "/assets/img-currency.jpg" },
    { tag: "Crypto", date: "23 May 2026", h: "Bitcoin retests $67K resistance amid ETF inflows", p: "Spot Bitcoin ETFs see a third consecutive week of net inflows, pushing BTC back to the upper $60Ks.", img: "/assets/img-bitcoin.jpg" },
    { tag: "Markets",date: "22 May 2026", h: "Nasdaq closes at fresh high as semis lead rally", p: "Tech-heavy index gains 0.8% with chipmakers up 2.4% on AI-demand commentary.", img: "/assets/img-phone-trading.jpg" },
    { tag: "Metals", date: "22 May 2026", h: "Gold edges above $2,350 as Treasury yields ease", p: "Spot gold gains 0.85% with safe-haven flows picking up ahead of FOMC minutes.", img: "/assets/img-bitcoin.jpg" },
    { tag: "Energy", date: "21 May 2026", h: "Crude oil rebounds 1.2% on China demand outlook", p: "WTI futures climb to $79/bbl after better-than-expected Chinese manufacturing PMI.", img: "/assets/img-currency.jpg" },
    { tag: "Macro",  date: "21 May 2026", h: "Fed minutes signal cautious stance on rate cuts", p: "FOMC notes reinforce a data-dependent path, with markets pricing one cut by Q4.", img: "/assets/img-phone-trading.jpg" },
  ];
  return (
    <section className="mkt-news">
      <div className="container">
        <div className="mkt-news-head">
          <div>
            <span className="eyebrow">Markets in motion</span>
            <h2 className="sec-title">Today's market news</h2>
          </div>
          <a href="#tools" className="btn btn-ghost">All Analysis →</a>
        </div>
        <div className="mkt-news-grid">
          {news.map((n, i) => (
            <a key={i} className="mkt-news-card" href="#tools" onClick={(e)=>e.preventDefault()}>
              <div className="mkt-news-img">
                <img src={n.img} alt={n.tag} />
                <span className="mkt-news-tag">{n.tag}</span>
              </div>
              <div className="mkt-news-body">
                <span className="mkt-news-date">{n.date}</span>
                <h3>{n.h}</h3>
                <p>{n.p}</p>
                <span className="mkt-news-read">Read more →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketsMT5Section() {
  return (
    <section className="mkt-mt5">
      <div className="container mkt-mt5-grid">
        <div>
          <span className="eyebrow">Trading platform</span>
          <h2 className="sec-title">MetaTrader 5 — built for traders</h2>
          <p className="sec-sub">The industry-standard platform — multi-asset, multi-timeframe, with advanced order types, expert advisors and full algorithmic support. Available on every device.</p>
          <ul className="mt5-points">
            <li><span className="mt5-tick">⚡</span><div><b>One-click execution</b><span>Fast fills with no requotes</span></div></li>
            <li><span className="mt5-tick">📊</span><div><b>38 indicators · 21 timeframes</b><span>Plus depth of market</span></div></li>
            <li><span className="mt5-tick">🤖</span><div><b>Expert Advisors (EAs)</b><span>Run automated strategies 24/5</span></div></li>
            <li><span className="mt5-tick">🌐</span><div><b>Web · Desktop · Mobile</b><span>Same account, every device</span></div></li>
          </ul>
          <div className="mt5-ctas">
            <a href="#register" className="btn btn-primary">Download MT5</a>
            <a href="#academy" className="btn btn-ghost">Learn MT5</a>
          </div>
        </div>
        <div className="mt5-devices">
          <img
            src="/assets/mt5-devices.jpg"
            alt="MetaTrader 5 on laptop, iPhone and Android with Windows, macOS, Linux, iOS, Android, Chrome, Safari, Edge, Firefox and Opera"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function MarketsAppDownload() {
  return (
    <section className="mkt-app">
      <div className="container mkt-app-grid">
        <div className="mkt-app-art">
          <img src="/assets/img-phone-trading.jpg" alt="Trader on the RakizFx mobile app" />
        </div>
        <div className="mkt-app-copy">
          <span className="eyebrow">Mobile app</span>
          <h2 className="sec-title">RakizFx Companion — your account on the go</h2>
          <p className="sec-sub">Track live prices, watchlists, balances and request deposits or withdrawals from your phone. Trading execution stays on MetaTrader 5 — secure, focused and fast.</p>
          <div className="app-badges">
            <a href="#" className="app-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 12.5a4 4 0 0 1 2-3.4 4.2 4.2 0 0 0-3.3-1.8c-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.7a4.4 4.4 0 0 0-3.7 2.3c-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2-1.1 2.8-2.2.6-.8 1-1.7 1.3-2.6a3.9 3.9 0 0 1-2.6-3.6zM14.3 5.4a3.7 3.7 0 0 0 .9-2.7 3.9 3.9 0 0 0-2.5 1.3 3.6 3.6 0 0 0-.9 2.6 3.2 3.2 0 0 0 2.5-1.2z"/></svg>
              <span><span className="l">Download on the</span><br/><span className="b">App Store</span></span>
            </a>
            <a href="#" className="app-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3.6 2.8l13 9.7-2.6 2.6L3.6 21.2zm14.4 8L21 12l-3 2-2.4-2.4zm-3.4 3.4L4.5 22.7l9-9 1.1 1.1zm-2.6-2.6l-9-9 9.5 6.6z"/></svg>
              <span><span className="l">Get it on</span><br/><span className="b">Google Play</span></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const MARKET_CLASSES = [
  {
    id: "forex",
    name: "Forex",
    tagline: "60+ currency pairs",
    pairs: "EUR/USD · GBP/USD · USD/JPY · AUD/USD",
    spread: "from 0.0 pips",
    icon: "M3 12h18M7 7l-4 5 4 5M17 7l4 5-4 5",
  },
  {
    id: "metals",
    name: "Metals",
    tagline: "Gold, silver, platinum",
    pairs: "XAU/USD · XAG/USD · XPT/USD",
    spread: "from 12 pips",
    icon: "M12 2L4 7v6c0 5 3.5 9 8 9s8-4 8-9V7l-8-5z",
  },
  {
    id: "indices",
    name: "Indices",
    tagline: "Major global indices",
    pairs: "US500 · NAS100 · UK100 · GER40",
    spread: "from 0.2 pips",
    icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
  },
  {
    id: "energies",
    name: "Energies",
    tagline: "Crude, brent, gas",
    pairs: "WTI · UKOIL · NGAS",
    spread: "from 0.018",
    icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  },
  {
    id: "crypto",
    name: "Crypto",
    tagline: "Bitcoin, Ethereum & more",
    pairs: "BTC/USD · ETH/USD · SOL/USD",
    spread: "from 18 pips",
    icon: "M11.5 2v3M11.5 19v3M5 6h11a3 3 0 0 1 0 6H5zM5 12h13a3 3 0 0 1 0 6H5z",
  },
  {
    id: "shares",
    name: "Shares",
    tagline: "100+ global stocks",
    pairs: "AAPL · MSFT · TSLA · NVDA",
    spread: "from 0.08 pips",
    icon: "M3 21h18M3 21V8l9-5 9 5v13M9 21V12h6v9",
  },
];

function MarketsPageNew() {
  const t = useT();
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = `#market-${id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      <section className="page-hd">
        <div className="container">
          <span className="eyebrow">Markets</span>
          <h1 className="page-h1">Trade every major market</h1>
          <p className="page-sub">1,200+ instruments across forex, metals, indices, energies, crypto and shares — from a single MetaTrader 5 account.</p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="markets-classes-grid">
            {MARKET_CLASSES.map((c) => (
              <a
                key={c.id}
                href={`#market-${c.id}`}
                className="markets-class-card"
                onClick={go(c.id)}
              >
                <span className="markets-class-ic">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={c.icon} />
                  </svg>
                </span>
                <div className="markets-class-body">
                  <h3>{c.name}</h3>
                  <p className="markets-class-tag">{c.tagline}</p>
                  <p className="markets-class-pairs mono">{c.pairs}</p>
                  <span className="markets-class-spread">Spreads {c.spread}</span>
                </div>
                <span className="markets-class-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M5 12h14" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <WhyTraders />
      <MarketsAccountTypes />
      <MarketsMT5Section />
    </>
  );
}

type MarketDetail = {
  name: string;
  oneLiner: string;
  // 2–3 paragraphs explaining what the asset class is
  what: string[];
  // 2–3 paragraphs explaining how trading it works on RakizFx (CFD mechanics)
  how: string[];
  // 4 reasons / benefit cards
  benefits: Array<{ t: string; p: string }>;
  // Trading conditions (left column key/value pairs)
  conditions: Array<[string, string]>;
  // Major instruments table rows
  instruments: Array<{ sym: string; name: string; spread: string; leverage: string; size: string }>;
  // Key terminology specific to the asset class
  terms: Array<{ t: string; d: string }>;
};

const MARKET_DETAILS: Record<string, MarketDetail> = {
  forex: {
    name: "Forex",
    oneLiner: "The largest, most liquid market on earth — trade the world's currencies 24 hours a day.",
    what: [
      "Forex — short for foreign exchange — is the global market where one currency is traded for another. Every currency is quoted in pairs (for example EUR/USD: Euros against US Dollars), and the price reflects how much of the second currency one unit of the first will buy. When you trade forex you are simultaneously buying one currency and selling another.",
      "The forex market is the largest financial market in the world, with daily turnover exceeding US$7 trillion. It runs across three overlapping sessions — Tokyo, London and New York — which together keep the market open continuously from Sunday evening through Friday evening. There is no central exchange: trades are matched electronically across a network of banks, brokers and liquidity providers (an over-the-counter or OTC market).",
      "Major pairs (EUR/USD, GBP/USD, USD/JPY, USD/CHF) make up around 70% of total volume and typically have the tightest spreads. Minor and exotic pairs (e.g. USD/SGD, USD/TRY) are also available but tend to be more volatile and carry wider spreads.",
    ],
    how: [
      "At RakizFx you trade forex as a contract for difference (CFD), meaning you take a position on the price movement without owning the underlying currency. You can go long (buy) if you expect the base currency to appreciate, or short (sell) if you expect it to fall — both with equal ease.",
      "Each forex trade is sized in lots: 1 standard lot equals 100,000 units of the base currency. Mini lots (10,000) and micro lots (1,000) are also supported, so position size always fits the account. Leverage of up to 1:500 on majors lets a small margin deposit control a much larger notional position.",
      "Profit and loss are calculated in pips — the fourth decimal place for most pairs, or the second for JPY pairs. A 1-pip move on a 1-lot EUR/USD position equals approximately $10 of P/L. Positions held overnight are subject to a swap (rollover financing) based on the interest-rate differential between the two currencies.",
    ],
    benefits: [
      { t: "Spreads from 0.0 pips",   p: "Raw institutional pricing from 25+ tier-1 liquidity providers. Pro and Elite accounts get the tightest." },
      { t: "1:500 leverage on majors", p: "Maximise capital efficiency. Lower tiers available on exotics to manage volatility risk." },
      { t: "60+ currency pairs",       p: "Trade every major, minor and a curated set of exotic pairs from a single MT5 account." },
      { t: "24/5 sessions",            p: "Tokyo open Sunday 22:00 GMT, New York close Friday 22:00 GMT — never miss a move." },
    ],
    conditions: [
      ["Asset class",      "Currency CFDs"],
      ["Pairs available",  "60+"],
      ["Min spread",       "0.0 pips (EUR/USD on Elite)"],
      ["Max leverage",     "1:500"],
      ["Min lot size",     "0.01 (micro lot)"],
      ["Commission",       "Zero on Standard"],
      ["Swap",             "Applied at 23:59 server time"],
      ["Hours",            "Sunday 22:00 GMT → Friday 22:00 GMT"],
    ],
    instruments: [
      { sym: "EUR/USD", name: "Euro / US Dollar",          spread: "0.0", leverage: "1:500", size: "100,000 EUR" },
      { sym: "GBP/USD", name: "Pound / US Dollar",         spread: "0.1", leverage: "1:500", size: "100,000 GBP" },
      { sym: "USD/JPY", name: "US Dollar / Yen",           spread: "0.1", leverage: "1:500", size: "100,000 USD" },
      { sym: "AUD/USD", name: "Aussie / US Dollar",        spread: "0.1", leverage: "1:500", size: "100,000 AUD" },
      { sym: "USD/CAD", name: "US Dollar / Canadian",      spread: "0.1", leverage: "1:500", size: "100,000 USD" },
      { sym: "USD/CHF", name: "US Dollar / Swiss Franc",   spread: "0.2", leverage: "1:500", size: "100,000 USD" },
      { sym: "NZD/USD", name: "Kiwi / US Dollar",          spread: "0.3", leverage: "1:400", size: "100,000 NZD" },
      { sym: "EUR/GBP", name: "Euro / Pound",              spread: "0.3", leverage: "1:500", size: "100,000 EUR" },
    ],
    terms: [
      { t: "Pip",      d: "Smallest standardised price move — 0.0001 for most pairs, 0.01 for JPY pairs." },
      { t: "Spread",   d: "Difference between bid (sell) and ask (buy) — your direct cost of entering the trade." },
      { t: "Leverage", d: "Borrowed exposure expressed as a ratio. 1:500 means $1 of margin controls $500 of notional." },
      { t: "Swap",     d: "Overnight interest charged or paid based on the rate differential between the two currencies." },
      { t: "Lot",      d: "Standard contract size: 1 lot = 100,000 base-currency units. Mini = 10,000, micro = 1,000." },
      { t: "Margin",   d: "Capital reserved to maintain an open position. Required margin = notional ÷ leverage." },
    ],
  },

  metals: {
    name: "Metals",
    oneLiner: "Trade gold, silver, platinum and palladium — the world's oldest safe-haven assets.",
    what: [
      "Precious metals are physical commodities valued for their scarcity, industrial uses and long history as stores of value. The four metals most actively traded as CFDs are gold (XAU), silver (XAG), platinum (XPT) and palladium (XPD), each quoted against the US dollar in dollars per troy ounce.",
      "Gold has the deepest market and is treated by traders as a hedge against inflation, currency debasement and geopolitical risk — its price tends to rise when real interest rates fall or when investors lose confidence in fiat currencies. Silver moves more dramatically (often 2–3× gold's volatility) and combines monetary and industrial demand.",
      "Platinum and palladium are predominantly industrial metals — used in catalytic converters, electronics and clean-tech manufacturing — so their prices are influenced more by global manufacturing cycles and supply disruptions (notably South African and Russian production) than by monetary policy.",
    ],
    how: [
      "Metals CFDs at RakizFx let you trade the spot price of each metal without taking physical delivery, storing bullion or paying assay/insurance costs. Open a long or short position with one click, settle in USD, and roll over indefinitely.",
      "1 standard lot of gold (XAU/USD) is 100 troy ounces — so a $1 move on a 1-lot position equals $100 of P/L. Silver lots are 5,000 troy ounces. Leverage of up to 1:200 lets a small deposit control a meaningful position; micro and mini lots are available on Pro and Elite for fine-grained sizing.",
      "Metals trade nearly 23 hours a day, 5 days a week, with a short daily break around the US futures close. Spreads tighten during London and New York overlap (12:00–17:00 GMT) when liquidity is deepest.",
    ],
    benefits: [
      { t: "Spot pricing",         p: "True spot quotes derived from London bullion fixings — no expiry to manage." },
      { t: "Tight gold spreads",   p: "From 12 pips on XAU/USD during peak liquidity — competitive with ETF alternatives." },
      { t: "Up to 1:200 leverage", p: "Efficient capital deployment on a volatile, news-driven asset class." },
      { t: "All 4 metals",         p: "Gold, silver, platinum and palladium from one MT5 account, no custody fees." },
    ],
    conditions: [
      ["Asset class",     "Spot metal CFDs"],
      ["Instruments",     "Gold, Silver, Platinum, Palladium"],
      ["Min spread",      "12 pips on XAU/USD (Elite)"],
      ["Max leverage",    "1:200 (gold), 1:100 (silver), 1:50 (platinum/palladium)"],
      ["Contract size",   "Gold: 100 oz · Silver: 5,000 oz"],
      ["Commission",      "Zero on Standard"],
      ["Swap",            "Applied daily — direction depends on long/short and storage costs"],
      ["Hours",           "Sunday 23:00 GMT → Friday 22:00 GMT (daily 22:00–23:00 GMT break)"],
    ],
    instruments: [
      { sym: "XAU/USD", name: "Gold spot",     spread: "12",  leverage: "1:200", size: "100 oz" },
      { sym: "XAG/USD", name: "Silver spot",   spread: "1.2", leverage: "1:100", size: "5,000 oz" },
      { sym: "XPT/USD", name: "Platinum spot", spread: "35",  leverage: "1:50",  size: "50 oz" },
      { sym: "XPD/USD", name: "Palladium",     spread: "70",  leverage: "1:50",  size: "50 oz" },
    ],
    terms: [
      { t: "Troy ounce", d: "Standard precious-metals weight unit (~31.1g). All metal CFDs are priced per troy oz." },
      { t: "Spot price", d: "Current market price for immediate delivery, as opposed to a future-dated contract." },
      { t: "Bid/Ask",    d: "Buy and sell quotes — the spread between them is your cost of entry." },
      { t: "Storage",    d: "Annualised cost reflected in the swap rate when holding long positions overnight." },
      { t: "Fix",        d: "Twice-daily London price benchmark (10:30 / 15:00 GMT for gold) widely used by institutions." },
    ],
  },

  indices: {
    name: "Indices",
    oneLiner: "Trade entire economies in a single ticker — long or short, with leverage.",
    what: [
      "A stock index measures the performance of a basket of shares — typically the largest or most representative companies in a market. The S&P 500 (US500), for example, tracks the 500 largest US-listed companies; the Nasdaq 100 (NAS100) tracks the 100 largest non-financial Nasdaq stocks. The level of the index is a weighted average of its constituents.",
      "Index CFDs let you take a view on the overall direction of a market — bullish or bearish — without buying every individual stock. They're widely used to hedge equity portfolios, speculate on macro releases (CPI, payrolls, FOMC) or capture cyclical rotations between regions and sectors.",
      "RakizFx offers cash CFDs on the major global indices: US500, NAS100, US30, GER40 (DAX), UK100 (FTSE), JP225 (Nikkei), IN50 (Nifty) and HK50 (Hang Seng) — covering North America, Europe, Asia and India from one account.",
    ],
    how: [
      "Each index CFD price tracks the underlying index in real-time, with no expiry — you can hold positions indefinitely. Long if you expect the index to rise, short if you expect it to fall. Going short on an index CFD doesn't require borrowing the underlying stocks — a key advantage over cash equity short-selling.",
      "Contract sizes vary by index: 1 lot of US500 is 50 index points (so a $1 move = $50 P/L), while 1 lot of NAS100 is 20 points. Leverage of up to 1:200 lets you scale exposure efficiently. Most indices trade 23 hours a day, 5 days a week, with a short daily break for futures rollover.",
      "When the underlying index components pay dividends, a cash adjustment is credited (to longs) or debited (from shorts) on the ex-dividend day — so your P/L is unaffected by the dividend itself.",
    ],
    benefits: [
      { t: "Tight spreads",          p: "From 0.2 points on US500 during peak liquidity — competitive with ETF alternatives." },
      { t: "Long or short instantly", p: "No short-borrow restrictions or locate fees. One click to hedge or speculate." },
      { t: "Leverage up to 1:200",    p: "Efficient exposure to broad markets without tying up equity capital." },
      { t: "Dividend adjustments",   p: "Handled automatically and transparently on ex-dividend day." },
    ],
    conditions: [
      ["Asset class",   "Cash index CFDs"],
      ["Indices",       "US500, NAS100, US30, UK100, GER40, JP225, IN50, HK50"],
      ["Min spread",    "0.2 points (US500 on Elite)"],
      ["Max leverage",  "1:200 on majors, 1:100 on emerging"],
      ["Contract size", "US500: 50/lot · NAS100: 20/lot · varies by index"],
      ["Commission",    "Zero"],
      ["Hours",         "Approximately 23 hours/day, 5 days/week — varies by index"],
      ["Expiry",        "None — cash CFDs roll continuously"],
    ],
    instruments: [
      { sym: "US500",  name: "S&P 500",          spread: "0.2", leverage: "1:200", size: "50/pt" },
      { sym: "NAS100", name: "US Tech 100",      spread: "0.4", leverage: "1:200", size: "20/pt" },
      { sym: "US30",   name: "Wall Street 30",   spread: "0.6", leverage: "1:200", size: "5/pt" },
      { sym: "GER40",  name: "Germany 40 (DAX)", spread: "0.4", leverage: "1:200", size: "25/pt" },
      { sym: "UK100",  name: "FTSE 100",         spread: "0.4", leverage: "1:200", size: "10/pt" },
      { sym: "JP225",  name: "Japan 225",        spread: "3.0", leverage: "1:200", size: "500/pt" },
      { sym: "IN50",   name: "India 50 (Nifty)", spread: "1.5", leverage: "1:100", size: "20/pt" },
      { sym: "HK50",   name: "Hang Seng",        spread: "3.0", leverage: "1:100", size: "10/pt" },
    ],
    terms: [
      { t: "Index point",  d: "The basic unit by which an index moves. The value of one point depends on the index's contract size." },
      { t: "Cash CFD",     d: "Rolling contract that tracks the spot index value — no expiry, no contract roll." },
      { t: "Weighting",    d: "How each constituent contributes to the index. S&P 500 is market-cap weighted; Dow is price-weighted." },
      { t: "Ex-dividend",  d: "Day when a constituent stock pays a dividend; the index opens lower by the weighted amount." },
      { t: "Futures roll", d: "Brief daily window when underlying index futures roll between contract months." },
    ],
  },

  energies: {
    name: "Energies",
    oneLiner: "Trade crude oil and natural gas — the commodities that power the global economy.",
    what: [
      "Energy CFDs cover the most actively traded fossil-fuel commodities: WTI crude (US light sweet), Brent crude (the North Sea benchmark) and natural gas (NGAS, the Henry Hub US benchmark). Crude oil is priced in US dollars per barrel; natural gas in US dollars per MMBtu (million British thermal units).",
      "Oil prices are driven by a mix of supply factors (OPEC+ output decisions, US shale production, geopolitical disruptions) and demand factors (global GDP, refinery margins, seasonal driving and heating demand). The spread between WTI and Brent — the 'Brent–WTI differential' — reflects regional supply and shipping economics.",
      "Natural gas is more seasonal and weather-driven than oil: winter heating demand in the northern hemisphere and summer cooling demand both move price meaningfully. US storage inventories (published weekly by the EIA) are a closely-watched fundamental.",
    ],
    how: [
      "Energy CFDs at RakizFx are cash-settled and rolling — you never take physical delivery or have to manage contract expiry. We roll positions seamlessly into the next active futures month, with the price adjustment reflected transparently in the swap.",
      "Spreads are quoted in dollars per barrel (oil) or dollars per MMBtu (gas). 1 lot of WTI or Brent is 1,000 barrels — so a $0.01 move on a 1-lot position equals $10 P/L. Natural gas lots are 10,000 MMBtu. Leverage up to 1:100 on energy contracts lets you scale exposure efficiently.",
      "Markets are open nearly 23 hours a day, 5 days a week, with the deepest liquidity during the US session (12:00–21:00 GMT) — when Cushing inventory data, EIA reports and refinery news typically hit.",
    ],
    benefits: [
      { t: "Both crude benchmarks", p: "WTI and Brent in one place — trade the differential or pick the cleaner technical setup." },
      { t: "Tight spreads",         p: "From $0.018 on WTI — competitive with energy ETFs and without expiry friction." },
      { t: "No contract rolls",     p: "Cash-settled CFDs handle futures rollover automatically — no manual contract switching." },
      { t: "1:100 leverage",        p: "Efficient deployment on a high-volatility, news-driven asset class." },
    ],
    conditions: [
      ["Asset class",   "Energy CFDs (cash-settled)"],
      ["Instruments",   "WTI crude, Brent crude, Natural gas"],
      ["Min spread",    "$0.018 on WTI (Elite)"],
      ["Max leverage",  "1:100 (oil), 1:50 (gas)"],
      ["Contract size", "Oil: 1,000 barrels · Gas: 10,000 MMBtu"],
      ["Commission",    "Zero"],
      ["Swap",          "Reflects underlying futures contango/backwardation"],
      ["Hours",         "Sunday 23:00 GMT → Friday 22:00 GMT (daily 22:00–23:00 GMT break)"],
    ],
    instruments: [
      { sym: "USOIL", name: "WTI Crude Oil",   spread: "0.018", leverage: "1:100", size: "1,000 bbl" },
      { sym: "UKOIL", name: "Brent Crude Oil", spread: "0.018", leverage: "1:100", size: "1,000 bbl" },
      { sym: "NGAS",  name: "Natural Gas",     spread: "0.005", leverage: "1:50",  size: "10,000 MMBtu" },
    ],
    terms: [
      { t: "Barrel",       d: "Standard oil-pricing unit: 42 US gallons. All oil CFDs are quoted in USD per barrel." },
      { t: "Contango",     d: "Forward-month futures trading above spot — typical in oversupplied markets." },
      { t: "Backwardation", d: "Forward months trading below spot — bullish signal, common in tight markets." },
      { t: "EIA report",   d: "Weekly US crude/gas inventory data — released Wednesdays 14:30 GMT, often moves price sharply." },
      { t: "OPEC+",        d: "Cartel + Russia/allies that coordinates oil-output decisions, meeting roughly monthly." },
    ],
  },

  crypto: {
    name: "Crypto",
    oneLiner: "Trade Bitcoin, Ethereum and major altcoins — 24/7, long or short, no custody hassle.",
    what: [
      "Cryptocurrencies are digital assets recorded on decentralised blockchains. Bitcoin (BTC), launched in 2009, is the original and most valuable; Ethereum (ETH) is the most actively used platform for smart contracts; Solana (SOL), Ripple (XRP), Cardano (ADA) and others form a long tail of altcoins with varying use-cases and risk profiles.",
      "Crypto markets trade 24 hours a day, 7 days a week, with no central exchange — prices on RakizFx are aggregated from major spot venues (Binance, Coinbase, Kraken) to give a representative composite. Volatility is high: daily moves of 5–10% in BTC are not uncommon, and altcoins can swing two or three times that.",
      "Crypto CFDs let you take a view on the price without buying, custodying or transferring the underlying coin. There's no wallet to secure, no hot-wallet hack risk, no on-chain transaction fees — you simply open a long or short position in your MT5 account.",
    ],
    how: [
      "RakizFx quotes major crypto pairs against the US dollar: BTC/USD, ETH/USD, SOL/USD, XRP/USD and a curated set of altcoins. Lot sizes are designed for fractional exposure — 1 lot of BTC/USD is 1 BTC, with micro lots down to 0.01 BTC. Leverage of up to 1:20 on crypto is below most asset classes because of the higher volatility.",
      "You can go long (buy) or short (sell) with equal ease — short-selling crypto without owning it would otherwise require a borrowing arrangement on a spot exchange. Positions held overnight are subject to a swap reflecting funding rates from perpetual-futures markets.",
      "Crypto trades 24/7, including weekends — useful when major US/EU-asset markets are closed and crypto often becomes the only liquid expression of risk sentiment.",
    ],
    benefits: [
      { t: "24/7 markets",        p: "Trade weekends and holidays — when other asset classes are shut." },
      { t: "Long or short",       p: "No custody, no borrow arrangement, no wallet security — just price exposure." },
      { t: "Major coins covered", p: "BTC, ETH, SOL, XRP and a curated set of altcoins from one MT5 account." },
      { t: "1:20 leverage",       p: "Calibrated to crypto volatility — higher tiers available on lower-volatility coins." },
    ],
    conditions: [
      ["Asset class",   "Crypto CFDs"],
      ["Pairs",         "BTC/USD, ETH/USD, SOL/USD, XRP/USD and select altcoins"],
      ["Min spread",    "18 pips on BTC/USD (Elite)"],
      ["Max leverage",  "1:20 on BTC and ETH, 1:10 on altcoins"],
      ["Contract size", "1 BTC, 1 ETH, etc. — micro lots from 0.01"],
      ["Commission",    "Zero"],
      ["Swap",          "Reflects perpetual-futures funding rates"],
      ["Hours",         "24 hours a day, 7 days a week"],
    ],
    instruments: [
      { sym: "BTC/USD", name: "Bitcoin",  spread: "18",     leverage: "1:20", size: "1 BTC" },
      { sym: "ETH/USD", name: "Ethereum", spread: "2.0",    leverage: "1:20", size: "1 ETH" },
      { sym: "SOL/USD", name: "Solana",   spread: "0.18",   leverage: "1:10", size: "1 SOL" },
      { sym: "XRP/USD", name: "Ripple",   spread: "0.0004", leverage: "1:10", size: "1 XRP" },
    ],
    terms: [
      { t: "Blockchain", d: "Distributed ledger that records all transactions of a cryptocurrency, secured by cryptography." },
      { t: "Volatility", d: "Crypto moves typically 3–5× the magnitude of major FX — sizing should adjust accordingly." },
      { t: "Halving",    d: "Pre-programmed event that cuts Bitcoin's block reward in half every ~4 years, reducing new supply." },
      { t: "Funding rate", d: "Hourly payment between long and short perpetual-futures holders — reflected in our swap." },
      { t: "Altcoin",    d: "Any cryptocurrency other than Bitcoin. Major altcoins include ETH, SOL, XRP, ADA." },
    ],
  },

  shares: {
    name: "Shares",
    oneLiner: "Trade global stocks as CFDs — long or short, with leverage, dividends handled.",
    what: [
      "A share (or stock) represents a fractional ownership stake in a publicly-listed company. When you trade a share CFD with RakizFx, you take a position on the stock's price movement without buying the underlying share — no broker account, no dividend tax forms, no share-registry friction.",
      "RakizFx covers 100+ of the most actively-traded shares from the US, Europe and Asia, including the FAANG / Magnificent-7 names (AAPL, MSFT, NVDA, GOOG, AMZN, META, TSLA) plus a broad range of large-cap names across financials, healthcare, energy and consumer.",
      "Share prices move on company-specific news (earnings, product launches, M&A, management changes) and on broader market or sector dynamics. They typically trade only during the underlying exchange's hours — for US shares that's 13:30–20:00 GMT during US daylight time.",
    ],
    how: [
      "Share CFDs at RakizFx are priced from the underlying exchange in real-time. You can go long (buy) if you expect the price to rise, or short (sell) if you expect it to fall — without the share-borrowing arrangements normally required for shorting.",
      "1 lot equals 100 shares — so a $1 move on a 1-lot position equals $100 of P/L. Fractional lots down to 1 share are available. Leverage up to 1:20 on shares balances exposure with risk on a volatile asset class.",
      "Dividends are handled transparently: on ex-dividend day, long positions are credited the net dividend amount and short positions are debited the gross amount. The share price usually opens lower by the dividend amount, so the net P/L position is approximately neutral.",
    ],
    benefits: [
      { t: "100+ global stocks", p: "US, EU and Asian names — including all FAANG and the Magnificent-7." },
      { t: "Long or short",      p: "Take either side without share-borrow arrangements or locate fees." },
      { t: "Leverage up to 1:20", p: "Efficient deployment for high-conviction setups — calibrated to share volatility." },
      { t: "Dividend adjustments", p: "Handled automatically on ex-dividend day — your P/L is unaffected by the payout." },
    ],
    conditions: [
      ["Asset class",   "Share CFDs"],
      ["Coverage",      "100+ US, EU and Asian large-cap stocks"],
      ["Min spread",    "From 0.08 on AAPL (Elite)"],
      ["Max leverage",  "1:20 on majors, 1:10 on small caps"],
      ["Contract size", "1 lot = 100 shares · fractional lots from 1 share"],
      ["Commission",    "Zero — cost is in the spread"],
      ["Hours",         "Tracks each exchange — typically 09:30–16:00 local time"],
      ["Dividends",     "Credited (long) / debited (short) on ex-date"],
    ],
    instruments: [
      { sym: "AAPL", name: "Apple Inc.",       spread: "0.08", leverage: "1:20", size: "100 shares" },
      { sym: "MSFT", name: "Microsoft",        spread: "0.10", leverage: "1:20", size: "100 shares" },
      { sym: "NVDA", name: "NVIDIA",           spread: "0.12", leverage: "1:20", size: "100 shares" },
      { sym: "TSLA", name: "Tesla",            spread: "0.14", leverage: "1:20", size: "100 shares" },
      { sym: "META", name: "Meta Platforms",   spread: "0.14", leverage: "1:20", size: "100 shares" },
      { sym: "GOOG", name: "Alphabet",         spread: "0.10", leverage: "1:20", size: "100 shares" },
      { sym: "AMZN", name: "Amazon",           spread: "0.10", leverage: "1:20", size: "100 shares" },
      { sym: "NFLX", name: "Netflix",          spread: "0.18", leverage: "1:20", size: "100 shares" },
    ],
    terms: [
      { t: "Ex-dividend day", d: "First trading day on which buyers no longer qualify for the upcoming dividend." },
      { t: "Earnings",        d: "Quarterly results report — historically the largest single-day price-move catalyst per stock." },
      { t: "Market cap",      d: "Total value of a company's listed shares — share price × shares outstanding." },
      { t: "Float",           d: "Number of shares freely tradable in the market — excludes insider/restricted holdings." },
      { t: "Beta",            d: "Volatility of a stock relative to its parent index — beta = 1 moves in line with the market." },
    ],
  },
};

function AssetClassDetail({ kind }: { kind: string }) {
  const t = useT();
  const data = MARKET_DETAILS[kind] || MARKET_DETAILS.forex;
  const goMarkets = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = "#markets";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const lower = data.name.toLowerCase();

  return (
    <>
      <section className="page-hd asset-detail-hd">
        <div className="container">
          <a href="#markets" className="asset-detail-back" onClick={goMarkets}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M19 12H5" />
              <path d="m12 5-7 7 7 7" />
            </svg>
            All markets
          </a>
          <span className="eyebrow">Markets · {data.name}</span>
          <h1 className="page-h1">What is {lower}?</h1>
        </div>
      </section>

      {/* 1. What is [asset] — two paragraphs */}
      <section className="asset-explain">
        <div className="container asset-explain-simple">
          <p>{data.what[0]}</p>
          <p>{data.what[1]}</p>
        </div>
      </section>

      {/* 2. Major pairs / instruments */}
      <section className="asset-pairs">
        <div className="container">
          <div className="asset-pairs-head">
            <span className="eyebrow">Instruments</span>
            <h2 className="sec-title">Major {lower} {kind === "shares" || kind === "indices" ? "instruments" : "pairs"}</h2>
          </div>
          <ul className="asset-pairs-grid">
            {data.instruments.map((r) => (
              <li key={r.sym} className="asset-pair-chip">
                <span className="mono asset-pair-sym">{r.sym}</span>
                <span className="asset-pair-name">{r.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. RakizFx specialty */}
      <section className="asset-specialities">
        <div className="container">
          <div className="asset-specialities-head">
            <span className="eyebrow">Why RakizFx</span>
            <h2 className="sec-title">RakizFx specialities for {lower}</h2>
          </div>
          <div className="asset-specialities-grid">
            {data.benefits.map((b, i) => (
              <div key={i} className="asset-speciality-card">
                <span className="asset-speciality-tick">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h3>{b.t}</h3>
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Open Account */}
      <section className="asset-cta-section">
        <div className="container asset-cta-block">
          <h2>Ready to trade {lower}?</h2>
          <p>Open a live RakizFx account in 2 minutes — from $50.</p>
          <div className="asset-cta-row">
            <a href="#register" className="btn btn-primary btn-lg">
              {t("cta.open_account")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// Promotion page
function PromotionPage() {
  return (
    <>
      <section className="page-hd">
        <div className="container">
          <span className="eyebrow">Promotion</span>
          <h1 className="page-h1">Welcome Bonus</h1>
          <p className="page-sub">A one-time first-deposit boost for new RakizFx clients — extra trading capital, real conditions, no gimmicks.</p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="welcome-bonus-shell">
            <div className="welcome-bonus-card">
              <span className="welcome-bonus-pill">★ Limited offer</span>
              <h2 className="welcome-bonus-h2">30% deposit match — up to $300</h2>
              <p className="welcome-bonus-p">
                Open and fund your first RakizFx live account and we&rsquo;ll boost your
                initial deposit by 30% with bonus trading credit — up to a maximum of $300.
                Credit lands instantly and converts to withdrawable balance as you trade.
              </p>

              <div className="welcome-bonus-stats">
                <div>
                  <span className="welcome-bonus-n">30%</span>
                  <span className="welcome-bonus-l">First-deposit match</span>
                </div>
                <div>
                  <span className="welcome-bonus-n">$300</span>
                  <span className="welcome-bonus-l">Max bonus credit</span>
                </div>
                <div>
                  <span className="welcome-bonus-n">$50</span>
                  <span className="welcome-bonus-l">Minimum deposit</span>
                </div>
              </div>

              <div className="welcome-bonus-actions">
                <a href="#register" className="btn btn-primary btn-lg">
                  Open account &amp; claim
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                </a>
                <a href="#help" className="btn btn-ghost btn-lg">View Full Terms</a>
              </div>
            </div>

            <ul className="welcome-bonus-steps">
              <li>
                <span className="welcome-bonus-num">1</span>
                <div>
                  <b>Open a live account</b>
                  <span>Standard, Pro or Elite — all tiers eligible</span>
                </div>
              </li>
              <li>
                <span className="welcome-bonus-num">2</span>
                <div>
                  <b>Make your first deposit</b>
                  <span>From $50, via card, bank wire or crypto</span>
                </div>
              </li>
              <li>
                <span className="welcome-bonus-num">3</span>
                <div>
                  <b>Bonus credit lands instantly</b>
                  <span>30% match up to $300, ready to trade</span>
                </div>
              </li>
              <li>
                <span className="welcome-bonus-num">4</span>
                <div>
                  <b>Trade to unlock</b>
                  <span>Bonus converts to withdrawable balance pro-rata as you trade</span>
                </div>
              </li>
            </ul>
          </div>

          <p className="welcome-bonus-risk">
            Bonus credit is awarded on first-deposit only and is subject to volume
            requirements. Trading CFDs carries risk and may not be suitable for
            all investors. Full terms apply.
          </p>
        </div>
      </section>
    </>
  );
}

// Affiliate page
function AffiliatePage() {
  const benefits = [
    { t: "Competitive commission structure",  p: "Industry-leading CPA and revenue share payouts on every funded referral.", i: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
    { t: "Fast & secure payments",            p: "Daily settlements to bank, card or crypto wallet.", i: <><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></> },
    { t: "Dedicated affiliate support",       p: "A relationship manager assigned from day one.", i: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></> },
    { t: "Real-time tracking dashboard",      p: "Live conversions, click-through and lifetime value per channel.", i: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></> },
    { t: "Global reach",                      p: "Convert audiences in 60+ countries — promote across markets.", i: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20"/></> },
    { t: "Premium creative kit",              p: "Co-branded banners, landing pages and pre-built funnels.", i: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
  ];
  return (
    <>
      <section className="page-hd">
        <div className="container">
          <span className="eyebrow">Affiliate program</span>
          <h1 className="page-h1">Earn for every trader you bring</h1>
          <p className="page-sub">Performance-based payouts, real-time tracking and the marketing kit to convert. Choose CPA or revenue share — switch anytime.</p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="affiliate-grid">
            <div className="card affiliate-card">
              <h3>CPA — pay per acquisition</h3>
              <p>One-time payout per funded trader, up to <b>$1,200</b> per qualified referral. Tiered by trader deposit size.</p>
              <ul>
                <li>$300 per $500-funded account</li>
                <li>$600 per $2,000-funded account</li>
                <li>$1,200 per $10,000+-funded account</li>
              </ul>
            </div>
            <div className="card affiliate-card">
              <h3>Revenue share</h3>
              <p>Earn up to <b>50% of net revenue</b> from your referred traders for as long as they trade with RakizFx.</p>
              <ul>
                <li>20% baseline</li>
                <li>35% from 25 active referrals</li>
                <li>50% from 100+ active referrals</li>
              </ul>
            </div>
            <div className="card affiliate-card">
              <h3>Hybrid</h3>
              <p>Get a CPA on first funding plus a reduced revenue share for the lifetime of the trader.</p>
              <ul>
                <li>50% of CPA upfront</li>
                <li>15% lifetime revenue share</li>
                <li>Best for newsletters &amp; communities</li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a href="#register" className="btn btn-primary btn-lg">Apply to the Affiliate Program</a>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="sec-title">Why partner with RakizFx</h2>
          </div>
          <div className="partner-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="partner-benefit" style={{ "--why-delay": `${i * 0.08}s` }}>
                <span className="partner-benefit-ic">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{b.i}</svg>
                </span>
                <div>
                  <h4>{b.t}</h4>
                  <p>{b.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-cta">
        <div className="partner-cta-bg" aria-hidden="true">
          <div className="partner-cta-orb partner-cta-orb-1" />
          <div className="partner-cta-orb partner-cta-orb-2" />
        </div>
        <div className="container partner-cta-grid">
          <div>
            <span className="hero-slogan" style={{ marginBottom: 18 }}>
              <span className="hero-slogan-mark">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
              </span>
              <span className="hero-slogan-text">Premium Affiliate</span>
            </span>
            <h2>Scale your audience into recurring revenue</h2>
            <p>Build long-term affiliate income with advanced tracking, premium support and competitive payout structures tailored to your channel.</p>
            <div className="partner-cta-actions">
              <a href="#contact" className="btn btn-primary btn-lg">
                Schedule a consultation
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
              </a>
              <a href="#register" className="btn btn-ghost-light btn-lg">Apply Directly</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Careers page
function CareersPage() {
  const jobs = [
    { t: "Senior Trading Systems Engineer", dep: "Engineering",  loc: "Mumbai · Hybrid" },
    { t: "Quant Developer (C++ / Python)",  dep: "Engineering",  loc: "Bangalore · On-site" },
    { t: "Compliance Officer (CFD)",        dep: "Compliance",   loc: "Dubai · On-site" },
    { t: "Customer Success Manager",        dep: "Operations",   loc: "Mumbai · Hybrid" },
    { t: "Product Designer",                dep: "Product",      loc: "Remote (IST hours)" },
    { t: "Performance Marketing Lead",      dep: "Marketing",    loc: "Mumbai · Hybrid" },
  ];
  return (
    <>
      <section className="page-hd">
        <div className="container">
          <span className="eyebrow">Careers</span>
          <h1 className="page-h1">Build the future of trading with us</h1>
          <p className="page-sub">We're hiring across engineering, compliance, product, design and operations. Remote and hybrid roles available.</p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="careers-list">
            {jobs.map((j, i) => (
              <div key={i} className="career-row">
                <div>
                  <h3>{j.t}</h3>
                  <span>{j.dep} · {j.loc}</span>
                </div>
                <a href="mailto:careers@rakizfx.com" className="btn btn-ghost">Apply →</a>
              </div>
            ))}
          </div>
          <div className="careers-foot card">
            <h3>Don't see your role?</h3>
            <p>We'd still love to hear from you. Send your CV and a short note about what you'd like to work on to <a href="mailto:careers@rakizfx.com">careers@rakizfx.com</a>.</p>
          </div>
        </div>
      </section>
    </>
  );
}

// Help center page
function HelpCenterPage() {
  const sections = [
    { h: "Getting started", links: ["Open a live account", "Verify your identity (KYC)", "Choose the right account type", "Switch from another broker"] },
    { h: "Funding",          links: ["Bank wire instructions", "Card deposits & withdrawal limits", "Crypto deposits", "Why was my deposit delayed?"] },
    { h: "Trading",          links: ["Place your first trade", "Order types explained", "Margin, leverage and stop-out", "What is swap / rollover?"] },
    { h: "Platforms",        links: ["Install MetaTrader 5", "Connect MT5 to your account", "Mobile app — get started", "VPS hosting for EAs"] },
    { h: "Account",          links: ["Change your password", "Enable 2FA", "Update bank details", "Close my account"] },
    { h: "Bonuses",          links: ["Claim the welcome bonus", "Bonus volume requirements", "Referral program rules", "Cashback eligibility"] },
  ];
  return (
    <>
      <section className="page-hd">
        <div className="container">
          <span className="eyebrow">Help center</span>
          <h1 className="page-h1">Get the answers you need, fast</h1>
          <p className="page-sub">Browse by topic or open live chat — average reply time under 90 seconds.</p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="help-grid">
            {sections.map((s, i) => (
              <div key={i} className="card help-card">
                <h3>{s.h}</h3>
                <ul>
                  {s.links.map((l, j) => <li key={j}><a href="#contact">{l} →</a></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


// ─── from pages.jsx ───────────────────────────────────────────────────
// RakizFx — Broker information pages (real terminology, no AI filler)


// ─────────────────────────────────────────────────────────────
// PAGE HEADER (common)
// ─────────────────────────────────────────────────────────────
function PageHeader({ eyebrow, title, sub }) {
  return (
    <section className="page-hd">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="page-h1">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// TRADING CONDITIONS
// ─────────────────────────────────────────────────────────────
function TradingConditionsPage() {
  const fx = [
    ["EURUSD", "Euro vs US Dollar",     "0.6", "0.2", "0.0", "1:500", "100,000 EUR"],
    ["GBPUSD", "Pound vs US Dollar",    "0.8", "0.4", "0.1", "1:500", "100,000 GBP"],
    ["USDJPY", "US Dollar vs Yen",      "0.7", "0.3", "0.1", "1:500", "100,000 USD"],
    ["AUDUSD", "Aussie vs US Dollar",   "0.8", "0.4", "0.1", "1:500", "100,000 AUD"],
    ["USDCAD", "US Dollar vs Canadian", "0.9", "0.5", "0.2", "1:500", "100,000 USD"],
    ["USDCHF", "US Dollar vs Franc",    "0.9", "0.4", "0.2", "1:500", "100,000 USD"],
    ["NZDUSD", "Kiwi vs US Dollar",     "1.0", "0.6", "0.3", "1:400", "100,000 NZD"],
    ["EURGBP", "Euro vs Pound",         "1.0", "0.6", "0.3", "1:500", "100,000 EUR"],
    ["EURJPY", "Euro vs Yen",           "1.1", "0.6", "0.3", "1:500", "100,000 EUR"],
    ["USDINR", "US Dollar vs Rupee",    "5.0", "3.0", "2.0", "1:50",  "1,000 USD"],
  ];
  const metals = [
    ["XAUUSD", "Gold spot",     "25",  "16", "12", "1:200", "100 oz"],
    ["XAGUSD", "Silver spot",   "2.5", "1.8","1.2","1:100", "5,000 oz"],
    ["XPTUSD", "Platinum spot", "60",  "45", "35", "1:50",  "50 oz"],
  ];
  const indices = [
    ["US30",   "Wall Street 30",     "1.6", "1.0", "0.6", "1:200"],
    ["US500",  "S&P 500",            "0.5", "0.3", "0.2", "1:200"],
    ["NAS100", "US Tech 100",        "1.0", "0.6", "0.4", "1:200"],
    ["GER40",  "Germany 40 (DAX)",   "1.0", "0.6", "0.4", "1:200"],
    ["UK100",  "FTSE 100",           "1.0", "0.6", "0.4", "1:200"],
    ["JP225",  "Japan 225 (Nikkei)", "7",   "5",   "3",   "1:200"],
    ["IN50",   "India 50 (Nifty)",   "3",   "2",   "1.5", "1:100"],
  ];
  const energies = [
    ["USOIL", "WTI Crude Oil",  "0.04", "0.025", "0.018", "1:100"],
    ["UKOIL", "Brent Crude Oil","0.04", "0.025", "0.018", "1:100"],
    ["NGAS",  "Natural Gas",    "0.012","0.008", "0.005", "1:50"],
  ];
  const crypto = [
    ["BTCUSD", "Bitcoin",  "30",  "22",  "18",  "1:20"],
    ["ETHUSD", "Ethereum", "3.5", "2.6", "2.0", "1:20"],
    ["SOLUSD", "Solana",   "0.30","0.22","0.18","1:10"],
    ["XRPUSD", "Ripple",   "0.0008","0.0006","0.0004","1:10"],
  ];

  const [tab, setTab] = useState("forex");

  return (
    <>
      <PageHeader
        eyebrow="Trading conditions"
        title="Transparent pricing on every market."
        sub="Live indicative spreads, leverage and contract specifications across all asset classes. Spreads shown are typical during London/NY overlap and may widen during news, low-liquidity hours or rollover."
      />
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="spec-tabs">
            {[
              ["forex","Forex"],["metals","Metals"],["indices","Indices"],
              ["energies","Energies"],["crypto","Crypto"],
            ].map(([k,l]) => (
              <button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>
            ))}
          </div>

          <div className="spec-table-wrap">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Instrument</th>
                  <th>Standard<br/><small>typical pips</small></th>
                  <th>Pro<br/><small>typical pips</small></th>
                  <th>Elite<br/><small>typical pips</small></th>
                  <th>Max leverage</th>
                  {tab !== "indices" && tab !== "energies" && tab !== "crypto" && <th>Contract size</th>}
                </tr>
              </thead>
              <tbody>
                {(tab==="forex"?fx:tab==="metals"?metals:tab==="indices"?indices:tab==="energies"?energies:crypto)
                  .map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => <td key={j}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--fg-mute)", marginTop: 18, lineHeight: 1.6 }}>
            Spreads are floating, market-driven and quoted in pips. Pro and Elite accounts may incur a per-lot commission on certain ECN instruments. Margin requirements vary by instrument and may change in line with regulatory or volatility-based requirements. View full contract specifications in MetaTrader 5 → Market Watch → Symbol properties.
          </p>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <h2 className="sec-title">Execution policy</h2>
          <div className="cond-grid">
            <div className="card">
              <h3>Market execution</h3>
              <p>All orders are filled at the best available market price with no dealing-desk intervention. No requotes. Negative slippage is symmetrical with positive slippage.</p>
            </div>
            <div className="card">
              <h3>Average fill speed</h3>
              <p>28 ms median, measured from order receipt to liquidity-provider confirmation across Equinix LD4, NY4 and TY3 data centres. 99.99% platform uptime SLA.</p>
            </div>
            <div className="card">
              <h3>Order types supported</h3>
              <p>Market, limit, stop, stop-limit, trailing stop, OCO. Take-profit and stop-loss can be set on entry or modified at any time post-fill.</p>
            </div>
            <div className="card">
              <h3>Negative balance protection</h3>
              <p>Retail client accounts are protected against negative equity. In a gap event, your balance is automatically reset to zero — you can never owe more than you deposit.</p>
            </div>
            <div className="card">
              <h3>Margin call & stop-out</h3>
              <p>Margin call at 100% margin level. Stop-out begins at 50% — open positions are closed largest-loss-first to bring margin level back above stop-out.</p>
            </div>
            <div className="card">
              <h3>Swap & rollover</h3>
              <p>Swap rates are applied at 23:59 server time (EET) and triple-swap on Wednesday rollover. Swap-free (Islamic) option available on all account types — request from your Client Area.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// DEPOSIT & WITHDRAWAL
// ─────────────────────────────────────────────────────────────
function FundingPage() {
  const methods = [
    { name: "UPI",          dep: "Instant",    wd: "Up to 2 hrs",      fee: "Free", min: "₹500",   icon: "₹" },
    { name: "IMPS / NEFT",  dep: "Instant",    wd: "Up to 24 hrs",     fee: "Free", min: "₹1,000", icon: "🏦" },
    { name: "Bank wire",    dep: "1–3 days",   wd: "1–3 business days",fee: "Free*", min: "$200",  icon: "🌐" },
    { name: "Visa / Master",dep: "Instant",    wd: "1–3 business days",fee: "Free", min: "$50",    icon: "💳" },
    { name: "Crypto (USDT)",dep: "1 confirm",  wd: "Up to 1 hr",       fee: "Network only", min: "$50", icon: "₮" },
    { name: "Skrill / Neteller", dep: "Instant", wd: "Up to 24 hrs",   fee: "Free", min: "$50",    icon: "💼" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Deposits & withdrawals"
        title="Move money in minutes, not days."
        sub="RakizFx covers all deposit fees. Withdrawals are processed back to the original funding source under our anti-money-laundering policy. Same-name accounts only — no third-party transfers accepted."
      />
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="fund-grid">
            {methods.map(m => (
              <div key={m.name} className="card fund-card">
                <div className="fund-icon">{m.icon}</div>
                <h3>{m.name}</h3>
                <dl>
                  <dt>Deposit time</dt><dd>{m.dep}</dd>
                  <dt>Withdrawal time</dt><dd>{m.wd}</dd>
                  <dt>Fee</dt><dd>{m.fee}</dd>
                  <dt>Minimum</dt><dd>{m.min}</dd>
                </dl>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--fg-mute)", marginTop: 22, lineHeight: 1.6 }}>
            *Bank wire withdrawals over $250 are free. Below this, the receiving bank may apply correspondent fees outside RakizFx's control. Crypto withdrawals settle on-chain — network fees are deducted from the withdrawal amount.
          </p>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <h2 className="sec-title">Funding policies</h2>
          <div className="why-grid">
            <div className="card why-card">
              <h3>Same-name only</h3>
              <p>Deposits and withdrawals must be made in the account holder's own name. Third-party payments are returned to source and may incur reversal fees.</p>
            </div>
            <div className="card why-card">
              <h3>Withdrawal routing</h3>
              <p>Withdrawals are routed back to the original method, up to the deposited amount per method. Profits in excess can be withdrawn to a verified bank account.</p>
            </div>
            <div className="card why-card">
              <h3>Verification</h3>
              <p>Full KYC (PAN + Aadhaar, or passport) must be complete before first withdrawal. Documents are reviewed within 1 business day, usually under 30 minutes.</p>
            </div>
            <div className="card why-card">
              <h3>Currency conversion</h3>
              <p>Live mid-market FX is applied to non-base-currency transfers, with a 0.5% conversion spread. Open multiple sub-accounts in different base currencies to avoid recurring conversion.</p>
            </div>
            <div className="card why-card">
              <h3>Tax statements</h3>
              <p>Annual profit & loss, swap and commission statements are available in your Client Area in PDF and CSV formats, sectioned per Indian financial year.</p>
            </div>
            <div className="card why-card">
              <h3>Dormancy</h3>
              <p>Accounts with no trading activity for 12 consecutive months incur a $10/month inactivity fee, charged from free balance only.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// TOOLS (calculator + economic calendar)
// ─────────────────────────────────────────────────────────────
function ToolsPage() {
  const [pair, setPair] = useState("EURUSD");
  const [lot, setLot] = useState(1);
  const [price, setPrice] = useState(1.0842);
  const [lev, setLev] = useState(500);

  const pipValueUSD = useMemo(() => {
    // 1 lot = 100,000 units. Pip = 0.0001 for most majors.
    const units = 100000 * lot;
    const pipSize = pair.includes("JPY") ? 0.01 : 0.0001;
    let pv = units * pipSize;
    if (pair.endsWith("USD")) return pv; // pip in USD
    return pv / price;
  }, [pair, lot, price]);
  const margin = useMemo(() => (100000 * lot * price) / lev, [lot, price, lev]);

  const events = [
    { t: "13:30", c: "🇺🇸", e: "Non-Farm Payrolls (NFP)",     i: "High",   p: "180K",   a: "—" },
    { t: "13:30", c: "🇺🇸", e: "Unemployment Rate",            i: "High",   p: "3.9%",  a: "—" },
    { t: "12:00", c: "🇪🇺", e: "ECB Interest Rate Decision",   i: "High",   p: "4.50%", a: "—" },
    { t: "08:30", c: "🇬🇧", e: "GDP (m/m)",                    i: "Medium", p: "0.3%",  a: "0.4%" },
    { t: "07:00", c: "🇩🇪", e: "Manufacturing PMI",            i: "Medium", p: "42.5",  a: "42.8" },
    { t: "06:00", c: "🇯🇵", e: "BoJ Policy Rate",              i: "High",   p: "0.10%", a: "0.10%" },
    { t: "05:30", c: "🇮🇳", e: "WPI Inflation",                i: "Medium", p: "3.1%",  a: "3.05%" },
    { t: "15:00", c: "🇨🇦", e: "BoC Overnight Rate",           i: "High",   p: "4.75%", a: "—" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Trading tools"
        title="Calculate, plan, prepare."
        sub="Free pip-value, margin and swap calculators plus a real-time economic calendar — the same data feeds we use internally."
      />
      <section style={{ paddingTop: 0 }}>
        <div className="container tools-grid">
          <div className="card calc-card">
            <h3>Pip & margin calculator</h3>
            <div className="calc-row">
              <label>Pair
                <select value={pair} onChange={e=>setPair(e.target.value)}>
                  {["EURUSD","GBPUSD","USDJPY","XAUUSD","BTCUSD","USDINR"].map(p=><option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Lots
                <input type="number" min="0.01" step="0.01" value={lot} onChange={e=>setLot(+e.target.value || 0)} />
              </label>
            </div>
            <div className="calc-row">
              <label>Market price
                <input type="number" step="0.0001" value={price} onChange={e=>setPrice(+e.target.value || 0)} />
              </label>
              <label>Leverage 1:
                <input type="number" min="1" value={lev} onChange={e=>setLev(+e.target.value || 1)} />
              </label>
            </div>
            <div className="calc-out">
              <div><span>Pip value</span><b className="mono">${pipValueUSD.toFixed(2)}</b></div>
              <div><span>Required margin</span><b className="mono">${margin.toFixed(2)}</b></div>
              <div><span>Notional value</span><b className="mono">${(100000 * lot * price).toLocaleString(undefined,{maximumFractionDigits:0})}</b></div>
            </div>
          </div>

          <div className="card calc-card">
            <h3>Today's economic calendar</h3>
            <div className="cal-list">
              {events.map((e, i) => (
                <div key={i} className="cal-row">
                  <span className="mono cal-t">{e.t}</span>
                  <span className="cal-c">{e.c}</span>
                  <span className="cal-e">{e.e}</span>
                  <span className={`cal-i i-${e.i.toLowerCase()}`}>{e.i}</span>
                  <span className="mono cal-pa">P {e.p} <span style={{opacity:.5}}>·</span> A {e.a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// EDUCATION / ACADEMY
// ─────────────────────────────────────────────────────────────
function EducationPage() {
  const tracks = [
    {
      title: "Forex foundations",
      level: "Beginner · 8 lessons",
      desc: "What forex is, why it moves, how to read a quote, leverage and margin, pip value, lot sizing and your first demo trade.",
      lessons: ["What is forex?", "Reading a quote (bid/ask/spread)", "Leverage explained", "Pips, lots and units", "Long vs short", "Placing your first order", "Stop-loss & take-profit", "From demo to live"],
    },
    {
      title: "Technical analysis",
      level: "Intermediate · 12 lessons",
      desc: "Price action, candlestick patterns, support and resistance, trendlines, moving averages, RSI, MACD, Fibonacci and multi-timeframe analysis.",
      lessons: ["Candlestick anatomy", "Support & resistance", "Trendlines", "Moving averages", "RSI & overbought zones", "MACD crossovers", "Fibonacci retracement", "Chart patterns", "Volume analysis", "Multi-timeframe", "Building a setup", "Backtesting"],
    },
    {
      title: "Risk management",
      level: "All levels · 6 lessons",
      desc: "The 1% rule, position sizing, risk:reward ratios, drawdown control, kelly criterion and the trader's psychology around losses.",
      lessons: ["The 1% rule", "Position sizing math", "Risk:reward & expectancy", "Managing drawdown", "Losing-streak survival", "Journal & review"],
    },
    {
      title: "MetaTrader 5 mastery",
      level: "All levels · 10 lessons",
      desc: "Install, navigate the platform, set up watchlists, place advanced orders, customise indicators, run Expert Advisors and use the Strategy Tester.",
      lessons: ["Installing MT5", "Workspace tour", "Watchlist & Market Watch", "Charting basics", "Order types in depth", "Custom indicators", "Templates & profiles", "Expert Advisors (EAs)", "Strategy Tester", "MQL5 marketplace"],
    },
  ];
  const glossary = [
    ["Pip", "The smallest standardised price move in a quote — typically 0.0001 for most majors, 0.01 for JPY pairs."],
    ["Spread", "Difference between bid (sell) and ask (buy). Quoted in pips. Tighter spreads = lower trading cost."],
    ["Leverage", "Borrowed exposure expressed as a ratio. 1:500 means $1 of margin controls $500 of notional value."],
    ["Margin", "Capital reserved to maintain an open position. Required margin = notional ÷ leverage."],
    ["Margin call", "Notification that account equity has fallen to a level requiring more funds or position reduction."],
    ["Stop-out", "Automatic closure of open positions when margin level falls below the broker's threshold (50% at RakizFx)."],
    ["Slippage", "Difference between expected and executed price, common in fast markets and at session opens."],
    ["Swap / rollover", "Interest charged or paid for holding a leveraged position overnight, derived from the interest-rate differential of the two currencies."],
    ["ECN", "Electronic Communication Network — direct market access execution with no dealing-desk intervention."],
    ["Lot", "Standard contract size. 1 standard lot in forex = 100,000 base-currency units. Mini lot = 10,000, micro lot = 1,000."],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Learn to trade — without the fluff."
        sub="Self-paced video and reading tracks built by trading desk veterans. Free for all RakizFx clients."
      />
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="edu-grid">
            {tracks.map(t => (
              <div key={t.title} className="card edu-card">
                <span className="edu-level">{t.level}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <details>
                  <summary>{t.lessons.length} lessons</summary>
                  <ol>{t.lessons.map((l,i)=><li key={i}>{l}</li>)}</ol>
                </details>
                <a href="#" className="btn btn-ghost btn-sm">Start Track →</a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <h2 className="sec-title">Trading glossary</h2>
          <p className="sec-sub" style={{ marginBottom: 24 }}>Plain-English definitions of the terms you'll see on charts, in your statements and across the platform.</p>
          <dl className="glossary">
            {glossary.map(([t, d]) => (
              <div key={t} className="glo-row">
                <dt>{t}</dt><dd>{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// PARTNERS / INTRODUCING BROKER PROGRAM
// ─────────────────────────────────────────────────────────────
function PartnersPage() {
  const programs = [
    {
      tag: "Partnership Program",
      title: "Introducing Broker (IB)",
      body: "Refer traders to RakizFx and earn competitive commissions through our global IB partnership program. Lifetime payouts, daily settlements and a dedicated portal to track every referral.",
      cta: "Apply as IB",
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    },
  ];

  const benefits = [
    { t: "Competitive commission structure",  p: "Industry-leading payouts on every referred trader.", i: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
    { t: "Fast & secure payments",            p: "Daily settlements to bank, card or crypto wallet.", i: <><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></> },
    { t: "Dedicated partner support",         p: "A relationship manager assigned from day one.", i: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></> },
    { t: "Institutional-grade technology",    p: "Tier-1 liquidity, sub-30ms execution, deep depth.", i: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></> },
    { t: "Global growth opportunities",       p: "Active clients in 60+ countries — promote across markets.", i: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20"/></> },
    { t: "Professional trading infrastructure",p: "MetaTrader 5, Client Area, full back-office stack.", i: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
  ];

  return (
    <>
      <section className="page-hd">
        <div className="container">
          <span className="eyebrow">Partners</span>
          <h1 className="page-h1">Become a Partner</h1>
          <p className="page-sub">Two ways to grow with us — Introducing Broker or Affiliate. Industry-leading payouts, daily settlements, dedicated support.</p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="partner-programs">
            {programs.map((p, i) => (
              <div key={i} className="partner-program">
                <span className="partner-tag">{p.tag}</span>
                <span className="partner-ic">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <a href="#register" className="btn btn-primary">
                  {p.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="sec-title">Why partner with RakizFx</h2>
          </div>
          <div className="partner-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="partner-benefit" style={{ "--why-delay": `${i * 0.08}s` }}>
                <span className="partner-benefit-ic">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{b.i}</svg>
                </span>
                <div>
                  <h4>{b.t}</h4>
                  <p>{b.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="sec-title">Partner promotions</h2>
            <p className="sec-sub" style={{ margin: "0 auto" }}>Exclusive partner-only campaigns, performance bonuses and seasonal rewards.</p>
          </div>
          <div className="promo-main">
            {[
              { t: "Welcome Bonus",     p: "Exclusive sign-on bonus for new partners on first qualified referral.",     i: <><path d="M20 12V22H4V12"/><path d="M2 7h20v5H2zM12 22V7M12 7H8a3 3 0 0 1 0-6c5 0 0 6 0 6zM12 7h4a3 3 0 0 0 0-6c-5 0 0 6 0 6z"/></> },
              { t: "Refer & Earn",      p: "Recruit other partners and earn an override on their referrals.",            i: <><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></> },
              { t: "Trade & Win",       p: "Monthly partner leaderboard with cash bonuses for top performers.",          i: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></> },
              { t: "Loyalty Rewards",   p: "Higher payout tiers unlock as your referred volume grows.",                  i: <><path d="M12 2 8.5 8.5 1 9.3l5.5 5.3L5 22l7-3.7 7 3.7-1.5-7.4L23 9.3l-7.5-.8z"/></> },
              { t: "Cashback Program",  p: "Receive cashback on every funded trader, paid weekly.",                       i: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
              { t: "Seasonal Campaigns",p: "Limited-time partner offers — boosted CPAs and bonus rev-share weeks.",       i: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></> },
            ].map((m, i) => (
              <div key={i} className="promo-main-card" style={{ "--why-delay": `${i * 0.06}s` }}>
                <span className="promo-main-ic">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{m.i}</svg>
                </span>
                <h3>{m.t}</h3>
                <p>{m.p}</p>
                <span className="promo-main-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="sec-title">Premium partner structure</h2>
          </div>
          <div className="promo-columns">
            {[
              { h: "Current Offers", l: ["Welcome Bonus","Volume Bonuses","Override Rewards","Boosted CPA Weeks"] },
              { h: "Partner Rewards", l: ["Loyalty Program","VIP Partner Benefits","Cashback on Funded Clients","Premium Partner Offers"] },
              { h: "Exclusive Campaigns", l: ["Limited-Time Promotions","Seasonal Partner Events","Co-marketing Campaigns"] },
            ].map((c, i) => (
              <div key={i} className="promo-column">
                <h4>{c.h}</h4>
                <ul>
                  {c.l.map((item, j) => (
                    <li key={j}><span className="promo-bullet" aria-hidden="true"/>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="sec-title">Premium partner benefits</h2>
          </div>
          <div className="promo-luxury">
            {[
              { t: "Welcome Bonus",   p: "Onboarding rewards designed to accelerate your first month." },
              { t: "Trade & Win",     p: "Compete with partners worldwide and unlock premium prizes." },
              { t: "Refer & Earn",    p: "Grow your network and earn performance-based overrides." },
              { t: "Loyalty Rewards", p: "Premium benefits designed for high-volume partners." },
            ].map((l, i) => (
              <div key={i} className="promo-luxury-card">
                <span className="promo-luxury-rule" aria-hidden="true"/>
                <h3>{l.t}</h3>
                <p>{l.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-cta">
        <div className="partner-cta-bg" aria-hidden="true">
          <div className="partner-cta-orb partner-cta-orb-1" />
          <div className="partner-cta-orb partner-cta-orb-2" />
        </div>
        <div className="container partner-cta-grid">
          <div>
            <span className="hero-slogan" style={{ marginBottom: 18 }}>
              <span className="hero-slogan-mark">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
              </span>
              <span className="hero-slogan-text">Premium Partnership</span>
            </span>
            <h2>Partner with a globally trusted trading brand</h2>
            <p>Build long-term business growth with advanced technology, premium support and scalable partnership solutions tailored to your audience.</p>
            <div className="partner-cta-actions">
              <a href="#contact" className="btn btn-primary btn-lg">
                Schedule a consultation
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
              </a>
              <a href="#register" className="btn btn-ghost-light btn-lg">Apply Directly</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ABOUT / REGULATION
// ─────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About RakizFx"
        title="Trader-first, regulation-grounded."
        sub="RakizFx is the trading brand of Rakiz Capital Ltd, serving 180,000+ retail and institutional clients across 60+ countries."
      />
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-grid">
            <div>
              <h2 className="sec-title">Built by traders, for traders</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: 16, lineHeight: 1.7 }}>
                Rakiz Capital was founded in 2021 by a team of ex-bank FX dealers and quant developers who were tired of the trade-off retail traders were forced into: institutional execution or beginner-friendly tools, never both.
              </p>
              <p style={{ color: "var(--fg-dim)", fontSize: 16, lineHeight: 1.7 }}>
                We rebuilt the broker stack from scratch — straight-through processing to tier-1 liquidity providers, an Equinix-colocated matching engine and a Client Area you can actually navigate without a manual. Today, RakizFx processes over $2.4 billion in monthly client volume across 1,200+ instruments.
              </p>
              <p style={{ color: "var(--fg-dim)", fontSize: 16, lineHeight: 1.7 }}>
                We don't run a B-book against our clients. We don't trade against your orders. Our P&L is the spread and commission — nothing else. When you win, we win.
              </p>
            </div>
            <div>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ marginTop: 0 }}>Quick facts</h3>
                <dl className="quick-facts">
                  <dt>Founded</dt><dd>2021</dd>
                  <dt>Legal entity</dt><dd>Rakiz Capital Ltd</dd>
                  <dt>Auditor</dt><dd>Big-4 external audit, annually</dd>
                  <dt>Headquarters</dt><dd>Mumbai, India</dd>
                  <dt>Liquidity</dt><dd>Tier-1 banks · 25+ LPs</dd>
                  <dt>Client funds</dt><dd>Segregated, top-tier banks</dd>
                  <dt>Insurance</dt><dd>$1M per client compensation scheme</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <h2 className="sec-title">Client protection</h2>
          <div className="why-grid">
            <div className="card why-card"><h3>Segregated funds</h3><p>Client deposits are held in tier-1 bank accounts, fully segregated from operational capital and reconciled daily.</p></div>
            <div className="card why-card"><h3>Negative balance protection</h3><p>Retail accounts cannot go into deficit. In a gap event, your balance is reset to zero at no cost.</p></div>
            <div className="card why-card"><h3>Compensation scheme</h3><p>Up to $1,000,000 per eligible client through our investor compensation insurance, underwritten by Lloyd's syndicates.</p></div>
            <div className="card why-card"><h3>Independent audit</h3><p>Annual external audit by a Big-4 firm. Financial statements and regulator filings are publicly available.</p></div>
            <div className="card why-card"><h3>Encrypted infrastructure</h3><p>TLS 1.3, 256-bit SSL, hardware-key MFA support, withdrawal whitelisting and 24/7 SOC monitoring.</p></div>
            <div className="card why-card"><h3>Order transparency</h3><p>Every fill is timestamped to the millisecond and viewable in your trade history. Spread audit data available on request.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────
function FAQPage() {
  const cats = [
    {
      cat: "Getting started",
      items: [
        ["How do I open a RakizFx account?", "Sign up with your email and phone in the registration form. Upload PAN + Aadhaar (or passport for non-Indian residents). Verification typically completes within 10 minutes. Once approved, fund your account via UPI or any supported method and start trading."],
        ["What is the minimum deposit?", "Standard accounts start at $50 (or equivalent in INR). Pro from $200, Elite from $2,000. There is no maximum deposit limit."],
        ["Can I open a demo account first?", "Yes. A demo account with $50,000 virtual capital is available with no deposit required and no time limit. Switch to a live account anytime from your Client Area."],
        ["What documents are required for KYC?", "For Indian residents: PAN card + Aadhaar card (or passport). For other jurisdictions: a government-issued photo ID and a proof of residence (utility bill or bank statement, less than 6 months old)."],
      ],
    },
    {
      cat: "Trading",
      items: [
        ["What markets can I trade?", "60+ forex pairs, major and minor indices, metals (gold, silver, platinum), energies (oil, natural gas), 30+ cryptocurrencies and 100+ share CFDs. Full list under Markets → All instruments."],
        ["What leverage is available?", "Up to 1:400 on Standard, 1:500 on Pro, and custom leverage on Elite (subject to risk review). Crypto and exotic FX pairs may carry lower maximums."],
        ["What is the maximum trade size?", "1,000 lots per individual order across forex and metals. Higher sizes available on request via your account manager (Elite tier)."],
        ["Are there any restrictions on trading strategies?", "Scalping, hedging, EAs and high-frequency trading are all permitted. There are no holding-time restrictions. Latency arbitrage exploiting platform delays is prohibited."],
      ],
    },
    {
      cat: "Funding",
      items: [
        ["How long do withdrawals take?", "UPI: up to 2 hours. Cards: 1–3 business days. Bank wire: 1–3 business days. Crypto: usually within 1 hour after blockchain confirmation."],
        ["Are there any deposit fees?", "RakizFx covers all standard deposit fees. Some payment processors may charge their own fees outside our control — these are clearly displayed before you confirm."],
        ["Can I withdraw to a different account?", "No. Under anti-money-laundering rules, withdrawals must return to the same payment method and account name used for deposit, up to the deposited amount."],
        ["What happens if my deposit fails?", "Failed deposits are typically reversed by the payment provider within 5–7 business days. If you don't see a refund, contact support with the transaction reference."],
      ],
    },
    {
      cat: "Platform & technical",
      items: [
        ["Which platforms do you support?", "MetaTrader 5 on Windows, macOS, iOS, Android and Web. Pro and Elite clients also have access to MT5 VPS hosting (free with qualifying balance)."],
        ["Can I run Expert Advisors (EAs)?", "Yes. All EAs and custom indicators are permitted. Free VPS for Pro/Elite clients ensures 24/5 uptime for your automated strategies."],
        ["What is your server time?", "EET (Eastern European Time, GMT+2/GMT+3 with DST). Daily candles close at 23:59 server time."],
        ["I'm having connection issues. What now?", "Try switching MT5 server (look for the lowest ping in File → Login). If problems persist, contact support — chat replies in seconds."],
      ],
    },
  ];
  const [open, setOpen] = useState({ 0: 0 });
  return (
    <>
      <PageHeader
        eyebrow="Help centre"
        title="Frequently asked questions."
        sub="Can't find what you're looking for? Open the chat in the bottom-right corner or email support@rakizfx.com — our team replies in under 90 seconds."
      />
      <section style={{ paddingTop: 0 }}>
        <div className="container faq-wrap">
          {cats.map((c, ci) => (
            <div key={c.cat} className="faq-cat">
              <h2>{c.cat}</h2>
              <div className="faq-list">
                {c.items.map(([q, a], i) => {
                  const isOpen = open[ci] === i;
                  return (
                    <div key={i} className={`faq-item ${isOpen?"open":""}`}>
                      <button onClick={() => setOpen(o => ({ ...o, [ci]: isOpen ? -1 : i }))}>
                        <span>{q}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={isOpen?"M5 12h14":"M12 5v14M5 12h14"}/></svg>
                      </button>
                      {isOpen && <div className="faq-a">{a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────
function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="We're here, around the clock."
        sub="Live chat replies in under 90 seconds. Email tickets are answered within 1 business hour, 24/5."
      />
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-channels">
              <div className="card contact-info">
                <h3>General support</h3>
                <p><b>Email:</b> <a href="mailto:support@rakizfx.com">support@rakizfx.com</a></p>
                <p><b>Phone:</b> +91 22 6900 0000</p>
                <p><b>WhatsApp:</b> +91 22 6900 0000</p>
                <p><b>Live chat:</b> 24/5 in your Client Area or via the chat icon</p>
              </div>
              <div className="card contact-info">
                <h3>Compliance &amp; legal</h3>
                <p><b>Email:</b> <a href="mailto:compliance@rakizfx.com">compliance@rakizfx.com</a></p>
                <p>For KYC escalations, complaints and regulatory inquiries.</p>
              </div>
              <div className="card contact-info">
                <h3>Partnerships</h3>
                <p><b>Email:</b> <a href="mailto:partners@rakizfx.com">partners@rakizfx.com</a></p>
                <p>IB program, white-label and institutional liquidity.</p>
              </div>
              <div className="card contact-info">
                <h3>Press &amp; media</h3>
                <p><b>Email:</b> <a href="mailto:press@rakizfx.com">press@rakizfx.com</a></p>
                <p>Brand resources, executive interviews and media kits.</p>
              </div>
            </div>
            <aside className="contact-side">
              <div className="card contact-promo">
                <span className="crm-chip">Existing client?</span>
                <h3>Open a ticket from your Client Area</h3>
                <p>Authenticated tickets are prioritised — typical first response under 30 minutes during market hours.</p>
                <a href="https://crm.rakizfx.com/login" target="_blank" rel="noopener" className="btn btn-primary">
                  Sign in to Client Area
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                </a>
              </div>
              <div className="card contact-promo dark">
                <h3>Talk to a specialist</h3>
                <p>For Pro &amp; Elite enquiries, our trading desk is reachable directly via your relationship manager.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <h2 className="sec-title">Our offices</h2>
          <div className="office-grid">
            <div className="card"><h3>Mumbai (HQ)</h3><p>One BKC, Bandra Kurla Complex,<br/>Mumbai 400051, India</p></div>
            <div className="card"><h3>Dubai</h3><p>Al Fattan Currency House, Tower 2,<br/>DIFC, Dubai, UAE</p></div>
            <div className="card"><h3>London</h3><p>1 Bartholomew Lane,<br/>London EC2N 2AX, United Kingdom</p></div>
            <div className="card"><h3>Singapore</h3><p>One Raffles Place, Tower 1,<br/>Singapore 048616</p></div>
          </div>
        </div>
      </section>
    </>
  );
}


// ─── from register.jsx ────────────────────────────────────────────────
// RakizFx — Registration → CRM handoff (UI only, no backend form)

function RegisterPage({ onNav }) {
  return (
    <section className="crm-shell">
      <div className="container crm-grid">
        <div className="crm-card">
          <span className="crm-chip">Account opening</span>
          <h1>You're moments from the markets.</h1>
          <p>
            RakizFx accounts are opened through our secure Client Area. Click below to continue —
            you'll create your profile, verify your identity and fund your account in under 10 minutes.
          </p>

          <div className="crm-stages">
            <div><span className="crm-num">1</span><div><b>Create profile</b><span>Email, phone, country</span></div></div>
            <div><span className="crm-num">2</span><div><b>Verify identity</b><span>PAN + Aadhaar or passport</span></div></div>
            <div><span className="crm-num">3</span><div><b>Fund &amp; trade</b><span>From $50 via wire / card / crypto</span></div></div>
          </div>

          <div className="crm-actions">
            <a href="https://crm.rakizfx.com/register" target="_blank" rel="noopener" className="btn btn-primary btn-lg">
              Continue to secure registration
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
            </a>
            <a href="#home" className="btn btn-ghost btn-lg" onClick={(e)=>{e.preventDefault();onNav("home");}}>Back to site</a>
          </div>

          <p className="crm-risk">
            <b>Risk warning:</b> Trading CFDs is highly speculative, carries a high level of risk and may not be suitable for all investors. You may lose some or all of your invested capital.
          </p>
        </div>

        <aside className="crm-aside">
          <h3>What you'll get</h3>
          <ul>
            <li><span className="crm-ic">✓</span><div><b>Standard, Pro &amp; Elite</b><span>Choose the right tier for your strategy</span></div></li>
            <li><span className="crm-ic">✓</span><div><b>MetaTrader 5</b><span>Desktop, web, iOS &amp; Android</span></div></li>
            <li><span className="crm-ic">✓</span><div><b>1,200+ instruments</b><span>Forex, indices, metals, crypto &amp; more</span></div></li>
            <li><span className="crm-ic">✓</span><div><b>Same-day withdrawals</b><span>Wire / card / crypto</span></div></li>
            <li><span className="crm-ic">✓</span><div><b>Demo capital $50,000</b><span>Practice without funding</span></div></li>
          </ul>
          <div className="crm-trust">
            <span>Segregated funds</span>
            <span>NBP protection</span>
            <span>Same-day withdrawals</span>
          </div>
        </aside>
      </div>
    </section>
  );
}


// ─── from login.jsx ───────────────────────────────────────────────────
// RakizFx — Login → CRM handoff (UI only, no backend form)

function LoginPage({ onNav }) {
  return (
    <section className="crm-shell">
      <div className="container crm-grid">
        <div className="crm-card">
          <span className="crm-chip">Sign in</span>
          <h1>Welcome back, trader.</h1>
          <p>
            Sign in to your RakizFx Client Area to manage funds, view statements,
            adjust account settings or launch MetaTrader 5.
          </p>

          <div className="crm-stages">
            <div><span className="crm-num">1</span><div><b>Open Client Area</b><span>Hosted on our secure CRM</span></div></div>
            <div><span className="crm-num">2</span><div><b>Sign in safely</b><span>2FA &amp; biometric supported</span></div></div>
            <div><span className="crm-num">3</span><div><b>Launch MT5</b><span>Trade desktop, web or mobile</span></div></div>
          </div>

          <div className="crm-actions">
            <a href="https://crm.rakizfx.com/login" target="_blank" rel="noopener" className="btn btn-primary btn-lg">
              Continue to Client Area
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
            </a>
            <a href="#register" className="btn btn-ghost btn-lg" onClick={(e)=>{e.preventDefault();onNav("register");}}>I'm new — open an account</a>
          </div>

          <p className="crm-risk">
            Never share your password. RakizFx will never ask for your login credentials via email, phone or chat.
          </p>
        </div>

        <aside className="crm-aside">
          <h3>Trouble signing in?</h3>
          <ul>
            <li><span className="crm-ic">?</span><div><b>Forgot password?</b><span>Reset link via your registered email</span></div></li>
            <li><span className="crm-ic">?</span><div><b>No 2FA code?</b><span>Email <a href="mailto:support@rakizfx.com">support@rakizfx.com</a></span></div></li>
            <li><span className="crm-ic">?</span><div><b>Account locked?</b><span>Live chat replies in &lt; 90 seconds</span></div></li>
          </ul>
          <div className="crm-trust">
            <span>256-bit SSL</span>
            <span>2FA &amp; biometric</span>
            <span>24/5 human support</span>
          </div>
        </aside>
      </div>
    </section>
  );
}


// ─── from chatbot.jsx ─────────────────────────────────────────────────
// RakizFx — AI Chat Assistant
// Uses window.claude.complete for real responses, scoped with broker context.


const RAKIZ_CONTEXT = `You are "Rakiz Assistant", the official live chat support for RakizFx, an online CFD/forex broker.

Key facts about RakizFx (use only these):
- Account types: Standard ($50 min, 1:400 leverage, standard spreads, MT5), Pro ($200 min, 1:500 leverage, low spreads, MT5, priority support), Elite ($2,000 min, custom leverage, ultra-low spreads, dedicated relationship manager).
- All accounts: zero commission, adjustable swap-free option, MT5 platform, instant deposit and faster withdrawal, 24/7 technical support.
- Markets offered: Forex (60+ pairs), Indices, Metals (Gold, Silver), Energies (Crude, Brent, Natural Gas), Cryptocurrencies, Shares CFDs. 1,200+ instruments total.
- Funding methods: bank wire, debit/credit cards, crypto (USDT). Deposits credit instantly. Withdrawals processed same-day.
- Safeguards: segregated client funds, negative balance protection, SSL 256-bit security.
- Platforms: MetaTrader 5 (Windows, macOS, iOS, Android, Web).
- KYC: PAN + Aadhaar or passport.

Style guide:
- Be concise, factual, friendly. 2-4 short sentences typical.
- Never invent figures or features not listed above. If unsure, say "let me connect you with our team" and suggest emailing support@rakizfx.com.
- Never give financial advice or recommend specific trades. Always include the line "Trading CFDs carries risk and may not be suitable for all investors." when discussing risk.
- For account opening, point them to the "Open Account" button on the site.
- Currency: all amounts in USD.
- Do not roleplay as a different brand or person.`;

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm Rakiz Assistant. Ask me about accounts, deposits, spreads, leverage or KYC — I'll help in seconds." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(1);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const history = [...messages, { role: "user", text: q }]
        .slice(-10)
        .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));
      const chatHistory = history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });
      const data = await res.json();
      const reply = data.reply as string;
      setMessages(m => [...m, { role: "bot", text: reply || "Sorry, I didn't catch that. Could you rephrase?" }]);
      if (!open) setUnread(u => u + 1);
    } catch (e) {
      setMessages(m => [...m, { role: "bot", text: "I couldn't reach our system. Email support@rakizfx.com or try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  };

  const quick = [
    "What's the minimum to open an account?",
    "How long do withdrawals take?",
    "Is RakizFx regulated?",
    "What leverage do you offer?",
  ];

  return (
    <>
      <button
        className={`chat-fab ${open ? "open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            {unread > 0 && <span className="chat-badge">{unread}</span>}
          </>
        )}
      </button>

      <div className={`chat-window ${open ? "open" : ""}`} role="dialog" aria-label="Chat">
        <div className="chat-head">
          <span className="chat-avatar">R</span>
          <div className="chat-meta">
            <b>Rakiz Assistant</b>
            <span><span className="chat-dot"/> Online · replies in seconds</span>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
          </button>
        </div>
        <div className="chat-body" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
          {busy && (
            <div className="chat-msg bot">
              <div className="chat-bubble typing"><i/><i/><i/></div>
            </div>
          )}
        </div>
        {messages.length <= 1 && (
          <div className="chat-quick">
            {quick.map(q => (
              <button key={q} onClick={() => send(q)} disabled={busy}>{q}</button>
            ))}
          </div>
        )}

        <div className="chat-connect">
          <a className="chat-connect-btn whatsapp"
             href="https://wa.me/912269000000?text=Hi%2C%20I%27d%20like%20to%20speak%20with%20my%20relationship%20manager"
             target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9s-.5-.2-.7.2-.8.9-1 1.1-.4.2-.7 0c-1.6-.8-2.7-1.5-3.8-3.4-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.3-.7.3-1.2.2-1.4-.1-.1-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.5.8 3.2 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.3.9.9-3.2-.2-.3a8.2 8.2 0 1 1 15.3-4.2c0 4.5-3.7 8.2-8 8.2z"/>
            </svg>
            <div>
              <b>WhatsApp your RM</b>
              <span>+91 22 6900 0000 · replies in minutes</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
          </a>
          <a className="chat-connect-btn ticket" href="mailto:support@rakizfx.com?subject=Open%20a%20support%20ticket">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
            </svg>
            <div>
              <b>Open a support ticket</b>
              <span>support@rakizfx.com · 1-hour response</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
          </a>
        </div>
        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input
            type="text"
            placeholder="Ask about accounts, spreads, KYC..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>
        <div className="chat-foot">
          Trading CFDs carries risk. Powered by Rakiz Assist.
        </div>
      </div>
    </>
  );
}


// ─── App entry + hash router ───────────────────────────────────────────────
const ROUTES = [
  "home", "markets", "accounts", "funding", "tools", "academy",
  "partners", "affiliate", "promotion", "careers", "help", "about",
  "faq", "contact", "register", "login",
  // Asset-class detail pages (clicked from Markets overview)
  "market-forex", "market-metals", "market-indices", "market-energies",
  "market-crypto", "market-shares"
] as const;

function shade(hex, pct) {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) + Math.round(2.55 * pct);
  let g = ((num >> 8) & 0xff) + Math.round(2.55 * pct);
  let b = (num & 0xff) + Math.round(2.55 * pct);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function useHashRoute() {
  const getHash = () => {
    if (typeof window === "undefined") return "home";
    const h = (window.location.hash || "#home").replace(/^#/, "").split("?")[0];
    return ROUTES.includes(h as any) ? h : "home";
  };
  const [route, setRoute] = useState<string>(getHash());
  useEffect(() => {
    const fn = () => setRoute(getHash());
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const nav = (r) => {
    window.location.hash = "#" + r;
    setRoute(r);
  };
  return [route, nav] as const;
}

// Scroll-reveal hook (used by App).
function useRevealEffect() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// Replicates acct-hover.js — sets --mx/--my CSS vars on .acct cards.
// Pointer tracker — sets --mx / --my CSS vars on any element matching the
// spotlight selector list. Powers cursor-following spotlights and the
// magnetic-button feel (drives transform via CSS, not JS layout writes).
const SPOTLIGHT_SELECTOR =
  '.acct, .acct-simple, .markets-class-card, .asset-speciality-card, ' +
  '.asset-pair-chip, .why-card, .why-traders-card, .mkt-news-card, ' +
  '.fund-card, .edu-card, .award-card, .btn-primary, .btn-ghost, .btn-ghost-light';

function useSpotlightPointer() {
  useEffect(() => {
    let raf = 0;
    let pending: { el: HTMLElement; r: DOMRect; x: number; y: number } | null = null;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.(SPOTLIGHT_SELECTOR) as HTMLElement | null;
      if (!el) return;
      pending = { el, r: el.getBoundingClientRect(), x: e.clientX, y: e.clientY };
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!pending) return;
          const { el, r, x, y } = pending;
          const mx = ((x - r.left) / r.width) * 100;
          const my = ((y - r.top) / r.height) * 100;
          el.style.setProperty('--mx', mx + '%');
          el.style.setProperty('--my', my + '%');
          // Magnetic offset: -1px..+1px from center based on cursor position
          el.style.setProperty('--mdx', (mx / 50 - 1).toFixed(2));
          el.style.setProperty('--mdy', (my / 50 - 1).toFixed(2));
          pending = null;
        });
      }
    };

    document.addEventListener('mousemove', handler, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
// Preserve the original name for backwards compatibility within App().
const useAcctHover = useSpotlightPointer;

export default function App() {
  const [route, nav] = useHashRoute();
  useRevealEffect();
  useAcctHover();

  // Frontend-only mode: all auth/CRM links are visual only — clicks are
  // intercepted so nothing navigates to a backend that doesn't exist yet.
  // Internal hash navigation continues to work for the marketing pages.
  useEffect(() => {
    const block = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest && (target.closest('a[href], button[data-cta]') as HTMLAnchorElement | null);
      if (!a) return;
      const h = (a as HTMLAnchorElement).getAttribute?.('href') || '';
      const isCrm = h.startsWith('https://crm.rakizfx.com') || h.startsWith('http://crm.rakizfx.com');
      const isAuth = h === '#register' || h === '#login';
      if (isCrm || isAuth) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('click', block, true);
    return () => document.removeEventListener('click', block, true);
  }, []);

  // Apply theme + accent CSS vars on mount.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark'); // light theme by default
    html.dataset.density = 'regular';
    html.style.setProperty('--accent', '#1ad17a');
    html.style.setProperty('--accent-2', shade('#1ad17a', -10));
  }, []);

  // Sticky-nav shadow + section auto-reveal on scroll.
  useEffect(() => {
    const onScroll = () => {
      const nav = document.querySelector('.nav-wrap');
      if (!nav) return;
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-reveal every <section> as it enters the viewport.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section'));
    if (sections.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      sections.forEach((s) => s.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -10% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [route]);

  const [bonusOpen, setBonusOpen] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem('rakizfx.bonus.dismissed') === '1') setBonusOpen(false);
    } catch { /* localStorage blocked */ }
  }, []);
  const dismissBonus = () => {
    setBonusOpen(false);
    try { localStorage.setItem('rakizfx.bonus.dismissed', '1'); } catch { /* ignore */ }
  };

  return (
    <>
      {bonusOpen && <BonusBar onClose={dismissBonus} />}
      <Nav route={route} onNav={nav} />

      {route === "home" && (
        <>
          <HeroSingle />
          <TickerStrip />
          <CoreFeaturesRow />
          <AssetShowcase />
          <div className="reveal"><Why /></div>
          <AccountCompare />
          <PlatformShowcase />
          <MobileApp />
          <FullCTA />
        </>
      )}

      {route === "markets" && <MarketsPageNew />}
      {route === "market-forex"    && <AssetClassDetail kind="forex" />}
      {route === "market-metals"   && <AssetClassDetail kind="metals" />}
      {route === "market-indices"  && <AssetClassDetail kind="indices" />}
      {route === "market-energies" && <AssetClassDetail kind="energies" />}
      {route === "market-crypto"   && <AssetClassDetail kind="crypto" />}
      {route === "market-shares"   && <AssetClassDetail kind="shares" />}

      {route === "accounts" && (
        <>
          <PageHeader
            eyebrow="Account types"
            title="Pick the account that fits your strategy."
            sub="Three tiers — STP, Pro and Elite — built around how actively you trade and how much capital you deploy."
          />
          <Accounts />
          <Steps />
        </>
      )}

      {route === "funding" && <FundingPage />}
      {route === "tools" && <ToolsPage />}
      {route === "academy" && <EducationPage />}
      {route === "partners" && <PartnersPage />}
      {route === "affiliate" && <AffiliatePage />}
      {route === "promotion" && <PromotionPage />}
      {route === "careers" && <CareersPage />}
      {route === "help" && <HelpCenterPage />}
      {route === "about" && <AboutPage />}
      {route === "faq" && <FAQPage />}
      {route === "contact" && <ContactPage />}
      {route === "register" && <RegisterPage onNav={nav} />}
      {route === "login" && <LoginPage onNav={nav} />}

      <Footer onNav={nav} />
      <ChatBot />

      {/* Mobile-only sticky CTA bar (broker-standard) */}
      <MobileCTABar route={route} onNav={nav} />
    </>
  );
}

// Vantage-style static feature cards with left/right arrow navigation.
function CoreFeaturesRow() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const features = [
    {
      tag: "Execution",
      title: "Spreads from 0.0 pips",
      icon: <><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></>,
    },
    {
      tag: "Speed",
      title: "Fills in 28 ms",
      icon: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    },
    {
      tag: "Markets",
      title: "1,200+ markets, one account",
      icon: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></>,
    },
    {
      tag: "Funding",
      title: "Fast withdrawals",
      icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
    },
    {
      tag: "Support",
      title: "24/7 human support",
      icon: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>,
    },
    {
      tag: "Platform",
      title: "MetaTrader 5, every device",
      icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
    },
    {
      tag: "Bonus",
      title: "Welcome boost on first deposit",
      icon: <><path d="M20 12V22H4V12"/><path d="M2 7h20v5H2zM12 22V7"/></>,
    },
  ];

  const scrollBy = (dir: 1 | -1) => () => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.75), behavior: 'smooth' });
  };

  return (
    <section className="core-marquee">
      <div className="core-marquee-shell">
        <button
          type="button"
          aria-label="Scroll left"
          className="core-nav-btn core-nav-btn--left"
          onClick={scrollBy(-1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M19 12H5"/><path d="m12 5-7 7 7 7"/>
          </svg>
        </button>

        <div className="core-marquee-frame" ref={railRef}>
          <ul className="core-marquee-track" role="list">
            {features.map((f, i) => (
              <li key={i} className="core-marquee-card">
                <span className="core-marquee-tag">{f.tag}</span>
                <h3 className="core-marquee-title">{f.title}</h3>
                <span className="core-marquee-ic" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          aria-label="Scroll right"
          className="core-nav-btn core-nav-btn--right"
          onClick={scrollBy(1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
          </svg>
        </button>
      </div>
    </section>
  );
}

function MobileCTABar({ route, onNav }: { route: string; onNav: (r: string) => void }) {
  const t = useT();
  if (route === 'register' || route === 'login') return null;
  return (
    <div className="mobile-cta-bar" role="region" aria-label="Quick actions">
      <a
        href="#login"
        className="btn btn-ghost"
        onClick={(e) => { e.preventDefault(); onNav('login'); }}
      >
        {t('cta.login')}
      </a>
      <a
        href="#register"
        className="btn btn-primary"
        onClick={(e) => { e.preventDefault(); onNav('register'); }}
      >
        {t('cta.open_account')}
      </a>
    </div>
  );
}
