// https://github.com/magical/nlzss/blob/master/lzss3.py

export class LZ10 {
	static decompress(indata: Uint8Array, decompressedSize: number) {
		let data = new Uint8Array(decompressedSize);
		let dataIndex = 0;

		let rawIndex = 0;

		const dispExtra = 1;

		function bits(byte: number) {
			return [
				(byte >> 7) & 1,
				(byte >> 6) & 1,
				(byte >> 5) & 1,
				(byte >> 4) & 1,
				(byte >> 3) & 1,
				(byte >> 2) & 1,
				(byte >> 1) & 1,
				(byte >> 0) & 1
			]
		}

		function writeByte(byte: number) {
			data[dataIndex++] = byte;
		}

		function readByte() {
			return indata[rawIndex++];
		}

		function readShort() {
			// big-endian
			const a = indata[rawIndex++];
			const b = indata[rawIndex++];
			return (a << 8) | b;
		}

		function copyByte() {
			writeByte(readByte());
		}

		while (dataIndex < decompressedSize) {
			const b = readByte();
			const flags = bits(b);
			for (let i = 0; i < 8; i++) {
				if (flags[i] === 0) {
					copyByte();
				} else if (flags[i] === 1) {
					const sh = readShort();
					const count = (sh >> 0xC) + 3;
					const disp = (sh & 0xFFF) + dispExtra;

					for (let j = 0; j < count; j++) {
						const byte = data[dataIndex - disp];
						writeByte(byte);
					}
				} else {
					throw new Error(`Invalid flag: ${flags[i]}`);
				}

				if (decompressedSize <= dataIndex) {
					break;
				}
			}
		}

		return data;
	}
}