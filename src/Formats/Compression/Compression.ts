import { CompressionHeader, CompressionType } from "./CompressionHeader";
import { LZ10 } from "./LZ10";

export class Compression {
	static decompress(raw: Uint8Array) {
		const header = new CompressionHeader(raw.slice(0, 4));
		switch (header.compressionType) {
			case CompressionType.LZ10:
				return LZ10.decompress(raw.slice(4), header.decompressedSize);
			default:
				throw new Error(`Unsupported compression type: ${header.compressionType}`);
		}
	}
}