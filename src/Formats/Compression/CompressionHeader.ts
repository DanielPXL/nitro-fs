import { BufferReader } from "../../BufferReader";

export class CompressionHeader {
	constructor(raw: BufferReader) {
		// Byte 0: Compression Type
		this.compressionType = raw.readUint8(0x00);
		// Byte 1-3: Decompressed size
		this.decompressedSize = raw.readUint24(0x01);
	}

	compressionType: CompressionType;
	decompressedSize: number;
}

export enum CompressionType {
	LZ10 = 0x10,
	LZ11 = 0x11
}