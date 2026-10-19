"use client";

import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";

/** Hard ceiling on band width. */
const MAX_BAND_WIDTH = 30;

const num = (v) => {
    const parsed = parseFloat(String(v ?? ""));
    return Number.isFinite(parsed) && parsed > 0
        ? Math.min(parsed, MAX_BAND_WIDTH)
        : 0;
};

const bandWidthsOf = (b) => {
    const fused = num(b?.borderWidth);
    return {
        top: b?.borderTopWidth !== undefined ? num(b.borderTopWidth) : fused,
        right: b?.borderRightWidth !== undefined ? num(b.borderRightWidth) : fused,
        bottom: b?.borderBottomWidth !== undefined ? num(b.borderBottomWidth) : fused,
        left: b?.borderLeftWidth !== undefined ? num(b.borderLeftWidth) : fused,
    };
};

const borderColorOf = (b) => b?.borderColor ?? "transparent";

const WHITE = { r: 255, g: 255, b: 255, a: 1 };

function resolveCssVar(v) {
    if (typeof window === "undefined" || !v || typeof v !== "string") return v;
    let val = v.trim();
    if (val.startsWith("var(")) {
        const match = val.match(/^var\(\s*(--[^,\s)]+)(?:\s*,\s*(.+))?\s*\)$/);
        if (match) {
            const varName = match[1];
            const fallback = match[2];
            const computed = getComputedStyle(document.body).getPropertyValue(varName).trim();
            if (computed) return computed;
            if (fallback) return resolveCssVar(fallback);
        }
    }
    return val;
}

/** Resolves hex, rgb, rgba, or CSS variable */
function parseColor(input) {
    if (!input) return WHITE;
    let c = resolveCssVar(String(input));

    const token = c.match(/^var\([^,]+,\s*(.+)\)$/i);
    if (token) c = token[1].trim();

    if (c[0] === "#") {
        let h = c.slice(1);
        if (h.length === 3 || h.length === 4) {
            h = h
                .split("")
                .map((ch) => ch + ch)
                .join("");
        }
        if (h.length !== 6 && h.length !== 8) return WHITE;
        const n = parseInt(h, 16);
        if (Number.isNaN(n)) return WHITE;
        return h.length === 6
            ? { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
            : {
                  r: (n >>> 24) & 255,
                  g: (n >>> 16) & 255,
                  b: (n >>> 8) & 255,
                  a: (n & 255) / 255,
              };
    }

    const fn = c.match(/rgba?\(([^)]+)\)/i);
    if (fn) {
        const p = fn[1]
            .split(/[,\s/]+/)
            .filter(Boolean)
            .map(Number);
        if (p.length >= 3 && p.slice(0, 3).every((v) => !Number.isNaN(v))) {
            return {
                r: p[0],
                g: p[1],
                b: p[2],
                a: p.length > 3 && !Number.isNaN(p[3]) ? p[3] : 1,
            };
        }
    }
    return WHITE;
}

const rgba = (c, a) =>
    `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${Math.max(0, Math.min(1, a))})`;

const radiusFromPercent = (w, h, pct) =>
    (Math.min(w, h) / 2) * (Math.max(0, Math.min(100, pct)) / 100);

const BAND_MASK = {
    maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
    maskClip: "border-box, content-box",
    maskComposite: "exclude",
    WebkitMaskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
    WebkitMaskClip: "border-box, content-box",
    WebkitMaskComposite: "xor",
};

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ---------------------------------------------------------------------------
// Deterministic seed
// ---------------------------------------------------------------------------
const rnd = (i, salt) => {
    const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
};

