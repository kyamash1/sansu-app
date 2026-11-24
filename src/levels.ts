export type Operator = '+' | '-'

export type Problem = {
  a: number
  b: number
  /** 3つのかずのたしざん用 */
  c?: number
  operator: Operator
  answer: number
}

export type Level = {
  id: string
  name: string
  description: string
  /** 1問あたりの目標秒数。これ以内ならスピード面で S 判定 */
  targetSecPerProblem: number
  operator: Operator
  /** 出題候補となる (a, b)。triples がある場合は使わない */
  pairs: [number, number][]
  /** 3つのかずのたしざん用。あればこちらを優先 */
  triples?: [number, number, number][]
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

/** ひきざん（くりさがりなし）: 被減数1〜10、減数1〜9 */
function subPairsNoBorrow(): [number, number][] {
  const result: [number, number][] = []
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 9; b++) {
      if (a >= b) result.push([a, b])
    }
  }
  return result
}

/** くりさがり: 被減数11〜18で、一の位が減数より小さい */
function subPairsBorrow(): [number, number][] {
  const result: [number, number][] = []
  for (let a = 11; a <= 18; a++) {
    const ones = a % 10
    for (let b = 1; b <= 9; b++) {
      if (ones < b) result.push([a, b])
    }
  }
  return result
}

/** 3つのかずのたしざん（合計20まで） */
function addTriples(maxSum = 20): [number, number, number][] {
  const result: [number, number, number][] = []
  for (const a of DIGITS) {
    for (const b of DIGITS) {
      for (const c of DIGITS) {
        if (a + b + c <= maxSum) result.push([a, b, c])
      }
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
    operator: '+',
    pairs: pairsWhere((a, b) => a + b <= 5),
  },
  {
    id: 'lv2',
    name: 'こたえ 10になる',
    description: 'こたえが 10になる たしざん',
    targetSecPerProblem: 2.5,
    operator: '+',
    pairs: pairsWhere((a, b) => a + b === 10),
  },
  {
    id: 'lv3',
    name: 'こたえ 10まで',
    description: 'こたえが 10までの たしざん',
    targetSecPerProblem: 3.0,
    operator: '+',
    pairs: pairsWhere((a, b) => a + b <= 10),
  },
  {
    id: 'lv4',
    name: 'くりあがり たしざん',
    description: 'くりあがりのある たしざん',
    targetSecPerProblem: 3.5,
    operator: '+',
    pairs: pairsWhere((a, b) => a + b >= 11),
  },
  {
    id: 'lv5',
    name: 'たしざん ぜんぶ',
    description: '1けたどうしの たしざん ぜんぶ',
    targetSecPerProblem: 3.0,
    operator: '+',
    pairs: pairsWhere(() => true),
  },
  {
    id: 'lv6',
    name: 'ひきざん 10まで',
    description: 'くりさがりのない ひきざん',
    targetSecPerProblem: 3.0,
    operator: '-',
    pairs: subPairsNoBorrow(),
  },
  {
    id: 'lv7',
    name: 'くりさがり ひきざん',
    description: 'くりさがりのある ひきざん',
    targetSecPerProblem: 4.0,
    operator: '-',
    pairs: subPairsBorrow(),
  },
  {
    id: 'lv8',
    name: 'ひきざん ぜんぶ',
    description: 'くりさがりなしと ありの ひきざん',
    targetSecPerProblem: 3.5,
    operator: '-',
    pairs: [...subPairsNoBorrow(), ...subPairsBorrow()],
  },
  {
    id: 'lv9',
    name: '3つのかずの たしざん',
    description: '3つの かずを たす',
    targetSecPerProblem: 4.5,
    operator: '+',
    pairs: [],
    triples: addTriples(20),
  },
]

export function findLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id)
}

export function formatProblem(p: Problem): string {
  if (p.c != null) return `${p.a} + ${p.b} + ${p.c}`
  return `${p.a} ${p.operator} ${p.b}`
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sameBinary(x: [number, number], a: number, b: number) {
  return x[0] === a && x[1] === b
}

function sameTriple(x: [number, number, number], a: number, b: number, c: number) {
  return x[0] === a && x[1] === b && x[2] === c
}

/** 候補をシャッフルしたものを繰り返し並べ、同じ問題が連続しないように count 問つくる */
export function generateProblems(level: Level, count: number): Problem[] {
  const out: Problem[] = []

  if (level.triples && level.triples.length > 0) {
    while (out.length < count) {
      const batch = shuffle(level.triples)
      const last = out[out.length - 1]
      if (last && last.c != null && batch.length > 1 && sameTriple(batch[0], last.a, last.b, last.c)) {
        ;[batch[0], batch[1]] = [batch[1], batch[0]]
      }
      for (const [a, b, c] of batch) {
        if (out.length >= count) break
        out.push({ a, b, c, operator: '+', answer: a + b + c })
      }
    }
    return out
  }

  while (out.length < count) {
    const batch = shuffle(level.pairs)
    const last = out[out.length - 1]
    if (last && batch.length > 1 && sameBinary(batch[0], last.a, last.b)) {
      ;[batch[0], batch[1]] = [batch[1], batch[0]]
    }
    for (const [a, b] of batch) {
      if (out.length >= count) break
      out.push({
        a,
        b,
        operator: level.operator,
        answer: level.operator === '+' ? a + b : a - b,
      })
    }
  }
  return out
}
