/**
 * Encounter system — text, choices, combat, loot phases.
 */

export const EncounterPhase = Object.freeze({
  TEXT: 'TEXT',
  CHOICE: 'CHOICE',
  COMBAT: 'COMBAT',
  LOOT: 'LOOT',
  COMPLETE: 'COMPLETE',
});

export class EncounterText {
  constructor(text, speaker = '', bgOverride = '') {
    this.text = text;
    this.speaker = speaker;
    this.bgOverride = bgOverride;
  }
}

export class EncounterChoice {
  constructor(text, resultText = '', effectType = '', effectValue = 0, options = {}) {
    this.text = text;
    this.resultText = resultText;
    this.effectType = effectType;
    this.effectValue = effectValue;
    // If true, after resolving this choice return to the same choice screen
    // instead of advancing the encounter. The choice becomes grayed out (Done).
    this.returnToChoices = options.returnToChoices || false;
    // If true, choosing this option completes the encounter and returns to the map.
    this.completesEncounter = options.completesEncounter || false;
    // If true, deactivate the map node after this choice is used.
    this.deactivatesNode = options.deactivatesNode || false;
    // If true, this choice can be picked multiple times (doesn't exhaust on use).
    this.repeatable = options.repeatable || false;
    this.exhausted = false; // set true after use (grayed out)
  }
}

export class EncounterPhaseData {
  constructor({
    phaseType,
    texts = [],
    choices = [],
    enemyId = '',
    lootGold = 0,
    lootGoldDice = null,
    lootCards = [],
    lootTitle = '',
    triggersLevelUp = false,
    levelUpTier = 1,
    choicePrompt = '',
    // Loot-pick mode (Varimatras + future drops): the player is
    // offered `lootPickCards` (array of CARD_REGISTRY ids) and
    // keeps exactly `lootPickCount` of them. When both are set on
    // a LOOT phase, advanceEncounterPhase routes to the
    // ENCOUNTER_LOOT_PICK screen instead of auto-rolling
    // lootCards / lootGold.
    lootPickCount = 0,
    lootPickCards = [],
    // Per-phase title override. When set, drawEncounterText shows
    // this string instead of currentEncounter.name at the top of
    // the TEXT screen. Lets a single encounter walk through
    // multiple narrative beats with different banner labels (e.g.
    // the Overseer Gnikan encounter shifts to "Varimatras" /
    // "Aftermath" titles after the boss swap). Empty string
    // suppresses the title entirely.
    phaseTitle = null,
  }) {
    this.phaseType = phaseType;
    this.texts = texts;
    this.choices = choices;
    this.enemyId = enemyId;
    this.lootGold = lootGold;
    this.lootGoldDice = lootGoldDice;
    this.lootCards = lootCards;
    this.lootTitle = lootTitle;
    this.triggersLevelUp = triggersLevelUp;
    this.levelUpTier = levelUpTier;
    this.choicePrompt = choicePrompt;
    this.lootPickCount = lootPickCount;
    this.lootPickCards = lootPickCards;
    this.phaseTitle = phaseTitle;
  }
}

export class Encounter {
  constructor(id, name, description, phases = [], isMainStory = false) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.phases = phases;
    this.currentPhaseIndex = 0;
    this.isMainStory = isMainStory;
  }

  get currentPhase() {
    if (this.currentPhaseIndex >= 0 && this.currentPhaseIndex < this.phases.length) {
      return this.phases[this.currentPhaseIndex];
    }
    return null;
  }

  get isComplete() {
    return this.currentPhaseIndex >= this.phases.length;
  }

  advancePhase() {
    this.currentPhaseIndex++;
    return this.currentPhase;
  }

  reset() {
    this.currentPhaseIndex = 0;
  }
}

// ============================================================
// Encounter Definitions
// ============================================================

export function createGiantRatEncounter() {
  return new Encounter('giant_rat', 'Chapter 1: The Prison', 'Escape the dungeon', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You were on your way to Qualibaf, a small city nestled in the mountains, when your party was ambushed by Kobolds. They overwhelmed you, bound your hands, and dragged you into the depths of their warren.'),
        new EncounterText('Days have become a blur of darkness and cold stone. You\'ve lost track of how long you\'ve been in this damp prison cell. The only sounds are the dripping of water and the occasional scurrying in the shadows.'),
        new EncounterText('Something wet touches your foot. Then pain - sharp, sudden. You jerk awake to find beady eyes gleaming in the darkness.'),
        new EncounterText('RATS! And one of them is enormous!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'giant_rat',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The giant rat lets out a final squeak and scurries away into the darkness, its smaller companions following close behind.'),
        new EncounterText('In the chaos of the fight, your hands found something on the ground - a sharp rock, its edge honed by years of water erosion. It\'s not much, but it\'s the first weapon you\'ve had since your capture.'),
        new EncounterText('You gained a new card: Sharp Rock!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
      lootCards: ['sharp_rock'],
    }),
  ], true);
}

export function createLockedDoorEncounter() {
  return new Encounter('locked_door', 'The Door', 'A heavy iron door blocks your path', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('With the rats scattered, you take stock of your surroundings. The cell is little more than a hole carved into the rock, damp and reeking of mildew. A heavy iron door stands between you and freedom, its rusted hinges groaning as you press against it. Locked, of course.'),
        new EncounterText('Beyond the door, you hear sounds that chill your blood. Screams echo through the corridors - some human, some... not. Shadows flicker past the narrow gap beneath the door, cast by torchlight that wavers and dances.'),
        new EncounterText('You examine the lock more closely. It\'s a crude mechanism, probably Kobold-made, but without proper tools your chances of picking it are slim.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Try to pick the lock with the sharp rock',
          'You scrape and prod at the mechanism, but without proper tools it\'s hopeless. The rock slips, and you slice your finger on the rusted metal. Blood drips onto the cold stone floor.',
          'damage', 1,
          { returnToChoices: true, deactivatesNode: true }
        ),
        new EncounterChoice(
          'Step back and wait',
          'You take a deep breath and step away from the door. Patience. There will be another way. There has to be.',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ], true);
}

export function createBonePileEncounter() {
  return new Encounter('bone_pile', 'Bone Pile', 'An ominous pile of bones...', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You come across a pile of old bones.'),
        new EncounterText('They look ancient, bleached by time...'),
        new EncounterText('Suddenly, the bones begin to rattle!'),
        new EncounterText('They assemble into a SKELETON!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'bone_pile',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The skeleton crumbles to dust.'),
        new EncounterText('Among the remains, you find something useful.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
      lootCards: ['bone_pile_loot'],
    }),
  ]);
}

export function createCrackEncounter() {
  return new Encounter('crack', 'The Crack', 'A narrow crack in the floor', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You kneel beside the crack in the floor where the skeleton once lay. The gap is narrow, barely wide enough for a person to squeeze through.'),
        new EncounterText('Pressing your face close, you feel a faint draft rising from below. It smells of damp and something else... something foul. But it might be a way out.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Try to squeeze through the crack',
          'You spend what feels like hours digging at the edges. Finally, the gap is just wide enough. You lower yourself down... and then you slip. You plunge into cold, foul water. You\'re in the sewers.',
          'fall_to_sewers', 1
        ),
        new EncounterChoice(
          'Leave it alone and go back',
          'You step back from the crack. It\'s too risky without knowing what\'s below.',
          '', 0
        ),
      ],
    }),
  ]);
}

export function createSplashPointEncounter() {
  return new Encounter('splash_point', 'Splash Point', 'You fall into the sewers', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You hit the water hard, the impact driving the air from your lungs. The current drags you along a stone channel before depositing you in a shallow pool.'),
        new EncounterText('Coughing and sputtering, you haul yourself onto a narrow ledge. The stench is overwhelming — centuries of filth have seeped into these tunnels. Foul water stretches in every direction.'),
        new EncounterText('As your eyes adjust to the gloom, you can make out two passages leading away from this chamber. Faint light glimmers down one; the other is pitch black.'),
      ],
    }),
  ]);
}

export function createDeadEndEncounter() {
  return new Encounter('dead_end', 'Dead End', 'A gate blocks the way out', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The passage opens into a small chamber. Rusted iron bars form a gate set into the far wall, and beyond it you can see a sliver of sky.'),
        new EncounterText('Fresh air filters through the bars — the first clean breath you\'ve drawn in days. Freedom is tantalizingly close.'),
        new EncounterText('You grip the bars and pull, but the gate is locked tight. A heavy padlock secures the latch, far too sturdy to break with your bare hands.'),
        new EncounterText('A wet, gurgling sound echoes behind you. Something oozes from the drain — a SLIME!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'slime',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The slime dissolves into a harmless puddle, leaving behind a faint acidic smell.'),
        new EncounterText('The gate remains locked, but at least the path behind you is clear again.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
      lootCards: ['slime_loot'],
    }),
  ]);
}

export function createTightOpeningEncounter() {
  return new Encounter('tight_opening', 'Tight Opening', 'A narrow gap in the wall', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The tunnel narrows until the walls nearly touch. A gap barely wide enough for a person leads onward, darkness pressing in from all sides.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Try to squeeze through',
          '',
          'try_squeeze', 1,
          { returnToChoices: true, repeatable: true }
        ),
        new EncounterChoice(
          'Leave for now',
          'You back away from the gap. No sense getting stuck in the dark.',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ]);
}

export function createLostShrineEncounter() {
  return new Encounter('lost_shrine', 'Lost Shrine', 'A forgotten place of worship', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Tucked into an alcove off the main tunnel, you discover a small shrine. It must have been here long before the Kobolds claimed these tunnels.'),
        new EncounterText('A warm golden light radiates from a cracked stone altar, casting soft shadows across the walls. The air here feels different — clean, almost peaceful.'),
        new EncounterText('Ancient symbols are carved into the altar\'s surface. You can\'t read them, but they pulse faintly with each beat of your heart.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Pray at the Shrine',
          'You kneel before the altar and bow your head. Warmth floods through you, and the altar bestows a lost technique — a gift from whoever once tended this place.',
          'shrine_ability_card', 1,
          { completesEncounter: true }
        ),
        new EncounterChoice(
          'Leave for now',
          'You step away from the shrine, its golden glow fading behind you as you return to the tunnels.',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ]);
}

export function createSewerJunctionEncounter() {
  return new Encounter('sewer_junction', 'Sewer Junction', 'A crossroads in the sewers', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Three tunnels converge at a wide circular chamber. Channels of murky water flow beneath grated walkways, merging into a central drain.'),
        new EncounterText('Strange bioluminescent fungi cling to the ceiling, casting an eerie blue-green glow over the stonework. They pulse slowly, almost like breathing.'),
        new EncounterText('Two of the passages seem passable. Before you can choose, the water in the central drain begins to bubble and churn.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'slime',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The slime bursts apart, spattering the walls with harmless residue.'),
        new EncounterText('With the creature gone, both passages ahead are clear. The fungi overhead continue their slow, rhythmic glow.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
      lootCards: ['slime_loot'],
    }),
  ]);
}

export function createAbandonedCampEncounter() {
  return new Encounter('abandoned_camp', 'Abandoned Camp', 'Someone sheltered here once', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You stumble upon what looks like an old campsite tucked into a dry alcove. The remains of a small fire sit in a ring of stones, long cold.'),
        new EncounterText('A tattered bedroll is spread against one wall, and a few meager supplies — a waterskin, some dried rations, a stub of candle — are piled nearby. Whoever camped here left in a hurry.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Take a short rest',
          'You sink onto the bedroll and close your eyes, just for a moment. When you wake, you feel a little stronger.',
          'short_rest', 5,
          { returnToChoices: true }
        ),
        new EncounterChoice(
          'Search the camp',
          'You rummage through the supplies, checking every pocket and fold. There might be something useful hidden here.',
          'search_camp', 1,
          { returnToChoices: true }
        ),
        new EncounterChoice(
          'Leave',
          'You leave the camp. Whoever left these things behind may yet return for them.',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ]);
}

export function createUpwardPassageEncounter() {
  return new Encounter('upward_passage', 'Upward Passage', 'A tunnel sloping upward', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The tunnel begins to slope upward, the sewer muck giving way to dry, packed earth. You must be climbing back toward the surface.'),
        new EncounterText('Warm air drifts down from above, carrying with it an unmistakable smell — cooked meat, spices, woodsmoke. Someone is cooking up there.'),
        new EncounterText('You hear the clatter of pots and a guttural voice humming an off-key tune. The sound echoes down from a rough-hewn opening above your head.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Try to climb up',
          'You find handholds in the rough stone and pull yourself upward, emerging through a trapdoor into a wave of heat and steam.',
          'move_to_kitchen', 1
        ),
        new EncounterChoice(
          'Stay down',
          'You back away from the opening. Better to find another route than walk into a Kobold kitchen.',
          'upward_stay_down', 0
        ),
      ],
    }),
  ]);
}

export function createKitchenEncounter() {
  return new Encounter('kitchen', 'The Kitchen', 'A busy Kobold kitchen', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      // Intro text matches the Python game verbatim.
      texts: [
        new EncounterText('You are in the corner of a large stone kitchen, tucked behind crates in a private area near the grate you climbed through. Copper pots hang from hooks on the ceiling. A massive fireplace dominates one wall, its flames casting dancing shadows across the room.'),
        new EncounterText('There is a small reptilian creature... cooking? And singing. Scaled green skin, a long snout, and small horns curling back from its brow. It wears a stained apron and hums tunelessly as it chops what appears to be a very large chicken. Tables in disarray surround it, covered with discarded food scraps and strange ingredients.'),
        new EncounterText('The creature hasn\'t noticed you yet. A doorway leads out of the kitchen on the far side. What do you do?', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Attack the Cook',
          'You lunge at the creature! It shrieks in terror, grabs a heavy pot and hurls it at your head. The pot connects with a painful CLANG before the cook scrambles away through a back passage, screaming continuously in its strange language. The kitchen is yours, but your head is ringing. You make your way through the doorway.',
          'kitchen_attack', 1
        ),
        new EncounterChoice(
          'Try to talk to the Cook',
          'You clear your throat softly. The creature spins around, eyes wide, cleaver raised — then slowly lowers it as you raise your hands. You try humming along with its song. The creature\'s eyes light up. It seems appeased and no longer sees you as a threat. It points to the table where a big chicken leg sits, still warm, and motions for you to take it and eat.',
          'kitchen_talk', 1
        ),
        new EncounterChoice(
          'Try to sneak out of the kitchen',
          'You crouch low and creep along the wall, keeping to the shadows. The cook continues humming and chopping, completely distracted by its work. You slip through the doorway on the far side without being noticed.',
          'kitchen_sneak', 1
        ),
        new EncounterChoice(
          'Leave',
          'You quietly back away and return the way you came.',
          'kitchen_leave', 0
        ),
      ],
    }),
  ]);
}

export function createPrisonEntranceEncounter() {
  return new Encounter('prison_entrance', 'Prison Entrance', 'The main prison corridor', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The passage widens into a torchlit corridor. Iron-barred cells line both walls, most empty, some containing huddled shapes that don\'t look up as you pass.'),
        new EncounterText('Two Kobold guards stand at the far end, flanking a heavy wooden door. One carries a whip coiled at its belt; the other rattles a ring of keys. They spot you and snarl.'),
        new EncounterText('Behind them, a barrel overflows with confiscated weapons. Your weapons might be in there — if you can get past the guards.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The guards bar the way. What do you do?',
      choices: [
        new EncounterChoice(
          'Attack the Guards',
          'You charge, weapon raised.',
          'prison_fight', 0,
        ),
        // Snatch result text is filled in by resolvePrisonSnatch at click
        // time, based on whether the roll succeeds or fails.
        new EncounterChoice(
          'Try to snatch a weapon from the barrel',
          '',
          'prison_snatch', 0,
        ),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'prison_guards',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The warden collapses with a groan. You snatch the whip from its belt and the key ring from the floor. You obtained the Warden\'s Whip and a Prison Key!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      // Two drops: the guaranteed Warden's Whip + one roll from the
      // prison-warden loot table (matches PY's
      // `lootCards=["wardens_whip", "kobold_base_loot"]`).
      lootCards: ['wardens_whip', 'kobold_base_loot'],
    }),
    // Post-combat barrel choice — resolved via `loot_barrel` effect. Skipped
    // entirely if the barrel was already looted via the sneak/talk pre-fight
    // snatch (see prison_snatch handler in main.js).
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'A barrel of confiscated gear sits by the door.',
      choices: [
        // Rummage result text is filled in by resolveLootBarrel at click time.
        new EncounterChoice(
          'Rummage through the gear barrel',
          '',
          'loot_barrel', 0,
          { completesEncounter: true },
        ),
        new EncounterChoice(
          'Leave it',
          'You step past the barrel and continue on.',
          '', 0,
          { completesEncounter: true },
        ),
      ],
    }),
  ]);
}

// Leave Prison — two variants depending on whether Thorb has been rescued
// (mirrors the Python game's `create_leave_prison_encounter(thorb_rescued)`).
// The flag is derived at instantiation time from `corner_cell.isDone` by
// the ENCOUNTER_REGISTRY wrapper below.
export function createLeavePrisonEncounter(thorbRescued = false) {
  if (!thorbRescued) {
    // Blocked exit: TEXT-only, no choice. Clicking through the last text
    // auto-returns to the map. The node IS marked done (standard encounter
    // completion flow), but `leave_prison` is set to canRevisit=true on
    // the map node so clicking it re-runs the encounter — which re-checks
    // thorbRescued each time, so after you free Thorb the normal flow runs.
    return new Encounter('leave_prison', 'Prison Exit', 'A door leading outside', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText('You stand before the heavy wooden door. Through the gap, you can see daylight streaming in. Freedom is right there.'),
          new EncounterText('But as you reach for the lock, you hear it — faint, echoing from deeper in the prison. Shouting. The clash of metal. Someone is fighting for their life down there.'),
          new EncounterText('You recognize that voice. Gruff, stubborn, unmistakably dwarven. One of your companions from the caravan is still alive in these cells.', '!'),
          new EncounterText('You pocket the key. There\'s no way you\'re leaving someone behind in this place. Not when you can still do something about it.'),
        ],
      }),
    ]);
  }

  // Thorb rescued — normal exit flow leading into the chapter-end transition.
  return new Encounter('leave_prison', 'Prison Exit', 'A door leading outside', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You stand before the heavy wooden door. Through the gap, you can see daylight streaming in. The Prison Key feels heavy in your hand.'),
        new EncounterText('Beyond this door lies freedom — but also the unknown. You\'ve survived the prison, but what awaits outside?', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Use the Prison Key and leave',
          'The key turns with a satisfying click. The door groans open, and warm sunlight floods in. You step outside, breathing fresh air for the first time in what feels like an eternity.',
          'leave_prison', 1
        ),
        new EncounterChoice(
          'Not yet',
          'You pocket the key. There might still be things to do here.',
          '', 0
        ),
      ],
    }),
  ]);
}

export function createPrisonWingEncounter() {
  return new Encounter('prison_wing', 'Prison Wing', 'A corridor of locked cells', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You follow a side corridor deeper into the prison wing. Cells stretch along both sides, their iron doors sealed with heavy locks.'),
        new EncounterText('The warden\'s key fits each lock with a satisfying click. Most cells are empty, but signs of recent habitation — scratched tallies, torn cloth — tell a grim story.'),
        new EncounterText('From the far end of the corridor, you hear a familiar voice shouting curses, punctuated by the squealing of something large and angry.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Investigate the sounds',
          'You rush toward the commotion, key at the ready. The noise grows louder with every step.',
          'investigate_prison_wing', 1
        ),
        new EncounterChoice(
          'Turn back',
          'You hesitate. Whatever is happening down there, it sounds dangerous. You retreat to the main corridor.',
          'prison_wing_turn_back', 0
        ),
      ],
    }),
  ]);
}

export function createCornerCellEncounter() {
  return new Encounter('corner_cell', 'Corner Cell', 'A cell at the end of the wing', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You round the corner to find the last cell in the wing. The door hangs ajar, its lock shattered from the inside.'),
        new EncounterText('Inside, a stocky dwarf with a braided beard is locked in a desperate struggle with an enormous rat — easily twice the size of the one you faced in your own cell. The dwarf has it by the scruff, but it\'s thrashing wildly.'),
        new EncounterText('"About time ye showed up! Don\'t just stand there — HELP ME!"', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'dire_rat',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The dire rat lets out a hideous shriek and collapses, twitching once before going still.'),
        new EncounterText('The dwarf dusts off his hands and fixes you with a gap-toothed grin.'),
        new EncounterText('"Name\'s Thorb. I\'d buy ye an ale if we weren\'t stuck in this blasted hole. Ye got me out of a tight spot — I won\'t forget it."', 'Thorb'),
        new EncounterText('"Right then. Wherever ye\'re headed, I\'m comin\' with ye. Lead on!"', 'Thorb'),
        new EncounterText('Thorb joins your party! He\'ll fight alongside you in future battles.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
      lootCards: ['thorb_card'],
    }),
  ]);
}

// ============================================================
// Mountain Path Encounters
// ============================================================

export function createMountainCampEncounter() {
  return new Encounter('mountain_camp', 'Mountain Camp', 'Chapter 2: The Mountain Path', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You wake to grey dawn, body aching from cold stone. The campfire has burned to embers. You\'re free of the prison, but the mountains stretch endlessly in every direction.'),
        new EncounterText('"Oi. Get up. We\'ve got company," Thorb growls, already on his feet with his weapon drawn. He nods toward the trail below.', 'Thorb'),
        new EncounterText('A Kobold patrol picks its way along the rocks - pale-scaled, shields bearing the sigil of the White Claw clan. One stops, sniffing the air. It turns toward your camp, eyes narrowing. They\'ve spotted you.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'kobold_patrol',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      lootCards: ['kobold_base_loot'],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The last Kobold falls. You catch your breath among the bodies. The White Claw clan - they control these mountain passes.'),
        new EncounterText('"We can\'t take the main road down," Thorb mutters, wiping his blade. "These wretches\'ll have scouts everywhere. Give me a moment - I know these mountains. I\'ll find us a way through."', 'Thorb'),
      ],
    }),
  ], true);
}

export function createMountainPassEncounter() {
  // Mirrors the Python Mountain Pass encounter: rockslide buff choice
  // → text → Stone Giant survival fight → loot → escape narrative.
  return new Encounter('mountain_pass', 'Mountain Pass', 'A treacherous mountain path', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You continue down the mountain, picking your way carefully along the narrow trail. The day wears on and you keep to the shadows, wary of more Kobold patrols. Twice you spot pale-scaled figures in the distance and press yourself against the rocks until they pass.'),
        new EncounterText('A deep rumbling echoes through the peaks above. At first you mistake it for thunder, but the sky is clear. Giant shadows sweep across the mountainside — something enormous is moving up there, dislodging stone and debris as it goes.'),
        new EncounterText('Then you see them. Boulders, tumbling down the slope toward you. Small ones at first, skipping off the rocks, then larger ones that shake the ground with each impact. The path ahead is about to become very dangerous.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Run for it!',
          'You sprint down the trail, legs pumping, rocks crashing around you. A boulder clips your shoulder and sends you stumbling, but you keep your footing. Heart hammering, you burst through the worst of it and throw yourself behind an outcrop. Bruised but alive.',
          'boulder_run', 1
        ),
        new EncounterChoice(
          'Take cover behind the rocks',
          'You dive for cover, flattening yourself into a small alcove where the rock wall curves inward. Boulders thunder past, bouncing over your sheltered position. Dust and gravel rain down, but the worst of it sails harmlessly overhead. A solid strategy.',
          'boulder_shelter', 1
        ),
        new EncounterChoice(
          'Methodically navigate your way through',
          'You watch the pattern of the falling rocks, timing your movements between impacts. Step, pause, dash, wait. It\'s nerve-wracking but effective. You weave through the rockslide with calculated precision, emerging on the other side without a scratch. Your focus is sharp.',
          'boulder_navigate', 1
        ),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('As the dust settles, you hear heavy footsteps shaking the ground. A massive figure emerges from behind the rocks — a Stone Giant, its body carved from living granite, eyes glowing like molten rock.'),
        new EncounterText('Thorb goes pale — a rare sight for a dwarf. "Stone Giant," he whispers. "Mortal enemies of the Mountain Dwarves. Killed me grandfather. Killed his grandfather too." He swallows hard. "We need to run. Now."', 'Thorb'),
        new EncounterText('The giant turns its gaze upon you, hefting a boulder in one enormous hand like a weapon.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'stone_giant',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      lootCards: ['stone_giant_loot'],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You scramble down the trail as fast as your legs will carry you. The giant\'s thunderous footsteps shake the mountain behind you, but you don\'t look back. You just run.'),
        new EncounterText('"Don\'t stop!" Thorb gasps, stumbling over loose rocks. "Those things don\'t tire. Just keep movin\'!"', 'Thorb'),
        new EncounterText('The rumbling finally fades. You collapse behind a rocky outcrop, gasping. The giant seems content to let you go — you\'ve left its territory. The mountain path continues downward.', '!'),
      ],
    }),
  ]);
}

export function createCalmStreamEncounter() {
  // Mirrors Python create_calm_stream_encounter exactly: the intro narrative,
  // then 4 independent choices that persist between visits (each can be used
  // once per run). Choice handlers in main.js consume them by id.
  return new Encounter('calm_stream', 'Calm Stream', 'A sheltered hollow with a gentle stream', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The path winds down through a grove of ancient trees, their branches draped with soft moss that glows faintly in the dappled light. You hear the gentle murmur of water before you see it - a crystal-clear stream winding through a sheltered hollow.'),
        new EncounterText('The air here feels different. Lighter. Tiny motes of golden light drift lazily through the glade, and wildflowers in impossible colors line the banks. The water itself seems to shimmer with an inner radiance, as though touched by something ancient and kind.'),
        new EncounterText('This place feels safe. Whatever magic lingers here, it means you no harm.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Drink from the stream',
          'You cup your hands and drink deeply from the stream. The water is impossibly cool and sweet, and warmth spreads through your body as you swallow. Your aches fade and your breathing steadies.',
          'stream_drink', 1, { returnToChoices: true },
        ),
        new EncounterChoice(
          'Search for food along the banks',
          'You forage along the stream banks, pushing aside the luminous wildflowers. Hidden among the roots and moss, you find clusters of plump, glowing berries — Goodberries, gifts of the forest.',
          'stream_search', 1, { returnToChoices: true },
        ),
        new EncounterChoice(
          'Bathe in the stream',
          'You wade into the stream and let the enchanted water wash over you. As you float in the gentle current, you notice a tiny figure watching you from a nearby flower — a Small Faery, no bigger than your thumb, with iridescent wings and curious eyes. It flutters down and lands on your shoulder, chirping softly.',
          'stream_bathe', 1, { returnToChoices: true },
        ),
        new EncounterChoice(
          'Continue on your way',
          'You leave the enchanted hollow behind, feeling refreshed just from the peaceful atmosphere.',
          '', 0,
        ),
      ],
    }),
  ]);
}

export function createGeneralZhostEncounter() {
  // Mirrors Python create_general_zhost_encounter exactly: intro, army fight
  // (kill 20), loot, transition text, boss fight, boss loot, epilogue.
  return new Encounter('general_zhost', "General Zhost's Army", 'A Kobold army camps near the river crossing', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You follow the road east, staying out of sight. The bridge to Qualibaf comes into view but something is terribly wrong - there\'s a gaping hole in the middle of it, smoke still rising from the rubble. Kobolds swarm across the wreckage like ants.'),
        new EncounterText('Desperate cries ring out from a nearby clearing. Through the trees you see Elf Combatants surrounded by hundreds of Kobolds, fighting for their lives.'),
        new EncounterText('"Elves," Thorb spits. "Not me favorite folk. But even I can\'t stand by and watch \'em get slaughtered by kobold scum."', 'Thorb'),
        new EncounterText('Patrols close in from all directions - there\'s no choice but to fight. In the chaos, you spot the biggest Kobold you\'ve ever seen on the back line, barking orders. He will pay!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'general_zhost',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      lootCards: ['kobold_base_loot'],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Dozens of Kobolds lie broken around you. Through the carnage, a path opens toward the massive general on the back line. His eyes widen as you lock gazes. It\'s time to finish this!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'general_zhost_boss',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      lootCards: ['general_zhost_loot'],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('General Zhost staggers back, his weapons clattering to the ground. Before you can finish him, a wave of Kobold reinforcements pours from the treeline. The general snarls and vanishes into the chaos.'),
        new EncounterText('"Leave him! More coming!" Thorb bellows, hauling you back toward the Elves. "We\'ll settle that score another day!"', 'Thorb'),
        new EncounterText('Together you cut a path south and disappear into the forest, leaving the Kobold horde behind.', '!'),
      ],
    }),
  ], true);
}

