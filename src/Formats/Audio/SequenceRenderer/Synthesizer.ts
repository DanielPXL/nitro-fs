import { DirectInstrument, Instrument } from "../SBNK/Instrument";
import { SBNK } from "../SBNK/SBNK";
import { BankInfo } from "../SDAT/FileInfo";
import { Note, noteToFrequency } from "../SSEQ/Note";
import { SWAR } from "../SWAR/SWAR";
import { Envelope } from "./Envelope";
import { PCMPlayingNote } from "./PCMPlayingNote";
import { SynthChannel } from "./SynthChannel";

export class Synthesizer {
	constructor(bank: SBNK, swars: SWAR[], sampleRate: number, bpm: number, sink: (buffer: Float32Array) => void, bufferLength: number = 1024 * 4) {
		this.bank = bank;
		this.swars = swars;
		this.sampleRate = sampleRate;
		this.bpm = bpm;
		this.bufferLength = bufferLength;
		this.flush = sink;

		if (this.bufferLength % 2 !== 0) {
			throw new Error("Buffer length must be a multiple of 2");
		}

		this.buffer = new Float32Array(this.bufferLength);
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
	flush: (buffer: Float32Array) => void;
	timePerSample: number;

	buffer: Float32Array;
	pos = 0;
	time = 0;

	channels: SynthChannel[];

	tick(numSamples: number) {
		// const fullTime = this.time + (this.pos * this.timePerSample);

		for (let i = 0; i < numSamples; i++) {
			let sample = 0;

			for (let j = 0; j < this.channels.length; j++) {
				sample += this.channels[j].getValue(this.time);
			}

			this.buffer[this.pos] = sample;
			this.pos++;
			this.time += this.timePerSample;
		}

		if (this.pos >= this.bufferLength) {
			this.pos = 0;
			this.flush(this.buffer);
		}
	}

	playNote(track: number, note: Note, velocity = 127, duration?: number) {
		// duration -> 48 = 1 quarter note
		// durationtime = (duration / 48) / (bpm / 60);
		let stopTime: number | undefined;
		if (duration) {
			stopTime = this.time + (duration / 48) / (this.bpm / 60);
		} else {
			stopTime = undefined;
		}

		this.channels[track].playNote(this.time, note, velocity, stopTime);
	}

	stopNote(track: number) {
		this.channels[track].releaseNote(this.time);
	}
}