import type {
  Discipline,
  Drawing,
  ImageTransform,
  Metadata,
  Region,
  Revision,
} from "../types/metadata";

const FALLBACK_TRANSFORM: ImageTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

const parseDate = (value: string) => {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
};

export const fetchMetadata = async (): Promise<Metadata> => {
  const response = await fetch("/data/metadata.json");
  if (!response.ok) {
    throw new Error(`metadata load failed: ${response.status}`);
  }
  return (await response.json()) as Metadata;
};

export const toImagePath = (filename: string) =>
  `/data/drawings/${encodeURIComponent(filename)}`;

export const getSortedDrawings = (metadata: Metadata): Drawing[] =>
  Object.values(metadata.drawings).sort(
    (a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10),
  );

export const getRootDrawing = (metadata: Metadata): Drawing | undefined =>
  getSortedDrawings(metadata).find((drawing) => drawing.parent === null);

export const getChildDrawings = (metadata: Metadata, parentId: string) =>
  getSortedDrawings(metadata).filter((drawing) => drawing.parent === parentId);

export const getDisciplineNames = (drawing?: Drawing): string[] =>
  drawing?.disciplines ? Object.keys(drawing.disciplines) : [];

export const getLatestRevision = (revisions: Revision[]): Revision | undefined =>
  [...revisions].sort((a, b) => parseDate(b.date) - parseDate(a.date))[0];

export const getPrimaryImage = (
  drawing: Drawing,
  discipline?: Discipline,
  revision?: Revision,
) => revision?.image ?? discipline?.image ?? drawing.image;

export const getPrimaryTransform = (
  discipline?: Discipline,
  revision?: Revision,
): ImageTransform => revision?.imageTransform ?? discipline?.imageTransform ?? FALLBACK_TRANSFORM;

export const getRegion = (
  discipline?: Discipline,
  regionName?: string,
): Region | undefined => {
  if (!discipline?.regions || !regionName) return undefined;
  return discipline.regions[regionName];
};

export const getRevisionCollection = (
  discipline?: Discipline,
  region?: Region,
): Revision[] => {
  if (region) return region.revisions;
  return discipline?.revisions ?? [];
};

export const getRevisionByVersion = (
  revisions: Revision[],
  version?: string,
) => revisions.find((revision) => revision.version === version);

export interface TransformDelta {
  dx: number;
  dy: number;
  scale: number;
  rotation: number;
  compatible: boolean;
}

export const getTransformDelta = (
  baseTransform: ImageTransform,
  overlayTransform: ImageTransform,
): TransformDelta => {
  const baseReference = baseTransform.relativeTo ?? null;
  const overlayReference = overlayTransform.relativeTo ?? null;
  const compatible = baseReference === overlayReference;

  if (!compatible) {
    return {
      dx: 0,
      dy: 0,
      scale: 1,
      rotation: 0,
      compatible: false,
    };
  }

  return {
    dx: overlayTransform.x - baseTransform.x,
    dy: overlayTransform.y - baseTransform.y,
    scale: overlayTransform.scale / baseTransform.scale,
    rotation: overlayTransform.rotation - baseTransform.rotation,
    compatible: true,
  };
};
