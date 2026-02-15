import { useEffect, useMemo, useState } from "react";
import {
  fetchMetadata,
  getChildDrawings,
  getDisciplineNames,
  getLatestRevision,
  getPrimaryImage,
  getPrimaryTransform,
  getRegion,
  getRevisionByVersion,
  getRevisionCollection,
  getRootDrawing,
  getSortedDrawings,
  getTransformDelta,
  toImagePath,
} from "./lib/metadata";
import type { Discipline, Drawing, Metadata, Revision } from "./types/metadata";

const controlClass =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100";

function App() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedRevision, setSelectedRevision] = useState<string>("");
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [overlayDisciplineName, setOverlayDisciplineName] = useState<string>("");
  const [overlayOpacity, setOverlayOpacity] = useState(55);
  const [zoom, setZoom] = useState(35);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const payload = await fetchMetadata();
        const root = getRootDrawing(payload);
        const children = root ? getChildDrawings(payload, root.id) : [];

        setMetadata(payload);
        setSelectedDrawingId(children[0]?.id ?? root?.id ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const allDrawings = useMemo(() => (metadata ? getSortedDrawings(metadata) : []), [metadata]);

  const rootDrawing = useMemo(() => (metadata ? getRootDrawing(metadata) : undefined), [metadata]);

  const drawings = useMemo(
    () => allDrawings.filter((drawing) => drawing.name.toLowerCase().includes(query.trim().toLowerCase())),
    [allDrawings, query],
  );

  const selectedDrawing = useMemo(
    () =>
      drawings.find((drawing) => drawing.id === selectedDrawingId) ??
      allDrawings.find((drawing) => drawing.id === selectedDrawingId),
    [allDrawings, drawings, selectedDrawingId],
  );

  const disciplineNames = useMemo(() => getDisciplineNames(selectedDrawing), [selectedDrawing]);

  useEffect(() => {
    if (!selectedDrawing) return;
    if (disciplineNames.length === 0) {
      setSelectedDiscipline("");
      return;
    }
    if (!disciplineNames.includes(selectedDiscipline)) {
      setSelectedDiscipline(disciplineNames[0]);
    }
  }, [disciplineNames, selectedDiscipline, selectedDrawing]);

  const primaryDiscipline: Discipline | undefined = useMemo(
    () =>
      selectedDrawing && selectedDiscipline
        ? selectedDrawing.disciplines?.[selectedDiscipline]
        : undefined,
    [selectedDiscipline, selectedDrawing],
  );

  const regionNames = useMemo(
    () => (primaryDiscipline?.regions ? Object.keys(primaryDiscipline.regions) : []),
    [primaryDiscipline],
  );

  useEffect(() => {
    if (regionNames.length === 0) {
      setSelectedRegion("");
      return;
    }
    if (!regionNames.includes(selectedRegion)) {
      setSelectedRegion(regionNames[0]);
    }
  }, [regionNames, selectedRegion]);

  const primaryRegion = useMemo(() => getRegion(primaryDiscipline, selectedRegion), [primaryDiscipline, selectedRegion]);

  const revisions = useMemo(
    () => getRevisionCollection(primaryDiscipline, primaryRegion),
    [primaryDiscipline, primaryRegion],
  );

  useEffect(() => {
    if (revisions.length === 0) {
      setSelectedRevision("");
      return;
    }
    if (selectedRevision && revisions.some((revision) => revision.version === selectedRevision)) {
      return;
    }
    const latest = getLatestRevision(revisions);
    setSelectedRevision(latest?.version ?? revisions[0].version);
  }, [revisions, selectedRevision]);

  const primaryRevision: Revision | undefined = useMemo(
    () => getRevisionByVersion(revisions, selectedRevision) ?? getLatestRevision(revisions),
    [revisions, selectedRevision],
  );

  const primaryImage = useMemo(() => {
    if (!selectedDrawing) return "";
    return getPrimaryImage(selectedDrawing, primaryDiscipline, primaryRevision);
  }, [primaryDiscipline, primaryRevision, selectedDrawing]);

  const primaryTransform = useMemo(
    () => getPrimaryTransform(primaryDiscipline, primaryRevision),
    [primaryDiscipline, primaryRevision],
  );

  const overlayCandidates = useMemo(
    () => disciplineNames.filter((disciplineName) => disciplineName !== selectedDiscipline),
    [disciplineNames, selectedDiscipline],
  );

  useEffect(() => {
    if (overlayCandidates.length === 0) {
      setOverlayDisciplineName("");
      return;
    }
    if (!overlayCandidates.includes(overlayDisciplineName)) {
      setOverlayDisciplineName(overlayCandidates[0]);
    }
  }, [overlayCandidates, overlayDisciplineName]);

  const overlayDiscipline = useMemo(
    () => selectedDrawing?.disciplines?.[overlayDisciplineName],
    [overlayDisciplineName, selectedDrawing],
  );

  const overlayLatestRevision = useMemo(
    () => getLatestRevision(overlayDiscipline?.revisions ?? []),
    [overlayDiscipline],
  );

  const overlayImage = useMemo(() => {
    if (!selectedDrawing || !overlayDiscipline) return "";
    return getPrimaryImage(selectedDrawing, overlayDiscipline, overlayLatestRevision);
  }, [overlayDiscipline, overlayLatestRevision, selectedDrawing]);

  const overlayTransform = useMemo(
    () => getPrimaryTransform(overlayDiscipline, overlayLatestRevision),
    [overlayDiscipline, overlayLatestRevision],
  );

  const transformDelta = useMemo(
    () => getTransformDelta(primaryTransform, overlayTransform),
    [overlayTransform, primaryTransform],
  );

  const overlayStyle = useMemo(() => {
    if (!overlayEnabled) return { display: "none" as const };
    const transform = `translate(${transformDelta.dx}px, ${transformDelta.dy}px) rotate(${transformDelta.rotation}rad) scale(${transformDelta.scale})`;
    return {
      opacity: overlayOpacity / 100,
      transform,
      transformOrigin: "0 0",
      display: "block" as const,
    };
  }, [overlayEnabled, overlayOpacity, transformDelta]);

  const breadcrumb = useMemo(() => {
    const items = [metadata?.project.name ?? "프로젝트"];
    if (selectedDrawing) items.push(selectedDrawing.name);
    if (selectedDiscipline) items.push(selectedDiscipline);
    if (selectedRegion) items.push(selectedRegion);
    if (primaryRevision) items.push(primaryRevision.version);
    return items;
  }, [metadata?.project.name, primaryRevision, selectedDiscipline, selectedDrawing, selectedRegion]);

  if (loading) {
    return <div className="grid min-h-screen place-content-center text-lg text-slate-700">메타데이터를 불러오는 중...</div>;
  }

  if (error || !metadata || !selectedDrawing) {
    return (
      <div className="grid min-h-screen place-content-center text-lg text-red-900">
        불러오기에 실패했습니다: {error ?? "도면 선택 실패"}
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="min-w-0 overflow-auto border-b border-slate-300 bg-slate-50 p-4 xl:border-r xl:border-b-0">
        <h1 className="mb-3 text-lg font-semibold">도면 탐색</h1>
        <input
          className="mb-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="도면 이름 검색"
        />
        <ul className="flex list-none flex-col gap-1.5 p-0">
          {drawings.map((drawing: Drawing) => {
            const selected = drawing.id === selectedDrawing.id;
            const isRoot = rootDrawing?.id === drawing.id;
            return (
              <li key={drawing.id}>
                <button
                  className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-sm ${
                    selected
                      ? "border-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-700"
                      : "border-slate-300 bg-white hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    setSelectedDrawingId(drawing.id);
                    setSelectedRegion("");
                    setSelectedRevision("");
                    setOverlayEnabled(false);
                  }}
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

      <main className="flex min-w-0 flex-col bg-slate-100 xl:border-r xl:border-slate-300">
        <header className="border-b border-slate-300 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              공종
              <select
                className={controlClass}
                disabled={disciplineNames.length === 0}
                value={selectedDiscipline}
                onChange={(event) => {
                  setSelectedDiscipline(event.target.value);
                  setSelectedRegion("");
                  setSelectedRevision("");
                }}
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
                onChange={(event) => {
                  setSelectedRegion(event.target.value);
                  setSelectedRevision("");
                }}
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
                onChange={(event) => setSelectedRevision(event.target.value)}
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
                onChange={(event) => setOverlayEnabled(event.target.checked)}
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
                onChange={(event) => setOverlayDisciplineName(event.target.value)}
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
                onChange={(event) => setOverlayOpacity(Number(event.target.value))}
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
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
          </div>
        </header>

        <section className="min-h-[60vh] flex-1 overflow-auto p-4 xl:min-h-0">
          <div
            className="relative inline-block origin-top-left shadow-[0_20px_30px_rgba(16,33,49,0.15)]"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <img className="block max-w-none select-none" src={toImagePath(primaryImage)} alt={primaryImage} />
            {overlayImage && (
              <img
                className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
                src={toImagePath(overlayImage)}
                alt={overlayImage}
                style={overlayStyle}
              />
            )}
          </div>
        </section>
      </main>

      <aside className="min-w-0 overflow-auto border-t border-slate-300 bg-slate-50 p-4 xl:border-t-0">
        <h2 className="mb-3 text-lg font-semibold">현재 컨텍스트</h2>
        <div className="rounded-md border border-sky-200 bg-sky-50 p-2.5 text-xs">{breadcrumb.join(" / ")}</div>

        <dl className="mt-3 grid grid-cols-[100px_1fr] gap-x-2.5 gap-y-2 text-sm">
          <dt className="text-slate-600">현재 도면</dt>
          <dd className="m-0">{selectedDrawing.name}</dd>
          <dt className="text-slate-600">현재 공종</dt>
          <dd className="m-0">{selectedDiscipline || "-"}</dd>
          <dt className="text-slate-600">현재 리비전</dt>
          <dd className="m-0">{primaryRevision ? `${primaryRevision.version} (${primaryRevision.date})` : "-"}</dd>
          <dt className="text-slate-600">주요 설명</dt>
          <dd className="m-0">{primaryRevision?.description ?? "리비전 정보 없음"}</dd>
          <dt className="text-slate-600">변경점</dt>
          <dd className="m-0">
            {primaryRevision && primaryRevision.changes.length > 0
              ? primaryRevision.changes.join(", ")
              : "초기 설계 또는 변경 없음"}
          </dd>
          <dt className="text-slate-600">기준 정렬</dt>
          <dd className="m-0">{primaryTransform.relativeTo ?? "기준 없음(기본 좌표계)"}</dd>
        </dl>

        {overlayEnabled && overlayImage && (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-100 p-2.5 text-sm">
            <h3 className="mb-1.5 text-sm font-semibold">겹쳐보기 상태</h3>
            <p className="my-1">대상 공종: {overlayDisciplineName}</p>
            <p className="my-1">대상 리비전: {overlayLatestRevision?.version ?? "없음"}</p>
            <p className="my-1">
              정렬 기준:
              {transformDelta.compatible ? " 자동 정렬 적용" : " 기준 이미지 불일치로 기본 오버레이"}
            </p>
          </div>
        )}

        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">리비전 이력</h3>
          <ul className="flex list-none flex-col gap-1.5 p-0">
            {revisions.map((revision) => {
              const isSelected = revision.version === primaryRevision?.version;
              const isLatest = revision.version === getLatestRevision(revisions)?.version;
              return (
                <li key={revision.version}>
                  <button
                    className={`w-full rounded-md border px-2.5 py-2 text-left text-sm ${
                      isSelected
                        ? "border-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-700"
                        : "border-slate-300 bg-white hover:bg-slate-100"
                    }`}
                    type="button"
                    onClick={() => setSelectedRevision(revision.version)}
                  >
                    {revision.version} / {revision.date}
                    {isLatest && " / 최신"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default App;
