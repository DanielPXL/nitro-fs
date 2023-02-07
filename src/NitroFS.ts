import { BufferReader } from "./BufferReader";
import { CartridgeHeader } from "./CartridgeHeader";
import { NitroFAT } from "./NitroFAT";
import { NitroFNT } from "./NitroFNT";

export class NitroFS {
	static async fromRom(rom: ArrayBuffer) {
		const nitroFS = new NitroFS();

		const reader = BufferReader.new(rom, true);
		
		// First, read the cartridge header
		const headerBuffer = reader.slice(0, 0x200);
		nitroFS.cartridgeHeader = new CartridgeHeader(headerBuffer);

		console.log(nitroFS.cartridgeHeader);
		// Next, skip to the FNT and read it
		const fntBuffer = reader.slice(nitroFS.cartridgeHeader.fntOffset, nitroFS.cartridgeHeader.fntOffset + nitroFS.cartridgeHeader.fntLength);
		nitroFS.fnt = new NitroFNT(fntBuffer);

		console.log(nitroFS.fnt);

		// Then, skip to the FAT and read it
		const fatBuffer = reader.slice(nitroFS.cartridgeHeader.fatOffset, nitroFS.cartridgeHeader.fatOffset + nitroFS.cartridgeHeader.fatLength);
		const fat = new NitroFAT(fatBuffer);

		// Use file data directly instead of only addresses the FAT in order to save memory
		nitroFS.fileData = fat.entries.map(entry => reader.slice(entry.startAddress, entry.endAddress));

		return nitroFS;
	}

	private cartridgeHeader: CartridgeHeader;
	private fnt: NitroFNT;
	private fileData: BufferReader[];

	readFile(path: string) {
		const directoryParts = path.split("/");
		const fileName = directoryParts.pop()!;

		let currentDir = this.fnt.tree;
		for (let i = 0; i < directoryParts.length; i++) {
			currentDir = currentDir.directories.find(dir => dir.name == directoryParts[i])!;

			if (!currentDir) {
				throw new Error(`Directory not found: ${directoryParts[i]}`);
			}
		}

		const file = currentDir.files.find(file => file.name == fileName);
		if (!file) {
			throw new Error(`File not found: ${fileName}`);
		}

		return this.fileData[file.id];
	}

	readDir(path: string) {
		let directoryParts = path.split("/");
		// Remove every empty string from the array
		directoryParts = directoryParts.filter(dir => dir != "");

		let currentDir = this.fnt.tree;
		for (let i = 0; i < directoryParts.length; i++) {
			currentDir = currentDir.directories.find(dir => dir.name == directoryParts[i])!;

			if (!currentDir) {
				throw new Error(`Directory not found: ${directoryParts[i]}`);
			}
		}

		let files: string[] = [];
		let directories: string[] = [];

		for (let i = 0; i < currentDir.files.length; i++) {
			files.push(currentDir.files[i].name);
		}

		for (let i = 0; i < currentDir.directories.length; i++) {
			directories.push(currentDir.directories[i].name);
		}

		return {
			files,
			directories
		};
	}

	exists(path: string) {
		try {
			this.readFile(path);
		} catch (e) {
			return false;
		}
	}
}