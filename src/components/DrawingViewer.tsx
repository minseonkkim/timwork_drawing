import type { CSSProperties } from "react";
import { toImagePath } from "../lib/metadata";

interface ImageSize {
  width: number;
  height: number;
}

interface DrawingViewerProps {
  zoom: number;
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
  return (
    <section className="min-h-[60vh] flex-1 overflow-auto p-4 xl:min-h-0">
      <div
        className="relative inline-block origin-top-left shadow-[0_20px_30px_rgba(16,33,49,0.15)]"
        style={{ transform: `scale(${zoom / 100})` }}
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
    </section>
  );
}
