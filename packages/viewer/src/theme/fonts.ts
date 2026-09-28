// Latin subsets only (~52 KB total); vite-plugin-singlefile inlines these imports as data: URIs.
import geistSans from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2';
import geistMono from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2';

const face = (family: string, src: string) =>
  `@font-face{font-family:'${family}';font-style:normal;font-weight:100 900;font-display:block;src:url(${src}) format('woff2')}`;

export const fontFaceCss = face('Geist', geistSans) + face('Geist Mono', geistMono);
