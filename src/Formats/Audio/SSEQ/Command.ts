import { CommandType } from "./CommandType";
import { Note as NoteE } from "./Note";

export enum ModType {
	Pitch = 0,
	Volume = 1,
	Pan = 2
}

export abstract class Command {
	abstract type: CommandType;
	abstract length: number;
}

export abstract class OffsetCommand extends Command {
	abstract offset: number;
}

export namespace Commands {
	// 0x00 - 0x7F (Note)
	export class Note extends Command {
		constructor(public length: number, public note: NoteE, public velocity: number, public duration: number) {
			super();
		}

		type = CommandType.Note;
	}

	// 0x80 (Wait)
	export class Wait extends Command {
		constructor(public length: number, public duration: number) {
			super();
		}

		type = CommandType.Wait;
	}

	// 0x81 (Program Change)
	export class ProgramChange extends Command {
		constructor(public length: number, public program: number) {
			super();
		}

		type = CommandType.ProgramChange;
	}

	// 0x93 (Open Track)
	export class OpenTrack extends OffsetCommand {
		constructor(public length: number, public track: number, public offset: number) {
			super();
		}

		type = CommandType.OpenTrack;
	}

	// 0x94 (Jump)
	export class Jump extends OffsetCommand {
		constructor(public offset: number) {
			super();
		}

		type = CommandType.Jump;
		length = 0x04;
	}

	// 0x95 (Call)
	export class Call extends OffsetCommand {
		constructor(public offset: number) {
			super();
		}

		type = CommandType.Call;
		length = 0x04;
	}

	// 0xA0 (Random)
	export class Random extends Command {
		constructor(public subCommand: number, public min: number, public max: number) {
			super();
		}

		type = CommandType.Random;
		length = 0x06;
	}

	// 0xA1 (Variable)
	export class Variable extends Command {
		constructor(public subCommand: number, public variable: number) {
			super();
		}

		type = CommandType.Variable;
		length = 0x03;
	}

	// 0xA2 (If)
	export class If extends Command {
		constructor(public subCommand: number) {
			super();
		}

		type = CommandType.If;
		length = 0x02;
	}

