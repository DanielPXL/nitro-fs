import { ModType } from "../SSEQ/Command";
import { Note, noteToFrequency } from "../SSEQ/Note";
import { ADSRConverter } from "./ADSRConverter";
import { Envelope } from "./Envelope";
import { PlayingNote } from "./PlayingNote";
import { TrackInfo } from "./Track";

export class PSGPlayingNote implements PlayingNote {
	constructor(note: Note, envelope: Envelope, dutyCycle: number, sampleRate: number, velocity: number, trackInfo: TrackInfo, doneCallback: () => void) {
		this.note = note;
		this.envelope = envelope;
		this.dutyCycle = dutyCycle;
		this.sampleRate = sampleRate;
		this.velocity = ADSRConverter.convertSustain(velocity);
		this.trackInfo = trackInfo;
		this.doneCallback = doneCallback;
	}

	note: Note;
	envelope: Envelope;
	dutyCycle: number;
	sampleRate: number;
	velocity: number;
	trackInfo: TrackInfo;

	doneCallback: () => void;

	sampleIndex = 0;

	modulationPitch = 0;
	modulationVolume = 1;
	modulationTickCount = 0;
	modulationStartTime?: number;

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
		const f = noteToFrequency(this.note + this.trackInfo.pitchBendSemitones + this.modulationPitch);

		function psgWave(x: number) {
			// return triangleWave(x) < dutyCycle ? 1 : -1;
			return Math.ceil(dutyCycle - triangleWave(x + dutyCycle / 2));
		}

		const t = f * (this.sampleIndex / this.sampleRate);
		this.sampleIndex++;

		const volume = this.velocity
			+ this.envelope.getGain()
			+ ADSRConverter.convertSustain(this.trackInfo.volume1)
			+ ADSRConverter.convertSustain(this.trackInfo.volume2);
		
		const actualVolume = (ADSRConverter.convertVolume(volume) / 127) * this.modulationVolume;
		return Math.min(1, Math.max(0, actualVolume)) * (psgWave(t) - 0.5) * 2;
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

	pitchBend(semitones: number) {
		// PSG waves don't need special handling for pitch bends since they are made out of square waves
		this.trackInfo.pitchBendSemitones = semitones;
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

	modulationTick(time: number): void {
		this.modulationTickCount++;
		if (this.modulationTickCount < this.trackInfo.modDelay) {
			return;
		}

		if (this.trackInfo.modDepth === 0) {
			return;
		}

		if (this.modulationStartTime === undefined) {
			this.modulationStartTime = time;
		}

		const modulationAmplitude = (this.trackInfo.modDepth / 127) * this.trackInfo.modRange;
		const modulationFreq = (this.trackInfo.modSpeed / 127) * 50;
		
		const modulationValue = modulationAmplitude * Math.sin(2 * Math.PI * modulationFreq * (time - this.modulationStartTime));
		if (this.trackInfo.modType === ModType.Pitch) {
			const freqBeforeModulation = noteToFrequency(this.note + this.trackInfo.pitchBendSemitones + this.modulationPitch);
			this.modulationPitch = modulationValue;
			const freqAfterModulation = noteToFrequency(this.note + this.trackInfo.pitchBendSemitones + this.modulationPitch);
			const ratio = freqAfterModulation / freqBeforeModulation;
			this.sampleIndex = this.sampleIndex / ratio;
		} else if (this.trackInfo.modType === ModType.Volume) {
			// Modulation is given in decibels
			this.modulationVolume = Math.pow(10, modulationValue / 10);
		}
	}
}