import { BufferReader } from "../../../BufferReader";
import { InfoBlock } from "./InfoBlock";
import { SDATHeader } from "./SDATHeader";
import { SymbolBlock } from "./SymbolBlock";
import { FATBlock } from "./FATBlock";
import { BankInfo, SequenceInfo, StreamInfo, WaveArchiveInfo } from "./FileInfo";

export class SDATFS {
	constructor(raw: BufferReader, header: SDATHeader) {
		let symbolBlock: SymbolBlock;
		if (header.symbolBlockSize > 0) {
			symbolBlock = new SymbolBlock(raw.slice(header.symbolBlockOffset, header.symbolBlockOffset + header.symbolBlockSize));
		}

		this.infoBlock = new InfoBlock(raw.slice(header.infoBlockOffset, header.infoBlockOffset + header.infoBlockSize));
		const fatBlock = new FATBlock(raw.slice(header.fileAllocationBlockOffset, header.fileAllocationBlockOffset + header.fileAllocationBlockSize));
	
		function collectFiles<T extends {fileId: number}>(symbols: string[], infos: T[]): SoundFile<T>[] {
			let files = [];

			for (let i = 0; i < infos.length; i++) {
				const info = infos[i];
				if (info) {
					const name = symbols ? symbols[i] : null;
					
					const fatEntry = fatBlock.entries[info.fileId];
					const buffer = raw.slice(fatEntry.offset, fatEntry.offset + fatEntry.size);

					files.push(new SoundFile(name, info, i, buffer));
				}
			}

			return files;
		}

		this.sequences = collectFiles(symbolBlock ? symbolBlock.sequenceSymbols : null, this.infoBlock.sequenceInfo);
		//this.sequenceArchives = collectFiles(symbolBlock ? symbolBlock.sequenceArchiveSymbols : null, infoBlock.sequenceArchiveInfo);
		this.banks = collectFiles(symbolBlock ? symbolBlock.bankSymbols : null, this.infoBlock.bankInfo);
		this.waveArchives = collectFiles(symbolBlock ? symbolBlock.waveArchiveSymbols : null, this.infoBlock.waveArchiveInfo);
		this.streams = collectFiles(symbolBlock ? symbolBlock.streamSymbols : null, this.infoBlock.streamInfo);
	}

	sequences: SoundFile<SequenceInfo>[];
	//sequenceArchives: SoundFile<SequenceArchiveInfo>[];
	banks: SoundFile<BankInfo>[];
	waveArchives: SoundFile<WaveArchiveInfo>[];
	streams: SoundFile<StreamInfo>[];

	infoBlock: InfoBlock;
}

export class SoundFile<T> {
	constructor(name: string, fileInfo: T, id: number, buffer: BufferReader) {
		this.name = name;
		this.fileInfo = fileInfo;
		this.id = id;
		this.buffer = buffer;
	}

	name: string;
	fileInfo: T;
	id: number;
	buffer: BufferReader;
}