export function createCalmGroveEncounter() {
  // Mirrors Python create_calm_grove_encounter exactly: post-Zhost flight,
  // Raena joins the party (+ level-up + rest), then a single optional gift
  // (Lambas Bread) before pressing on.
  return new Encounter('calm_grove', 'Calm Grove', 'A hidden grove where Raena and the surviving elves rest.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You flee south through the forest with Raena and the surviving elves. After what feels like hours, you stumble into a hidden grove sheltered by ancient oaks. The sounds of pursuit fade.'),
        new EncounterText('Raena slumps against a mossy trunk. "That ambush... so many fell. Without you, none of us would have survived." You tell her you\'re trying to reach Qualibaf.', 'Raena'),
        new EncounterText('"Aye, fought well for an elf," Thorb admits grudgingly, cleaning his weapon. "Suppose they\'re not ALL useless."', 'Thorb'),
        new EncounterText('Raena rises, ignoring Thorb. "Then let me come with you. The Kobold threat is greater than any of us realized. Together we can warn the free peoples before it\'s too late."', 'Raena'),
        new EncounterText('"More the merrier," Thorb shrugs. "Let\'s rest a bit first. Me legs are about to give out."', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['raena_card'],
      lootTitle: 'Raena joins the party!',
      triggersLevelUp: true,
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'While resting in the peaceful grove, Raena offers you some bread.',
      choices: [
        new EncounterChoice(
          "Accept Raena's Lambas Bread",
          'Raena reaches into her pack and produces a leaf-wrapped bundle of warm elvish bread. "Lambas," she says softly. "It will restore your strength." The bread is light and fragrant, and warmth spreads through you with every bite.',
          'accept_lambas_card', 0,
          { returnToChoices: true },
        ),
        new EncounterChoice(
          'Press on',
          'After resting a while in the grove\'s shelter, you feel ready to press forward. Raena nods and falls into step beside you.',
          '', 0,
        ),
      ],
    }),
  ]);
}

// Mirrors PY chapter_end_text shown alongside the "Chapter 3" banner —
// here we display the narrative as a brief two-page dialog after the
// title card, before dropping the player onto the plains map.
export function createEnteringPlainsEncounter() {
  return new Encounter('entering_plains', 'The Plains of No Hope', 'A bitter wind, a grey sky.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText(
          'You leave the forest behind and step onto the barren plains. ' +
          'The wind is bitter and the sky heavy with grey clouds. ' +
          'Snow drifts lazily down around you.'
        ),
        new EncounterText(
          'The path ahead is long and desolate, but Qualibaf waits on the other side.'
        ),
      ],
    }),
  ]);
}

export function createToThePlainsEncounter() {
  return new Encounter('to_the_plains', 'To the Plains', 'The edge of the forest, overlooking a vast desolate plain.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText(
          'You leave the shelter of the grove and follow the tree line south. ' +
          'The forest thins and the land opens up - a vast, grey expanse ' +
          'stretches to the horizon, flat, barren, and utterly still.'
        ),
        new EncounterText(
          '"The Plains of No Hope," Raena says quietly. "Nothing grows ' +
          'here. Nothing lives here by choice."',
          'Raena'
        ),
        new EncounterText(
          '"Cheerful name," Thorb mutters. "Reminds me of me aunt\'s ' +
          'cooking. Flat, grey, and best avoided."',
          'Thorb'
        ),
        new EncounterText(
          'A few white flakes drift down from the grey sky. Raena frowns. ' +
          '"Snow? It\'s early for that. We should cross the plains heading ' +
          'west - there should be a way to reach Qualibaf on the other ' +
          'side of the river."',
          'Raena'
        ),
        new EncounterText(
          '"Long as we keep movin\', I\'m fine," Thorb says, pulling his ' +
          'collar up. "Standing still in a place called \'No Hope\' seems ' +
          'like bad luck."',
          'Thorb'
        ),
      ],
    }),
  ]);
}

// ============================================================
// Plains Encounters
// ============================================================

export function createBoneValleyEncounter() {
  return new Encounter('bone_valley', 'Bone Valley', 'A desolate valley choked with ancient bones.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText(
          '"We should cut through there," Raena says, pointing between ' +
          'two looming peaks. "Staying low keeps us less exposed."',
          'Raena'
        ),
        new EncounterText(
          'You descend into a narrow valley. The grass gives way to cracked, ' +
          'sun-bleached earth. No wind. No birds. Nothing.'
        ),
        new EncounterText(
          'Then you notice the bones. Rib cages half-buried in the dust, ' +
          'jawbones jutting from the dirt. As you press deeper, they ' +
          'multiply - skulls, femurs, spines - scattered everywhere.'
        ),
        new EncounterText(
          '"I don\'t like this," Thorb growls, scanning the valley walls. ' +
          '"Dwarves know their bones. These aren\'t natural remains. ' +
          'Something put \'em here."',
          'Thorb'
        ),
        new EncounterText(
          '"Wait..." Raena freezes. "The bones. They weren\'t here a ' +
          'moment ago. They\'re spreading."',
          'Raena'
        ),
        new EncounterText(
          'The ground rumbles. The bones tremble, rattle, then MOVE - ' +
          'dragging themselves across the earth, converging on a single ' +
          'point ahead of you.'
        ),
        new EncounterText(
          '"RUN! We have to-" But there is nowhere to run. The valley ' +
          'walls close in on both sides, the path behind choked with ' +
          'writhing bones.',
          'Raena'
        ),
        new EncounterText(
          'Hundreds of bones fuse together with sickening cracks, twisting ' +
          'into a towering AMALGAM. A dozen skulls stare from its body.',
          '!'
        ),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'bone_amalgam',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The bone amalgam shatters, its remains collapsing into a lifeless heap.'),
        new EncounterText('Among the wreckage, you find something useful.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      lootCards: ['bone_amalgam_loot'],
    }),
  ]);
}

export function createWolfBlizzardEncounter() {
  // Mirrors Python create_wolf_blizzard_encounter exactly: 6 narrative
  // beats with Raena chiming in, the kill-10 fight, salvage loot, and
  // a 3-block epilogue forcing the cave entrance.
  return new Encounter('wolf_blizzard', 'Wolf Pack', 'A pack of wolves hunts you through the blizzard.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("You flee the storm of bones and rocks, running south without thinking. When the dust settles, you realize you've wandered far from your objective. Too far."),
        new EncounterText('The sky darkens. Snow begins to fall — softly at first, then in thick, biting sheets. Within minutes, a dry blizzard swallows everything. Visibility drops to nothing. The wind screams.'),
        new EncounterText('"The rocks — I think they\'re east!" Raena shouts over the howling gale, pulling you toward dark shapes in the white. "We need cover, NOW!"', 'Raena'),
        new EncounterText('Then you hear them. Low growls cutting through the wind. Shadows moving in the snow — too many to count. Yellow eyes flash in the whiteout, circling closer.'),
        new EncounterText('"Wolves..." Raena draws her blade, voice trembling. "A whole pack. They\'ve been tracking us."', 'Raena'),
        new EncounterText('You scramble toward the rocks but the cliff face blocks your escape. Cornered. The pack closes in, snarling, their breath steaming in the frozen air. There is no running from this.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'wolf_pack',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The last wolf yelps and retreats into the blizzard. The pack scatters.'),
        new EncounterText('Among the fallen wolves, you find something useful.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      lootCards: ['wolf_pack_loot'],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You barely catch your breath before more howls pierce the wind. Many more. The blizzard thickens and dark shapes close in from every direction. This isn\'t over.'),
        new EncounterText('"There!" Raena grabs your arm, pointing at a dark opening in the rock face. A cave entrance, half-hidden by snow and ice. "It\'s our only chance!"', 'Raena'),
        new EncounterText('Without thinking, you throw yourselves inside. The wolves snarl at the entrance but don\'t follow. The howling wind fades to an eerie silence as you stumble deeper into the darkness.'),
      ],
    }),
  ]);
}


// ============================================================
// Cave Encounters
// ============================================================

export function createCaveEntranceEncounter() {
  // Mirrors Python create_cave_entrance_encounter — Thorb lights a
  // makeshift torch, Raena resigns to going forward.
  return new Encounter('cave_entrance', 'Cave Entrance', 'The cave entrance, where Thorb lights a makeshift torch.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The cave mouth swallows the last of the daylight behind you. The howling wind dies to a whisper, replaced by the drip of water echoing in the darkness. You can barely see your own hands.'),
        new EncounterText('"Hold on, I\'ve got something," Thorb grunts. You hear him rummaging through scraps of old clothing scattered on the cave floor. The rasp of flint on steel echoes off the walls.', 'Thorb'),
        new EncounterText('A spark catches. Then another. A strip of cloth wrapped around a broken stalagmite flickers to life, casting dancing shadows across the rough stone walls. The torch\'s warm glow pushes back the darkness just enough to see.'),
        new EncounterText('"That\'ll do for now," Thorb says, raising the makeshift torch higher. The cave stretches deeper ahead, splitting into passages that vanish into the dark. Cool air drifts from somewhere below.', 'Thorb'),
        new EncounterText('Raena peers into the gloom. "We can\'t go back. The wolves will be waiting." She pauses. "Whatever is down here, at least it\'s warmer than that blizzard."', 'Raena'),
        new EncounterText('You press forward, guided by the flickering torchlight. The cave walls glisten with moisture and strange mineral deposits. The air smells of damp stone and something older, deeper. Only way is forward.'),
      ],
    }),
  ]);
}

export function createCaveLedgeEncounter() {
  // Mirrors Python create_cave_ledge_encounter — 4 ways to descend.
  // Each option has a different cost / risk profile:
  //   - Climb: Recharge 1 random hand card; 50% take 2-3 deck damage.
  //   - Rope:  Discard 1 hand card matching clothing / light_armor /
  //            scraps / warden's whip.
  //   - Long:  Recharge up to 4 random hand cards (always safe).
  //   - Jump:  Take 4 deck damage (always works).
  // Result text for each is set dynamically by the resolver in main.js.
  return new Encounter('cave_ledge', 'The Ledge', 'A rocky ledge overlooking an icy darkness below.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You move deeper until you nearly topple over an edge. Below, faint reflections glimmer — ice. The sound of running water echoes from somewhere far below.'),
        new EncounterText('The drop is maybe fifteen feet. The walls offer some handholds, but they\'re slick with moisture.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'How do you descend?',
      choices: [
        new EncounterChoice(
          'Climb down carefully  [Recharge a Card to attempt]',
          '', 'cave_climb_down', 1,
        ),
        new EncounterChoice(
          'Use gear as rope',
          '', 'cave_rope_down', 1,
        ),
        new EncounterChoice(
          'Find a longer way around  [Safe]',
          '', 'cave_long_way', 1,
        ),
        new EncounterChoice(
          'Jump!  [Risky]',
          '', 'cave_jump_down', 4,
        ),
      ],
    }),
  ]);
}

export function createCaveRiverLandingEncounter() {
  // Mirrors Python create_cave_river_landing_encounter — Thorb mentions
  // mushrooms, the player loots 2 Cave Shrooms mid-dialog, then the
  // torch dies and the party heads downriver.
  return new Encounter('cave_river_landing', 'River Landing', 'A rocky landing beside an icy underground river.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You dust yourself off and take stock of your surroundings. A rocky landing stretches along an underground river, its surface glazed with thin ice. The torch flickers weakly.'),
        new EncounterText('"We should be able to find some cave mushrooms down here," Thorb says, holding the sputtering torch higher. "They glow — should let us see without the torch. Good thing too, this thing won\'t last much longer."', 'Thorb'),
        new EncounterText('On the damp rocks near the water\'s edge, small clusters of mushrooms emit a soft, pale blue glow.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['cave_shroom_loot'],
      lootTitle: 'Cave Shrooms!',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The torch sputters and dies, but the mushrooms cast an ethereal blue glow that reaches further than you\'d expect.', '!'),
        new EncounterText('"Not bad," Thorb admits, tucking a few mushrooms into his belt. "Now, the river\'s flowing that way. In the mountains, water always finds a way out. I say we follow it."', 'Thorb'),
        new EncounterText('Raena nods. "And these mushrooms... I\'ve read about them. They have healing properties."', 'Raena'),
        new EncounterText('You decide to follow the icy river deeper into the cave.'),
      ],
    }),
  ]);
}

export function createUndergroundRiverEncounter() {
  // Mirrors Python create_underground_river_encounter — long TEXT-only
  // journey: party wades into the river, current sweeps them through a
  // tunnel, plunges over a small waterfall, deposits them on a rocky
  // shelf with an amber glow ahead. NOTE: PY has NO combat here — the
  // sahuagin/piranha fight lives at the next node (piranha_pool, on
  // the ruins basin map).
  return new Encounter('underground_river', 'Underground River', 'The river disappears into a dark tunnel.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You follow the river deeper underground. The air grows warmer here — the ice along the banks has given way to slick, dark stone. The pale glow of cave mushrooms reflects off the water\'s surface.'),
        new EncounterText('The passage narrows ahead. The river fills the entire tunnel — there\'s no way forward along the banks. You\'ll have to wade in.'),
        new EncounterText('"I don\'t like this," Thorb mutters, eyeing the dark water. "But I don\'t see another way."', 'Thorb'),
        new EncounterText('You step into the river. The water is surprisingly warm, rising to your waist. The current is gentle at first, guiding you forward through the tunnel. The mushroom light fades behind you.'),
        // Beat where the river takes over — switch bg to InTheRiverCurrent
        // (PY's underground_rapids_bg) and the renderer side fires the
        // fast-flowing rapids cue. See handleEncounterTextClick.
        new EncounterText('The current picks up. What was a gentle pull becomes an insistent tug. The water rises to your chest. The tunnel walls rush past faster now.', '', 'bg_underground_rapids'),
        new EncounterText('"Grab onto something!" Thorb shouts, but there\'s nothing to grab. The river has you now. You\'re swept forward, tumbling through the darkness, water roaring in your ears.', 'Thorb'),
        new EncounterText('A sudden drop — your stomach lurches as you go over a small waterfall. You crash into a deeper pool, pulled under for a terrifying moment before surfacing, gasping.'),
        new EncounterText('The current slows. You drag yourself onto a rocky shelf, coughing water. Thorb hauls himself up beside you, breathing hard. Your torch is long gone, but a faint amber glow emanates from somewhere ahead.'),
        new EncounterText('There\'s no going back the way you came.', '!'),
      ],
    }),
  ]);
}

// ============================================================
// Ruins Basin Encounters
// ============================================================

export function createPiranhaPoolEncounter() {
  // Mirrors Python create_piranha_pool_encounter — 5 narrative beats
  // ending with the piranhas swarming, then the piranhas_swarm fight.
  // (PY uses a swim-target mechanic for victory; the JS port currently
  // routes it through the existing kill-target system.)
  return new Encounter('piranha_pool', 'The Pool', 'A dark pool at the base of a waterfall.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The river spits you out over the edge of a waterfall. For a terrible, weightless moment you hang in the air — then you plunge into a wide, dark pool below.'),
        new EncounterText('You surface, gasping. The pool is vast, fed by the waterfall thundering behind you. Ancient stone columns rise from the water around you, carved with symbols you don\'t recognize. Ruins.'),
        new EncounterText('Something brushes against your leg. Then again. Small, darting shapes move just beneath the surface, circling you in the murky water.'),
        new EncounterText('A sharp sting on your calf. Then another on your arm. Tiny teeth — dozens of them. The water around you begins to froth with silvery, writhing bodies.', '!'),
        new EncounterText('"PIRANHAS!" Thorb bellows, thrashing wildly. Blood clouds the water around him. "SWIM! Get to the edge!"', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'piranhas_swarm',
    }),
  ]);
}

export function createPoolSouthEncounter() {
  return new Encounter('pool_south', 'Pool South', 'Southern edge of the pool', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You skirt along the southern edge of the pool, keeping well clear of the dark water. The stone walkway here is cracked but passable.'),
        new EncounterText('The passage continues ahead, winding between dripping stalactites and the remnants of carved walls.'),
      ],
    }),
  ]);
}

export function createPoolExitEncounter() {
  // Mirrors Python create_pool_exit_encounter — second sentinel ambush
  // at the edge of the corridor, then auto-jump to flooded_entrance.
  return new Encounter('pool_exit', "Pool's Exit", 'A sentinel patrols the passage ahead.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The passage narrows ahead, ancient stone walls closing in on either side. You can see where the pool gives way to carved corridors leading deeper into the temple.'),
        new EncounterText('A rhythmic splashing echoes from around the corner. Heavy, deliberate footsteps wading through shallow water. Something is patrolling this passage.', '!'),
        new EncounterText('Another Sahuagin rounds the corner, trident in hand. Its eyes lock onto you instantly. There is no surprise this time — only cold recognition. It lowers its weapon and advances.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'sahuagin_sentinel',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      lootCards: ['sahuagin_sentinel_loot'],
    }),
  ]);
}

export function createConservatoryWingEncounter() {
  // Mirrors Python create_conservatory_wing_encounter — TEXT-only
  // passage to the deeper sacred area. After the dialog, the player
  // is on temple_right with the altar_entrance node unlocked, so
  // they walk through to the Sacred Chamber on their own click.
  return new Encounter('conservatory_wing', 'Conservatory Wing', 'An arch leads deeper into the temple.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('This arch leads to a deeper area of the temple. The stonework here is more ornate, carved with scenes of worship and offering. You press forward.'),
        new EncounterText('After walking through drenched and half-submerged corridors, the passage opens into what looks like a more sacred area within the temple. The ceiling is higher here, and faint light filters through cracks above.'),
        new EncounterText('There are forms moving around in the dim light ahead. You cannot tell if they are friend or foe.', '!'),
      ],
    }),
  ]);
}

export function createFloodedPassageEncounter() {
  // Mirrors Python create_flooded_passage_encounter — 4 narrative
  // beats: widening corridor, first daylight in days, Thorb's
  // delight, the temple giving way to natural rock. After the
  // dialog, the flow auto-transitions to passage_entrance on the
  // temple_exit map_area (PY mirror in main.js).
  return new Encounter('flooded_passage', 'Flooded Passage', 'The passage opens up ahead.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The flooded corridor widens ahead. The ceiling rises, cracked and broken, revealing jagged holes where roots push through from above. Through the gaps, a faint gray light filters down.'),
        new EncounterText('Daylight. Weak and distant, but unmistakable. The first natural light you\'ve seen since you started following this underground river. The air shifts too — less stale, carrying the faint smell of earth and moss instead of brine.'),
        new EncounterText('"Light!" Thorb croaks, shielding his eyes. "Thought I\'d forgotten what that looked like." He squints upward at the cracks. "Can\'t climb through those, but... maybe there\'s a way out ahead."', 'Thorb'),
        new EncounterText('The passage slopes gently downward, the water growing shallower. Old temple stonework gives way to rougher, more natural rock. Whatever this place was, the temple is ending. Something else lies beyond.'),
      ],
    }),
  ]);
}

// === Boss Wing & Flooded Altar (PY mirrors) ===

export function createBossWingSentinelCombatEncounter() {
  return new Encounter('boss_wing_sentinel_combat', 'Sentinel Patrol', 'A Sahuagin sentinel blocks the way.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The sentinel spots you. It lets out a guttural shriek that echoes through the flooded corridors, then charges, trident leveled.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'sahuagin_sentinel',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The sentinel sinks beneath the murky water. The way ahead is clear, but the shriek will have alerted whatever lies deeper within.'),
      ],
    }),
  ]);
}

export function createBossWingPriestCombatEncounter() {
  return new Encounter('boss_wing_priest_combat', 'Flooded Chamber', 'The Sahuagin Baron awaits.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The archway opens into a grand flooded chamber. At its center, a massive Sahuagin towers above the dark water. It is armored in barnacle-encrusted plate, and its eyes burn with cold fury.'),
        new EncounterText('The Sahuagin Baron raises a clawed fist and the water churns violently. Dark shapes move beneath the surface — sharks, sentinels, priests — all answering the Baron\'s call.', '!'),
        new EncounterText('The Baron lets out a thunderous roar that shakes the chamber. The water rises. There is no retreat now.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'sahuagin_baron',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [5, 6],
      lootCards: ['sahuagin_sentinel_loot', 'sahuagin_baron_loot'],
    }),
  ]);
}

export function createFloodedAltarEncounter() {
  // Mirrors PY create_flooded_altar_encounter — the priest rises
  // from the water, player can attack or retreat back to the
  // central chamber. Loot drops both Sahuagin Sentinel pool + the
  // guaranteed Sahuagin Priest Staff.
  return new Encounter('flooded_altar', 'Flooded Altar', 'Something stirs in the dark water.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The chamber opens before you. At its center, a submerged altar rises from the dark water, covered in barnacles and ancient script. The air is thick with the smell of brine and decay.'),
        new EncounterText('The water ripples. Not the gentle lap of a current — something unnatural. Concentric rings spread from a point near the altar, as if pushed by an unseen force.', '!'),
        new EncounterText('A figure rises slowly from the water. Taller than the sentinels, draped in tattered robes that cling to scaled skin. Its eyes glow with a sickly green light. It raises a clawed hand, and the water around it churns.', '!'),
        new EncounterText('You see dark fins sliding in and out of the water on either side of the altar. The figure has not attacked yet, but its gaze is fixed on you with cold intent.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'What do you do?',
      choices: [
        new EncounterChoice(
          'Attack!',
          'You charge forward, weapons drawn!',
          'altar_attack', 0,
        ),
        new EncounterChoice(
          'Retreat to the central chamber',
          'You back away slowly, retreating through the flooded corridors.',
          'altar_retreat', 0,
        ),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'sahuagin_priest',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [4, 6],
      lootCards: ['sahuagin_sentinel_loot', 'sahuagin_priest_loot'],
    }),
  ]);
}

export function createOldGodStatueEncounter() {
  // Mirrors PY create_old_god_statue_encounter — narrative beat then
  // a Pray / Leave choice. Praying triggers a class-specific tier-1
  // ability pick AND grants the Old God's Blessing combat buff
  // (next attack +1 if target is damaged) for the next combat.
  return new Encounter('old_god_statue', 'Statue of an Old God', 'An ancient statue stands half-submerged in the murky water.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Beyond the altar, a massive stone statue rises from the water. It depicts a figure you do not recognize — neither human nor Sahuagin. Something older. Its eyes are closed, but you feel them watching.'),
        new EncounterText("The statue's hands are outstretched, palms up, as though offering something — or waiting to receive. Ancient script circles its base, worn but still faintly glowing with a pale light.", '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Pray at the Statue',
          'You kneel in the cold water and bow your head. The pale script flares — a single bright pulse — and warmth blooms in your chest. Whatever was sleeping here turns its attention toward you, and offers a gift.',
          'pray_statue', 1,
        ),
        new EncounterChoice(
          'Leave',
          'You step back from the statue. The pale glow dims, but the feeling of being watched lingers.',
          '', 0,
        ),
      ],
    }),
  ]);
}

export function createSentinelPatrolSightingEncounter() {
  // Mirrors Python create_sentinel_patrol_sighting_encounter —
  // dialog-only beat shown when the party first emerges into the
  // boss wing. Player can then navigate to the deeper rooms.
  return new Encounter('sentinel_patrol_sighting', 'Deeper Corridor', 'Sahuagin sentinels patrol the flooded corridors.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You emerge into a flooded wing of the temple. The water here is waist-deep and murky. Columns rise from the dark water, covered in barnacles and strange carvings.'),
        new EncounterText('Movement ahead. Two Sahuagin sentinels glide through the water on patrol, their tridents held low. They haven\'t spotted you yet, but there\'s no way past without a fight.', '!'),
        new EncounterText('Beyond them, the corridor leads to a grand archway. You can feel something emanating from that direction — a low hum of dark power that makes the water tremble.', '!'),
      ],
    }),
  ]);
}

export function createDarkCorridorEncounter() {
  // Mirrors Python create_dark_corridor_encounter — narrative
  // glimpse of the deeper flooded wing, then a "Descend / Turn back"
  // choice. Picking Descend unlocks the Deeper Corridor node and
  // teleports the party there; the two nodes act as a teleport pair
  // afterward (the encounter is one-shot, the connection persists).
  return new Encounter('dark_corridor', 'Dark Corridor', 'A wide corridor leading deeper into the temple.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The corridor slopes downward, the water rising past your ankles. The walls narrow and the light fades. Somewhere ahead, you hear the rhythmic splash of something moving through deep water.'),
        new EncounterText('Through a gap in the crumbling wall, you catch a glimpse of a vast flooded chamber beyond. Dark shapes patrol the waters — Sahuagin, moving with purpose. This is no random territory. Something important lies deeper within.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The corridor descends into flooded darkness. What do you do?',
      choices: [
        new EncounterChoice(
          'Descend into the darkness',
          'You steel yourself and wade deeper. The water rises to your waist as the passage opens into a flooded wing of the temple.',
          'descend_dark_corridor', 1,
        ),
        new EncounterChoice(
          'Turn back',
          'You retreat from the flooded corridor. Whatever lies below can wait.',
          'dark_corridor_turn_back', 0,
        ),
      ],
    }),
  ]);
}

export function createPassageAmbushEncounter() {
  // Mirrors Python create_passage_ambush_encounter — a stalking
  // Sahuagin Sentinel jumps the party in the widening corridor.
  return new Encounter('passage_ambush', 'Ambush!', 'Something is waiting in the shadows.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You press forward through the widening passage. The shallow water barely reaches your ankles now. Moss-covered columns line the walls — the last remnants of the temple\'s architecture.'),
        new EncounterText('A sound. A wet scrape of claws on stone, somewhere to your left. You spin, hand on your weapon. For a moment, nothing. Just the dripping of water and the distant light above.', '!'),
        new EncounterText('Then it launches from behind a broken pillar — a Sahuagin, scales dark as wet slate, trident aimed at your throat. It was waiting. Patient. Hidden. You barely get your guard up in time!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'sahuagin_sentinel',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      lootCards: ['sahuagin_sentinel_loot'],
    }),
  ]);
}

export function createCaveExitEncounter() {
  // Mirrors Python create_cave_exit_encounter — 7-beat narrative
  // ending on Thorb's "let's not keep civilization waiting." After
  // the dialog the encounter-complete branch in main.js auto-jumps
  // the party to mountain_overlook on the arriving_city map_area.
  return new Encounter('cave_exit', 'The Light Beyond', 'The cave opens onto a mountainside.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The passage narrows one last time, and then — light. Real, blinding, glorious light. You shield your eyes as you stumble out of the cave mouth onto a rocky mountainside ledge.'),
        new EncounterText('The view steals your breath. Below you, the mountain slopes down through scrubby pines and wild grass toward a wide river valley. The descent looks manageable — steep in places, but nothing compared to what you\'ve already survived.'),
        new EncounterText('The underground river emerges far below as a waterfall, feeding into the river that cuts through the valley. But here, away from the falls, the river runs shallow and calm. You can see places where rocks break the surface — a crossing on foot.'),
        new EncounterText('And beyond the river, to the northeast... buildings. Walls. Smoke rising from chimneys. A city. Your heart hammers in your chest.'),
        new EncounterText('"Is that..." Thorb trails off, barely daring to say it. He wipes his eyes with a grimy sleeve. "That\'s Qualibaf. Has to be. We made it. We actually made it."', 'Thorb'),
        new EncounterText('Raena steps to the ledge, the wind catching her hair. A rare smile crosses her face. "We came from the south. The river took us much further than I expected — this detour added days to our journey." She pauses. "But we\'re alive. That counts for something."', 'Raena'),
        new EncounterText('"Counts for everything," Thorb says firmly. He claps you on the shoulder. "Come on. Let\'s not keep civilization waiting. I need a proper meal and a bed that isn\'t made of stone and regret."', 'Thorb'),
      ],
    }),
  ]);
}

