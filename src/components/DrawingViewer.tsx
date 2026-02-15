import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { toImagePath } from "../lib/metadata";

interface ImageSize {
  width: number;
  height: number;
}

interface DrawingViewerProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  primaryImage: string;
  overlayImage: string;
  overlayStyle: CSSProperties;
  polygonVisible: boolean;
  polygonOpacity: number;
  hasActivePolygon: boolean;
  scaledPolygonPoints: string;
  primaryImageSize: ImageSize;
  onPrimaryImageLoad: (width: number, height: number) => void;
}

export function DrawingViewer({
  zoom,
  onZoomChange,
  primaryImage,
  overlayImage,
  overlayStyle,
  polygonVisible,
  polygonOpacity,
  hasActivePolygon,
  scaledPolygonPoints,
  primaryImageSize,
  onPrimaryImageLoad,
}: DrawingViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [shouldAutoCenter, setShouldAutoCenter] = useState(true);

  const getCenteredPan = () => {
    const scale = zoom / 100;
    const contentWidth = primaryImageSize.width * scale;
    const contentHeight = primaryImageSize.height * scale;
    return {
      x: (containerSize.width - contentWidth) / 2,
      y: (containerSize.height - contentHeight) / 2,
    };
  };

  useEffect(() => {
    setDragStart(null);
    setShouldAutoCenter(true);
  }, [primaryImage]);

  useEffect(() => {
    const updateContainerSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  useEffect(() => {
    if (!shouldAutoCenter) return;
    if (containerSize.width <= 0 || containerSize.height <= 0) return;
    if (primaryImageSize.width <= 0 || primaryImageSize.height <= 0) return;
    setPan(getCenteredPan());
    setShouldAutoCenter(false);
  }, [containerSize.height, containerSize.width, primaryImageSize.height, primaryImageSize.width, shouldAutoCenter, zoom]);

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragStart({
      x: event.clientX - pan.x,
      y: event.clientY - pan.y,
    });
  };

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setPan({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });
  };

  const onMouseUp = () => {
    setDragStart(null);
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const currentZoom = zoom;
    const nextZoom = Math.max(20, Math.min(100, currentZoom + (event.deltaY < 0 ? 5 : -5)));
    if (nextZoom === currentZoom) return;

    const containerRect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - containerRect.left;
    const pointerY = event.clientY - containerRect.top;
    const currentScale = currentZoom / 100;
    const nextScale = nextZoom / 100;

    setPan((prev) => {
      const worldX = (pointerX - prev.x) / currentScale;
      const worldY = (pointerY - prev.y) / currentScale;
      return {
        x: pointerX - worldX * nextScale,
        y: pointerY - worldY * nextScale,
      };
    });
    onZoomChange(nextZoom);
  };

  return (
    <section className="min-h-0 flex-1 overflow-hidden p-4">
      <div
        ref={containerRef}
        className={`relative h-full w-full overflow-hidden rounded-md border border-slate-300 bg-slate-200 ${
          dragStart ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <div
          className="absolute left-0 top-0 origin-top-left shadow-[0_20px_30px_rgba(16,33,49,0.15)]"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})` }}
        >
          <img
            className="block max-w-none select-none"
            src={toImagePath(primaryImage)}
            alt={primaryImage}
            onLoad={(event) => onPrimaryImageLoad(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
          />
          {overlayImage && (
            <img
              className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
              src={toImagePath(overlayImage)}
              alt={overlayImage}
              style={overlayStyle}
            />
          )}
          {hasActivePolygon && scaledPolygonPoints && primaryImageSize.width > 0 && primaryImageSize.height > 0 && (
            <svg
              className="pointer-events-none absolute left-0 top-0 max-w-none"
              width={primaryImageSize.width}
              height={primaryImageSize.height}
              viewBox={`0 0 ${primaryImageSize.width} ${primaryImageSize.height}`}
              style={{ display: polygonVisible ? "block" : "none" }}
            >
              <polygon
                points={scaledPolygonPoints}
                fill="#0ea5e9"
                fillOpacity={polygonOpacity / 100}
                stroke="#0369a1"
                strokeWidth={8}
                strokeOpacity={0.9}
              />
            </svg>
          )}
        </div>
      </div>
    </section>
  );
}
