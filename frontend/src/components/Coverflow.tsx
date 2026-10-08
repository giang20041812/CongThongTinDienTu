import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/media';
import { TONES, toneStyle, type Tone } from '../lib/tones';
import { CaretLeft, CaretRight, Pause, Play } from './icons';
import { cx } from './ui';

interface CoverflowProps<T> {
  items: T[];
  itemKey: (item: T) => string;
  /** Short name of an item, for the slide and dot labels. */
  itemLabel: (item: T) => string;
  /** Colour of the item's dot (default: school blue). */
  itemTone?: (item: T, index: number) => Tone;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Accessible name of the carousel. */
  label: string;
  /** Autoplay interval in ms; 0 turns autoplay off. */
  interval?: number;
  className?: string;
}

/** A seamless loop needs the centre card, a faded card each side and a hidden slot each side to wrap through. */
const MIN_SLOTS = 5;
/** How many cards a swipe may pull the deck before it stops following the finger. */
const MAX_DRAG = 1.4;
/** Share of a card a swipe must cover to change card. */
const SWIPE_THRESHOLD = 0.15;
/** Spacing of the single steps a dot click is played as (in step with the `data-jumping` speed in index.css). */
const JUMP_STEP_MS = 320;

/** Circular distance of `slot` from the centre slot, in (-slots/2, slots/2]. */
const offsetOf = (slot: number, center: number, slots: number) => {
  const ahead = (((slot - center) % slots) + slots) % slots;
  return ahead > slots / 2 ? ahead - slots : ahead;
};

const controlClass =
  'grid shrink-0 place-items-center rounded-full border border-line bg-white shadow-sm transition-all duration-300 ease-(--ease-soft) hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:text-white active:scale-95';

/**
 * Looping 3D "coverflow" for touch-sized screens: the centre card in front, the cards either side
 * turned towards it and faded. Swipe (the deck follows the finger), tap a side card, or use the
 * arrows, dots and ←/→ keys. Autoplay shows its progress in the active dot and pauses on hover,
 * keyboard focus, touch, off-screen, in hidden tabs and for visitors who prefer reduced motion.
 */
