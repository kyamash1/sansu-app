import { formatProblem, type Problem } from './levels'

export type HintKind = 'make10' | 'borrow' | 'blocks' | 'multiply' | 'place' | 'text'

export type Hint = {
  kind: HintKind
  /** 段階ヒント。index 0 から順に見せる */
  steps: string[]
  /** ブロック表示用（なければテキストのみ） */
  visual?: HintVisual
  /** 書きかえ式（例: 10 + 4） */
  rewritten?: string
}

export type HintVisual =
  | {
      type: 'make10'
      a: number
      /** b のうち 10 にする分 */
      toTen: number
      /** b ののこり */
      remain: number
      /** できた 10 のかたまり数（通常 1。2けたなら十の位まで含めた値） */
      tenValue: number
    }
  | {
      type: 'borrow'
      a: number
      b: number
      /** 10 のかたまり */
      tens: number
      /** 一の位 */
      ones: number
      /** 10 からひいたのこり */
      fromTen: number
    }
  | {
      type: 'blocks'
      groups: { count: number; tone: 'a' | 'b' | 'c' | 'result'; label?: string }[]
    }
  | {
      type: 'multiply'
      a: number
      b: number
    }
  | {
      type: 'place'
      aTens: number
      aOnes: number
      bTens: number
      bOnes: number
      operator: '+' | '-'
      sumTens: number
      sumOnes: number
      carry?: number
      borrow?: boolean
    }

function ones(n: number) {
  return n % 10
}

function tens(n: number) {
  return Math.floor(n / 10)
}

/** くりあがりたしざん: 一の位どうしが 10 以上 */
function needsCarry(a: number, b: number) {
  return ones(a) + ones(b) >= 10
}

/** くりさがりひきざん: 一の位が足りない */
function needsBorrow(a: number, b: number) {
  return ones(a) < ones(b)
}

function make10Hint(a: number, b: number): Hint {
  const aOnes = ones(a)
  const bOnes = ones(b)
  const need = 10 - aOnes
  const remain = bOnes - need
  const tenValue = tens(a) * 10 + 10
  const rewritten = remain === 0 ? String(tenValue) : `${tenValue} + ${remain}`

  if (a < 10 && b < 10) {
    return {
      kind: 'make10',
      steps: [
        `${a} に あと ${need} で 10 になるよ`,
        remain === 0
          ? `${b} で ちょうど 10 になるよ`
          : `${b} を ${need} と ${remain} に わけるよ`,
        remain === 0 ? `こたえは ${a + b}` : `10 + ${remain} = ${a + b}`,
      ],
      visual: { type: 'make10', a, toTen: need, remain, tenValue: 10 },
      rewritten: remain === 0 ? '10' : `10 + ${remain}`,
    }
  }

  return {
    kind: 'make10',
    steps: [
      `いちのくらい ${aOnes} に あと ${need} で 10`,
      remain === 0
        ? `${bOnes} で ちょうど 10 になるよ`
        : `${bOnes} を ${need} と ${remain} に わけるよ`,
      `${rewritten} = ${a + b}`,
    ],
    visual: { type: 'make10', a: aOnes, toTen: need, remain, tenValue },
    rewritten,
  }
}

function borrowHint(a: number, b: number): Hint {
  const aOnes = ones(a)
  const aTens = tens(a)
  const fromTen = 10 - ones(b)
  // 10から b をひいたのこり + もともとの一の位
  const onesResult = fromTen + aOnes
  const answer = a - b

  if (a < 20 && b < 10) {
    return {
      kind: 'borrow',
      steps: [
        `${a} は 10 と ${aOnes}`,
        `10 から ${b} を ひくと ${10 - b}`,
        `${10 - b} + ${aOnes} = ${answer}`,
      ],
      visual: {
        type: 'borrow',
        a,
        b,
        tens: 10,
        ones: aOnes,
        fromTen: 10 - b,
      },
      rewritten: `${10 - b} + ${aOnes}`,
    }
  }

  return {
    kind: 'borrow',
    steps: [
      `いちのくらいが たりないから じゅうから かりるよ`,
      `10 + ${aOnes} = ${10 + aOnes} から ${ones(b)} を ひくと ${onesResult}`,
      `こたえは ${answer}`,
    ],
    visual: {
      type: 'borrow',
      a,
      b: ones(b),
      tens: aTens * 10,
      ones: aOnes,
      fromTen: onesResult,
    },
    rewritten: String(answer),
  }
}

