// http://llref.emutalk.net/docs/?file=xml/btx0.xml#xml-doc
// https://github.com/scurest/apicula/blob/master/src/nitro/tex.rs

export class TEX0Header {
	constructor(raw: Uint8Array) {
		// 0x00 (4 bytes): Magic "TEX0"
		this.magic = String.fromCharCode(...raw.slice(0, 4));
		// 0x04 (4 bytes): Section size
		this.sectionSize = raw[4] | (raw[5] << 8) | (raw[6] << 16) | (raw[7] << 24);
		// 0x08 (4 bytes): Padding

		// 0x0C (2 bytes): Texture Data Size
		this.textureDataSize = raw[0x0C] | (raw[0x0D] << 8);
		// 0x0E (2 bytes): Texture Info Offset
		this.textureInfoOffset = raw[0x0E] | (raw[0x0F] << 8);
		// 0x10 (4 bytes): Padding

		// 0x14 (4 bytes): Texture Data Offset
		this.textureDataOffset = raw[0x14] | (raw[0x15] << 8) | (raw[0x16] << 16) | (raw[0x17] << 24);
		// 0x18 (4 bytes): Padding

		// 0x1C (2 bytes): Compressed Texture Data Size
		this.compressedTextureDataSize = raw[0x1C] | (raw[0x1D] << 8);
		// 0x1E (2 bytes): Compressed Texture Info Offset
		this.compressedTextureInfoOffset = raw[0x1E] | (raw[0x1F] << 8);
		// 0x20 (4 bytes): Padding

		// 0x24 (4 bytes): Compressed Texture Data Offset
		this.compressedTextureDataOffset = raw[0x24] | (raw[0x25] << 8) | (raw[0x26] << 16) | (raw[0x27] << 24);
		// 0x28 (4 bytes): Compressed Texture Info Data Offset
		this.compressedTextureInfoDataOffset = raw[0x28] | (raw[0x29] << 8) | (raw[0x2A] << 16) | (raw[0x2B] << 24);
		// 0x2C (4 bytes): Padding

		// 0x30 (4 bytes): Palette Data Size
		this.paletteDataSize = raw[0x30] | (raw[0x31] << 8) | (raw[0x32] << 16) | (raw[0x33] << 24);
		// 0x34 (4 bytes): Palette Info Offset
		this.paletteInfoOffset = raw[0x34] | (raw[0x35] << 8) | (raw[0x36] << 16) | (raw[0x37] << 24);
		// 0x38 (4 bytes): Palette Data Offset
		this.paletteDataOffset = raw[0x38] | (raw[0x39] << 8) | (raw[0x3A] << 16) | (raw[0x3B] << 24);
	}

	public readonly magic: string;
	public readonly sectionSize: number;

	public readonly textureDataSize: number;
	public readonly textureInfoOffset: number;
	public readonly textureDataOffset: number;

	public readonly compressedTextureDataSize: number;
	public readonly compressedTextureInfoOffset: number;
	public readonly compressedTextureDataOffset: number;
	public readonly compressedTextureInfoDataOffset: number;

	public readonly paletteDataSize: number;
	public readonly paletteInfoOffset: number;
	public readonly paletteDataOffset: number;
}