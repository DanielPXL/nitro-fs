export class NitroFAT {
	constructor(raw: Uint8Array) {
		this.entries = [];

		for (let i = 0; i < raw.length; i += 8) {
			const startAddress = raw[i] | (raw[i + 1] << 8) | (raw[i + 2] << 16) | (raw[i + 3] << 24);
			const endAddress = raw[i + 4] | (raw[i + 5] << 8) | (raw[i + 6] << 16) | (raw[i + 7] << 24);

			this.entries.push({
				startAddress,
				endAddress
			});
		}
	}

	entries: NitroFATEntry[];
}

export type NitroFATEntry = {
	startAddress: number;
	endAddress: number;
}