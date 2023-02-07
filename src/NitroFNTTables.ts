import { BufferReader } from "./BufferReader";

export class NitroFNTMainTable {
	constructor(raw: BufferReader, numEntries: number) {
		this.totalDirCount = numEntries;
		this.entries = [];

		for (let i = 0; i < numEntries; i++) {
			const entryOffset = i * 8;
			const entryBuffer = raw.slice(entryOffset, entryOffset + 8);
			const entry = {
				subTableOffset: entryBuffer.readUint32(0x00),
				firstFileID: entryBuffer.readUint16(0x04),
				parentDirectoryID: entryBuffer.readUint16(0x06)
			};
			this.entries.push(entry);
		}
	}

	totalDirCount: number;
	entries: NitroFNTMainTableEntry[];
}

export type NitroFNTMainTableEntry = {
	subTableOffset: number;
	firstFileID: number;
	parentDirectoryID: number;
}

export class NitroFNTSubTable {
	constructor(raw: BufferReader) {
		this.entries = [];

		let i = 0;
		while (true) {
			const typeAndLength = raw.readUint8(i);
			i++;

			const { type, length } = this.seperateTypeAndLength(typeAndLength);

			if (type == NitroFNTSubtableEntryType.File) {
				const name = raw.readChars(i, length);
				i += length;

				this.entries.push({
					type,
					length,
					name
				});
			} else if (type == NitroFNTSubtableEntryType.SubDirectory) {
				const name = raw.readChars(i, length);
				i += length;

				// ID of the subdirectory (2 bytes, little endian)
				const id = raw.readUint16(i) & 0xFFF;
				i += 2;

				this.entries.push({
					type,
					length,
					name,
					subDirectoryID: id
				});
			} else if (type == NitroFNTSubtableEntryType.EndOfSubTable) {
				break;
			} else if (type == NitroFNTSubtableEntryType.Reserved) {
				throw new Error("Reserved entry type found in NitroFNTSubTable");
			}
		}
	}

	entries: NitroFNTSubTableEntry[];

	private seperateTypeAndLength(typeAndLength: number): { type: NitroFNTSubtableEntryType, length: number } {
		if (typeAndLength == 0x00) {
			return { type: NitroFNTSubtableEntryType.EndOfSubTable, length: 0 };
		} else if (typeAndLength == 0x80) {
			return { type: NitroFNTSubtableEntryType.Reserved, length: 0 };
		} else if (typeAndLength < 0x80) {
			return { type: NitroFNTSubtableEntryType.File, length: typeAndLength % 0x80 };
		} else {
			return { type: NitroFNTSubtableEntryType.SubDirectory, length: typeAndLength % 0x80 };
		}
	}
}

export type NitroFNTSubTableEntry = {
	type: NitroFNTSubtableEntryType;
	length: number;
	name: string;

	// Only used if type == SubDirectory
	subDirectoryID?: number;
}

export enum NitroFNTSubtableEntryType {
	File,
	SubDirectory,
	EndOfSubTable,
	Reserved
}