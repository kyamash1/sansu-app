import { RANKS, type Rank, isBetterRank } from './scoring'

export type PlayRecord = {
  id: string
  levelId: string
  stageId: string
  playedAt: number
  total: number
  correct: number
  timeMs: number
  rank: Rank
}

type SaveData = {
  version: 1
  records: PlayRecord[]
}

const STORAGE_KEY = 'sansu-app:v1'

function load(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { version: 1, records: [] }
    const data = JSON.parse(raw) as SaveData
    if (data.version !== 1 || !Array.isArray(data.records)) return { version: 1, records: [] }
    // ステージ導入前の記録は stageId を持たない
    data.records = data.records.map((r) => (r.stageId ? r : { ...r, stageId: `${r.levelId}-${r.total}` }))
    return data
  } catch {
    return { version: 1, records: [] }
  }
}

function save(data: SaveData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getRecords(filter?: { levelId?: string; stageId?: string }): PlayRecord[] {
  const { records } = load()
  return records.filter(
    (r) =>
      (!filter?.levelId || r.levelId === filter.levelId) &&
      (!filter?.stageId || r.stageId === filter.stageId),
  )
}

export function addRecord(record: Omit<PlayRecord, 'id'>): PlayRecord {
  const data = load()
  const full: PlayRecord = {
    ...record,
    id: `${record.playedAt}-${Math.random().toString(36).slice(2, 8)}`,
  }
  data.records.push(full)
  save(data)
  return full
}

export function clearRecords() {
  save({ version: 1, records: [] })
}

/** ランクが高い順、同ランクならタイムが速い順でいちばん良い記録 */
export function getBestRecord(stageId: string): PlayRecord | undefined {
  let best: PlayRecord | undefined
  for (const r of getRecords({ stageId })) {
    if (
      !best ||
      isBetterRank(r.rank, best.rank) ||
      (r.rank === best.rank && r.timeMs < best.timeMs)
    ) {
      best = r
    }
  }
  return best
}

export function countStamps(levelId: string): Record<Rank, number> {
  const counts = Object.fromEntries(RANKS.map((r) => [r, 0])) as Record<Rank, number>
  for (const r of getRecords({ levelId })) counts[r.rank]++
  return counts
}
