import type { Revision } from "../types/metadata";

const controlClass =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100";

interface TopControlsProps {
  disciplineNames: string[];
  selectedDiscipline: string;
  onDisciplineChange: (discipline: string) => void;
  regionNames: string[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  revisions: Revision[];
  selectedRevision: string;
  onRevisionChange: (revision: string) => void;
  overlayEnabled: boolean;
  onOverlayEnabledChange: (enabled: boolean) => void;
  overlayCandidates: string[];
  overlayDisciplineName: string;
  onOverlayDisciplineChange: (discipline: string) => void;
  overlayOpacity: number;
  onOverlayOpacityChange: (value: number) => void;
  polygonVisible: boolean;
  onPolygonVisibleChange: (visible: boolean) => void;
  polygonOpacity: number;
  onPolygonOpacityChange: (value: number) => void;
  hasActivePolygon: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function TopControls({
  disciplineNames,
  selectedDiscipline,
  onDisciplineChange,
  regionNames,
  selectedRegion,
  onRegionChange,
  revisions,
  selectedRevision,
  onRevisionChange,
  overlayEnabled,
  onOverlayEnabledChange,
  overlayCandidates,
  overlayDisciplineName,
  onOverlayDisciplineChange,
  overlayOpacity,
  onOverlayOpacityChange,
  polygonVisible,
  onPolygonVisibleChange,
  polygonOpacity,
  onPolygonOpacityChange,
  hasActivePolygon,
  zoom,
  onZoomChange,
}: TopControlsProps) {
  return (
    <header className="border-b border-slate-300 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          공종
          <select
            className={controlClass}
            disabled={disciplineNames.length === 0}
            value={selectedDiscipline}
            onChange={(event) => onDisciplineChange(event.target.value)}
          >
            {disciplineNames.map((disciplineName) => (
              <option key={disciplineName} value={disciplineName}>
                {disciplineName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          영역
          <select
            className={controlClass}
            disabled={regionNames.length === 0}
            value={selectedRegion}
            onChange={(event) => onRegionChange(event.target.value)}
          >
            {regionNames.length === 0 && <option value="">없음</option>}
            {regionNames.map((regionName) => (
              <option key={regionName} value={regionName}>
                {regionName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          리비전
          <select
            className={controlClass}
            disabled={revisions.length === 0}
            value={selectedRevision}
            onChange={(event) => onRevisionChange(event.target.value)}
          >
            {revisions.map((revision) => (
              <option key={revision.version} value={revision.version}>
                {revision.version} ({revision.date})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 border-r border-slate-300 pr-3 text-sm">
          <input
            type="checkbox"
            checked={overlayEnabled}
            onChange={(event) => onOverlayEnabledChange(event.target.checked)}
            disabled={overlayCandidates.length === 0}
          />
          공종 겹쳐보기
        </label>

        <label className="flex items-center gap-2 text-sm">
          오버레이 공종
          <select
            className={controlClass}
            disabled={!overlayEnabled || overlayCandidates.length === 0}
            value={overlayDisciplineName}
            onChange={(event) => onOverlayDisciplineChange(event.target.value)}
          >
            {overlayCandidates.map((disciplineName) => (
              <option key={disciplineName} value={disciplineName}>
                {disciplineName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          오버레이 투명도 {overlayOpacity}%
          <input
            className="w-32"
            type="range"
            min={10}
            max={100}
            value={overlayOpacity}
            disabled={!overlayEnabled}
            onChange={(event) => onOverlayOpacityChange(Number(event.target.value))}
          />
        </label>

        <label className="flex items-center gap-2 border-l border-slate-300 pl-3 text-sm">
          <input
            type="checkbox"
            checked={polygonVisible}
            onChange={(event) => onPolygonVisibleChange(event.target.checked)}
            disabled={!hasActivePolygon}
          />
          영역 표시
        </label>

        <label className="flex items-center gap-2 text-sm">
          영역 투명도 {polygonOpacity}%
          <input
            className="w-24"
            type="range"
            min={10}
            max={60}
            value={polygonOpacity}
            disabled={!polygonVisible || !hasActivePolygon}
            onChange={(event) => onPolygonOpacityChange(Number(event.target.value))}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          줌 {zoom}%
          <input
            className="w-32"
            type="range"
            min={20}
            max={100}
            value={zoom}
            onChange={(event) => onZoomChange(Number(event.target.value))}
          />
        </label>
      </div>
    </header>
  );
}
