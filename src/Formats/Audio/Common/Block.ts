import { BufferReader } from "../../../BufferReader";

// https://gota7.github.io/NitroStudio2/specs/common.html

export class Block {
	constructor(raw: BufferReader, assertMagic?: string) {
		// 0x00 (4 bytes) - Magic
		this.magic = raw.readChars(0x00, 4);
		if (assertMagic && this.magic !== assertMagic) {
			throw new Error(`Invalid magic: ${this.magic} (expected ${assertMagic})`);
		}

		// 0x04 (4 bytes) - Size
		this.size = raw.readUint32(0x04);
	}

	magic: string;
	size: number;
}