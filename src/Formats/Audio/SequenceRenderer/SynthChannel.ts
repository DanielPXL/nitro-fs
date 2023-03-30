import { DirectInstrument, DrumSetInstrument, InstrumentType, KeySplitInstrument } from "../SBNK/Instrument";
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
	
	programNumber = 21;
	playing: PlayingNote = null;

	getValue(time: number) {
		if (this.playing === null) {
			return 0;
		}

		return this.playing.getValue(time);
	}
	
	playNote(time: number, note: Note) {
		// console.log("Playing note " + note)
		// console.log(this.bank.instruments[this.programNumber])
		switch (this.bank.instruments[this.programNumber].type) {
			case InstrumentType.PSG:
			case InstrumentType.WhiteNoise: {
				throw new Error("PSG and WhiteNoise instruments are not supported yet.");
			}

			case InstrumentType.PCM:
			case InstrumentType.DirectPCM: {
				const instrument = this.bank.instruments[this.programNumber] as DirectInstrument;
				const noteInfo = instrument.noteInfo;
				const swar = this.swars[noteInfo.waveArchiveId];
				const swav = swar.waves[noteInfo.waveId];

				const envelope = new Envelope(time, noteInfo.attack, noteInfo.decay, noteInfo.sustain, noteInfo.release);
				this.playing = new PCMPlayingNote(note, envelope, swav, noteInfo.baseNote, this.sampleRate);
				break;
			}

			case InstrumentType.DrumSet: {
				const drumSet = this.bank.instruments[this.programNumber] as DrumSetInstrument;

				if (note < drumSet.lowerKey || note > drumSet.upperKey) {
					return;
				}

				const instrument = drumSet.instruments[note - drumSet.lowerKey];
				const noteInfo = instrument.noteInfo;
				const swar = this.swars[noteInfo.waveArchiveId];
				const swav = swar.waves[noteInfo.waveId];

				const envelope = new Envelope(time, noteInfo.attack, noteInfo.decay, noteInfo.sustain, noteInfo.release);
				this.playing = new PCMPlayingNote(note, envelope, swav, noteInfo.baseNote, this.sampleRate);
				break;
			}

			case InstrumentType.KeySplit: {
				const keySplit = this.bank.instruments[this.programNumber] as KeySplitInstrument;
				
				// Find region
				const regions = keySplit.regions;
				let region = 0;
				for (let i = 0; i < keySplit.regions.length; i++) {
					if (note < regions[i]) {
						break;
					}

					region++;
				}

				const instrument = keySplit.instruments[region];
				const noteInfo = instrument.noteInfo;
				const swar = this.swars[noteInfo.waveArchiveId];
				const swav = swar.waves[noteInfo.waveId];

				const envelope = new Envelope(time, noteInfo.attack, noteInfo.decay, noteInfo.sustain, noteInfo.release);
				this.playing = new PCMPlayingNote(note, envelope, swav, noteInfo.baseNote, this.sampleRate);
				break;
			}
		}
	}

	releaseNote(time: number) {
		this.playing.release(time);
	}
}