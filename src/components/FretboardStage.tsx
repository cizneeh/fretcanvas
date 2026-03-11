import type { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
import { FRET_NUMBERS } from '../libs/model'
import { ExportRangeTrack } from './ExportRangeTrack'
import { FretboardGrid } from './FretboardGrid'

type FretboardStageProps = Pick<
  ReturnType<typeof useFretboardInteractionState>,
  'previewConnection' | 'gridProps' | 'rangeTrackProps'
>

export const FretboardStage = ({
  previewConnection,
  gridProps,
  rangeTrackProps,
}: FretboardStageProps) => {
  return (
    <div className="overflow-x-auto p-4">
      <div className="min-w-max space-y-3">
        <div className="rounded-md border border-zinc-700 bg-black p-3">
          <FretboardGrid previewConnection={previewConnection} {...gridProps} />
        </div>

        <div className="rounded-md border border-zinc-600 bg-zinc-800/80 p-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-300">
            Export Range
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `2rem repeat(${FRET_NUMBERS.length}, minmax(3.5rem, 3.5rem))`,
            }}
          >
            <ExportRangeTrack {...rangeTrackProps} />
          </div>
        </div>
      </div>
    </div>
  )
}
