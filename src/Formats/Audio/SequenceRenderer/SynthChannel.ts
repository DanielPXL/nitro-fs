import { DirectInstrument, DrumSetInstrument, InstrumentType, KeySplitInstrument } from "../SBNK/Instrument";
import { NoteInfo } from "../SBNK/NoteInfo";
import { SBNK } from "../SBNK/SBNK";
import { BankInfo } from "../SDAT/FileInfo";
import { Note } from "../SSEQ/Note";
import { SWAR } from "../SWAR/SWAR";
import { Envelope } from "./Envelope";
import { PCMPlayingNote } from "./PCMPlayingNote";
import { PSGPlayingNote } from "./PSGPlayingNote";
import { PlayingNote } from "./PlayingNote";

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

	volume1 = 1;
	volume2 = 1;
	pan = 0;
	playing: PlayingNote[] = [];

	getValue(time: number) {
		let sum = 0;
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i]) {
				sum += this.playing[i].getValue(time);
			}
		}

		const leftWeight = Math.min(1, Math.max(0, 1 - this.pan));
		const rightWeight = Math.min(1, Math.max(0, 1 + this.pan));

		const left = sum * leftWeight * this.volume1 * this.volume2;
		const right = sum * rightWeight * this.volume1 * this.volume2;
		return [left, right];
	}
	
	playNote(time: number, note: Note, velocity: number, stopTime?: number) {
		const { noteInfo, isPSG } = this.getNoteInfo(note);
		if (noteInfo === null || noteInfo === undefined) {
			console.log("Note or instrument not found in bank.");
			return;
		}

		if (isPSG) {
			const dutyCycle = noteInfo.waveId;
			const envelope = new Envelope(time, noteInfo.attack, noteInfo.decay, noteInfo.sustain, noteInfo.release, stopTime);

			const index = this.findFirstEmpty();
			this.playing[index] = new PSGPlayingNote(note, envelope, dutyCycle, velocity, () => {
				this.playing[index] = null;
			});
		} else {
			const swar = this.swars[noteInfo.waveArchiveId];
			const swav = swar.waves[noteInfo.waveId];
	
			const envelope = new Envelope(time, noteInfo.attack, noteInfo.decay, noteInfo.sustain, noteInfo.release, stopTime);
	
			const index = this.findFirstEmpty();
			this.playing[index] = new PCMPlayingNote(note, envelope, swav, noteInfo.baseNote, this.sampleRate, velocity, () => {
				this.playing[index] = null;
			});
		}
	}

	getNoteInfo(note: Note): { noteInfo: NoteInfo, isPSG: boolean } {
		if (this.bank.instruments[this.programNumber] === undefined) {
			return { noteInfo: null, isPSG: false };
		}

		switch (this.bank.instruments[this.programNumber].type) {
			case InstrumentType.WhiteNoise: {
				console.log("WhiteNoise instruments are not supported yet.");
				return { noteInfo: null, isPSG: false };
			}

			case InstrumentType.PSG: {
				const instrument = this.bank.instruments[this.programNumber] as DirectInstrument;
				return { noteInfo: instrument.noteInfo, isPSG: true };
			}

			case InstrumentType.PCM:
			case InstrumentType.DirectPCM: {
				const instrument = this.bank.instruments[this.programNumber] as DirectInstrument;
				return { noteInfo: instrument.noteInfo, isPSG: false };
			}

			case InstrumentType.DrumSet: {
				const drumSet = this.bank.instruments[this.programNumber] as DrumSetInstrument;

				if (note < drumSet.lowerKey || note > drumSet.upperKey) {
					return { noteInfo: null, isPSG: false };
				}

				const instrument = drumSet.instruments[note - drumSet.lowerKey];
				return { noteInfo: instrument.noteInfo, isPSG: false };
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
						return { noteInfo: null, isPSG: false };
					}
				}

				const instrument = keySplit.instruments[region];
				return { noteInfo: instrument.noteInfo, isPSG: false };			
			}
		}
	}

	releaseNote(time: number) {
		for (let i = 0; i < this.playing.length; i++) {
			if (this.playing[i]) {
				this.playing[i].release(time);
			}
		}
	}

	changeProgram(programNumber: number) {
		this.programNumber = programNumber;
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