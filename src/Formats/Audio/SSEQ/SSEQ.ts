import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { SoundFileHeader } from "../Common/SoundFileHeader";
import { Command } from "./Command";
import { CommandParser } from "./CommandParser";

/**
 * Sound Sequence, contains sequence commands (similar to MIDI).
 */
export class SSEQ {
	constructor(raw: BufferReader) {
		this.header = new SoundFileHeader(raw, "SSEQ");
		this.data = new SSEQDataBlock(raw.slice(0x10));
	}

	header: SoundFileHeader;
	data: SSEQDataBlock;
}

export class SSEQDataBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "DATA");

		// 0x08 (4 bytes): Offset to sequence data

		// 0x0C (BlockSize - 0x0C bytes): Sequence commands
		const length = this.size - 0x0C;
		this.commands = CommandParser.parseCommands(raw.slice(0x0C), length);
	}

	commands: Command[];
}