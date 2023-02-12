import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { SoundFileHeader } from "../Common/SoundFileHeader";
import { Table, Uint32TableEntry } from "../Common/Table";
import { SWAV } from "../SWAV/SWAV";

// https://gota7.github.io/NitroStudio2/specs/wave.html

export class SWAR {
	constructor(raw: BufferReader) {
		const header = new SoundFileHeader(raw, "SWAR");
		// 0x10 - Data Block
		const dataBlock = new SWARDataBlock(raw.slice(0x10));

		this.waves = [];
		for (let i = 0; i < dataBlock.waveOffsets.length; i++) {
			const offset = dataBlock.waveOffsets[i].value;

			let end = 0;
			if (i < dataBlock.waveOffsets.length - 1) {
				end = dataBlock.waveOffsets[i + 1].value;
			} else {
				end = raw.length;
			}

			const wave = new SWAV(raw.slice(offset, end), false);
			this.waves.push(wave);
		}
	}

	waves: SWAV[];
}

export class SWARDataBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "DATA");

		// 0x28 - Wave offset table
		const table = new Table(raw.slice(0x28), Uint32TableEntry);
		this.waveOffsets = table.entries;
	}

	waveOffsets: Uint32TableEntry[];
}