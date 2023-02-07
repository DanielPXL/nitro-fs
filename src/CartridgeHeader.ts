import { BufferReader } from "./BufferReader";

export class CartridgeHeader {
	constructor(raw: BufferReader) {
		// Game Title (0x00, 12 bytes, Uppercase ASCII, padded with 0x00)
		this.gameTitle = raw.readChars(0x00, 12).replace(/\0/g, "");
		// Game Code (0x0C, 4 bytes, Uppercase ASCII, padded with 0x00)
		this.gameCode = raw.readChars(0x0C, 4).replace(/\0/g, "");;
		
		// FNT Offset (0x40, 4 bytes)
		this.fntOffset = raw.readUint32(0x40);
		// FNT Length (0x44, 4 bytes)
		this.fntLength = raw.readUint32(0x44);

		// FAT Offset (0x48, 4 bytes)
		this.fatOffset = raw.readUint32(0x48);
		// FAT Length (0x4C, 4 bytes)
		this.fatLength = raw.readUint32(0x4C);

		// Other fields are ignored for now
		// TODO: Maybe CRC later?
	}

	public readonly gameTitle: string;
	public readonly gameCode: string;
	
	public readonly fntOffset: number;
	public readonly fntLength: number;

	public readonly fatOffset: number;
	public readonly fatLength: number;
}