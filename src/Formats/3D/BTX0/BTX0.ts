import { BufferReader } from "../../../BufferReader";
import { TEX0 } from "../TEX0/TEX0";
import { BTX0Header } from "./BTX0Header";

export class BTX0 {
	constructor(raw: BufferReader) {
		this.header = new BTX0Header(raw.slice(0, 0x14));

		if (this.header.magic !== "BTX0") {
			throw new Error("Invalid BTX0 magic");
		}

		this.tex = new TEX0(raw.slice(this.header.texOffset));
	}

	header: BTX0Header;
	tex: TEX0;
}