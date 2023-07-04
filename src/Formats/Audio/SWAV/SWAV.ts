import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { Encoding, EncodingType } from "../Common/Encoding";
import { SoundFileHeader } from "../Common/SoundFileHeader";

// https://gota7.github.io/NitroStudio2/specs/wave.html

export class SWAV {
	constructor(raw: BufferReader, hasHeader: boolean) {
		if (hasHeader) {
			const header = new SoundFileHeader(raw, "SWAV");
			raw = raw.slice(0x10);
		}

		// 0x10 - Data Block
		this.dataBlock = new SWAVDataBlock(raw, hasHeader);		
	}

	dataBlock: SWAVDataBlock;

	toPCM() {
		return Encoding.toPCM(this.dataBlock.audioData, this.dataBlock.encoding);
	}
}

export class SWAVDataBlock extends Block {
	constructor(raw: BufferReader, hasHeader: boolean) {
		if (hasHeader) {
			super(raw, "DATA");
			raw = raw.slice(0x08);
		} else {
			super(raw);
			this.size = raw.length;
		}

		// 0x00 (1 byte) - Encoding type
		this.encoding = raw.readUint8(0x00);
		// 0x01 (1 byte) - Loop
		this.loop = raw.readUint8(0x01) === 1;
		// 0x02 (2 bytes) - Sample rate
		this.sampleRate = raw.readUint16(0x02);
		// 0x04 (2 bytes) - Clock time (16756991 / sample rate)
		this.clockTime = raw.readUint16(0x04);
		// 0x06 (2 bytes) - Loop start (in 32-bit words)
		const loopStartOffset = raw.readUint16(0x06);
		// 0x08 (4 bytes) - Loop length (in 32-bit words)
		const loopLengthOffset = raw.readUint32(0x08);
		// 0x0C (size = BlockSize - 0xC - 0x8) - Audio data
		// this.audioData = raw.slice(0x0C, this.size - 0xC - 0x8);
		this.audioData = raw.slice(0x0C, 0x0C + loopStartOffset * 4 + loopLengthOffset * 4);

		switch (this.encoding) {
			case EncodingType.PCM8:
				this.loopStart = loopStartOffset * 4;
				this.loopLength = loopLengthOffset * 4;
				break;
			case EncodingType.PCM16:
				this.loopStart = (loopStartOffset * 4) / 2;
				this.loopLength = (loopStartOffset * 4) / 2;
				break;
			case EncodingType.IMA_ADPCM:
				this.loopStart = (loopStartOffset * 4) * 2 - 8;
				this.loopLength = (loopLengthOffset * 4) * 2;
				break;
		}
	}

	encoding: EncodingType;
	loop: boolean;
	sampleRate: number;
	clockTime: number;
	loopStart: number;
	loopLength: number;
	audioData: BufferReader;
}