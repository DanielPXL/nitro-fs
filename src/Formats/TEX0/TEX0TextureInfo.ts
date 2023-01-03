export class TEX0TextureInfo {
	constructor(raw: Uint8Array) {
		// 0x00 (2 bytes): Texture Offset
		this.textureOffset = raw[0] | (raw[1] << 8);
		// 0x02 (2 bytes): Parameters
		// --CFFFHHHWWW----
		// C = Palette ID
		// F = Format
		// H = Height (8 << Height)
		// W = Width (8 << Width)
		const parameters = raw[2] | (raw[3] << 8);
		this.paletteID	= 	(parameters & 0b1110_0000_0000_0000) >> 13;
		this.format		=	(parameters & 0b0001_1100_0000_0000) >> 10;
		this.height		= 	(parameters & 0b0000_0011_1000_0000) >> 7;
		this.width		= 	(parameters & 0b0000_0000_0111_0000) >> 4;
		// 0x04 (1 byte): Width2
		this.width2 = raw[3];
		// Rest is unknown
	}

	textureOffset: number;
	paletteID: number;
	format: number;
	height: number;
	width: number;
	width2: number;
}