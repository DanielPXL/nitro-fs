import { BufferReader } from "../../../BufferReader";
import { InfoSection } from "./InfoSection";

export class PaletteInfoSection extends InfoSection {
	entries: PaletteInfo[];

	parseEntry(raw: BufferReader): void {
		if (this.entries === undefined) {
			this.entries = [];
		}

		this.entries.push(new PaletteInfo(raw));
	}
}

export class PaletteInfo {
	constructor(raw: BufferReader) {
		// 0x00 (2 bytes): Palette Offset, shift << 3, relative to the start of Palette Data
		this.paletteOffset = (raw.readUint16(0x00)) << 3;

		// Rest is unknown
	}

	paletteOffset: number;
}