<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
// ヘッダー部分
// 畳の規格一覧（id・名前・幅・奥行をひとまとめに持つ）
const roomSizes = [
  { id: 1, name: '江戸間6畳(261×352)', width: 261, depth: 352 },
  { id: 2, name: '団地間6畳(255×340)', width: 255, depth: 340 },
  { id: 3, name: '中京間6畳(273×364)', width: 273, depth: 364 },
  { id: 4, name: '京間6畳(287×382)'  , width: 287, depth: 382 },
]

const roomWidth = ref('261') // 横幅の初期値を設定 refで追跡可能に
const roomDepth = ref('352') // 奥行の初期値を設定 refで追跡可能に
const selectedRoomId = ref(1) // 今選ばれている規格のid。初期値は江戸間

// selectedRoomIdが変わるたびに自動で実行される
watch(selectedRoomId, (id) => {
  const found = roomSizes.find(r => r.id === id)
  if (!found) return
  roomWidth.value = found.width
  roomDepth.value = found.depth
})

function reset(){
  roomWidth.value = '261'
  roomDepth.value = '352'
  selectedRoomId.value = 1
}

// ヘッダー部分最後

// 左側カタログ部分
const catalog = [
  // 寝具
  { name: 'シングルベッド',     width: 97,  depth: 195, genre: 'sleep' },
  { name: 'セミダブルベッド',   width: 120, depth: 195, genre: 'sleep' },
  { name: '敷布団',             width: 100, depth: 200, genre: 'sleep' },

  // 机・収納
  { name: 'デスク',             width: 100, depth: 60,  genre: 'storage' },
  { name: 'チェア',             width: 45,  depth: 45,  genre: 'storage' },
  { name: '本棚',               width: 60,  depth: 30,  genre: 'storage' },
  { name: 'チェスト',           width: 80,  depth: 40,  genre: 'storage' },
  { name: 'カラーボックス',     width: 42,  depth: 29,  genre: 'storage' },
  { name: 'ハンガーラック',     width: 80,  depth: 45,  genre: 'storage' },

  // リビング
  { name: 'ローテーブル',       width: 90,  depth: 50,  genre: 'living' },
  { name: '2人掛けソファ',      width: 140, depth: 75,  genre: 'living' },
  { name: '1人掛けソファ',      width: 75,  depth: 75,  genre: 'living' },
  { name: 'テレビ台',           width: 100, depth: 40,  genre: 'living' },

  // 家電
  { name: '冷蔵庫',             width: 55,  depth: 60,  genre: 'appliance' },
  { name: '洗濯機',             width: 60,  depth: 60,  genre: 'appliance' },
  { name: 'レンジ台',           width: 55,  depth: 40,  genre: 'appliance' },
]

const items = ref([])          // 配置済みの家具（増減する＝状態なのでref）
const selectedId = ref(null)   // 今選択中の家具のid

// 1cmあたり何pxで描画するかを計算（部屋が画面に収まるように自動調整）
const SCALE = computed(() =>
  Math.min(640 / Number(roomWidth.value), 560 / Number(roomDepth.value))
)
const px = (cm) => cm * SCALE.value   // cm→pxに変換する小さな関数


function addItem(c) {
  const newItem = {
    id: crypto.randomUUID(),   // 一意なIDの発行
    name: c.name,
    width: c.width,
    depth: c.depth,
    genre: c.genre,
    x: (Number(roomWidth.value) - c.width) / 2,
    y: (Number(roomDepth.value) - c.depth) / 2,
  }
  items.value.push(newItem)
}


// ── ドラッグ ──────────────────────────────
// dragはただの作業メモ（画面に出ない）のでrefにしない
let drag = null

function startDrag(e, it) {
  selectedId.value = it.id
  const rect = e.currentTarget.parentElement.getBoundingClientRect() // 部屋の位置
  drag = {
    id: it.id,
    // 掴んだ位置と家具の左上のズレ(cm)を記録（プロトタイプと同じ式）
    offX: (e.clientX - rect.left) / SCALE.value - it.x,
    offY: (e.clientY - rect.top) / SCALE.value - it.y,
    rect,
  }
  e.currentTarget.setPointerCapture(e.pointerId)  // 枠の外に出ても追跡
}

