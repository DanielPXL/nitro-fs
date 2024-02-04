import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { SoundFileHeader } from "../Common/SoundFileHeader";
import { Table, TableEntry } from "../Common/Table";
import { Command } from "../SSEQ/Command";
import { CommandParser } from "../SSEQ/CommandParser";

export class SSAR {
	constructor(raw: BufferReader) {
		const header = new SoundFileHeader(raw, "SSAR");
		this.dataBlock = new SSARDataBlock(raw.slice(0x10));
		this.data = raw.slice(this.dataBlock.sequenceDataStartOffset);
	}

	dataBlock: SSARDataBlock;
	data: BufferReader;

	getSequenceData(id: number): Command[] {
		const entry = this.dataBlock.sequenceTable.entries[id];
		if (!entry) {
			throw new Error(`Sequence ${id} not found`);
		}

		const buffer = this.data.slice(entry.sequenceDataOffset);

		const commands = CommandParser.parseCommands(buffer, buffer.length);
		return commands;
	}
}

export class SSARDataBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "DATA");

		// 0x08 (4 bytes): Offset to sequence data start
		this.sequenceDataStartOffset = raw.readUint32(0x08);
		// 0x0C: Sequence table
		this.sequenceTable = new Table(raw.slice(0x0C), SequenceArchiveEntry);
	}

	sequenceDataStartOffset: number;
	sequenceTable: Table<SequenceArchiveEntry>;
}

export class SequenceArchiveEntry extends TableEntry {
	constructor(raw: BufferReader) {
		super(raw);

		// 0x00 (4 bytes): Offset to sequence data
		this.sequenceDataOffset = raw.readUint32(0x00);
		// 0x04 (2 bytes): Bank id
		this.bankId = raw.readUint16(0x04);
		// 0x06 (1 bytes): Volume
		this.volume = raw.readUint8(0x06);
		// 0x07 (1 bytes): Channel Priority
		this.channelPriority = raw.readUint8(0x07);
		// 0x08 (1 bytes): Player Priority
		this.playerPriority = raw.readUint8(0x08);
		// 0x09 (1 bytes): Player id
		this.playerId = raw.readUint8(0x09);
		// 0x0A (2 bytes): Padding
	}

	readonly length = 0x0C;

	sequenceDataOffset: number;
	bankId: number;
	volume: number;
	channelPriority: number;
	playerPriority: number;
	playerId: number;
}