import { LEVELS, type Level } from './levels'
import { RANKS, type Rank } from './scoring'
import { getRecords } from './storage'

export type Stage = {
  id: string
  /** 0 はじまりの通し番号 */
  index: number
  level: Level
  count: number
}

/** 各レベルの中で、この問題数の順にステップアップする */
export const STAGE_COUNTS = [30, 50, 70, 100]

/** このランク以上でクリアすると次のステージがひらく */
export const UNLOCK_RANK: Rank = 'B'

export const STAGES: Stage[] = LEVELS.flatMap((level) => STAGE_COUNTS.map((count) => ({ level, count }))).map(
  (s, index) => ({ ...s, id: `${s.level.id}-${s.count}`, index }),
)

export function findStage(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id)
}

export function stageLabel(stage: Stage) {
  return `ステージ${stage.index + 1}`
}

export function meetsUnlockRank(rank: Rank) {
  return RANKS.indexOf(rank) <= RANKS.indexOf(UNLOCK_RANK)
}

export function isStageCleared(stage: Stage) {
  return getRecords().some((r) => r.stageId === stage.id && meetsUnlockRank(r.rank))
}

export type StageStatus = 'cleared' | 'current' | 'locked'

/** 先頭から順にみて、最初の未クリアが「いまのステージ」。それより後ろはロック */
export function getStageStatuses(): StageStatus[] {
  let foundCurrent = false
  return STAGES.map((stage) => {
    if (foundCurrent) return 'locked'
    if (isStageCleared(stage)) return 'cleared'
    foundCurrent = true
    return 'current'
  })
}

export function getCurrentStage(): Stage | undefined {
  const idx = getStageStatuses().indexOf('current')
  return idx === -1 ? undefined : STAGES[idx]
}

export function getNextStage(stage: Stage): Stage | undefined {
  return STAGES[stage.index + 1]
}
