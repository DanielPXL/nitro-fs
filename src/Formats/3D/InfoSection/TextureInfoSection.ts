import { BufferReader } from "../../../BufferReader";
import { InfoSection } from "./InfoSection";

export class TextureInfoSection extends InfoSection {
	entries: TextureInfo[];

	parseEntry(raw: BufferReader): void {
		if (this.entries === undefined) {
			this.entries = [];
		}

		this.entries.push(new TextureInfo(raw));
	}
}

export class TextureInfo {
	constructor(raw: BufferReader) {
		// 0x00 (2 bytes): Texture Offset, shift << 3, relative to the start of Texture Data
		this.textureOffset = (raw.readUint16(0x00)) << 3;
		// 0x02 (2 bytes): Parameters
		// --CFFFHHHWWW----
		// C = First Color Transparent
		// F = Format
		// H = Height (8 << Height)
		// W = Width (8 << Width)
		const parameters = raw.readUint16(0x02);
		this.firstColorTransparent	= 	(parameters & 0b0010_0000_0000_0000) >> 13 === 1;
		this.format					=	(parameters & 0b0001_1100_0000_0000) >> 10;
		this.height					= 	(parameters & 0b0000_0011_1000_0000) >> 7;
		this.width					= 	(parameters & 0b0000_0000_0111_0000) >> 4;
		// Width and Height are stored as right-shifted values (8 << Width or Height), so we need to shift them back
		this.width = 8 << this.width;
		this.height = 8 << this.height;

		// Rest is unknown
	}

	textureOffset: number;
	firstColorTransparent: boolean;
	format: number;
	height: number;
	width: number;
}