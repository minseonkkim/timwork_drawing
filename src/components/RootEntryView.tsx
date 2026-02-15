import { useState } from "react";
import { toImagePath } from "../lib/metadata";
import type { Drawing } from "../types/metadata";

interface RootEntryViewProps {
  rootDrawing: Drawing;
  childDrawings: Drawing[];
  selectedDrawingId: string;
  onSelectDrawing: (drawingId: string) => void;
}

export function RootEntryView({
  rootDrawing,
  childDrawings,
  selectedDrawingId,
  onSelectDrawing,
}: RootEntryViewProps) {
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

  return (
    <section className="flex min-h-[60vh] flex-1 flex-col gap-3 overflow-auto p-4 xl:min-h-0">
      <div className="rounded-md border border-slate-300 bg-slate-50 p-3">
        <h2 className="text-base font-semibold">배치도에서 공간 선택</h2>
        <p className="mt-1 text-sm text-slate-600">
          건물 영역을 클릭하면 해당 도면으로 진입합니다.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-md border border-slate-300 bg-white shadow-[0_20px_30px_rgba(16,33,49,0.15)]">
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
                    className="cursor-pointer transition-opacity hover:fill-opacity-60"
                    fill={isSelected ? "#0284c7" : "#0ea5e9"}
                    fillOpacity={isSelected ? 0.52 : 0.34}
                    stroke="#ffffff"
                    strokeOpacity={0.95}
                    strokeWidth={14}
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
                    strokeWidth={6}
                    strokeDasharray={isSelected ? "20 10" : "12 8"}
                    onClick={() => onSelectDrawing(drawing.id)}
                  />
                  <g pointerEvents="none">
                    <rect
                      x={center.x - 72}
                      y={center.y - 18}
                      width={144}
                      height={30}
                      rx={8}
                      fill="rgba(15,23,42,0.78)"
                    />
                    <text
                      x={center.x}
                      y={center.y + 2}
                      fill="#f8fafc"
                      fontSize="20"
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
      <div className="flex flex-wrap gap-2">
        {visibleDrawings.map((drawing) => {
          const isSelected = drawing.id === selectedDrawingId;
          return (
            <button
              key={drawing.id}
              type="button"
              onClick={() => onSelectDrawing(drawing.id)}
              className={`rounded-md border px-2 py-1 text-xs ${
                isSelected
                  ? "border-sky-700 bg-sky-100 text-sky-900"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              } cursor-pointer`}
            >
              {drawing.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
