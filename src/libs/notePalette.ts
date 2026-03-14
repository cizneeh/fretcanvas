import type { NoteVisualRole } from './musicCore'

export type ThemeMode = 'dark' | 'light'

type WebNotePalette = {
  highlightedToneClass: string
  previewToneClass: string
}

type PngNotePalette = {
  fill: string
  stroke: string
}

type NotePaletteByRole = Record<
  NoteVisualRole,
  {
    web: WebNotePalette
    png: PngNotePalette
  }
>

const darkNotePalette: NotePaletteByRole = {
  root: {
    web: {
      highlightedToneClass: 'border-rose-200/80 bg-rose-700/80 text-white',
      previewToneClass: 'border-rose-200/65 bg-rose-500/35 text-rose-50',
    },
    png: {
      fill: 'rgba(190, 24, 93, 0.8)',
      stroke: 'rgba(254, 205, 211, 0.8)',
    },
  },
  default: {
    web: {
      highlightedToneClass: 'border-cyan-100/70 bg-cyan-600/80 text-white',
      previewToneClass: 'border-cyan-100/65 bg-cyan-500/35 text-cyan-50',
    },
    png: {
      fill: 'rgba(8, 145, 178, 0.8)',
      stroke: 'rgba(207, 250, 254, 0.7)',
    },
  },
  tension: {
    web: {
      highlightedToneClass: 'border-green-200/75 bg-green-600/80 text-white',
      previewToneClass: 'border-green-200/65 bg-green-500/35 text-green-50',
    },
    png: {
      fill: 'rgba(22, 163, 74, 0.82)',
      stroke: 'rgba(220, 252, 231, 0.78)',
    },
  },
  outOfKey: {
    web: {
      highlightedToneClass: 'border-orange-200/75 bg-orange-500/80 text-white',
      previewToneClass: 'border-orange-200/65 bg-orange-400/35 text-orange-50',
    },
    png: {
      fill: 'rgba(249, 115, 22, 0.8)',
      stroke: 'rgba(254, 215, 170, 0.75)',
    },
  },
}

const lightNotePalette: NotePaletteByRole = darkNotePalette

const notePalettesByTheme: Record<ThemeMode, NotePaletteByRole> = {
  dark: darkNotePalette,
  light: lightNotePalette,
}

export const getNotePalette = (visualRole: NoteVisualRole, themeMode: ThemeMode = 'dark') =>
  notePalettesByTheme[themeMode][visualRole]
