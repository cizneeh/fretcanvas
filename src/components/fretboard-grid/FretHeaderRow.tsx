import { FRET_NUMBERS } from '../../libs/model'

export const FretHeaderRow = () => {
  return (
    <>
      <div />
      {FRET_NUMBERS.map((fret) => (
        <div
          key={`fret-header-${fret}`}
          className="flex h-8 items-center justify-center pb-1 text-sm text-slate-300"
        >
          {fret}
        </div>
      ))}
    </>
  )
}
