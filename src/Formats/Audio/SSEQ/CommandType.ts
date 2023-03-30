// https://gota7.github.io/NitroStudio2/specs/sequence.html#sequence-commands
// http://www.feshrine.net/hacking/doc/nds-sdat.php#sseq

export enum CommandType {
	Note,					// 0x00 - 0x7F
	Wait =					0x80,
	ProgramChange =			0x81,
	OpenTrack =				0x93,
	Jump =					0x94,
	Call =					0x95,
	Random =				0xA0,
	Variable =				0xA1,
	If =					0xA2,
	SetVariable =			0xB0,
	AddVariable =			0xB1,
	SubtractVariable =		0xB2,
	MultiplyVariable =		0xB3,
	DivideVariable =		0xB4,
	ShiftVariable =			0xB5,
	RandomVariable =		0xB6,
	CompareEqual =			0xB8,
	CompareGreaterOrEqual =	0xB9,
	CompareGreater =		0xBA,
	CompareLessOrEqual =	0xBB,
	CompareLess =			0xBC,
	CompareNotEqual =		0xBD,
	Pan =					0xC0,
	Volume =				0xC1,
	MainVolume =			0xC2,
	Transpose =				0xC3,
	PitchBend =				0xC4,
	PitchBendRange =		0xC5,
	Priority =				0xC6,
	NoteWaitMode =			0xC7,
	Tie =					0xC8,
	Portamento =			0xC9,
	ModulationDepth =		0xCA,
	ModulationSpeed =		0xCB,
	ModulationType =		0xCC,
	ModulationRange =		0xCD,
	PortamentoSwitch =		0xCE,
	PortamentoTime =		0xCF,
	Attack =				0xD0,
	Decay =					0xD1,
	Sustain =				0xD2,
	Release =				0xD3,
	LoopStart =				0xD4,
	Volume2 =				0xD5,
	PrintVariable =			0xD6,
	ModulationDelay =		0xE0,
	Tempo =					0xE1,
	SweepPitch =			0xE3,
	LoopEnd =				0xFC,
	Return =				0xFD,
	AllocateTracks =		0xFE,
	Fin =					0xFF
}

// Thanks, Copilot
export function commandTypeToString(type: CommandType) {
	switch (type) {
		case CommandType.Note: return "Note";
		case CommandType.Wait: return "Wait";
		case CommandType.ProgramChange: return "ProgramChange";
		case CommandType.OpenTrack: return "OpenTrack";
		case CommandType.Jump: return "Jump";
		case CommandType.Call: return "Call";
		case CommandType.Random: return "Random";
		case CommandType.Variable: return "Variable";
		case CommandType.If: return "If";
		case CommandType.SetVariable: return "SetVariable";
		case CommandType.AddVariable: return "AddVariable";
		case CommandType.SubtractVariable: return "SubtractVariable";
		case CommandType.MultiplyVariable: return "MultiplyVariable";
		case CommandType.DivideVariable: return "DivideVariable";
		case CommandType.ShiftVariable: return "ShiftVariable";
		case CommandType.RandomVariable: return "RandomVariable";
		case CommandType.CompareEqual: return "CompareEqual";
		case CommandType.CompareGreaterOrEqual: return "CompareGreaterOrEqual";
		case CommandType.CompareGreater: return "CompareGreater";
		case CommandType.CompareLessOrEqual: return "CompareLessOrEqual";
		case CommandType.CompareLess: return "CompareLess";
		case CommandType.CompareNotEqual: return "CompareNotEqual";
		case CommandType.Pan: return "Pan";
		case CommandType.Volume: return "Volume";
		case CommandType.MainVolume: return "MainVolume";
		case CommandType.Transpose: return "Transpose";
		case CommandType.PitchBend: return "PitchBend";
		case CommandType.PitchBendRange: return "PitchBendRange";
		case CommandType.Priority: return "Priority";
		case CommandType.NoteWaitMode: return "NoteWaitMode";
		case CommandType.Tie: return "Tie";
		case CommandType.Portamento: return "PortamentoControl";
		case CommandType.ModulationDepth: return "ModulationDepth";
		case CommandType.ModulationSpeed: return "ModulationSpeed";
		case CommandType.ModulationType: return "ModulationType";
		case CommandType.ModulationRange: return "ModulationRange";
		case CommandType.PortamentoSwitch: return "PortamentoSwitch";
		case CommandType.PortamentoTime: return "PortamentoTime";
		case CommandType.Attack: return "Attack";
		case CommandType.Decay: return "Decay";
		case CommandType.Sustain: return "Sustain";
		case CommandType.Release: return "Release";
		case CommandType.LoopStart: return "LoopStart";
		case CommandType.Volume2: return "Volume2";
		case CommandType.PrintVariable: return "PrintVariable";
		case CommandType.ModulationDelay: return "ModulationDelay";
		case CommandType.Tempo: return "Tempo";
		case CommandType.SweepPitch: return "SweepPitch";
		case CommandType.LoopEnd: return "LoopEnd";
		case CommandType.Return: return "Return";
		case CommandType.AllocateTracks: return "AllocateTracks";
		case CommandType.Fin: return "Fin";

		default: return "Unknown";
	}
}