export function createRiverCrossingEncounter() {
  // Mirrors PY create_river_crossing_encounter — 4 narrative beats
  // crossing the shallow river on foot, with a 25% chance to find a
  // Lucky Pebble at the far bank.
  const phases = [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You pick your way down the mountainside, following a narrow goat trail that winds between boulders and gnarled trees. The air is warm and clean — a world away from the damp darkness of the flooded temple.'),
        new EncounterText('At the river\'s edge, a line of flat rocks juts above the current, forming a natural bridge. The water rushes between them, cold and clear, but shallow enough that even a misstep would only soak your boots.'),
        new EncounterText('One by one, you hop across — stone to stone, steady and sure. After swimming through piranha-infested temple pools and riding underground rapids, a simple river crossing feels almost laughable.'),
        new EncounterText('On the far bank, you pause to catch your breath. The road to Qualibaf stretches north through gentle farmland. You can see the city walls more clearly now — gray stone catching the afternoon light.'),
      ],
    }),
  ];
  if (Math.random() < 0.25) {
    phases.push(new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('As you step off the last stone, something catches your eye — a small, smooth pebble glinting between the rocks at the water\'s edge. Its surface is oddly warm to the touch, and it fits perfectly in the palm of your hand. What a nice little stone. Lucky me!'),
      ],
    }));
    phases.push(new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['lucky_pebble_loot'],
    }));
  }
  return new Encounter('river_crossing', 'River Crossing', 'The river runs shallow here.', phases);
}

// East Side — debug-gated sign waypoint between River Crossing and the
// South Gate. The dialog only fires when debug mode is on
// (startNodeEncounter no-ops this encounter otherwise). Mentions both
// directions the path forks: Qualibaf South Gate to the north,
// South Outpost to the south down the (wip) River Path.
export function createEastSideEncounter() {
  return new Encounter('east_side', 'East Side', 'A weathered signpost stands at the fork.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The path forks at a low rise on the east bank. A weathered wooden signpost leans into the wind, two planks nailed to its trunk.'),
        new EncounterText('The upper plank, arrow pointing north, reads: QUALIBAF SOUTH GATE. The paint is faded but freshly traced over.'),
        new EncounterText('The lower plank, arrow pointing south, reads: SOUTH OUTPOST. The wood here is darker, the lettering deeper — older work, but still legible.'),
        new EncounterText('You memorize the layout and step back onto the trail.'),
      ],
    }),
  ]);
}

// South Trail — last beat on the arriving_city map before the cross-
// map jump to the South of Qualibaf area. Plays a "follow the river
// south, civilization thins, tower on the horizon" travel montage.
// If the dragon is still alive (Varimatras NOT slain), opens with a
// tongue-in-cheek meta beat where Raena and Thorb roast the party
// for going on a side quest while Qualibaf is in danger. Called via
// startNodeEncounter with the current dragonSlain flag.
export function createSouthTrailEncounter(dragonSlain = false) {
  const texts = [];
  if (!dragonSlain) {
    texts.push(
      new EncounterText('Raena stops. Plants her staff in the dirt. Turns very slowly to look at you.', 'Raena'),
      new EncounterText('"Just so I have this straight," she says. "There is a kobold army massing somewhere north of Qualibaf. The wind has been wrong for a week — every shepherd we passed swore the cold came in too early and won\'t let go. The whole region feels like something is about to break. And we are walking south. Toward an outpost that, as far as anyone we\'ve met can recall, isn\'t actually in any trouble."', 'Raena'),
      new EncounterText('"Aye!" Thorb says brightly. "Side quest!"', 'Thorb'),
      new EncounterText('"A side quest." Raena pinches the bridge of her nose. "While the weather is broken and an army is gathering."', 'Raena'),
      new EncounterText('"It\'s how the old tales work, lass! Hero gets the big quest, ignores it for six smaller quests, comes back with a tower full of loot, then handles the main thing. Tradition!" Thorb beams at the signpost like it personally endorses his point.', 'Thorb'),
      new EncounterText('You consider mentioning that this is not actually a tale, and that armies and weather generally do not pause politely while protagonists collect side rewards. You decide this is a thought best kept to yourself.'),
      new EncounterText('Raena exhales the kind of sigh that has entire essays behind it. "Fine. South Outpost. But we are not staying for the gift shop."', 'Raena'),
    );
  }
  texts.push(
    new EncounterText('The trail bends with the river and runs south. For a while the terraced fields keep pace — wheat, vines, a shepherd or two raising a wary hand as you pass — but mile by mile the cultivated ground gives way to scrub, then rough pasture, then nothing at all but wind and brown grass.'),
    new EncounterText('The road dwindles to a footpath. Civilization thins behind you like smoke off a dying fire. Just the water, the rustle of the long grass, and the patient sun.'),
    new EncounterText('Hours pass. The sun crawls. And then, far to the south against the haze, something resolves: a low, dark silhouette. Squat. Weather-beaten. The unmistakable shape of a small fortified tower rising out of the plain.'),
    new EncounterText('"South Outpost, I\'d wager," Thorb murmurs. "Looks like nobody told it the war\'s on."', 'Thorb'),
  );
  return new Encounter('south_trail', 'Along the River', 'Following the water south.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts,
    }),
  ]);
}

// South Outpost — first arrival at the outpost gate. Gontran the Guard
// and a couple of weary subordinates greet the party and (a touch too
// hopefully) mistake them for the relief that was requested weeks ago.
// Sets up the Merchant Boat investigation hook before teleporting into
// the south_outpost map.
export function createOutpostMeetingEncounter() {
  return new Encounter('outpost_meeting', 'The South Outpost', 'Three tired guards man the gate.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The outpost is smaller up close than it looked on the horizon — a single squat tower, a sagging palisade, a stable that hasn\'t seen a horse in some time. Three men in mismatched, weather-stained uniforms perk up as you approach the gate. They had not, you suspect, been expecting visitors today. Or this week.'),
        new EncounterText('The tallest of them — barrel-chested, salt-and-pepper beard, an officer\'s pin pinned somewhat crookedly to his collar — steps forward. His eyes drop to your weapons. Then to your packs. Then to your weapons again. The hope kindling in his face is almost painful to watch.', 'Gontran'),
        new EncounterText('"You\'re... you\'re the relief, aren\'t you?" His voice cracks halfway through. "From Qualibaf. The relief we requested. Six weeks ago."', 'Gontran'),
        new EncounterText('You glance at Raena. Raena glances at Thorb. Thorb stares at the sky as if he\'s never seen one before.', 'Raena'),
        new EncounterText('"...Kinda?" you offer. "Maybe?"', '!'),
        new EncounterText('Gontran chooses to take this as a yes. The relief on his face is enormous. The two guards behind him visibly sag. One of them sits down on a barrel and puts his head in his hands.', 'Gontran'),
        new EncounterText('"Gontran. Gontran Vellis. Officer-in-charge — by which I mean the senior of the three of us still posted here." He claps a hand on your shoulder with the energy of a man who has just been thrown a rope. "Listen. I will be straight with you. We have a problem. A few days back a Qualibaf merchant boat went down the river and didn\'t come back up it. Crashed, we think — there\'s wreckage we can see from the watch — somewhere downstream before the cave mouth."', 'Gontran'),
        new EncounterText('"We\'d investigate ourselves. We would. But there\'s gnoll sign in the foothills and word from the trappers that a whole pack is working its way down toward us. If we abandon the outpost, even for a day, there\'s no one between them and the city." He grimaces. "So. Could you follow the river? See what\'s left of the boat? Survivors, cargo, anything?"', 'Gontran'),
        new EncounterText('"Take whatever supplies you need from the storehouse on the way out — bandages, rations, whatever\'s in there, we\'re not exactly hoarding." He pauses, then straightens with what is plainly an attempt at dignity. "And when you return — when you have investigated — come and find me. I will personally write you a Letter of Commendation for the Adventurers\' Guildmaster in Qualibaf. With my seal. So that you may be properly rewarded."', 'Gontran'),
        new EncounterText('He says "Letter of Commendation" the way another man might say "ancient artifact of immense power." The two guards behind him try, valiantly, not to smirk.', 'Gontran'),
        new EncounterText('Raena draws a long breath and lets it out slowly. "We\'ll take a look."', 'Raena'),
        new EncounterText('Thorb is already eyeing the storehouse.', 'Thorb'),
      ],
    }),
  ]);
}

// Outpost Kraken Report — replaces the standard outpost_meeting
// dialog the FIRST time the player walks into the outpost after
// surviving the Kraken Spawn. The party tells Gontran what
// happened — embellished into a tall tale of total carnage — and he
// Mithril Remedies (post-dragon, artisan district) — empty shop
// dialog. Party finds a worn-out note tacked to the door from the
// dwarven apothecary Olbrim Goldbalm, then talks over whether to
// chase him into the mountain. Side-quest seed for the
// Stairs of the Infinite content. WIP — debug-only for now.
export function createMithrilRemediesEncounter() {
  return new Encounter('mithril_remedies', 'Mithril Remedies',
    'A small workshop tucked between two larger forges, dark glass jars stacked behind the counter.', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText("You push the door open. Dust motes drift in the slant of furnace-light. The counter is empty, the shelves half-stocked — vials of clouded liquid, a bowl of dried moss, a single pestle laid neatly across an open ledger.", '!'),
          new EncounterText("A note is tacked to the inside of the door, written in the careful, looping hand of someone who hates being interrupted.", '!'),
          new EncounterText("\"Gone into the mountain to get supplies after the siege. Back soon. — Olbrim Goldbalm\"", '!'),
          new EncounterText("Valdrisa peers at the note, then at the door, then at the note again. \"The corners are curled. The ink's gone brown. This has been here a while.\"", 'Valdrisa'),
          new EncounterText("\"How long?\" you ask.", '!'),
          new EncounterText("\"Days. The siege has been over for days, and Olbrim is still 'back soon'? Something's wrong.\"", 'Valdrisa'),
          new EncounterText("Thorb crosses his arms. \"Wasn't there s'posed t'be a doctor here? Sittin' behind the counter, askin' too many questions about yer bowels?\"", 'Thorb'),
          new EncounterText("\"That's the one. Olbrim. Apothecary. Best balm man on the mountain.\" Valdrisa lifts the ledger. The last entry is dated weeks ago. \"He wouldn't just walk off. Not without telling someone.\"", 'Valdrisa'),
          new EncounterText("Raena — for once not scowling — actually leans in to read over Val's shoulder. The dragon is dead. Raena's mood, against all odds, is improving.", 'Raena'),
          new EncounterText("\"Side quest,\" Raena says. \"Save a dwarf, get on the good side of the locals. Better than another throne audience. I'm in.\"", 'Raena'),
          new EncounterText("\"Out the main door, then up the mountain,\" Thorb says, already moving. \"Stairs of the Infinite — that's the supply route. He'll be up there if he's anywhere.\"", 'Thorb'),
          new EncounterText("(The Stairs of the Infinite have unlocked from the Grand Hall's Main Entrance.)", '!'),
        ],
      }),
    ]);
}

// Post-dragon dialog — Thorb + Val fire off about the volcano
// stirring back to life and what that means for the great forge.
// Raena plays the long-suffering grown-up. Fires once when the
// player walks onto staircase_top with dragonSlain = true; the
// staircaseTopDragonDialogSeen flag latches it so revisits stay
// quiet. No combat, no loot — pure flavor + nudge toward the
// dwarven forge shops.
export function createPostDragonStaircaseDialogEncounter() {
  return new Encounter('post_dragon_staircase', 'Top of the Staircase',
    'The landing thrums faintly underfoot — somewhere far below, the mountain is stirring.', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText('Thorb stops mid-stride, head tilted toward the floor. He puts a palm flat on the stone and grins like a kid who just heard the ice-cream cart.', 'Thorb'),
          new EncounterText('"Ye feel that? The mountain\'s warmin\' up. The VOLCANO is warmin\' up!"', 'Thorb'),
          new EncounterText('Valdrisa lights up. "That means the great forge is roaring again. The OBSIDIAN FORGE, Thorb. Do you have any idea what they\'ll have on the racks now?"', 'Valdrisa'),
          new EncounterText('"Hammers!" Thorb counts on his fingers. "Axes! New axes! Hammer-axes! Pointy-end-of-everything!"', 'Thorb'),
          new EncounterText('"I want to see what\'s on the rack," Valdrisa says, already bouncing on the balls of her feet. "We have to go. We have to."', 'Valdrisa'),
          new EncounterText('Raena pinches the bridge of her nose. "Gods. They\'re children. We just killed a DRAGON and you\'re drooling over a toy store."', 'Raena'),
          new EncounterText('"It\'s not a TOY STORE, Raena, it\'s a FORGE," Thorb says, in the exact tone of a child explaining that no, it\'s not just any toy, it\'s a LIMITED EDITION toy.', 'Thorb'),
          new EncounterText('Raena sighs. "Fine. Forge it is. Try not to spend all our gold on hammers."', 'Raena'),
        ],
      }),
    ]);
}

// hastily writes them a Letter of Commendation with a hand-pressed
// (clearly not-quite-official) seal. Triggers the post-Kraken tier-1
// level-up via the empty LOOT phase (noLoot + triggersLevelUp routes
// straight into ABILITY_SELECT).
export function createOutpostKrakenReportEncounter() {
  return new Encounter('outpost_kraken_report', 'The South Outpost', 'Gontran is on the gate again. He spots you coming.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Gontran is back on the gate post, leaning on the same crooked spear. He spots you coming up the road and his whole face shifts — relief, surprise, and something else that takes him a second to land on. Probably guilt.', 'Gontran'),
        new EncounterText('"Gods. You\'re alive." He half-trots down the path to meet you, eyes flicking over the state of your gear. Your boots are still damp from the river. There is, very faintly, weed in Thorb\'s beard. "I — when you didn\'t come back yesterday I started preparing myself for the worst. Tell me you found the boat."', 'Gontran'),
        new EncounterText('"We found it," you say.', '!'),
        new EncounterText('"And the crew?"', 'Gontran'),
        new EncounterText('You exchange a look with Raena. Raena, to her credit, manages an expression of solemn grief. Thorb is doing the same expression upside down.', 'Raena'),
        new EncounterText('"There was a thing in the water," you say. "Down by the wreck. Tentacles. Huge. Reached up out of the dark and — well. It was horrible. No survivors. None at all."', '!'),
        new EncounterText('(This is, technically, true. You did not see any survivors. You also did not look very hard, on account of being eaten.)', '!'),
        new EncounterText('"We barely escaped with our lives," Raena adds, which is also technically true.', 'Raena'),
        new EncounterText('"Many tentacles," Thorb confirms grimly. "All bigger than me. Some bigger than two of me. One was big as a house, maybe."', 'Thorb'),
        new EncounterText('"I... gods." Gontran sits down on the barrel one of his guards had been using. The guard quickly produces another barrel. "That\'s — that\'s a kraken. There hasn\'t been a kraken in this river since my grandfather\'s time. I have to send word to Qualibaf. Tonight."', 'Gontran'),
        new EncounterText('He scrubs a hand down his face, then stands again with effort. "Right. Right. The Letter. I promised you a Letter." He disappears into the tower and returns moments later with a hastily-folded sheet of parchment, the ink still wet. He pulls a small ring from his belt pouch, breathes on it, and presses it firmly into a blob of warm wax. The seal that comes out is — generous interpretation — vaguely circular.', 'Gontran'),
        new EncounterText('"There. To the Guildmaster, in Qualibaf. \'In service to the Crown and the South Outpost, the bearer of this letter slew a great beast in the river and is to be afforded every courtesy.\' I\'ve signed it. With my full title." He hands it over with both hands. "It\'s — it should be official enough."', 'Gontran'),
        new EncounterText('Raena examines the seal at arm\'s length. It is, very faintly, the wrong way around. She tucks it away anyway. "Thank you, Gontran."', 'Raena'),
        new EncounterText('"You\'ve earned every word of it." He grips your shoulder, hard. "I owe you, and the south road owes you. Storehouse is still open to you — take whatever you need. And get some rest. Gods know you\'ve earned that too."', 'Gontran'),
      ],
    }),
    // Empty LOOT phase → noLoot branch routes straight into the
    // tier-2 level-up flow (ABILITY_SELECT). No card / no gold to
    // show — the Letter is narrative-only. The kraken kill is a
    // capstone moment, so the offered abilities pull from each
    // class's tier-2 pool to mark the milestone.
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      triggersLevelUp: true,
      levelUpTier: 2,
    }),
  ]);
}

// Watchtower — short canRevisit check-in dialog atop the outpost
// tower. For now a single beat where Gontran asks if the party has
// finished investigating the wreck yet; future passes can branch on
// an investigation flag and route into the reward path. Re-uses the
// south outpost gate art for the backdrop (rendered via the
// ENCOUNTER_BG_MAP override on this encounter id).
export function createWatchtowerCheckEncounter(variant = 'pre_kraken') {
  // Post-Kraken variant — boat business is closed, dialog rotates to
  // Gontran's other open problem: the gnoll pack the trappers warned
  // about. Triggered from startNodeEncounter when krakenLevelUpClaimed
  // has latched (the report has been delivered).
  if (variant === 'post_kraken') {
    return new Encounter('watchtower_check', 'On the Watchtower', 'Gontran is up on the wall, eyes north now.', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText('Gontran is at the north rail this time, looking up the foothill road instead of down the river. He hears your boots and half-turns.', 'Gontran'),
          new EncounterText('"Any news from the gnolls?" you ask.', '!'),
          new EncounterText('"Not yet." He shakes his head, slow. "But we\'re watching. The trapper boys are running a circuit through the high meadow every other day, and I\'m sending a proper patrol up there at the end of the week — three men, full kit. If they\'re moving south, we\'ll see them before they see us."', 'Gontran'),
          new EncounterText('He nods at you. "Thanks to you, I can actually spare the bodies for it. Wouldn\'t have been possible before."', 'Gontran'),
        ],
      }),
    ]);
  }
  // Default pre-Kraken: hopeful check-in about the boat investigation.
  return new Encounter('watchtower_check', 'On the Watchtower', 'Gontran leans on the parapet, scanning the southern road.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You climb the ladder. Gontran is at the south rail, one elbow propped on the worn timber, eyes fixed on the river road.', 'Gontran'),
        new EncounterText('He turns as your boots hit the platform. "Any news?" The hope in his voice is doing its best to sound casual and is not, in fact, succeeding.', 'Gontran'),
        new EncounterText('"Still working on it," you say.', '!'),
        new EncounterText('He nods, more to himself than to you. "Aye. Right. Of course." He turns back to the road. "Come find me the moment you have something. Or — you know — even if you don\'t. It\'s a lonely view from up here."', 'Gontran'),
      ],
    }),
  ]);
}

// Supply Pile — Gontran's storehouse on the way out. Two sequential
// "pick 2 of 3" loot pickers (re-uses the Varimatras-style
// ENCOUNTER_LOOT_PICK flow). The card-id pools are pre-rolled by the
// startNodeEncounter dispatch in main.js and passed in here so the
// offering re-rolls between visits.
export function createSupplyPileEncounter(picker1Cards = [], picker2Cards = []) {
  const phases = [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The storehouse smells of pine resin, old leather, and slightly damp grain. Crates and barrels are stacked higher than three guards on half rations have any business needing.'),
        new EncounterText('"Help yourselves," Gontran called as you walked over. "Anything\'s yours."', 'Gontran'),
      ],
    }),
  ];
  if (picker1Cards.length > 0) {
    phases.push(new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootPickCards: picker1Cards,
      lootPickCount: 1,
    }));
  }
  if (picker2Cards.length > 0) {
    phases.push(new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootPickCards: picker2Cards,
      lootPickCount: 1,
    }));
  }
  return new Encounter('supply_pile', 'The Storehouse', 'Gontran said help yourself.', phases);
}

// Cozy Spot — discoverable fishing minigame south of the outpost.
// Companions banter (lightly mocking the side-quest detour), then the
// player gets a Cast a Line / Pack Up choice loop. Each cast spends a
// recharge from hand and rolls vs a chance that starts at 10% and
// climbs by 10% per attempt. The cumulative chance resets if the
// player leaves; the catch is one-time across the whole save
// (cozySpotFishingCaught flag). Reward TBD.
//
// Factory takes `caught` so the post-success visit shows a quieter
// "great fishing spot, no luck pushing it" dialog without the choice.
export function createCozySpotEncounter(variant = 'first') {
  if (variant === 'caught') {
    return new Encounter('cozy_spot', 'Cozy Spot', 'You\'ve already pulled the catch of the day out of here.', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText('The river slides past the mossy stone in the same patient way it did before. The big one is somewhere downstream now, or possibly in Thorb\'s belly. Either way, this hole has given what it had to give.'),
        ],
      }),
    ]);
  }
  const fishingChoice = new EncounterPhaseData({
    phaseType: EncounterPhase.CHOICE,
    choices: [
      new EncounterChoice(
        'Cast a line (Recharge 1 card)',
        '',
        'fishing_attempt', 1,
        { returnToChoices: true, repeatable: true }
      ),
      new EncounterChoice(
        'Pack up and move on',
        'You roll up the line. The river keeps its secrets — for now.',
        '', 0,
        { completesEncounter: true }
      ),
    ],
  });
  // Revisit: skip the full banter and drop straight onto the fishing
  // choice. The player already met the rock and the joke; they're
  // here because they want to cast a line.
  if (variant === 'revisit') {
    return new Encounter('cozy_spot', 'Cozy Spot', 'Back at the fishing rock.', [fishingChoice]);
  }
  return new Encounter('cozy_spot', 'Cozy Spot', 'A flat stone, a deep pool, a perfect afternoon.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The trail opens onto a wide, flat stone that hangs out over a slow bend in the river. Sun-warmed moss. A pool below that looks deep enough to hide something interesting.'),
        new EncounterText('Thorb stops dead. Stares at the water. Stares at the moss. Stares back at the water.', 'Thorb'),
        new EncounterText('"This," he announces with the gravity of a man delivering a prophecy, "is a fishing rock. If this isn\'t a fishing rock, the gods don\'t want us happy."', 'Thorb'),
        new EncounterText('"We are on a job," Raena says, in the tone of someone who has lost this argument before.', 'Raena'),
        new EncounterText('"We are ALSO on a fishing rock," Thorb counters, already sitting down and rummaging in his pack for line and hook.', 'Thorb'),
        new EncounterText('You look at the river. It looks back at you. Somewhere down there, something flicks a tail.'),
      ],
    }),
    fishingChoice,
  ]);
}

// Cozy Spot Ambush — chains in from a successful fishing roll. While
// the party is hauling in the fish, a Sahuagin Sentinel that's been
// shadowing it bursts up out of the pool. Fight, then take the fresh
// fish home as a trophy. SouthOutpostBG backdrop via ENCOUNTER_BG_MAP.
export function createCozySpotAmbushEncounter() {
  return new Encounter('cozy_spot_ambush', 'The Big One', 'Something else has been watching that fish.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The line goes tight. You set the hook. The fish on the other end is heavy — heavier than it should be — and as you start to pull, you see why.', '!'),
        new EncounterText('A second, much larger shadow is rising out of the deep pool behind it. Scaled. Webbed. Patient. It has been following your meal the whole time.', '!'),
        new EncounterText('"Thorb."', 'Raena'),
        new EncounterText('"I see it."', 'Thorb'),
        new EncounterText('Water explodes off the stone as the Sahuagin Sentinel breaks the surface, trident leveled, eyes fixed on you.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'sahuagin_sentinel',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['fresh_fish'],
    }),
  ]);
}

// River Cave Mouth arrival — first time the party walks onto the
// lake shore from river_trail_south. Short reveal beat: the river
// widens into a still lake and the merchant ship Gontran asked them
// to find is sitting dead center, listing badly.
export function createRiverCaveMouthEntryEncounter() {
  return new Encounter('river_cave_mouth_entry', 'River Cave Mouth', 'The river opens out.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The trees fall back. The current slows. Then — almost without warning — the river isn\'t a river at all anymore, but a long, still lake cupped between low limestone cliffs. The far end disappears into the dark mouth of a cave you can\'t quite see the bottom of from here.'),
        new EncounterText('Halfway out, dead center on the water, a merchant cog sits at a slightly wrong angle. The mast leans further than any mast should. The hull tilts. It has not moved in days.'),
        new EncounterText('"There," Raena says quietly. "That\'s our boat."', 'Raena'),
        new EncounterText('Thorb squints across the lake. "Caught on a rock by the look of it. Bottom must come up like a fist out there." He scratches his beard. "Doesn\'t explain why nobody\'s climbing off it, though."', 'Thorb'),
        new EncounterText('No smoke. No movement. No bodies on the rail. Just the lap of water against a hull that should not be where it is.'),
      ],
    }),
  ]);
}

// Vantage Point — one-shot dialog on the second shore node. Spots
// the strange birds circling the mast (bad omen), then Raena lays
// out the reef-crossing plan and Thorb pitches the assault on the
// stranded cog. Player gets the "feel like getting a bit wet?" beat
// before they start hopping the rock chain.
export function createLakePath2Encounter() {
  return new Encounter('lake_path_2', 'Closer to the Wreck', 'The cog looms ahead.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Closer in, you can see the ship in detail. The hull is scarred with long gouges — the kind a hidden reef leaves when a captain doesn\'t see it in time. The mast leans a good twenty degrees off true. The flag at the top hangs limp.'),
        new EncounterText('And circling the top of that mast — gliding, never landing — are a half-dozen dark birds. Wings too long. Heads too pointed. They make no sound at all.', '!'),
        new EncounterText('"That\'s..." Thorb starts. Stops. Tries again. "That\'s not just birds. Those aren\'t just birds, are they."', 'Thorb'),
        new EncounterText('"Old sailors\' word for it," Raena says quietly. "Bad omen. They wait for things." She does not finish that sentence.', 'Raena'),
        new EncounterText('She points instead — out across the lake — to a chain of stones breaking the surface. A path. The reef the ship caught on, you realize: a sunken ridge running half across the lake, with a clean channel where boats once threaded through.', 'Raena'),
        new EncounterText('"We can hop most of it. Bit of a swim through the channel in the middle — nothing serious." She glances sideways. "Feel like getting a bit wet?"', 'Raena'),
        new EncounterText('"Once we\'re on the far side," Thorb adds, eyeing the listing cog with a kind of grim cheerfulness, "we can pick our way up and have a proper look at what\'s aboard. Or," he adds, watching the birds, "what isn\'t."', 'Thorb'),
      ],
    }),
  ]);
}

// Outpost Tent — two variants:
//   pre-Kraken (default): a one-time short rest (+5 heal). Latches
//     outpostTentRested so the dialog doesn't refire.
//   post-Kraken ('post_kraken'): re-armed as a FULL rest. Gontran
//     offers the tent for as long as the party wants to stay, since
//     the boat job is done. Each rest re-spawns the southern monster
//     encounters (frog ambushes, harpy revisit, cozy spot fishing).
export function createOutpostTentEncounter(variant = 'pre_kraken') {
  if (variant === 'post_kraken') {
    return new Encounter('outpost_tent', 'Resting Tent', 'Gontran gestures at the tent — stay as long as you like.', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText('The tent\'s still here, bedroll still folded. Gontran catches you eyeing it and waves a hand.', 'Gontran'),
          new EncounterText('"Aye, take it. Take it as often as you like. The boat job\'s done — if you want to stay a while longer, the tent\'s yours. Patrol shift\'s mine. You earned a proper sleep."', 'Gontran'),
          new EncounterText('A proper rest, this time. The kind where you actually wake up feeling like a person.'),
        ],
      }),
      new EncounterPhaseData({
        phaseType: EncounterPhase.CHOICE,
        choices: [
          new EncounterChoice(
            'Take a full rest',
            'You sleep deep, eat well, and roll out at dawn ready for whatever\'s next. Word from Gontran: the frog\'s back at the rock, harpies have crept back onto the wreck, and a fresh fish has been sighted at the cozy spot.',
            'outpost_tent_full_rest', 0,
            { completesEncounter: true }
          ),
          new EncounterChoice(
            'Maybe later',
            'You nod and step back out into the yard. The tent will keep.',
            '', 0,
            { completesEncounter: true }
          ),
        ],
      }),
    ]);
  }
  return new Encounter('outpost_tent', 'Resting Tent', 'A spare canvas tent, a folded bedroll.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('A small canvas tent inside the palisade — folded bedroll, a clay water flask, a stub of candle on a tin plate. Whoever set this up evidently meant for the relief that never arrived to use it.'),
        new EncounterText('You could grab an hour or two. Nothing fancy, but enough to take the edge off.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Take a short rest',
          'You stretch out on the bedroll for a quiet hour. The aches ease back a little.',
          'outpost_tent_rest', 5,
          { completesEncounter: true }
        ),
        new EncounterChoice(
          'Move on',
          'You leave the tent for whoever needs it next.',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ]);
}

