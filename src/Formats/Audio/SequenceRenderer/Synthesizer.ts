import { SBNK } from "../SBNK/SBNK";
import { Note } from "../SSEQ/Note";
import { SWAR } from "../SWAR/SWAR";
import { SynthChannel } from "./SynthChannel";
import { TrackInfo } from "./Track";

export class Synthesizer {
	constructor(bank: SBNK, swars: SWAR[], sampleRate: number, bpm: number, sink: (buffer: Float32Array[]) => void, bufferLength: number = 1024 * 4) {
		this.bank = bank;
		this.swars = swars;
		this.sampleRate = sampleRate;
		this.bpm = bpm;
		this.bufferLength = bufferLength;
		this.flush = sink;

		if (this.bufferLength % 2 !== 0) {
			throw new Error("Buffer length must be a multiple of 2");
		}

		this.buffer = [];
		
		for (let i = 0; i < 2; i++) {
			this.buffer[i] = new Float32Array(this.bufferLength);
		}

		this.timePerSample = 1 / this.sampleRate;

		this.channels = [];
		for (let i = 0; i < 16; i++) {
			this.channels[i] = new SynthChannel(sampleRate, bank, swars);
		}
	}

	bank: SBNK;
	swars: SWAR[];
	sampleRate: number;
	bpm: number;
	bufferLength: number;
	flush: (buffer: Float32Array[]) => void;
	timePerSample: number;

	sampleRemainder = 0;

	buffer: Float32Array[];
	pos = 0;
	time = 0;

	channels: SynthChannel[];

	tick(numSamples: number) {
		if (this.sampleRemainder > 1) {
			numSamples += Math.floor(this.sampleRemainder);
			this.sampleRemainder -= Math.floor(this.sampleRemainder);
		}

		for (let i = 0; i < this.channels.length; i++) {
			this.channels[i].envelopeTick(this.time);
		}

		for (let i = 0; i < numSamples; i++) {
			let sample: number[] = [0, 0];

			for (let j = 0; j < this.channels.length; j++) {
				const samples = this.channels[j].getValue(this.time);
				for (let k = 0; k < samples.length; k++) {
					// TODO?: This can cause clipping in non-float formats, but I don't really see a way to fix it
					// If we divide by 16 instead of 8, it's too quiet, and if we don't divide at all, it clips a lot
					sample[k] += samples[k] / 8;
				}
			}

			for (let j = 0; j < sample.length; j++) {
				this.buffer[j][this.pos] = sample[j];
			}
			
			this.pos++;
			this.time += this.timePerSample;

			if (this.pos >= this.bufferLength) {
				this.pos = 0;
				this.flush(this.buffer);
			}
		}

		this.sampleRemainder += numSamples - Math.floor(numSamples);
	}

	playNote(track: number, note: Note, velocity = 127, duration?: number, trackInfo?: TrackInfo) {
		// duration -> 48 = 1 quarter note
		// durationtime = (duration / 48) / (bpm / 60);
		let stopTime: number | undefined;
		if (duration) {
			stopTime = this.time + (duration / 48) / (this.bpm / 60);
		} else {
			stopTime = undefined;
		}

		this.channels[track].playNote(this.time, note, velocity, stopTime, trackInfo);
	}

	stopNote(track: number) {
		this.channels[track].releaseNote(this.time);
	}
}