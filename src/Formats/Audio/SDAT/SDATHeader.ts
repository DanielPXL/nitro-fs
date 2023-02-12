import { BufferReader } from "../../../BufferReader";
import { SoundFileHeader } from "../Common/SoundFileHeader";

// https://gota7.github.io/NitroStudio2/specs/soundData.html

export class SDATHeader extends SoundFileHeader {
	constructor(raw: BufferReader) {
		super(raw, "SDAT");

		// 0x10 (4 bytes) - Offset to Symbol block
		this.symbolBlockOffset = raw.readUint32(0x10);
		// 0x14 (4 bytes) - Symbol block size
		this.symbolBlockSize = raw.readUint32(0x14);
		// 0x18 (4 bytes) - Offset to Info block
		this.infoBlockOffset = raw.readUint32(0x18);
		// 0x1C (4 bytes) - Info block size
		this.infoBlockSize = raw.readUint32(0x1C);
		// 0x20 (4 bytes) - Offset to File Allocation block
		this.fileAllocationBlockOffset = raw.readUint32(0x20);
		// 0x24 (4 bytes) - File Allocation block size
		this.fileAllocationBlockSize = raw.readUint32(0x24);
		// 0x28 (4 bytes) - Offset to File block
		this.fileBlockOffset = raw.readUint32(0x28);
		// 0x2C (4 bytes) - File block size
		this.fileBlockSize = raw.readUint32(0x2C);
	}

	symbolBlockOffset: number;
	symbolBlockSize: number;
	infoBlockOffset: number;
	infoBlockSize: number;
	fileAllocationBlockOffset: number;
	fileAllocationBlockSize: number;
	fileBlockOffset: number;
	fileBlockSize: number;
}