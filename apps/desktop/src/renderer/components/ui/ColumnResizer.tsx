/**
 * ColumnResizer — a vertical drag handle that lets the user adjust the
 * width of the column to its left (pane layouts where the next sibling
 * expands to fill remaining space).
 *
 * Designed for issue #119: users on large displays wanted to be able to
 * expand the folder sidebar and prompt list beyond their fixed defaults.
 *
 * Behavior:
 *   - Pointer down on the handle starts a drag.
 *   - While dragging, every pointer move calls `onResize(nextWidth)` with
 *     the clamped new width. Callers can throttle / persist as they like.
 *   - Double-clicking the handle resets to the provided default width so
 *     users can recover from an accidental drag without opening settings.
 *   - The handle also supports keyboard (ArrowLeft / ArrowRight) for
 *     accessibility; each keystroke moves 16 px, Shift+Arrow moves 64 px.
 *
 * The component renders a thin, invisible hit target with a visible hover /
 * active bar so it blends with the surrounding layout until the user
 * actually reaches for it.
 *
 * ColumnResizer —— 竖向拖拽手柄，用于调整左侧列的宽度（右侧填充剩余空间的
 * 面板布局）。对应 issue #119：大屏用户希望把文件夹/Prompt 列表拉宽。
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface ColumnResizerProps {
  /**
   * Current width of the column being resized, in px. Used as the drag
   * starting point and for keyboard / double-click fallbacks.
   * 正在拖拽列的当前宽度（px），作为拖拽起点和键盘/双击回退的基准。
   */
  currentWidth: number;
  /** Lower bound in px. Drag will clamp to this. */
  min: number;
  /** Upper bound in px. Drag will clamp to this. */
  max: number;
  /** Width to return to on double-click. */
  defaultWidth: number;
  /** Called with the new width (already clamped). */
  onResize: (nextWidth: number) => void;
  /** Accessible label. */
  ariaLabel: string;
  /** Optional className to merge onto the root handle. */
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function ColumnResizer({
  currentWidth,
  min,
  max,
  defaultWidth,
  onResize,
  ariaLabel,
  className = "",
}: ColumnResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    startX: number;
    startWidth: number;
    pointerId: number;
  } | null>(null);

  // While dragging, temporarily disable text selection on the whole document
  // so the user can move the pointer freely.
  // 拖拽期间临时禁用全局文本选择，让鼠标可以自由移动。
  useEffect(() => {
    if (!isDragging) return;
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [isDragging]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Only primary button (left-click / primary touch). Ignore
      // middle-click, right-click, and auxiliary buttons.
      // 只响应主按键，忽略中键、右键等。
      if (event.button !== 0) return;
      event.preventDefault();
      dragStateRef.current = {
        startX: event.clientX,
        startWidth: currentWidth,
        pointerId: event.pointerId,
      };
      // setPointerCapture is not always implemented in test environments
      // (jsdom). Guard so missing support doesn't abort the drag.
      // 某些测试环境（jsdom）没有 setPointerCapture，做一次守卫避免直接抛错。
      try {
        (event.currentTarget as HTMLDivElement).setPointerCapture?.(
          event.pointerId,
        );
      } catch {
        // noop — pointer capture is a nice-to-have for sticky drags
      }
      setIsDragging(true);
    },
    [currentWidth],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) return;
      const delta = event.clientX - state.startX;
      const next = clamp(state.startWidth + delta, min, max);
      onResize(next);
    },
    [max, min, onResize],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = dragStateRef.current;
      if (!state) return;
      try {
        (event.currentTarget as HTMLDivElement).releasePointerCapture?.(
          state.pointerId,
        );
      } catch {
        // releasePointerCapture can throw if capture was already lost (for
        // example the pointer was canceled). That's fine — we just want to
        // reset local state.
        // releasePointerCapture 在已经失去捕获时会抛错，这里忽略即可。
      }
      dragStateRef.current = null;
      setIsDragging(false);
    },
    [],
  );

  const handleDoubleClick = useCallback(() => {
    onResize(clamp(defaultWidth, min, max));
  }, [defaultWidth, max, min, onResize]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? 64 : 16;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onResize(clamp(currentWidth - step, min, max));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onResize(clamp(currentWidth + step, min, max));
      } else if (
        event.key === "Home" ||
        event.key === "End" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        // Reset on Home / End / Enter / Space for keyboard-only users.
        // 让仅键盘用户也能通过 Home/End/Enter/空格 复位。
        event.preventDefault();
        onResize(clamp(defaultWidth, min, max));
      }
    },
    [currentWidth, defaultWidth, max, min, onResize],
  );

  const style: CSSProperties = {
    // Hit-testable wider than the visible bar so the handle is easy to grab.
    // 可点击区域比可见条宽，便于瞄准。
    width: 8,
    flexShrink: 0,
    touchAction: "none",
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(currentWidth)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      style={style}
      className={`group relative flex cursor-col-resize items-stretch outline-none focus-visible:bg-primary/20 ${className}`}
      data-testid="column-resizer"
    >
      <div
        className={`pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-150 ${
          isDragging
            ? "bg-primary/80"
            : "bg-border/40 group-hover:bg-primary/60"
        }`}
        aria-hidden
      />
    </div>
  );
}
