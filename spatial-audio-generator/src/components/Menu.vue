<template>
    <div class="c_container">
        <div>
            <h1 class="c_title">Spatial audio generator</h1>
            <h3 class="c_title">By: Benjamin Kortenbach</h3>
        </div>

        <div class="c_horizontalLine"></div>

        <h3 class="c_sectionTitle">Input:</h3>
        <div class="c_input">
            <div>
                <label class="c_inputAudio">Mono audio file:</label> 
                <input type="file" @change="onAudioFileUpload">
            </div>
            <button @click="onConfigImportClick" class="c_outputButton">Import speaker configuration</button> 
            <input type="file" @change="onConfigFileUpload" ref="configUpload" hidden>
        </div>
        <div class="c_horizontalLine"></div>

        <h3 class="c_sectionTitle">Audio source properties:</h3>
        <div class="c_audiosourceProperties">
            <h3>id: {{this.selectedSpeakerId}}</h3>
            <div>
                <label>x:</label> <input type="text" class="c_textinput" v-model="this.selectedSpeakerX">
            </div>
            <div>
                <label>y:</label> <input type="text" class="c_textinput" v-model="this.selectedSpeakerY">
            </div>
            <div>
                <label>pitch(semitones):</label> <input type="text" class="c_textinput" v-model="this.selectedSpeakerPitch">
            </div>
            <div>
                <label>Volume:</label> <input type="text" class="c_textinput" v-model="this.selectedSpeakerVolume">
            </div>
        </div>

        <div class="c_horizontalLine"></div>

        <h3 class="c_sectionTitle">Output:</h3>
        <div class="c_output">
            <div class="c_fileOutput">
                <div>
                    <label>Output name: </label> <input class="c_textinput" type="text" placeholder="files.zip" v-model="this.fileName">
                </div>
                <div>
                    <label>Output format: </label> <input class="c_textinput" type="text" placeholder="{id}_{volume}_{pitch}_{x}_{y}.wav" v-model="this.fileNamingFormat">
                </div>
            </div>
            <button @click="onConfigExportClick" class="c_outputButton">Export speaker configuration</button>
            <button @click="onPreviewClick" class="c_outputButton">Preview</button>
            <button @click="onGenerateClick" class="c_outputButton">Generate!</button>
        </div>
    </div>
</template>

<script>
    import {store} from "../Store"

    export default{
        name: "Menu",
        computed:{  
            selectedSpeakerId(){
                return store.selectedSpeakerId
            },
            selectedSpeakerX:{
                get(){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null)
                        return speaker.relativeX
                    else
                        return ""
                }, 
                set(val){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null && !isNaN(val) && val!="")
                        speaker.setRelativeX(parseFloat(val))
                }
                
            },
            selectedSpeakerY:{
                get(){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null)
                        return speaker.relativeY
                    else
                        return ""
                }, 
                set(val){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null && !isNaN(val) && val!="")
                        speaker.setRelativeY(parseFloat(val))
                }
                
            },
            selectedSpeakerPitch:{
                get(){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null)
                        return speaker.pitch
                    else
                        return ""
                }, 
                set(val){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null && !isNaN(val) && val!="")
                        speaker.pitch = parseFloat(val)
                }
                
            },
            selectedSpeakerVolume:{
                get(){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null)
                        return speaker.volume
                    else
                        return ""
                }, 
                set(val){
                    let speaker = store.getSpeakerFromId(store.selectedSpeakerId)
                    if(speaker != null && !isNaN(val) && val!="")
                        speaker.volume = parseFloat(val)
                }
                
            }
        },
        methods: {
            onAudioFileUpload(e){
                let fileStruct = e.target.files[0]
                if(fileStruct.name.split(".").at(-1) != "wav"){
                    alert("Must be .wav file!")
                    return
                }
                let freader = new FileReader();
                let ctx = new AudioContext();

                freader.onload = function (e){
                    ctx.decodeAudioData(e.target.result, function (buff) {
                    store.monoAudioBuffer = buff
                 })}
                
                freader.readAsArrayBuffer(fileStruct);
            },
            onConfigFileUpload(e){
                let fileStruct = e.target.files[0]
                if(fileStruct.name.split(".").at(-1) != "json"){
                    alert("Must be .json file!")
                    return
                }

                let freader = new FileReader();
                freader.onload = function (e){
                    let s = null
                    try{
                        s = JSON.parse(e.target.result)
                    } catch{
                        alert("Cannot parse JSON file!")
                        return
                    }
                    if (s != null){
                        for (let i=0; i<s.length; i++){
                            store.addSpeaker(s[i].id, s[i].relativeX, s[i].relativeY, s[i].volume, s[i].pitch)
                        }
                    }
                }
                
                freader.readAsText(e.target.files[0])

            },
            onPreviewClick(e){
                store.playPreview()
            },
            onGenerateClick(e){
                store.renderSpeakersToWav(this.fileName, this.fileNamingFormat)
            },
            onConfigImportClick(e){
                this.$refs.configUpload.click()
            },
            onConfigExportClick(e){
                store.exportConfig()
            }
        },
        data(){
            return{
                fileName: "",
                fileNamingFormat: ""
            }
        }
    }
</script>

<style scoped>
    .c_container{
        background: #f2f2f2;
        width: 30%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .c_audiosourceProperties{
        margin-left: 5%;
        display: flex;
        flex-direction: column;
        height: 150px;
        justify-content: space-evenly;
    }

    .c_textinput{
        width: 250px;
        height: 20px;
        margin-right: 10%;
        float: right;
    }

    .c_horizontalLine{
        height: 1px;
        background-color: #b8b4b4;
        width: 90%;
        margin-left: auto;
        margin-right: auto;
    }

    .c_output{
        display: flex;
        flex-direction: column;
        margin-bottom: 5%;
        justify-content: space-between;
        height: 20%;
    }

    .c_outputButton{
        width: 80%;
        margin: auto;
        height: 30px;
    }

    .c_title{
        font-family: Impact, Charcoal, sans-serif;
        font-weight: 400;
        font-variant: small-caps;
        text-transform: uppercase;
        text-align: center;
    }

    .c_inputAudio{
        margin-left: 5%;
        margin-right: 18%;
        height: 50%;
    }

    .c_sectionTitle{
        margin-left: 5%;
        margin-top: 0px;
        font-size: 20px;
        margin-bottom: 0px;
    }

    .c_fileOutput{
        margin-left: 5%;
        display: flex;
        flex-direction: column;
    }

    .c_input{
        display:flex;
        flex-direction: column;
        height: 70px;
    }
</style>