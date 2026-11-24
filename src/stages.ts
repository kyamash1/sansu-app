import { findLevel, type Level } from './levels'
import { RANKS, type Rank } from './scoring'
import { getRecords } from './storage'

export type StageAnimal = {
  name: string
  image: string
}

/** 大きなテーマ（マップ上の「ステージ」区切り） */
export type Theme = {
  id: string
  /** 1 はじまりの表示番号 */
  number: number
  name: string
  description: string
  levelIds: string[]
}

export type Stage = {
  id: string
  /** 0 はじまりの通し番号 */
  index: number
  theme: Theme
  level: Level
  count: number
  animal: StageAnimal
}

/**
 * 初期実装の「こたえ5まで〜10まで × 問題数」をステージ1とし、
 * 以降も同じ粒度の大きなテーマでまとめる
 */
export const THEMES: Theme[] = [
  {
    id: 'add-basic',
    number: 1,
    name: 'たしざん（5〜10）',
    description: 'こたえが 5まで・10になる・10までの たしざん',
    levelIds: ['lv1', 'lv2', 'lv3'],
  },
  {
    id: 'add-carry',
    number: 2,
    name: 'くりあがり たしざん',
    description: 'くりあがりと たしざん ぜんぶ',
    levelIds: ['lv4', 'lv5'],
  },
  {
    id: 'sub-basic',
    number: 3,
    name: 'ひきざん',
    description: 'くりさがりなし・あり・ひきざんぜんぶ',
    levelIds: ['lv6', 'lv7', 'lv8'],
  },
  {
    id: 'add-triple',
    number: 4,
    name: '3つのかずの たしざん',
    description: '3つの かずを たす',
    levelIds: ['lv9'],
  },
  {
    id: 'two-digit-easy',
    number: 5,
    name: 'やさしい 2けた',
    description: '2けた±1けた（くりあがり・くりさがりなし）',
    levelIds: ['lv10', 'lv11'],
  },
  {
    id: 'two-digit-add',
    number: 6,
    name: '2けたどうしの たしざん',
    description: '2けた+2けた',
    levelIds: ['lv12', 'lv13'],
  },
  {
    id: 'two-digit-sub-3digit',
    number: 7,
    name: '2けたの ひきざん・3けた',
    description: '2けた−2けたと やさしい 3けたの加減',
    levelIds: ['lv14', 'lv15'],
  },
  {
    id: 'multiply',
    number: 8,
    name: 'かけ算 九九',
    description: 'かけ算の だんから 九九ぜんぶ',
    levelIds: ['lv16', 'lv17', 'lv18', 'lv19'],
  },
]

function animal(name: string, file: string): StageAnimal {
  return { name, image: `stamps/${file}.webp` }
}

