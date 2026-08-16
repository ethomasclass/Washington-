/**
 * Content types.
 *
 * In the real build the scenes are JSON on disk, validated by the build-time
 * linter (06-technical-architecture.md §6). They are typed TypeScript here only
 * so the prototype compiles without a loader; these interfaces are the schema.
 */

import type { StatId } from './state';
import type { VoiceId } from './palette';

/**
 * A document that contradicts something a person said.
 *
 * The binding rule from reference-game-analysis.md: every scene must contain at
 * least one object whose examine text contradicts an NPC. It is the mechanic
 * that teaches source-checking without ever naming it — but it only lands if
 * the claim was heard first, so the extra line is gated on having spoken to
 * them.
 */
export interface Contradiction {
  /** Flag set when the person makes the claim. */
  heard: string;
  /** Appended to the examine text once the claim has been heard. */
  line: string;
  /** Set once the player has both heard the claim and seen the document. */
  grants: string;
  /** How the journal records it. */
  note: string;
}

import type { PropKind } from './art';

export interface Interactable {
  id: string;
  label: string;
  /** Across the frame, 0..1. */
  x: number;
  /** Into the frame: 0 at the near edge, 1 at the horizon. */
  z: number;
  examine: string;
  /** Reading this sets a knowledge flag. Documents never move stats. */
  grants?: string;
  contradicts?: Contradiction;
  /**
   * What is drawn on the ground here.
   *
   * Omit for things that are a view rather than an object — the river, the road
   * up the hill, a building already painted into the plate. Everything the
   * player is told is a thing should have a thing.
   */
  prop?: PropKind;
  /**
   * A look-and-name instrument: a spyglass, and later a map table.
   *
   * Not a puzzle. The player points it at each position in turn and each one
   * names itself and writes an entry. It is the one interaction in the game
   * where knowledge is gathered by looking rather than by reading or being
   * told, which is what scouting actually is — and because each target is its
   * own flag, a player who names five of seven keeps those five.
   */
  survey?: SurveyTarget[];
}

export interface SurveyTarget {
  id: string;
  /**
   * Where the position lies in the view, as fractions of the frame, 0..1.
   *
   * `at` is the horizontal, `y` the vertical. The player aims the glass across
   * the darkened panorama and holds it here to make the position out; a hidden
   * ring sits at (`at`, `y`) and blooms when the glass centres on it. `y` is
   * optional and defaults to the horizon band — the only place the old
   * single-axis targets ever sat — so a target authored before the glass could
   * be aimed keeps working, it simply lives on the skyline.
   */
  at: number;
  y?: number;
  /** What the player sees named on the bearing list once it has been made out. */
  bearing: string;
  /** What it turns out to be. */
  name: string;
  text: string;
  grants: string;
}

/**
 * An interior voice, spoken unprompted as Washington passes something.
 *
 * Gated on the voice being loud enough to speak, so which thoughts a player
 * hears at all depends on the man they are building. A quiet Temper simply
 * never says the bitter thing about the royal commission.
 */
export interface Ambient {
  id: string;
  /**
   * The voices with something to say about this place, and what each says.
   *
   * A slot is an OPPORTUNITY, not a line (07 §3.5.2). Two or three voices are
   * authored per slot and the engine speaks the loudest one that clears the
   * threshold — so the same shelter, the same graves, the same spyglass draw a
   * different thought out of a different Washington, and two students walking
   * the same ground hear a different man thinking.
   *
   * This carried a single hardcoded voice until it was changed, which meant the
   * brush shelters were *always* Restraint's thought for every player in every
   * classroom, and the interior said nothing about who anyone had become.
   */
  variants: Partial<Record<VoiceId, string>>;
  x: number;
  z: number;
  /** Ground radius that triggers it. */
  r: number;
  /** How loud a voice must be to take this slot. */
  minLoudness: number;
}

/**
 * Something he does, rather than something he looks at.
 *
 * Historically constrained: Washington was a planter, and the daily work of
 * Mount Vernon was done by enslaved people and hired hands. He rode the farms,
 * kept the weather diary, wrote letters, inspected, and gave instructions. He
 * did not muck stalls or feed livestock, and a game that has him do so is
 * lying about how the place ran.
 *
 * So where a task involves physical work, the result names who actually did it.
 * That is the whole point of including tasks at all: the ordinary business of
 * the morning is where the arrangement of the place shows itself.
 */
export interface Task {
  id: string;
  /** Phrased as an action — this is a thing done, not a thing read. */
  label: string;
  x: number;
  z: number;
  /** What happens when he does it. */
  done: string;
  grants: string;
  /** How the journal records it. */
  note: string;
  /** Gate, if it needs something known or someone spoken to first. */
  requires?: string;
  requiresNote?: string;
  /** What is drawn on the ground here. */
  prop?: PropKind;
}

