import { Sample } from "./Sample";

export class PSGSample implements Sample {
	constructor(dutyCycle: number) {
		this.dutyCycle = dutyCycle;
	}

	dutyCycle: number;
	baseFreq = 1;

	getValue(targetSampleRate: number, index: number) {
		// Probably not the best way to do this, but it works
		// See https://www.desmos.com/calculator/me1ndcugzv for more info on how this works

		function triangleWave(x: number): number {
			x = x % 1;
			if (x < 0.5) {
				return 2 * x;
			} else {
				return 2 - 2 * x;
			}
		}

		const dutyCycle = this.dutyCycleToThreshold(this.dutyCycle);

		function psgWave(x: number) {
			// return triangleWave(x) < dutyCycle ? 1 : -1;
			return Math.ceil(dutyCycle - triangleWave(x + dutyCycle / 2));
		}

		return psgWave(index / targetSampleRate) * 2 - 1;
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
}