import { FRET_NUMBERS, MARKER_FRETS } from '../../libs/model'

type FretMarkerRowProps = {
  onSelectClosestHandleToFret: (fret: number) => void
}

export const FretMarkerRow = ({ onSelectClosestHandleToFret }: FretMarkerRowProps) => {
  return (
    <>
      <div />
      {FRET_NUMBERS.map((fret) => {
        const isDoubleDot = fret === 12 || fret === 24
        const showMarker = MARKER_FRETS.includes(fret)

        return (
          <button
            key={`marker-${fret}`}
            type="button"
            className="relative flex h-6 items-center justify-center pt-2 focus-visible:outline-none"
            data-testid={`fret-selector-${fret}`}
            onClick={() => {
              onSelectClosestHandleToFret(fret)
            }}
          >
            {showMarker ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                {isDoubleDot ? <span className="h-2 w-2 rounded-full bg-slate-500" /> : undefined}
              </span>
            ) : undefined}
          </button>
        )
      })}
    </>
  )
}
