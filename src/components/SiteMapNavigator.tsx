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
  const visibleDrawings = childDrawings.filter(
    (drawing) => drawing.position?.vertices?.length,
  );

  const getCentroid = (drawing: Drawing) => {
    const vertices = drawing.position?.vertices ?? [];
    const total = vertices.length || 1;
    const { x, y } = vertices.reduce(
      (acc, [vx, vy]) => ({ x: acc.x + vx, y: acc.y + vy }),
      { x: 0, y: 0 },
    );
    return { x: x / total, y: y / total };
  };

  if (!rootDrawing.image || visibleDrawings.length === 0) return null;

  return (
    <section className="mb-4">
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
            {visibleDrawings.map((drawing) => {
              const points = drawing
                .position!.vertices.map(([x, y]) => `${x},${y}`)
                .join(" ");
              const center = getCentroid(drawing);
              const isSelected = drawing.id === selectedDrawingId;
              return (
                <g key={drawing.id}>
                  <polygon
                    points={points}
                    className="cursor-pointer transition-opacity hover:fill-opacity-55"
                    fill={isSelected ? "#0284c7" : "#0ea5e9"}
                    fillOpacity={isSelected ? 0.5 : 0.32}
                    stroke="#ffffff"
                    strokeOpacity={0.95}
                    strokeWidth={12}
                    onClick={() => onSelectDrawing(drawing.id)}
                  >
                    <title>{drawing.name}</title>
                  </polygon>
                  <polygon
                    points={points}
                    className="cursor-pointer"
                    fill="none"
                    stroke={isSelected ? "#082f49" : "#0c4a6e"}
                    strokeOpacity={0.95}
                    strokeWidth={5}
                    onClick={() => onSelectDrawing(drawing.id)}
                  />
                  <g pointerEvents="none">
                    <rect
                      x={center.x - 58}
                      y={center.y - 14}
                      width={116}
                      height={24}
                      rx={6}
                      fill="rgba(15,23,42,0.74)"
                    />
                    <text
                      x={center.x}
                      y={center.y - 1}
                      fill="#f8fafc"
                      fontSize="16"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {drawing.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        영역 클릭 시 해당 도면으로 이동합니다.
      </p>
    </section>
  );
}