export function Coverflow<T>({ items, itemKey, itemLabel, itemTone, renderItem, label, interval = 5500, className }: CoverflowProps<T>) {
  const count = items.length;
  // Short lists are repeated so the wrap-around always happens out of sight.
  const slots = count * Math.ceil(MIN_SLOTS / Math.max(count, 1));
  const [active, setActive] = useState(0);
  const center = slots > 0 ? active % slots : 0;
  const [dragging, setDragging] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; dx: number; step: number; horizontal: boolean | null } | null>(null);
  const swallowClick = useRef(false);
  const refocus = useRef(false);
  const jumpTimer = useRef(0);
  // Centre slot of the previous render: slides that wrapped around since then jump instead of sweeping across.
  const previousCenter = useRef(center);
  useLayoutEffect(() => {
    previousCenter.current = center;
    // Keyboard users keep their place: focus follows the card that became the centre.
    if (refocus.current) {
      refocus.current = false;
      trackRef.current?.querySelector<HTMLElement>('[data-pos="center"] a[href]')?.focus({ preventScroll: true });
    }
  });

  const autoplay = interval > 0 && count > 1 && !reducedMotion;
  const running = autoplay && !stopped && !hovered && !focused && !dragging && inView && pageVisible;

  const move = useCallback((delta: number) => setActive((value) => (((value + delta) % slots) + slots) % slots), [slots]);
  const next = useCallback(() => move(1), [move]);

  const stopJump = () => {
    window.clearTimeout(jumpTimer.current);
    setJumping(false);
  };
  const userMove = (delta: number) => {
    stopJump();
    move(delta);
  };

  /** Brings item `index` to the centre the short way round, one card at a time so no visible card wraps. */
  const goTo = (index: number) => {
    stopJump();
    let delta = (((index - (center % count)) % count) + count) % count;
    if (delta > count / 2) delta -= count;
    if (Math.abs(delta) <= 1) {
      if (delta) move(delta);
      return;
    }
    setJumping(true);
    const stepOnce = (left: number) => {
      move(Math.sign(left));
      const rest = left - Math.sign(left);
      jumpTimer.current = window.setTimeout(() => (rest ? stepOnce(rest) : setJumping(false)), JUMP_STEP_MS);
    };
    stepOnce(delta);
  };

  useEffect(() => () => window.clearTimeout(jumpTimer.current), []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const setDrag = (cards: number) => trackRef.current?.style.setProperty('--drag', String(cards));

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swallowClick.current = false;
    const track = event.currentTarget;
    const card = track.querySelector<HTMLElement>('[data-pos="center"]');
    const ratio = parseFloat(getComputedStyle(track).getPropertyValue('--cf-step')) / 100 || 0.75;
    // On screen one card is a little shorter than --cf-step: the side cards sit further back.
    const step = Math.max(80, (card?.offsetWidth ?? track.offsetWidth * 0.7) * ratio * 0.85);
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, step, horizontal: null };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.horizontal === null) {
      if (Math.hypot(dx, dy) < 8) return;
      current.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!current.horizontal) {
        // Vertical: the visitor is scrolling the page.
        gesture.current = null;
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      stopJump();
      setDragging(true);
    }
    current.dx = dx;
    setDrag(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, -dx / current.step)));
  };

  const endGesture = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    if (!current.horizontal) return;
    // Releasing a swipe must not also open the card under the pointer.
    swallowClick.current = true;
    const pulled = -current.dx / current.step;
    setDrag(0);
    setDragging(false);
    if (!cancelled && Math.abs(pulled) > SWIPE_THRESHOLD) move(Math.sign(pulled));
  };

  if (count === 0) return null;
  if (count === 1) return <div className={cx('mx-auto w-full max-w-md', className)}>{renderItem(items[0], 0)}</div>;

  const currentIndex = center % count;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={label}
      className={cx('relative', className)}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setHovered(false)}
      onFocus={(event) => event.target.matches(':focus-visible') && setFocused(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        refocus.current = !!trackRef.current?.contains(event.target as Node);
        userMove(event.key === 'ArrowRight' ? 1 : -1);
      }}
    >
      {/* Bleeds to the screen edges so the side cards peek in from beyond the page margins. */}
      <div className="-mx-4 overflow-x-clip px-4 pb-6 pt-2 sm:-mx-6 sm:px-6">
        <div
          ref={trackRef}
          className="coverflow select-none"
          data-dragging={dragging || undefined}
          data-jumping={jumping || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => endGesture(event, false)}
          onPointerCancel={(event) => endGesture(event, true)}
          onClickCapture={(event) => {
            if (!swallowClick.current) return;
            swallowClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
          onDragStart={(event) => event.preventDefault()}
        >
          {Array.from({ length: slots }, (_, slot) => {
            const index = slot % count;
            const item = items[index];
            const offset = offsetOf(slot, center, slots);
            const distance = Math.abs(offset);
            const wrapped = Math.abs(offset - offsetOf(slot, previousCenter.current, slots)) > 1;
            return (
              <div
                key={`${itemKey(item)}~${slot}`}
                className="coverflow-slide"
                data-pos={distance === 0 ? 'center' : distance === 1 ? 'side' : 'far'}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${count}: ${itemLabel(item)}`}
                aria-hidden={distance > 0 || undefined}
                style={{ '--o': offset, transition: wrapped ? 'none' : undefined } as React.CSSProperties}
              >
                <div inert={distance > 0} className="h-full">
                  {renderItem(item, index)}
                </div>
                {distance === 1 && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => userMove(offset)}
                    className="absolute inset-0 z-10 cursor-pointer"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        <button type="button" onClick={() => userMove(-1)} aria-label="Thẻ trước" className={cx(controlClass, 'size-10 text-brand-700')}>
          <CaretLeft className="size-4" />
        </button>
        <div role="tablist" aria-label={`Chọn trong ${label.toLowerCase()}`} className="flex items-center">
          {items.map((item, index) => {
            const selected = index === currentIndex;
            return (
              <button
                key={itemKey(item)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`${index + 1}: ${itemLabel(item)}`}
                onClick={() => goTo(index)}
                style={toneStyle(itemTone?.(item, index) ?? TONES[0])}
                className="group/dot grid h-8 place-items-center px-[3px]"
              >
                <span
                  className={cx(
                    'relative block h-2.5 overflow-hidden rounded-full transition-all duration-500 ease-(--ease-soft)',
                    selected ? 'w-9 bg-(--tone)/20' : 'w-2.5 bg-(--tone)/45 group-hover/dot:bg-(--tone)/75',
                  )}
                >
                  {selected && (
                    <span
                      key={center}
                      className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-(--tone) to-(--tone-2)"
                      style={{
                        animation: autoplay ? `slide-progress ${interval}ms linear forwards` : undefined,
                        animationPlayState: running ? 'running' : 'paused',
                        transform: autoplay ? undefined : 'scaleX(1)',
                      }}
                      onAnimationEnd={next}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => userMove(1)} aria-label="Thẻ tiếp theo" className={cx(controlClass, 'size-10 text-brand-700')}>
          <CaretRight className="size-4" />
        </button>
        {autoplay && (
          <button
            type="button"
            onClick={() => setStopped((value) => !value)}
            aria-label={stopped ? 'Tiếp tục tự chuyển thẻ' : 'Tạm dừng tự chuyển thẻ'}
            className={cx(controlClass, 'size-8 text-brand-500')}
          >
            {stopped ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        )}
      </div>
    </section>
  );
}
