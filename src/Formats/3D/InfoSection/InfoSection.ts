import { BufferReader } from "../../../BufferReader";

export abstract class InfoSection {
	constructor(raw: BufferReader) {
		// Header
		// 0x00 (1 byte): Dummy
		// 0x01 (1 byte): Number of entries
		this.numberOfEntries = raw.readUint8(0x01);
		// 0x02 (2 bytes): Section Size
		this.sectionSize = raw.readUint16(0x02);

		// Unknown Block
		// Header is 8 bytes long
		// Then there are 4 bytes per entry
		// So the size of the unknown block is 8 + (4 * numberOfEntries)
		// this.unknownBlock = raw.slice(4, 8 + (4 * this.numberOfEntries) + 4);

		let offset = 8 + (4 * this.numberOfEntries) + 4;

		// Info Data Block
		// 0x00 (2 bytes): Header Size
		// 0x02 (2 bytes): Data Size
		this.dataSize = raw.readUint16(offset + 2);
		const dataSectionSize = (this.dataSize - 4) / this.numberOfEntries;
		offset += 4;

		for (let i = 0; i < this.numberOfEntries; i++) {
			this.parseEntry(raw.slice(offset, offset + dataSectionSize));
			offset += dataSectionSize;
		}

		// Name Block
		// No header, each name is 16 bytes long
		this.names = [];
		for (let i = 0; i < this.numberOfEntries; i++) {
			this.names.push(raw.readChars(offset, offset + 16).replace(/\0/g, ""));
			offset += 16;
		}
	}

	numberOfEntries: number;
	sectionSize: number;
	// unknownBlock: Uint8Array;
	dataSize: number;
	names: string[];

	abstract parseEntry(raw: BufferReader): void;
}