// South Hill — recon beat on the far shore. The party crouches in
// the brush watching the cog; Thorb realises the birds are bigger
// (and have feet) than they look from across the water. One-shot,
// then offers a short rest (Heal 5) or jump straight into the assault.
export function createSouthHillEncounter() {
  return new Encounter('south_hill', 'South Hill', 'Cover in the brush.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You drop to a crouch at the crest of the hill. The brush is thick enough to hide three travelers and a dwarf-shaped opinion about birds. The cog is close now — close enough to see paint flaking off the rail.'),
        new EncounterText('Thorb shades his eyes with one hand. Watches for a long moment.', 'Thorb'),
        new EncounterText('"Hey." His voice is very level. "Those birds. Those birds are pretty big, right?"', 'Thorb'),
        new EncounterText('"Mm," Raena says, not looking away.', 'Raena'),
        new EncounterText('"And they have... do they have legs? Tell me they don\'t have legs."', 'Thorb'),
        new EncounterText('"They have legs."', 'Raena'),
        new EncounterText('A short, contemplative silence.', '!'),
        new EncounterText('"Right." Thorb hefts his axe and gives it an experimental swing. "Let\'s go find out what they\'re waiting for."', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Rest a bit before going in',
          'You drop your packs in the brush and take a few quiet minutes. Water. Bandage check. Slow breath. The cog isn\'t going anywhere.',
          'south_hill_rest', 5,
          { completesEncounter: true }
        ),
        new EncounterChoice(
          "No need to rest — let's go get some chickens!",
          'Thorb grins like a man who has been waiting all morning for permission. "That\'s the spirit."',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ]);
}

// Wreckage Harpy Revisit — short re-encounter that fires when the
// party walks back onto the cog after a rest (harpiesDefeated flag
// reset). Skips the bird-reveal banter; just spawns the harpies
// straight into combat.
export function createWreckageHarpyRevisitEncounter() {
  return new Encounter('wreckage_harpy_revisit', 'They\'re Back', 'The nest never stays empty.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You climb back onto the listing deck. The mast is empty for half a heartbeat — then the song starts up again, low and wrong, and the dark shapes come gliding back down out of the rigging.'),
        new EncounterText('"They\'re BACK," Thorb mutters. "Of course they\'re back."', 'Thorb'),
        new EncounterText('Raena unslings her staff. "Same as last time, then."', 'Raena'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'harpies',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['harpies_loot'],
    }),
  ]);
}

// Wreckage Arrival — boarding the listing cog. Funny escalation:
// the nest at the masthead is enormous; the birds aren't birds at all;
// the song carries on the wind and ohhh no, harpies. Drops into the
// Harpy combat (invulnerable boss + 3 summons) after the reveal.
export function createWreckageArrivalEncounter() {
  return new Encounter('wreckage_arrival', 'On the Deck', 'You climb aboard.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You haul yourselves up the listing hull and onto the deck. Up close, the smell hits first — salt, tar, and something else. Something organic. Something that has been there a while.'),
        new EncounterText('The nest at the masthead is bigger than you thought. Much bigger. Big enough that "nest" feels like the wrong word for it.', '!'),
        new EncounterText('And the birds — the things you took for birds — are not birds.', '!'),
        new EncounterText('They have legs. Long ones. Bent the wrong way at the knee.', '!'),
        new EncounterText('They have faces. Pale, hungry, almost-human faces ringed in oily black feathers.', '!'),
        new EncounterText('And the sound they make — that wailing, alluring, half-musical keening drifting down from the rigging — is not a bird call. It is a song. A song aimed at YOU.', '!'),
        new EncounterText('"Oh," Raena breathes, very softly. "Oh no."', 'Raena'),
        new EncounterText('"What?" Thorb says. "WHAT?"', 'Thorb'),
        new EncounterText('"Harpies." She is already drawing her staff. "Thorb. They\'re HARPIES."', 'Raena'),
        new EncounterText('Thorb stares at the nest. "Right. So. Not chickens, then."', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'harpies',
    }),
    // Pick 2 distinct drops from the harpies_loot table (rolled
    // again on each rest-reset re-fight via the revisit encounter).
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['harpies_loot'],
    }),
    // After the fight: catch-your-breath beat with an optional Heal 5
    // short rest (same resolver as the South Hill pre-board rest).
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The last harpy crumples against the rail. Feathers settle on the deck. The wind stops trying to sing.', '!'),
        new EncounterText('Thorb sits down heavily on a coil of rope and blows out a long breath. Raena is already checking the others over for wounds.', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Catch your breath before pressing on',
          'You sit a minute. Water and bandages. The deck stops listing in your head, at least.',
          'south_hill_rest', 5,
          { completesEncounter: true }
        ),
        new EncounterChoice(
          'No time — keep moving',
          'You shoulder your gear and step over the bodies.',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ]);
}

// Ship Chest — one-time auto-loot at the deepest deck node. Card ids
// are pre-rolled in startNodeEncounter (main.js): 2 random items
// sampled across the four staple shops (armorsmith, weaponsmith,
// arcane_emporium, general_store). Reward placeholder until the
// harpy fight content lands proper.
export function createShipChestEncounter(lootIds = []) {
  return new Encounter('ship_chest', 'The Deck Chest', 'Iron-banded, wedged tight, somehow intact.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You pry the lid open. Whatever was looking after this chest had better taste than the things upstairs — the lock is real, the wood is oiled, and the contents have not been picked over.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: lootIds,
    }),
    // Post-loot ambush: the bridge erupts, tentacles drag the party
    // down through the hull, and a squid-thing waits in the dark
    // water inside the wreck. Per-text bgOverride flips the backdrop
    // from the deck plan to the interior-breach art mid-scene.
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You straighten up with the haul in hand. Thorb is already grinning. Raena is already nodding. For a single, beautiful heartbeat the job is almost done.', 'You'),
        new EncounterText('Then the bridge above you EXPLODES.', '!'),
        new EncounterText('Splinters fly. A sound like a tree being snapped in half. Black, slick, horse-leg-thick tentacles burst through the planking and lash down across the deck.', '!'),
        new EncounterText('One wraps your waist. Another whips around Thorb\'s shoulders. A third loops Raena\'s ankle and lifts. The deck tilts wrong, then it isn\'t under you at all.', '!'),
        new EncounterText('You\'re not falling — you\'re THROWN — through the splintered hole and down into the dark water inside the hull.', '!'),
        new EncounterText('Cold water closes over your head with a roar.', '!', 'bg_shipwreck_inside'),
        new EncounterText('You break the surface inside the wreck. Daylight knifes down through the hole you came through. Everything else is shadow and slow-moving water.', 'You', 'bg_shipwreck_inside'),
        new EncounterText('Something huge shifts below you. A pale, slitted eye the size of a dinner plate fixes on you from the gloom. Tentacles uncoil out of the dark — and one of them is already wrapped around your ankle, tightening, dragging you down.', '!', 'bg_shipwreck_inside'),
        new EncounterText('"WE HAVE A PROBLEM," Thorb bellows from somewhere off to your right.', 'Thorb', 'bg_shipwreck_inside'),
        new EncounterText('You drag your weapon out of the water and brace. This is going to be bloody.', 'You', 'bg_shipwreck_inside'),
      ],
    }),
    // Kraken Spawn — boss combat fires straight off the splash
    // dialog. Player is now in the water; the swim_drag debuff is
    // wired in applyStartOfCombatBuffs (kraken_spawn enemyId trigger).
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'kraken_spawn',
    }),
    // Salvage pick — six tier-1 epics from the wrecked hold, party
    // picks 2 distinct. Mirrors the Varimatras dragon-loot picker
    // (lootPickCount + lootPickCards).
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      phaseTitle: "Wreckage Salvage",
      lootTitle: "Wreckage Salvage",
      lootPickCount: 2,
      lootPickCards: [
        'bloody_eye_patch',
        'harpoon_of_the_deep',
        'tentacle_whip',
        'sailors_lucky_compass',
        'krakens_eye_spyglass',
        'barnacle_covered_buckler',
      ],
    }),
    // Post-kraken — ship breaks apart, party swims for shore. Hooked
    // into the post-encounter dispatch in main.js (ship_chest case)
    // which teleports the party back to South Hill on south_of_qualibaf.
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The last tentacle goes limp. The water around you boils with dying things, then settles.', '!'),
        new EncounterText('Above you, the hull groans like a wounded animal. A spar snaps. Then another. The whole cog is coming apart.', '!'),
        new EncounterText('"OUT!" Raena barks. "Out, out, OUT!"', 'Raena'),
        new EncounterText('You haul yourself through the splintered hole, kick away from the wreck as a section of the deck collapses inward, and strike out for the south shore. The water is cold. The swim is short. The brush on the hill is the most welcome thing you have ever seen.'),
      ],
    }),
  ]);
}

// Giant Frog Ambush — fires when the party arrives at one of the
// 2 randomly-placed frog rocks on the reef chain. First ambush per
// save plays the full reveal dialog; subsequent ambushes (player
// already met one) drop into a 1-beat "ANOTHER frog?!" splash and
// straight into combat. Backdrop is the lake-rock-formation art so
// the fight reads as taking place ON the reef itself.
export function createGiantFrogAmbushEncounter(short = false) {
  const texts = short
    ? [
        new EncounterText('Water explodes in front of you AGAIN. Another tongue. Another slab. Another giant slimy face staring at you out of the lake.', '!'),
        new EncounterText('"ANOTHER ONE?!" Thorb howls.', 'Thorb'),
        new EncounterText('Less talk, more fight.'),
      ]
    : [
        new EncounterText('You\'re halfway through the swim to the next stone when the water in front of you EXPLODES.', '!'),
        new EncounterText('Something pink, wet, and absurdly long whips out of the lake and slaps around your waist before you can register what you\'re looking at. It yanks. Hard.', '!'),
        new EncounterText('You go under for half a second, come up coughing, and find yourself dragged backwards onto a flat slab of slick black rock — face to face with the biggest frog you have ever seen.', '!'),
        new EncounterText('"OH COME ON," Thorb roars, axe already out. "We have to FIGHT a frog now?"', 'Thorb'),
        new EncounterText('The frog\'s throat balloons. Acid sizzles between its teeth. Behind it, a writhing pile of egg-things twitches.', '!'),
        new EncounterText('Looks like we\'re fighting our way back to the rocks.'),
      ];
  return new Encounter('giant_frog_ambush', 'Something in the Water', 'A tongue uncoils.', [
    new EncounterPhaseData({ phaseType: EncounterPhase.TEXT, texts }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'giant_frog',
    }),
    // Guaranteed loot — weighted pick across Toxic Frog Extract
    // (common), Frog Skin Boots (uncommon), Frog Nursery (rare).
    // Roll happens via the giant_frog_loot table in main.js.
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['giant_frog_loot'],
    }),
  ]);
}

export function createSouthGateEncounter() {
  // Mirrors PY create_south_gate_encounter, tightened: 7 beats → 5,
  // sensory details kept (fishing boats / terraced fields / blue
  // tabards / bread + woodsmoke) plus the Thorb-and-Raena banter.
  return new Encounter('south_gate', 'The South Gate', 'Qualibaf at last.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The road widens as you approach the city. Fishing boats bob on the river to your left; terraced grain climbs the hills to your right, tended by figures who pause to wave.'),
        new EncounterText('The South Gate stands open, iron-banded doors thrown wide. Guards in blue tabards watch you come, leaning easy on their spears — curious, but unalarmed. One nods you through.'),
        new EncounterText('The city washes over you all at once: merchants calling, children shrieking with laughter, cart wheels rattling on cobblestone. Fresh bread and woodsmoke. A wave of bone-deep relief — from the prison cell, through the sewers and the rapids and the Sahuagin, you made it. Qualibaf is real and solid around you.'),
        new EncounterText('"DRINKS!" Thorb roars, loud enough to turn every head on the street. He clamps both hands on a baffled merchant\'s shoulders. "Hot food! A bath! Where\'s the nearest tavern, friend? I\'ve got a thirst could drain that river we just crossed!"', 'Thorb'),
        new EncounterText('Raena shakes her head, but she\'s smiling. "Guild hall first — there are people who need to hear what we found beneath those ruins." She glances sideways at you, and the smile widens. "...but perhaps a meal on the way. We\'ve earned that much."', 'Raena'),
      ],
    }),
    // PY mirror: empty-loot phase with triggers_level_up + a yellow
    // "Welcome to Qualibaf!" title. The level-up flow opens after the
    // banner. Encounter-complete handler then teleports the party to
    // city_south_gate and shows the Chapter 4 title card.
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: [],
      lootTitle: 'Welcome to Qualibaf!',
      triggersLevelUp: true,
    }),
  ]);
}

export function createSahuaginSentinelEncounter() {
  // Mirrors Python create_sahuagin_sentinel_encounter — 6 narrative
  // beats on the pool's stone ledge, sentinel rises and charges,
  // combat, then loot.
  return new Encounter('sahuagin_sentinel', "The Pool's Edge", 'Something lurks in the dark water.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You drag yourself onto the stone ledge, gasping and bleeding from a hundred tiny bites. The piranhas circle in the water below, but they don\'t follow onto the rock. You\'re safe.'),
        new EncounterText('For a moment, there is only the sound of your ragged breathing and the distant roar of the waterfall. The air is warm and heavy. Ancient stone pillars frame the pool, half-swallowed by moss and time.'),
        new EncounterText('Thorb collapses against a pillar, wringing water from his beard. "Never... again..." he wheezes. You allow yourself a moment to breathe. Just one moment.', 'Thorb'),
        new EncounterText('Then you hear it. A low, wet sound cutting through the water. Not the frantic thrashing of piranhas — something bigger. Something deliberate. A dark shape glides just beneath the surface, circling the edge of the pool with terrible patience.', '!'),
        new EncounterText('It rises. Scaled skin glistening in the dim light. Webbed claws grip a barbed trident. Cold, unblinking eyes fix on you from a face that is part fish, part nightmare. Water streams from its crested skull as it draws itself to full height.', '!'),
        new EncounterText('The creature lets out a guttural hiss — a sound like stone dragged across wet metal — and CHARGES, trident leveled at your chest!', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'sahuagin_sentinel',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      lootCards: ['sahuagin_sentinel_loot'],
    }),
  ]);
}

// ============================================================
// City Shop Encounters
// ============================================================

export function createCitySquareEncounter() {
  return new Encounter('city_square', 'City Square', 'The heart of Qualibaf.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The City Square opens before you - a wide cobblestone plaza ringed by merchant stalls and old stone buildings. A fountain burbles at its center, carved in the shape of a leaping fish.'),
        new EncounterText('Townsfolk go about their business, haggling over prices, loading carts, and sharing gossip. After the darkness of the ruins, the ordinary bustle of city life feels almost surreal.'),
        new EncounterText('Market stalls line the edges of the square, selling fresh food and provisions. To the west you can see the Weaponsmith\'s forge and the Armorsmith\'s workshop. Signs point toward the Inn, General Store, and Guild Hall.'),
      ],
    }),
  ]);
}

export function createWeaponsmithEncounter() {
  return new Encounter('weaponsmith', 'Weaponsmith', 'A master of blade and steel.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The forge radiates heat as you step inside. A broad-shouldered woman works the bellows, sending sparks cascading across the stone floor. Swords, axes, and spears hang from every wall.'),
        new EncounterText('She glances up, appraising you with a smith\'s eye. "You look like you\'ve seen some trouble. Dull blades and bent steel, I\'d wager." She sets down her tongs. "Let\'s see what I can do for you."', 'Weaponsmith'),
      ],
    }),
  ]);
}

export function createArmorsmithEncounter() {
  return new Encounter('armorsmith', 'Armorsmith', 'Protection for those who can afford it.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The Armorsmith\'s workshop is quieter than the forge next door. A wiry man with careful hands works leather and chain into fitted pieces. Mannequins display his finest work - gleaming breastplates and reinforced shields.'),
        new EncounterText('"Adventurers, eh?" He looks you over with professional interest. "That gear\'s seen better days. I can patch it up, or fit you with something new if your coin purse allows."', 'Armorsmith'),
      ],
    }),
  ]);
}

export function createGeneralStoreEncounter() {
  return new Encounter('general_store', 'General Store', 'Everything an adventurer might need.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The General Store is a maze of shelves crammed floor to ceiling with supplies - rope, torches, rations, healing herbs, and dozens of things you can\'t identify. A bell chimes as you enter.'),
        new EncounterText('A cheerful halfling appears from behind a towering stack of crates. "Welcome, welcome! Everything you need for the road ahead - and plenty you didn\'t know you needed! Browse freely, friends."', 'Shopkeeper'),
      ],
    }),
  ]);
}

export function createInnEncounter() {
  return new Encounter('inn', 'The Rusty Anchor', 'A warm tavern with cold drinks.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The Rusty Anchor Inn lives up to its name - a weathered ship\'s anchor hangs above the door, and the interior smells of salt, ale, and roasting meat. A fire crackles in a massive stone hearth.'),
        new EncounterText('Thorb is already at the bar before you\'ve finished crossing the threshold. "THREE ales! No - FOUR! And whatever\'s on that spit!" He slams coins on the counter with the enthusiasm of a man who hasn\'t had a proper drink in weeks.', 'Thorb'),
        new EncounterText('The innkeeper, a weathered woman with kind eyes, slides mugs across the bar. "You lot look like you\'ve got stories to tell. First round\'s on the house for anyone brave enough - or foolish enough - to come from the south road."'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The inn has warm beds and a crackling fire. Rest here?',
      choices: [
        new EncounterChoice(
          'Rest here (5 GP)',
          '',
          'inn_rest', 5
        ),
        new EncounterChoice(
          'Not now',
          'You enjoy the atmosphere but decide not to stay. Perhaps another time.',
          '', 0
        ),
      ],
    }),
  ]);
}

export function createChurchEncounter() {
  return new Encounter('church', 'The Chapel of Light', 'A small, calm local church.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The chapel is small but well-kept, its stone walls softened by the warm glow of dozens of candles. Stained glass windows cast colored light across worn wooden pews. The air smells of incense and old wood.'),
        new EncounterText('A lone priest tends to the altar, arranging fresh flowers. He notices you and smiles warmly. "Welcome, traveler. The chapel is open to all who seek guidance or solace. If you wish to make an offering, the divine may grant you a blessing."'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The altar glows faintly. Will you make an offering?',
      choices: [
        new EncounterChoice(
          'Pray and donate (50 GP)',
          'You kneel before the altar and place your offering. A warm light washes over you, and you feel a surge of divine knowledge flow through your mind.',
          'pray_church', 50
        ),
        new EncounterChoice(
          'Just visit',
          'You sit quietly in the pews for a while, enjoying the peaceful atmosphere. Perhaps another time.',
          '', 0
        ),
      ],
    }),
  ]);
}

export function createArcaneEmporiumEncounter() {
  return new Encounter('arcane_emporium', 'The Arcane Emporium', 'A shop of magical curiosities.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Crystals float in the window display, casting prismatic light across shelves lined with scrolls, wands, and bottled starlight. The air hums with faint arcane energy.'),
        new EncounterText('A tall elf with silver-streaked hair looks up from an ancient tome. His eyes widen slightly as he notices your companion. "Raena? It\'s been... years. I thought you were still in the Silverwood." He smiles warmly. "Please, browse freely — any friend of Raena\'s is welcome here."', 'Elarion'),
      ],
    }),
  ]);
}

// First-visit antiquity-shop encounter: Grimbold begs for help → choice →
// pre-combat creep → Mimic fight → post-combat thanks. After this encounter
// completes the auto-shop hook in main.js opens Grimbold's storefront and
// flips the antiquityShopCleared flag so future visits skip straight to
// the cleared variant.
export function createAntiquityShopEncounter() {
  return new Encounter('antiquity_shop', "Grimbold's Antiquities", 'A dusty shop of ancient relics.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("A crooked sign reads 'Grimbold's Antiquities' above a narrow doorway. As you approach, a frantic gnome with wild white hair and ink-stained fingers bursts out, waving his arms."),
        new EncounterText('"Don\'t go in there! There\'s a - a THING in my shop! It came through the cellar last night and now it won\'t leave! It\'s eating my inventory!"', 'Grimbold'),
        new EncounterText('"Wait, how does a monster just... get into a shop in the middle of a city? Don\'t you have guards for this sort of thing?"', 'Raena'),
        new EncounterText('"HA! A monster in a SHOP! This is the best city ever! Can I fight it? Please say I can fight it."', 'Thorb'),
        new EncounterText('The gnome wrings his hands nervously. "The guards said they\'d send someone but that was two days ago. If you could deal with it, I\'d be most grateful - and I\'d open my shop to you!"'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'A monster has taken over the Antiquity Shop.',
      choices: [
        new EncounterChoice(
          'Clear out the monster',
          'You draw your weapons and push through the doorway. Inside, overturned shelves and scattered relics litter the floor. Something moves in the shadows...',
          'antiquity_fight', 0
        ),
        new EncounterChoice(
          'Not right now',
          "You promise the gnome you'll come back when you're ready. He nods anxiously.",
          'antiquity_leave', 0
        ),
      ],
    }),
    // Pre-combat — discovering the Mimic.
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("You step carefully through the dim shop, squinting past toppled shelves and shattered display cases. Dust motes float in the thin light. You can't see any creature."),
        new EncounterText('"Where is it? I don\'t see anyth-"', 'Raena'),
        new EncounterText("A large ornate chest in the corner suddenly EXPLODES open - revealing rows of enormous teeth and a massive, slavering tongue. The chest wasn't a chest at all. It lunges at you!"),
        new EncounterText('"MIMIC! That\'s a MIMIC! I LOVE this shop!"', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'mimic',
    }),
    // Post-combat — Grimbold opens up shop.
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The Mimic collapses into a heap of splintered wood and teeth, its disguise dissolving into goo. Grimbold peeks through the doorway, then rushes in.'),
        new EncounterText('"A Mimic! In MY shop! That explains where my best chest went... and several rare artifacts along with it. But at least it\'s safe now. Thank you! As promised, you\'re welcome to browse my wares anytime. I have... unique items you won\'t find elsewhere."', 'Grimbold'),
      ],
    }),
  ]);
}

// Subsequent-visit short variant — opens the shop directly after one beat.
export function createAntiquityShopClearedEncounter() {
  return new Encounter('antiquity_shop_cleared', "Grimbold's Antiquities", 'A dusty shop of ancient relics, now monster-free.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Grimbold greets you warmly from behind a counter piled high with curious objects. "Welcome back, friends! Have a look around — everything\'s one of a kind!"'),
      ],
    }),
  ]);
}

// Adventurer's Guild — Aldric Voss briefs the party on the White Claw and
// dispatches Thorb to Tharnag. Completing this encounter unlocks the
// city's North Gate (see the post-encounter hook in advanceEncounterPhase).
export function createGuildHallEncounter() {
  return new Encounter('guild_hall', 'Guild Hall', 'The Guild Hall of Qualibaf.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("We should try to talk to the Guild Master and warn him about the kobold presence near the bridge on the Frontier road. That whole region is dangerous to travel now. Let's go meet them at the Guild Hall.", 'Raena'),
        new EncounterText('"Leave it to me! I\'ll petition them directly - they can\'t refuse a quick audience with one of their dwarf allies!"', 'Thorb'),
        new EncounterText("After some back and forth with the clerks, Thorb's stubborn insistence pays off. You are led through the Guild Hall's grand corridors to the chambers of Aldric Voss, the Guildmaster of Qualibaf. A broad-shouldered, middle-aged man with a trimmed grey beard and sharp, calculating eyes. Despite his size, he carries himself with the measured calm of someone used to making difficult decisions."),
        new EncounterText('"I was told that you bring news of troubles in the north? Please, tell me everything. Is that why we have not seen any dwarf merchants in a while?"', 'Aldric Voss'),
        new EncounterText('"Yes, my Lord. A kobold army, bearing the symbol of the White Claw, has destroyed the bridge north of here. They are organized and almost certainly have nefarious intent!"', 'Raena'),
        new EncounterText('You recount the details of your journey - the kobold patrols, the army encampment, the battle at the bridge. You mention the unseasonable cold and the light snowfall in the northern hills, weather that has no business appearing this time of year.'),
        new EncounterText('Aldric listens intently, his expression growing darker with each detail. He leans back in his chair and strokes his beard. "The White Claw... I had hoped those rumors were exaggerated. A destroyed bridge means our northern trade routes are severed. And this unnatural cold you describe - that troubles me most of all."', 'Aldric Voss'),
        new EncounterText('"I will dispatch scouts south to rally the settlements and put the garrisons on alert. But we need the dwarves. Thorb, you must travel to Tharnag — enlist their aid and warn them of what is coming. If the White Claw moves in force, we cannot hold without dwarf steel at our side."', 'Aldric Voss'),
        new EncounterText('"Tharnag is northeast, on this side of the river. We should leave by the North Gate once we are well prepared."', 'Raena'),
        new EncounterText('"Aye, but let\'s make sure we rest at the inn before we go. It\'s a long journey ahead — no sense starting it half-dead."', 'Thorb'),
      ],
    }),
  ]);
}

// Guild Hall — Heroes of Qualibaf celebration. Fires once when the
// party walks back into the guild hall after killing Varimatras
// (gated on dragonSlain + !heroesOfQualibaf in the click handler).
// Aldric Voss receives the party as heroes; the inn rest goes free
// for life via the heroesOfQualibaf flag (see resolveInnRest in
// main.js).
export function createGuildHallVictoryEncounter() {
  return new Encounter('guild_hall_victory', 'Heroes of Qualibaf', 'A hero\'s welcome at the Guild Hall.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You walk back into the Guild Hall with snow still in your cloaks and soot under your fingernails. Word has clearly outrun you — the clerks at the desk are on their feet, the corridor lined with apprentices craning to see, the air buzzing.'),
        new EncounterText('Aldric Voss is already striding down the great hall to meet you, beard ringed in heavy silver, grin you would not have thought his face could hold.', '!'),
        new EncounterText('They told me. They told me you actually DID it. The mountain, the kobold-witch, and — what does the dwarven runner keep saying — a WHITE DRAGON?', 'Aldric Voss'),
        new EncounterText('"All of it, Guildmaster. And the volcano is singing again. The forge is lit. The valley\'s warming as we speak."', 'Raena'),
        new EncounterText('"The cold that was killing our crops — done. The bridge can be rebuilt. The trade road can open. Qualibaf can BREATHE again."', 'Aldric Voss'),
        new EncounterText('He turns to the hall. Hundreds of guildsfolk and onlookers have crowded in — merchants, smiths, the South Gate captain, half the city council.', '!'),
        new EncounterText('By the authority of the Adventurer\'s Guild, and with every voice in this room behind me — you stand as Heroes of Qualibaf. From this day forward your name carries a warrant of the city.', 'Aldric Voss'),
        new EncounterText('Cheers. Stamping boots. Someone starts a horn-song that gets the whole hall going. Thorb is hugged off his feet by a stranger.', '!'),
        new EncounterText('"Practical matters, hero. The Greedy Goblin Inn — and every inn on the South Road — has been notified. You and yours rest under their roofs at no charge, for life. You earned a thousand warm beds."', 'Aldric Voss'),
        new EncounterText('"…I might use ALL of them. Just so we\'re clear."', 'Thorb'),
        new EncounterText('"There is more coming, of course. The Deep Roads stir. The Drow we cannot un-see. But not tonight. Tonight — eat, drink, sleep. Qualibaf owes you the rest."', 'Aldric Voss'),
        new EncounterText('You leave the Guild Hall with the cheer of the city at your back and a long, warm night ahead. Whatever Part 2 brings can wait until morning.', '!'),
      ],
    }),
  ]);
}

// North Gate exit cinema — once unlocked by the Guild Hall, walking the
// node out plays the PY 3-beat departure dialog and the post-encounter
// hook hops the party to the North Qualibaf map.
export function createCityNorthGateEncounter() {
  return new Encounter('city_north_gate', 'The North Gate', 'Leaving Qualibaf through the northern gate.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The North Gate is less trafficked than the South. A pair of guards wave you through with barely a glance. Beyond the walls, the road narrows and winds northeast through rolling farmland toward the distant tree line.'),
        new EncounterText('"Keep your eyes open. Kobold patrols have been spotted on the roads north of the city. We\'ll need to stay sharp until we reach Tharnag."', 'Raena'),
        new EncounterText('The wind carries the faint scent of pine and woodsmoke. Qualibaf shrinks behind you as the road stretches onward. Whatever lies ahead, you face it rested and ready.'),
      ],
    }),
  ]);
}

// ============================================================
// North Qualibaf Encounters
// ============================================================

