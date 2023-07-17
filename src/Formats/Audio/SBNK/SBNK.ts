import { BufferReader } from "../../../BufferReader";
import { SoundFileHeader } from "../Common/SoundFileHeader";
import { DirectInstrument, DrumSetInstrument, Instrument, InstrumentType, KeySplitInstrument } from "./Instrument";
import { SBNKDataBlock } from "./SBNKDataBlock";

// https://gota7.github.io/NitroStudio2/specs/bank.html

/**
 * Sound Bank, contains instrument definitions.
 */
export class SBNK {
	constructor(raw: BufferReader) {
		this.header = new SoundFileHeader(raw, "SBNK");
		this.data = new SBNKDataBlock(raw.slice(0x10));

		this.instruments = [];
		for (let i = 0; i < this.data.instrumentTable.entries.length; i++) {
			const entry = this.data.instrumentTable.entries[i];
			switch (entry.type) {
				case InstrumentType.Null:
					break;

				case InstrumentType.PCM:
				case InstrumentType.PSG:
				case InstrumentType.WhiteNoise:
				case InstrumentType.DirectPCM:
					this.instruments[i] = new DirectInstrument(raw.slice(entry.dataOffset), entry.type);
					break;

				case InstrumentType.DrumSet:
					this.instruments[i] = new DrumSetInstrument(raw.slice(entry.dataOffset));
					break;

				case InstrumentType.KeySplit:
					this.instruments[i] = new KeySplitInstrument(raw.slice(entry.dataOffset));
				break;

				default:
					throw new Error(`Unknown instrument type: ${entry.type} at index ${this.data.instrumentTable.entries.indexOf(entry)}`);
			}
		}
	}

	header: SoundFileHeader;
	data: SBNKDataBlock;
	instruments: Instrument[];
}