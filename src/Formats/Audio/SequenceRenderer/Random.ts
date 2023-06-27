export class Random {
	constructor(seed: number = Date.now()) {
		this.seed = seed;
	}

	seed: number;

	next() {
		// Xorshift32
		let x = this.seed;
		x ^= x << 13;
		x ^= x >> 17;
		x ^= x << 5;
		this.seed = x;
		return x;
	}
}