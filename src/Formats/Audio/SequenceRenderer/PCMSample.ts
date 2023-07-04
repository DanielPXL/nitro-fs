import { Note, noteToFrequency } from "../SSEQ/Note";
import { SWAV } from "../SWAV/SWAV";
import { Resampler } from "./Resampler";
import { Sample } from "./Sample";

export class PCMSample implements Sample {
	constructor(swav: SWAV, baseNote: Note) {
		this.swav = swav;
		this.sample = swav.toPCM();
		this.baseFreq = noteToFrequency(baseNote);
	}

	swav: SWAV;
	sample: Float32Array;
	baseFreq: number;

	getValue(targetSampleRate: number, index: number) {
		return Resampler.singleSample(
			this.sample,
			this.swav.dataBlock.sampleRate, 
			targetSampleRate,
			index,
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopStart : undefined,
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopLength : undefined
		);
	}
}