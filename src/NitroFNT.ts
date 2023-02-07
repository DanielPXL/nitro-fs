import { BufferReader } from "./BufferReader";
import { NitroFNTMainTable, NitroFNTSubTable, NitroFNTSubtableEntryType } from "./NitroFNTTables";

export class NitroFNT {
	constructor(raw: BufferReader) {
		// First, read the main table
		// The number of entries is always stored at 0x06 and 0x07 (2 bytes, little endian)
		// Each entry is 8 bytes long, so the total size of the main table is 8 * numEntries
		const numEntries = raw.readUint16(0x06);
		const mainTableBuffer = raw.slice(0, 8 * numEntries);
		this.mainTable = new NitroFNTMainTable(mainTableBuffer, numEntries);

		// Next, read the subtables
		this.subTables = [];
		for (let i = 0; i < this.mainTable.entries.length; i++) {
			const subTableOffset = this.mainTable.entries[i].subTableOffset;
			const subTable = new NitroFNTSubTable(raw.slice(subTableOffset));
			this.subTables.push(subTable);
		}

		// Build the directory tree
		this.tree = new NitroFNTDirectory("root");		
		this.parseSubTable(this.subTables[0], this.tree, 0);
	}

	mainTable: NitroFNTMainTable;
	subTables: NitroFNTSubTable[];
	
	tree: NitroFNTDirectory;

	private parseSubTable(subTable: NitroFNTSubTable, parentDirectory: NitroFNTDirectory, parentDirectoryID: number) {
		const mainTableEntry = this.mainTable.entries[parentDirectoryID];

		for (let i = 0; i < subTable.entries.length; i++) {
			const subTableEntry = subTable.entries[i];

			if (subTableEntry.type == NitroFNTSubtableEntryType.File) {
				const file = new NitroFNTFile(subTableEntry.name, mainTableEntry.firstFileID + i);
				parentDirectory.files.push(file);

			} else if (subTableEntry.type == NitroFNTSubtableEntryType.SubDirectory) {
				const directory = new NitroFNTDirectory(subTableEntry.name);
				parentDirectory.directories.push(directory);

				this.parseSubTable(this.subTables[subTableEntry.subDirectoryID], directory, subTableEntry.subDirectoryID);
			}
		}
	}
}

export class NitroFNTDirectory {
	constructor(name: string) {
		this.name = name;
		this.files = [];
		this.directories = [];
	}

	name: string;
	files: NitroFNTFile[];
	directories: NitroFNTDirectory[];
}

export class NitroFNTFile {
	constructor(name: string, id: number) {
		this.name = name;
		this.id = id;
	}

	name: string;
	id: number;
}