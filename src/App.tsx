import { useEffect, useMemo, useState } from "react";
import { ContextPanel } from "./components/ContextPanel";
import { DrawingSidebar } from "./components/DrawingSidebar";
import { DrawingViewer } from "./components/DrawingViewer";
import { RootEntryView } from "./components/RootEntryView";
import { TopControls } from "./components/TopControls";
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
import type { Discipline, Metadata, Polygon, Revision } from "./types/metadata";

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
  const [polygonVisible, setPolygonVisible] = useState(true);
  const [polygonOpacity, setPolygonOpacity] = useState(24);
  const [zoom, setZoom] = useState(35);
  const [primaryImageSize, setPrimaryImageSize] = useState({ width: 0, height: 0 });
  const [referenceImageSize, setReferenceImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const payload = await fetchMetadata();
        const root = getRootDrawing(payload);

        setMetadata(payload);
        setSelectedDrawingId(root?.id ?? null);
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
  const rootChildDrawings = useMemo(
    () => (metadata && rootDrawing ? getChildDrawings(metadata, rootDrawing.id) : []),
    [metadata, rootDrawing],
  );

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
  const isRootSelected = selectedDrawing?.id === rootDrawing?.id;

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

  const activePolygon: Polygon | undefined = useMemo(
    () => primaryRevision?.polygon ?? primaryRegion?.polygon ?? primaryDiscipline?.polygon,
    [primaryDiscipline?.polygon, primaryRegion?.polygon, primaryRevision?.polygon],
  );

  useEffect(() => {
    const relativeTo = primaryTransform.relativeTo;
    if (!relativeTo) {
      setReferenceImageSize({ width: 0, height: 0 });
      return;
    }

    const image = new Image();
    image.onload = () => {
      setReferenceImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      setReferenceImageSize({ width: 0, height: 0 });
    };
    image.src = toImagePath(relativeTo);
  }, [primaryTransform.relativeTo]);

  const polygonCoordinateScale = useMemo(() => {
    if (referenceImageSize.width <= 0 || referenceImageSize.height <= 0) return { x: 1, y: 1 };
    if (primaryImageSize.width <= 0 || primaryImageSize.height <= 0) return { x: 1, y: 1 };

    return {
      x: primaryImageSize.width / referenceImageSize.width,
      y: primaryImageSize.height / referenceImageSize.height,
    };
  }, [primaryImageSize.height, primaryImageSize.width, referenceImageSize.height, referenceImageSize.width]);

  const scaledPolygonPoints = useMemo(() => {
    if (!activePolygon) return "";
    return activePolygon.vertices
      .map(([x, y]) => `${x * polygonCoordinateScale.x},${y * polygonCoordinateScale.y}`)
      .join(" ");
  }, [activePolygon, polygonCoordinateScale.x, polygonCoordinateScale.y]);

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
    return <div className="grid h-screen place-content-center text-lg text-slate-700">메타데이터를 불러오는 중...</div>;
  }

  if (error || !metadata || !selectedDrawing) {
    return (
      <div className="grid h-screen place-content-center text-lg text-red-900">
        불러오기에 실패했습니다: {error ?? "도면 선택 실패"}
      </div>
    );
  }

  return (
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <DrawingSidebar
        drawings={drawings}
        selectedDrawingId={selectedDrawing.id}
        rootDrawing={rootDrawing}
        rootChildDrawings={rootChildDrawings}
        query={query}
        onQueryChange={setQuery}
        onSelectDrawing={(drawingId) => {
          setSelectedDrawingId(drawingId);
          setSelectedRegion("");
          setSelectedRevision("");
          setOverlayEnabled(false);
        }}
      />

      <main className="flex min-h-0 min-w-0 flex-col bg-slate-100 xl:border-r xl:border-slate-300">
        {isRootSelected && rootDrawing ? (
          <RootEntryView
            rootDrawing={rootDrawing}
            childDrawings={rootChildDrawings}
            selectedDrawingId={selectedDrawing.id}
            onSelectDrawing={(drawingId) => {
              setSelectedDrawingId(drawingId);
              setSelectedRegion("");
              setSelectedRevision("");
              setOverlayEnabled(false);
            }}
          />
        ) : (
          <>
            <TopControls
              disciplineNames={disciplineNames}
              selectedDiscipline={selectedDiscipline}
              onDisciplineChange={(discipline) => {
                setSelectedDiscipline(discipline);
                setSelectedRegion("");
                setSelectedRevision("");
              }}
              regionNames={regionNames}
              selectedRegion={selectedRegion}
              onRegionChange={(region) => {
                setSelectedRegion(region);
                setSelectedRevision("");
              }}
              revisions={revisions}
              selectedRevision={selectedRevision}
              onRevisionChange={setSelectedRevision}
              overlayEnabled={overlayEnabled}
              onOverlayEnabledChange={setOverlayEnabled}
              overlayCandidates={overlayCandidates}
              overlayDisciplineName={overlayDisciplineName}
              onOverlayDisciplineChange={setOverlayDisciplineName}
              overlayOpacity={overlayOpacity}
              onOverlayOpacityChange={setOverlayOpacity}
              polygonVisible={polygonVisible}
              onPolygonVisibleChange={setPolygonVisible}
              polygonOpacity={polygonOpacity}
              onPolygonOpacityChange={setPolygonOpacity}
              hasActivePolygon={Boolean(activePolygon)}
              zoom={zoom}
              onZoomChange={setZoom}
            />
        <DrawingViewer
          zoom={zoom}
          onZoomChange={setZoom}
          primaryImage={primaryImage}
          overlayImage={overlayImage}
          overlayStyle={overlayStyle}
              polygonVisible={polygonVisible}
              polygonOpacity={polygonOpacity}
              hasActivePolygon={Boolean(activePolygon)}
              scaledPolygonPoints={scaledPolygonPoints}
              primaryImageSize={primaryImageSize}
              onPrimaryImageLoad={(width, height) => setPrimaryImageSize({ width, height })}
            />
          </>
        )}
      </main>

      <ContextPanel
        breadcrumb={breadcrumb}
        selectedDrawingName={selectedDrawing.name}
        selectedDiscipline={selectedDiscipline}
        primaryRevision={primaryRevision}
        primaryRelativeTo={primaryTransform.relativeTo}
        hasActivePolygon={Boolean(activePolygon)}
        overlayEnabled={overlayEnabled}
        overlayImage={overlayImage}
        overlayDisciplineName={overlayDisciplineName}
        overlayLatestRevisionVersion={overlayLatestRevision?.version}
        overlayTransformCompatible={transformDelta.compatible}
        revisions={revisions}
        onRevisionClick={setSelectedRevision}
      />
    </div>
  );
}

export default App;
