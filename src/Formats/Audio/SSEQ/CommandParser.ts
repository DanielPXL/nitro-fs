import { BufferReader } from "../../../BufferReader";
import { Command, OffsetCommand, Commands, NestedCommand } from "./Command";
import { CommandType } from "./CommandType";

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
		const offsetToIndexTable: number[] = [];
		let pos = 0;
		
		while (pos < length) {
			offsetToIndexTable[pos] = commands.length;

			const command = this.parseCommand(raw, pos);
			// console.log(`${pos} : ${commandTypeToString(command.type)} (${command.length})`);
			commands.push(command);
			pos += command.length;

			// Special case for Newer Super Mario Bros. DS
			// They have some data (appears to be junk data?) in between Jump and Fin commands
			// The junk data always starts with Jump, followed by 0x00
			// This needs to be skipped in order to parse the commands correctly
			if (command.type === CommandType.Jump && raw.readUint8(pos) === 0x00) {
				// Find next Fin command
				let nextFin = -1;
				for (let i = pos; i < length; i++) {
					const commandType = raw.readUint8(i);
					if (commandType === CommandType.Fin) {
						nextFin = i;
						break;
					}
				}

				if (nextFin !== -1) {
					// Skip the data
					pos = nextFin;
				}
			}
		}

		// Resolve offsets
		function resolveOffset(command: Command) {
			if (command instanceof OffsetCommand) {
				const offsetCommand = command as OffsetCommand;
				const o = offsetToIndexTable[offsetCommand.offset];
				if (o === undefined) {
					throw new Error(`Failed to resolve offset ${offsetCommand.offset}`);
				}

				offsetCommand.offset = o;
			}

			if (command instanceof NestedCommand) {
				const nestedCommand = command as NestedCommand;
				resolveOffset(nestedCommand.subCommand);
			}
		}

		for (let i = 0; i < commands.length; i++) {
			resolveOffset(commands[i]);
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
				// TODO: Add bank change (is that even a thing?)
				const programAndBank = raw.readVL(pos + 1);
				// Apparently, only bits[0..7] are used for the program number
				const program = programAndBank.value & 0xFF;
				return new Commands.ProgramChange(0x01 + programAndBank.length, program);
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

			// TODO: Do some more testing on Random and Variable commands since I have not found them in the wild yet
			case CommandType.Random: { // 0xA0
				const subCommand = this.parseCommand(raw, pos + 1);
				const min = raw.readInt16(pos + subCommand.length + 1);
				const max = raw.readInt16(pos + subCommand.length + 3);
				return new Commands.Random(subCommand, min, max, subCommand.length + 0x04);
			}

			case CommandType.Variable: { // 0xA1
				const subCommand = this.parseCommand(raw, pos + 1);
				const variable = raw.readUint8(pos + 2);
				return new Commands.Variable(subCommand, variable, subCommand.length + 0x01);
			}

			case CommandType.If: { // 0xA2
				const subCommand = this.parseCommand(raw, pos + 1);
				return new Commands.If(subCommand, subCommand.length + 0x01);
			}

			case CommandType.SetVariable: { // 0xB0
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.SetVariable(variable, value);
			}

			case CommandType.AddVariable: { // 0xB1
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.AddVariable(variable, value);
			}

			case CommandType.SubtractVariable: { // 0xB2
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.SubtractVariable(variable, value);
			}

			case CommandType.MultiplyVariable: { // 0xB3
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.MultiplyVariable(variable, value);
			}

			case CommandType.DivideVariable: { // 0xB4
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.DivideVariable(variable, value);
			}

			case CommandType.ShiftVariable: { // 0xB5
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.ShiftVariable(variable, value);
			}

			case CommandType.RandomVariable: { // 0xB6
				const variable = raw.readUint8(pos + 1);
				const max = raw.readInt16(pos + 2);
				return new Commands.RandomVariable(variable, max);
			}

			case CommandType.CompareEqual: { // 0xB8
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.CompareEqual(variable, value);
			}

			case CommandType.CompareGreaterOrEqual: { // 0xB9
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.CompareGreaterOrEqual(variable, value);
			}

			case CommandType.CompareGreater: { // 0xBA
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.CompareGreater(variable, value);
			}

			case CommandType.CompareLessOrEqual: { // 0xBB
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.CompareLessOrEqual(variable, value);
			}

			case CommandType.CompareLess: { // 0xBC
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.CompareLess(variable, value);
			}

			case CommandType.CompareNotEqual: { // 0xBD
				const variable = raw.readUint8(pos + 1);
				const value = raw.readInt16(pos + 2);
				return new Commands.CompareNotEqual(variable, value);
			}

			case CommandType.Pan: { // 0xC0
				const pan = raw.readUint8(pos + 1);
				return new Commands.Pan(pan);
			}

			case CommandType.Volume: { // 0xC1
				const volume = raw.readUint8(pos + 1);
				return new Commands.Volume(volume);
			}

			case CommandType.MainVolume: { // 0xC2
				const volume = raw.readUint8(pos + 1);
				return new Commands.MainVolume(volume);
			}

			case CommandType.Transpose: { // 0xC3
				const transpose = raw.readInt8(pos + 1);
				return new Commands.Transpose(transpose);
			}

			case CommandType.PitchBend: { // 0xC4
				const bend = raw.readInt8(pos + 1);
				return new Commands.PitchBend(bend);
			}

			case CommandType.PitchBendRange: { // 0xC5
				const range = raw.readUint8(pos + 1);
				return new Commands.PitchBendRange(range);
			}

			case CommandType.Priority: { // 0xC6
				const priority = raw.readUint8(pos + 1);
				return new Commands.Priority(priority);
			}

			case CommandType.NoteWaitMode: { // 0xC7
				const enabled = raw.readUint8(pos + 1) !== 0;
				return new Commands.NoteWaitMode(enabled);
			}

			case CommandType.Tie: { // 0xC8
				const enabled = raw.readUint8(pos + 1) !== 0;
				return new Commands.Tie(enabled);
			}

			case CommandType.Portamento: { // 0xC9
				const key = raw.readUint8(pos + 1);
				return new Commands.Portamento(key);
			}

			case CommandType.ModulationDepth: { // 0xCA
				const depth = raw.readUint8(pos + 1);
				return new Commands.ModulationDepth(depth);
			}

			case CommandType.ModulationSpeed: { // 0xCB
				const speed = raw.readUint8(pos + 1);
				return new Commands.ModulationSpeed(speed);
			}

			case CommandType.ModulationType: { // 0xCC
				const type = raw.readUint8(pos + 1);
				return new Commands.ModulationType(type);
			}

			case CommandType.ModulationRange: { // 0xCD
				const range = raw.readUint8(pos + 1);
				return new Commands.ModulationRange(range);
			}

			case CommandType.PortamentoSwitch: { // 0xCE
				const enabled = raw.readUint8(pos + 1) !== 0;
				return new Commands.PortamentoSwitch(enabled);
			}

			case CommandType.PortamentoTime: { // 0xCF
				const time = raw.readUint8(pos + 1);
				return new Commands.PortamentoTime(time);
			}

			case CommandType.Attack: { // 0xD0
				const attack = raw.readUint8(pos + 1);
				return new Commands.Attack(attack);
			}

			case CommandType.Decay: { // 0xD1
				const decay = raw.readUint8(pos + 1);
				return new Commands.Decay(decay);
			}

			case CommandType.Sustain: { // 0xD2
				const sustain = raw.readUint8(pos + 1);
				return new Commands.Sustain(sustain);
			}

			case CommandType.Release: { // 0xD3
				const release = raw.readUint8(pos + 1);
				return new Commands.Release(release);
			}

			case CommandType.LoopStart: { // 0xD4
				const count = raw.readUint8(pos + 1);
				return new Commands.LoopStart(count);
			}

			case CommandType.Volume2: { // 0xD5
				const volume = raw.readUint8(pos + 1);
				return new Commands.Volume2(volume);
			}

			case CommandType.PrintVariable: { // 0xD6
				const variable = raw.readUint8(pos + 1);
				return new Commands.PrintVariable(variable);
			}

			case CommandType.ModulationDelay: { // 0xE0
				const delay = raw.readInt16(pos + 1);
				return new Commands.ModulationDelay(delay);
			}

			case CommandType.Tempo: { // 0xE1
				const tempo = raw.readInt16(pos + 1);
				return new Commands.Tempo(tempo);
			}

			case CommandType.SweepPitch: { // 0xE2
				const pitch = raw.readInt16(pos + 1);
				return new Commands.SweepPitch(pitch);
			}

			case CommandType.Return: { // 0xED
				return new Commands.Return();
			}

			case CommandType.LoopEnd: { // 0xFC
				return new Commands.LoopEnd();
			}

			case CommandType.AllocateTracks: { // 0xFE
				const tracks = raw.readUint16(pos + 1);
				return new Commands.AllocateTracks(tracks);
			}

			case CommandType.Fin: { // 0xFF
				return new Commands.Fin();
			}

			default: {
				throw new Error(`Unknown command type: ${commandType.toString(16)} at ${pos.toString(16)}`);
			}
		}
	}
}