import { BufferReader } from "../../../BufferReader";

// http://llref.emutalk.net/docs/?file=xml/btx0.xml#xml-doc
// https://github.com/scurest/apicula/blob/master/src/nitro/tex.rs

export class TEX0Header {
	constructor(raw: BufferReader) {
		// 0x00 (4 bytes): Magic "TEX0"
		this.magic = raw.readChars(0x00, 4);
		// 0x04 (4 bytes): Section size
		this.sectionSize = raw.readUint32(0x04);
		// 0x08 (4 bytes): Padding

		// 0x0C (2 bytes): Texture Data Size
		this.textureDataSize = raw.readUint16(0x0C);
		// 0x0E (2 bytes): Texture Info Offset
		this.textureInfoOffset = raw.readUint16(0x0E);
		// 0x10 (4 bytes): Padding

		// 0x14 (4 bytes): Texture Data Offset
		this.textureDataOffset = raw.readUint32(0x14);
		// 0x18 (4 bytes): Padding

		// 0x1C (2 bytes): Compressed Texture Data Size
		this.compressedTextureDataSize = raw.readUint16(0x1C);
		// 0x1E (2 bytes): Compressed Texture Info Offset
		this.compressedTextureInfoOffset = raw.readUint16(0x1E);
		// 0x20 (4 bytes): Padding

		// 0x24 (4 bytes): Compressed Texture Data Offset
		this.compressedTextureDataOffset = raw.readUint32(0x24);
		// 0x28 (4 bytes): Compressed Texture Info Data Offset
		this.compressedTextureInfoDataOffset = raw.readUint32(0x28);
		// 0x2C (4 bytes): Padding

		// 0x30 (4 bytes): Palette Data Size
		this.paletteDataSize = raw.readUint32(0x30);
		// 0x34 (4 bytes): Palette Info Offset
		this.paletteInfoOffset = raw.readUint32(0x34);
		// 0x38 (4 bytes): Palette Data Offset
		this.paletteDataOffset = raw.readUint32(0x38);
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