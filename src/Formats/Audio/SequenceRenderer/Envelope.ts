import { ADSRConverter } from "./ADSRConverter";

// http://www.feshrine.net/hacking/doc/nds-sdat.php#sbnk

export enum EnvelopeState {
	Attack,
	Decay,
	Sustain,
	Release
}

export class Envelope {
	constructor(startTime: number, attackRate: number, decayRate: number, sustainLevel: number, releaseRate: number, stopTime?: number) {
		this.startTime = startTime;

		if (stopTime === undefined) {
			this.stopTime = startTime + 100000;
		} else {
			this.stopTime = stopTime;
		}

		this.attackRate = ADSRConverter.convertAttack(attackRate);
		this.decayRate = ADSRConverter.convertFall(decayRate);
		this.sustainLevel = ADSRConverter.convertSustain(sustainLevel);
		this.releaseRate = ADSRConverter.convertFall(releaseRate);
	}

	startTime: number;
	stopTime: number;
	attackRate: number;
	decayRate: number;
	sustainLevel: number;
	releaseRate: number;

	state: EnvelopeState = EnvelopeState.Attack;
	gain = -92544;

	tick(time: number) {
		if (time < this.startTime) {
			return;
		}

		if (time > this.stopTime) {
			this.state = EnvelopeState.Release;
		}

		switch (this.state) {
			case EnvelopeState.Attack:
				this.gain = Math.round(this.attackRate * this.gain / 255);
				if (this.gain >= 0) {
					this.state = EnvelopeState.Decay;
					this.gain = 0;
				}
				break;

			case EnvelopeState.Decay:
				this.gain -= this.decayRate;
				if (this.gain <= this.sustainLevel) {
					this.state = EnvelopeState.Sustain;
					this.gain = this.sustainLevel;
				}
				break;

			case EnvelopeState.Sustain:
				break;

			case EnvelopeState.Release:
				this.gain -= this.releaseRate;
				break;
		}

		if (this.gain < -92544) {
			this.gain = -92544;
		}

		if (this.gain > 0) {
			this.gain = 0;
		}
	}

	get isDone() {
		return this.state === EnvelopeState.Release && this.gain <= -92544;
	}
}