export function createNorthCrossroadEncounter() {
  return new Encounter('north_crossroad', 'North Crossroad', 'A crossroad outside the city', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You stand at a crossroad just north of Qualibaf. The city walls are still visible behind you, but ahead the road splits.'),
        new EncounterText('To the east, a forest path disappears into the shadows of Filibaf Forest. The trees loom dark and ancient, their branches intertwined overhead.'),
      ],
    }),
  ]);
}

export function createFilibafEntranceEncounter() {
  return new Encounter('filibaf_entrance', 'Filibaf Entrance', 'The entrance to Filibaf Forest', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You stand at the edge of Filibaf Forest. The trees tower overhead like silent sentinels, their gnarled trunks draped in moss and shadow.'),
        new EncounterText('The air is thick and damp, carrying the earthy scent of decay and growth intertwined. The path ahead is barely more than a game trail.'),
        new EncounterText('From deep within the forest comes the sound of skittering — many legs moving quickly across dry leaves. Something is watching from the darkness between the trees.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Enter the forest',
          'You steel your nerves and step beneath the canopy. The light dims immediately, swallowed by the dense foliage above.',
          'enter_filibaf', 1
        ),
        new EncounterChoice(
          'Turn back',
          'You step away from the treeline. The forest can wait.',
          '', 0
        ),
      ],
    }),
  ]);
}

// ============================================================
// Forest Encounters
// ============================================================

// First-visit Forest Shadows — Thorb explains the maze rule (more
// spiders = correct path).
export function createForestShadowsEncounter() {
  return new Encounter('forest_shadows', 'Shadowed Path', 'The path splits into shadow.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The path narrows and splits around a massive fallen tree. Thick webs glint between the branches on both sides. Two shadowed trails diverge into the gloom. Countless eyes watch from the canopy above.'),
        new EncounterText('Do you know your way through this forest? The paths branch in every direction and I can feel many eyes watching our every move.', 'Raena'),
        new EncounterText('Hmm. I usually travel underground, but when I was young I crossed this forest with my father. I remember that the spiders near the edge were few in number. As we went deeper, the nests grew larger and the swarms thicker.', 'Thorb'),
        new EncounterText("So if we're on the right path, we should see more spiders the deeper we go?", 'Raena'),
        new EncounterText("Aye. Fewer spiders means we've gone astray and circled back toward the edge. More spiders means we're heading the right way — deeper into their territory.", 'Thorb'),
        new EncounterText("Wonderful. I hope you're right about that.", 'Raena'),
      ],
    }),
  ]);
}

// Short Forest Shadows reminder shown on every loop after the first
// (mirrors PY create_forest_shadows_revisit_encounter).
export function createForestShadowsRevisitEncounter() {
  return new Encounter('forest_shadows', 'Shadowed Path', 'The path splits into shadow.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The path splits once more. Webs glint between the branches on both sides.'),
        new EncounterText("Remember — the number of spiders should increase as we go deeper! Fewer spiders means we've taken a wrong turn.", 'Thorb'),
      ],
    }),
  ]);
}

// Forest Clearing — final exit when the player has loop_level >= 4 AND
// picks the correct path. PY parity: 3-beat narration, then a 3-way
// choice (Search the remains / Short rest / Leave). Search and Rest
// are one-time-use (returnToChoices grays them out after picking).
// Leave triggers the post-encounter hook in main.js that scrubs Web
// tokens and transitions to Tharnag. Korgan companion intentionally
// not ported yet.
export function createForestClearingEncounter() {
  return new Encounter('forest_clearing', 'Forest Clearing', 'The trees thin out ahead.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The webs thin and the canopy breaks apart. Shafts of golden light cut through the gloom. The oppressive crawling sensation that has haunted you through the maze finally lifts.'),
        new EncounterText("Ahead, a proper clearing opens up. The first open ground you've seen since entering Filibaf Forest. Among the old webs clinging to the trees, you find the remains of adventurers who were not so fortunate."),
        new EncounterText('Something moves in the largest web cocoon. You cut through the thick silk and a battered dwarf tumbles out, gasping for air.'),
        new EncounterText('"By Moradin\'s hammer! I thought I was done for!" He catches his breath. "Name\'s Korgan. Scout for Tharnag. Got caught by those cursed spiders on patrol. I owe you my life — I\'ll fight by your side when you need me."', 'Korgan'),
        new EncounterText("Beyond the clearing the trees thin further still — the road to Tharnag is finally within reach."),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          'Search the remains',
          'You carefully remove old webs and salvage what you can from the fallen adventurers.',
          'search_clearing', 1,
          { returnToChoices: true }
        ),
        new EncounterChoice(
          'Take a short rest',
          'You sit among the shafts of golden light and catch your breath. The quiet of the clearing soothes your wounds. You feel some of your strength returning.',
          'short_rest', 8,
          { returnToChoices: true }
        ),
        new EncounterChoice(
          'Leave the forest',
          'You take one last look at the clearing and press onward. The worst of the forest is behind you.',
          'leave_clearing', 0
        ),
      ],
    }),
  ]);
}

export function createForestAmbushLeftEncounter() {
  return new Encounter('forest_ambush_left', 'Forest Ambush', 'Spiders attack from above', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You push through the hanging moss and into a narrow clearing. The webs here are thicker, stretched between the trees like a grotesque canopy.'),
        new EncounterText('Without warning, spiders drop from the canopy above — huge, dark-bodied creatures with fangs dripping venom. They land all around you, cutting off escape!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'forest_spiders',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The last spider curls up and goes still. The path ahead is clear, the webs torn apart by the battle.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
    }),
  ]);
}

export function createForestAmbushRightEncounter() {
  return new Encounter('forest_ambush_right', 'Forest Ambush', 'More spiders lurk here', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You hack through the thorny thicket, branches scratching at your arms and face. The undergrowth opens into a web-choked hollow.'),
        new EncounterText('More spiders emerge from burrows in the ground and crevices in the bark, their many eyes gleaming with hunger. They approach from a different angle than expected!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'forest_spiders',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The spiders are defeated. Their webs hang in tattered ruins, and the path through the hollow is clear once more.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
    }),
  ]);
}

// ============================================================
// Tharnag Encounters
// ============================================================

export function createTharnagArrivalEncounter() {
  return new Encounter('tharnag_arrival', 'Tharnag', 'The great Dwarven city rises before you.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Finally! Out of that accursed forest! He points toward the horizon where a massive mountain rises from the landscape, its peak lost in clouds. Behold — Tharnag! The greatest Dwarven city in the northern realms!', 'Thorb'),
        new EncounterText('Carved into the face of the mountain, colossal stone gates stand flanked by towering statues of dwarven kings. Balconies and terraces dot the mountainside, connected by bridges of stone and iron.'),
        new EncounterText('What you see is but the entrance. Inside the mountain lies the true city — the Great Forge, the Hall of Ancestors, markets that stretch for miles. Ten thousand dwarves call Tharnag home.', 'Thorb'),
        new EncounterText('Impressive.', 'Raena'),
        new EncounterText('But her expression shifts. She shields her eyes, her elven sight reaching further than any human could.'),
        new EncounterText('Something is wrong. There are fires near the base of the mountain — not forge fires. War fires. I see siege towers being assembled. Catapults. Battering rams. And the ones building them — goblins. Hundreds of them. And behind the lines... ogres. At least a dozen.', 'Raena', 'tharnag_siege_bg'),
        new EncounterText('The words hang in the air. Tharnag — the greatest Dwarven stronghold — is under siege.'),
        new EncounterText('NO! He rips his axe from the ground and lets out a roar that echoes across the valley. He breaks into a dead sprint down the path toward the city. WE HAVE A SIEGE TO BREAK!', 'Thorb'),
      ],
    }),
  ]);
}

export function createSiegeGauntlet1Encounter() {
  return new Encounter('siege_gauntlet_1', 'Siege Line - West', 'An ogre blocks the western siege line.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The siege line stretches before you — a chaos of wooden barricades, overturned carts, and smoldering fires. Goblins scurry between crude war machines, but the real threat stands ahead.'),
        new EncounterText('A massive ogre blocks the path, hauling a battering ram the size of a tree trunk. Its goblin crew scatters as you approach.'),
        new EncounterText("That ram will bring down the gates if we don't stop it. Take it apart piece by piece!", 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'siege_gauntlet_1',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The ogre crashes to the ground, its battering ram splintering beneath its weight. One siege engine down.'),
        new EncounterText("That's one! Keep moving — I can see more rams ahead!", 'Thorb'),
      ],
    }),
  ]);
}

export function createSiegeGauntlet2Encounter() {
  return new Encounter('siege_gauntlet_2', 'Siege Line - Center', 'Another ogre with a battering ram blocks the center.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The center of the siege line is even more fortified. Another ogre stands guard over a massive ram, this one reinforced with iron bands.'),
        new EncounterText('More goblins! And this one looks angrier than the last!', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'siege_gauntlet_2',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The second ogre falls with a thunderous crash, crushing its own ram to splinters. The goblins flee in panic.'),
        new EncounterText('Two down! One more and the siege breaks! I can feel it!', 'Thorb'),
      ],
    }),
  ]);
}

export function createSiegeGauntlet3Encounter() {
  return new Encounter('siege_gauntlet_3', 'Siege Line - East', 'The last ogre stands between you and breaking the siege.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The eastern siege line is the last stronghold. The biggest ogre yet stands here, bellowing orders at a horde of goblins scrambling to load their ram.'),
        new EncounterText('This is it! Break this one and the siege crumbles! FOR THARNAG!', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'siege_gauntlet_3',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The final ogre topples, and with it, the last battering ram shatters. A cheer erupts from the walls of Tharnag as the remaining goblins scatter into the hills.'),
        new EncounterText('The siege is broken. The gates of Tharnag stand firm.'),
        new EncounterText("Among the wreckage you find goblin contraptions and the ogre's massive weapon."),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [8, 6],
      lootCards: ['goblin_rocket_boots', 'goblin_sapper_charges', 'ogre_maul'],
      lootTitle: 'Siege Spoils!',
    }),
  ]);
}

export function createSiegeGauntletDialogEncounter() {
  return new Encounter('siege_gauntlet_dialog', 'Beyond the Siege', 'Thorb knows another way into Tharnag.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('With the siege line in ruins, the battlefield grows quiet. Thorb surveys the wreckage, then turns toward the mountainside.'),
        new EncounterText("The main gates are still sealed — my kin won't open them until they're sure the siege is truly over. But I know another way in. Follow me.", 'Thorb'),
        new EncounterText('He leads you along the base of the mountain, past collapsed tunnels and ancient stonework, until he stops at a narrow crack in the rock face half-hidden by rubble.'),
        new EncounterText("A side door. Only a few dwarves know about this one. It'll take us straight to the lower halls.", 'Thorb'),
      ],
    }),
  ]);
}

export function createTharnagSideDoorEncounter() {
  return new Encounter('tharnag_side_door', 'Side Door to Tharnag', 'A hidden passage into the dwarven city.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You squeeze through the narrow passage, the stone walls pressing close. The air changes — warmer, drier, carrying the distant ring of hammers and the smell of forge-fire.'),
        new EncounterText('Welcome to Tharnag.', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootTitle: 'Welcome to Tharnag',
      triggersLevelUp: true,
      levelUpTier: 2,
    }),
  ]);
}

// ============================================================
// Volcano Encounters
// ============================================================

// Kobold Drake Rider — random encounter on the volcano slopes
// (volcano_east_path / volcano_lava_crossing / volcano_base). Mirrors
// PY encounter.py:create_kobold_drake_rider_encounter. Every spawn
// path shares the same loot table now (unified at 50 % drop rate);
// the gate is applied in the encounter loot loop in main.js.
export function createKoboldDrakeRiderEncounter() {
  return new Encounter('kobold_drake_rider', 'Kobold Drake Rider', 'A kobold drake rider charges at you from the volcanic ridge.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The ground shakes as a massive frost drake comes barreling around the ridge, a kobold rider clinging to its back and screaming a war cry. The drake's claws tear into the rock as it charges straight at you, icy breath billowing from its jaws. War horns sound in the distance — the army knows you're here."),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'kobold_drake_rider',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      lootCards: ['drake_rider_loot'],
    }),
  ]);
}

// Qualibaf Volcano arrival — the dramatic "frozen volcano + invasion
// force" beat. TEXT-only, no choice. Mirrors PY encounter.py:
// create_volcano_arrival_encounter.
export function createVolcanoArrivalEncounter() {
  return new Encounter('volcano_arrival', 'Qualibaf Volcano', 'The volcano looms before you, wreathed in unnatural cold.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('As you finally draw close to the Qualibaf Volcano, the air grows unnaturally cold. The lava flows that should be molten are frozen in place — rivers of black glass caught mid-surge. Dark shapes circle in the sky above, and across the mountain\'s slopes, armies of kobolds scurry like ants on a hill.'),
        new EncounterText("By the ancestors... I've never seen it like this. The Volcano should be burning, not... frozen. Something powerful is at work here. Something that shouldn't be possible.", 'Thorb'),
        new EncounterText("Look at those numbers. There must be thousands of them. This isn't a raiding party — it's an invasion force.", 'Raena'),
        new EncounterText("I've seen kobold war camps before, but nothing like this. Those shadows in the sky... those aren't birds. Whatever is commanding them has power we haven't faced yet.", 'Val'),
        new EncounterText("Then we don't march through the front door. We find a way in that isn't swarmed by every kobold in the north. There has to be an old passage — Thorgazad was built by dwarves, and dwarves always leave themselves a back door.", 'Thorb'),
        new EncounterText('A back door into a frozen volcano crawling with monsters. Just another day, then.', 'Raena'),
        new EncounterText("We've come too far to turn back. Whatever lurks inside that mountain — we face it together.", 'Val'),
        new EncounterText("Aye. Together. Let's find our way in.", 'Thorb'),
      ],
    }),
  ]);
}

// Volcano Base (the_point_of_no_return) — chapter 6 climax. Mirrors PY
// encounter.py:create_volcano_choice_encounter. The choice routes are
// flavor-only for now (chapter 7 upper/lower paths not yet implemented);
// the LOOT phase grants a tier-2 level-up so the player still gets a
// chapter-style payoff for clearing the slopes.
export function createVolcanoChoiceEncounter() {
  return new Encounter('volcano_choice', 'The Point of No Return', 'The kobold army closes in. You must choose your path now.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You press against the volcanic rock, catching your breath. Behind you, the sound of kobold war horns echoes across the frozen wastes. Dozens of patrols are converging on your position.'),
        new EncounterText("We're out of time. Once we go in, there's no coming back out this way — they'll have every exit covered within the hour.", 'Thorb'),
        new EncounterText("I see two options. There's a series of vents further up the slope — old mining shafts, by the look of them. If we climb up and squeeze through, we should come out somewhere in old Thorgazad's upper city. Higher ground, better sight lines, but we'll be exposed on the climb.", 'Thorb'),
        new EncounterText('Or… there.', 'Valdrisa'),
        new EncounterText('Valdrisa points to a partially collapsed opening near the base of the mountain, half-buried under frozen lava flow. Warm air seeps from the cracks.'),
        new EncounterText("That leads to the lower chambers — the old mining tunnels and foundries beneath the city. With the volcano frozen, the heat down there should be bearable. And the kobolds seem to be avoiding the lower levels. Fewer patrols, but who knows what else is down there.", 'Valdrisa'),
        new EncounterText("Both sound equally terrible, for what it's worth.", 'Raena'),
        new EncounterText('Another horn sounds, closer this time. Shadows move along the ridgeline above. Whatever you decide, decide now.', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          "Climb to the upper vents (Thorb's plan)",
          'You scramble up the frozen slope, boots slipping on obsidian glass. The vents are narrow but passable. One by one you squeeze through into darkness. Behind you, the sounds of the kobold army fade as the mountain swallows you whole.',
          'volcano_upper', 1,
        ),
        new EncounterChoice(
          "Enter the lower caves (Valdrisa's plan)",
          "You slide through the collapsed opening, warm air washing over you. The tunnel opens into a vast cavern — old mining tracks and rusted carts line the walls. It's dark, but the heat from below keeps the ice at bay. The kobolds won't follow you down here.",
          'volcano_lower', 1,
        ),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      // PY has lootTitle 'Prepare for the Descent' here, but the upper
      // path (Thorb's plan) climbs UP, not down, so the title reads
      // wrong on that branch. Empty title → loot screen uses the
      // encounter's own name ("The Point of No Return"), which still
      // sells the moment without the descent-specific framing.
      triggersLevelUp: true,
      levelUpTier: 2,
    }),
  ]);
}

// Ridge — post-dragon "leave?" offer. Fires when the player returns
// to The Ridge (summit_ridge) after slaying Varimatras. Two choices:
// head back to the Tharnag throne room (warm fade-out), or stay on
// the summit a little longer.
export function createRidgePostDragonOfferEncounter() {
  return new Encounter('ridge_post_dragon_offer', 'The Ridge', 'The summit, after the dragon.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The wind has not stopped, but the storm has. Ice still clings to the obsidian under your boots and the dragon-corpse is already half-buried in snow drift.'),
        new EncounterText('Below, the volcano is slowly awakening — not yet erupting, but stirring. The vents are smoking. The party stands a moment longer, breath fogging in the cold.'),
        new EncounterText("Nothing more for us up here. The dwarves will be waiting. Tharnag should know we made it.", 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'Will you head back?',
      choices: [
        new EncounterChoice(
          'Return to Tharnag (Throne Room)',
          'You turn from the ridge. The road home is long, but the dwarves will be waiting.',
          'bridge_return_tharnag', 0,
        ),
        new EncounterChoice(
          'Stay a moment longer',
          '',
          '', 0,
          { completesEncounter: true, repeatable: true },
        ),
      ],
    }),
  ]);
}

// Volcano Choice — revisit variant. Fired when the player returns to
// the Point of No Return node after already picking a path once. The
// dragon-arc story beat is over: simpler dialog, no level-up loot
// phase, and a "Not yet" option that just closes the encounter so the
// player can keep poking around the volcano area.
export function createVolcanoChoiceRevisitEncounter() {
  return new Encounter('volcano_choice_revisit', 'The Point of No Return', 'The volcano stirs in its sleep.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The mountain is awakening but has not erupted yet. Smoke curls from the upper vents and the lower tunnels breathe warm air. You still have time to choose.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choices: [
        new EncounterChoice(
          "Climb to the upper vents (Thorb's plan)",
          'You scramble up the frozen slope, boots slipping on obsidian glass. The vents are narrow but passable.',
          'volcano_upper', 1,
        ),
        new EncounterChoice(
          "Enter the lower caves (Valdrisa's plan)",
          "You slide through the collapsed opening, warm air washing over you. The kobolds won't follow you down here.",
          'volcano_lower', 1,
        ),
        new EncounterChoice(
          'Not yet — turn back for now',
          'You step back from the mountain. There is still time.',
          '', 0,
          // Repeatable + completesEncounter → returns to the map without
          // committing. The node stays revisitable for next time.
          { completesEncounter: true, repeatable: true },
        ),
      ],
    }),
    // No LOOT phase on revisit — the level-up only fires the first
    // time. Both volcano_upper / volcano_lower transitions still run
    // in main.js via the `completedEncounterId === 'volcano_choice'`
    // branch (it intentionally matches both encounter ids — see the
    // revisit dispatch comment in main.js).
  ]);
}

// Kobold Slyblade — random encounter on the dwarven city / upper path
// movement nodes (entry_corridor's corridor_ruins for now). Mirrors PY
// encounter.py:create_kobold_slyblade_encounter. Loot table
// `kobold_slyblade_loot` references cards not yet ported to JS
// (sly_blade, shadow_cloak, kobold_smoke_bomb, kobold_lockpick_set);
// dropping it here gives gold-only loot until those creators exist.
export function createKoboldSlybladeEncounter() {
  return new Encounter('kobold_slyblade', 'Kobold Slyblade', 'A kobold assassin ambushes you from the shadows.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('A blur of movement from the shadows — a kobold in dark leather drops from above, blades drawn. It grins with malicious cunning, already lunging before you can react.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'kobold_slyblade',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      // Pick-one slyblade pool: sundries, sly_blade, shadow_cloak,
      // kobold_smoke_bomb, kobold_lockpick_set.
      lootCards: ['kobold_slyblade_loot'],
    }),
  ]);
}

// Dwarven Specter — random encounter on the dwarven city / upper path
// movement nodes. Mirrors PY encounter.py:create_dwarven_specter_encounter.
// Same caveat on loot as the Slyblade — PY's `dwarven_specter_loot`
// pool references specter-themed cards not yet in the JS port
// (gravechill_shard, soul_ward, spectral_hand, specter_ectoplasm).
export function createDwarvenSpecterEncounter() {
  return new Encounter('dwarven_specter', 'Dwarven Specter', 'A ghostly figure drifts through the ruins.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The air turns cold. A translucent figure materializes from the stone wall — a dwarven warrior, dead for centuries, its hollow eyes burning with pale light. It reaches toward you with spectral hands, hungry for the warmth of the living.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'dwarven_specter',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [1, 6],
      // Pick-one specter pool: gravechill_shard, soul_ward,
      // spectral_hand, specter_ectoplasm (rare).
      lootCards: ['dwarven_specter_loot'],
    }),
  ]);
}

// Lower Caverns arrival (Chapter 7 — lower path opener). TEXT-only,
// one-time. Mirrors PY encounter.py:create_lower_caverns_arrival_encounter.
export function createLowerCavernsArrivalEncounter() {
  return new Encounter('lower_caverns_arrival', 'The Lower Caverns', "You descend into the volcano's depths.", [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The tunnel plunges steeply downward from the volcano's base, carved by centuries of lava flow. The walls are smooth obsidian, and the air grows warmer with each step. Somewhere far below, you can hear the deep rumble of the mountain's heart."),
        new EncounterText("These tunnels are old. Older than the kobolds, older than anything up on the surface. Watch your step — the floor's been polished smooth by flowing magma.", 'Thorb'),
      ],
    }),
  ]);
}

// Temple District arrival (Chapter 7 — west_tunnel branch). TEXT-only.
// Mirrors PY encounter.py:create_temple_district_arrival_encounter.
export function createTempleDistrictArrivalEncounter() {
  return new Encounter('temple_district_arrival', 'The Temple District', 'Ancient temples carved from living obsidian.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The western passage opens into a district of towering obsidian columns and crumbling archways. This was once a place of worship — broken altars and shattered idols line the walls. The architecture is far older than anything else you\'ve seen in the volcano.'),
        new EncounterText("These temples are ancient. Look at the stonework — this predates anything the dwarves built. Whoever carved this place did it with a reverence we've long forgotten.", 'Thorb'),
        new EncounterText('Stay sharp. Old temples usually mean old traps… or old guardians.', 'Raena'),
      ],
    }),
  ]);
}

// Obsidian Forge arrival (Chapter 7 — pillar_passage branch).
// TEXT-only, fires on first arrival at forge_entry. Mirrors PY
// encounter.py:create_obsidian_forge_arrival_encounter.
export function createObsidianForgeArrivalEncounter() {
  return new Encounter('obsidian_forge_arrival', 'The Obsidian Forge', "An ancient forge built into the volcano's heart.", [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The passage opens into a massive chamber dominated by heat. Rows of dormant furnaces line the walls, their fires long cold but the stone still warm to the touch. At the far end, an enormous anvil carved from pure obsidian sits waiting, as if its smiths merely stepped away.'),
        new EncounterText('A forge this size… you could arm an entire army down here. Whoever built this knew their craft. The metalwork on these furnaces puts our finest dwarven smiths to shame.', 'Thorb'),
      ],
    }),
  ]);
}

// The Obsidian Forge — first visit (the_obsidian_forge node). 3-choice
// prompt: forge a weapon (one-time), rest (one-time), leave. Mirrors PY
// encounter.py:create_obsidian_forge_encounter.
export function createObsidianForgeEncounter() {
  return new Encounter('obsidian_forge', 'The Obsidian Forge', 'An ancient forge with power still lingering in its anvil.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You approach the massive forge. The obsidian anvil radiates a faint warmth, and scattered around the chamber are ingots of dark metal and tools that look like they were set down yesterday.'),
        new EncounterText("By the ancestors... there's still material here. Obsidian ingots, flux, even a crucible that's still intact. I bet we could fire this forge up one more time. Maybe enough for a single piece.", 'Thorb'),
        new EncounterText("The obsidian here has unusual properties. If we could infuse a weapon with it, the edge would cut through armor like parchment. It's worth trying, at least once.", 'Valdrisa'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The forge awaits.',
      choices: [
        new EncounterChoice('Forge a weapon with obsidian', '', 'forge_weapon', 0, { returnToChoices: true }),
        new EncounterChoice('Rest here for a while', 'You rest by the warm forge. The heat soothes your wounds.', 'forge_rest', 0, { returnToChoices: true }),
        new EncounterChoice('Leave', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// The Obsidian Forge — revisit (skips intro text). Mirrors PY
// encounter.py:create_obsidian_forge_revisit_encounter.
export function createObsidianForgeRevisitEncounter() {
  return new Encounter('obsidian_forge_revisit', 'The Obsidian Forge', 'The forge stands quiet.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The forge is warm and quiet.',
      choices: [
        new EncounterChoice('Forge a weapon with obsidian', '', 'forge_weapon', 0, { returnToChoices: true }),
        new EncounterChoice('Rest here for a while', 'You rest by the warm forge. The heat soothes your wounds.', 'forge_rest', 0, { returnToChoices: true }),
        new EncounterChoice('Leave', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// General Zhost's Revenge — boss fight at the bridge entry. The
// crippled general from the Tharnag siege returns to settle the
// score. Mirrors PY encounter.py:create_zhost_revenge_encounter.
export function createZhostRevengeEncounter() {
  return new Encounter('zhost_revenge', "General Zhost's Revenge", 'The wounded general blocks the bridge.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('As you step onto the bridge, a familiar figure emerges from the shadows on the far side. General Zhost — scarred, limping, one arm hanging at his side — but still gripping the White Claw in his good hand. His eyes burn with fury.'),
        new EncounterText('"You thought you could walk away from me? I lost everything because of you. My army, my fortress, my honor. But I still have THIS."', 'General Zhost'),
        new EncounterText('He raises the White Claw and charges.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'zhost_revenge',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Zhost collapses to his knees, the White Claw clattering across the obsidian bridge. He looks up at you with something between rage and respect.'),
        new EncounterText('"Finish it then. I won\'t beg."', 'General Zhost'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      // 'white_claw_reforged' is the shared id (enemy deck + player loot
      // card share one creator now). drake_rider_loot is the 50%-gated
      // common-soldier drop table.
      lootCards: ['white_claw_reforged', 'drake_rider_loot'],
    }),
  ]);
}

// Upper Bridge arrival — TEXT-only intro that fires once when the
// player first crosses from obsidian_streets/streets_upper into the
// bridge map. Mirrors PY encounter.py:create_upper_bridge_arrival_encounter.
export function createUpperBridgeArrivalEncounter() {
  return new Encounter('upper_bridge_arrival', 'The Upper Bridge', 'A massive bridge over a bottomless chasm.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The streets end abruptly at the edge of a vast chasm. Spanning it is a bridge of solid obsidian, wide enough for ten to walk abreast. Wind howls up from the darkness below, and the far side is lost in shadow."),
        new EncounterText("That's... a long way down. And a long way across. Whatever's on the other side, they didn't want visitors.", 'Raena'),
      ],
    }),
  ]);
}

// Bridge Crossing — point-of-no-return dialog at the bridge's far
// end. Blow the bridge to cut off pursuit and commit to the upper
// volcano route. Mirrors PY encounter.py:create_bridge_crossing_encounter.
export function createBridgeCrossingEncounter() {
  return new Encounter('bridge_crossing', 'Point of No Return', 'The path ahead leads into the heart of the volcano.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("As you approach the far end of the bridge, you hear the rumble of countless kobold feet echoing from the tunnels behind you. They've found your trail. It won't be long before they swarm the bridge."),
        new EncounterText("We can't go back the way we came. But I still have some of those Goblin Sapper charges we found earlier. If we rig the bridge... well, that's a one-way trip.", 'Thorb'),
        new EncounterText("He's right. We blow the bridge, we cut off their pursuit. But we'll have to find another way out of this volcano. Are you ready for that?", 'Valdrisa'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'Once you destroy the bridge, there is no going back.',
      choices: [
        // "Blow" — NO completesEncounter so the encounter advances to
        // the LOOT phase below, which triggers the chapter-8 level-up.
        // The map swap to volcano_stairs_1 fires from the rest-exit
        // crossingBridge hook in main.js.
        new EncounterChoice('Blow the bridge and push forward', 'The charges detonate with a thunderous roar. The great obsidian bridge cracks and crumbles into the abyss. There is no turning back now.', 'cross_bridge', 0),
        new EncounterChoice("Stay — we're not ready yet", '', '', 0, { completesEncounter: true }),
      ],
    }),
    // Level-up reward — chapter-8 tier-3 ability + perk + deck
    // rebalance. Only reached when "Blow" was picked (the "Stay"
    // choice completesEncounter and never advances here).
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootTitle: 'The Bridge Falls',
      triggersLevelUp: true,
      // Tier 2 abilities — same pool as the Tharnag side-door level-up.
      // Chapter 8 doesn't get its own ability tier yet; bumping to 3
      // would force the fallback to tier 1 (no tier-3 abilities exist).
      levelUpTier: 2,
    }),
  ]);
}

