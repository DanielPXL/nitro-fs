import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { Encoding, EncodingType } from "../Common/Encoding";
import { STRMInfoBlock } from "./STRMInfoBlock";

// https://gota7.github.io/NitroStudio2/specs/stream.html

export class STRMDataBlock extends Block {
	constructor(raw: BufferReader, header: STRMInfoBlock) {
		super(raw, "DATA");

		this.raw = raw.slice(0x08);
		this.header = header;
	}

	raw: BufferReader;
	header: STRMInfoBlock;

	toPCM() {
		let readOffset = 0x00;
		let writeOffsetPerChannel = [];
		let pcm = [];

		for (let i = 0; i < this.header.channelCount; i++) {
			pcm.push(new Float32Array(this.header.sampleCount + this.header.lastBlockSampleCount));
			writeOffsetPerChannel.push(0);
		}

		// All blocks except the last one are full blocks
		for (let i = 0; i < this.header.blockCount - 1; i++) {
			for (let j = 0; j < this.header.channelCount; j++) {
				const block = this.decodeBlock(readOffset, this.header.samplesPerBlock, this.header.blockSize);
				readOffset += this.header.blockSize;

				pcm[j].set(block, writeOffsetPerChannel[j]);
				writeOffsetPerChannel[j] += block.length;
			}
		}

		// The last block is a partial block
		for (let j = 0; j < this.header.channelCount; j++) {
			const block = this.decodeBlock(readOffset, this.header.samplesPerBlock, this.header.lastBlockSize);
			readOffset += this.header.lastBlockSize;

			pcm[j].set(block, writeOffsetPerChannel[j]);
			writeOffsetPerChannel[j] += block.length;
		}

		return pcm;
	}

	decodeBlock(offset: number, numSamples: number, blockSize: number) {
		const data = this.raw.slice(offset, offset + blockSize);
		return Encoding.toPCM(data, this.header.encoding);
	}
}