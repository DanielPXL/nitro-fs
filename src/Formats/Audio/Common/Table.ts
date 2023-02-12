import { BufferReader } from "../../../BufferReader";

export abstract class TableEntry {
	constructor(raw: BufferReader) {

	}

	abstract readonly length: number;
}

export class Table<T extends TableEntry> {
	constructor(raw: BufferReader, type: new (raw: BufferReader) => T) {
		// Table header
		// 0x00 (4 bytes): Number of entries
		const entryCount = raw.readUint32(0x00);

		// Read entries
		this.entries = [];
		let offset = 4;
		for (let i = 0; i < entryCount; i++) {
			const entry = new type(raw.slice(offset));
			this.entries.push(entry);
			offset += entry.length;
		}
	}

	entries: T[];
}

export class Uint32TableEntry extends TableEntry {
	constructor(raw: BufferReader) {
		super(raw);

		// 0x00 (4 bytes): Value
		this.value = raw.readUint32(0x00);
	}

	readonly length = 0x04;

	value: number;
}