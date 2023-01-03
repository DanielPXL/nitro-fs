export class NitroFNTMainTable {
	constructor(raw: Uint8Array, numEntries: number) {
		this.totalDirCount = numEntries;
		this.entries = [];

		for (let i = 0; i < numEntries; i++) {
			const entryOffset = i * 8;
			const entryBuffer = raw.slice(entryOffset, entryOffset + 8);
			const entry = {
				subTableOffset: entryBuffer[0] | (entryBuffer[1] << 8) | (entryBuffer[2] << 16) | (entryBuffer[3] << 24),
				firstFileID: entryBuffer[4] | (entryBuffer[5] << 8),
				parentDirectoryID: (entryBuffer[6] | (entryBuffer[7] << 8))
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
	constructor(raw: Uint8Array) {
		this.entries = [];

		let i = 0;
		while (true) {
			const typeAndLength = raw[i];
			i++;

			const { type, length } = this.seperateTypeAndLength(typeAndLength);

			if (type == NitroFNTSubtableEntryType.File) {
				const name = String.fromCharCode(...raw.slice(i, i + length));
				i += length;

				this.entries.push({
					type,
					length,
					name
				});
			} else if (type == NitroFNTSubtableEntryType.SubDirectory) {
				const name = String.fromCharCode(...raw.slice(i, i + length));
				i += length;

				// ID of the subdirectory (2 bytes, little endian)
				const id = (raw[i] | (raw[i + 1] << 8)) & 0xFFF;
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