import { Note, noteToFrequency } from "../SSEQ/Note";
import { ADSRConverter } from "./ADSRConverter";
import { Envelope } from "./Envelope";
import { PlayingNote } from "./PlayingNote";
import { TrackInfo } from "./Track";

export class PSGPlayingNote implements PlayingNote {
	constructor(note: Note, envelope: Envelope, dutyCycle: number, velocity: number, trackInfo: TrackInfo, doneCallback: () => void) {
		this.note = note;
		this.envelope = envelope;
		this.dutyCycle = dutyCycle;
		this.velocity = ADSRConverter.convertSustain(velocity);
		this.trackInfo = trackInfo;
		this.doneCallback = doneCallback;
	}

	note: Note;
	envelope: Envelope;
	dutyCycle: number;
	velocity: number;
	trackInfo: TrackInfo;

	doneCallback: () => void;
	
	// As far as I can tell, pitch bend is not supported by PSG notes
	// It needs to be here to satisfy the PlayingNote interface though
	pitchBend(semitones: number) { }


	getValue(time: number): number {
		// Probably not the best way to do this, but it works
		// See https://www.desmos.com/calculator/me1ndcugzv for more info on how this works

		if (this.envelope.isDone) {
			this.doneCallback();
			return 0;
		}

		function triangleWave(x: number): number {
			x = x % 1;
			if (x < 0.5) {
				return 2 * x;
			} else {
				return 2 - 2 * x;
			}
		}

		const dutyCycle = this.dutyCycleToThreshold(this.dutyCycle);
		const f = noteToFrequency(this.note);

		function psgWave(x: number) {
			// return triangleWave(x) < dutyCycle ? 1 : -1;
			return Math.ceil(dutyCycle - triangleWave(x + dutyCycle / 2));
		}

		const t = f * (time - this.envelope.startTime);

		const volume = this.velocity
			+ this.envelope.getGain()
			+ ADSRConverter.convertSustain(this.trackInfo.volume1)
			+ ADSRConverter.convertSustain(this.trackInfo.volume2);
		
		return (ADSRConverter.convertVolume(volume) / 127) * (psgWave(t) - 1) * 2;
	}

	dutyCycleToThreshold(dutyCycle: number): number {
		/* https://problemkaputt.de/gbatek.htm#dssoundnotes
			0  12.5% "_______-_______-_______-"
			1  25.0% "______--______--______--"
			2  37.5% "_____---_____---_____---"
			3  50.0% "____----____----____----"
			4  62.5% "___-----___-----___-----"
			5  75.0% "__------__------__------"
			6  87.5% "_-------_-------_-------"
			7   0.0% "________________________"
		*/

		if (dutyCycle === 7) {
			return 0;
		}

		return (dutyCycle + 1) / 8;
	}

	release(time: number) {
		this.envelope.release(time);
	}

	setVolume(volume1: number, volume2: number) {
		this.trackInfo.volume1 = volume1;
		this.trackInfo.volume2 = volume2;
	}
}