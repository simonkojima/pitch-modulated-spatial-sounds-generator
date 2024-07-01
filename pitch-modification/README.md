# How to use
1. compile `pitch-modification/libsbsms-2.3.0/example/src/sbsms-convert.cpp` and generate `sbsms-convert.exe` in to `pitch-modification/sbsms-convert/sbsms-convert.exe`. Please note that it may also require some other libraries such as `pthreadVC2.dll`, `sndfile.dll`, `sbsms.dll`. The source code for generating `sbsms.dll` is also located in `pitch-modification/libsbsms-2.3.0/src`
2. Prepare audio files to be converted, and locate it in `HOME_DIRECTORY/Documents/pitch-modulated-word-stimuli`. It should be structured as descripted in the Section below (`Audio FIle Folder Structure`)
3. run `pitch-modification/pitch_modification_sbsms.py`
4. It will pitch-modified audio files in `HOME_DIRECTORY/Documents/pitch-modulated-word-stimuli/words` and  `HOME_DIRECTORY/Documents/pitch-modulated-word-stimuli/sentences`.

# Audio File Folder Structure
```
- HOME_DIRECTORY/Documents/pitch-modulated-wrod-stimuli
|- sentences
 |- 6d
  |- Blender
  |- Groente
  |- (sentences...)
 |- stereo
  |- (sentences...)
|- words
 |- 6d
  |- Blender
  |- Groente
  |- (words...)
 |- stereo
  |- Blender
  |- Groente
  |- (words...)
```

## sbsms-convert
it may require the following libraries. The authors compiled these packages and sbsms-convert with `msvc2010`.

```
sbsms.dll
sndfile.dll
pthreadVC2.dll
```

## python
```
python 3.8
librosa 0.9.2
pysoundfile 0.9.0
```