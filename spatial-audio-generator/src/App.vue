<template>
  <div class="c_appcontainer">
    <SpeakerCanvas />
    <GeneratingScreen v-if="generating"/>
    <Menu />
  </div>
</template>

<script>
  import Menu from "./components/Menu.vue"
  import SpeakerCanvas from "./components/SpeakerCanvas.vue"
  import GeneratingScreen from "./components/GeneratingScreen.vue"
  import {store} from "./Store.js"

  export default {
    name: "App",
    components:{
      Menu,
      SpeakerCanvas,
      GeneratingScreen
    },
    computed:{
      generating(){
        return store.generating
      }
    }
  }
</script>

<style>
  .c_appcontainer{
    overflow: auto;
    position: fixed;
    height:100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
  }

  html, body {
            height: 100%;
            margin: 0;
        }
</style>