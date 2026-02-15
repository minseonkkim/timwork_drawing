import { useState } from "react";
import { toImagePath } from "../lib/metadata";
import type { Drawing } from "../types/metadata";

interface SiteMapNavigatorProps {
  rootDrawing: Drawing;
  childDrawings: Drawing[];
  selectedDrawingId: string;
  onSelectDrawing: (drawingId: string) => void;
}

export function SiteMapNavigator({
  rootDrawing,
  childDrawings,
  selectedDrawingId,
  onSelectDrawing,
}: SiteMapNavigatorProps) {
  const [rootImageSize, setRootImageSize] = useState({ width: 0, height: 0 });

  if (!rootDrawing.image || childDrawings.length === 0) return null;

  return (
    <section className="mb-4">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">배치도 탐색</h2>
      <div className="relative overflow-hidden rounded-md border border-slate-300 bg-white">
        <img
          className="block h-auto w-full select-none"
          src={toImagePath(rootDrawing.image)}
          alt={rootDrawing.name}
          onLoad={(event) =>
            setRootImageSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
        />
        {rootImageSize.width > 0 && rootImageSize.height > 0 && (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${rootImageSize.width} ${rootImageSize.height}`}
          >
            {childDrawings
              .filter((drawing) => drawing.position?.vertices?.length)
              .map((drawing) => {
                const points = drawing.position!.vertices.map(([x, y]) => `${x},${y}`).join(" ");
                const isSelected = drawing.id === selectedDrawingId;
                return (
                  <polygon
                    key={drawing.id}
                    points={points}
                    className="cursor-pointer transition-opacity"
                    fill={isSelected ? "#0ea5e9" : "#38bdf8"}
                    fillOpacity={isSelected ? 0.45 : 0.2}
                    stroke={isSelected ? "#075985" : "#0369a1"}
                    strokeWidth={isSelected ? 18 : 12}
                    onClick={() => onSelectDrawing(drawing.id)}
                  >
                    <title>{drawing.name}</title>
                  </polygon>
                );
              })}
          </svg>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">영역 클릭 시 해당 도면으로 이동합니다.</p>
    </section>
  );
}
