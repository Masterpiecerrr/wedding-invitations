/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module 'virtual:wedding-assets' {
  const assets: {
    photos: Record<string, { src: string; w: number; h: number }>;
    music: string;
    lunar: string;
    fonts: { brush: string; song: string };
  };
  export default assets;
}

declare module 'subset-font' {
  export default function subsetFont(buf: Buffer, text: string, opts?: { targetFormat?: 'woff2' | 'woff' | 'truetype'; variationAxes?: Record<string, number> }): Promise<Buffer>;
}