/** ステージ1から順に、そのステージのスタンプになる動物 */
const STAGE_ANIMALS: StageAnimal[] = [
  animal('ティラノサウルス', 'trex'),
  animal('トリケラトプス', 'triceratops'),
  animal('スピノサウルス', 'spinosaurus'),
  animal('マンモス', 'mammoth'),
  animal('ヘラクレスオオカブト', 'hercules'),
  animal('ギラファノコギリクワガタ', 'giraffa'),
  animal('ライオン', 'lion'),
  animal('ゴリラ', 'gorilla'),
  animal('ホホジロザメ', 'shark'),
  animal('イリエワニ', 'crocodile'),
  animal('オオアナコンダ', 'anaconda'),
  animal('アフリカゾウ', 'elephant'),
  animal('プテラノドン', 'pteranodon'),
  animal('ステゴサウルス', 'stegosaurus'),
  animal('トラ', 'tiger'),
  animal('オオカミ', 'wolf'),
  animal('チーター', 'cheetah'),
  animal('シャチ', 'orca'),
  animal('オオワシ', 'eagle'),
  animal('カバ', 'hippo'),
  animal('ヴェロキラプトル', 'velociraptor'),
  animal('ブラキオサウルス', 'brachiosaurus'),
  animal('ヒグマ', 'bear'),
  animal('シロサイ', 'rhino'),
  animal('キツネ', 'fox'),
  animal('キングコブラ', 'cobra'),
  animal('コモドオオトカゲ', 'komodo'),
  animal('カブトムシ', 'kabuto'),
  animal('ノコギリクワガタ', 'nokogiri'),
  animal('サソリ', 'scorpion'),
  animal('ダイオウイカ', 'squid'),
  animal('スイギュウ', 'buffalo'),
  animal('カンガルー', 'kangaroo'),
  animal('フクロウ', 'owl'),
  animal('イルカ', 'dolphin'),
  animal('クマタカ', 'hawk'),
  animal('アロサウルス', 'allosaurus'),
  animal('パラサウロロフス', 'parasaurolophus'),
  animal('シロクマ', 'polarbear'),
  animal('ヒョウ', 'leopard'),
  animal('ヤマネコ', 'wildcat'),
  animal('ヘラジカ', 'moose'),
  animal('イノシシ', 'boar'),
  animal('シュモクザメ', 'hammerhead'),
  animal('マンタ', 'manta'),
  animal('カメレオン', 'chameleon'),
  animal('タランチュラ', 'tarantula'),
  animal('シャコ', 'mantisshrimp'),
  animal('ピューマ', 'puma'),
  animal('カミツキガメ', 'snappingturtle'),
  animal('ヒクイドリ', 'cassowary'),
  animal('クズリ', 'wolverine'),
  animal('アンキロサウルス', 'ankylosaurus'),
  animal('ディロフォサウルス', 'dilophosaurus'),
  animal('ホッキョクギツネ', 'arcticfox'),
  animal('ハイエナ', 'hyena'),
  animal('ラッコ', 'otter'),
  animal('デンキウナギ', 'electriceel'),
  animal('エリマキトカゲ', 'frilledlizard'),
  animal('センザンコウ', 'pangolin'),
  animal('パキケファロサウルス', 'pachy'),
  animal('カルノタウルス', 'carnotaurus'),
  animal('ユキヒョウ', 'snowleopard'),
  animal('ジャガー', 'jaguar'),
  animal('ラーテル', 'honeybadger'),
  animal('タスマニアデビル', 'tassie'),
  animal('イッカク', 'narwhal'),
  animal('シロナガスクジラ', 'bluewhale'),
  animal('コウテイペンギン', 'emperorpenguin'),
  animal('ヘビクイワシ', 'secretarybird'),
  animal('ウーパールーパー', 'axolotl'),
  animal('リーフィーシードラゴン', 'leafyseadragon'),
  animal('リカオン', 'wilddog'),
  animal('フェネック', 'fennec'),
  animal('ガビアル', 'gharial'),
  animal('カモノハシ', 'platypus'),
]

/** 各難易度の中で、この問題数の順にステップアップする */
export const STAGE_COUNTS = [30, 50, 70, 100]

/** このランク以上でクリアすると次のステージがひらく */
export const UNLOCK_RANK: Rank = 'B'

/** テーマ → 問題数（30〜100の塊） → 難易度 の順 */
export const STAGES: Stage[] = THEMES.flatMap((theme) =>
  STAGE_COUNTS.flatMap((count) =>
    theme.levelIds.map((levelId) => {
      const level = findLevel(levelId)
      if (!level) throw new Error(`unknown level: ${levelId}`)
      return { theme, level, count }
    }),
  ),
).map((s, index) => ({
  ...s,
  id: `${s.level.id}-${s.count}`,
  index,
  animal: STAGE_ANIMALS[index % STAGE_ANIMALS.length],
}))

export function findStage(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id)
}

export function themeLabel(theme: Theme) {
  return `ステージ${theme.number}`
}

export function stageLabel(stage: Stage) {
  return themeLabel(stage.theme)
}

export function stageDetail(stage: Stage) {
  return `${stage.level.name}・${stage.count}もん`
}

export function meetsUnlockRank(rank: Rank) {
  return RANKS.indexOf(rank) <= RANKS.indexOf(UNLOCK_RANK)
}

export function isStageCleared(stage: Stage) {
  return getRecords().some((r) => r.stageId === stage.id && meetsUnlockRank(r.rank))
}

export type StageStatus = 'cleared' | 'current' | 'unlocked' | 'locked'

/** 先頭から順にみて、最初の未クリアが「いまのステージ」。それより後ろはロック */
export function getStageStatuses(): StageStatus[] {
  // 開発時は全ステージ解放（テストしやすくするため）
  const unlockAll = import.meta.env.DEV

  let foundCurrent = false
  return STAGES.map((stage) => {
    if (isStageCleared(stage)) return 'cleared'
    if (!foundCurrent) {
      foundCurrent = true
      return 'current'
    }
    return unlockAll ? 'unlocked' : 'locked'
  })
}

export function getCurrentStage(): Stage | undefined {
  const idx = getStageStatuses().indexOf('current')
  return idx === -1 ? undefined : STAGES[idx]
}

export function getNextStage(stage: Stage): Stage | undefined {
  return STAGES[stage.index + 1]
}