	// 0xB0 (SetVariable)
	export class SetVariable extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.SetVariable;
		length = 0x04;
	}

	// 0xB1 (AddVariable)
	export class AddVariable extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.AddVariable;
		length = 0x04;
	}

	// 0xB2 (SubtractVariable)
	export class SubtractVariable extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.SubtractVariable;
		length = 0x04;
	}

	// 0xB3 (MultiplyVariable)
	export class MultiplyVariable extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.MultiplyVariable;
		length = 0x04;
	}

	// 0xB4 (DivideVariable)
	export class DivideVariable extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.DivideVariable;
		length = 0x04;
	}

	// 0xB5 (ShiftVariable)
	export class ShiftVariable extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.ShiftVariable;
		length = 0x04;
	}

	// 0xB6 (RandomVariable)
	export class RandomVariable extends Command {
		constructor(public variable: number, public max: number) {
			super();
		}

		type = CommandType.RandomVariable;
		length = 0x04;
	}

	// 0xB8 (CompareEqual)
	export class CompareEqual extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.CompareEqual;
		length = 0x04;
	}

	// 0xB9 (CompareGreaterOrEqual)
	export class CompareGreaterOrEqual extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.CompareGreaterOrEqual;
		length = 0x04;
	}

	// 0xBA (CompareGreater)
	export class CompareGreater extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.CompareGreater;
		length = 0x04;
	}

	// 0xBB (CompareLessOrEqual)
	export class CompareLessOrEqual extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.CompareLessOrEqual;
		length = 0x04;
	}

	// 0xBC (CompareLess)
	export class CompareLess extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.CompareLess;
		length = 0x04;
	}

	// 0xBD (CompareNotEqual)
	export class CompareNotEqual extends Command {
		constructor(public variable: number, public value: number) {
			super();
		}

		type = CommandType.CompareNotEqual;
		length = 0x04;
	}

	// 0xC0 (Pan)
	export class Pan extends Command {
		constructor(public pan: number) {
			super();
		}

		type = CommandType.Pan;
		length = 0x02;
	}

	// 0xC1 (Volume)
	export class Volume extends Command {
		constructor(public volume: number) {
			super();
		}

		type = CommandType.Volume;
		length = 0x02;
	}

	// 0xC2 (Main Volume)
	export class MainVolume extends Command {
		constructor(public volume: number) {
			super();
		}

		type = CommandType.MainVolume;
		length = 0x02;
	}

	// 0xC3 (Transpose)
	export class Transpose extends Command {
		constructor(public transpose: number) {
			super();
		}

		type = CommandType.Transpose;
		length = 0x02;
	}

	// 0xC4 (Pitch Bend)
	export class PitchBend extends Command {
		constructor(public bend: number) {
			super();
		}

		type = CommandType.PitchBend;
		length = 0x02;
	}

	// 0xC5 (Pitch Bend Range)
	export class PitchBendRange extends Command {
		constructor(public range: number) {
			super();
		}

		type = CommandType.PitchBendRange;
		length = 0x02;
	}

	// 0xC6 (Priority)
	export class Priority extends Command {
		constructor(public priority: number) {
			super();
		}

		type = CommandType.Priority;
		length = 0x02;
	}

	// 0xC7 (Note Wait Mode)
	export class NoteWaitMode extends Command {
		constructor(public enabled: boolean) {
			super();
		}

		type = CommandType.NoteWaitMode;
		length = 0x02;
	}

	// 0xC8 (Tie)
	export class Tie extends Command {
		constructor(public enabled: boolean) {
			super();
		}

		type = CommandType.Tie;
		length = 0x02;
	}

	// 0xC9 (Portamento)
	export class Portamento extends Command {
		constructor(public key: number) {
			super();
		}

		type = CommandType.Portamento;
		length = 0x02;
	}

	// 0xCA (Modulation Depth)
	export class ModulationDepth extends Command {
		constructor(public depth: number) {
			super();
		}

		type = CommandType.ModulationDepth;
		length = 0x02;
	}

	// 0xCB (Modulation Speed)
	export class ModulationSpeed extends Command {
		constructor(public speed: number) {
			super();
		}

		type = CommandType.ModulationSpeed;
		length = 0x02;
	}

	// 0xCC (Modulation Type)
	export class ModulationType extends Command {
		constructor(public modType: ModType) {
			super();
		}

		type = CommandType.ModulationType;
		length = 0x02;
	}

	// 0xCD (Modulation Range)
	export class ModulationRange extends Command {
		constructor(public range: number) {
			super();
		}

		type = CommandType.ModulationRange;
		length = 0x02;
	}

	// 0xCE (Portamento Switch)
	export class PortamentoSwitch extends Command {
		constructor(public enabled: boolean) {
			super();
		}

		type = CommandType.PortamentoSwitch;
		length = 0x02;
	}

	// 0xCF (Portamento Time)
	export class PortamentoTime extends Command {
		constructor(public time: number) {
			super();
		}

		type = CommandType.PortamentoTime;
		length = 0x02;
	}

	// 0xD0 (Attack)
	export class Attack extends Command {
		constructor(public attack: number) {
			super();
		}

		type = CommandType.Attack;
		length = 0x02;
	}

	// 0xD1 (Decay)
	export class Decay extends Command {
		constructor(public decay: number) {
			super();
		}

		type = CommandType.Decay;
		length = 0x02;
	}

	// 0xD2 (Sustain)
	export class Sustain extends Command {
		constructor(public sustain: number) {
			super();
		}

		type = CommandType.Sustain;
		length = 0x02;
	}

	// 0xD3 (Release)
	export class Release extends Command {
		constructor(public release: number) {
			super();
		}

		type = CommandType.Release;
		length = 0x02;
	}

	// 0xD4 (Loop Start)
	export class LoopStart extends Command {
		constructor(public count: number) {
			super();
		}

		type = CommandType.LoopStart;
		length = 0x02;
	}

	// 0xD5 (Volume 2)
	export class Volume2 extends Command {
		constructor(public volume: number) {
			super();
		}

		type = CommandType.Volume2;
		length = 0x02;
	}

	// 0xD6 (PrintVariable)
	export class PrintVariable extends Command {
		constructor(public variable: number) {
			super();
		}

		type = CommandType.PrintVariable;
		length = 0x02;
	}

	// 0xE0 (Modulation Delay)
	export class ModulationDelay extends Command {
		constructor(public delay: number) {
			super();
		}

		type = CommandType.ModulationDelay;
		length = 0x03;
	}

	// 0xE1 (Tempo)
	export class Tempo extends Command {
		constructor(public tempo: number) {
			super();
		}

		type = CommandType.Tempo;
		length = 0x03;
	}

	// 0xE2 (Sweep Pitch)
	export class SweepPitch extends Command {
		constructor(public pitch: number) {
			super();
		}

		type = CommandType.SweepPitch;
		length = 0x03;
	}

	// 0xED (Return)
	export class Return extends Command {
		constructor() {
			super();
		}

		length = 0x01;
		type = CommandType.Return;
	}

	// 0xFC (Loop End)
	export class LoopEnd extends Command {
		constructor() {
			super();
		}

		length = 0x01;
		type = CommandType.LoopEnd;
	}

	// 0xFE (Allocate Tracks)
	export class AllocateTracks extends Command {
		constructor(public tracks: number) {
			super();
		}

		length = 0x03;
		type = CommandType.AllocateTracks;

		isAllocated(track: number) {
			return (this.tracks & (1 << track)) != 0;
		}
	}

	// 0xFF (Fin)
	export class Fin extends Command {
		constructor() {
			super();
		}

		length = 0x01;
		type = CommandType.Fin;
	}
}