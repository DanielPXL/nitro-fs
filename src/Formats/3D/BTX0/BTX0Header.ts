import { BufferReader } from "../../../BufferReader";

// http://llref.emutalk.net/docs/?file=xml/btx0.xml#xml-doc

export class BTX0Header {
	constructor(raw: BufferReader) {
		// 0x00 (4 bytes): Magic "BTX0"
		this.magic = raw.readChars(0x00, 4);
		// 0x04 (4 bytes): Constant 0x0001FEFF

		// 0x08 (4 bytes): File size
		this.fileSize = raw.readUint32(0x08);
		// 0x0C (2 bytes): Header size (0x10)
		
		// 0x0E (2 bytes): Number of textures (0x01)

		// 0x10 (4 bytes): TEX0 offset
		this.texOffset = raw.readUint32(0x10);
	}

	public readonly magic: string;
	public readonly fileSize: number;
	public readonly texOffset: number;
}