const pointOnRoundRect = (t, w, h, r) => {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    const sx = Math.max(0, w - 2 * rr);
    const sy = Math.max(0, h - 2 * rr);
    const arc = (Math.PI / 2) * rr;
    const total = 2 * sx + 2 * sy + 4 * arc;
    if (total <= 0) return { x: w / 2, y: h / 2 };

    let d = (((t % 1) + 1) % 1) * total + sx / 2;
    d %= total;

    if (d < sx) return { x: rr + d, y: 0 };
    d -= sx;
    if (d < arc) {
        const a = d / rr;
        return { x: w - rr + rr * Math.sin(a), y: rr - rr * Math.cos(a) };
    }
    d -= arc;
    if (d < sy) return { x: w, y: rr + d };
    d -= sy;
    if (d < arc) {
        const a = d / rr;
        return { x: w - rr + rr * Math.cos(a), y: h - rr + rr * Math.sin(a) };
    }
    d -= arc;
    if (d < sx) return { x: w - rr - d, y: h };
    d -= sx;
    if (d < arc) {
        const a = d / rr;
        return { x: rr - rr * Math.sin(a), y: h - rr + rr * Math.cos(a) };
    }
    d -= arc;
    if (d < sy) return { x: 0, y: h - rr - d };
    d -= sy;
    const a = d / rr;
    return { x: rr - rr * Math.cos(a), y: rr - rr * Math.sin(a) };
};

const pointOnRoundRectAngular = (t, w, h, r) => {
    const a = w / 2;
    const b = h / 2;
    if (a <= 0 || b <= 0) return { x: w / 2, y: h / 2 };
    const rr = Math.max(0, Math.min(r, a, b));
    const th = -Math.PI / 2 + (((t % 1) + 1) % 1) * Math.PI * 2;
    const dx = Math.cos(th);
    const dy = Math.sin(th);

    const kx = Math.abs(dx) > 1e-9 ? a / Math.abs(dx) : Infinity;
    const ky = Math.abs(dy) > 1e-9 ? b / Math.abs(dy) : Infinity;
    let k = Math.min(kx, ky);

    const cx = a - rr;
    const cy = b - rr;
    if (rr > 0 && Math.abs(dx * k) > cx && Math.abs(dy * k) > cy) {
        const Cx = Math.sign(dx * k) * cx;
        const Cy = Math.sign(dy * k) * cy;
        const proj = dx * Cx + dy * Cy;
        const disc = rr * rr - (Cx * Cx + Cy * Cy) + proj * proj;
        k = proj + Math.sqrt(Math.max(0, disc));
    }
    return { x: a + dx * k, y: b + dy * k };
};

const SECONDS_AT_SPEED_1 = 10;

