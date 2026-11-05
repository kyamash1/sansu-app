import type { Rank } from '../scoring'

type Props = {
  rank: Rank | null
  size?: number
  animate?: boolean
  label?: string
}

export function Stamp({ rank, size = 56, animate = false, label }: Props) {
  return (
    <div
      className={`stamp ${rank ? `stamp-${rank}` : 'stamp-empty'} ${animate ? 'stamp-pop' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      title={label}
    >
      {rank ?? ''}
    </div>
  )
}
