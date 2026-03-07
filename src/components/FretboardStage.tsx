import type { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
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
      <div className="min-w-max rounded-md border border-slate-700 bg-black p-3">
        <FretboardGrid
          previewConnection={previewConnection}
          {...gridProps}
          rangeTrack={<ExportRangeTrack {...rangeTrackProps} />}
        />
      </div>
    </div>
  )
}
