import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { Table, TableEntry } from "../Common/Table";

export class FATBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "FAT ");

		const table = new Table(raw.slice(0x08), FileTableEntry);
		this.entries = table.entries;
	}

	entries: FileTableEntry[];
}

export class FileTableEntry extends TableEntry {
	constructor(raw: BufferReader) {
		super(raw);

		this.offset = raw.readUint32(0x00);
		this.size = raw.readUint32(0x04);
	}

	readonly length = 0x10;
	readonly offset: number;
	readonly size: number;
}