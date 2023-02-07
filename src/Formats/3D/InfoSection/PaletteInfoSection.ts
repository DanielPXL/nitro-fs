import { InfoSection } from "./InfoSection";

export class PaletteInfoSection extends InfoSection {
	entries: PaletteInfo[];

	parseEntry(raw: Uint8Array): void {
		if (this.entries === undefined) {
			this.entries = [];
		}

		this.entries.push(new PaletteInfo(raw));
	}
}

export class PaletteInfo {
	constructor(raw: Uint8Array) {
		// 0x00 (2 bytes): Palette Offset, shift << 3, relative to the start of Palette Data
		this.paletteOffset = (raw[0] | (raw[1] << 8)) << 3;

		// Rest is unknown
	}

	paletteOffset: number;
}