import { SWAV } from "../SWAV/SWAV";
import { Note, noteToFrequency } from "../SSEQ/Note";
import { Envelope } from "./Envelope";
import { Resampler } from "./Resampler";
import { PlayingNote } from "./PlayingNote";
import { ADSRConverter } from "./ADSRConverter";
import { TrackInfo } from "./Track";

export class PCMPlayingNote implements PlayingNote {
	constructor(note: Note, envelope: Envelope, swav: SWAV, baseNote: Note, sampleRate: number, velocity: number, trackInfo: TrackInfo, doneCallback: () => void) {
		this.note = note;
		this.envelope = envelope;
		this.swav = swav;
		this.baseNote = baseNote;
		this.sampleRate = sampleRate;
		this.velocity = ADSRConverter.convertSustain(velocity);
		this.trackInfo = trackInfo;
		this.doneCallback = doneCallback;

		this.sample = swav.toPCM();
	}

	note: Note;
	envelope: Envelope;
	swav: SWAV;
	baseNote: Note;
	sampleRate: number;
	velocity: number;
	trackInfo: TrackInfo;
	doneCallback: () => void;
	
	sample: Float32Array;
	sampleIndex = 0;

	release(time: number) {
		this.envelope.release(time);
	}

	getValue(time: number) {
		const ratio = noteToFrequency(this.note + this.trackInfo.pitchBendSemitones) / noteToFrequency(this.baseNote);

		const sample = Resampler.singleSample(
			this.sample,
			this.swav.dataBlock.samplingRate, 
			this.sampleRate / ratio,
			Math.floor(this.sampleIndex),
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopStart : undefined,
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopLength : undefined
		);

		// I hate this, I don't want to keep state in here, but this is the easiest way to implement pitch bend
		this.sampleIndex += 1;

		if (sample === null || this.envelope.isDone) {
			this.doneCallback();
			return 0;
		}

		const volume = this.velocity
			+ this.envelope.getGain()
			+ ADSRConverter.convertSustain(this.trackInfo.volume1)
			+ ADSRConverter.convertSustain(this.trackInfo.volume2);
		
		return (ADSRConverter.convertVolume(volume) / 127) * sample;
	}

	pitchBend(semitones: number) {
		const freqBefore = noteToFrequency(this.note + this.trackInfo.pitchBendSemitones);

		this.trackInfo.pitchBendSemitones = semitones;

		const freqAfter = noteToFrequency(this.note + this.trackInfo.pitchBendSemitones);
		const ratio = freqAfter / freqBefore;

		this.sampleIndex = this.sampleIndex / ratio;
	}

	setVolume(volume1: number, volume2: number) {
		this.trackInfo.volume1 = volume1;
		this.trackInfo.volume2 = volume2;
	}
}