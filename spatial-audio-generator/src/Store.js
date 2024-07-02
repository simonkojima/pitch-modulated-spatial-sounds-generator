import { reactive } from 'vue'
import {ResonanceAudio} from "resonance-audio"
import { saveAs } from 'file-saver'
import JSZip from 'jszip'



/*
The variable below can be imported by Vue components. Once imported, a component can read/write to the variables contained in store, all
while maintaining reactivity (e.g. component A changes store.property1, component B will automatically update any HTML elements dependent on
store.property1).
*/
export const store = reactive({
    speakers: [], //array of speakers currently in the scene. 
    monoAudioBuffer: null, //The raw .wav data from the currently loaded .wav file
    selectedSpeakerId: 0, //id of speaker that user last clicked on
    headCoords: null, //real coordinates of head. Used to calculate relative coordinates for speaker
    generating: false, //true if web app is currently generating new audio
    getSpeakerFromId(id){
        for (let i =0; i<this.speakers.length; i++){
            if(this.speakers[i].id == id){
                return this.speakers[i]
            }
        }
    },
    /*
    Every speaker has 2 coordinate systems: "real" and "relative". Real is the actual position of a speaker on the screen. This position
    is meaured in pixels from the top-left corner. The relative coordinate system takes the position of the head icon as (0, 0). The units
    in the system have been scaled down by a factor 200. If a component in Vue wants to change the position of a speaker, it should use
    the specified getters and setters, because if a relative position gets updated, so should the real position and the other way around.
    */
    addSpeaker(_id, _relativeX, _relativeY, _volume, _pitch){ 
        let setRealX = function(val){
            this.realX = val
            this.relativeX = (this.realX - this._headCoords.x) / 200
        }

        let setRealY = function(val){
            this.realY = val
            this.relativeY = (this._headCoords.y - this.realY) / 200
        }

        let setRelativeX = function(val){
            this.relativeX = val
            this.realX = this.relativeX * 200 + this._headCoords.x
        }

        let setRelativeY = function(val){
            this.relativeY = val
            this.realY = window.innerHeight - (this.relativeY * 200 + this._headCoords.y)
        }

        let id = _id
        let realX = _relativeX * 200 + this.headCoords.x
        let realY = window.innerHeight - (_relativeY * 200 + this.headCoords.y)
        this.speakers.push({
            "id": id,
            "realX":realX,
            "realY":realY,
            "relativeX": _relativeX,
            "relativeY":_relativeY,
            "pitch": _pitch,
            "volume": _volume,
            "setRealX": setRealX,
            "setRealY": setRealY,
            "setRelativeX": setRelativeX,
            "setRelativeY": setRelativeY,
            "_headCoords": this.headCoords
        })
    },
    async playPreview(){ //plays sound from every speaker 
        if(this.monoAudioBuffer == null){
            alert("Please select an audio file to be rendered first!")
            return
        }
        if(this.speakers.length == 0){
            alert("Please add at least one speaker to the scene")
            return
        }
        let audioCtx = new AudioContext()
        let resonanceAudioScene = new ResonanceAudio(audioCtx)
        resonanceAudioScene.output.connect(audioCtx.destination)
        for (let i=0; i<this.speakers.length; i++){
            playAudio(this.speakers[i], this.monoAudioBuffer, audioCtx, resonanceAudioScene)
            await new Promise(r => setTimeout(r, 2000));
        }
    },
    async renderSpeakersToWav(fileName, fileNamingFormat){
        if(this.monoAudioBuffer == null){
            alert("Please select an audio file to be rendered first!")
            return
        }
        if(this.speakers.length == 0){
            alert("Please add at least one speaker to the scene")
            return
        }

        store.generating = true
        let wavFiles = []
        warnUserPitch(this.speakers)
        for (let i=0; i<this.speakers.length; i++){
            let result = await renderSpeakerToWav(this.speakers[i], this.monoAudioBuffer)
            wavFiles.push(result)
        }
        store.generating = false
        makeDownload(wavFiles, fileName, fileNamingFormat)
    },
    exportConfig(){
        if(this.speakers.length > 0){
            let jsonBlob = new Blob([JSON.stringify(this.speakers)], {type: "application/json"})
            makeDownload([jsonBlob], "config.json", null)
        }
    }
})

/**
 * Plays the audio from a specified speaker.
 * @param {*} speaker The speaker the audio should be played from 
 * @param {*} buffer  The audio buffer the speaker should play
 * @param {*} audioContext The audio context in which the speaker will be created
 * @param {*} resonanceAudioScene The resonance audio scene in which the speaker will be created
 */
function playAudio(speaker, buffer, audioContext, resonanceAudioScene){
    let source = audioContext.createBufferSource()
    source.buffer = buffer


    let resonanceSource = resonanceAudioScene.createSource()
    resonanceSource.setPosition(speaker.relativeX, speaker.relativeY, 0)

    let gainNode = audioContext.createGain()
    gainNode.gain.value = speaker.volume

    source.detune.value = speaker.pitch * 100

    source.connect(gainNode)
    gainNode.connect(resonanceSource.input)
    source.start()
}


