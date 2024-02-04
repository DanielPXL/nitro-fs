import { Track } from "./Track";
import { SBNK } from "../SBNK/SBNK";
import { Synthesizer } from "./Synthesizer";
import { SWAR } from "../SWAR/SWAR";
import { SequenceVariables } from "./SequenceVariables";
import { Random } from "./Random";
import { Command } from "../SSEQ/Command";
import { SDAT } from "../SDAT/SDAT";
import { SequenceInfo } from "../SDAT/FileInfo";
import { SequenceArchiveFile, SoundFile } from "../SDAT/SDATFS";
import { SSEQ } from "../SSEQ/SSEQ";
import { SSAR } from "../SSAR/SSAR";

/**
 * Renders an SSEQ to a stereo buffer of 32-bit floating point samples.
 */
export class SequenceRenderer {
	constructor(info: RendererInfo) {
		this.commands = info.file.commands;
		this.sampleRate = info.sampleRate ? info.sampleRate : 48000;
		this.activeTracks = info.activeTracks ? info.activeTracks : 0xFFFF;
		this.sequenceVariables = info.variables ? info.variables : new SequenceVariables();
		this.random = new Random(info.seed);

		this.synth = new Synthesizer(info.file.bank, info.file.swars, info.sampleRate, this.tempo, info.sink, info.bufferLength);
		
		// this.samplesPerTick = SequenceRenderer.TICK_INTERVAL * sampleRate;
		// Do this to avoid floating point rounding errors
		this.samplesPerTick = ((64 * 2728) * info.sampleRate) / 33513982;

		this.tracks = [];
		this.openTrack(0, 0);
	}

	public static readonly TICK_INTERVAL_MS = ((64 * 2728) * 1000 / 33513982);

	commands: Command[];
	sampleRate: number;
	synth: Synthesizer;
	samplesPerTick: number;
	tracks: Track[];
	sequenceVariables: SequenceVariables;
	tracksStarted: boolean = false;
	activeTracks: number;
	random: Random;

	cycle: number = 0;
	tempo: number = 120;

