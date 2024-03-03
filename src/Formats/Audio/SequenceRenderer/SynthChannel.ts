import { DirectInstrument, DrumSetInstrument, InstrumentType, KeySplitInstrument } from "../SBNK/Instrument";
import { NoteInfo } from "../SBNK/NoteInfo";
import { SBNK } from "../SBNK/SBNK";
import { BankInfo } from "../SDAT/FileInfo";
import { ModType } from "../SSEQ/Command";
import { Note } from "../SSEQ/Note";
import { SWAR } from "../SWAR/SWAR";
import { Envelope } from "./Envelope";
import { Sample } from "./Sample";
import { PCMSample } from "./PCMSample";
import { PSGSample } from "./PSGSample";
import { WhiteNoiseSample } from "./WhiteNoiseSample";
import { PlayingNote } from "./PlayingNote";
import { TrackInfo } from "./Track";

export class SynthChannel {
	constructor(sampleRate: number, bank: SBNK, swars: SWAR[]) {
		this.sampleRate = sampleRate;
		this.bank = bank;
		this.swars = swars;
	}

	sampleRate: number;
	bank: SBNK;
	bankInfo: BankInfo;
	swars: SWAR[];
	
	programNumber = 0;

	pan = 0;
	playing: PlayingNote[] = [];

	getValue() {
		let leftSum = 0;
		let rightSum = 0;
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i]) {
				const pan = Math.min(1, Math.max(0, this.pan + this.playing[i].pan - 0.5));
				const leftWeight = 1 - pan;
				const rightWeight = 1 + pan;

				const value = this.playing[i].getValue();

				leftSum += value * leftWeight;
				rightSum += value * rightWeight;
			}
		}

		return [leftSum, rightSum];
	}
	
	playNote(time: number, note: Note, velocity: number, stopTime?: number, trackInfo?: TrackInfo) {
		const { noteInfo, isPSG, isWhiteNoise } = this.getNoteInfo(note);
		if (noteInfo === null || noteInfo === undefined) {
			console.warn(`Note ${Note[note]} not found in instrument ${this.programNumber}`);
			return;
		}

		const envelope = new Envelope(time, noteInfo.attack, noteInfo.decay, noteInfo.sustain, noteInfo.release, stopTime);

		let sample: Sample;
		if (isPSG) {
			const dutyCycle = noteInfo.waveId;
			sample = new PSGSample(dutyCycle);
		} else if (isWhiteNoise) {
			sample = new WhiteNoiseSample();
		} else {
			const swar = this.swars[noteInfo.waveArchiveId];
			const swav = swar.waves[noteInfo.waveId];

			if (swav === undefined) {
				console.warn(`Wave ${noteInfo.waveId} not found in wave archive ${noteInfo.waveArchiveId}`);
				return;
			}

			sample = new PCMSample(swav, noteInfo.baseNote);
		}

		const index = this.findFirstEmpty();
		this.playing[index] = new PlayingNote(note, envelope, sample, this.sampleRate, velocity, trackInfo, noteInfo.pan, () => {
			this.playing[index] = null;
		});
	}

	getNoteInfo(note: Note): { noteInfo: NoteInfo, isPSG: boolean, isWhiteNoise: boolean } {
		if (this.bank.instruments[this.programNumber] === undefined) {
			return { noteInfo: null, isPSG: false, isWhiteNoise: false };
		}

		switch (this.bank.instruments[this.programNumber].type) {
			case InstrumentType.WhiteNoise: {
				const instrument = this.bank.instruments[this.programNumber] as DirectInstrument;
				return { noteInfo: instrument.noteInfo, isPSG: false, isWhiteNoise: true };
			}

			case InstrumentType.PSG: {
				const instrument = this.bank.instruments[this.programNumber] as DirectInstrument;
				return { noteInfo: instrument.noteInfo, isPSG: true, isWhiteNoise: false };
			}

			case InstrumentType.PCM:
			case InstrumentType.DirectPCM: {
				const instrument = this.bank.instruments[this.programNumber] as DirectInstrument;
				return { noteInfo: instrument.noteInfo, isPSG: false, isWhiteNoise: false };
			}

			case InstrumentType.DrumSet: {
				const drumSet = this.bank.instruments[this.programNumber] as DrumSetInstrument;

				if (note < drumSet.lowerKey || note > drumSet.upperKey) {
					return { noteInfo: null, isPSG: false, isWhiteNoise: false };
				}

				const instrument = drumSet.instruments[note - drumSet.lowerKey];
				return { noteInfo: instrument.noteInfo, isPSG: false, isWhiteNoise: false };
			}

			case InstrumentType.KeySplit: {
				const keySplit = this.bank.instruments[this.programNumber] as KeySplitInstrument;
				
				// Find region
				const regions = keySplit.regions;
				let region = 0;
				let i = 0;
				while (true) {
					if (note < regions[i]) {
						break;
					}

					region++;
					i++;

					if (i >= keySplit.regions.length) {
						return { noteInfo: null, isPSG: false, isWhiteNoise: false };
					}
				}

				const instrument = keySplit.instruments[region];
				return { noteInfo: instrument.noteInfo, isPSG: false, isWhiteNoise: false };			
			}
		}
	}

	envelopeTick(time: number) {
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i]) {
				this.playing[i].envelope.tick(time);
				this.playing[i].modulationTick(time);
				this.playing[i].portamentoTick();
			}
		}
	}

	changeProgram(programNumber: number) {
		this.programNumber = programNumber;
	}

	pitchBend(semitones: number) {
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i]) {
				this.playing[i].pitchBend(semitones);
			}
		}
	}

	setVolume(volume1: number, volume2: number) {
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i]) {
				this.playing[i].setVolume(volume1, volume2);
			}
		}
	}

	setModulation(modDepth: number, modRange: number, modSpeed: number, modDelay: number, modType: ModType) {
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i]) {
				this.playing[i].setModulation(modDepth, modRange, modSpeed, modDelay, modType);
			}
		}
	}

	private findFirstEmpty() {
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i] === null) {
				return i;
			}
		}

		return this.playing.length;
	}
}