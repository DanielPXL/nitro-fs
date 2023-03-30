import { ADSRConverter } from "./ADSRConverter";

export class Envelope {
	constructor(startTime: number, attackRate: number, decayRate: number, sustainLevel: number, releaseRate: number) {
		this.startTime = startTime;
		this.stopTime = -1;

		this.attackEndTime = startTime + ADSRConverter.convertAttack(attackRate);
		this.decayEndTime = this.attackEndTime + ADSRConverter.convertFall(decayRate);
		this.releaseTimeNeeded = ADSRConverter.convertFall(releaseRate);

		this.sustainLevel = ADSRConverter.convertSustain(sustainLevel);

		console.log(this);
	}

	private static readonly LN_1_OVER_2_92544 = Math.log(1 / (2 * 92544));

	startTime: number;
	stopTime: number;

	attackEndTime: number;
	decayEndTime: number;
	releaseTimeNeeded: number;
	sustainLevel: number;

	getGain(time: number): number {
		// if (time < this.startTime) {
		// 	return this.normalize(-92544);
		// }

		// if (time < this.attackEndTime) {
		// 	// Best exponential function I could think of
		// 	// f(t) = -92544 * e^(ln(1 / (2 * 92544)) * t)
		// 	const t = (time - this.startTime) / (this.attackEndTime - this.startTime);
		// 	return this.normalize(-92544 * Math.exp(Envelope.LN_1_OVER_2_92544 * t));
		// }

		// if (time < this.decayEndTime && this.stopTime === -1) {
		// 	// Decay is linear
		// 	const t = (time - this.attackEndTime) / (this.decayEndTime - this.attackEndTime);
		// 	return this.normalize(this.sustainLevel * t);
		// }

		// if (this.stopTime === -1) {
		// 	return this.normalize(this.sustainLevel);
		// }

		// if (time < this.stopTime + this.releaseTimeNeeded) {
		// 	// Release directly after attack
		// 	if (this.stopTime === this.attackEndTime) {
		// 		const t = (time - this.stopTime) / this.releaseTimeNeeded;
		// 		return this.normalize(0 + (-92544 - 0) * t);
		// 	}
		// }

		// if (time < this.stopTime) {
		// 	return this.normalize(this.sustainLevel);
		// }

		// if (time < this.stopTime + this.releaseTimeNeeded) {
		// 	// Release after attack
		// 	if (this.stopTime === this.attackEndTime) {
		// 		const t = (time - this.stopTime) / this.releaseTimeNeeded;
		// 		return this.normalize(0 + (-92544 - 0) * t);
		// 	}

		// 	// Release is linear
		// 	const t = (time - this.stopTime) / this.releaseTimeNeeded;
		// 	return this.normalize(this.sustainLevel + (-92544 - this.sustainLevel) * t);
		// }

		// return this.normalize(-92544);

		// Note is on
		if (this.stopTime === -1) {
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

			let msg = "sustain ";

			if (this.stopTime < this.attackEndTime) {
				// Attack
				const stopT = (this.stopTime - this.startTime) / (this.attackEndTime - this.startTime);
				amplitudeAtStop = -92544 * Math.exp(Envelope.LN_1_OVER_2_92544 * stopT);
				msg = "attack ";
			} else if (this.stopTime < this.decayEndTime) {
				// Decay
				const stopT = (this.stopTime - this.attackEndTime) / (this.decayEndTime - this.attackEndTime);
				amplitudeAtStop = this.sustainLevel * stopT;
				msg = "decay ";
			}

			// console.log(msg + amplitudeAtStop);

			// Amplitude falls linearly to -92544
			const t = (time - this.stopTime) / this.releaseTimeNeeded;
			return this.normalize(amplitudeAtStop - (92544 + amplitudeAtStop) * t);
		}
	}

	release(time: number) {
		// if (time < this.attackEndTime) {
		// 	this.stopTime = this.attackEndTime;
		// }

		// if (time < this.decayEndTime) {
		// 	this.stopTime = this.decayEndTime;
		// 	return;
		// }

		this.stopTime = time;
	}

	normalize(gain: number) {
		return (gain + 92544) / 92544;
	}
}