export interface DialogueLine {
  speaker: string;
  portraitSeed: number;
  coat: string;
  text: string;
}

export interface Option {
  id: string;
  /** Short label — what the player scans. Two to five words. */
  label: string;
  /** The full sentence. Shown only for the focused option. */
  full: string;
  /** Which council voices would have it so. Rendered as emblems. */
  favoured: VoiceId[];
  /** Knowledge flag required. Without it the option is struck, not hidden. */
  requires?: string;
  lockNote?: string;
  /**
   * A voice lock (R1). The other kind of lock, and the harsher one.
   *
   * A knowledge lock says *go and find the thing*, and can always be opened by
   * going and finding it. A voice lock says *this part of you is not loud
   * enough to say this*, and cannot be opened in this act at all — the player
   * can see precisely which part of himself is insufficient and can do nothing
   * about it today. That is the entire payload of a Disco Elysium red check
   * delivered with no dice and no number.
   *
   * Read from LIVE stats, never the snapshot: a decision made in scene 2 must
   * be able to open or close a sentence in scene 4, or the act is a sealed box.
   */
  voiceLock?: { voice: VoiceId; min: number };
  effects: Partial<Record<StatId, number>>;
  /**
   * What this choice cost or bought, in men, for the act's reckoning.
   *
   * The only channel in the game where a number the player can SEE moves
   * because of something they did. Authored per option and named in plain
   * English — never derived from the hidden stats (08 §2.2, RT-2), because a
   * ledger computed from stats is a scoreboard with extra steps.
   */
  ledger?: { n: number; cause: string }[];
  result: string;
}

export interface Decision {
  id: string;
  prompt: string;
  speaker: string;
  portraitSeed: number;
  coat: string;
  /**
   * Which painted portrait belongs to this speaker, keyed to src/portraits.ts.
   * Absent until that face has a generated sheet; the procedural stand-in fills
   * the well meanwhile, and no scene is ever blocked on art.
   */
  portrait?: string;
  voices: VoiceId[];
  interjections: Partial<Record<VoiceId, string>>;
  /**
   * Insistence. A voice loud enough not to let the argument end speaks once
   * more, after everyone else has finished — fourteen words at most.
   *
   * Authored only for the voices plausibly loud at this decision, so a set of
   * five carries one or two. A voice with no rejoinder here simply never gets
   * the last word, which is a writer's decision and not an engine default.
   */
  rejoinders?: Partial<Record<VoiceId, string>>;
  options: Option[];
}

/**
 * How a figure is built, so a crowd is not one person in five coats.
 *
 * Silhouette does most of the differentiating at this size — a round hat reads
 * differently from a tricorne at eighty pixels, and height and build separate
 * people faster than colour does.
 */
export interface Look {
  coat: string;
  hat?: 'tricorne' | 'round' | 'none';
  /** Shoulder and hip width multiplier, around 1. */
  build?: number;
  /** Height multiplier, around 1. Washington was notably tall. */
  tall?: number;
  /** A gown rather than a coat — a different garment, not a recoloured one. */
  gown?: boolean;
  /** Skin and hair, which should be stated for a named person, never assumed. */
  skin?: string;
  hair?: string;
  /** Cuff and lapel colour. A livery is defined by its facings. */
  facings?: string;
  /** A woman's linen cap. */
  cap?: boolean;
}

export interface NpcThread {
  id: string;
  /** Appearance in the world, distinct from the dialogue portrait. */
  look?: Look;
  /** Set once their lines have been heard, so documents can contradict them. */
  hearFlag?: string;
  /** Shown on the interaction prompt. "speak" tells the player nothing. */
  name: string;
  x: number;
  z: number;
  /**
   * A choice with nothing at stake, run before the thread's lines.
   *
   * R11 asks that at least 40% of choices be characterization-only — no stat
   * movement, no branching — and the build had none at all: every choice a
   * player had ever met was a real decision with consequences, including the
   * first one they met.
   *
   * This is where the interface gets taught. 05 §1.1 requires Act 1 to
   * "establish the four-channel reading grammar while the stakes are near
   * zero, so the student learns the interface without a tutorial" — and the
   * only honest way to do that is a decision panel that behaves exactly like
   * every later one and costs nothing. The council argues, the emblems show
   * who wants what, the expand text explains, the choice commits and cannot be
   * taken back. Then it turns out not to have mattered, and the next one does.
   *
   * Every option here must have `effects: {}`. The linter enforces it.
   */
  warmup?: Decision;
  lines: DialogueLine[];
  decision?: Decision;
  /** Lines shown once the thread's decision is done. */
  after?: DialogueLine[];
}


/**
 * Business the act will not close without. Everything else in the scene is
 * optional, and the optional things are what open the locked choices — so a
 * student who only does the business gets a thinner version of the same act
 * rather than a shorter one.
 */
