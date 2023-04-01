import { ADSRConverter } from "./ADSRConverter";

export class Envelope {
	constructor(startTime: number, attackRate: number, decayRate: number, sustainLevel: number, releaseRate: number, stopTime?: number) {
		this.startTime = startTime;

		if (stopTime === undefined) {
			this.stopTime = startTime + 100000;
		} else {
			this.stopTime = stopTime;
		}

		this.attackEndTime = startTime + ADSRConverter.convertAttack(attackRate);
		this.decayEndTime = this.attackEndTime + ADSRConverter.convertFall(decayRate);
		this.releaseTimeNeeded = ADSRConverter.convertFall(releaseRate);

		this.sustainLevel = ADSRConverter.convertSustain(sustainLevel);
	}

	private static readonly LN_1_OVER_2_92544 = Math.log(1 / (2 * 92544));

	startTime: number;
	stopTime: number;

	attackEndTime: number;
	decayEndTime: number;
	releaseTimeNeeded: number;
	sustainLevel: number;

	getGain(time: number): number {
		// Note is on
		if (time < this.stopTime) {
			if (time < this.startTime) {
				return this.normalize(-92544);
			}

			// Attack
			if (time < this.attackEndTime) {
				// Best exponential function I could think of
				// f(t) = -92544 * e^(ln(1 / (2 * 92544)) * t)
				const t = (time - this.startTime) / (this.attackEndTime - this.startTime);
				return this.normalize(-92544 * Math.exp(Envelope.LN_1_OVER_2_92544 * t));
			}

			// Decay
			if (time < this.decayEndTime) {
				// Decay is linear
				const t = (time - this.attackEndTime) / (this.decayEndTime - this.attackEndTime);
				return this.normalize(this.sustainLevel * t);
			}

			// Sustain
			return this.normalize(this.sustainLevel);
		} else {
			// Note is off
			if (time < this.startTime || time > this.stopTime + this.releaseTimeNeeded) {
				return this.normalize(-92544);
			}

			// Sustain
			let amplitudeAtStop = this.sustainLevel;

			if (this.stopTime < this.attackEndTime) {
				// Attack
				const stopT = (this.stopTime - this.startTime) / (this.attackEndTime - this.startTime);
				amplitudeAtStop = -92544 * Math.exp(Envelope.LN_1_OVER_2_92544 * stopT);
			} else if (this.stopTime < this.decayEndTime) {
				// Decay
				const stopT = (this.stopTime - this.attackEndTime) / (this.decayEndTime - this.attackEndTime);
				amplitudeAtStop = this.sustainLevel * stopT;
			}

			// console.log(msg + amplitudeAtStop);

			// Amplitude falls linearly to -92544
			const t = (time - this.stopTime) / this.releaseTimeNeeded;
			return this.normalize(amplitudeAtStop - (92544 + amplitudeAtStop) * t);
		}
	}

	release(time: number) {
		this.stopTime = time;
	}

	normalize(gain: number) {
		return (gain + 92544) / 92544;
	}
}