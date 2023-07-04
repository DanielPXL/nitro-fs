import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { EncodingType } from "../Common/Encoding";

// https://gota7.github.io/NitroStudio2/specs/stream.html

export class STRMInfoBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "HEAD");

		// 0x08 (1 byte) - Encoding
		this.encoding = raw.readUint8(0x08);
		// 0x09 (1 byte) - Loop
		this.loop = raw.readUint8(0x09) === 1;
		// 0x0A (1 byte) - Channel count
		this.channelCount = raw.readUint8(0x0A);
		// 0x0B (1 byte) - Padding

		// 0x0C (2 byte) - Sample rate
		this.sampleRate = raw.readUint16(0x0C);
		// 0x0E (2 byte) - Clock time -> floor( (523655.96875 * (1 / sampleRate) ) )
		this.clockTime = raw.readUint16(0x0E);
		// 0x10 (4 byte) - Loop start in samples
		this.loopStart = raw.readUint32(0x10);
		// 0x14 (4 byte) - Number of samples
		this.sampleCount = raw.readUint32(0x14);
		// 0x18 (4 byte) - Offset to data -> 0x68
		this.dataOffset = raw.readUint32(0x18);
		// 0x1C (4 byte) - Number of blocks (only for ADPCM)
		this.blockCount = raw.readUint32(0x1C);
		// 0x20 (4 byte) - Block size
		this.blockSize = raw.readUint32(0x20);
		// 0x24 (4 byte) - Number of samples per block
		this.samplesPerBlock = raw.readUint32(0x24);
		// 0x28 (4 byte) - Size of the last block
		this.lastBlockSize = raw.readUint32(0x28);
		// 0x2C (4 byte) - Number of samples in the last block
		this.lastBlockSampleCount = raw.readUint32(0x2C);
	}

	encoding: EncodingType;
	loop: boolean;
	channelCount: number;
	sampleRate: number;
	clockTime: number;
	loopStart: number;
	sampleCount: number;
	dataOffset: number;
	blockCount: number;
	blockSize: number;
	samplesPerBlock: number;
	lastBlockSize: number;
	lastBlockSampleCount: number;
}