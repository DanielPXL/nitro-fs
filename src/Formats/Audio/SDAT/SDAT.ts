import { BufferReader } from "../../../BufferReader";
import { SDATFS } from "./SDATFS";
import { SDATHeader } from "./SDATHeader";

/**
 * Sound Data, contains audio files.
 */
export class SDAT {
	constructor(raw: BufferReader) {
		this.header = new SDATHeader(raw);
		this.fs = new SDATFS(raw, this.header);
	}

	header: SDATHeader;
	fs: SDATFS;
}