function placeAddHint(a: number, b: number): Hint {
  const aT = tens(a)
  const aO = ones(a)
  const bT = tens(b)
  const bO = ones(b)
  const carry = aO + bO >= 10 ? 1 : 0
  const sumOnes = (aO + bO) % 10
  const sumTens = aT + bT + carry

  return {
    kind: 'place',
    steps: [
      'くらいごとに わけて けいさんしよう',
      carry
        ? `いちのくらい ${aO}+${bO}=${aO + bO} → くりあがり`
        : `いちのくらい ${aO}+${bO}=${sumOnes}`,
      `じゅうのくらい ${aT}+${bT}${carry ? '+1' : ''}=${sumTens} → こたえ ${a + b}`,
    ],
    visual: {
      type: 'place',
      aTens: aT,
      aOnes: aO,
      bTens: bT,
      bOnes: bO,
      operator: '+',
      sumTens,
      sumOnes,
      carry: carry || undefined,
    },
    rewritten: `${sumTens}${sumOnes}`,
  }
}

function placeSubHint(a: number, b: number): Hint {
  const borrow = needsBorrow(a, b)
  const aT = tens(a)
  const aO = ones(a)
  const bT = tens(b)
  const bO = ones(b)
  const onesResult = borrow ? aO + 10 - bO : aO - bO
  const tensResult = borrow ? aT - 1 - bT : aT - bT

  return {
    kind: 'place',
    steps: [
      'くらいごとに わけて けいさんしよう',
      borrow
        ? `いちのくらいが たりない → じゅうから 1かりる`
        : `いちのくらい ${aO}−${bO}=${onesResult}`,
      `こたえは ${a - b}`,
    ],
    visual: {
      type: 'place',
      aTens: aT,
      aOnes: aO,
      bTens: bT,
      bOnes: bO,
      operator: '-',
      sumTens: tensResult,
      sumOnes: onesResult,
      borrow,
    },
    rewritten: String(a - b),
  }
}

function blocksHint(problem: Problem): Hint {
  const { a, b, c, operator, answer } = problem
  if (operator === '+' && c != null) {
    return {
      kind: 'blocks',
      steps: [
        `${a} と ${b} を たすと ${a + b}`,
        `${a + b} に ${c} を たすと ${answer}`,
      ],
      visual: {
        type: 'blocks',
        groups: [
          { count: a, tone: 'a', label: String(a) },
          { count: b, tone: 'b', label: String(b) },
          { count: c, tone: 'c', label: String(c) },
        ],
      },
      rewritten: String(answer),
    }
  }
  if (operator === '+') {
    return {
      kind: 'blocks',
      steps: [`ブロックを かぞえてみよう`, `${a} + ${b} = ${answer}`],
      visual: {
        type: 'blocks',
        groups: [
          { count: Math.min(a, 20), tone: 'a', label: String(a) },
          { count: Math.min(b, 20), tone: 'b', label: String(b) },
        ],
      },
      rewritten: String(answer),
    }
  }
  if (operator === '-') {
    return {
      kind: 'blocks',
      steps: [`${a} から ${b} こ とると?`, `のこりは ${answer}`],
      visual: {
        type: 'blocks',
        groups: [
          { count: Math.min(a - b, 20), tone: 'a', label: `のこり ${answer}` },
          { count: Math.min(b, 20), tone: 'b', label: `とる ${b}` },
        ],
      },
      rewritten: String(answer),
    }
  }
  return {
    kind: 'text',
    steps: [`${formatProblem(problem)} の こたえを かんがえよう`, `こたえは ${answer}`],
  }
}

function multiplyHint(a: number, b: number): Hint {
  const answer = a * b
  return {
    kind: 'multiply',
    steps: [
      `${a} の かたまいが ${b} こ`,
      `${Array.from({ length: Math.min(b, 9) }, (_, i) => a * (i + 1)).join(' → ')}${b > 9 ? ' …' : ''}`,
      `${a} × ${b} = ${answer}`,
    ],
    visual: { type: 'multiply', a, b },
    rewritten: String(answer),
  }
}

/** 問題に応じたヒントを返す */
export function getHint(problem: Problem): Hint {
  const { a, b, c, operator } = problem

  if (operator === '×') return multiplyHint(a, b)

  if (operator === '+' && c != null) return blocksHint(problem)

  if (operator === '+') {
    if (needsCarry(a, b)) {
      if (a >= 10 && b >= 10) return placeAddHint(a, b)
      return make10Hint(a, b)
    }
    if (a >= 10 || b >= 10) return placeAddHint(a, b)
    return blocksHint(problem)
  }

  if (operator === '-') {
    if (needsBorrow(a, b)) {
      if (a >= 20 || b >= 10) return placeSubHint(a, b)
      return borrowHint(a, b)
    }
    if (a >= 10 || b >= 10) return placeSubHint(a, b)
    return blocksHint(problem)
  }

  return blocksHint(problem)
}