export interface Business {
  /** The decision that settles it. */
  decision: string;
  /** How Washington thinks about it while it is unsettled. */
  pending: string;
}


/** A composed view: one plate, one ground plane, one act's worth of business. */
export interface Extra {
  x: number;
  z: number;
  coat: string;
  hat?: 'tricorne' | 'round' | 'none';
  build?: number;
  tall?: number;
  seed: number;
}

export interface Scene {
  id: string;
  act: number;
  title: string;
  subtitle: string;
  /** What this act is for, in one line. */
  purpose: string;
  /** Strength present and fit for duty. Null before there is an army. */
  strength: { fit: number; onRolls: number; dated: string } | null;
  /** Shown in place of the return when there is nothing to count. */
  noStrength: string;

  /**
   * How far back the player may walk in this scene. Defaults to 0.82.
   *
   * A plate is flat, so a figure sorts either wholly in front of it or wholly
   * behind it. Where a midground plate paints something solid across the whole
   * width — the earth bank on the lines — anyone further away than it is drawn
   * behind ALL of it and disappears. That is not a rendering fault; standing
   * behind a parapet does hide you. It is staging: the walkable ground has to
   * stop at the parapet, because there is nowhere visible behind it.
   *
   * Authored rather than derived, because it is a decision about where the
   * scene is playable, and the derived value (art.ts `walkFar`) is only the
   * ceiling the plates impose. The linter reports both and fails when content
   * is placed out of reach of whichever is in force.
   */
  walkTo?: number;

  /**
   * Leaving this scene ends the named act, and the reckoning is shown.
   *
   * An act break is the game's unit of accounting (07 §1.3.1): it is where the
   * world re-reads the stats, where the save lands, and where a class period
   * ends. It is the only honest place to tell a player what the last forty
   * minutes cost, because it is the only place a commander would have found out.
   */
  endsAct?: number;

  /**
   * The enlistment clock: whose contracts run out, and when.
   *
   * Separate from the return rather than nested inside it, because the two are
   * independent. CB-03 is the case that proves it — no November strength return
   * has been sourced (see V-A2.2 at the head of that file), and the date runs
   * out regardless of whether anyone managed to count the men it applies to.
   *
   * `count` is optional for the same reason. A date is a fact about a contract;
   * a headcount is a claim about the world, and this project does not put
   * unsourced claims on the screen. Where no figure has been verified, the
   * clock shows the date and says in words who it applies to.
   *
   * Null where the army has no expiry in view — which in Act 1 is because
   * there is no army.
   */
  expiring: { date: string; count?: number; who: string } | null;

  /*
   * The briefing, shown on arrival and repeatable from the journal.
   *
   * A scene used to open on two lines of atmosphere and a one-line purpose,
   * which reads well and tells a fourteen-year-old almost nothing. They need
   * four things before they can play: where they are, when it is, what has
   * already happened to put them there, and what they are supposed to do about
   * it. Atmosphere is what you write once those are answered, not instead of
   * answering them.
   */
  where: string;
  when: string;
  /** What has happened to bring him here. Two or three sentences of it. */
  situation: string[];
  /** What he is trying to do, concretely. Three at most, or it is a chore list. */
  objectives: string[];

  /** The two lines of atmosphere, which now come after the facts. */
  opening: string[];

  /**
   * The legend under the engraved plate that announces this scene.
   *
   * Two or three sentences, written the way a print's caption was written in
   * 1775: what this place is, and what has brought him to it. It is read before
   * the scene is walked, so it carries the change since the last one — a season,
   * a march, a defeat — which is the job the briefing cannot do because the
   * briefing is already inside the scene.
   */
  arrival?: string[];
  business: Business[];
  /** Interactable that ends the scene. */
  exit: string;
  /** Scene to move to when the exit is taken, if any. */
  exitTo?: string;
  /** Confirmation shown before leaving. */
  exitPrompt: string;
  settled: string;
  allTasksFlag: string;
  ambient: Ambient[];
  tasks: Task[];
  interactables: Interactable[];
  npcs: NpcThread[];
  /**
   * People who are simply present.
   *
   * Not threads and not targets — a camp with four men in it is not a camp of
   * sixteen thousand. They are placed on the ground plane like everyone else,
   * so they take their size and position from depth for free.
   */
  extras?: Extra[];
  /** Which placeholder plate set the renderer should build. */
  plates: 'vernon' | 'camp' | 'lines' | 'parlour';
  /**
   * Size multiplier on the figures and props, 1 by default. Interiors set it
   * above 1: the ground curve is calibrated for the open field, and a room needs
   * the camera brought in so a man is not a small figure on a wide floor.
   */
  figureScale?: number;
  /** Where the light comes from, in uv. Flat overcast sits high and central. */
  sun: [number, number];
}
