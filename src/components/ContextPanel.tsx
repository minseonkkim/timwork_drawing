import { getLatestRevision } from "../lib/metadata";
import type { Revision } from "../types/metadata";

interface ContextPanelProps {
  breadcrumb: string[];
  selectedDrawingName: string;
  selectedDiscipline: string;
  primaryRevision?: Revision;
  primaryRelativeTo?: string;
  hasActivePolygon: boolean;
  overlayEnabled: boolean;
  overlayImage: string;
  overlayDisciplineName: string;
  overlayLatestRevisionVersion?: string;
  overlayTransformCompatible: boolean;
  revisions: Revision[];
  onRevisionClick: (version: string) => void;
  onClose: () => void;
}

export function ContextPanel({
  breadcrumb,
  selectedDrawingName,
  selectedDiscipline,
  primaryRevision,
  primaryRelativeTo,
  hasActivePolygon,
  overlayEnabled,
  overlayImage,
  overlayDisciplineName,
  overlayLatestRevisionVersion,
  overlayTransformCompatible,
  revisions,
  onRevisionClick,
  onClose,
}: ContextPanelProps) {
  return (
    <aside className="min-h-0 min-w-0 overflow-auto border-t border-slate-300 bg-slate-50 p-3 xl:border-t-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-base">현재 컨텍스트</h2>
        <button
          type="button"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
          onClick={onClose}
          aria-label="컨텍스트 패널 닫기"
          title="컨텍스트 닫기"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M14.5 4.5V15.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M8.5 6.5L12.5 10L8.5 13.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="rounded-md border border-sky-200 bg-sky-50 p-2 text-xs">
        {breadcrumb.join(" / ")}
      </div>

      <dl className="mt-3 grid grid-cols-[88px_1fr] gap-x-2 gap-y-2 text-sm">
        <dt className="text-slate-600">현재 도면</dt>
        <dd className="m-0">{selectedDrawingName}</dd>
        <dt className="text-slate-600">현재 공종</dt>
        <dd className="m-0">{selectedDiscipline || "-"}</dd>
        <dt className="text-slate-600">현재 리비전</dt>
        <dd className="m-0">
          {primaryRevision
            ? `${primaryRevision.version} (${primaryRevision.date})`
            : "-"}
        </dd>
        <dt className="text-slate-600">주요 설명</dt>
        <dd className="m-0">
          {primaryRevision?.description ?? "리비전 정보 없음"}
        </dd>
        <dt className="text-slate-600">변경점</dt>
        <dd className="m-0">
          {primaryRevision && primaryRevision.changes.length > 0
            ? primaryRevision.changes.join(", ")
            : "초기 설계 또는 변경 없음"}
        </dd>
        <dt className="text-slate-600">기준 정렬</dt>
        <dd className="m-0">{primaryRelativeTo ?? "기준 없음(기본 좌표계)"}</dd>
        <dt className="text-slate-600">영역 표시</dt>
        <dd className="m-0">
          {hasActivePolygon ? "표시 중(좌표 스케일 보정)" : "해당 없음"}
        </dd>
      </dl>

      {overlayEnabled && overlayImage && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-100 p-2 text-sm">
          <h3 className="mb-1 text-sm font-semibold">겹쳐보기 상태</h3>
          <p className="my-1">대상 공종: {overlayDisciplineName}</p>
          <p className="my-1">
            대상 리비전: {overlayLatestRevisionVersion ?? "없음"}
          </p>
          <p className="my-1">
            정렬 기준:{" "}
            {overlayTransformCompatible
              ? "자동 정렬 적용"
              : "기준 이미지 불일치"}
          </p>
        </div>
      )}

      <div className="mt-3">
        <h3 className="mb-2 text-sm font-semibold">리비전 이력</h3>
        <ul className="flex list-none flex-col gap-1.5 p-0">
          {revisions.map((revision) => {
            const isSelected = revision.version === primaryRevision?.version;
            const isLatest =
              revision.version === getLatestRevision(revisions)?.version;
            return (
              <li key={revision.version}>
                <button
                  className={`w-full rounded-md border px-2 py-1.5 text-left text-xs ${
                    isSelected
                      ? "border-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-700"
                      : "border-slate-300 bg-white hover:bg-slate-100"
                  } cursor-pointer`}
                  type="button"
                  onClick={() => onRevisionClick(revision.version)}
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
  );
}
