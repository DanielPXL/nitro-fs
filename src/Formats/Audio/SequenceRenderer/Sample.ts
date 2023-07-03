export abstract class Sample {
	abstract getValue(targetSampleRate: number, index: number): number;
	abstract baseFreq: number;
}