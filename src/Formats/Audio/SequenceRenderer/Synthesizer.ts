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
		this.sink = sink;

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
	sink: (buffer: Float32Array[]) => void;
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
				const samples = this.channels[j].getValue();
				for (let k = 0; k < samples.length; k++) {
					sample[k] += samples[k] / 16;
				}
			}

			for (let j = 0; j < sample.length; j++) {
				this.buffer[j][this.pos] = sample[j];
			}
			
			this.pos++;
			this.time += this.timePerSample;

			if (this.pos >= this.bufferLength) {
				this.pos = 0;
				this.sink(this.buffer);
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
}