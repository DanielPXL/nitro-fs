import { BufferReader } from "./BufferReader";

export class NitroFAT {
	constructor(raw: BufferReader) {
		this.entries = [];

		for (let i = 0; i < raw.length; i += 8) {
			const startAddress = raw.readUint32(i);
			const endAddress = raw.readUint32(i + 4);

			this.entries.push({
				startAddress,
				endAddress
			});
		}
	}

	entries: NitroFATEntry[];
}

export type NitroFATEntry = {
	startAddress: number;
	endAddress: number;
}