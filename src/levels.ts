export type Operator = '+' | '-' | '×'

function computeAnswer(a: number, b: number, operator: Operator): number {
  if (operator === '+') return a + b
  if (operator === '-') return a - b
  return a * b
}

export type Problem = {
  a: number
  b: number
  /** 3つのかずのたしざん用 */
  c?: number
  operator: Operator
  answer: number
}

export type Candidate = {
  a: number
  b: number
  operator: Operator
}

export type Level = {
  id: string
  name: string
  description: string
  /** 1問あたりの目標秒数。これ以内ならスピード面で S 判定 */
  targetSecPerProblem: number
  operator: Operator
  /** 出題候補となる (a, b)。triples / candidates がある場合は使わない */
  pairs: [number, number][]
  /** 3つのかずのたしざん用。あればこちらを優先 */
  triples?: [number, number, number][]
  /** 加減混在など、演算込みの候補。あれば pairs より優先（triples の次） */
  candidates?: Candidate[]
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

const TWO_DIGIT = Array.from({ length: 90 }, (_, i) => i + 10) // 10〜99

/** やさしい 2けた+1けた（一の位でくりあがらない） */
function add2digit1digitNoCarry(): [number, number][] {
  const result: [number, number][] = []
  for (const a of TWO_DIGIT) {
    for (const b of DIGITS) {
      if (a % 10 + b < 10) result.push([a, b])
    }
  }
  return result
}

/** やさしい 2けた−1けた（一の位でくりさがらない） */
function sub2digit1digitNoBorrow(): [number, number][] {
  const result: [number, number][] = []
  for (const a of TWO_DIGIT) {
    for (const b of DIGITS) {
      if (a % 10 >= b) result.push([a, b])
    }
  }
  return result
}

/** 2けた+2けた（一の位・十の位ともくりあがりなし → こたえ100未満） */
function add2digit2digitNoCarry(): [number, number][] {
  const result: [number, number][] = []
  for (const a of TWO_DIGIT) {
    for (const b of TWO_DIGIT) {
      if (a % 10 + (b % 10) < 10 && Math.floor(a / 10) + Math.floor(b / 10) < 10) {
        result.push([a, b])
      }
    }
  }
  return result
}

/** 2けた+2けた（一の位でくりあがりあり） */
function add2digit2digitCarry(): [number, number][] {
  const result: [number, number][] = []
  for (const a of TWO_DIGIT) {
    for (const b of TWO_DIGIT) {
      if (a % 10 + (b % 10) >= 10) result.push([a, b])
    }
  }
  return result
}

/** 2けた−2けた（一の位でくりさがりあり、a>b） */
function sub2digit2digitBorrow(): [number, number][] {
  const result: [number, number][] = []
  for (const a of TWO_DIGIT) {
    for (const b of TWO_DIGIT) {
      if (a > b && a % 10 < b % 10) result.push([a, b])
    }
  }
  return result
}

/**
 * やさしい 3けたの加減（十・百を単位にした簡単な場合）
 * 例: 200+30 / 400+200 / 350−50 / 500−100
 */
function simple3digitCandidates(): Candidate[] {
  const hundreds = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  const tens = [10, 20, 30, 40, 50, 60, 70, 80, 90]
  const round3: number[] = []
  for (let n = 110; n <= 990; n += 10) round3.push(n)

  const result: Candidate[] = []
  for (const a of hundreds) {
    for (const b of tens) {
      result.push({ a, b, operator: '+' })
      result.push({ a, b, operator: '-' })
    }
    for (const b of hundreds) {
      result.push({ a, b, operator: '+' })
      if (a > b) result.push({ a, b, operator: '-' })
    }
  }
  for (const a of round3) {
    for (const b of tens) {
      // 一の位がどちらも0なので、十の位だけの加減になる
      result.push({ a, b, operator: '+' })
      if (a > b) result.push({ a, b, operator: '-' })
    }
  }
  return result
}

/** かけ算九九: 指定した段 × 1〜9 */
function mulPairs(dans: number[]): [number, number][] {
  const result: [number, number][] = []
  for (const a of dans) {
    for (const b of DIGITS) result.push([a, b])
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
  {
    id: 'lv10',
    name: 'やさしい 2けた+1けた',
    description: 'くりあがりのない 2けた+1けた',
    targetSecPerProblem: 4.0,
    operator: '+',
    pairs: add2digit1digitNoCarry(),
  },
  {
    id: 'lv11',
    name: 'やさしい 2けた−1けた',
    description: 'くりさがりのない 2けた−1けた',
    targetSecPerProblem: 4.0,
    operator: '-',
    pairs: sub2digit1digitNoBorrow(),
  },
  {
    id: 'lv12',
    name: '2けた+2けた（くりあがりなし）',
    description: 'くりあがりのない 2けたどうしの たしざん',
    targetSecPerProblem: 5.0,
    operator: '+',
    pairs: add2digit2digitNoCarry(),
  },
  {
    id: 'lv13',
    name: '2けた+2けた（くりあがりあり）',
    description: 'くりあがりのある 2けたどうしの たしざん',
    targetSecPerProblem: 6.0,
    operator: '+',
    pairs: add2digit2digitCarry(),
  },
  {
    id: 'lv14',
    name: '2けた−2けた',
    description: 'くりさがりのある 2けたどうしの ひきざん',
    targetSecPerProblem: 6.0,
    operator: '-',
    pairs: sub2digit2digitBorrow(),
  },
  {
    id: 'lv15',
    name: 'やさしい 3けたの加減',
    description: '百や 十を たんいにした かんたんな 加減',
    targetSecPerProblem: 5.5,
    operator: '+',
    pairs: [],
    candidates: simple3digitCandidates(),
  },
  {
    id: 'lv16',
    name: 'かけ算 1のだん',
    description: '1のだんの かけ算',
    targetSecPerProblem: 2.5,
    operator: '×',
    pairs: mulPairs([1]),
  },
  {
    id: 'lv17',
    name: 'かけ算 2〜5のだん',
    description: '2のだんから 5のだんの かけ算',
    targetSecPerProblem: 3.0,
    operator: '×',
    pairs: mulPairs([2, 3, 4, 5]),
  },
  {
    id: 'lv18',
    name: 'かけ算 6〜9のだん',
    description: '6のだんから 9のだんの かけ算',
    targetSecPerProblem: 3.5,
    operator: '×',
    pairs: mulPairs([6, 7, 8, 9]),
  },
  {
    id: 'lv19',
    name: 'かけ算 九九ぜんぶ',
    description: '1けた×1けたの かけ算 ぜんぶ',
    targetSecPerProblem: 2.5,
    operator: '×',
    pairs: mulPairs(DIGITS),
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

function sameCandidate(x: Candidate, last: Problem) {
  return x.a === last.a && x.b === last.b && x.operator === last.operator
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

  if (level.candidates && level.candidates.length > 0) {
    while (out.length < count) {
      const batch = shuffle(level.candidates)
      const last = out[out.length - 1]
      if (last && batch.length > 1 && sameCandidate(batch[0], last)) {
        ;[batch[0], batch[1]] = [batch[1], batch[0]]
      }
      for (const { a, b, operator } of batch) {
        if (out.length >= count) break
        out.push({ a, b, operator, answer: computeAnswer(a, b, operator) })
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
        answer: computeAnswer(a, b, level.operator),
      })
    }
  }
  return out
}
