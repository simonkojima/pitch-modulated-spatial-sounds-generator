<template>
    <div class="c_container">
        <button class="c_speakerbtn" @click="addSpeaker">Add speaker</button>
        <img src="../assets/images/head_icon.png" class="c_head" ref="headIcon">
        <Speaker v-for="speaker in speakers" :key="speaker.id" :id="speaker.id" />
    </div>
</template>

<script>
    import Speaker from "./Speaker.vue"
    import {store} from "../Store.js"

    export default{
        name: "SpeakerCanvas",
        components:{
            Speaker
        }, 
        computed:{
            speakers(){
                return store.speakers
            }
        },
        methods: {
            addSpeaker(e){
                let id = store.speakers.length + 1 //make index start from 1
                let x = parseInt(Math.random() * 4 - 2)
                let y = parseInt(Math.random() * 4 - 2)
                store.addSpeaker(id, x, y, 1, 0)
            }
        },
        mounted(){ //as soon as this component is mounted, supply coordinates of head to store.js
            let leftVal = window.getComputedStyle(this.$refs.headIcon).left //returns left css property: ...px
            let x = parseInt(leftVal.substring(0, leftVal.length-2))
            let topVal = window.getComputedStyle(this.$refs.headIcon).top
            let y = parseInt(topVal.substring(0, topVal.length-2))
            store.headCoords = {"x": x, "y": y}
        }
    }
</script>

<style scoped>
.c_container{
    background: #ceeaea;
    width: 70%;
    position: relative;
}

.c_speakerbtn{
    position: absolute;
    top: 5%;
    right: 5%;
    width: 130px;
    height: 40px;
}

.c_head{
    position: absolute;
    width: 200px;
    height: 200px;
    left: 50%;
    top: 50%;
    margin-left: -100px;
    margin-top: -100px;
}
</style>