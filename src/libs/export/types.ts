import type { AppLocale } from '../../i18n/config'
import type {
  BendArrow,
  Connection,
  HighlightedNote,
  NoteLabelMode,
  NoteTextMode,
  PitchClass,
  PositionId,
  ScaleId,
  StringInfo,
} from '../musicCore'

export type ExportGraphicInput = {
  locale: AppLocale
  keyPc: PitchClass
  noteLabelMode: NoteLabelMode
  noteTextMode: NoteTextMode
  selectedScale: ScaleId | undefined
  appliedChordSymbol: string | undefined
  strings: StringInfo[]
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Connection[]
  bends: BendArrow[]
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  showExportTitle: boolean
}

export type ExportLayout = {
  start: number
  end: number
  fretCountInRange: number
  exportTitle: string | undefined
  paddingX: number
  paddingY: number
  labelWidth: number
  titleHeight: number
  headerHeight: number
  rowHeight: number
  stringCount: number
  markerHeight: number
  cellWidth: number
  boardHeight: number
  canvasWidth: number
  canvasHeight: number
  boardLeft: number
  boardTop: number
  markerY: number
}