	/**
	 * Runs the renderer for one tick. Call this in a loop to render the entire sequence.
	 * The renderer will call the sink function when it has a buffer to output.
	 */
	tick() {
		this.synth.tick(this.samplesPerTick);
		
		this.cycle += this.tempo;
		if (this.cycle < 240) {
			return;
		}

		this.cycle -= 240;

		for (const track of this.tracks) {
			if (track) {
				track.tick();
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
			this.commands,
			this.synth,
			this.sampleRate,
			this.sequenceVariables,
			this.random,
			this.stopTrack.bind(this),
			this.changeTempo.bind(this),
			this.openTrack.bind(this)
		);

		if (1 << track & this.activeTracks) {
			t.active = true;
		} else {
			t.active = false;
		}

		this.tracks[track] = t;	
	}

	private stopTrack(track: number) {
		this.tracks[track] = null;
	}

	private changeTempo(tempo: number) {
		this.tempo = tempo;
		this.synth.bpm = tempo;
	}

	static makeInfoSSEQ(sdat: SDAT, name: string): RendererFileInfo
	static makeInfoSSEQ(sdat: SDAT, id: number): RendererFileInfo
	static makeInfoSSEQ(sdat: SDAT, id: string | number): RendererFileInfo {
		let sseqFile: SoundFile<SequenceInfo>;
		if (typeof id === "string") {
			sseqFile = sdat.fs.sequences.find(s => s.name === id);
		} else {
			sseqFile = sdat.fs.sequences.find(s => s.id === id);
		}

		if (!sseqFile) {
			throw new Error(`Sequence ${id} not found`);
		}

		const sbnkFile = sdat.fs.banks.find(b => b.id === sseqFile.fileInfo.bankId);
		const sbnkInfo = sbnkFile.fileInfo;

		let swar = [];
		for (let i = 0; i < sbnkInfo.waveArchives.length; i++) {
			const waveArchiveId = sbnkInfo.waveArchives[i];
			const waveArchive = sdat.fs.waveArchives.find(w => w.id === waveArchiveId);
	
			if (waveArchive) {
				swar[i] = new SWAR(waveArchive.buffer);
			}
		}

		const sseq = new SSEQ(sseqFile.buffer);
		const sbnk = new SBNK(sbnkFile.buffer);
		return {
			commands: sseq.data.commands,
			bank: sbnk,
			swars: swar
		}
	}

	static makeInfoSSAR(sdat: SDAT, name: string, subName: string): RendererFileInfo
	static makeInfoSSAR(sdat: SDAT, name: string, subId: number): RendererFileInfo
	static makeInfoSSAR(sdat: SDAT, id: number, subId: number): RendererFileInfo
	static makeInfoSSAR(sdat: SDAT, id: number, subName: string): RendererFileInfo
	static makeInfoSSAR(sdat: SDAT, id: string | number, subId: string | number): RendererFileInfo {
		let ssarFileIndex: number;
		if (typeof id === "string") {
			ssarFileIndex = sdat.fs.sequenceArchives.findIndex(s => s.name === id);
		} else {
			ssarFileIndex = sdat.fs.sequenceArchives.findIndex(s => s.id === id);
		}

		if (ssarFileIndex === -1) {
			throw new Error(`Sequence Archive ${id} not found`);
		}

		const ssarFile = sdat.fs.sequenceArchives[ssarFileIndex];
		const ssar = new SSAR(ssarFile.buffer);

		let subSequenceIndex: number;
		if (typeof subId === "string") {
			subSequenceIndex = ssarFile.sequenceSymbols.findIndex(s => s === subId);
		} else {
			subSequenceIndex = subId;
		}

		if (subSequenceIndex === -1) {
			throw new Error(`Sequence ${subId} not found in Sequence Archive ${id}`);
		}

		const subSequence = ssar.dataBlock.sequenceTable.entries[subSequenceIndex];
		const sbnkFile = sdat.fs.banks.find(b => b.id === subSequence.bankId);
		const sbnkInfo = sbnkFile.fileInfo;

		let swar = [];
		for (let i = 0; i < sbnkInfo.waveArchives.length; i++) {
			const waveArchiveId = sbnkInfo.waveArchives[i];
			const waveArchive = sdat.fs.waveArchives.find(w => w.id === waveArchiveId);
	
			if (waveArchive) {
				swar[i] = new SWAR(waveArchive.buffer);
			}
		}

		const sbnk = new SBNK(sbnkFile.buffer);
		return {
			commands: ssar.getSequenceData(subSequenceIndex),
			bank: sbnk,
			swars: swar
		}
	}
}

/**
 * Information needed to render an SSEQ.
 */
export interface RendererInfo {

	file: RendererFileInfo;

	/**
	 * The function to call when the renderer has a buffer to output.
	 * @param buffer - A stereo buffer of 32-bit floating point samples. The length of the
	 * buffers is always equal to the bufferLength parameter.
	 */
	sink: (buffer: Float32Array[]) => void;

	/**
	 * The length of the buffer to output. Defaults to 4096.
	 */
	bufferLength?: number;

	/**
	 * The sample rate to render at. Defaults to 48000.
	 */
	sampleRate?: number;

	/**
	 * The active tracks bitmask. Should be 16 bits long, with each bit corresponding to a track.
	 * Defaults to 0xFFFF (all channels active).
	 */
	activeTracks?: number;

	/**
	 * The sequence variables to use. You can use this object even after the renderer has started,
	 * or you can reuse it for multiple renderers, which will allow you to share variables
	 * between them (although the DS resets the local variables between sequences, do that with variables.resetLocal()).
	 * Defaults to a new SequenceVariables object.
	 */
	variables?: SequenceVariables;

	/**
	 * Seed for the random number generator. Defaults to Date.now().
	 */
	seed?: number;
}

export interface RendererFileInfo {
	commands: Command[];
	bank: SBNK;
	swars: SWAR[];
}