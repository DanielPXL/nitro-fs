export class SequenceVariables {
	constructor(override?: number[]) {
		if (override) {
			if (override.length !== 32) {
				throw new Error("Sequence variables must have 32 entries.");
			}

			this.variables = override;
		} else {
			this.variables = new Array(32).fill(-1);
		}
	}

	variables: number[];

	resetLocal() {
		for (let i = 0; i < 16; i++) {
			this.variables[i] = -1;
		}
	}

	resetGlobal() {
		for (let i = 16; i < 32; i++) {
			this.variables[i] = -1;
		}
	}

	set(index: number, value: number) {
		this.variables[index] = value;
	}

	get(index: number) {
		return this.variables[index];
	}
}