// Vue.js本体からcreateApp()関数をインポート 
import { createApp } from 'vue'
// これまでコーディングをしてきたApp.vueファイルをAppとしてインポート
import App from './App.vue'
// createApp()はVueアプリケーションを作成する処理でここには
// 起点となる単一コンポーネントファイル（src）で渡す
// mount()はcreateApp()で作ったVueアプリケーションを表示するメソッド
// index.htmlのどのタグに表示するのかを引数で指定
// この場合は#appとあり、これがまさに先ほどのidがappのdivタグ内に
// レンダリングされて表示されるという仕組み
createApp(App).mount('#app')
