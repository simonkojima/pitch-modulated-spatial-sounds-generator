# SpatialAudio
Spatial audio is a web app using Google's [Resonance audio](https://resonance-audio.github.io/resonance-audio/) and the browsers [web api](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) to convert mono audio stimuli to stereo by means of placing them in a virtual space. This software was developed as part of a bachelor thesis project aiming to help improve the AMUSE paradigm(https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3192990/). 

## Installation
If you do not want to bother with dependencies, downloading the [Docker image](spatial_audio_image.tar) and loading it in Docker is easiest:

```
docker load -i spatial_audio_image.tar
docker run -p 8080:80 spatial_audio
```

Installing the project with dependencies is an option as well:
```
git clone "https://gitlab.socsci.ru.nl/benjamin.kortenbach/spatial-audio-generator.git" && cd SpatialAudio

npm install
npm run build
docker build -t spatial_audio . 
docker run -p 8080:80 spatial_audio
```

visiting [localhost](http://localhost:8080) on port 8080 will open up the web app.

## Usage
![Alt text](src/assets/images/Preview.png?raw=true)

### UI
Virtual speakers can be added by clicking the "Add speaker" button. Speakers can be dragged around the screen and put into position. Selected speakers will be highlighted in yellow.

### Input
The web app expects a mono audio file which needs to be converted. This file can be uploaded by clicking the "browse" button in the input section. The file should be a .wav file.

Optionally, a JSON speaker configuration can be imported. This JSON file can be obtained by setting up a speaker configuration(positions, volumes, pitches etc) and pressing the "Export speaker configuration button". A few standard speaker configurations have been provided in the [speakerConfigs](SpeakerConfigs) folder.

### Audio source properties
The selected speaker's audio properties will be displayed in this section. Values like coordinates, pitch and volume can be manually filled in. 

### output
Output name: The name of the file which will be downloaded

Output format: A format string in the form of {id}{x}{y}{pitch}{volume}.wav. E.g. a format string of {id}_x{x}_y{y}.wav with output name of "blender.zip" will generate the following folder structure:

```
|blender.zip
|--- 1_x1_y3    //speaker with id 1 and coordinates (1;3)
|--- 2_x-1_y0   //speaker with id 2 and coordinates (-1;0)
|--- 3_x0_y0    //speaker with id 3 and coordinates (0;0)
|    //etc
```

Export speaker configuration: exports the current speaker configuration to a JSON file which can later be imported in the input section.

Preview: Plays every speaker sequentially starting from speaker with id=1. There is a 2 second pause between speakers being played.

Generate: If the user is happy with the current setup, this button will generate this final output that can be downloaded.