function renderIconPath(iconType, strokeWidth) {
    const str = typeof iconType === "string" ? iconType.toLowerCase() : "arrow";
    switch (str) {
        case "chevron":
            return (
                <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        case "plus":
            return (
                <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        case "star":
            return (
                <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        case "arrowdiagonal":
        case "arrow-diagonal":
            return (
                <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        case "check":
            return (
                <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        case "arrow":
        default:
            return (
                <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
    }
}

/** Hook to track current body theme mode */
function useThemeDetector() {
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const check = () => setIsLight(document.body.classList.contains("light-mode"));
        check();

        const observer = new MutationObserver(check);
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return isLight;
}

// ---------------------------------------------------------------------------
// Base Starfield Button Component
// ---------------------------------------------------------------------------
export function StarfieldButton(props) {
    const isLightMode = useThemeDetector();

    // Portfolio theme color tokens:
    // Dark: primary orange #e07a3f, background #1f1a16, text #fff7ed, border rgba(224, 122, 63, 0.35)
    // Light: primary terracotta #b95a31, background #fffaf3, text #231b16, border rgba(185, 90, 49, 0.35)
    const themePrimary = isLightMode ? "#b95a31" : "#e07a3f";
    const themeFill = isLightMode ? "#fffaf3" : "#1f1a16";
    const themeText = isLightMode ? "#231b16" : "#fff7ed";
    const themeBorder = isLightMode ? "rgba(185, 90, 49, 0.32)" : "rgba(224, 122, 63, 0.35)";

    const {
        label = "Click Here",
        children,
        font = {
            fontSize: "1.5rem",
            textAlign: "center",
            fontFamily: "var(--font-body, 'Manrope', sans-serif)",
            fontWeight: 600,
            letterSpacing: "0.06em",
        },
        showText = true,
        padding = "1.1rem 2.8rem",
        rounded = 100,
        fill: fillProp,
        textColor: textColorProp,
        colors,
        addIcon = false,
        icon = {
            icon: "arrow",
            side: "left",
            size: 18,
            type: "symbol",
            color: isLightMode ? "#231b16" : "#FFFFFF",
            image: "",
            symbol: "→",
            padding: 0,
            rounded: 0,
        },
        gap = 10,
        border: borderProp,
        glow: glowProp,
        stroke: strokeProp,
        pixel: pixelProp,
        link = "",
        href = "",
        transition = { ease: [0.44, 0, 0.56, 1], type: "tween", delay: 0, duration: 0.4 },
        newTab = false,
        target,
        rel,
        type,
        download,
        disabled = false,
        onClick,
        className = "",
        id,
        style,
        ...restProps
    } = props;

    const actualLink = link || href;
    const finalFill = colors?.fill ?? fillProp ?? themeFill;
    const finalTextColor = colors?.textColor ?? textColorProp ?? themeText;

    const border = {
        borderColor: themeBorder,
        borderStyle: "solid",
        borderWidth: 1,
        ...borderProp,
    };

    const glow = {
        size: 14,
        color: themePrimary,
        opacity: 100,
        ...glowProp,
    };

    const stroke = {
        size: 70,
        color: themePrimary,
        count: 1,
        speed: 55,
        movement: "continuous",
        direction: "ccw",
        thickness: 2,
        ...strokeProp,
    };

    const pixel = {
        size: 3.5,
        color: themePrimary,
        density: 50,
        brightness: 100,
        ...pixelProp,
    };

    const { color: glowColor = themePrimary, size: glowSize = 14, opacity: glowOpacity = 100 } = glow;
    const {
        count: lightCountProp = 1,
        color: lightColor = themePrimary,
        size: lightSize = 70,
        thickness: lightThickness = 2,
        speed: speedPct = 55,
        direction = "ccw",
        movement = "continuous",
    } = stroke;

    const speed = 2 * (Math.max(0, Math.min(100, Math.round(speedPct))) / 50);

    const {
        color: pixelColor = themePrimary,
        size: pixelSize = 3.5,
        density: pixelDensity = 50,
        brightness: pixelBrightness = 100,
    } = pixel;

    const {
        type: iconKind = "symbol",
        icon: iconType = "arrow",
        symbol: iconSymbol = "→",
        image: iconImage,
        color: iconColor = finalTextColor,
        size: iconSizeProp = 18,
        padding: iconPaddingProp = 0,
        side: iconSide = "left",
        rounded: iconRounded = 0,
    } = icon;

    const iconSrc = typeof iconImage === "string" ? iconImage : iconImage?.src ? iconImage.src : "";
    const iconMode = iconKind === "image" && iconSrc ? "image" : "symbol";
    const iconPx = Math.max(1, Math.round(iconSizeProp));
    const iconPadPx = Math.max(0, Math.round(iconPaddingProp));
    const hasIcon = addIcon;

    const Tag = actualLink ? "a" : "button";
    const tagProps = {
        "aria-label": showText ? undefined : typeof label === "string" ? label : undefined,
        id,
        disabled,
        onClick,
        ...(actualLink
            ? {
                  href: actualLink,
                  target: target || (newTab ? "_blank" : undefined),
                  rel: rel || (newTab ? "noopener noreferrer" : undefined),
                  download: download || undefined,
              }
            : {
                  type: type || "button",
              }),
        ...restProps,
    };

    const [scope, animate] = useAnimate();
    const buttonRef = useRef(null);
    const trackRef = useRef(null);
    const bandRef = useRef(null);
    const faceRef = useRef(null);
    const innerGlowRef = useRef(null);
    const canvasRef = useRef(null);
    const lightsRef = useRef([]);

    const band = bandWidthsOf(border);
    const bandPadding = `${band.top}px ${band.right}px ${band.bottom}px ${band.left}px`;
    const bandMax = Math.max(band.top, band.right, band.bottom, band.left);

    const glowAlpha = Math.max(0, Math.min(100, glowOpacity)) / 100;
    const glowAlphaRef = useRef(glowAlpha);
    glowAlphaRef.current = glowAlpha;

    const lightCount = Math.max(1, Math.min(12, Math.round(lightCountProp)));
    const lightPx = Math.max(4, Math.round(lightSize));
    const lightThick = Math.max(1, Math.min(MAX_BAND_WIDTH, Math.round(lightThickness)));
    const ringInset = bandMax / 2 - lightThick / 2;

    const glowPx = Math.max(1, Math.round(glowSize));
    const glowRimPx = Math.max(1, Math.round(glowPx * 0.18));
    const glowBlurPx = Math.max(1, Math.round(glowPx * 0.5));

    const geom = useRef({ w: 0, h: 0, radius: 0 });
    useIsoLayoutEffect(() => {
        const el = buttonRef.current;
        if (!el) return;
        const applyRadius = () => {
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            if (!w || !h) return;
            const radius = radiusFromPercent(w, h, rounded);
            geom.current = { w, h, radius };
            el.style.borderRadius = `${radius}px`;
            if (trackRef.current) trackRef.current.style.borderRadius = `${radius}px`;
            if (bandRef.current) bandRef.current.style.borderRadius = `${Math.max(0, radius - ringInset)}px`;
            if (faceRef.current) {
                const inset = (v) => Math.max(0, radius - v);
                const x = [inset(band.left), inset(band.right), inset(band.right), inset(band.left)];
                const y = [inset(band.top), inset(band.top), inset(band.bottom), inset(band.bottom)];
                const innerRadius = `${x.map((v) => `${v}px`).join(" ")} / ${y.map((v) => `${v}px`).join(" ")}`;
                faceRef.current.style.borderRadius = innerRadius;
                if (innerGlowRef.current) innerGlowRef.current.style.borderRadius = innerRadius;
            }
        };
        applyRadius();
        const ro = new ResizeObserver(applyRadius);
        ro.observe(el);
        return () => ro.disconnect();
    }, [rounded, ringInset, band.top, band.right, band.bottom, band.left]);

    const reveal = useRef(0);
    const revealCtrl = useRef(null);
    const tickCtrl = useRef(null);
    const reducedMotion = useReducedMotion();

    const cfg = {
        pixelColor,
        pixelSize,
        pixelDensity,
        pixelBrightness,
        lightCount,
        bandMax,
        ringInset,
        movement,
        direction,
        turnsPerSec: Math.max(0, speed) / SECONDS_AT_SPEED_1,
    };
    const cfgRef = useRef(cfg);
    cfgRef.current = cfg;

    const size = useRef({ w: 1, h: 1, dpr: 1 });
    const city = useRef({
        cols: 0,
        rows: 0,
        dens: -1,
        cells: [],
    });

    const buildCity = (w, h, cell) => {
        const c = Math.max(4, Math.round(cell));
        const cols = Math.max(1, Math.floor(w / c));
        const rows = Math.max(1, Math.floor(h / c));
        const dens = Math.max(0, Math.min(1, cfgRef.current.pixelDensity / 100));
        if (
            cols === city.current.cols &&
            rows === city.current.rows &&
            dens === city.current.dens &&
            city.current.cells.length
        )
            return;
        const offX = (w - cols * c) / 2;
        const offY = (h - rows * c) / 2;
        const cells = [];
        for (let r = 0; r < rows; r++) {
            for (let col = 0; col < cols; col++) {
                const i = r * cols + col;
                const lit = rnd(i, 1) < dens;
                cells.push({
                    cx: offX + col * c + c / 2,
                    cy: offY + r * c + c / 2,
                    base: lit ? 0.5 + rnd(i, 2) * 0.5 : 0.05 + rnd(i, 3) * 0.18,
                    speed: 0.6 + rnd(i, 4) * 2.4,
                    phase: rnd(i, 5) * Math.PI * 2,
                });
            }
        }
        city.current = { cols, rows, dens, cells };
    };

    const draw = (ctx) => {
        const { w, h, dpr } = size.current;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const rv = reveal.current;
        if (rv < 0.001) return;

        const { pixelSize: cell, pixelColor: col } = cfgRef.current;
        const lightMul = Math.max(0, cfgRef.current.pixelBrightness) / 100;
        buildCity(w, h, cell);
        const { cells } = city.current;
        const c = Math.max(4, Math.round(cell));
        const dot = Math.max(1, Math.round(c * 0.62));
        const off = dot / 2;
        const t = performance.now() / 1000;

        const cx = w / 2;
        const cy = h / 2;
        const maxD = Math.hypot(cx, cy) || 1;

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = col;
        for (let k = 0; k < cells.length; k++) {
            const p = cells[k];
            const tw = 0.55 + 0.45 * Math.sin(t * p.speed + p.phase);
            const d = Math.hypot(p.cx - cx, p.cy - cy) / maxD;
            const centerBias = 0.55 + 0.45 * (1 - d);
            let a = p.base * tw * centerBias * rv * lightMul;
            if (a <= 0.002) continue;
            if (a > 1) a = 1;
            ctx.globalAlpha = a;
            ctx.fillRect(p.cx - off, p.cy - off, dot, dot);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    };

    const placeLights = (elapsedSec) => {
        const { w, h, radius } = geom.current;
        if (!w || !h) return;
        const c = cfgRef.current;
        const half = c.bandMax / 2;
        const pw = Math.max(0, w - c.bandMax);
        const ph = Math.max(0, h - c.bandMax);
        const pr = Math.max(0, radius - half);
        const dir = c.direction === "cw" ? 1 : -1;
        const base = elapsedSec * c.turnsPerSec * dir;

        for (let i = 0; i < c.lightCount; i++) {
            const el = lightsRef.current[i];
            if (!el) continue;
            let t = base + i / c.lightCount;
            t = ((t % 1) + 1) % 1;
            const p =
                c.movement === "step"
                    ? pointOnRoundRectAngular(t, pw, ph, pr)
                    : pointOnRoundRect(t, pw, ph, pr);
            el.style.transform = `translate3d(${p.x + half - c.ringInset}px, ${p.y + half - c.ringInset}px, 0)`;
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const face = faceRef.current;
        if (!canvas || !face) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const applySize = (w, h) => {
            if (w <= 0 || h <= 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            size.current = { w, h, dpr };
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
        };

        const ro = new ResizeObserver(() => {
            applySize(face.clientWidth, face.clientHeight);
            placeLights(performance.now() / 1000);
        });
        ro.observe(face);
        applySize(face.clientWidth, face.clientHeight);
        placeLights(performance.now() / 1000);

        if (reducedMotion) {
            reveal.current = 0;
            draw(ctx);
        } else {
            tickCtrl.current = animate(0, 1, {
                duration: 1,
                ease: "linear",
                repeat: Infinity,
                onUpdate: () => {
                    draw(ctx);
                    placeLights(performance.now() / 1000);
                },
            });
        }

        return () => {
            ro.disconnect();
            tickCtrl.current?.stop();
            tickCtrl.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reducedMotion]);

    useIsoLayoutEffect(() => {
        if (innerGlowRef.current) {
            innerGlowRef.current.style.opacity = String(reveal.current * glowAlpha);
        }
    }, [glowAlpha]);

    useIsoLayoutEffect(() => {
        placeLights(performance.now() / 1000);
    }, [lightCount, lightPx, lightThick, movement, direction, rounded, bandMax]);

    useEffect(() => () => revealCtrl.current?.stop(), []);

    const revealOpts = () =>
        reducedMotion ? { duration: 0 } : (transition ?? { duration: 0.35 });

    const animateReveal = (to) => {
        revealCtrl.current?.stop();
        revealCtrl.current = animate(reveal.current, to, {
            ...revealOpts(),
            onUpdate: (v) => {
                reveal.current = v;
                if (innerGlowRef.current) {
                    innerGlowRef.current.style.opacity = String(v * glowAlphaRef.current);
                }
            },
        });
    };

    const scaleTo = (s) => {
        if (buttonRef.current) {
            animate(buttonRef.current, { scale: s }, revealOpts());
        }
    };

    const onEnter = () => {
        animateReveal(1);
    };

    const onLeave = () => {
        animateReveal(0);
        scaleTo(1);
    };

    const lightRGB = parseColor(lightColor);

    const glyph =
        iconMode === "image" ? (
            <img
                src={iconSrc}
                alt=""
                aria-hidden
                draggable={false}
                style={{
                    width: iconPx,
                    height: iconPx,
                    margin: iconPadPx,
                    objectFit: iconRounded > 0 ? "cover" : "contain",
                    borderRadius: radiusFromPercent(iconPx, iconPx, iconRounded),
                    display: "block",
                    flex: "none",
                    pointerEvents: "none",
                }}
            />
        ) : iconMode === "symbol" ? (
            <span
                aria-hidden
                style={{
                    fontSize: iconPx,
                    margin: iconPadPx,
                    lineHeight: 1,
                    color: iconColor,
                    flex: "none",
                    pointerEvents: "none",
                }}
            >
                {iconSymbol}
            </span>
        ) : (
            <svg
                aria-hidden
                width={iconPx}
                height={iconPx}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: iconColor, flex: "none", display: "block" }}
            >
                {renderIconPath(iconType, 2)}
            </svg>
        );

    const buttonContent = children !== undefined ? children : label;

    return (
        <div
            ref={scope}
            className={`starfield-btn-wrapper ${className}`.trim()}
            style={{
                minWidth: 80,
                position: "relative",
                display: "inline-grid",
                placeItems: "stretch",
                overflow: "visible",
                verticalAlign: "middle",
                ...style,
            }}
        >
            <Tag
                {...tagProps}
                ref={buttonRef}
                onPointerEnter={onEnter}
                onPointerLeave={onLeave}
                onPointerDown={() => scaleTo(0.97)}
                onPointerUp={() => scaleTo(1)}
                style={{
                    boxSizing: "border-box",
                    position: "relative",
                    padding: bandPadding,
                    border: "none",
                    background: "transparent",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                    userSelect: "none",
                    textDecoration: "none",
                    overflow: "visible",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                }}
            >
                {/* BORDER */}
                <div
                    ref={trackRef}
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        boxSizing: "border-box",
                        padding: bandPadding,
                        background: borderColorOf(border),
                        zIndex: 0,
                        pointerEvents: "none",
                        ...BAND_MASK,
                    }}
                />

                {/* LIGHT RING */}
                <div
                    ref={bandRef}
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: ringInset,
                        right: ringInset,
                        bottom: ringInset,
                        left: ringInset,
                        boxSizing: "border-box",
                        padding: lightThick,
                        zIndex: 0,
                        pointerEvents: "none",
                        ...BAND_MASK,
                    }}
                >
                    {Array.from({ length: lightCount }, (_, i) => (
                        <div
                            key={i}
                            ref={(el) => {
                                lightsRef.current[i] = el;
                            }}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: lightPx,
                                height: lightPx,
                                marginTop: -lightPx / 2,
                                marginLeft: -lightPx / 2,
                                pointerEvents: "none",
                                background: `radial-gradient(circle, ${lightColor} 0%, ${lightColor} 32%, ${rgba(lightRGB, 0)} 72%)`,
                            }}
                        />
                    ))}
                </div>

                {/* FACE */}
                <span
                    ref={faceRef}
                    style={{
                        position: "relative",
                        zIndex: 1,
                        boxSizing: "border-box",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: (hasIcon || React.Children.count(children) > 0) && showText ? gap : 0,
                        flexDirection: iconSide === "right" ? "row-reverse" : "row",
                        padding,
                        whiteSpace: "nowrap",
                        background: finalFill,
                        boxShadow: `0 0 16px ${rgba(parseColor(themePrimary), isLightMode ? 0.16 : 0.22)}`,
                        overflow: "hidden",
                        transition: "background 0.3s ease, color 0.3s ease",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                        }}
                    />

                    {/* INSIDE GLOW */}
                    <span
                        ref={innerGlowRef}
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 1,
                            border: `${glowRimPx}px solid ${glowColor}`,
                            filter: `blur(${glowBlurPx}px)`,
                            opacity: 0,
                            pointerEvents: "none",
                            maskImage: "linear-gradient(#000 0 0)",
                            maskClip: "border-box",
                            WebkitMaskImage: "linear-gradient(#000 0 0)",
                            WebkitMaskClip: "border-box",
                        }}
                    />

                    {hasIcon && (
                        <span style={{ position: "relative", zIndex: 2 }}>
                            {glyph}
                        </span>
                    )}

                    {showText && (
                        <span
                            style={{
                                position: "relative",
                                zIndex: 2,
                                color: finalTextColor,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.8rem",
                                ...font,
                            }}
                        >
                            {buttonContent}
                        </span>
                    )}
                </span>
            </Tag>
        </div>
    );
}

export default StarfieldButton;
