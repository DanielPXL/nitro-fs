import { DirectInstrument, DrumSetInstrument, InstrumentType, KeySplitInstrument } from "../SBNK/Instrument";
import { NoteInfo } from "../SBNK/NoteInfo";
import { SBNK } from "../SBNK/SBNK";
import { BankInfo } from "../SDAT/FileInfo";
import { Note } from "../SSEQ/Note";
import { SWAR } from "../SWAR/SWAR";
import { Envelope } from "./Envelope";
import { PCMPlayingNote } from "./PCMPlayingNote";
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
	playing: PlayingNote = null;

	getValue(time: number) {
		if (this.playing === null) {
			return 0;
		}

		return this.playing.getValue(time) * this.volume1 * this.volume2;
	}
	
	playNote(time: number, note: Note, velocity: number, stopTime?: number) {
		const noteInfo = this.getNoteInfo(note);
		if (noteInfo === null || noteInfo === undefined) {
			console.log("Note not found in instrument.");
			return;
		}

		const swar = this.swars[noteInfo.waveArchiveId];
		const swav = swar.waves[noteInfo.waveId];

		const envelope = new Envelope(time, noteInfo.attack, noteInfo.decay, noteInfo.sustain, noteInfo.release, stopTime);
		this.playing = new PCMPlayingNote(note, envelope, swav, noteInfo.baseNote, this.sampleRate, velocity);
	}

	getNoteInfo(note: Note): NoteInfo {
		switch (this.bank.instruments[this.programNumber].type) {
			case InstrumentType.PSG:
			case InstrumentType.WhiteNoise: {
				console.log("PSG and WhiteNoise instruments are not supported yet.");
				return;
			}

			case InstrumentType.PCM:
			case InstrumentType.DirectPCM: {
				const instrument = this.bank.instruments[this.programNumber] as DirectInstrument;
				return instrument.noteInfo;
			}

			case InstrumentType.DrumSet: {
				const drumSet = this.bank.instruments[this.programNumber] as DrumSetInstrument;

				if (note < drumSet.lowerKey || note > drumSet.upperKey) {
					return;
				}

				const instrument = drumSet.instruments[note - drumSet.lowerKey];
				return instrument.noteInfo;
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
						return;
					}
				}

				const instrument = keySplit.instruments[region];
				return instrument.noteInfo;				
			}
		}
	}

	releaseNote(time: number) {
		this.playing.release(time);
	}

	changeProgram(programNumber: number) {
		this.programNumber = programNumber;
	}
}