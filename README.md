# nitro-fs

## About
nitro-fs is a work-in-progress TypeScript library for reading files on the Nintendo DS ROM Filesystem. It is also able to parse and convert some popular file formats used on the Nintendo DS (mainly SDAT as of right now).

Note that this library is still in development and things may change. If you find any bugs or have any suggestions, feel free to open an issue or pull request.

If you need help with something, feel free to ask me on Discord (danielpxl).

## Supported Formats
- SDAT (Sound Data)
	- SSEQ (Sound Sequence)
	- STRM (Sound Stream)
	- SWAR (Sound Wave Archive)
	- SBNK (Sound Bank)
	- SSAR (Sound Sequence Archive)
- BTX (3D Model Texture)

## Installation
```bash
npm install nitro-fs
```

## Usage
### Initializing NitroFS
```typescript
import { NitroFS } from "nitro-fs";

// File input element for selecting a ROM
const fileInput = document.getElementById("fileInput") as HTMLInputElement;

fileInput.addEventListener("change", async () => {
	// Initialize NitroFS with the ROM buffer
	const rom = await fileInput.files.item(0).arrayBuffer();
	const nitroFS = NitroFS.fromRom(rom);
});
```

### Reading the ROM header
```typescript
// Read the ROM header
const header = nitroFS.cartridgeHeader;
console.log(header.gameTitle);
```

### Reading a file as an ArrayBuffer
```typescript
// Read a file
const buffer = nitroFS.readFile("data/sound/sound_data.sdat");
// Do something with the buffer
```

### Parsing an SDAT file
```typescript
// Add imports at the top
import { Audio, BufferReader } from "nitro-fs";
```
```typescript
// Read the file
const file = nitroFS.readFile("data/sound/sound_data.sdat");

// Convert ArrayBuffer to BufferReader (makes it easier to read the file)
const reader = BufferReader.new(file);

// Parse the SDAT file
const sdat = new Audio.SDAT(reader);

console.log(sdat);
```

### Converting an SSEQ file to PCM
```typescript
// Assuming you have already parsed the SDAT file

// Desired sample rate and number of seconds to render
const sampleRate = 48000;
const numSeconds = 10;

// Create a (stereo) buffer to store the audio data
const audioBuffer: Float32Array[] = new Array(2);
for (let i = 0; i < 2; i++) {
	// Create a buffer for each channel
	audioBuffer[i] = new Float32Array(sampleRate * numSeconds);
}

// Create a sink function to handle the audio data
let offset = 0;
let done = false;
const sink = (chunk: Float32Array[]) => {
	// If the offset is greater than the length of the buffer, we're done
	if (offset + chunk[0].length > chunk[0].length) {
		done = true;
		return;
	}

	// Copy the audio data into the buffer
	for (let i = 0; i < 2; i++) {
		audioBuffer[i].set(chunk[i], offset);
	}

	offset += chunk[0].length;
}

// Initialize the sequence renderer
const renderer = new Audio.SequenceRenderer({
	file: Audio.SequenceRenderer.makeInfoSSEQ(sdat, "SEQ_BA_AKAGI")
	sampleRate: sampleRate, 
	sink: sink
});

// Render the sequence until it's done
while (!done) {
	renderer.tick();
}

// Do something with the audio buffer
```

## Known Issues
- The SequenceRenderer only supports a subset of the available commands (see [here](src/Formats/Audio/SequenceRenderer/Track.ts) for more info). The most important ones are supported though, and most games already work fine.
- SSARs are parsed correctly (I think?), but the SequenceRenderer doesn't really support them yet.

## Thanks to:
- [Martin Korth's gbatek](https://problemkaputt.de/gbatek.htm) - documentation on everything related to the DS
- [Gota7's SDAT specifications](https://gota7.github.io/NitroStudio2/#file-specifications) - documentation on the SDAT file format
- [kiwi.ds](https://web.archive.org/web/20201021055354/https://sites.google.com/site/kiwids/sdat.html) - documentation on the SDAT file format
- [Gota7's Nitro Studio 2](https://gota7.github.io/NitroStudio2/) - a tool for viewing and editing SDAT files
- [Kermalis' VGMusicStudio](https://github.com/Kermalis/VGMusicStudio) - a tool for playing sequence files
- [VGMTrans](https://github.com/vgmtrans/vgmtrans) - inspiring me to make a sequence renderer