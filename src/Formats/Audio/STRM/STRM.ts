import { BufferReader } from "../../../BufferReader";
import { SoundFileHeader } from "../Common/SoundFileHeader";
import { STRMDataBlock } from "./STRMDataBlock";
import { STRMInfoBlock } from "./STRMInfoBlock";

// https://gota7.github.io/NitroStudio2/specs/stream.html

/**
 * Stream, contains streamed audio data.
 */
export class STRM {
	constructor(raw: BufferReader) {
		const header = new SoundFileHeader(raw, "STRM");
		this.infoBlock = new STRMInfoBlock(raw.slice(0x10));

		this.dataBlock = new STRMDataBlock(raw.slice(this.infoBlock.dataOffset - 0x08), this.infoBlock);
	}

	infoBlock: STRMInfoBlock;
	dataBlock: STRMDataBlock;

	toPCM() {
		return this.dataBlock.toPCM();
	}
}