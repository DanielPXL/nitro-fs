export class CartridgeHeader {
	constructor(raw: Uint8Array) {
		// Game Title (0x00, 12 bytes, Uppercase ASCII, padded with 0x00)
		this.gameTitle = String.fromCharCode(...raw.slice(0x00, 0x0C)).replace(/\0/g, "");
		// Game Code (0xC0, 4 bytes, Uppercase ASCII, padded with 0x00)
		this.gameCode = String.fromCharCode(...raw.slice(0x0C, 0x10)).replace(/\0/g, "");;
		
		// FNT Offset (0x40, 4 bytes)
		this.fntOffset = raw[0x40] | (raw[0x41] << 8) | (raw[0x42] << 16) | (raw[0x43] << 24);
		// FNT Length (0x44, 4 bytes)
		this.fntLength = raw[0x44] | (raw[0x45] << 8) | (raw[0x46] << 16) | (raw[0x47] << 24);

		// FAT Offset (0x48, 4 bytes)
		this.fatOffset = raw[0x48] | (raw[0x49] << 8) | (raw[0x4A] << 16) | (raw[0x4B] << 24);
		// FAT Length (0x4C, 4 bytes)
		this.fatLength = raw[0x4C] | (raw[0x4D] << 8) | (raw[0x4E] << 16) | (raw[0x4F] << 24);

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