import { BufferReader } from "../../../BufferReader";
import { SoundFileHeader } from "../Common/SoundFileHeader";

export class SWAVHeader extends SoundFileHeader {
	constructor(raw: BufferReader) {
		super(raw, "SWAV");

		
	}
}