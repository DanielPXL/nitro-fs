import { BufferReader } from "../../../BufferReader";
import { NoteInfo } from "./NoteInfo";

// https://gota7.github.io/NitroStudio2/specs/bank.html
// http://www.feshrine.net/hacking/doc/nds-sdat.php#sbnk

export enum InstrumentType {
	Null = 0,
	PCM = 1,
	PSG = 2,
	WhiteNoise = 3,
	DirectPCM = 4,
	DrumSet = 16,
	KeySplit = 17
}

export abstract class Instrument {
	constructor(raw: BufferReader) {

	}

	abstract type: InstrumentType;
}


// PCM, PSG, WhiteNoise, DirectPCM
export type DirectInstrumentType = InstrumentType.PCM | InstrumentType.PSG | InstrumentType.WhiteNoise | InstrumentType.DirectPCM;
export class DirectInstrument extends Instrument {
	constructor(raw: BufferReader, type: DirectInstrumentType) {
		super(raw);
		this.type = type;

		// 0x00 (16 bytes): Note info
		this.noteInfo = new NoteInfo(raw.slice(0x00, 0x10));
	}

	type: DirectInstrumentType;
	noteInfo: NoteInfo;
}

// DrumSet
export class DrumSetInstrument extends Instrument {
	constructor(raw: BufferReader) {
		super(raw);

		// 0x00 (1 byte): Lower key
		this.lowerKey = raw.readUint8(0x00);
		// 0x01 (1 byte): Upper key
		this.upperKey = raw.readUint8(0x01);

		const count = this.upperKey - this.lowerKey + 1;
		this.instruments = new Array(count);
		let pos = 0x02;
		for (let i = 0; i < count; i++) {
			// pos (12 bytes): Contained instrument
			this.instruments[i] = new ContainedInstrument(raw.slice(pos, pos + 0x0C));
			pos += 0x0C;
		}
	}

	type = InstrumentType.DrumSet;
	lowerKey: number;
	upperKey: number;
	instruments: ContainedInstrument[];
}

// KeySplit
export class KeySplitInstrument extends Instrument {
	constructor(raw: BufferReader) {
		super(raw);

		// 0x00 (8 bytes): Regions
		this.regions = [];
		for (let i = 0x00; i < 0x08; i++) {
			const value = raw.readUint8(i);
			if (value === 0x00) {
				break;
			}

			this.regions.push(value);
		}

		this.instruments = [];
		let pos = 0x08;
		for (let i = 0; i < this.regions.length; i++) {
			// pos (12 bytes): Contained instrument
			this.instruments.push(new ContainedInstrument(raw.slice(pos, pos + 0x0C)));
			pos += 0x0C;
		}
	}

	type = InstrumentType.KeySplit;
	regions: number[];
	instruments: ContainedInstrument[];
}

export class ContainedInstrument {
	constructor(raw: BufferReader) {
		// 0x00 (1 byte): Padding

		// 0x01 (1 byte): Instrument type
		this.type = raw.readUint8(0x01);
		// 0x02 (10 bytes): Note Info
		this.noteInfo = new NoteInfo(raw.slice(0x02, 0x0C));
	}

	type: InstrumentType;
	noteInfo: NoteInfo;
}