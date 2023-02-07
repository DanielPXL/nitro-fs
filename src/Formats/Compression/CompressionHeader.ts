export class CompressionHeader {
	constructor(raw: Uint8Array) {
		// Byte 0: Compression Type
		this.compressionType = raw[0];
		// Byte 1-3: Decompressed size
		this.decompressedSize = raw[1] << 16 | raw[2] << 8 | raw[3];
	}

	compressionType: CompressionType;
	decompressedSize: number;
}

export enum CompressionType {
	LZ10 = 0x10,
	LZ11 = 0x11
}