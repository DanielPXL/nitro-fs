import { SWAV } from "../SWAV/SWAV";
import { Note, noteToFrequency } from "../SSEQ/Note";
import { Envelope } from "./Envelope";
import { Resampler } from "./Resampler";
import { PlayingNote } from "./PlayingNote";
import { ADSRConverter } from "./ADSRConverter";
import { TrackInfo } from "./Track";
import { ModType } from "../SSEQ/Command";

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
	
	modulationPitch = 0;
	modulationVolume = 1;
	modulationTickCount = 0;
	modulationStartTime?: number;

	release(time: number) {
		this.envelope.release(time);
	}

	getValue(time: number) {
		const ratio = noteToFrequency(this.note + this.trackInfo.pitchBendSemitones + this.modulationPitch) / noteToFrequency(this.baseNote);

		const sample = Resampler.singleSample(
			this.sample,
			this.swav.dataBlock.samplingRate, 
			this.sampleRate / ratio,
			Math.floor(this.sampleIndex),
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopStart : undefined,
			this.swav.dataBlock.loop ? this.swav.dataBlock.loopLength : undefined
		);

		this.sampleIndex += 1;

		if (sample === null || this.envelope.isDone) {
			this.doneCallback();
			return 0;
		}

		const volume = this.velocity
			+ this.envelope.getGain()
			+ ADSRConverter.convertSustain(this.trackInfo.volume1)
			+ ADSRConverter.convertSustain(this.trackInfo.volume2);
		
		const actualVolume = (ADSRConverter.convertVolume(volume) / 127) * this.modulationVolume;
		return Math.min(1, Math.max(0, actualVolume)) * sample;
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

	setModulation(modDepth: number, modRange: number, modSpeed: number, modDelay: number, modType: ModType) {
		this.trackInfo.modDepth = modDepth;
		this.trackInfo.modRange = modRange;
		this.trackInfo.modSpeed = modSpeed;
		this.trackInfo.modDelay = modDelay;
		this.trackInfo.modType = modType;
	}

	modulationTick(time: number) {
		this.modulationTickCount++;
		if (this.modulationTickCount < this.trackInfo.modDelay) {
			return;
		}

		if (this.trackInfo.modDepth === 0) {
			return
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