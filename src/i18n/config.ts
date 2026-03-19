import type { ChordInputErrorKey, InstrumentPresetId, ScaleId } from '../libs/musicCore'

export type AppLocale = 'ja' | 'en'

type TranslationValues = Record<string, number | string>

export const LOCALE_COOKIE_KEY = 'fretcanvas_locale'

declare global {
  interface Window {
    __FRET_CANVAS_LOCALE__?: AppLocale
  }
}

const messages = {
  en: {
    'app.language': 'Language',
    'app.switchToEnglish': 'Switch language to English',
    'app.switchToJapanese': 'Switch language to Japanese',
    'common.cancel': 'Cancel',
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
    'control.combined': 'Both',
    'control.addChordTones': 'Add Chord Tones',
    'control.addNotesWithinExportRangeOnly': 'Add notes within export range only',
    'control.addScaleNotes': 'Add Scale Notes',
    'control.appliedChord': 'Applied Chord',
    'control.apply': 'Apply',
    'control.chord': 'Chord',
    'control.chordNotes': 'Chord Notes',
    'control.examples': 'Examples',
    'control.manualInput': 'Manual Input',
    'control.manualInputPlaceholder': 'Cmaj7, Dm7(11), Cmaj7/B...',
    'control.manualInputTooltip':
      'Examples:\nCmaj7\nDm7(11)\nDm7,13\nDm7(9,13)\nCmaj7/B\nG7alt\nBdim7\nDsus4\nC7#9b13',
    'control.interval': 'Interval',
    'control.key': 'Key',
    'control.mode': 'Mode',
    'control.modesGroup': 'Modes',
    'control.noChordApplied': 'No chord applied',
    'control.noteLabels': 'Note Labels',
    'control.scale': 'Scale',
    'control.scaleNotes': 'Scale Notes',
    'control.selectDiatonicChord': 'Select Diatonic Chord',
    'control.selectDiatonicChordPlaceholder': 'Select diatonic chord',
    'control.selectScale': 'Select scale',
    'control.showExportRangeHighlights': 'Show export range highlights on the fretboard',
    'errors.chord.couldNotParse': 'Could not parse that chord.',
    'errors.chord.empty': 'Enter a chord symbol.',
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
    'export.showStringLabels': 'Include string note labels',
    'export.showTitle': 'Include scale/chord name',
    'export.startHandle': 'Drag start fret',
    'export.endHandle': 'Drag end fret',
    'export.title.scale': '{note} {scaleName} Scale',
    'export.viewFullSize': 'Click to view full size',
    'footer.feedbackPrefix': 'Bug reports or feedback? Feel free to DM me on ',
    'footer.feedbackSuffix': '.',
    'legend.chordTone': 'Chord Tone',
    'legend.nonChordTone': 'Outside',
    'legend.nonScaleTone': 'Outside',
    'legend.root': 'Root',
    'legend.scaleTone': 'Scale Tone',
    'legend.tension': 'Tension',
    'nav.about': 'About',
    'nav.app': 'App',
    'scale.major': 'Major',
    'scale.naturalMinor': 'Natural Minor',
    'scale.pentatonicMajor': 'Pentatonic Major',
    'scale.pentatonicMinor': 'Pentatonic Minor',
    'scale.harmonicMinor': 'Harmonic Minor',
    'scale.melodicMinor': 'Melodic Minor',
    'scale.blues': 'Blues',
    'scale.ionian': 'Ionian',
    'scale.dorian': 'Dorian',
    'scale.phrygian': 'Phrygian',
    'scale.lydian': 'Lydian',
    'scale.mixolydian': 'Mixolydian',
    'scale.aeolian': 'Aeolian',
    'scale.locrian': 'Locrian',
    'support.aria': 'Support Fret Canvas on Ko-fi',
    'support.tooltipBody':
      'Donations are of course optional, but your support helps keep Fret Canvas alive.',
    'tuning.apply': 'Apply',
    'tuning.applyWarning':
      'Changing the tuning will clear the currently displayed notes on the fretboard. Continue?',
    'tuning.addString': 'Add string',
    'tuning.cancel': 'Cancel',
    'tuning.custom': 'Custom',
    'tuning.deletePreset': 'Delete preset',
    'tuning.deletePresetConfirm': 'Delete preset "{name}"?',
    'tuning.note': 'Note',
    'tuning.openMenu': 'Open tuning settings',
    'tuning.preset': 'Preset',
    'tuning.presetName': 'Preset name',
    'tuning.presetNamePlaceholder': 'My tuning',
    'tuning.removeString': 'Remove string',
    'tuning.saveAsPreset': 'Save as preset',
    'tuning.savePreset': 'Save preset',
    'tuning.savedPresets': 'Saved presets',
    'tuning.stringCount': 'String Count',
    'tuning.title': 'Tuning',
    'tuning.preset.bass4': '4-String Bass',
    'tuning.preset.bass5': '5-String Bass',
    'tuning.preset.bass6': '6-String Bass',
    'tuning.preset.guitar7': '7-String Guitar',
    'tuning.preset.guitarHalfStepDown6': 'Guitar Half-Step Down Tuning',
    'tuning.preset.guitarStandard6': 'Guitar Standard Tuning',
    'tuning.preset.ukuleleC': 'Ukulele C Tuning',
  },
  ja: {
    'app.language': '言語',
    'app.switchToEnglish': '言語を英語に切り替え',
    'app.switchToJapanese': '言語を日本語に切り替え',
    'common.cancel': 'キャンセル',
    'common.clear': 'クリア',
    'common.close': '閉じる',
    'context.addBend': 'チョーキングを追加',
    'context.delete': '削除',
    'context.deemphasize': '強調表示を解除',
    'context.dim': '薄く表示',
    'context.emphasize': '強調表示',
    'context.removeBend': 'チョーキングを削除',
    'context.undim': '薄い表示を解除',
    'control.absolute': '音名',
    'control.combined': '両方',
    'control.addChordTones': 'コードトーンを追加',
    'control.addNotesWithinExportRangeOnly': 'エクスポート範囲内だけに音を追加',
    'control.addScaleNotes': 'スケール音を追加',
    'control.appliedChord': '適用中のコード',
    'control.apply': '適用',
    'control.chord': 'コード',
    'control.chordNotes': '構成音',
    'control.examples': '例',
    'control.manualInput': '手動入力',
    'control.manualInputPlaceholder': 'Cmaj7, Dm7(11), Cmaj7/B...',
    'control.manualInputTooltip':
      '例:\nCmaj7\nDm7(11)\nDm7,13\nDm7(9,13)\nCmaj7/B\nG7alt\nBdim7\nDsus4\nC7#9b13',
    'control.interval': '度数',
    'control.key': 'キー',
    'control.mode': 'モード',
    'control.modesGroup': 'モード',
    'control.noChordApplied': 'コード未選択',
    'control.noteLabels': '表示',
    'control.scale': 'スケール',
    'control.scaleNotes': '構成音',
    'control.selectDiatonicChord': 'ダイアトニックコード',
    'control.selectDiatonicChordPlaceholder': 'ダイアトニックコードを選択',
    'control.selectScale': 'スケールを選択',
    'control.showExportRangeHighlights': 'エクスポート範囲のハイライトを指板上に表示',
    'errors.chord.couldNotParse': 'コードが解析できませんでした。',
    'errors.chord.empty': 'コードシンボルを入力してください。',
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
    'export.showStringLabels': '各弦の音名を含める',
    'export.showTitle': 'スケール / コード名を含める',
    'export.startHandle': '開始フレットをドラッグ',
    'export.endHandle': '終了フレットをドラッグ',
    'export.title.scale': '{note} {scaleName}スケール',
    'export.viewFullSize': 'クリックで拡大表示',
    'footer.feedbackPrefix': 'バグ報告や feedback は ',
    'footer.feedbackSuffix': ' の DM まで。',
    'legend.chordTone': 'コードトーン',
    'legend.nonChordTone': 'コード外',
    'legend.nonScaleTone': 'スケール外',
    'legend.root': 'ルート',
    'legend.scaleTone': 'スケール内',
    'legend.tension': 'テンション',
    'nav.about': 'About',
    'nav.app': 'アプリ',
    'scale.major': 'メジャー',
    'scale.naturalMinor': 'ナチュラルマイナー',
    'scale.pentatonicMajor': 'メジャーペンタトニック',
    'scale.pentatonicMinor': 'マイナーペンタトニック',
    'scale.harmonicMinor': 'ハーモニックマイナー',
    'scale.melodicMinor': 'メロディックマイナー',
    'scale.blues': 'ブルース',
    'scale.ionian': 'イオニアン',
    'scale.dorian': 'ドリアン',
    'scale.phrygian': 'フリジアン',
    'scale.lydian': 'リディアン',
    'scale.mixolydian': 'ミクソリディアン',
    'scale.aeolian': 'エオリアン',
    'scale.locrian': 'ロクリアン',
    'support.aria': 'Ko-fi で Fret Canvas を支援',
    'support.tooltipBody': 'Ko-fi 経由で投げ銭を送れます。',
    'tuning.apply': '適用',
    'tuning.applyWarning':
      'チューニングを変更すると現在指板上に表示されている音は失われます。続けますか？',
    'tuning.addString': '弦を追加',
    'tuning.cancel': 'キャンセル',
    'tuning.custom': 'カスタム',
    'tuning.deletePreset': 'プリセットを削除',
    'tuning.deletePresetConfirm': 'プリセット「{name}」を削除しますか？',
    'tuning.note': '音名',
    'tuning.openMenu': 'チューニング設定を開く',
    'tuning.preset': 'プリセット',
    'tuning.presetName': 'プリセット名',
    'tuning.presetNamePlaceholder': 'マイチューニング',
    'tuning.removeString': '弦を削除',
    'tuning.saveAsPreset': 'プリセットとして保存',
    'tuning.savePreset': '保存',
    'tuning.savedPresets': '保存済みプリセット',
    'tuning.stringCount': '弦数',
    'tuning.title': 'チューニング',
    'tuning.preset.bass4': '4弦ベース',
    'tuning.preset.bass5': '5弦ベース',
    'tuning.preset.bass6': '6弦ベース',
    'tuning.preset.guitar7': '7弦ギター',
    'tuning.preset.guitarHalfStepDown6': 'ギター 半音下げチューニング',
    'tuning.preset.guitarStandard6': 'ギター 標準チューニング',
    'tuning.preset.ukuleleC': 'ウクレレ C チューニング',
  },
} as const

