import { BufferReader } from "../../../BufferReader";

export enum EncodingType {
	PCM8 = 0,
	PCM16 = 1,
	IMA_ADPCM = 2
}

export class Encoding {
	static toPCM(raw: BufferReader, encoding: EncodingType): Float32Array {
		switch (encoding) {
			case EncodingType.PCM8:
				return this.PCM8toPCM(raw);
			case EncodingType.PCM16:
				return this.PCM16toPCM(raw);
			case EncodingType.IMA_ADPCM:
				return this.IMA_ADPCMtoPCM(raw);
			default:
				throw new Error("Unknown encoding type");
		}
	}

	static PCM8toPCM(raw: BufferReader) {
		let buffer = new Float32Array(raw.length);

		for (let i = 0; i < raw.length; i++) {
			buffer[i] = raw.readInt8(i) / 128;
		}

		return buffer;
	}

	static PCM16toPCM(raw: BufferReader) {
		let buffer = new Float32Array(raw.length / 2);

		for (let i = 0; i < raw.length / 2; i++) {
			buffer[i] = raw.readInt16(i * 2) / 32768;
		}

		return buffer;
	}

	static IMA_ADPCMtoPCM(raw: BufferReader) {
		let buffer = new Float32Array(raw.length * 2 - 8);

		let destOff = 0;
		let decompSample = raw.readInt16(0);
		let stepIndex = raw.readUint16(2) & 0x7F;

		let currentOffset = 4;
		buffer[destOff++] = decompSample / 32768;

		let compByte;
		while (currentOffset < raw.length) {
			compByte = raw.readUint8(currentOffset++);
			const result1 = this.processNibble(compByte & 0x0F, stepIndex, decompSample);
			decompSample = result1.decompSample;
			stepIndex = result1.stepIndex;
			buffer[destOff++] = decompSample / 32768;

			const result2 = this.processNibble((compByte & 0xF0) >> 4, stepIndex, decompSample);
			decompSample = result2.decompSample;
			stepIndex = result2.stepIndex;
			buffer[destOff++] = decompSample / 32768;
		}

		return buffer;
	}

	private static processNibble(nibble: number, stepIndex: number, decompSample: number) {
		function min(sample: number) {
			return (sample > 0x7FFF) ? 0x7FFF : sample;
		}

		function max(sample: number) {
			return (sample < -0x7FFF) ? -0x7FFF : sample;
		}

		function minmax(index: number, min: number, max: number) {
			return (index > max) ? max : ((index < min) ? min : index);
		}

		let diff = Math.floor(this.adpcmStepTable[stepIndex] / 8);
		if (nibble & 1) diff += Math.floor(this.adpcmStepTable[stepIndex] / 4);
		if (nibble & 2) diff += Math.floor(this.adpcmStepTable[stepIndex] / 2);
		if (nibble & 4) diff += Math.floor(this.adpcmStepTable[stepIndex]);

		if ((nibble & 8) == 0) {
			decompSample = max(decompSample + diff);
		}
		if ((nibble & 8) == 8) {
			decompSample = min(decompSample - diff);
		}

		stepIndex = minmax(stepIndex + this.adpcmIndexTable[nibble & 7], 0, 88);

		return { decompSample, stepIndex };
	}

	private static adpcmIndexTable = [
		-1, -1, -1, -1, 2, 4, 6, 8
	];

	private static adpcmStepTable = [
		7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 
		19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 
		50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 
		130, 143, 157, 173, 190, 209, 230, 253, 279, 307,
		337, 371, 408, 449, 494, 544, 598, 658, 724, 796,
		876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 
		2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358,
		5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899, 
		15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767 
	]
}