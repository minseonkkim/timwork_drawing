export type Vertex = [number, number];

export interface ImageTransform {
  relativeTo?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface Polygon {
  vertices: Vertex[];
  polygonTransform: ImageTransform;
}

export interface Revision {
  version: string;
  image: string;
  date: string;
  description: string;
  changes: string[];
  imageTransform?: ImageTransform;
  polygon?: Polygon;
}

export interface Region {
  polygon?: Polygon;
  revisions: Revision[];
}

export interface Discipline {
  imageTransform?: ImageTransform;
  image?: string;
  polygon?: Polygon;
  regions?: Record<string, Region>;
  revisions: Revision[];
}

export interface DrawingPosition {
  vertices: Vertex[];
  imageTransform: ImageTransform;
}

export interface Drawing {
  id: string;
  name: string;
  image: string;
  parent: string | null;
  position: DrawingPosition | null;
  disciplines?: Record<string, Discipline>;
}

export interface Metadata {
  project: {
    name: string;
    unit: string;
  };
  disciplines: Array<{ name: string }>;
  drawings: Record<string, Drawing>;
}
