import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { Table, TableEntry, Uint32TableEntry } from "../Common/Table";

// https://gota7.github.io/NitroStudio2/specs/soundData.html#symbol-block

export class SymbolBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "SYMB");
		
		function getSymbols(offset: number, direct = false) {
			let symbols = [];

			let tableOffset: number;
			if (direct) {
				tableOffset = offset;
			} else {
				tableOffset = raw.readUint32(offset);
			}

			const table = new Table(raw.slice(tableOffset), Uint32TableEntry);

			for (let i = 0; i < table.entries.length; i++) {
				const entry = table.entries[i];
				if (entry.value === 0) {
					continue;
				}

				const symbolOffset = entry.value;
				const symbol = raw.readString(symbolOffset);
				symbols[i] = symbol;
			}

			return symbols;
		}

		function getSSARSymbols(offset: number) {
			let symbols: SSARSymbol[] = [];
			const tableOffset = raw.readUint32(offset);
			const table = new Table(raw.slice(tableOffset), SSARSymbolEntry);

			for (let i = 0; i < table.entries.length; i++) {
				const entry = table.entries[i];
				if (entry.archiveSymbolOffset === 0 || entry.sequenceTableOffset === 0) {
					continue;
				}

				let symbol: SSARSymbol = {
					archiveName: raw.readString(entry.archiveSymbolOffset),
					sequenceNames: getSymbols(entry.sequenceTableOffset, true)
				};

				symbols[i] = symbol;
			}

			return symbols;
		}

		this.sequenceSymbols = getSymbols(0x08);
		this.sequenceArchiveSymbols = getSSARSymbols(0x0C);
		this.bankSymbols = getSymbols(0x10);
		this.waveArchiveSymbols = getSymbols(0x14);
		this.playerSymbols = getSymbols(0x18);
		this.groupSymbols = getSymbols(0x1C);
		this.streamPlayerSymbols = getSymbols(0x20);
		this.streamSymbols = getSymbols(0x24);
	}

	public sequenceSymbols: string[];
	public sequenceArchiveSymbols: SSARSymbol[];
	public bankSymbols: string[];
	public waveArchiveSymbols: string[];
	public playerSymbols: string[];
	public groupSymbols: string[];
	public streamPlayerSymbols: string[];
	public streamSymbols: string[];
}

export interface SSARSymbol {
	archiveName: string;
	sequenceNames: string[];
}

export class SSARSymbolEntry extends TableEntry {
	constructor(raw: BufferReader) {
		super(raw);

		// 0x00 (4 bytes): Archive Symbol Offset
		this.archiveSymbolOffset = raw.readUint32(0x00);
		// 0x04 (4 bytes): Sequence Symbol Table Offsets
		this.sequenceTableOffset = raw.readUint32(0x04);
	}

	readonly length = 0x08;

	archiveSymbolOffset: number;
	sequenceTableOffset: number;
}