import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { Table, TableEntry } from "../Common/Table";
import { InstrumentType } from "./Instrument";

// https://gota7.github.io/NitroStudio2/specs/bank.html

export class SBNKDataBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "DATA");

		// 0x08 (32 bytes): Padding

		// 0x28: Instrument entry table
		this.instrumentTable = new Table(raw.slice(0x28), InstrumentTableEntry);
	}

	instrumentTable: Table<InstrumentTableEntry>;
}

export class InstrumentTableEntry extends TableEntry {
	constructor(raw: BufferReader) {
		super(raw);

		// 0x00 (1 byte): Instrument type
		this.type = raw.readUint8(0x00);
		// 0x01 (2 bytes): Data offset
		this.dataOffset = raw.readUint16(0x01);
		// 0x03 (1 byte): Padding
	}

	readonly length = 0x04;

	type: InstrumentType;
	dataOffset: number;
}