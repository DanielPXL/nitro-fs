import { SWAV } from "../SWAV/SWAV";
import { Note, noteToFrequency } from "../SSEQ/Note";
import { Envelope } from "./Envelope";
import { Resampler } from "./Resampler";
import { PlayingNote } from "./PlayingNote";

export class PCMPlayingNote implements PlayingNote {
	constructor(note: Note, envelope: Envelope, swav: SWAV, baseNote: Note, sampleRate: number, velocity: number, doneCallback: () => void) {
		this.note = note;
		this.envelope = envelope;
		this.swav = swav;
		this.baseNote = baseNote;
		this.sampleRate = sampleRate;
		this.velocity = velocity / 127;
		this.doneCallback = doneCallback;

		this.sample = swav.toPCM();
	}

	note: Note;
	envelope: Envelope;
	swav: SWAV;
	baseNote: Note;
	sampleRate: number;
	velocity: number;
	doneCallback: () => void;

	sample: Float32Array;

	release(time: number) {
		this.envelope.release(time);
	}

	getValue(time: number) {
		const ratio = noteToFrequency(this.note) / noteToFrequency(this.baseNote);
		let t = (time - this.envelope.startTime);

		const sample = Resampler.singleSample(
			this.sample,
			this.swav.dataBlock.samplingRate, 
			this.sampleRate / ratio,
			Math.floor(t * this.sampleRate),
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopStart : undefined,
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopLength : undefined
		);

		if (this.envelope.isDone) {
			this.doneCallback();
			return 0;
		}

		return this.velocity * this.envelope.getGain(time) * sample;
	}
}