// Obsidian Market arrival — reached via the plaza's Northern
// Corridor. TEXT-only intro. Mirrors PY
// encounter.py:create_obsidian_market_arrival_encounter.
export function createObsidianMarketArrivalEncounter() {
  return new Encounter('obsidian_market_arrival', 'The Obsidian Market', 'A grand underground marketplace.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The northern corridor opens into an enormous underground marketplace. Stalls and shops stretch as far as the eye can see, carved from obsidian and decorated with faded banners. Goods still sit on some counters, covered in thick dust.'),
        new EncounterText('This must have been the trading heart of the whole city. Look at the size of those warehouses at the far end.', 'Thorb'),
      ],
    }),
  ]);
}

// Market Stalls — search-the-rubble salvage encounter. One-time
// dwarven loot pull. Mirrors PY encounter.py:create_market_stalls_encounter.
export function createMarketStallsEncounter() {
  return new Encounter('market_stalls', 'Market Stalls', 'Abandoned merchant stalls covered in dust and rubble.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You pick through the rows of abandoned stalls. Most have been picked clean by time and scavengers, but some still hold goods buried under collapsed awnings and obsidian rubble.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'Search the rubble?',
      choices: [
        new EncounterChoice('Search the stalls', 'You dig through the rubble and debris, pushing aside collapsed shelving and crumbled stone. Your hands close around something solid — dwarven craftsmanship, still intact after all these years.', 'market_stalls_loot', 0, { returnToChoices: true }),
        new EncounterChoice('Leave', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// Deep Market — sheltered rest spot at the far end of the market.
// Heals up to 8 cards from discard. Mirrors PY
// encounter.py:create_deep_market_rest_encounter.
export function createDeepMarketRestEncounter() {
  return new Encounter('deep_market_rest', 'Deep Market', 'A sheltered corner in the far end of the market.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("At the far end of the market, behind a row of sealed warehouses, you find a sheltered alcove. The stone floor is smooth, the walls block the drafts, and it's quiet — as safe a resting spot as you'll find in these ruins."),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'Rest here?',
      choices: [
        new EncounterChoice('Rest', 'You settle into the alcove and tend your wounds. The quiet of the deep market is almost peaceful.', 'deep_market_rest', 8, { returnToChoices: true }),
        new EncounterChoice('Leave', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// Obsidian Streets arrival — reached via the plaza's Northern
// Corridor. TEXT-only intro. Mirrors PY
// encounter.py:create_obsidian_streets_arrival_encounter.
export function createObsidianStreetsArrivalEncounter() {
  return new Encounter('obsidian_streets_arrival', 'The Obsidian Streets', 'Narrow streets of an underground city.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The northern corridor leads into a network of narrow streets, carved directly from the obsidian rock. Small buildings line both sides — homes, shops, workshops — all empty and silent. This was once a bustling underground city.'),
        new EncounterText('People lived here. Families, merchants, craftsmen. Whatever happened to drive them away, they left in a hurry.', 'Raena'),
      ],
    }),
  ]);
}

// Cavern Entrance — fires when the player doubles back from the
// lower caverns toward the original descent point. PY parity
// equivalent: a flavor reminder that the cave entrance only leads
// back up and the player should continue deeper to progress.
export function createLowerCavernsDoubleBackEncounter() {
  return new Encounter('lower_caverns_double_back', 'Cavern Entrance', 'You\'ve circled back to the way in.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The tunnel narrows back toward the surface. You\'ve doubled back to the cave entrance — there\'s nothing else this way. To go deeper into the volcano, you\'ll need to turn around.'),
      ],
    }),
  ]);
}

// Backward-arrival wrappers — reuse the same dialog text as the
// forward entry encounters but with unique encounter ids so each
// entry node tracks completion independently. Without this, sharing
// the forward encounterId on the backward entry would (1) suppress
// the dialog on the backward visit via force-flip, and
// (2) auto-clear the FORWARD entry's `???` hidden label in
// hydrateMapFromGlobalState the next time the map is rehydrated,
// because the shared id is in completedEncounters.
export function createArtisanDistrictEntryBackEncounter() {
  const e = createArtisanDistrictEntryEncounter();
  e.id = 'artisan_district_entry_back';
  return e;
}

export function createTunnelToBridgeEntryBackEncounter() {
  const e = createTunnelToBridgeEntryEncounter();
  e.id = 'tunnel_to_bridge_entry_back';
  return e;
}

export function createDeeperTunnelsEntryBackEncounter() {
  const e = createDeeperTunnelsEntryEncounter();
  e.id = 'deeper_tunnels_entry_back';
  return e;
}

export function createGatePassageBackEncounter() {
  const e = createGatePassageEncounter();
  e.id = 'gate_passage_back';
  return e;
}

export function createObsidianTunnelsArrivalBackEncounter() {
  const e = createObsidianTunnelsArrivalEncounter();
  e.id = 'obsidian_tunnels_arrival_back';
  return e;
}

// Overseer Gnikan — chapter 8 boss on the summit ridge. The party
// reaches the lone figure beckoning the ice storm; Gnikan talks in
// broken common about Zhost and the party's reputation, the rest
// accuse him of being the source of the Qualibaf cold, and he
// dismisses them before the fight starts. Combat opens with three
// Ice Elementals (1/1, 2/2, 3/3) already on the field via
// ENEMY_DECKS.overseer_gnikan.
export function createOverseerGnikanEncounter() {
  return new Encounter('overseer_gnikan', 'Overseer Gnikan', 'A kobold frost shaman beckons the ice storm.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The figure on the ledge turns. A kobold — taller than any you have seen, robed in pale hide and ice-rimmed iron, a glittering staff in one clawed hand. The wind dies as it looks at you.'),
        new EncounterText("Zhost… tell me of you. He say you not stop. He say you come even when bridge fall. He say you… reh-len-tless.", 'Gnikan'),
        new EncounterText("So… you the kobold doing all this? The cold, the storms, the dying crops down in the valley — that's YOU?", 'Thorb'),
        new EncounterText('You\'re the reason Qualibaf is freezing in midsummer. The reason farmers are burying their children. The reason the mountains are wrong.', 'Raena'),
        new EncounterText("You stand here at the heart of it and you don't even deny it. Answer for what you've done!", 'Valdrisa'),
        new EncounterText("Fools. You see ice, you see cold, you cry like little babies. You have no idea of the POWER!", 'Gnikan'),
        new EncounterText('The staff comes up. Ice cracks across the ridge. The storm answers.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'overseer_gnikan',
    }),
    // Phase 2 — Gnikan's dying call summons something larger. The
    // storm overhead grows until a vast form emerges from the
    // blizzard, and the fight resumes with the same kit + a player
    // Blizzard buff (every turn-start ticks 1 Ice on the party).
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Gnikan staggers, the staff falling from his claws. His scales blanch with frost as he drops to one knee — but his eyes go wide, not down to his wound, but UP, into the gathering storm.', '!'),
        new EncounterText('No! It cannot be! Master! Master, where are you!', 'Gnikan'),
        new EncounterText('The wind answers. The Ice Storm boiling on the horizon a moment ago drops on the ridge like a hammer — howling, blinding, every breath crystallizing in your lungs.', '!'),
        new EncounterText('Through the white, a SHAPE. Vast. Hovering. Wings the width of the ridge unfurl in the heart of the blizzard. Something ancient is here, and it sees you.', '!'),
        new EncounterText("By the forge-fires... that's not a kobold's master. That's something much, much older.", 'Thorb'),
        new EncounterText("A wave of cold rolls off the dragon and washes over Gnikan. The kobold's wounds frost over and seal. His knees straighten. The staff leaps back into his outstretched claw as if pulled on a string.", '!'),
        new EncounterText("Yes! YES! Master gives me his strength! See now — see what TRUE cold can do!", 'Gnikan'),
        new EncounterText('Around him, the shattered Ice Elementals you cut down only moments ago drag themselves back together. Jagged shards rise out of the snowpack, lock into limbs, into torsos — three frozen sentinels reforming in a slow, deliberate breath.', '!'),
        new EncounterText("He's getting back UP. They ALL are. Steady — here it comes!", 'Valdrisa'),
        new EncounterText('The dragon draws breath. Frost crawls up its throat. Before you can move, it BREATHES — and the whole ridge disappears in a sheet of howling white.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'overseer_gnikan_phase_2',
    }),
    // Phase 3 — Gnikan dies screaming. Varimatras descends from the
    // storm, breathes a contemptuous gout of frost over the corpse,
    // and turns on the party himself. The dragon-monologue text
    // block plays against the Varimatras backdrop (set in the P2
    // death intercept in checkCombatEnd).
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      phaseTitle: 'Varimatras',
      texts: [
        new EncounterText("Gnikan's scream tears across the ridge — a thin, broken sound, half kobold, half something the cold made of him. He drops into a drift of fresh snow, ice already growing over his face, his eyes wide and lost.", '!'),
        new EncounterText('Master! I tried! I tried, I—', 'Gnikan'),
        new EncounterText('The dragon descends. Each beat of its wings pushes the storm sideways. Talons longer than your arm settle around the dying kobold, almost gentle. Almost.', '!'),
        new EncounterText('You failed me.', 'Varimatras'),
        new EncounterText('A slow, deliberate breath. White vapor rolls over Gnikan. Where it touches, the snow rises — sealing him up to the shoulders, then to the throat, then over his face. His body locks into the drift like a fossil.', '!'),
        new EncounterText('The Volcano is mine! Everything will freeze under my power!', 'Varimatras'),
        new EncounterText('It turns to face you. The ridge feels smaller. The sky feels smaller.', '!'),
      ],
    }),
    // Catch-breath beat — heal up to 8 from discard. One button so
    // it reads as a single decisive moment rather than a real choice
    // (the only meaningful action is "rest"). resolveCatchBreathRest
    // in main.js handles the discard-pop heal + result-text.
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      phaseTitle: 'Varimatras',
      choicePrompt: 'The dragon takes a slow breath. There is one heartbeat to brace.',
      choices: [
        new EncounterChoice(
          'Catch your breath',
          'You force your lungs open and steady your grip on your weapon.',
          'catch_breath_rest', 0,
        ),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      phaseTitle: 'Varimatras',
      texts: [
        new EncounterText("That's a DRAGON. A white dragon. Of COURSE there's a white dragon at the top of the mountain.", 'Thorb'),
        new EncounterText('Whatever Gnikan was, this is what was feeding him. The cold, the storms, the dying valley — all of it rolls down from THIS thing.', 'Raena'),
        new EncounterText("Wait — the staff. Don't leave it.", 'Raena'),
        new EncounterText("Raena darts forward, slips Gnikan's frost-rimmed staff out of the drift before the ice can take it, and tosses it across to you. The shaft is cold enough to burn.", '!'),
        new EncounterText("Big lizard, small ridge. Stay loose, stay close. Don't let it pin you under that breath again.", 'Valdrisa'),
        new EncounterText('Varimatras coils onto its haunches. Frost crawls back up its throat. The fight is not over.', '!'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'varimatras',
    }),
    // Varimatras LOOT — five tier-2 epic dragon-loot cards laid
    // out for the party to pick two of. Each one leans into a
    // different role / subtype so the choice carries real weight.
    // Gnikan's Staff was already handed off during the rally TEXT
    // phase, so this is purely Varimatras's drop.
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      phaseTitle: "Dragon's Hoard",
      lootTitle: "Dragon's Hoard",
      lootPickCount: 2,
      lootPickCards: [
        'dragon_tooth_dagger',
        'white_dragonscale_shield',
        'white_dragonscale_armor',
        'dragon_bone_bow',
        'dragon_eye_mace',
      ],
    }),
    // Post-Varimatras victory dialog. The background was already
    // swapped to bg_volcano_ridge_awakening by the loot-pick
    // handler in main.js, so every text in this phase + the egg
    // LOOT phase + the running-away TEXT phase all play against
    // the erupting-ridge backdrop.
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      phaseTitle: 'The Volcano Wakes',
      texts: [
        new EncounterText('Silence. For one held breath, only the wind. Then a low, grinding groan rolls up from the rock under your boots — and the storm splits, lit from below by a red-orange glow.', '!'),
        new EncounterText("Bruised. Frozen. STILL STANDING. We did it. By the forge-fires, we ACTUALLY did it.", 'Thorb'),
        new EncounterText("Look at the snow — it's melting. The whole ridge is melting. Whatever Gnikan and that dragon were holding back…", 'Raena'),
        new EncounterText("…the mountain's done holding it. Years of it. All at once.", 'Valdrisa'),
        new EncounterText('A second tremor — harder. Ice cracks across the cliff face, slides into smoke. Far below, the magma vents you climbed past on the way up start to spit fountains.', '!'),
        new EncounterText("DOWN. We go down. Now. Move toward Tharnag and don't stop.", 'Valdrisa'),
        new EncounterText('You scramble back along the ridge as the world behind you gives a long, splitting roar. Smoke. Heat. The wind reverses and starts shoving you onward.', '!'),
        new EncounterText('Wait — wait. There. Tucked in the lee of that boulder, half-buried in snow. Is that—', 'Raena'),
      ],
    }),
    // The egg drop. Standard fixed-loot LOOT phase — the player
    // doesn't pick anything, the egg just lands in deck + hand.
    // canRevisit isn't a concern: this whole encounter is one-shot.
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['white_dragon_egg'],
      lootTitle: "A Dragon's Egg!",
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      phaseTitle: 'The Volcano Wakes',
      texts: [
        new EncounterText("Raena yanks the heavy pale egg out of the drift — it's warm against the snow, almost too warm to hold. Veins of soft white light pulse under the shell.", '!'),
        new EncounterText("She left it. Or… he did. Whichever. We are NOT leaving it here.", 'Thorb'),
        new EncounterText("Tuck it. Run. Now. Now NOW.", 'Valdrisa'),
        new EncounterText('Behind you the ridge splits open in a final long howl. Magma fountains where ice once piled. The storm collapses into steam, and the whole peak begins to shake itself apart.', '!'),
        new EncounterText('The Volcano is free. The Dragon is dead. And the party is hurtling down the stairs toward Tharnag with the white-pulsing egg cradled tight between them.', '!'),
      ],
    }),
  ]);
}

// Stair Top arrival — fires once at summit_entry when the player
// reaches the ridge above the volcano stairs. Sets up the chapter-8
// boss area: an Ice Storm gathering, a lone figure beckoning at the
// summit. Two exhausting choices: Take a break (heal up to 8 from
// the discard pile) or Go in (continue without resting). Either
// completes the encounter, and canRevisit=false on the node keeps
// it from re-firing.
export function createStairTopArrivalEncounter() {
  return new Encounter('stair_top_arrival', 'Stair Top', 'The summit ridge opens before you.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You reach the top of the stairs. The sky clears overhead. Magma and ice melt together in an unnatural way, the heat of the volcano warring with a cold that has no business at this altitude.'),
        new EncounterText('An Ice Storm gathers in the distance, dark clouds boiling against the open sky. On the ledge ahead stands a lone figure, robed and still, holding a staff aloft — gesturing at the storm as if beckoning it closer.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The storm is coming. What do you do?',
      choices: [
        new EncounterChoice(
          'Take a break',
          'You sit on the warm stone and catch your breath while you can.',
          'stair_top_rest', 0,
          { completesEncounter: true }
        ),
        new EncounterChoice(
          'Go in',
          'No time. You move toward the figure on the ledge.',
          '', 0,
          { completesEncounter: true }
        ),
      ],
    }),
  ]);
}

// Entry Corridor doubled-back dialog — fires once when the player
// backtracks from corridor_ruins to corridor_entrance after first
// entering Thorgazad. The way out is no longer safe; pushes the
// party back into the city.
export function createEntryCorridorDoubleBackEncounter() {
  return new Encounter('entry_corridor_double_back', 'Corridor Entrance', 'The way back is no longer safe.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You retrace your steps to the corridor entrance — but the slope down is no longer empty. Kobold voices echo up from below, dozens of them, fanning through the lower passages.'),
        new EncounterText('Going back the way you came is no longer an option. Whatever you came here to do, it has to be done from inside Thorgazad now. You turn back into the corridor.'),
      ],
    }),
  ]);
}

// Plaza arrival variants — each entry node uses a distinct id so
// completedEncounters doesn't auto-isDone the OTHER entry points
// when one fires. Same body as the canonical obsidian_plaza_arrival
// (tunnels side). Dropped per-side flavor lines for now; can be
// expanded later when the player asks for them.
export function createObsidianPlazaArrivalWestEncounter() {
  return new Encounter('obsidian_plaza_arrival_west', 'The Obsidian Plaza', 'A vast underground plaza.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The temple corridor opens into an enormous underground plaza. The ceiling soars impossibly high, supported by massive obsidian pillars carved with intricate patterns.'),
        new EncounterText('This place is huge. We should be careful — sound carries in a chamber this size.', 'Raena'),
      ],
    }),
  ]);
}

export function createObsidianPlazaArrivalNwEncounter() {
  return new Encounter('obsidian_plaza_arrival_nw', 'The Obsidian Plaza', 'A vast underground plaza.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The narrow passage opens into an enormous underground plaza. Obsidian pillars rise to a ceiling lost in shadow.'),
        new EncounterText('Quiet here. Whatever lived in this plaza is long gone.', 'Raena'),
      ],
    }),
  ]);
}

// Temple District side-passage arrival — distinct id from
// temple_district_arrival so completedEncounters doesn't reveal
// temple_entry on backward traversal from the plaza side.
export function createTempleDistrictArrivalSideEncounter() {
  return new Encounter('temple_district_arrival_side', 'The Temple District', 'Ancient temples carved from living obsidian.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The narrow side-passage opens into a chamber of old stone temples. Crumbling columns line the walls, half-hidden under centuries of fallen masonry.'),
        new EncounterText('We came in through the back door. The main approach must be somewhere south of here.', 'Raena'),
      ],
    }),
  ]);
}

// Same dialog body, but tagged with a distinct id so the bridge-side
// arrival (streets_upper) doesn't share completedEncounters with the
// plaza-side arrival (streets_entry). Without this, walking the
// streets backward from the bridge entry force-revealed every
// streets node's real name because the shared encounter id
// auto-isDone'd every node carrying it.
export function createObsidianStreetsArrivalUpperEncounter() {
  return new Encounter('obsidian_streets_arrival_upper', 'The Obsidian Streets', 'Narrow streets of an underground city.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The streets climb down past empty doorways and shuttered workshops. The torchlight catches obsidian carvings — patterns dwarven craftsmen would have recognized centuries ago. Whatever lived here is long gone.'),
        new EncounterText('Quiet. Too quiet, even for a dead city.', 'Raena'),
      ],
    }),
  ]);
}

// Obsidian Plaza arrival — Chapter 7 north passage hub. Shared
// dialog id across both entry points (plaza_entry from
// obsidian_tunnels and plaza_west from temple_district) so the first
// visit from EITHER side plays the dialog and the global
// completedEncounters force-isDone rule blocks the re-fire on the
// second entry. Mirrors PY encounter.py:create_obsidian_plaza_arrival_encounter.
export function createObsidianPlazaArrivalEncounter() {
  return new Encounter('obsidian_plaza_arrival', 'The Obsidian Plaza', 'A vast underground plaza.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The north passage opens into an enormous underground plaza. The ceiling soars impossibly high, supported by massive obsidian pillars carved with intricate patterns. This was once a gathering place — a city square buried deep within the volcano.'),
        new EncounterText('Look at the size of this place. An entire army could muster here. Passages branch out in every direction.', 'Raena'),
      ],
    }),
  ]);
}

// Magma Drake — Chapter 7 mini-boss at the center of the plaza. One
// fight (canRevisit:false on the node + completedEncounters latch).
// Mirrors PY encounter.py:create_magma_drake_encounter.
export function createMagmaDrakeEncounter() {
  return new Encounter('magma_drake', 'Magma Drake', 'A massive drake made of living magma guards the plaza.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The ground shudders as you enter the plaza. A massive shape unfurls from the obsidian fountain — a drake of living magma, its scales glowing like embers. Molten rock drips from its jaws as it turns its burning gaze toward you.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'magma_drake',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [4, 6],
      lootCards: ['magma_drake_loot', 'molten_scale_armor_loot'],
    }),
  ]);
}

// Obsidian Cathedral arrival — temple_left_passage forwards into the
// cathedral and lands the party on cathedral_entry where this
// TEXT-only intro plays. Mirrors PY
// encounter.py:create_cathedral_arrival_encounter.
export function createCathedralArrivalEncounter() {
  return new Encounter('cathedral_arrival', 'The Obsidian Cathedral', 'A ruined cathedral carved from obsidian.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Through the archway, a vast cathedral opens before you. The ceiling soars impossibly high, lost in shadow. Broken pillars of polished obsidian line what was once a grand nave, and fragments of stained glass crunch beneath your boots.'),
        new EncounterText('This place is ancient. Look at the stonework — whoever built this worshipped something powerful. And from the look of the shrine at the far end... that power might still linger.', 'Thorb'),
      ],
    }),
  ]);
}

// Obsidian Oracle — the mini-boss sitting on a fused-glass throne in
// the cathedral ruins. Plays a short intro, then drops into the combat
// + loot phases. Mirrors PY encounter.py:create_obsidian_oracle_encounter.
export function createObsidianOracleEncounter() {
  return new Encounter('obsidian_oracle', 'Obsidian Oracle', 'An ancient being fused with volcanic glass guards the cathedral.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("Among the shattered pews, a figure sits motionless on a throne of fused obsidian. Its body is more glass than flesh — dark, reflective surfaces where skin once was. As you approach, its eyes open, glowing with an inner violet light. It speaks without moving its lips: 'I have seen your end. It is written in stone.'"),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'obsidian_oracle',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [3, 6],
      // PY parity (encounter.py:4579): guaranteed golem-pool roll +
      // a guaranteed Obsidian Candle. The candle is the headline drop
      // (rare tier-2 item that scry-2's via a forced recharge).
      lootCards: ['obsidian_golem_loot_guaranteed', 'obsidian_candle'],
    }),
  ]);
}

// Cathedral Shrine revisit — skips the intro text and drops straight
// into the choice prompt once any choice has been used. Mirrors PY
// encounter.py:create_cathedral_shrine_revisit_encounter.
export function createCathedralShrineRevisitEncounter() {
  return new Encounter('cathedral_shrine_revisit', 'Ancient Shrine', 'The shrine pulses with ancient energy.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The shrine pulses with ancient energy.',
      choices: [
        new EncounterChoice('Pray to the old gods', 'You kneel before the shrine. Power surges through you as ancient knowledge fills your mind.', 'pray_cathedral', 0, { returnToChoices: true }),
        new EncounterChoice('Rest here for a while', "You sit in the quiet of the cathedral. The shrine's warmth eases your wounds.", 'cathedral_rest', 0, { returnToChoices: true }),
        new EncounterChoice('Leave', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// Cathedral Shrine — first-visit text + 3 choices: pray for a Tier 2
// ability (one-time), rest (one-time, heal 8), leave. Mirrors PY
// encounter.py:create_cathedral_shrine_encounter.
export function createCathedralShrineEncounter() {
  return new Encounter('cathedral_shrine', 'Ancient Shrine', 'An altar radiating with forgotten power.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The shrine stands at the heart of the ruined cathedral, untouched by the decay around it. Strange symbols pulse with a faint light across its surface. The air here feels charged, as if the stone itself remembers the prayers offered long ago."),
        new EncounterText("I can feel it... there's still power here. Old power. If you kneel and offer a prayer, the shrine might answer.", 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The shrine pulses with ancient energy.',
      choices: [
        new EncounterChoice('Pray to the old gods', 'You kneel before the shrine. Power surges through you as ancient knowledge fills your mind.', 'pray_cathedral', 0, { returnToChoices: true }),
        new EncounterChoice('Rest here for a while', "You sit in the quiet of the cathedral. The shrine's warmth eases your wounds.", 'cathedral_rest', 0, { returnToChoices: true }),
        new EncounterChoice('Leave the shrine alone', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// Heart of the Volcano — temple_deep_chamber. The party stands on a
// ledge above the lava and may sacrifice one piece of gear into the
// magma (permanently banished). Mirrors PY
// encounter.py:create_volcano_heart_encounter.
export function createVolcanoHeartEncounter() {
  return new Encounter('volcano_heart', 'Heart of the Volcano', 'A stone arch over a bottomless pit of magma.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You step through a massive stone archway and the ground drops away. Before you is a vast pit — the heart of the volcano itself. Magma churns far below, radiating heat that makes your skin prickle. A narrow ledge is all that separates you from the abyss.'),
        new EncounterText("By the forge-fires... this is it. The heart of the mountain. In the old stories, offerings made to the volcano's heart would be answered with blessings. Or curses.", 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: "The volcano's heat is intense. You could sacrifice something forever...",
      choices: [
        new EncounterChoice('Sacrifice a Weapon (permanently banished)', '', 'sacrifice_weapon', 0, { returnToChoices: true }),
        new EncounterChoice('Sacrifice Armor (permanently banished)',    '', 'sacrifice_armor',  0, { returnToChoices: true }),
        new EncounterChoice('Sacrifice an Item (permanently banished)',  '', 'sacrifice_item',   0, { returnToChoices: true }),
        new EncounterChoice('Sacrifice a Relic (permanently banished)',  '', 'sacrifice_relic',  0, { returnToChoices: true }),
        new EncounterChoice('Do nothing', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// Volcano Heart revisit — once any sacrifice has been made the mountain
// is quiet. Mirrors PY encounter.py:create_volcano_heart_revisit_encounter.
export function createVolcanoHeartRevisitEncounter() {
  return new Encounter('volcano_heart_revisit', 'Heart of the Volcano', "The volcano's heart still burns.", [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The volcano's heart still churns below, but the strange pull you felt before has faded. Whatever the mountain wanted, it has received."),
      ],
    }),
  ]);
}

// Magma Mephit random encounter — fires randomly while crossing the
// chapter-7 volcano maps. Mirrors PY encounter.py:create_magma_mephit_encounter.
export function createMagmaMephitEncounter() {
  return new Encounter('magma_mephit', 'Magma Mephits', 'A swarm of small fiery creatures erupts from the rock.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The ground cracks and hisses. Small winged creatures made of living magma burst from fissures in the rock, their bodies dripping molten stone. They cackle with malicious glee as they swarm toward you.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'magma_mephit',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      lootCards: ['magma_mephit_loot'],
    }),
  ]);
}

// Obsidian Tunnels arrival (Chapter 7 — branching hub opener). The
// dialog id is shared across all 4 terminal entry nodes (tunnel_entry,
// north_tunnel, west_tunnel, pillar_passage). First visit from any
// direction fires it; subsequent re-entries from another arm skip via
// the completedEncounters force-isDone rescue. Mirrors PY
// encounter.py:create_obsidian_tunnels_arrival_encounter.
export function createObsidianTunnelsArrivalEncounter() {
  return new Encounter('obsidian_tunnels_arrival', 'The Obsidian Tunnels', 'Smooth obsidian tunnels branch in every direction.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You emerge from the lava chamber into a network of obsidian tunnels. The walls are impossibly smooth, reflecting your torchlight like dark mirrors. Something carved these passages long ago — this is no natural formation. The air is cooler here, and eerily still.'),
        new EncounterText('These tunnels branch in three directions. The stone is worked, not natural. I can make out what looks like a wide open space to the north, some kind of warm glow to the southeast, and older, more ornate carvings to the west.', 'Raena'),
        new EncounterText("An underground city, built inside a volcano. I've heard legends, but I never thought I'd see one with my own eyes.", 'Thorb'),
      ],
    }),
  ]);
}

// Lava Chamber arrival (Chapter 7 — second area opener). TEXT-only,
// one-time. Mirrors PY encounter.py:create_lava_chamber_arrival_encounter.
// Same encounter id is stamped on BOTH the bottom-entry (chamber_entry)
// and the future top-entry (upper_passage) node — the completedEncounters
// force-isDone rule ensures it fires exactly once regardless of direction.
export function createLavaChamberArrivalEncounter() {
  return new Encounter('lava_chamber_arrival', 'The Lava Chamber', 'A vast underground cavern filled with magma.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The tunnel opens into an enormous underground chamber. Rivers of sluggish magma wind between islands of cooled obsidian, casting everything in a hellish orange glow. The heat is nearly unbearable, and the air shimmers with waves of distortion.'),
        new EncounterText("By the forge-fires… this is where the mountain's blood flows. I can feel the heat through my boots. Stay on the solid ground and don't touch anything that glows.", 'Thorb'),
        new EncounterText('There — look at the far side. There\'s a path leading up. We need to cross this chamber to reach the tunnels above.', 'Raena'),
      ],
    }),
  ]);
}