function onMove(e) {
  if (!drag) return
  const it = items.value.find(i => i.id === drag.id)
  if (!it) return
  // ポインタ位置をcmに換算 → ズレを引く（プロトタイプと同じ式）
  it.x = Math.round((e.clientX - drag.rect.left) / SCALE.value - drag.offX)
  it.y = Math.round((e.clientY - drag.rect.top) / SCALE.value - drag.offY)
  clampItem(it)   // 部屋の外に出さない
}

function endDrag() { drag = null }

// 部屋からはみ出さないよう座標を丸める（プロトタイプのclampItemそのまま）
function clampItem(it) {
  const roomW = Number(roomWidth.value)
  const roomD = Number(roomDepth.value)
  it.x = Math.max(0, Math.min(roomW - it.width, it.x))
  it.y = Math.max(0, Math.min(roomD - it.depth, it.y))
}

// ── 重なり判定（AABB）────────────────────────
// 「どの家具が重なっているか」も導かれる値なのでcomputed
const overlapIds = computed(() => {
  const s = new Set()
  const list = items.value
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j]
      if (a.x < b.x + b.width && a.x + a.width > b.x &&
          a.y < b.y + b.depth && a.y + a.depth > b.y) { s.add(a.id); s.add(b.id) }
    }
  return s
})

function onKey(e) {
  if (e.key === 'Escape') selectedId.value = null
  if (e.key === 'Delete' || e.key === 'Backspace') {
  items.value = items.value.filter(it => it.id !== selectedId.value)
  selectedId.value = null
  }
  items.value = items.value.filter(e)
}
    onMounted(() => window.addEventListener('keydown', onKey))
  onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="header">
    <h3>6畳1Kレイアウトシュミレーター MADORI</h3>
    <div class="room_layout">
      <p>畳の規格</p>
      <div class="room_select">
        <select v-model="selectedRoomId">
          <option v-for="r in roomSizes" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </select>
      </div>
      <p>幅</p> <input type="text" v-model="roomWidth">
      <p>奥行</p> <input type="text" v-model="roomDepth">
      <button @click="reset">リセット</button>
    </div>
    <p>単位:cm /ドラッグで移動・タップで選択</p>
    <p>配置数: {{ items.length }}</p>
  </div>

  <div class="layout">
    <aside class="palette">
      <button v-for="c in catalog" :key="c.name" @click="addItem(c)">
        {{ c.name }} <small>{{ c.width }} x {{ c.depth }}</small>
      </button>
    </aside>

    <div class="room" :style="{ width: px(Number(roomWidth)) + 'px',
                               height: px(Number(roomDepth)) + 'px' }">
      <div v-for="it in items" :key="it.id"
           class="furniture"
           :class="[ it.genre ? 'genre-' + it.genre : '',
                     { selected: it.id === selectedId,
                       overlap:  overlapIds.has(it.id) } ]"
           :style="{ left: px(it.x)+'px', top: px(it.y)+'px',
                     width: px(it.width)+'px', height: px(it.depth)+'px' }"
           @pointerdown.stop="startDrag($event, it)"
           @pointermove="onMove"
           @pointerup="endDrag">
         {{ it.name }}<br>
         <small>{{ it.width }} x {{ it.depth }}</small>
      </div>
    </div>
  </div>
</template>

<style>
body { font-family: sans-serif; }
.room_layout {
 display:flex;    /* 中に入っている要素（子要素）を横並びにする */
 align-items: center; /* 縦方向の中央揃え */
 gap: 12px; /* 要素同士の隙間を設定*/
}

.layout { display: flex; gap: 14px; margin-top: 12px; align-items: flex-start; }
.palette { display: flex; flex-direction: column; gap: 4px; width: 200px; }
.room { position: relative; border: 3px solid #22303e; background: #f0f3f5; touch-action: none; }
.furniture {
  position: absolute; background: #fff; border: 2px solid #5b7186;
  font-size: 11px; text-align: center; cursor: pointer; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  line-height: 1.3;
}
.furniture small { font-size: 9px; color: #666; }
.furniture.selected { border-color: #c94f2e; box-shadow: 0 0 0 3px rgba(201,79,46,.25); }
.furniture.overlap { border-color: #d9432f; background: #fdeae7; }
.genre-sleep    { background: #dfe9d2; border-color: #7d9262; }
.genre-storage  { background: #f3e6c8; border-color: #b39144; }
.genre-living   { background: #f4ddd3; border-color: #bd7457; }
.genre-appliance{ background: #e2e2ee; border-color: #7c7c9e; }
</style>
