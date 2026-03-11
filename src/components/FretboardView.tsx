import { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
import { FretboardStage } from './FretboardStage'
import { NoteContextMenu } from './NoteContextMenu'

export const FretboardView = () => {
  const interaction = useFretboardInteractionState()

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/30">
      <FretboardStage
        previewConnection={interaction.previewConnection}
        gridProps={interaction.gridProps}
        rangeTrackProps={interaction.rangeTrackProps}
      />

      {interaction.noteContextMenu !== undefined ? (
        <div
          ref={(node) => {
            interaction.contextMenuRef.current = node ?? undefined
          }}
        >
          <NoteContextMenu
            positionId={interaction.noteContextMenu.positionId}
            x={interaction.noteContextMenu.x}
            y={interaction.noteContextMenu.y}
            onToggleBend={interaction.handleToggleBendFromContextMenu}
            onClose={() => {
              interaction.setNoteContextMenu(undefined)
            }}
          />
        </div>
      ) : undefined}
    </section>
  )
}
