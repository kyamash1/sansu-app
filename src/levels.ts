export type Problem = {
  a: number
  b: number
  answer: number
}

export type Level = {
  id: string
  name: string
  description: string
  /** 1問あたりの目標秒数。これ以内ならスピード面で S 判定 */
  targetSecPerProblem: number
  /** 出題候補となる (a, b) の組み合わせ */
  pairs: [number, number][]
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function pairsWhere(pred: (a: number, b: number) => boolean): [number, number][] {
  const result: [number, number][] = []
  for (const a of DIGITS) {
    for (const b of DIGITS) {
      if (pred(a, b)) result.push([a, b])
    }
  }
  return result
}

export const LEVELS: Level[] = [
  {
    id: 'lv1',
    name: 'こたえ 5まで',
    description: 'こたえが 5までの たしざん',
    targetSecPerProblem: 2.0,
    pairs: pairsWhere((a, b) => a + b <= 5),
  },
  {
    id: 'lv2',
    name: 'こたえ 10になる',
    description: 'こたえが 10になる たしざん',
    targetSecPerProblem: 2.5,
    pairs: pairsWhere((a, b) => a + b === 10),
  },
  {
    id: 'lv3',
    name: 'こたえ 10まで',
    description: 'こたえが 10までの たしざん',
    targetSecPerProblem: 3.0,
    pairs: pairsWhere((a, b) => a + b <= 10),
  },
]

export function findLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 候補をシャッフルしたものを繰り返し並べ、同じ問題が連続しないように count 問つくる */
export function generateProblems(level: Level, count: number): Problem[] {
  const out: Problem[] = []
  while (out.length < count) {
    const batch = shuffle(level.pairs)
    const last = out[out.length - 1]
    if (last && batch.length > 1 && batch[0][0] === last.a && batch[0][1] === last.b) {
      ;[batch[0], batch[1]] = [batch[1], batch[0]]
    }
    for (const [a, b] of batch) {
      if (out.length >= count) break
      out.push({ a, b, answer: a + b })
    }
  }
  return out
}