/**
 * Generates offline audio context(samplerate=4410) of specified length
 * @param {*} duration Length of the audio context
 * @returns OfflineAudioContext object
 */
function createOfflineAudioCtx(duration){
    return new OfflineAudioContext({
        numberOfChannels: 2,
        length: 44100 * duration,
        sampleRate: 44100
    })
}

/**
 * Given a speaker and audio buffer, applies all transformations and renders new audiobuffer, which gets converted to .wav format
 * @param {*} speaker Speaker that should be rendered
 * @param {*} audioBuf Audio that speaker will play
 * @returns .wav file blob
 */
async function renderSpeakerToWav(speaker, audioBuf){
    let offlineAudioCtx = createOfflineAudioCtx(audioBuf.duration)
    let resonanceAudioScene = new ResonanceAudio(offlineAudioCtx)
    resonanceAudioScene.output.connect(offlineAudioCtx.destination)

    let source = offlineAudioCtx.createBufferSource()
    source.buffer = audioBuf

    let resonanceSource = resonanceAudioScene.createSource()
    resonanceSource.setPosition(speaker.relativeX, speaker.relativeY, 0)

    let gainNode = offlineAudioCtx.createGain()
    gainNode.gain.value = speaker.volume

    source.detune.value = speaker.pitch * 100
    source.connect(gainNode)
    gainNode.connect(resonanceSource.input)
    source.start()

    await new Promise(r => setTimeout(r, 200)); //this pause needs to be here so that nodes can finish processing
    let renderedBuffer = await offlineAudioCtx.startRendering()

    return bufferToWave(renderedBuffer, offlineAudioCtx.length);
}

/**
 * Generates download popup in which you can download the newly processed files. function will make download prompt for zip containing files
 * @param {*} files Array of blobs
 * @param {*} _filename Name of output file
 * @param {*} _fileNamingFormat When files.length>1, the files will be zipped. The naming scheme of the files can be specified with this parameter.
 *                              This parameter should be a format string, e.g. {id}.wav -> results in the files being 1.wav 2.wav etc.
 *                              The parameters that can be specified in the format string are the following: {id}{x}{y}{pitch}{volume}                              
 */
function makeDownload(files, _fileName, _fileNamingFormat){
    let fileName = "files.zip"
    if(_fileName != null && _fileName != "")
        fileName = _fileName

    if(files.length == 0){
        throw "No file specified for download!"
    } else if(files.length == 1){
        saveAs(files[0], fileName)
    } 
    else{
        makeZip(files, _fileNamingFormat).then( result => {
            saveAs(result, fileName)
        })
    }
}

/**
 * Zips array of blobs.
 * @param {*} files Array of blobs to be zipped
 * @param {*} _fileNamingFormat see documentation of makeDownload
 * @returns Zip object blob
 */
async function makeZip(files, _fileNamingFormat){
    let zip = new JSZip()
    if(_fileNamingFormat != null && _fileNamingFormat != ""){
        for (let i=0; i<files.length; i++){
            zip.file(speakerFormatString(_fileNamingFormat, store.getSpeakerFromId(i)), files[i])
        }
    } else{
        for (let i=0; i<files.length; i++){
            zip.file((i+1).toString()+".wav", files[i])
        }
    }
    return await zip.generateAsync({type: 'blob'}) 
}

/**
 * Given a format string and a speaker, replaces all format markers "{" "}" with the values of the appropriate parameters
 * @param {*} _fileNamingFormat Format string
 * @param {*} speaker Speaker which parameters will be used to populate format string
 * @returns 
 */
function speakerFormatString(_fileNamingFormat, speaker){
    let result = _fileNamingFormat
    
    if(result.includes("{id}"))
        result = result.replace("{id}", speaker.id)
    if(result.includes("{x}"))
        result = result.replace("{x}", speaker.relativeX)
    if(result.includes("{y}"))
        result = result.replace("{y}", speaker.relativeY)
    if(result.includes("{volume}"))
        result = result.replace("{volume}", speaker.volume)
    if(result.includes("{pitch}"))
        result = result.replace("{pitch}", speaker.pitch)

    return result
}

/**
 * Given an audio buffer and its length, generates a .wav file from audio buffer.
 * @param {*} abuffer Buffer from which wav file should be generated
 * @param {*} len Length of buffer
 * @returns 
 */
function bufferToWave(abuffer, len) {
    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;
  
    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"
  
    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)
  
    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length
  
    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));
  
    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // write 16-bit sample
        pos += 2;
      }
      offset++                                     // next source sample
    }
    // create Blob
    return new Blob([buffer], {type: "audio/wav"});
  
    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
  
    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }


let userWarned = false
/**
 * This function makes sure the user is aware that at the moment, changing pitch is done in the wrong way.
 * @param {*} speakers 
 */
function warnUserPitch(speakers){
    let shouldWarn = false
    for (let i=0; i<speakers.length; i++){
        if (speakers[i].pitch != 0)
            shouldWarn = true
    }

    if(!userWarned && shouldWarn){
        alert("WARNING: At the moment, pitch changing has been implemented by simply stretching the audio file, resulting in different " +
            "length audio stimuli. The implementation of pitch changing should be done via a proper pitch-shift.")
        userWarned = true
     }
}