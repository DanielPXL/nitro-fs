import { BufferReader } from "../../../BufferReader";

// https://gota7.github.io/NitroStudio2/specs/bank.html#note-info

export class NoteInfo {
	constructor(raw: BufferReader) {
		// 0x00 (2 bytes): Wave ID (PCM) or Duty Cycle Type (PSG)
		this.waveId = raw.readUint16(0x00);
		// 0x02 (2 byte): Wave Archive ID
		this.waveArchiveId = raw.readUint16(0x02);
		// 0x04 (1 byte): Base Note
		this.baseNote = raw.readUint8(0x04);
		// 0x05 (1 byte): Attack
		this.attack = raw.readUint8(0x05);
		// 0x06 (1 byte): Decay
		this.decay = raw.readUint8(0x06);
		// 0x07 (1 byte): Sustain
		this.sustain = raw.readUint8(0x07);
		// 0x08 (1 byte): Release
		this.release = raw.readUint8(0x08);
		// 0x09 (1 byte): Pan
		this.pan = raw.readUint8(0x09);
	}

	waveId: number;
	waveArchiveId: number;
	baseNote: number;
	attack: number;
	decay: number;
	sustain: number;
	release: number;
	pan: number;
}