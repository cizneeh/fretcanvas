import type { ChordInputErrorKey, ScaleId } from '../libs/model'

export type AppLocale = 'ja' | 'en'

type TranslationValues = Record<string, number | string>

const messages = {
  en: {
    'app.language': 'Language',
    'app.switchToEnglish': 'Switch language to English',
    'app.switchToJapanese': 'Switch language to Japanese',
    'common.clear': 'Clear',
    'common.close': 'Close',
    'context.addBend': 'Add Bend',
    'context.delete': 'Delete',
    'context.deemphasize': 'Remove Emphasis',
    'context.dim': 'Dim',
    'context.emphasize': 'Emphasize',
    'context.removeBend': 'Remove Bend',
    'context.undim': 'Undim',
    'control.absolute': 'Absolute',
    'control.addChordTones': 'Add Chord Tones',
    'control.addNotesWithinExportRangeOnly': 'Add notes within export range only',
    'control.addScaleNotes': 'Add Scale Notes',
    'control.appliedChord': 'Applied Chord',
    'control.apply': 'Apply',
    'control.chord': 'Chord',
    'control.chordNotes': 'Chord Notes',
    'control.customInput': 'Custom Input',
    'control.customInputPlaceholder': 'Cmaj7, Dm7b5, G7#11...',
    'control.interval': 'Interval',
    'control.key': 'Key',
    'control.mode': 'Mode',
    'control.noChordApplied': 'No chord applied',
    'control.noteLabels': 'Note Labels',
    'control.scale': 'Scale',
    'control.selectDiatonicChord': 'Select Diatonic Chord',
    'control.selectDiatonicChordPlaceholder': 'Select diatonic chord',
    'control.selectScale': 'Select scale',
    'control.showExportRangeHighlights': 'Show export range highlights on the fretboard',
    'errors.chord.alteredNotSupported': 'Altered chords are not supported yet.',
    'errors.chord.couldNotParse': 'Could not parse that chord symbol.',
    'errors.chord.empty': 'Enter a chord symbol.',
    'errors.chord.slashNotSupported': 'Slash chords are not supported yet.',
    'export.backgroundOpacity': 'Background Opacity',
    'export.backgroundOpacityAria': 'Export background opacity',
    'export.closePreviewBackdrop': 'Close preview modal backdrop',
    'export.decreaseOpacity': 'Decrease opacity by 1',
    'export.exportAria': 'Export {format}',
    'export.format': 'Format',
    'export.increaseOpacity': 'Increase opacity by 1',
    'export.opacityPercentageAria': 'Background opacity percentage',
    'export.preview': 'Preview',
    'export.previewAlt': 'Export preview',
    'export.previewAltEnlarged': 'Export preview enlarged',
    'export.previewCreateFailed': 'Failed to create preview image',
    'export.previewFailed': 'Preview render failed',
    'export.range': 'Export Range',
    'export.rangeMulti': 'Frets {start} - {end}',
    'export.rangeSingle': 'Fret {start}',
    'export.settings': 'Export Settings',
    'export.showTitle': 'Show scale/chord name in export image',
    'export.startHandle': 'Drag start fret',
    'export.endHandle': 'Drag end fret',
    'export.title.scale': '{note} {scaleName} Scale',
    'export.viewFullSize': 'Click to view full size',
    'legend.chordTone': 'Chord Tone',
    'legend.nonChordTone': 'Outside',
    'legend.nonScaleTone': 'Outside',
    'legend.root': 'Root',
    'legend.scaleTone': 'Scale Tone',
    'legend.tension': 'Tension',
    'scale.major': 'Major',
    'scale.naturalMinor': 'Natural Minor',
    'scale.pentatonicMajor': 'Pentatonic Major',
    'scale.pentatonicMinor': 'Pentatonic Minor',
  },
  ja: {
    'app.language': '言語',
    'app.switchToEnglish': '言語を英語に切り替え',
    'app.switchToJapanese': '言語を日本語に切り替え',
    'common.clear': 'クリア',
    'common.close': '閉じる',
    'context.addBend': 'ベンドを追加',
    'context.delete': '削除',
    'context.deemphasize': '強調表示を解除',
    'context.dim': '薄く表示',
    'context.emphasize': '強調表示',
    'context.removeBend': 'ベンドを削除',
    'context.undim': '薄い表示を解除',
    'control.absolute': '音名',
    'control.addChordTones': 'コードトーンを追加',
    'control.addNotesWithinExportRangeOnly': 'エクスポート範囲内だけに音を追加',
    'control.addScaleNotes': 'スケール音を追加',
    'control.appliedChord': '適用中のコード',
    'control.apply': '適用',
    'control.chord': 'コード',
    'control.chordNotes': '構成音',
    'control.customInput': '手動入力',
    'control.customInputPlaceholder': 'Cmaj7, Dm7b5, G7#11...',
    'control.interval': '度数',
    'control.key': 'キー',
    'control.mode': 'モード',
    'control.noChordApplied': 'コード未選択',
    'control.noteLabels': '表示',
    'control.scale': 'スケール',
    'control.selectDiatonicChord': 'ダイアトニックコード',
    'control.selectDiatonicChordPlaceholder': 'ダイアトニックコードを選択',
    'control.selectScale': 'スケールを選択',
    'control.showExportRangeHighlights': 'エクスポート範囲のハイライトを指板上に表示',
    'errors.chord.alteredNotSupported': 'オルタードコードにはまだ対応していません。',
    'errors.chord.couldNotParse': 'そのコードシンボルは解析できませんでした。',
    'errors.chord.empty': 'コードシンボルを入力してください。',
    'errors.chord.slashNotSupported': 'オンコードはまだ対応していません。',
    'export.backgroundOpacity': '背景の不透明度',
    'export.backgroundOpacityAria': 'エクスポート背景の不透明度',
    'export.closePreviewBackdrop': 'プレビューモーダルを閉じる',
    'export.decreaseOpacity': '不透明度を1下げる',
    'export.exportAria': '{format}を書き出す',
    'export.format': '形式',
    'export.increaseOpacity': '不透明度を1上げる',
    'export.opacityPercentageAria': '背景不透明度のパーセント',
    'export.preview': 'プレビュー',
    'export.previewAlt': 'エクスポートプレビュー',
    'export.previewAltEnlarged': '拡大したエクスポートプレビュー',
    'export.previewCreateFailed': 'プレビュー画像を作成できませんでした。',
    'export.previewFailed': 'プレビューの描画に失敗しました。',
    'export.range': 'エクスポート範囲',
    'export.rangeMulti': '{start} - {end}フレット',
    'export.rangeSingle': '{start}フレット',
    'export.settings': 'エクスポート設定',
    'export.showTitle': '書き出し画像にスケール / コード名を表示',
    'export.startHandle': '開始フレットをドラッグ',
    'export.endHandle': '終了フレットをドラッグ',
    'export.title.scale': '{note} {scaleName}スケール',
    'export.viewFullSize': 'クリックで拡大表示',
    'legend.chordTone': 'コードトーン',
    'legend.nonChordTone': 'コード外',
    'legend.nonScaleTone': 'スケール外',
    'legend.root': 'ルート',
    'legend.scaleTone': 'スケール内',
    'legend.tension': 'テンション',
    'scale.major': 'メジャー',
    'scale.naturalMinor': 'ナチュラルマイナー',
    'scale.pentatonicMajor': 'メジャーペンタトニック',
    'scale.pentatonicMinor': 'マイナーペンタトニック',
  },
} as const

