export const RANKS = ['S', 'A', 'B', 'C', 'D'] as const
export type Rank = (typeof RANKS)[number]

/** 正答率(%)の下限。上から S, A, B, C */
const ACCURACY_THRESHOLDS = [98, 95, 90, 80]
/** 目標秒数に対する倍率の上限。上から S, A, B, C */
const SPEED_MULTIPLIERS = [1, 1.5, 2, 3]

export type ScoreDetail = {
  rank: Rank
  accuracyRank: Rank
  speedRank: Rank
  accuracy: number
  avgSec: number
}

function rankIndex(rank: Rank) {
  return RANKS.indexOf(rank)
}

/** 正答率とスピードをそれぞれ評価し、低いほうを最終ランクにする */
export function calcScore(
  correct: number,
  total: number,
  timeMs: number,
  targetSecPerProblem: number,
): ScoreDetail {
  const accuracy = total === 0 ? 0 : (correct / total) * 100
  const avgSec = total === 0 ? 0 : timeMs / 1000 / total

  const accIdx = ACCURACY_THRESHOLDS.findIndex((t) => accuracy >= t)
  const accuracyRank = RANKS[accIdx === -1 ? 4 : accIdx]

  const spdIdx = SPEED_MULTIPLIERS.findIndex((m) => avgSec <= targetSecPerProblem * m)
  const speedRank = RANKS[spdIdx === -1 ? 4 : spdIdx]

  const rank = RANKS[Math.max(rankIndex(accuracyRank), rankIndex(speedRank))]
  return { rank, accuracyRank, speedRank, accuracy, avgSec }
}

export function isBetterRank(a: Rank, b: Rank) {
  return rankIndex(a) < rankIndex(b)
}

export function rankCriteria(targetSecPerProblem: number) {
  return RANKS.slice(0, 4).map((rank, i) => ({
    rank,
    accuracy: ACCURACY_THRESHOLDS[i],
    secPerProblem: targetSecPerProblem * SPEED_MULTIPLIERS[i],
  }))
}

export function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return m > 0 ? `${m}ふん ${s}びょう` : `${s}びょう`
}

export function formatClock(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
