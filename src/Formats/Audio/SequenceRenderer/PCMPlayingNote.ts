import { SWAV } from "../SWAV/SWAV";
import { Note, noteToFrequency } from "../SSEQ/Note";
import { Envelope } from "./Envelope";
import { Resampler } from "./Resampler";
import { PlayingNote } from "./PlayingNote";

export class PCMPlayingNote implements PlayingNote {
	constructor(note: Note, envelope: Envelope, swav: SWAV, baseNote: Note, sampleRate: number) {
		this.note = note;
		this.envelope = envelope;
		this.swav = swav;
		this.baseNote = baseNote;
		this.sampleRate = sampleRate;

		this.sample = Resampler.resample(swav.toPCM(), swav.dataBlock.samplingRate, sampleRate);

		if (swav.dataBlock.loop) {
			this.loopStartTime = swav.dataBlock.loopStart / swav.dataBlock.samplingRate;
			this.loopEndTime = swav.dataBlock.loopEnd / swav.dataBlock.samplingRate;
			// console.log(this);
		}
	}

	note: Note;
	envelope: Envelope;
	swav: SWAV;
	baseNote: Note;
	sampleRate: number;

	sample: Float32Array;
	loopStartTime: number;
	loopEndTime: number;

	release(time: number) {
		this.envelope.release(time);
	}

	getValue(time: number) {
		// There is not enough time for full high-quality sinc resampling, so this will have to do

		const ratio = noteToFrequency(this.note) / noteToFrequency(this.baseNote);
		// const ratio = 1;

		// Looping
		// This is not correct at all and I don't know what's wrong with it
		// I've been trying to fix it for the last few days and I'm giving up
		// Instead, I'm just going to do some weird blending stuff to make it sound alright

		const BLEND_WINDOW = 200;
		const SAMPLE_INTERVAL = 1 / this.sampleRate;
		const BLEND_INTERVAL = BLEND_WINDOW * SAMPLE_INTERVAL;

		const actualLoopStartTime = this.loopStartTime / ratio + BLEND_INTERVAL;
		const sampleEndTime = (this.sample.length / this.sampleRate) / ratio;
		// const sampleEndTime = (this.loopStartTime + this.loopEndTime) / ratio;

		let t = (time - this.envelope.startTime);
		if (this.swav.dataBlock.loop) {
			if (t > sampleEndTime) {
				t = (t - actualLoopStartTime) % (sampleEndTime - actualLoopStartTime) + actualLoopStartTime;
			}

			if (t > sampleEndTime - BLEND_INTERVAL) {
				const blendA = (t - (sampleEndTime - BLEND_INTERVAL)) / BLEND_INTERVAL;
				const blendB = 1 - blendA;

				// if (blendB > 0.8) {
				// 	console.log(blendA, blendB);
				// }

				const sampleRight = this.sample[Math.floor(t * this.sampleRate * ratio)];
				const sampleLeft = this.sample[Math.floor((t - (sampleEndTime - actualLoopStartTime)) * this.sampleRate * ratio)];

				return this.envelope.getGain(time) * (sampleLeft * blendA + sampleRight * blendB);
			}
		}

		const sample = this.sample[Math.floor(t * this.sampleRate * ratio)];

		if (sample === undefined) {
			return 0;
		}

		return this.envelope.getGain(time) * sample;
	}
}