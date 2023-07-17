import { CommandType } from "../SSEQ/CommandType";
import { SDAT } from "../SDAT/SDAT";
import { SSEQ } from "../SSEQ/SSEQ";
import { Track } from "./Track";
import { SBNK } from "../SBNK/SBNK";
import { Synthesizer } from "./Synthesizer";
import { SWAR } from "../SWAR/SWAR";
import { SequenceInfo } from "../SDAT/FileInfo";
import { SequenceVariables } from "./SequenceVariables";
import { Random } from "./Random";

/**
 * Renders an SSEQ to a stereo buffer of 32-bit floating point samples.
 */
export class SequenceRenderer {
	constructor(info: RendererInfo) {
		this.sseq = info.sseq;
		this.sdat = info.sdat;
		this.sampleRate = info.sampleRate ? info.sampleRate : 48000;
		this.activeTracks = info.activeTracks ? info.activeTracks : 0xFFFF;
		this.sequenceVariables = info.variables ? info.variables : new SequenceVariables();
		this.random = new Random(info.seed);

		const sbnkFile = this.sdat.fs.banks.find(b => b.id === info.sseqInfo.bankId);
		const sbnk = new SBNK(sbnkFile.buffer);
		const sbnkInfo = sbnkFile.fileInfo;

		let swar = [];
		for (let i = 0; i < sbnkInfo.waveArchives.length; i++) {
			const waveArchiveId = sbnkInfo.waveArchives[i];
			const waveArchive = this.sdat.fs.waveArchives.find(w => w.id === waveArchiveId);
	
			if (waveArchive) {
				swar[i] = new SWAR(waveArchive.buffer);
			}
		}

		this.synth = new Synthesizer(sbnk, swar, info.sampleRate, this.tempo, info.sink, info.bufferLength);
		
		// this.samplesPerTick = SequenceRenderer.TICK_INTERVAL * sampleRate;
		// Do this to avoid floating point rounding errors
		this.samplesPerTick = ((64 * 2728) * info.sampleRate) / 33513982;

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
			this.sseq,
			this.sdat,
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
}

/**
 * Information needed to render an SSEQ.
 */
export interface RendererInfo {
	/**
	 * The SDAT that contains the SSEQ, SBNK, and SWAR files.
	 */
	sdat: SDAT;

	/**
	 * The SSEQ to render.
	 */
	sseq: SSEQ;

	/**
	 * The SSEQ info block for the SSEQ to render.
	 */
	sseqInfo: SequenceInfo;

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