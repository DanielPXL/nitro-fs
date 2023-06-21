import { ModType } from "../SSEQ/Command";
import { Note } from "../SSEQ/Note";
import { ADSRConverter } from "./ADSRConverter";
import { Envelope } from "./Envelope";
import { PlayingNote } from "./PlayingNote";
import { TrackInfo } from "./Track";

export class WhiteNoisePlayingNote implements PlayingNote {
	constructor(envelope: Envelope, velocity: number, trackInfo: TrackInfo, doneCallback: () => void) {
		this.envelope = envelope;
		this.velocity = ADSRConverter.convertSustain(velocity);
		this.trackInfo = trackInfo;
		this.doneCallback = doneCallback;
	}

	envelope: Envelope;
	velocity: number;
	trackInfo: TrackInfo;

	doneCallback: () => void;

	getValue(time: number): number {
		// TODO: This is not accurate
		// White noise does support pitch on the DS for some reason.... (White Noise by definition includes all frequencies???)
		// Oh well, it's not like it's used much anyway and it's better than nothing
		const value = Math.random() * 2 - 1;

		if (this.envelope.isDone) {
			this.doneCallback();
			return 0;
		}

		const volume = this.velocity
			+ this.envelope.getGain()
			+ ADSRConverter.convertSustain(this.trackInfo.volume1)
			+ ADSRConverter.convertSustain(this.trackInfo.volume2);
		
		return (ADSRConverter.convertVolume(volume) / 127) * value;
	}

	release(time: number) {
		this.envelope.release(time);
	}

	pitchBend(semitones: number) {
		// White noise doesn't have a pitch?
	}

	setVolume(volume1: number, volume2: number) {
		this.trackInfo.volume1 = volume1;
		this.trackInfo.volume2 = volume2;
	}

	setModulation(modDepth: number, modRange: number, modSpeed: number, modDelay: number, modType: ModType) {
		this.trackInfo.modDepth = modDepth;
		this.trackInfo.modRange = modRange;
		this.trackInfo.modSpeed = modSpeed;
		this.trackInfo.modDelay = modDelay;
		this.trackInfo.modType = modType;
	}

	modulationTick(time: number) {
		
	}
}