export type TranslationKey = keyof (typeof messages)['en']

const chordInputErrorMessageKeys: Record<ChordInputErrorKey, TranslationKey> = {
  couldNotParse: 'errors.chord.couldNotParse',
  empty: 'errors.chord.empty',
}

const scaleMessageKeys: Record<ScaleId, TranslationKey> = {
  major: 'scale.major',
  naturalMinor: 'scale.naturalMinor',
  pentatonicMajor: 'scale.pentatonicMajor',
  pentatonicMinor: 'scale.pentatonicMinor',
  harmonicMinor: 'scale.harmonicMinor',
  melodicMinor: 'scale.melodicMinor',
  blues: 'scale.blues',
  ionian: 'scale.ionian',
  dorian: 'scale.dorian',
  phrygian: 'scale.phrygian',
  lydian: 'scale.lydian',
  mixolydian: 'scale.mixolydian',
  aeolian: 'scale.aeolian',
  locrian: 'scale.locrian',
}

const instrumentPresetMessageKeys: Record<InstrumentPresetId, TranslationKey> = {
  guitarStandard6: 'tuning.preset.guitarStandard6',
  guitarHalfStepDown6: 'tuning.preset.guitarHalfStepDown6',
  guitar7: 'tuning.preset.guitar7',
  bass4: 'tuning.preset.bass4',
  bass5: 'tuning.preset.bass5',
  bass6: 'tuning.preset.bass6',
  ukuleleC: 'tuning.preset.ukuleleC',
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
  if (typeof window !== 'undefined') {
    const bootstrapLocale = window.__FRET_CANVAS_LOCALE__
    if (bootstrapLocale === 'ja' || bootstrapLocale === 'en') {
      return bootstrapLocale
    }
  }

  if (typeof navigator === 'undefined') {
    return 'en'
  }

  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

export const persistLocalePreference = (locale: AppLocale) => {
  if (typeof document === 'undefined') {
    return
  }

  // biome-ignore lint/suspicious/noDocumentCookie: locale cookie is required for SSR redirect behavior.
  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
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

export const getInstrumentPresetLabel = (locale: AppLocale, presetId: InstrumentPresetId): string =>
  translate(locale, instrumentPresetMessageKeys[presetId])
