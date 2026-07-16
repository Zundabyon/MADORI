<script setup>
import { ref } from 'vue'

const roomSizes = [
  { id: 1, name: '江戸間6畳(261×352)', width: 261, depth: 352 },
  { id: 2, name: '団地間6畳(255×340)', width: 255, depth: 340 },
  { id: 3, name: '中京間6畳(273×364)', width: 273, depth: 364 },
  { id: 4, name: '京間6畳(287×382)'  , width: 287, depth: 382 },
]

const room_width = ref('261')
const room_depth = ref('352')

function selected(event) {
  const selectedId = Number(event.target.value)   // 文字列で届くので数値に変換
  const found = roomSizes.find(roomName)
  if (!found) return
  room_width.value = roomName
  room_depth.value = roomName
}

</script>

<template>
  <div class="header">
    <h1>6畳1Kレイアウトシュミレーター MADORI</h1>
    <div class "room_layout">
      <p>畳の規格</p>
      <div class = "room_select">
        <select @change="room"> 
          <option v-for="roomName in roomList"
                  :key="roomName">
           {{roomName}}
          </option>
        </select>
      </div>  


      <p>幅</p> <input type = "text" v-model = "room_width">
      <p>奥行</p> <input type = "text" v-model = "room_depth">
      <button>リセット</button>
    </div>
    <br></br>
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
