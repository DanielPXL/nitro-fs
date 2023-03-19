import { BufferReader } from "../../../BufferReader";
import { SoundFileHeader } from "../Common/SoundFileHeader";
import { DirectInstrument, DrumSetInstrument, Instrument, InstrumentType, KeySplitInstrument } from "./Instrument";
import { SBNKDataBlock } from "./SBNKDataBlock";

// https://gota7.github.io/NitroStudio2/specs/bank.html

export class SBNK {
	constructor(raw: BufferReader) {
		this.header = new SoundFileHeader(raw, "SBNK");
		this.data = new SBNKDataBlock(raw.slice(0x10));

		this.instruments = [];
		for (const entry of this.data.instrumentTable.entries) {
			switch (entry.type) {
				case InstrumentType.Null:
					break;

				case InstrumentType.PCM:
				case InstrumentType.PSG:
				case InstrumentType.WhiteNoise:
				case InstrumentType.DirectPCM:
					this.instruments.push(new DirectInstrument(raw.slice(entry.dataOffset), entry.type));
					break;

				case InstrumentType.DrumSet:
					this.instruments.push(new DrumSetInstrument(raw.slice(entry.dataOffset)));
					break;

				case InstrumentType.KeySplit:
					this.instruments.push(new KeySplitInstrument(raw.slice(entry.dataOffset)));
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