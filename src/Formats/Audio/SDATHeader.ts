// https://gota7.github.io/NitroStudio2/specs/soundData.html

// export class SDATHeader {
// 	constructor(raw: Uint8Array) {
// 		// 0x00 (4 bytes) - Magic (SDAT)
// 		this.magic = String.fromCharCode(...raw.slice(0, 4));
// 		// 0x04 (2 bytes) - Endianness (0xFEFF)
// 		this.endianness = raw[4] << 8 | raw[5];
// 		// 0x06 (2 bytes) - Version (0x0100)

// 		// 0x08 (4 bytes) - File size
// 		this.fileSize = raw[8] << 24 | raw[9] << 16 | raw[10] << 8 | raw[11];
// 		// 0x0C (2 bytes) - Header size
// 		this.headerSize = raw[12] << 8 | raw[13];
// 		// 0x0E (2 bytes) - Number of blocks
// 	}
// }