import { CommandType } from "../SSEQ/CommandType";
import { Commands } from "../SSEQ/Command";
import { SDAT } from "../SDAT/SDAT";
import { SSEQ } from "../SSEQ/SSEQ";
import { Track } from "./Track";
import { SBNK } from "../SBNK/SBNK";
import { Synthesizer } from "./Synthesizer";
import { SWAR } from "../SWAR/SWAR";
import { SequenceInfo } from "../SDAT/FileInfo";

export class SequenceRenderer {
	constructor(sseq: SSEQ, sseqInfo: SequenceInfo, sdat: SDAT, sampleRate: number, sink: (buffer: Float32Array[]) => void, bufferLength = 1024 * 4) {
		this.sseq = sseq;
		this.sdat = sdat;
		this.sampleRate = sampleRate;

		const sbnkFile = sdat.fs.banks.find(b => b.id === sseqInfo.bankId);
		const sbnk = new SBNK(sbnkFile.buffer);
		const sbnkInfo = sdat.fs.infoBlock.bankInfo[sbnkFile.id];

		let swar = [];
		for (let i = 0; i < sbnkInfo.waveArchives.length; i++) {
			const waveArchiveId = sbnkInfo.waveArchives[i];
			const waveArchive = sdat.fs.waveArchives.find(w => w.id === waveArchiveId);
	
			if (waveArchive) {
				swar[i] = new SWAR(waveArchive.buffer);
			}
		}

		this.synth = new Synthesizer(sbnk, swar, sampleRate, this.tempo, sink, bufferLength);
		
		// this.samplesPerTick = SequenceRenderer.TICK_INTERVAL * sampleRate;
		// Do this to avoid floating point rounding errors
		this.samplesPerTick = ((64 * 2728) * sampleRate) / 33513982;

		this.tracks = [];
		this.openTrack(0, 0);
	}

	public static readonly TICK_INTERVAL_MS = ((64 * 2728) * 1000 / 33513982);

	sseq: SSEQ;
	sdat: SDAT;
	sampleRate: number;
	synth: Synthesizer;
	samplesPerTick: number;
	tracks: Track[];
	tracksStarted: boolean = false;

	cycle: number = 0;
	tempo: number = 120;

	tick() {
		this.synth.tick(this.samplesPerTick);
		
		this.cycle += (this.tempo);
		if (this.cycle < 240) {
			return;
		}

		this.cycle -= 240;

		if (this.tracksStarted) {
			for (const track of this.tracks) {
				if (track) {
					track.tick();
				}
			}
		} else {
			this.tracks[0].tick();

			const nextCommandType = this.sseq.data.commands[this.tracks[0].offset + 1].type;
			if (nextCommandType === CommandType.AllocateTracks || nextCommandType === CommandType.OpenTrack) {
				this.tracksStarted = true;
			}
		}
	}
	
	private openTrack(track: number, offset: number) {
		if (this.tracks.length > 16) {
			throw new Error("Too many tracks");
		}
		
		const t = new Track(
			track,
			offset,
			this.sseq,
			this.sdat,
			this.synth,
			this.sampleRate,
			this.stopTrack.bind(this),
			this.changeTempo.bind(this),
			this.openTrack.bind(this)
		);

		this.tracks[track] = t;	
	}

	private stopTrack(track: number) {
		this.tracks[track] = null;
	}

	private changeTempo(tempo: number) {
		this.tempo = tempo;
		this.synth.bpm = tempo;
	}
}