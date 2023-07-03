import { Note, noteToFrequency } from "../SSEQ/Note";
import { Resampler } from "./Resampler";
import { Sample } from "./Sample";

const whiteNoise = new Float32Array(48000);
for (let i = 0; i < whiteNoise.length; i++) {
	whiteNoise[i] = Math.random() * 2 - 1;
}

export class WhiteNoiseSample implements Sample {
	constructor() {
		
	}

	// Literally just guessing here, sounds about right
	baseFreq: number = noteToFrequency(Note.A8);

	getValue(targetSampleRate: number, index: number) {
		return Resampler.singleSample(
			whiteNoise,
			48000, 
			targetSampleRate,
			index,
			0,
			48000
		);
	}
}