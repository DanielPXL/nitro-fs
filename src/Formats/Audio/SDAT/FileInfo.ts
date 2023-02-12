import { BufferReader } from "../../../BufferReader";
import { Table, TableEntry } from "../Common/Table";

// https://gota7.github.io/NitroStudio2/specs/soundData.html#info-block

export class SequenceInfo {
	constructor(raw: BufferReader) {
		this.fileId = raw.readUint32(0x00);
		this.bankId = raw.readUint16(0x04);
		this.volume = raw.readUint8(0x06);
		this.channelPriority = raw.readUint8(0x07);
		this.playerPriority = raw.readUint8(0x08);
		this.playerId = raw.readUint8(0x09);
	}

	public fileId: number;
	public bankId: number;
	public volume: number;
	public channelPriority: number;
	public playerPriority: number;
	public playerId: number;
}

export class SequenceArchiveInfo {
	constructor(raw: BufferReader) {
		this.fileId = raw.readUint32(0x00);
	}

	public fileId: number;
}

export class BankInfo {
	constructor(raw: BufferReader) {
		this.fileId = raw.readUint32(0x00);

		this.waveArchives = new Array(4);
		this.waveArchives[0] = raw.readInt16(0x04);
		this.waveArchives[1] = raw.readInt16(0x06);
		this.waveArchives[2] = raw.readInt16(0x08);
		this.waveArchives[3] = raw.readInt16(0x0A);
	}

	public fileId: number;
	public waveArchives: number[];
}

export class WaveArchiveInfo {
	constructor(raw: BufferReader) {
		// File ID in form 0xLLFFFFFF where F is the file ID and L is a bool to indicate that the archive should be loaded individually
		const value = raw.readUint32(0x00);
		this.fileId = value & 0x00FFFFFF;
		this.loadIndividually = (value & 0xFF000000) !== 0;
	}

	public fileId: number;
	public loadIndividually: boolean;
}

export class PlayerInfo {
	constructor(raw: BufferReader) {
		this.maxVoices = raw.readUint16(0x00);
		this.channels = raw.readUint16(0x02);
		this.heapSize = raw.readUint32(0x04);
	}

	public maxVoices: number;
	public channels: number;
	public heapSize: number;
}

export class GroupInfo {
	constructor(raw: BufferReader) {
		const table = new Table(raw, GroupEntry);
		this.entries = table.entries;
	}

	entries: GroupEntry[];
}

export class GroupEntry extends TableEntry {
	constructor(raw: BufferReader) {
		super(raw);

		this.type = raw.readUint8(0x00);
		this.load = raw.readUint8(0x01);
		// Padding (2 bytes)
		this.entryId = raw.readUint32(0x04);
	}

	public type: GroupEntryType;
	public load: number;
	public entryId: number;

	readonly length = 0x08;
}

export enum GroupEntryType {
	Sequence = 0,
	Bank = 1,
	WaveArchive = 2,
	SequenceArchive = 3
}

export class StreamPlayerInfo {
	constructor(raw: BufferReader) {
		this.channelCount = raw.readUint8(0x00);
		this.leftOrMonoChannel = raw.readUint8(0x01);
		this.rightChannel = raw.readUint8(0x02);
	}

	public channelCount: number;
	public leftOrMonoChannel: number;
	public rightChannel: number;
}

export class StreamInfo {
	constructor(raw: BufferReader) {
		// File ID in form 0xLLFFFFFF where F is the file ID and L is a bool to indicate that the stream should be converted to stereo
		const value = raw.readUint32(0x00);
		this.fileId = value & 0x00FFFFFF;
		this.convertToStereo = (value & 0xFF000000) !== 0;
		this.volume = raw.readUint8(0x04);
		this.priority = raw.readUint8(0x05);
		this.playerId = raw.readUint8(0x06);
	}

	public fileId: number;
	public convertToStereo: boolean;
	public volume: number;
	public priority: number;
	public playerId: number;
}