// ============================================================
// Obsidian Wastes Encounters
// ============================================================

// Obsidian Golem random encounter — fires randomly while crossing the
// labyrinth. Mirrors PY encounter.py:create_obsidian_golem_encounter.
export function createObsidianGolemEncounter() {
  return new Encounter('obsidian_golem', 'Obsidian Golem', 'A golem of living obsidian blocks the path.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The ground trembles. A massive shape rises from the obsidian field — a golem of fused volcanic rock, its body crackling with each grinding movement.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'obsidian_golem',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      lootCards: ['obsidian_golem_loot'],
    }),
  ]);
}

// Obsidian Slime random encounter — fires randomly while crossing the
// labyrinth. Mirrors PY encounter.py:create_obsidian_slime_encounter.
export function createObsidianSlimeEncounter() {
  return new Encounter('obsidian_slime', 'Obsidian Slime', 'A mass of molten rock oozes toward you.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Something wet and heavy slithers across the obsidian. A slime of molten rock and volcanic glass oozes toward you, smaller blobs splitting off from its body as it moves.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'obsidian_slime',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      lootCards: ['obsidian_slime_loot'],
    }),
  ]);
}

// Obsidian Wastes arrival — PY copy. The party crosses into the lava
// flats north of Tharnag, with Val flagging the terrain risks.
// Mirrors PY encounter.py:create_obsidian_wastes_arrival_encounter.
export function createObsidianWastesArrivalEncounter() {
  return new Encounter('obsidian_wastes_arrival', 'The Obsidian Wastes', 'A vast field of frozen lava stretches before you.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The Obsidian Wastes. A nearly endless field of frozen lava stretches in every direction, black glass glinting under a pale sky.'),
        new EncounterText('The ground looks stable enough. Recent cold must have solidified the upper layers. We should be able to cross without too much trouble.', 'Thorb'),
        new EncounterText("Without too much trouble. Famous last words from a dwarf standing on a volcano's doorstep.", 'Raena'),
        new EncounterText('I can feel the heat through my boots already. The deeper layers are still molten.', 'Val'),
        new EncounterText("There's no obvious path, but I can see the Volcano's peak to the north. We head straight for it and hope for the best.", 'Thorb'),
        new EncounterText("Hope for the best. Wonderful strategy. Let's go, then — hopefully in one piece.", 'Raena'),
        new EncounterText('Stay close. I know how quickly the haze can swallow you out here.', 'Val'),
        new EncounterText('As you venture deeper into the wastes, thick volcanic haze rises from cracks in the obsidian, cutting visibility to a few dozen paces. Every direction looks the same.'),
      ],
    }),
  ]);
}

// Northern Wastes — TEXT-only rest stop. On completion the game heals
// up to 8 cards from the discard pile and transitions straight into
// the Qualibaf Volcano map. Mirrors PY encounter.py:create_wastes_north_encounter
// + game.py:4545 (post-completion heal + volcano transition).
export function createWastesNorthEncounter() {
  return new Encounter('wastes_north', 'Northern Wastes', 'You find shelter behind a rocky outcrop.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You spot a sheltered alcove between two massive obsidian pillars. The wind dies down here, and the heat from the wastes feels almost bearable.'),
        new EncounterText("Let's catch our breath while we can. The volcano's close now — I can feel the cold from here. Something unnatural about it.", 'Thorb'),
        new EncounterText('You rest briefly, tending your wounds and gathering your strength for what lies ahead.'),
      ],
    }),
  ]);
}

// ============================================================
// Tharnag Interior Encounters
// ============================================================

export function createGrandHallArrivalEncounter() {
  return new Encounter('grand_hall_arrival', 'The Grand Hall', 'The vast Grand Hall of Tharnag stretches before you.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("HOME! FINALLY! Behold, my friends — THARNAG! The Great Dwarven City! Greatest city in all the land, and don't let anyone from Qualibaf tell you otherwise!", 'Thorb'),
        new EncounterText('The Grand Hall opens before you like the inside of a mountain cathedral. Massive stone pillars, carved with the faces of ancient dwarven kings, rise into darkness far above. Braziers of molten forge-light line the staircases, casting everything in a warm amber glow.'),
        new EncounterText('Everywhere you look, dwarves are moving with purpose. Soldiers in heavy plate haul crates of crossbow bolts up the stairs. Engineers argue over fortification plans spread across stone tables. A squad of militia drills with axes near the far wall.'),
        new EncounterText('The siege has clearly taken its toll — you can see scorched stone where goblin fire-bombs struck, and hastily erected barricades block some of the lower passages. But the hall itself stands firm, ancient and defiant.'),
      ],
    }),
  ]);
}

// Leaving Tharnag — first time the party crosses back outside after
// the throne audience. Sets up the route to the Obsidian Wastes /
// Volcano. Mirrors PY encounter.py:create_tharnag_exit_encounter.
export function createTharnagExitEncounter() {
  return new Encounter('tharnag_exit', 'Leaving Tharnag', 'Thorb outlines the road ahead.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("We need to get to the Volcano to figure out what the Kobold army is doing. They've probably infested the old dwarven ruins of Thorgazad — the City of Old — that sit below the Volcano.", 'Thorb'),
        new EncounterText("Thorgazad... I've heard stories. An entire city swallowed by the mountain.", 'Raena'),
        new EncounterText("Aye. If we use the path from here directly north of Qualibaf Forest, it'll be faster — and we avoid the bridge area, which is probably also infested by Kobolds.", 'Thorb'),
        new EncounterText('So we head north through the wastes. How bad can it be?', 'Raena'),
        new EncounterText('The Obsidian Wastes? Frozen lava fields as far as the eye can see. Not much lives out there, which is either a comfort or a warning.', 'Thorb'),
        new EncounterText("I've patrolled the edges of the Wastes before. The ground shifts underfoot — obsidian is sharp and treacherous. Watch your step out there.", 'Val'),
        new EncounterText('Since when do you patrol lava fields?', 'Thorb'),
        new EncounterText("Since you vanished and someone had to keep this kingdom from falling apart. Let's move.", 'Val'),
      ],
    }),
  ]);
}

// Upper Stairs return — fires when the party heads back through the
// Grand Hall's upper stairs after the throne audience and Valdrisa.
// Sets up the Artisan Hall side trip. Mirrors PY
// encounter.py:create_upper_stairs_return_encounter.
export function createUpperStairsReturnEncounter() {
  return new Encounter('upper_stairs_return', 'Upper Stairs', 'Back in the Grand Hall.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("So, a prince. This whole time we've been adventuring with dwarven royalty and you never thought to mention it?", 'Raena'),
        new EncounterText("Would it have changed anything? Besides, 'prince' is a strong word. More like... fifteenth in line for the throne. Maybe sixteenth. I lost count.", 'Thorb'),
        new EncounterText('The King mentioned the Artisans. We should head to the Artisan Hall before we leave — see what supplies they can spare for the road ahead.', 'Raena'),
        new EncounterText("Right, the Artisan Hall is just off the lower stairs. Fair warning though — with the Great Forge cold, the smiths can't produce new work. Whatever they have in stock is all there is.", 'Thorb'),
        new EncounterText("Limited supplies are better than no supplies. Let's see what they've got.", 'Raena'),
      ],
    }),
  ]);
}

// Valdrisa Emberforge — joins the party as you leave the Personal
// Quarters. Mirrors PY encounter.py:create_valdrisa_encounter.
export function createValdrisaEncounter() {
  return new Encounter('valdrisa_encounter', 'Valdrisa Emberforge', 'A dwarven princess blocks your path.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('As you step into the hallway, a young dwarven woman in finely crafted armor steps out from an alcove, arms crossed. Her auburn hair is braided with gold rings, and her eyes burn with a fierce determination.'),
        new EncounterText('Going away without saying goodbye again, Thorbadin?', '???'),
        new EncounterText("Val... I— It's not like that. We have to move quickly—", 'Thorb'),
        new EncounterText("It's exactly like that. You vanished for months. Your father sends word you're alive, and before I can even see you, you're already packing to leave.", 'Valdrisa'),
        new EncounterText("Valdrisa Emberforge. Thorb's... betrothed.", 'Raena'),
        new EncounterText("Look, Val, the Kobolds are massing at the Volcano. If we don't stop them—", 'Thorb'),
        new EncounterText("Then you'll need someone who can actually keep you alive out there. I'm coming with you.", 'Valdrisa'),
        new EncounterText('Absolutely not. Father would—', 'Thorb'),
        new EncounterText("Your father gave me this armor himself. He knows I'm twice the fighter you are, and he'd rather have me watching your back than some hired swords.", 'Valdrisa'),
        new EncounterText("She's got you there.", 'Raena'),
        new EncounterText('...Fine. But you follow my lead out there.', 'Thorb'),
        new EncounterText('Of course, my prince.', 'Valdrisa'),
        new EncounterText("Call me Val. All of you. And let's get moving before Thorb changes his mind.", 'Valdrisa'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['valdrisa_card'],
      lootTitle: 'Val joins the party!',
    }),
  ]);
}

// Personal Quarters — bed rest. Mirrors PY
// encounter.py:create_quarters_rest_encounter.
export function createQuartersRestEncounter() {
  return new Encounter('quarters_rest', 'Rest', 'A well-earned rest in the Personal Quarters.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The bed is surprisingly comfortable for dwarven make — thick furs piled atop a stone frame, warm from the forge-heated walls.'),
        new EncounterText('You sink into the furs and sleep overtakes you almost instantly. For the first time in days, you rest without one eye open.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'Rest for the night?',
      choices: [
        new EncounterChoice(
          'Sleep',
          'You sleep soundly through the night, waking refreshed and ready.',
          'quarters_rest', 0,
        ),
        new EncounterChoice(
          'Not yet',
          'You decide to look around a bit more first.',
          '', 0,
        ),
      ],
    }),
  ]);
}

// Personal Quarters — chest of belongings. Mirrors PY
// encounter.py:create_quarters_chest_encounter. Drops 50 gold +
// Queen's Locket. One-shot.
export function createQuartersChestEncounter() {
  return new Encounter('quarters_chest', 'Chest with Personal Belongings', 'A wooden chest left for the party.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The chest has been prepared with care. A note on top reads: 'For the companions of Prince Thorbadin. May these serve you well on the road ahead. - By order of King Thorgrim.'"),
        new EncounterText("Inside the chest, nestled in velvet, lies a delicate golden locket set with a pale blue gem. A small card reads: 'From Queen Eirdrís. Keep my son safe.'"),
        new EncounterText('Prince Thorbadin?', 'Raena'),
        new EncounterText("Don't. Just... don't.", 'Thorb'),
        new EncounterText("Your mother's locket? Thorb...", 'Raena'),
        new EncounterText('She always said it brought her luck. I suppose she wants it to bring us some too.', 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGold: 50,
      lootCards: ['queens_locket'],
      lootTitle: 'Personal Belongings',
    }),
  ]);
}

// Throne Room arrival — first sight of the King + the family reveal.
// Mirrors PY encounter.py:create_throne_room_arrival_encounter.
export function createThroneRoomArrivalEncounter() {
  return new Encounter('throne_room_arrival', 'The Throne Room', 'The Throne Room of Tharnag.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The Throne Room of Tharnag is a sight to behold. Enormous pillars of dark stone frame a raised dais, upon which sits a throne carved from a single block of obsidian. And upon that throne sits a broad-shouldered dwarf with a magnificent silver beard braided with golden rings.'),
        new EncounterText('THORBADIN! MY SON! You have come back!', 'King Thorgrim'),
        new EncounterText('The King rises from his throne and descends the steps with surprising speed for his age. He seizes Thorb in a crushing embrace that lifts the younger dwarf clean off his feet.'),
        new EncounterText('Come here so your father can see you! Let me look at you after all this time!', 'King Thorgrim'),
        new EncounterText('...Son? THORB, is there something you want to tell us?', 'Raena'),
        new EncounterText("He's... my father. And I was SUPPOSED to marry some Northern Dwarven Princess. No way I was going to do that this young!", 'Thorb'),
        new EncounterText('How old ARE you exactly?', 'Raena'),
        new EncounterText('A hundred and twenty-five years young!', 'Thorb'),
      ],
    }),
  ]);
}

// Throne audience — the White Claw briefing + the King's blessing.
// Mirrors PY encounter.py:create_throne_audience_encounter.
export function createThroneAudienceEncounter() {
  return new Encounter('throne_audience', 'Audience with the King', 'An audience with King Thorgrim.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The King pulls back from the embrace, his hands still on Thorb's shoulders. His expression shifts from joy to concern."),
        new EncounterText('I am so glad you are back, son. Finally ready to accept your destiny!', 'King Thorgrim'),
        new EncounterText('Father... not exactly. But we bring urgent news from Qualibaf. An army of kobolds is preparing to besiege the city. Many clans have been united under something called the White Claw — whatever or whoever that is.', 'Thorb'),
        new EncounterText('This is concerning indeed. But as you may have seen, we are dealing with our own goblin problems! I cannot spare many resources. And worse — the flow of lava from the volcano has stopped. The Great Forge is cold when we need it most.', 'King Thorgrim'),
        new EncounterText("But Father — my King — it HAS to be related! The kobolds, this White Claw... they're messing with the Volcano, and it's lowering the temperature of the whole valley! The snow, the ice in the mountains — the signs are all there!", 'Thorb'),
        new EncounterText('Hmm... perhaps you are right. In any case, thanks in no small part to your efforts and your friends here, the siege is broken for now. But they will come back. And eventually they will attack the tunnels as well.', 'King Thorgrim'),
        new EncounterText('Thorb! My son! I commend you for bringing these tidings to me. Investigate the Volcano and this White Claw. I will ask the Artisans to assist you on your quest. May Moradin guide your hammer and see you home safe!', 'King Thorgrim'),
      ],
    }),
  ]);
}

// Part 1 ending — fires after the Varimatras encounter completes
// and the party is teleported back to the Tharnag throne room.
// Wraps up the volcano arc and seeds the Part 2 conflict (goblin
// armies + dark-elf scouts in the Deep Roads). The final beat
// directs the player to go rest in their room — the quarters_rest
// handler then fades to the main menu since dragonSlain is set.
export function createTharnagPart1EndingEncounter() {
  return new Encounter('tharnag_part1_ending', 'Return to Tharnag', 'A homecoming after the dragon.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      phaseTitle: 'Return to Tharnag',
      texts: [
        new EncounterText('The descent is a blur. Snow, then sleet, then the warm pulse of dwarven stone underfoot. You stumble through the Tharnag gate with soot in your hair, frost still melting from your cloaks, and the white-pulsing egg cradled tight between you.'),
        new EncounterText('Word travels faster than tired feet. By the time the guards usher you up the staircase and into the throne room, half the city already knows.'),
        new EncounterText('By the deeps. By the DEEPS. You walked up that mountain, killed the thing that was choking us, and walked back DOWN.', 'King Thorgrim'),
        new EncounterText('The King is on his feet before you reach the dais — silver beard still braided with gold rings, but his eyes wet. He claps Thorb so hard on the shoulder you hear the armor ring.', '!'),
        new EncounterText('The volcano sings again. The smiths felt it half an hour before you arrived — the flow is BACK. The Great Forge will be lit by midnight, first time in twenty years. Hammers will ring in this hall again.', 'King Thorgrim'),
        new EncounterText('His gaze drops to the egg cradled in Raena\'s arms. Pause. He decides not to ask. Yet.', '!'),
        new EncounterText('But it is not all good news. Word has come up the Deep Roads while you were on the mountain. Goblin warbands — three, maybe four — moving in columns I have not seen the shape of since my grandfather\'s day.', 'King Thorgrim'),
        new EncounterText('And worse. Every column carries Drow scouts. Dark elves walking openly under torchlight, banners and all. Something old is moving in the deep places of the world.', 'King Thorgrim'),
        new EncounterText('But that is a tale for another season. Tonight, you rest. The forge will burn. Your weapons will sing again. And the quarters Thorb\'s mother kept ready for him these forty years are open to you all.', 'King Thorgrim'),
        new EncounterText('The hall erupts. Dwarves pour in with horns of dark ale, with bread and cheese the size of shields, with songs your party is too tired to follow.', '!'),
        new EncounterText('When you are ready, go rest in your room.', '!'),
      ],
    }),
  ]);
}

// Grand Staircase arrival — Thorb's homecoming dialog. Mirrors PY
// encounter.py:create_grand_staircase_arrival_encounter.
export function createGrandStaircaseArrivalEncounter() {
  return new Encounter('grand_staircase_arrival', 'The Grand Staircase', 'A monumental staircase hewn from the living rock.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("It's been years since I walked these stairs. Years! It's... it's really good to be back.", 'Thorb'),
        new EncounterText('Years? You RAN AWAY from a dwarven city? What could possibly make someone leave all this behind?', 'Raena'),
        new EncounterText("I didn't RUN AWAY! I... left. Strategically. My father wanted me to marry some Northern Dwarven Princess. Can you imagine? ME? Married? At my age?", 'Thorb'),
        new EncounterText('...!!', 'Raena'),
        new EncounterText("Anyway! Enough about that. Let's go meet the King and tell him why we're here in the first place.", 'Thorb'),
        new EncounterText("Yes, though it looks like they have their own problems with that goblin army outside. I'm not sure how many resources they'll be able to spare for the kobolds menacing Qualibaf.", 'Raena'),
        new EncounterText("We've always had trouble with goblins, but usually they attack from underground and never in any real numbers. This is... different. Come, let's head up to see the King.", 'Thorb'),
      ],
    }),
  ]);
}

// Dwarven Tavern — short dialog, then auto-open shop. Mirrors PY
// encounter.py:create_dwarven_tavern_encounter. Three branches:
//   - pre-dragon (default): original recruitment dialog.
//   - post-dragon, first visit: hero dialog + LOOT phase that
//     hands the player a free Whitescale Brew.
//   - post-dragon, revisit: short hero-welcome dialog only; the
//     shop auto-opens after the text closes.
export function createDwarvenTavernEncounter(opts = {}) {
  const { dragonSlain = false, freebieGiven = false } = opts;
  if (dragonSlain && !freebieGiven) {
    return new Encounter('dwarven_tavern', 'Dwarven Tavern', 'A warm tavern in the Artisan Hall — the hearth roars again.', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText("The tavern has changed. The hearth roars again — sparks chasing each other up the new flue. Three or four extra tables have been dragged in, and every one of them is full of dwarves shouting toasts."),
          new EncounterText("The barkeep spots you the moment you cross the threshold. He puts down the mug he was polishing, drops it actually, and waves you over with both hands.", 'Barkeep'),
          new EncounterText("\"Look who walks in. Sit, sit — we've been pouring for ye all week and ye finally show up. The whole mountain's talkin' about Varimatras's head!\"", 'Barkeep'),
          new EncounterText("He turns, shouts something in dwarvish toward the cellar hatch. A younger dwarf scurries off and returns hauling a frost-rimed cask between two arms, condensation beading on the staves.", '!'),
          new EncounterText("\"We tapped a barrel we'd been holdin' for the day the dragon fell. Whitescale Brew — frost-herb mead, served cold as her scales. First one's on the house. The first one ALWAYS is, for heroes like ye.\"", 'Barkeep'),
          new EncounterText("A dwarven scout at the bar raises his mug. \"To the dragon-slayers!\" The whole room follows. The cheer rattles dust from the ceiling.", '!'),
        ],
      }),
      new EncounterPhaseData({
        phaseType: EncounterPhase.LOOT,
        lootCards: ['whitescale_brew'],
      }),
    ]);
  }
  if (dragonSlain) {
    return new Encounter('dwarven_tavern', 'Dwarven Tavern', 'A warm tavern in the Artisan Hall.', [
      new EncounterPhaseData({
        phaseType: EncounterPhase.TEXT,
        texts: [
          new EncounterText("The barkeep grins as you push the door open. \"Welcome back, hero! Another Whitescale Brew?\"", 'Barkeep'),
          new EncounterText("He sets a fresh mug on the bar, frost beading on the side. \"This one's on yer coin — house freebie was a one-time deal. Worth every copper though.\"", 'Barkeep'),
        ],
      }),
    ]);
  }
  return new Encounter('dwarven_tavern', 'Dwarven Tavern', 'A warm tavern in the Artisan Hall.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The tavern is carved into the rock wall, its low ceiling blackened by centuries of hearth smoke. A handful of dwarves sit at stone tables, nursing mugs of dark ale.'),
        new EncounterText("The barkeep, a stout dwarf with a braided beard reaching his belt, nods as you approach. \"What'll it be? We've still got brew, even if the forge is cold.\"", 'Barkeep'),
        new EncounterText('A few younger dwarves at the corner table look up with interest. One of them, lean and sharp-eyed with a light crossbow propped against his chair, speaks up.'),
        new EncounterText("\"You're the ones heading out to deal with the White Claw, aye? We've been sitting here long enough. Some of us are scouts — we know the mountain passes better than anyone.\"", 'Dwarven Scout'),
        new EncounterText("\"Could use eyes on the road ahead. Buy a round and we'll talk business.\"", 'Barkeep'),
      ],
    }),
  ]);
}

// Dwarven Smithy — short dialog, then auto-open shop. Mirrors PY
// encounter.py:create_dwarven_smithy_encounter.
//
// Post-dragon (dragonSlain=true) the smith opens up the reserved
// hero-tier stock — Throwing Axe, Warhammer, Ironforge Chainmail,
// Miner's Pickaxe, Runeforged Buckler. The shop-inventory branch in
// main.js (buildDwarvenSmithyInventory) mirrors the dialog so the
// player sees the new gear on the shelves immediately.
export function createDwarvenSmithyEncounter(dragonSlain = false) {
  const texts = dragonSlain
    ? [
        new EncounterText("The smithy is roaring now — bellows pumping, sparks flying, the air thick with the smell of hot iron. The Great Forge is back online and you can hear the rhythm of hammers from a dozen anvils at once."),
        new EncounterText("A scarred dwarven smith looks up from a glowing blade, takes one look at you, and lets out a low whistle. \"Now I know who slew the dragon. The whole mountain's been talkin' about ye.\"", 'Smith'),
        new EncounterText("\"For ye, I'll bring out the good stock — the work I keep in the back for heroes. None of this picked-over street tray. Take yer pick.\"", 'Smith'),
      ]
    : [
        new EncounterText("The smithy is enormous — rows of anvils and quenching troughs stretch back into the darkness. Without the Great Forge's heat, only a few small fires still burn."),
        new EncounterText("A scarred dwarven smith looks up from polishing a crossbow. \"Can't make new work without the Forge, but we've got stock. Finest dwarven craft — built to last a thousand years.\"", 'Smith'),
      ];
  return new Encounter('dwarven_smithy', 'Dwarven Smithy', 'The finest dwarven arms and armor.', [
    new EncounterPhaseData({ phaseType: EncounterPhase.TEXT, texts }),
  ]);
}

// ============================================================
// Dwarven City — Entry Corridor / Gate
// ============================================================

export function createEntryCorridorArrivalEncounter() {
  // Mirrors PY encounter.py:create_entry_corridor_arrival_encounter —
  // the exposed climb into the ruined lookout. Replaces the earlier
  // placeholder text that read like a generic dwarven hallway.
  return new Encounter('entry_corridor_arrival', 'The Ruined Lookout', 'A destroyed dwarven outpost clings to the mountainside.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You scramble up the frozen slope toward the vents. The floor has given way in places — nothing but mountain air and a long drop to the rocks below. The only way forward is along the wall, using handholds carved by dwarven masons centuries ago.'),
        new EncounterText('One at a time. Test every hold before you trust it.', 'Valdrisa'),
        new EncounterText("Below, the kobold army is a seething carpet of scales and torchlight. A war horn sounds — they've spotted movement on the cliff face. Arrows clatter against the stone beneath you, but you're too high. The kobolds shriek and snarl, loosing volley after volley that falls short. For now."),
        new EncounterText("Raena's foot slips and she swings out over the void for a heart-stopping moment before Thorb catches her wrist."),
        new EncounterText("I've got you. Don't look down.", 'Thorb'),
        new EncounterText("You haul yourselves up and collapse onto solid ground. This used to be a dwarven lookout post — you can see where the watchtower stood, but the rest has been ripped clean off the mountainside. What's left is a corridor of broken stone hanging out over the cliff face, burrowing deeper into the mountain."),
      ],
    }),
  ]);
}

export function createCorridorGateApproachEncounter() {
  // Mirrors PY encounter.py:create_corridor_gate_approach_encounter —
  // TEXT-only. The earlier JS port wedged an Obsidian Golem fight in
  // here, but PY treats this beat as pure dialog: the corridor opens
  // into Thorgazad's upper gate and the party steps through. The
  // three city random encounters (slyblade / specter / drake rider)
  // cover the combat side via the corridor_ruins random roll.
  return new Encounter('corridor_gate_approach', 'The Gate Ahead', 'The corridor opens into a massive dwarven gate.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText("The corridor widens and the stonework improves. Through the gloom, a massive archway emerges — one of Thorgazad's upper city gates, dwarven runes etched deep into the stone. The gate stands open. Something has been through here recently."),
        new EncounterText('You step through into a grand entrance hall. Vaulted ceilings rest on pillars carved as dwarven warriors — most defaced, their stone faces smashed. Kobold claw marks cover the walls. Patrol routes scratched into the floor.', 'Valdrisa'),
        new EncounterText("They've been through here in force, but it looks like they pulled back weeks ago. Stay sharp — patrols could still sweep through this area.", 'Thorb'),
      ],
    }),
  ]);
}

export function createGateGuardroomEncounter() {
  // Mirrors PY encounter.py:create_gate_guardroom_encounter — the
  // "Old Guardroom" beat. Earlier port used a generic 'search_camp'
  // effect that rolled the camp/abandoned loot list. PY actually
  // rolls the dwarven_market_loot table here (same table as the
  // Obsidian Market salvage), so the find is dwarven gear, not
  // bandages and chicken legs.
  return new Encounter('gate_guardroom', 'The Old Guardroom', 'A ruined guardroom beside the gate.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('A side chamber opens off the main hall — an old guardroom. Weapon racks line the walls, long since emptied. A stone table sits in the center, covered in dust and kobold scratch marks.'),
        new EncounterText('They used this as a staging area. Maps scratched into the table, patrol routes maybe. Looks like they pulled out weeks ago.', 'Valdrisa'),
        new EncounterText("There's something else here. A dwarven journal, half-buried under rubble. The last entry mentions sealing the lower passages and retreating to the Artisan District. It speaks of deep tunnels leading to workshops and forges beyond the Hall of Ancestors.", 'Raena'),
        new EncounterText("The Artisan District… that's deeper in, past the Hall and through the tunnels. If there were survivors, that's where they'd have made their stand.", 'Thorb'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'Search the outpost?',
      choices: [
        new EncounterChoice(
          'Search the remains',
          'You sift through the scattered equipment and rubble. Most has been picked clean by kobolds, but wedged under an overturned rack you find something they missed — dwarven-made, still in good condition.',
          'guardroom_loot', 0, { returnToChoices: true },
        ),
        new EncounterChoice(
          // Empty result_text → encounter completes immediately on
          // click without a result page. Avoids the wrong "You leave
          // the guardroom undisturbed" message after the player has
          // already searched the place.
          'Leave',
          '',
          '', 0, { completesEncounter: true },
        ),
      ],
    }),
  ]);
}

