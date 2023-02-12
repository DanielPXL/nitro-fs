import { BufferReader } from "../../../BufferReader";
import { SDATFS } from "./SDATFS";
import { SDATHeader } from "./SDATHeader";

export class SDAT {
	constructor(raw: BufferReader) {
		this.header = new SDATHeader(raw);
		this.fs = new SDATFS(raw, this.header);
	}

	header: SDATHeader;
	fs: SDATFS;
}