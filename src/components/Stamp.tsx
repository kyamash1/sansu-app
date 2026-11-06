import type { Rank } from '../scoring'
import type { StageAnimal } from '../stages'

type Props = {
  rank: Rank | null
  size?: number
  animate?: boolean
  label?: string
  /** 指定すると、その動物のステッカーにランクの文字をつけたスタンプになる */
  animal?: StageAnimal
}

export function Stamp({ rank, size = 56, animate = false, label, animal }: Props) {
  if (animal && rank) {
    return (
      <div
        className={`animal-stamp animal-stamp-${rank} ${animate ? 'animal-stamp-pop' : ''}`}
        style={{ width: size, height: size }}
        title={label ? `${animal.name}・${label}` : animal.name}
      >
        <img src={animal.image} alt={animal.name} draggable={false} />
        <span className="animal-stamp-rank">{rank}</span>
      </div>
    )
  }

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
