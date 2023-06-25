export class BufferReader {
	constructor(buffer: ArrayBuffer, start: number, length: number, littleEndian: boolean = true) {
		this.buffer = buffer;
		this.start = start;
		this.bufferLength = length;
		this.view = new DataView(buffer, start, length);
		this.littleEndian = littleEndian;
	}

	private buffer: ArrayBuffer;
	private start: number;
	private bufferLength: number;
	private view: DataView;

	public littleEndian: boolean;

	/**
	 * Creates a new BufferReader instance from the specified ArrayBuffer.
	 * @param buffer - The ArrayBuffer to read from.
	 * @param littleEndian - Whether the buffer is little endian.
	 * @returns The BufferReader instance.
	 */
	static new(buffer: ArrayBuffer, littleEndian: boolean = true) {
		return new BufferReader(buffer, 0, buffer.byteLength, littleEndian);
	}

	/**
	 * Slices the buffer and returns a new BufferReader instance, without copying the underlying buffer.
	 * @param start - The start offset.
	 * @param end - The end offset.
	 * @returns The new BufferReader instance.
	 */
	slice(start: number, end?: number) {
		if (end === undefined || end > this.bufferLength) {
			end = this.bufferLength;
		}

		return new BufferReader(this.buffer, this.start + start, end - start);		
	}

	readUint8(offset: number) {
		return this.view.getUint8(offset);
	}

	readUint16(offset: number) {
		return this.view.getUint16(offset, this.littleEndian);
	}

	readUint24(offset: number) {
		return this.view.getUint8(offset) | (this.view.getUint8(offset + 1) << 8) | (this.view.getUint8(offset + 2) << 16);
	}

	readUint32(offset: number) {
		return this.view.getUint32(offset, this.littleEndian);
	}

	readInt8(offset: number) {
		return this.view.getInt8(offset);
	}

	readInt16(offset: number) {
		return this.view.getInt16(offset, this.littleEndian);
	}

	readInt24(offset: number) {
		return this.view.getInt8(offset) | (this.view.getInt8(offset + 1) << 8) | (this.view.getInt8(offset + 2) << 16);
	}

	readInt32(offset: number) {
		return this.view.getInt32(offset, this.littleEndian);
	}

	readFloat32(offset: number) {
		return this.view.getFloat32(offset, this.littleEndian);
	}

	readFloat64(offset: number) {
		return this.view.getFloat64(offset, this.littleEndian);
	}

	/**
	 * Reads a string of the specified length from the buffer.
	 * @param offset - The offset to start reading from.
	 * @param length - The length of the string to read.
	 */
	readChars(offset: number, length: number) {
		let result = "";
		for (let i = 0; i < length; i++) {
			result += String.fromCharCode(this.view.getUint8(offset + i));
		}
		return result;
	}

	/**
	 * Reads a null-terminated string from the buffer.
	 * @param offset - The offset to start reading from.
	 */
	readString(offset: number) {
		let result = "";
		let i = 0;

		while (true) {
			let c = this.view.getUint8(offset + i);
			if (c === 0) {
				break;
			}
			result += String.fromCharCode(c);
			i++;
		}

		return result;
	}

	/**
	 * Reads a variable-length integer from the buffer. Variable-length integers are encoded in groups of 7 bits,
	 * with the 8th bit indicating whether another group of 7 bits follows.
	 * @param offset - The offset to start reading from.
	 * @returns An object containing the value and the length of the integer.
	 */
	readVL(offset: number) {
		let result = 0;
		let i = 0;

		while (true) {
			const c = this.view.getUint8(offset + i);
			result <<= 7;
			result |= (c & 0x7F);

			if ((c & 0x80) === 0) {
				break;
			}

			i++;
		}

		return { value: result, length: i + 1 };
	}

	get length() {
		return this.bufferLength;
	}

	/**
	 * Returns a copy of the underlying buffer.
	 * @returns - A copy of the underlying buffer.
	 */
	getBuffer() {
		return this.buffer.slice(this.start, this.start + this.bufferLength);
	}
}