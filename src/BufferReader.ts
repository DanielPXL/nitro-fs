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

	static new(buffer: ArrayBuffer, littleEndian: boolean = true) {
		return new BufferReader(buffer, 0, buffer.byteLength, littleEndian);
	}

	slice(start: number, end?: number) {
		if (end === undefined) {
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

	readUint32(offset: number) {
		return this.view.getUint32(offset, this.littleEndian);
	}

	readInt8(offset: number) {
		return this.view.getInt8(offset);
	}

	readInt16(offset: number) {
		return this.view.getInt16(offset, this.littleEndian);
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

	get length() {
		return this.bufferLength;
	}

	getBuffer() {
		return this.buffer.slice(this.start, this.start + this.bufferLength);
	}
}