export type TranslationKey = keyof (typeof messages)['en']

const chordInputErrorMessageKeys: Record<ChordInputErrorKey, TranslationKey> = {
  alteredNotSupported: 'errors.chord.alteredNotSupported',
  couldNotParse: 'errors.chord.couldNotParse',
  empty: 'errors.chord.empty',
  slashNotSupported: 'errors.chord.slashNotSupported',
}

const scaleMessageKeys: Record<ScaleId, TranslationKey> = {
  major: 'scale.major',
  naturalMinor: 'scale.naturalMinor',
  pentatonicMajor: 'scale.pentatonicMajor',
  pentatonicMinor: 'scale.pentatonicMinor',
}

const formatMessage = (message: string, values: TranslationValues | undefined): string => {
  if (values === undefined) {
    return message
  }

  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value))
  }, message)
}

export const translate = (
  locale: AppLocale,
  key: TranslationKey,
  values?: TranslationValues,
): string => formatMessage(messages[locale][key], values)

export const getDefaultLocale = (): AppLocale => {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

export const getScaleLabel = (locale: AppLocale, scaleId: ScaleId): string =>
  translate(locale, scaleMessageKeys[scaleId])

export const getScaleExportTitle = (
  locale: AppLocale,
  noteLabel: string,
  scaleId: ScaleId,
): string =>
  translate(locale, 'export.title.scale', {
    note: noteLabel,
    scaleName: getScaleLabel(locale, scaleId),
  })

export const getChordInputErrorMessage = (
  locale: AppLocale,
  errorKey: ChordInputErrorKey,
): string => translate(locale, chordInputErrorMessageKeys[errorKey])
