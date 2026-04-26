import type { ReactNode } from 'react'

interface RuneDividerProps {
  children?: ReactNode
}

export function RuneDivider({ children = '✦  ✦  ✦' }: RuneDividerProps) {
  return <div className="qf-rune-div">{children}</div>
}

export default RuneDivider
