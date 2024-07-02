<template>
    <div class="c_speakercontainer" @mousedown="onDown" ref="speakerContainer" v-bind:style="{top: thisSpeaker.realY - 40 + 'px', left: thisSpeaker.realX - 40 + 'px'}">
        <h3 class="c_coordinates">({{thisSpeaker.relativeX}}; {{thisSpeaker.relativeY}})</h3>
        <img src="../assets/images/speaker.svg" class="c_speaker" v-bind:class="{'c_speaker_selected': selected}">
        <h3 class="c_id">{{this.id}}</h3> 
    </div>
</template>

<script>
    import {store} from "../Store.js"

    export default{
        name: "Speaker",
        computed:{
            selected(){
                if (store.selectedSpeakerId == this.thisSpeaker.id)
                    return true
                else
                    return false
            }
        },
        data(){
            return{
                thisSpeaker: store.getSpeakerFromId(this.id)
            }
        },
        methods: {
            onDown(e){
                e.preventDefault()
                document.onmousemove = this.elementDrag
                document.onmouseup = this.closeDragElement
                store.selectedSpeakerId = this.id
            },
            elementDrag(e){
                e.preventDefault()
                this.thisSpeaker.setRealX(e.clientX)
                this.thisSpeaker.setRealY(e.clientY)
            },
            closeDragElement(e){
                document.onmouseup = null
                document.onmousemove = null
            }
        },
        props:{
            id: Number
        }
    }
</script>

<style scoped>
.c_speakercontainer{
    width: 80px;
    height: 80px;
    position: absolute;
}

.c_id{
    margin: 0px;
    text-align: right;
    font-size: 13px;
}

.c_coordinates{
    margin: 0;
    font-size: 10px;
    text-align: left;
    width: 100px;
}

.c_speaker{
    width: 50px;
    height: 50px;
    margin-left: 17%;
}
.c_speaker_selected{
    filter: invert(77%) sepia(81%) saturate(1254%) hue-rotate(2deg) brightness(107%) contrast(105%);
}
</style>


