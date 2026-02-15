import type { Drawing } from "../types/metadata";
import { SiteMapNavigator } from "./SiteMapNavigator";

interface DrawingSidebarProps {
  drawings: Drawing[];
  selectedDrawingId: string;
  rootDrawing?: Drawing;
  rootChildDrawings: Drawing[];
  query: string;
  onQueryChange: (query: string) => void;
  onSelectDrawing: (drawingId: string) => void;
}

export function DrawingSidebar({
  drawings,
  selectedDrawingId,
  rootDrawing,
  rootChildDrawings,
  query,
  onQueryChange,
  onSelectDrawing,
}: DrawingSidebarProps) {
  return (
    <aside className="min-h-0 min-w-0 overflow-auto border-b border-slate-300 bg-slate-50 p-4 xl:border-r xl:border-b-0">
      <h1 className="mb-3 text-lg font-semibold">도면 탐색</h1>
      {rootDrawing && (
        <SiteMapNavigator
          rootDrawing={rootDrawing}
          childDrawings={rootChildDrawings}
          selectedDrawingId={selectedDrawingId}
          onSelectDrawing={onSelectDrawing}
        />
      )}
      <input
        className="mb-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="도면 이름 검색"
      />
      <ul className="flex list-none flex-col gap-1.5 p-0">
        {drawings.map((drawing) => {
          const selected = drawing.id === selectedDrawingId;
          const isRoot = rootDrawing?.id === drawing.id;
          return (
            <li key={drawing.id}>
              <button
                className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-sm ${
                  selected
                    ? "border-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-700"
                    : "border-slate-300 bg-white hover:bg-slate-100"
                } cursor-pointer`}
                onClick={() => onSelectDrawing(drawing.id)}
                type="button"
              >
                <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[11px] text-slate-500">{drawing.id}</span>
                <span className="truncate">{drawing.name}</span>
                {isRoot && <span className="ml-auto text-[11px] text-sky-800">루트</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
