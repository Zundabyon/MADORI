<script setup>
import { ref } from 'vue'

const roomSizes = [
  { id: 1, name: '江戸間6畳(261×352)', width: 261, depth: 352 },
  { id: 2, name: '団地間6畳(255×340)', width: 255, depth: 340 },
  { id: 3, name: '中京間6畳(273×364)', width: 273, depth: 364 },
  { id: 4, name: '京間6畳(287×382)'  , width: 287, depth: 382 },
]

const roomWidth = ref('261') // 横幅の初期値を設定 refで追跡可能に
const roomDepth = ref('352') // 奥行の初期値を設定 refで追跡可能に

function selected(event) {
  const selectedId = Number(event.target.value)   // 文字列で届くので数値に変換
  // 配列の中身を1個ずつ取り出して仮に r と呼ぶ
  const found = roomSizes.find(r => r.id === selectedId)
  if (!found) return
  roomWidth.value = found.width
  roomDepth.value = found.depth
}

const selectedRoomId = ref(1)   // 今選ばれている規格のid。初期値は江戸間

function reset(){
  roomWidth.value = '261'
  roomDepth.value = '352'
  selectedRoomId.value = 1
}

</script>

<template>
  <div class="header">
   <h1>6畳1Kレイアウトシュミレーター MADORI</h1>
    <div class="room_layout">
      <p>畳の規格</p>
      <div class="room_select">
        <select v-model="selectedRoomId" @change="selected">
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
  </div>
</template>

<style>
body { font-family: sans-serif; }
.room_layout {
 display:flex;    /* 中に入っている要素（子要素）を横並びにする */
 align-items: center; /* 縦方向の中央揃え */
 gap: 12px; /* 要素同士の隙間を設定*/
}
</style>
