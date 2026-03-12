import { Profiler, type ReactNode } from 'react'
import { handleReactProfilerRender, isRenderProfilerEnabled } from '../../libs/renderProfiler'

type RenderProfilerProps = {
  id: string
  children: ReactNode
}

export const RenderProfiler = ({ id, children }: RenderProfilerProps) => {
  if (!isRenderProfilerEnabled()) {
    return children
  }

  return (
    <Profiler id={id} onRender={handleReactProfilerRender}>
      {children}
    </Profiler>
  )
}
