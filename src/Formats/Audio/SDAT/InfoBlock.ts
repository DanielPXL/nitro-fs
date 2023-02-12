import { BufferReader } from "../../../BufferReader";
import { Block } from "../Common/Block";
import { Table, Uint32TableEntry } from "../Common/Table";
import { BankInfo, GroupInfo, PlayerInfo, SequenceArchiveInfo, SequenceInfo, StreamInfo, StreamPlayerInfo, WaveArchiveInfo } from "./FileInfo";

// https://gota7.github.io/NitroStudio2/specs/soundData.html#info-block

export class InfoBlock extends Block {
	constructor(raw: BufferReader) {
		super(raw, "INFO");

		function readTable<T>(offset: number, fileInfoType: new (raw: BufferReader) => T): T[] {
			const fileInfos = [];
			const tableOffset = raw.readUint32(offset);
			const table = new Table(raw.slice(tableOffset), Uint32TableEntry);

			for (let i = 0; i < table.entries.length; i++) {
				const entry = table.entries[i];
				if (entry.value === 0) {
					continue;
				}

				const infoOffset = entry.value;
				const info = new fileInfoType(raw.slice(infoOffset));
				fileInfos[i] = info;
			}

			return fileInfos;
		}

		this.sequenceInfo = readTable(0x08, SequenceInfo);
		this.sequenceArchiveInfo = readTable(0x0C, SequenceArchiveInfo);
		this.bankInfo = readTable(0x10, BankInfo);
		this.waveArchiveInfo = readTable(0x14, WaveArchiveInfo);
		this.playerInfo = readTable(0x18, PlayerInfo);
		this.groupInfo = readTable(0x1C, GroupInfo);
		this.streamPlayerInfo = readTable(0x20, StreamPlayerInfo);
		this.streamInfo = readTable(0x24, StreamInfo);
	}

	sequenceInfo: SequenceInfo[];	
	sequenceArchiveInfo: SequenceArchiveInfo[];
	bankInfo: BankInfo[];
	waveArchiveInfo: WaveArchiveInfo[];
	playerInfo: PlayerInfo[];
	groupInfo: GroupInfo[];
	streamPlayerInfo: StreamPlayerInfo[];
	streamInfo: StreamInfo[];
}