export function createGatePassageEncounter() {
  // Mirrors PY encounter.py:create_gate_passage_encounter — the
  // descent into the Hall of Ancestors. Earlier JS port used a
  // generic 2-line "passage deeper into the city" filler; this is
  // the real PY dialog (4 lines, with Thorb explaining the Sky
  // Shaft and Valdrisa flagging the kobold tracks + branches).
  return new Encounter('gate_passage', 'Into Thorgazad', 'The passage descends into the Hall of Ancestors.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('A broad stairway descends into darkness. The air grows warmer with each step. You can smell wood smoke — something is burning down there. Something recent.'),
        new EncounterText('The stairway opens into an enormous hall. Massive pillars carved as dwarven warriors stand in rows, gazing down from the shadows. And there — real sunlight, pouring down from a shaft cut straight through the mountain above.'),
        new EncounterText('The Sky Shaft. The dwarves carved it centuries ago so their ancestors could still feel the sun. Polished mirrors and crystal lenses catch the beam and scatter it across the hall. Most are cracked now, but enough still work.', 'Thorb'),
        new EncounterText("Kobold tracks everywhere — fresh ones. They're using this hall as a crossroads. Passages branch in every direction. Monument Alley to the west, the Artisan District to the east, and the King's District to the north.", 'Valdrisa'),
      ],
    }),
  ]);
}

// ============================================================
// Dwarven City — Hall of Ancestors
// ============================================================

export function createRugaSlaveMasterEncounter() {
  // Mirrors PY encounter.py:create_ruga_encounter. Old JS port read
  // Ruga as a small ogre; PY frames him as the biggest kobold the
  // party has ever seen, descending into a sunlit arena with his
  // horde chanting around him.
  return new Encounter('ruga_slave_master', 'Ruga the Slave Master', "The largest kobold you've ever seen blocks the way.", [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The Sky Shaft opens before you — a vast chamber where true sunlight streams down from a shaft cut through the mountain above. The room appears empty at first.'),
        new EncounterText('Then heavy footsteps echo from the grand stairway. The biggest kobold you have ever seen descends into the light — easily twice the height of a normal kobold, muscles bulging beneath scarred hide. He carries a massive iron chain in each fist.'),
        new EncounterText('Dozens of smaller kobolds pour in behind him, forming a ring around the chamber. They bang weapons against shields, creating a makeshift arena. Their chanting fills the hall.'),
        new EncounterText("I am Ruga! Slave Master of the deep warrens! You think you can walk through MY city? I'll break you like I broke the dwarves!", 'Ruga'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'ruga_slave_master',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Ruga collapses with a thunderous crash. The chanting stops. For a moment, the kobold horde stares in stunned silence at their fallen champion.'),
        new EncounterText('Then panic. The kobolds scatter in every direction, fleeing into the darkness of side passages and stairwells. Within moments, the Sky Shaft is empty and silent once more.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [4, 6],
      // PY drops Ruga's Spiked Gauntlets + the 50%-gated city drake
      // loot table. drake_rider_loot is the unified table; gauntlets
      // is the signature drop.
      lootCards: ['rugas_spiked_gauntlets', 'drake_rider_loot'],
    }),
  ], true);
}

export function createMonumentAlleyEntryEncounter() {
  // Mirrors PY encounter.py:create_monument_alley_entry_encounter.
  // Replaces the earlier 2-line filler with the PY 2-block dialog
  // (corridor reveal + Valdrisa's kobold-shortcut observation).
  return new Encounter('monument_alley_entry', 'Monument Alley', 'A long corridor of dwarven monuments stretches before you.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The passage opens into a long, wide corridor. Stone monuments rise on both sides — carved tablets, statues, and obelisks commemorating centuries of dwarven history. A massive statue sits at the center, dividing the path into two.'),
        new EncounterText("Kobold patrols have been through here. Some of the monuments have been smashed, others scratched with crude markings. But this doesn't look like their territory — more like a shortcut they use between districts.", 'Valdrisa'),
      ],
    }),
  ]);
}

// ============================================================
// Dwarven City — Tomb
// ============================================================

export function createTombOfAncestorEntryEncounter() {
  return new Encounter('tomb_of_ancestor_entry', 'Tomb of the Ancestor', 'A sacred dwarven tomb', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You enter a sacred tomb carved deep into the mountain\'s heart. The air is cool and still, heavy with reverence.'),
        new EncounterText('Golden light spills from rune-etched braziers that have burned for centuries without fuel, casting warm shadows across the vaulted ceiling.'),
        new EncounterText('You sense a presence here — not hostile, but watchful. The ancestor spirits have not abandoned this place.'),
      ],
    }),
  ]);
}

export function createTombSarcophagusEncounter() {
  // Mirrors PY encounter.py:create_tomb_sarcophagus_encounter — the
  // three Founder spirits beckon. CHOICE: fight or leave. After the
  // fight, the party gets the Summon Ancestor card and a rest beat
  // at the sarcophagus. PY uses a separate _rest variant after the
  // ancestors_defeated flag flips; we lean on canRevisit + the
  // global completedEncounters latch instead.
  return new Encounter('tomb_sarcophagus', 'The Sarcophagus', 'Translucent forms shimmer around the ancient tomb.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('As you approach the sarcophagus, the air grows heavy. Three translucent forms shimmer into existence around the tomb — dwarven kings in ancient armor, their eyes burning with cold blue light. They beckon you closer.'),
        new EncounterText('Ancestors above… those are the old kings. Durin Stoneheart, Balgrim Ironvein, and Thordak Ashmantle. The founders.', 'Thorb'),
        new EncounterText("I don't think they're offering a handshake. Look at their weapons.", 'Valdrisa'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The ancestor spirits watch you with unreadable expressions.',
      choices: [
        new EncounterChoice(
          'Approach the sarcophagus',
          'The spirits raise their weapons. They will test your worth.',
          'ancestor_fight', 0,
        ),
        new EncounterChoice(
          'Leave them in peace',
          '',
          '', 0, { completesEncounter: true },
        ),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'ancestor_spirits',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootCards: ['summon_ancestor'],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The ancestor spirits lower their weapons and bow deeply. A warm light fills the tomb as their forms begin to fade.'),
        new EncounterText('You have proven your worth, outsider. The strength of Thorgazad\'s founders is yours to call upon.', 'Durin Stoneheart'),
        new EncounterText('The light settles into the sarcophagus. When you look inside, a glowing rune hovers above the stone — the mark of the ancestors.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The tomb is quiet now. A sense of peace fills the chamber.',
      choices: [
        new EncounterChoice(
          'Rest among the ancestors',
          'You rest in the sacred tomb. The warmth of the ancestors soothes your wounds.',
          'ancestor_rest', 8, { completesEncounter: true },
        ),
        new EncounterChoice(
          'Leave',
          '',
          '', 0, { completesEncounter: true },
        ),
      ],
    }),
  ]);
}

// Tomb Sarcophagus rest-only revisit — after the ancestor_spirits
// fight is won, the node fires this trimmed variant instead of the
// full 6-phase flow. Mirrors PY encounter.py:6503-6526.
export function createTombSarcophagusRestEncounter() {
  return new Encounter('tomb_sarcophagus_rest', 'The Sarcophagus', 'The tomb is quiet. The warmth of the ancestors lingers.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The tomb is quiet now. A sense of peace fills the chamber.',
      choices: [
        new EncounterChoice(
          'Rest among the ancestors',
          'You rest in the sacred tomb. The warmth of the ancestors soothes your wounds.',
          'ancestor_rest', 8, { completesEncounter: true },
        ),
        new EncounterChoice(
          'Leave',
          '',
          '', 0, { completesEncounter: true },
        ),
      ],
    }),
  ]);
}

// ============================================================
// Dwarven City — Stairs / Throne
// ============================================================

export function createGrandStairsEntryEncounter() {
  // Mirrors PY encounter.py:create_grand_stairs_entry_encounter.
  // Earlier JS used a generic 2-line "grand staircase / dwarven
  // craftsmanship" filler; this is the PY dialog (3 blocks with
  // Valdrisa + Thorb tagging the kobold command post above).
  return new Encounter('grand_stairs_entry', 'The Grand Stairs', 'A monumental stairway climbs toward the King\'s District.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The northern passage opens into a vast stairway — the Grand Stairs of Thorgazad. Massive pillars flank the steps, carved with the faces of every king who ever ruled this city. Ice hangs from the ceiling in long, jagged teeth.'),
        new EncounterText("There's firelight at the top. And voices — kobold voices. Lots of them.", 'Valdrisa'),
        new EncounterText('The King\'s District. If the White Claw has set up a command post in this city, it\'ll be up there. Stay close and keep quiet.', 'Thorb'),
      ],
    }),
  ]);
}

export function createDwarvenThroneRoomEntryEncounter() {
  return new Encounter('dwarven_throne_room_entry', 'The Throne Room', "The ruined throne room of Thorgazad's kings.", [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The archway opens into a cavernous hall. Towering pillars rise on both sides, their surfaces cracked and covered in frost. Tattered banners hang from the ceiling — the colors of Thorgazad, faded to grey.'),
        new EncounterText('At the far end of the hall, upon a raised stone dais, sits the throne. Carved from a single block of obsidian, it has endured where everything else has crumbled. Kobold markings cover the steps leading up to it.', 'Thorb'),
        new EncounterText("They've been using this place. Recently. Look — the fires are still warm.", 'Val'),
      ],
    }),
  ]);
}

export function createThroneSpecterEncounter() {
  // PY parity (encounter.py:create_throne_specter_encounter): just
  // the king's challenge → fight → loot. No post-fight TEXT.
  return new Encounter('throne_specter', 'The Fallen King', 'A spectral figure sits upon the cracked throne.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('As you approach the throne, the air turns deathly cold. A spectral figure materializes on the stone seat — the ghost of a dwarven king, still wearing a crown of tarnished mithril. His hollow eyes fix on you with ancient fury.'),
        new EncounterText('"You dare trespass in my hall? I am the last king of Thorgazad, and I will not suffer the living to desecrate what remains."', 'The Fallen King'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.COMBAT,
      enemyId: 'dwarven_specter',
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.LOOT,
      lootGoldDice: [2, 6],
      lootCards: ['dwarven_specter_loot'],
    }),
  ]);
}

// ============================================================
// Dwarven City — Map Room
// ============================================================

export function createMapRoomEntryEncounter() {
  // PY parity (encounter.py:create_map_room_entry_encounter).
  return new Encounter('map_room_entry', 'The Map Room', 'A hidden chamber behind the throne.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('Behind the throne, a narrow passage opens into a chamber you would never have found without clearing the room. A massive stone table dominates the space, its surface carved with an intricate map of the entire volcano — every tunnel, every chamber, every passage laid out in precise detail.'),
        new EncounterText('This is the war room. The kings of Thorgazad planned their defenses from this table. Every passage in and out of the mountain is marked here.', 'Thorb'),
        new EncounterText('Look — someone has been adding to the map. Fresh markings, kobold script. They\'ve been mapping their own movements through the city.', 'Val'),
      ],
    }),
  ]);
}

export function createMapTableEncounter() {
  // PY parity (encounter.py:create_map_table_encounter). Two choices:
  // Copy the map (one-time, grants Map Knowledge — reduces random
  // encounter chance step from 7% → 5% across upper city + volcano
  // underground) and Rest (one-time +8 HP).
  return new Encounter('map_table', 'The Map Table', 'A detailed map of the volcano carved in stone.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('You lean over the massive stone table. Every passage, chamber, and tunnel in the volcano is carved in meticulous detail. Kobold additions — scratched in a cruder hand — mark recent patrol routes and supply caches.'),
        new EncounterText('This is invaluable. If we copy the key routes, we\'ll know every shortcut and ambush point in the mountain.', 'Val'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The war table awaits.',
      choices: [
        new EncounterChoice(
          'Copy relevant map information',
          'You carefully trace the key routes and passages onto parchment. This knowledge will serve you well.',
          'map_table_copy', 0, { returnToChoices: true },
        ),
        new EncounterChoice(
          'Rest here for a while',
          'You rest in the quiet map room. The thick stone walls muffle all sound from outside.',
          'map_table_rest', 0, { returnToChoices: true },
        ),
        new EncounterChoice(
          'Leave',
          '',
          '', 0, { completesEncounter: true },
        ),
      ],
    }),
  ]);
}

// Map Table revisit — skips the TEXT intro, drops straight into the
// choice prompt. Mirrors PY encounter.py:create_map_table_revisit_encounter.
export function createMapTableRevisitEncounter() {
  return new Encounter('map_table_revisit', 'The Map Table', 'The war room map awaits.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The war table awaits.',
      choices: [
        new EncounterChoice(
          'Copy relevant map information',
          'You carefully trace the key routes and passages onto parchment. This knowledge will serve you well.',
          'map_table_copy', 0, { returnToChoices: true },
        ),
        new EncounterChoice(
          'Rest here for a while',
          'You rest in the quiet map room. The thick stone walls muffle all sound from outside.',
          'map_table_rest', 0, { returnToChoices: true },
        ),
        new EncounterChoice(
          'Leave',
          '',
          '', 0, { completesEncounter: true },
        ),
      ],
    }),
  ]);
}

// ============================================================
// Dwarven City — Tunnels / Artisan
// ============================================================

export function createDeeperTunnelsEntryEncounter() {
  // Mirrors PY encounter.py:create_deeper_tunnels_entry_encounter.
  return new Encounter('deeper_tunnels_entry', 'The Deeper Tunnels', 'A long tunnel descends toward the Artisan District.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The eastern passage drops steeply, carved steps giving way to a long tunnel lined with columns and old torch sconces. Some still burn with a faint magical flame that has endured for centuries. The air grows warmer and smells of soot and hot metal.'),
        new EncounterText('These tunnels connect the Hall of Ancestors to the Artisan District. The craftsmen used them every day. Kobold patrols have been through here — watch for ambushes in the dark.', 'Thorb'),
      ],
    }),
  ]);
}

// Tunnel to Bridge exit — fires on first arrival at the bridge end
// of the obsidian tunnel. Sets the scene before the player steps
// onto the bridge proper. No PY equivalent — JS-only entry-point
// dialog so the gate reads as a doorway rather than an instant
// teleport.
export function createTunnelToBridgeExitEncounter() {
  return new Encounter('tunnel_to_bridge_exit', 'End of the Tunnel', 'The tunnel opens onto something vast.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The tunnel opens into a wide stone landing. Wind howls in from a cavernous space ahead — colder, deeper, alive with sound. Whatever lies beyond is BIG.'),
        new EncounterText("That's the chasm. The bridge spans it. If we're going to the other side, we cross there.", 'Thorb'),
      ],
    }),
  ]);
}

// Tunnel to Bridge entry — fires on arrival from the Artisan District
// (artisan_exit → bridge_tunnel_entry). PY parity (encounter.py:
// create_tunnel_to_bridge_entry_encounter).
export function createTunnelToBridgeEntryEncounter() {
  return new Encounter('tunnel_to_bridge_entry', 'Obsidian Tunnel', 'The tunnels grow darker as obsidian veins thicken.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The passage from the Artisan District plunges downward. The walls shift from carved stone to raw rock, threaded with thick veins of obsidian that drink the torchlight. The air grows colder with each step.'),
        new EncounterText("These tunnels are old. Older than the city. The dwarves didn't carve these — they just widened what was already here.", 'Thorb'),
        new EncounterText("Kobold tracks in the dust, but fewer now. Whatever patrols used these tunnels, they don't come this way often.", 'Val'),
      ],
    }),
  ]);
}

export function createArtisanDistrictEntryEncounter() {
  return new Encounter('artisan_district_entry', 'The Artisan District', 'Workshops and forges above rivers of lava.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The tunnel opens into a vast cavern. Below, rivers of slow-moving lava cast an orange glow across everything. Above the lava, platforms of stone and iron hold rows of workshops and forges — the Artisan District of Thorgazad.'),
        new EncounterText("This is where the finest dwarven weapons and armor were made. If there's anything useful left in this city, it's here. Dwarven tools don't rust easy.", 'Thorb'),
        new EncounterText("The kobolds have been picking through the workshops. Some of the forges look like they've been relit recently.", 'Val'),
      ],
    }),
  ]);
}

export function createArtisanWorkshopEncounter() {
  return new Encounter('artisan_workshop', 'Intact Workshop', 'A sealed dwarven workshop, untouched by time.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.TEXT,
      texts: [
        new EncounterText('The door is sealed tight — no handle, no keyhole. Just smooth stone with dwarven runes etched around the frame.'),
        new EncounterText("Thorb runs his fingers along the runes, pressing them in a specific sequence. There's a deep click, and the door slides silently into the wall.", 'Thorb'),
        new EncounterText('Every dwarf learns the opening sequence as a child. Keeps the good tools safe from thieves and kobolds.', 'Thorb'),
        new EncounterText('Inside, the workshop is pristine. A dwarven workbench sits against the far wall, its tools still gleaming. Reinforcement plates, rivets, and padding line the shelves. Everything needed to harden a piece of armor.'),
      ],
    }),
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The dwarven workbench is ready.',
      choices: [
        new EncounterChoice('Reinforce a piece of armor', '', 'workbench_armor', 0, { returnToChoices: true }),
        new EncounterChoice('Rest here for a while', '', 'workbench_rest', 0, { returnToChoices: true }),
        new EncounterChoice('Leave', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// Artisan Workshop revisit — skips the rune-door intro and drops
// straight into the workbench choice prompt. Mirrors PY
// encounter.py:create_artisan_workshop_revisit_encounter.
export function createArtisanWorkshopRevisitEncounter() {
  return new Encounter('artisan_workshop_revisit', 'Intact Workshop', 'The dwarven workbench awaits.', [
    new EncounterPhaseData({
      phaseType: EncounterPhase.CHOICE,
      choicePrompt: 'The dwarven workbench is ready.',
      choices: [
        new EncounterChoice('Reinforce a piece of armor', '', 'workbench_armor', 0, { returnToChoices: true }),
        new EncounterChoice('Rest here for a while', '', 'workbench_rest', 0, { returnToChoices: true }),
        new EncounterChoice('Leave', '', '', 0, { completesEncounter: true }),
      ],
    }),
  ]);
}

// Registry: encounter_id -> creator function
export const ENCOUNTER_REGISTRY = {
  giant_rat: createGiantRatEncounter,
  locked_door: createLockedDoorEncounter,
  bone_pile: createBonePileEncounter,
  crack: createCrackEncounter,
  splash_point: createSplashPointEncounter,
  dead_end: createDeadEndEncounter,
  tight_opening: createTightOpeningEncounter,
  lost_shrine: createLostShrineEncounter,
  sewer_junction: createSewerJunctionEncounter,
  abandoned_camp: createAbandonedCampEncounter,
  upward_passage: createUpwardPassageEncounter,
  kitchen: createKitchenEncounter,
  prison_entrance: createPrisonEntranceEncounter,
  leave_prison: createLeavePrisonEncounter,
  prison_wing: createPrisonWingEncounter,
  corner_cell: createCornerCellEncounter,
  mountain_camp: createMountainCampEncounter,
  mountain_pass: createMountainPassEncounter,
  calm_stream: createCalmStreamEncounter,
  general_zhost: createGeneralZhostEncounter,
  calm_grove: createCalmGroveEncounter,
  to_the_plains: createToThePlainsEncounter,
  // Plains
  bone_valley: createBoneValleyEncounter,
  wolf_blizzard: createWolfBlizzardEncounter,
  // Cave
  cave_entrance: createCaveEntranceEncounter,
  cave_ledge: createCaveLedgeEncounter,
  cave_river_landing: createCaveRiverLandingEncounter,
  underground_river: createUndergroundRiverEncounter,
  // Ruins Basin
  piranha_pool: createPiranhaPoolEncounter,
  pool_south: createPoolSouthEncounter,
  pool_exit: createPoolExitEncounter,
  conservatory_wing: createConservatoryWingEncounter,
  flooded_passage: createFloodedPassageEncounter,
  dark_corridor: createDarkCorridorEncounter,
  sentinel_patrol_sighting: createSentinelPatrolSightingEncounter,
  boss_wing_sentinel_combat: createBossWingSentinelCombatEncounter,
  boss_wing_priest_combat: createBossWingPriestCombatEncounter,
  flooded_altar: createFloodedAltarEncounter,
  old_god_statue: createOldGodStatueEncounter,
  passage_ambush: createPassageAmbushEncounter,
  cave_exit: createCaveExitEncounter,
  river_crossing: createRiverCrossingEncounter,
  east_side: createEastSideEncounter,
  south_trail: createSouthTrailEncounter,
  outpost_meeting: createOutpostMeetingEncounter,
  outpost_kraken_report: createOutpostKrakenReportEncounter,
  post_dragon_staircase: createPostDragonStaircaseDialogEncounter,
  mithril_remedies: createMithrilRemediesEncounter,
  watchtower_check: createWatchtowerCheckEncounter,
  supply_pile: createSupplyPileEncounter,
  outpost_tent: createOutpostTentEncounter,
  cozy_spot: createCozySpotEncounter,
  cozy_spot_ambush: createCozySpotAmbushEncounter,
  river_cave_mouth_entry: createRiverCaveMouthEntryEncounter,
  lake_path_2: createLakePath2Encounter,
  south_hill: createSouthHillEncounter,
  wreckage_arrival: createWreckageArrivalEncounter,
  wreckage_harpy_revisit: createWreckageHarpyRevisitEncounter,
  ship_chest: createShipChestEncounter,
  giant_frog_ambush: createGiantFrogAmbushEncounter,
  south_gate: createSouthGateEncounter,
  sahuagin_sentinel: createSahuaginSentinelEncounter,
  // City Shops
  city_square: createCitySquareEncounter,
  weaponsmith: createWeaponsmithEncounter,
  armorsmith: createArmorsmithEncounter,
  general_store: createGeneralStoreEncounter,
  inn: createInnEncounter,
  church: createChurchEncounter,
  arcane_emporium: createArcaneEmporiumEncounter,
  antiquity_shop: createAntiquityShopEncounter,
  antiquity_shop_cleared: createAntiquityShopClearedEncounter,
  guild_hall: createGuildHallEncounter,
  guild_hall_victory: createGuildHallVictoryEncounter,
  city_north_gate: createCityNorthGateEncounter,
  // North Qualibaf
  north_crossroad: createNorthCrossroadEncounter,
  filibaf_entrance: createFilibafEntranceEncounter,
  // Forest
  forest_shadows: createForestShadowsEncounter,
  forest_shadows_revisit: createForestShadowsRevisitEncounter,
  forest_ambush_left: createForestAmbushLeftEncounter,
  forest_ambush_right: createForestAmbushRightEncounter,
  forest_clearing: createForestClearingEncounter,
  // Tharnag
  tharnag_arrival: createTharnagArrivalEncounter,
  siege_gauntlet_1: createSiegeGauntlet1Encounter,
  siege_gauntlet_2: createSiegeGauntlet2Encounter,
  siege_gauntlet_3: createSiegeGauntlet3Encounter,
  siege_gauntlet_dialog: createSiegeGauntletDialogEncounter,
  tharnag_side_door: createTharnagSideDoorEncounter,
  // Volcano
  volcano_arrival: createVolcanoArrivalEncounter,
  volcano_choice: createVolcanoChoiceEncounter,
  volcano_choice_revisit: createVolcanoChoiceRevisitEncounter,
  ridge_post_dragon_offer: createRidgePostDragonOfferEncounter,
  lower_caverns_arrival: createLowerCavernsArrivalEncounter,
  lava_chamber_arrival: createLavaChamberArrivalEncounter,
  obsidian_tunnels_arrival: createObsidianTunnelsArrivalEncounter,
  obsidian_forge_arrival: createObsidianForgeArrivalEncounter,
  obsidian_forge: createObsidianForgeEncounter,
  obsidian_forge_revisit: createObsidianForgeRevisitEncounter,
  temple_district_arrival: createTempleDistrictArrivalEncounter,
  volcano_heart: createVolcanoHeartEncounter,
  volcano_heart_revisit: createVolcanoHeartRevisitEncounter,
  cathedral_arrival: createCathedralArrivalEncounter,
  cathedral_shrine: createCathedralShrineEncounter,
  cathedral_shrine_revisit: createCathedralShrineRevisitEncounter,
  obsidian_oracle: createObsidianOracleEncounter,
  obsidian_plaza_arrival: createObsidianPlazaArrivalEncounter,
  obsidian_streets_arrival: createObsidianStreetsArrivalEncounter,
  obsidian_streets_arrival_upper: createObsidianStreetsArrivalUpperEncounter,
  obsidian_plaza_arrival_west: createObsidianPlazaArrivalWestEncounter,
  obsidian_plaza_arrival_nw: createObsidianPlazaArrivalNwEncounter,
  temple_district_arrival_side: createTempleDistrictArrivalSideEncounter,
  lower_caverns_double_back: createLowerCavernsDoubleBackEncounter,
  entry_corridor_double_back: createEntryCorridorDoubleBackEncounter,
  artisan_district_entry_back: createArtisanDistrictEntryBackEncounter,
  tunnel_to_bridge_entry_back: createTunnelToBridgeEntryBackEncounter,
  deeper_tunnels_entry_back: createDeeperTunnelsEntryBackEncounter,
  gate_passage_back: createGatePassageBackEncounter,
  obsidian_tunnels_arrival_back: createObsidianTunnelsArrivalBackEncounter,
  stair_top_arrival: createStairTopArrivalEncounter,
  overseer_gnikan: createOverseerGnikanEncounter,
  tharnag_part1_ending: createTharnagPart1EndingEncounter,
  obsidian_market_arrival: createObsidianMarketArrivalEncounter,
  market_stalls: createMarketStallsEncounter,
  deep_market_rest: createDeepMarketRestEncounter,
  upper_bridge_arrival: createUpperBridgeArrivalEncounter,
  bridge_crossing: createBridgeCrossingEncounter,
  zhost_revenge: createZhostRevengeEncounter,
  magma_drake: createMagmaDrakeEncounter,
  magma_mephit: createMagmaMephitEncounter,
  // Obsidian Wastes
  obsidian_wastes_arrival: createObsidianWastesArrivalEncounter,
  obsidian_golem: createObsidianGolemEncounter,
  obsidian_slime: createObsidianSlimeEncounter,
  wastes_north: createWastesNorthEncounter,
  kobold_drake_rider: createKoboldDrakeRiderEncounter,
  // Dwarven city random encounters (upper path)
  kobold_slyblade: createKoboldSlybladeEncounter,
  dwarven_specter: createDwarvenSpecterEncounter,
  // Tharnag Interior
  grand_hall_arrival: createGrandHallArrivalEncounter,
  grand_staircase_arrival: createGrandStaircaseArrivalEncounter,
  throne_room_arrival: createThroneRoomArrivalEncounter,
  throne_audience: createThroneAudienceEncounter,
  quarters_rest: createQuartersRestEncounter,
  quarters_chest: createQuartersChestEncounter,
  valdrisa_encounter: createValdrisaEncounter,
  upper_stairs_return: createUpperStairsReturnEncounter,
  tharnag_exit: createTharnagExitEncounter,
  dwarven_tavern: createDwarvenTavernEncounter,
  dwarven_smithy: createDwarvenSmithyEncounter,
  // Dwarven City — Entry Corridor / Gate
  entry_corridor_arrival: createEntryCorridorArrivalEncounter,
  corridor_gate_approach: createCorridorGateApproachEncounter,
  gate_guardroom: createGateGuardroomEncounter,
  gate_passage: createGatePassageEncounter,
  // Dwarven City — Hall of Ancestors
  ruga_slave_master: createRugaSlaveMasterEncounter,
  monument_alley_entry: createMonumentAlleyEntryEncounter,
  // Dwarven City — Tomb
  tomb_of_ancestor_entry: createTombOfAncestorEntryEncounter,
  tomb_sarcophagus: createTombSarcophagusEncounter,
  tomb_sarcophagus_rest: createTombSarcophagusRestEncounter,
  // Dwarven City — Stairs / Throne
  grand_stairs_entry: createGrandStairsEntryEncounter,
  dwarven_throne_room_entry: createDwarvenThroneRoomEntryEncounter,
  throne_specter: createThroneSpecterEncounter,
  // Dwarven City — Map Room
  map_room_entry: createMapRoomEntryEncounter,
  map_table: createMapTableEncounter,
  map_table_revisit: createMapTableRevisitEncounter,
  // Dwarven City — Tunnels / Artisan
  deeper_tunnels_entry: createDeeperTunnelsEntryEncounter,
  artisan_district_entry: createArtisanDistrictEntryEncounter,
  artisan_workshop: createArtisanWorkshopEncounter,
  artisan_workshop_revisit: createArtisanWorkshopRevisitEncounter,
  tunnel_to_bridge_entry: createTunnelToBridgeEntryEncounter,
  tunnel_to_bridge_exit: createTunnelToBridgeExitEncounter,
};
