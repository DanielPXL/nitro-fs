import { BufferReader } from "../../../BufferReader";

// https://gota7.github.io/NitroStudio2/specs/common.html

export class SoundFileHeader {
	constructor(raw: BufferReader, assertMagic?: string) {
		// 0x00 (4 bytes) - Magic
		this.magic = raw.readChars(0x00, 4);
		if (assertMagic && this.magic !== assertMagic) {
			throw new Error(`Invalid magic: ${this.magic} (expected ${assertMagic})`);
		}
		// 0x04 (2 bytes) - Endianness (0xFEFF)
		this.endianness = raw.readUint16(0x04);
		// 0x06 (2 bytes) - Version (0x0100)

		// 0x08 (4 bytes) - File size
		this.fileSize = raw.readUint32(0x08);
		// 0x0C (2 bytes) - Header size
		this.headerSize = raw.readUint16(0x0C);
		// 0x0E (2 bytes) - Number of blocks
		this.blockCount = raw.readUint16(0x0E);
	}

	magic: string;
	endianness: number;
	fileSize: number;
	headerSize: number;
	blockCount: number;
}