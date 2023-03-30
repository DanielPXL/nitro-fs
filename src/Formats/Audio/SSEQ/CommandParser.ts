import { BufferReader } from "../../../BufferReader";
import { Command, OffsetCommand, Commands } from "./Command";
import { CommandType, commandTypeToString } from "./CommandType";

export class CommandParser {
	static parseCommands(raw: BufferReader, length: number) {
		// Trim the end to remove any padding
		// Find last Fin command
		let lastFin = -1;
		for (let i = 0; i < length; i++) {
			if (raw.readUint8(i) === CommandType.Fin) {
				lastFin = i;
			}
		}

		if (lastFin !== -1) {
			length = lastFin + 1;
		}
		
		const commands = [];
		const offsetToIndexTable = [];
		let pos = 0;
		
		while (pos < length) {
			offsetToIndexTable[pos] = commands.length;

			const command = this.parseCommand(raw, pos);
			// console.log(`${pos} : ${commandTypeToString(command.type)} (${command.length})`);
			commands.push(command);
			pos += command.length;
		}

		// Resolve offsets
		for (let i = 0; i < commands.length; i++) {
			if (commands[i] instanceof OffsetCommand) {
				const offsetCommand = commands[i] as OffsetCommand;
				offsetCommand.offset = offsetToIndexTable[offsetCommand.offset];
			}
		}

		return commands;
	}

	static parseCommand(raw: BufferReader, pos: number): Command {
		const commandType = raw.readUint8(pos);

		// Special case for 0x00 - 0x7F (Note)
		if (commandType < 0x80) {
			const velocity = raw.readUint8(pos + 1);
			const duration = raw.readVL(pos + 2);
			return new Commands.Note(0x01 + 0x01 + duration.length, commandType, velocity, duration.value);
		}

		switch (commandType) {
			case CommandType.Wait: { // 0x80
				const wait = raw.readVL(pos + 1);
				return new Commands.Wait(0x01 + wait.length, wait.value);
			}

			case CommandType.ProgramChange: { // 0x81
				// TODO: Add bank change
				const program = raw.readVL(pos + 1);
				return new Commands.ProgramChange(0x01 + program.length, program.value);
			}

			case CommandType.OpenTrack: { // 0x93
				const track = raw.readUint8(pos + 1);
				const offset = raw.readUint24(pos + 2);
				return new Commands.OpenTrack(0x01 + 0x01 + 0x03, track, offset);
			}

			case CommandType.Jump: { // 0x94
				const offset = raw.readUint24(pos + 1);
				return new Commands.Jump(offset);
			}

			case CommandType.Call: { // 0x95
				const offset = raw.readUint24(pos + 1);
				return new Commands.Call(offset);
			}

			case CommandType.Random: { // 0xA0
				const subCommand = raw.readUint8(pos + 1);
				const min = raw.readInt16(pos + 2);
				const max = raw.readInt16(pos + 2);
				return new Commands.Random(subCommand, min, max);
			}

			case CommandType.Pan: { // 0xC0
				const pan = raw.readUint8(pos + 1);
				return new Commands.Pan(pan);
			}

			case CommandType.Volume: { // 0xC1
				const volume = raw.readUint8(pos + 1);
				return new Commands.Volume(volume);
			}

			case CommandType.PitchBend: { // 0xC4
				const bend = raw.readInt8(pos + 1);
				return new Commands.PitchBend(bend);
			}

			case CommandType.PitchBendRange: { // 0xC5
				const range = raw.readUint8(pos + 1);
				return new Commands.PitchBendRange(range);
			}

			case CommandType.NoteWaitMode: { // 0xC7
				const enabled = raw.readUint8(pos + 1) !== 0;
				return new Commands.NoteWaitMode(enabled);
			}

			case CommandType.ModulationDepth: { // 0xCA
				const depth = raw.readUint8(pos + 1);
				return new Commands.ModulationDepth(depth);
			}

			case CommandType.ModulationSpeed: { // 0xCB
				const speed = raw.readUint8(pos + 1);
				return new Commands.ModulationSpeed(speed);
			}

			case CommandType.ModulationRange: { // 0xCD
				const range = raw.readUint8(pos + 1);
				return new Commands.ModulationRange(range);
			}

			case CommandType.Tempo: { // 0xE1
				const tempo = raw.readInt16(pos + 1);
				return new Commands.Tempo(tempo);
			}

			case CommandType.Return: { // 0xED
				return new Commands.Return();
			}

			case CommandType.AllocateTracks: { // 0xFE
				const tracks = raw.readUint16(pos + 1);
				return new Commands.AllocateTracks(tracks);
			}

			case CommandType.Fin: { // 0xFF
				return new Commands.Fin();
			}

			default: {
				throw new Error(`Unknown command type: ${commandType.toString(16)}`);
			}
		}
	}
}