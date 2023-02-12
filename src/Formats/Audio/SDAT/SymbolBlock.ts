import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { Table, Uint32TableEntry } from "../Common/Table";

// https://gota7.github.io/NitroStudio2/specs/soundData.html#symbol-block

export class SymbolBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "SYMB");
		
		function getSymbols(offset: number) {
			let symbols = [];
			const tableOffset = raw.readUint32(offset);
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

		this.sequenceSymbols = getSymbols(0x08);
		// No SSAR symbols for now since they are structured a bit differently
		// this.ssarSymbols = getSymbols(0x0C);
		this.bankSymbols = getSymbols(0x10);
		this.waveArchiveSymbols = getSymbols(0x14);
		this.playerSymbols = getSymbols(0x18);
		this.groupSymbols = getSymbols(0x1C);
		this.streamPlayerSymbols = getSymbols(0x20);
		this.streamSymbols = getSymbols(0x24);
	}

	public sequenceSymbols: string[];
	// public ssarSymbols: string[];
	public bankSymbols: string[];
	public waveArchiveSymbols: string[];
	public playerSymbols: string[];
	public groupSymbols: string[];
	public streamPlayerSymbols: string[];
	public streamSymbols: string[];
}