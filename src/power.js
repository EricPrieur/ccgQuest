import { createFireToken, createIceToken, createCatFormToken, createBearFormToken } from './cards.js';

/**
 * A character power that can be used once per turn.
 */
export class Power {
  constructor({
    id,
    name,
    costDescription,
    effectDescription,
    rechargeCost,
    exhausted = false,
    isPassive = false,
    shortDesc = '',
    choices = null,
    costIsDiscard = false,
    maxUsesPerTurn = 1,
    gamePlusOffset = null,
    noTierOffset = false,
  }) {
    this.id = id;
    this.name = name;
    this.costDescription = costDescription;
    this.effectDescription = effectDescription;
    this.rechargeCost = rechargeCost;
    this.exhausted = exhausted;
    this.owner = null;
    this.isPassive = isPassive;
    this.shortDesc = shortDesc;
    this.choices = choices;
    this.costIsDiscard = costIsDiscard;
    // Most powers fire once per turn; Aimed Shot bumps to 2 so the
    // Ranger can stack heroism faster. use() exhausts when the
    // counter hits the cap; ready() resets it at turn start.
    this.maxUsesPerTurn = maxUsesPerTurn;
    this.usesThisTurn = 0;
    // Optional ccgQuest+ tier-offset scaling, mirroring the same
    // field on Card. Keys are short tags matching a regex in the
    // codex preview helper (e.g. "damage" swaps the "X" in
    // "Deal X Damage"). Cleave is the first wired example.
    this.gamePlusOffset = gamePlusOffset;
    // Explicit "this power does not scale with tier offset" marker —
    // suppresses the codex red "+N?" badge for powers like Overwhelm
    // and Vanish that intentionally stay flat.
    this.noTierOffset = noTierOffset;
  }

  get fullDescription() {
    return `${this.costDescription}: ${this.effectDescription}`;
  }

  canUse() {
    if (this.isPassive) return false;
    if (this.exhausted) return false;
    if (!this.owner || !this.owner.deck) return false;
    return this.owner.deck.hand.length >= this.rechargeCost;
  }

  use() {
    // Cost has already been paid by the caller (handlePowerRechargeClick
    // moved cards out of hand BEFORE executePower fires), so re-running
    // canUse() here would reject the use whenever the payment dropped the
    // hand below rechargeCost — the power would resolve its effects but
    // never get marked exhausted, letting the player fire it again the
    // same turn. Bump the per-turn counter and exhaust only when the
    // cap is reached (default maxUsesPerTurn=1, Aimed Shot=2).
    this.usesThisTurn = (this.usesThisTurn || 0) + 1;
    if (this.usesThisTurn >= (this.maxUsesPerTurn || 1)) {
      this.exhausted = true;
    }
    return true;
  }

  ready() {
    this.exhausted = false;
    this.usesThisTurn = 0;
  }

  toString() {
    return `${this.name}: ${this.fullDescription}`;
  }
}

// === Class Power Creators ===

export function createCleave() {
  return new Power({
    id: 'cleave',
    name: 'Cleave',
    costDescription: 'Recharge 1 Card',
    effectDescription: 'Deal 1 Damage to up to 2 Creatures. 2 Targets: Draw.',
    rechargeCost: 1,
    shortDesc: 'R1->1 Dmg\nto 2 targets\n2 Targets: Draw',
    // Base damage 1, +1 per player tier offset. Codex preview reads
    // this and rewrites "Deal X Damage" / "X Dmg" in the descriptions.
    gamePlusOffset: { damage: 1 },
  });
}

export function createAimedShot() {
  return new Power({
    // id stays 'aimed_shot' for save compatibility — display name only renamed.
    id: 'aimed_shot',
    name: 'Take Aim',
    costDescription: 'Recharge 1 Card',
    effectDescription: 'Gain 1 Heroism, Draw.',
    rechargeCost: 1,
    shortDesc: 'R1->+1 Heroism\nDraw',
    gamePlusOffset: { gain_heroism: 1 },
  });
}

export function createElementalInfusion() {
  return new Power({
    id: 'elemental_infusion',
    name: 'Elemental Infusion',
    costDescription: 'Recharge 1 Card',
    effectDescription: 'Apply 1 Fire or 1 Ice to target.',
    rechargeCost: 1,
    shortDesc: 'R1->1 Fire/Ice',
    choices: [createFireToken(), createIceToken()],
    // Bumps Fire and Ice values together per offset point. Codex
    // text rewrites both "1 Fire" and "1 Ice" via a custom branch
    // in applyGamePlusOffsetInPlace.
    gamePlusOffset: { apply_fire: 1, apply_ice: 1 },
  });
}

export function createQuickStrike() {
  return new Power({
    id: 'quick_strike',
    name: 'Quick Strike',
    costDescription: 'Recharge 1 Card',
    effectDescription: 'Deal 1 Damage, Draw.',
    rechargeCost: 1,
    shortDesc: 'R1->1 Dmg\nDraw',
    // Offset transforms Quick Strike into a barrage — +1 swing per
    // offset point (always 1 damage each). The codex text rewrites
    // "Deal 1 Damage" → "Deal 1 Damage N times" via a custom branch.
    gamePlusOffset: { quick_strike_attacks: 1 },
  });
}

export function createBattleFury() {
  return new Power({
    id: 'battle_fury',
    name: 'Battle Fury',
    costDescription: 'Discard 1 Card',
    effectDescription: 'Gain Heroism, Shield, Draw 2.',
    rechargeCost: 1,
    costIsDiscard: true,
    shortDesc: 'D1->+Heroism\n+Shield, Draw 2',
    // Base grants 1 Heroism + 1 Shield (numbers omitted from the
    // text for cleanliness). Offset bumps each by +1 per step —
    // the codex preview inserts "N Heroism, N Shield" when offset > 0.
    gamePlusOffset: { gain_heroism: 1, gain_shield: 1 },
  });
}

export function createFeralForm() {
  return new Power({
    id: 'feral_form',
    name: 'Feral Form',
    costDescription: 'Recharge 1 Card',
    effectDescription: 'Gain 1 Heroism or 1 Shield. Draw.',
    rechargeCost: 1,
    // Uses keyword names ("Heroism", "Shield", "Draw") so the inline icon
    // tokenizer substitutes them with their icons on the small power card.
    // Forced to 2 lines so the small card's frame doesn't overlap the text.
    shortDesc: 'R1->Heroism\nor Shield, Draw',
    choices: [createCatFormToken(), createBearFormToken()],
    // Cat Form (Heroism) and Bear Form (Shield) each gain +1 per
    // offset point. Codex rewrites both numbers in the text.
    gamePlusOffset: { gain_heroism: 1, gain_shield: 1 },
  });
}

// === Enemy Powers ===

export function createChunkyBite() {
  return new Power({
    id: 'chunky_bite',
    name: 'Big Bite',
    costDescription: 'Recharge 2 Cards',
    effectDescription: 'Deal 3 Damage.',
    rechargeCost: 2,
    shortDesc: 'R2->3 Dmg',
    // Monster-side power scaling — bites harder per monster offset.
    gamePlusOffset: { damage: 2 },
  });
}

export function createDireFury() {
  return new Power({
    id: 'dire_fury',
    name: 'Dire Fury',
    costDescription: 'Passive',
    effectDescription: 'Turn End: Gain 1 Rage.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Turn End:\n+1 Rage',
    // +0.5 Rage per monster tier offset (floor — +0 at +1, +1 at +2,
    // +1 at +3, +2 at +4…). Same gentle ramp as Armor power; the
    // base 1-Rage-per-turn already snowballs fast across a long
    // fight, so the offset bump stays modest.
    gamePlusOffset: { dire_fury_rage: 0.5 },
  });
}

// Siege Ogre's signature attack power — recharge 4 cards from hand to
// blast every player ally + the player for 5 damage. Active. Heroism
// stacked from Pulling Back the Ram boosts each swing on top.
export function createMassiveOgreRam() {
  return new Power({
    id: 'massive_ogre_ram',
    name: 'Massive Ogre Ram',
    costDescription: 'Recharge 4 Cards',
    effectDescription: 'Deal 5 Damage to ALL enemies.',
    rechargeCost: 4,
    shortDesc: 'R4->5 Dmg All',
  });
}

// Siege Ogre passive — every enemy turn summons 1-3 Goblin Sappers as
// chaff. Mirrors PY create_goblin_sapper_squad.
export function createGoblinSapperSquad() {
  return new Power({
    id: 'goblin_sapper_squad',
    name: 'Goblin Sapper Squad',
    costDescription: 'Passive',
    // The "Turn Start:" prefix triggers the existing perk-style badge
    // tokenizer (drawPowerCard's hasTriggerBadge regex) so the power
    // card paints a TURN START pill in front of the description.
    effectDescription: 'Turn Start: Summon Goblin Sapper Squad.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Turn Start:\nSummon Sappers',
  });
}

// Mimic-class passive — when a player ally takes more damage than its
// remaining HP, the overflow rolls onto the player character. Mirrors
// PY create_overwhelm.
export function createOverwhelm() {
  return new Power({
    id: 'overwhelm',
    name: 'Overwhelm',
    costDescription: 'Passive',
    effectDescription: 'Overflow damage on allies hits you.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Overflow\n->You',
    // Doesn't scale with tier — overflow rule is binary, not numeric.
    noTierOffset: true,
  });
}

export function createSplit() {
  return new Power({
    id: 'split',
    name: 'Split',
    costDescription: 'Passive',
    effectDescription: 'Splits when damaged.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Split on hit',
    // +1 max slimes summoned per offset (base 1, offset 1 = 1-2,
    // offset 2 = 1-3, etc). Runtime is the on-hit split handler.
    gamePlusOffset: { split_summon: 1 },
  });
}

export function createArmorPower(level = 1) {
  const p = new Power({
    id: 'armor',
    name: `Armor: ${level}`,
    costDescription: 'Passive',
    effectDescription: `Reduce incoming damage by ${level}.`,
    rechargeCost: 0,
    isPassive: true,
    shortDesc: `Block ${level}`,
    // Monster offset: +0.5 base armor per step (floor — so +0 at
    // tier +1, +1 at +2, +1 at +3, +2 at +4…). Codex preview reads
    // this and rewrites the displayed text; runtime scaling lives
    // in applyMonsterTierOffsetToEnemy which bumps p.armorLevel too.
    gamePlusOffset: { armor_power: 0.5 },
  });
  p.armorLevel = level;
  return p;
}

export function createKoboldBackup() {
  return new Power({
    id: 'kobold_backup',
    name: 'Kobold Backup',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Summon 1 Kobold Guard.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Summon Guard',
    // +1 max Kobold Guard summoned per monster tier offset (base 1,
    // then 1-2 at +1, 1-3 at +2…). The runtime reads
    // monsterTierOffset and the custom kobold_backup branch in
    // applyGamePlusOffsetInPlace rewrites the description.
    gamePlusOffset: { kobold_backup_extra: 1 },
  });
}

// Bone Amalgam — start of each enemy turn either summons a fresh 3/3
// Bone Amalgam ally, or buffs every existing Bone Amalgam ally by
// +1 attack and +1 max HP (also healing the +1).
export function createAmalgam() {
  return new Power({
    id: 'amalgam',
    name: 'Create Amalgam',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Summon a 3/3 Bone Amalgam, or +1 Atk/HP to existing.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Create\nAmalgam',
    // +2/+2 per monster offset — fresh amalgams spawn that much
    // bigger AND each per-turn buff tick bumps the same amount.
    // The per-card Bone Amalgam creature does NOT get a
    // CREATURE_TIER_OFFSET rule (we'd double-dip with this power).
    gamePlusOffset: { amalgam_growth: 2 },
  });
}

// Piranhas Swarm — invulnerable boss power, summons 2-4 piranhas
// each turn. Mirrors PY create_piranhas_swarm_power.
export function createPiranhasSwarm() {
  return new Power({
    id: 'piranhas_swarm',
    name: 'Piranhas Swarm',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Summon Piranhas.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Summon\nPiranhas',
  });
}

// Sahuagin Baron — start-of-turn summon. Mirrors PY
// create_from_the_deep: 1/3 Shark, 1/3 Sahuagin Sentinel, 1/3 High
// Priest each turn.
export function createFromTheDeep() {
  return new Power({
    id: 'from_the_deep',
    name: 'From the Deep',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Summon 1 Creature from the Deep.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Summon\nFrom Deep',
  });
}

// Wolf Pack — invulnerable boss summon: each turn, top up the wolf
// roster. Mirrors PY create_wolf_pack_power.
export function createWolfPack() {
  return new Power({
    id: 'wolf_pack',
    name: 'Wolf Pack',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Summon Wolves.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Summon\nWolves',
    // +1 extra wolf summoned per monster tier offset (handler bumps
    // the target roster size at the start of each enemy turn).
    gamePlusOffset: { wolf_pack_extra: 1 },
  });
}

// General Zhost's Army — replenishes guards/slingers (and sometimes a
// Dragonshield) every turn so the kill-20 fight stays loud.
export function createKoboldArmy() {
  return new Power({
    id: 'kobold_army',
    name: 'Kobold Army',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Summon a Kobold Army.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Summon Army',
  });
}

// Lava Floor — Magma Mephit / Magma Drake passive. Each turn, every
// creature on the board (player + allies + enemy + enemy allies)
// gains 1 Fire. Mirrors PY power.py:create_lava_floor.
export function createLavaFloor() {
  return new Power({
    id: 'lava_floor',
    name: 'Lava Floor',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: All creatures gain 1 Fire.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: '1 Fire\nto ALL',
    // +1 Fire per offset (2 stacks at T1, 3 at T2…). Handler reads
    // the scaled value on each tick.
    gamePlusOffset: { apply_fire: 1 },
  });
}

// Blizzard — Overseer Gnikan phase-2 passive. Mirrors the lava_floor
// pattern but with Ice instead of Fire: at the start of every enemy
// turn the entire battlefield gets 1 Ice — player, every alive ally,
// the boss himself, and every alive enemy creature. Ice Elemental
// allies on Gnikan's side carry `_iceAbsorb`, so the storm actively
// FEEDS them +1/+1 each turn instead of stacking ice. Gnikan's own
// Ice stacks fold into the next Gnikan's Staff burst, scaling the
// summoned elemental over the long fight.
export function createBlizzard() {
  return new Power({
    id: 'blizzard',
    name: 'Blizzard',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: All creatures gain 1 Ice.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: '1 Ice\nto ALL',
    // +1 Ice per monster tier offset.
    gamePlusOffset: { apply_ice: 1 },
  });
}

// Ancient White — Varimatras's signature passive. Any Ice that
// would land on the dragon (his own Blizzard tick, player Ice
// spells like Ice Bolt / Nova, Cold Breath's apply_ice_all, etc.)
// is converted into 1 Shield per stack instead. The dragon never
// accumulates Ice; he builds Shield from every attempt to freeze
// him. Mirrors the Ice Elemental `_iceAbsorb` pattern but pays
// out in Shield rather than +1/+1.
export function createAncientWhite() {
  return new Power({
    id: 'ancient_white',
    name: 'Ancient White',
    costDescription: 'Passive',
    effectDescription: 'Ice on this dragon becomes Shield instead.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Ice -> Shield',
    // Conversion rule is binary — there's no numeric value to scale.
    noTierOffset: true,
  });
}

// Kobold Army Swarm — Kobold Drake Rider's escalating reinforcements.
// Each turn N more kobolds pour in; once the fight runs long enough
// the swarm starts including Dragonshields. Mirrors PY
// power.py:create_kobold_army_swarm + game.py:14063 spawn handler.
export function createKoboldArmySwarm() {
  return new Power({
    id: 'kobold_army_swarm',
    name: 'Kobold Army',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Kobolds are swarming you! (Escalating spawns each turn)',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Kobold Swarm',
  });
}

// Obsidian Construct (Golem boss) — passive: every time the boss is
// attacked, lose 1 base armor and gain 1 Rage. Mirrors PY
// power.py:create_obsidian_construct.
export function createObsidianConstructPower() {
  return new Power({
    id: 'obsidian_construct',
    name: 'Obsidian Construct',
    costDescription: 'Passive',
    effectDescription: 'When Hit: -1 Armor, +1 Rage. Turn Start: +1 Armor (max 5), -1 Rage.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'When Hit:\n-1 Armor, +1 Rage',
  });
}

// Obsidian Body (Oracle) — bare armor-peel variant. Mirrors the slime
// power's "When Hit: -1 Armor" rule but drops the slime-spawn rider.
// Pairs with Dark Vision on the Oracle: 15 armor + every successful
// hit chips 1 (no auto-regen, no rage gain).
export function createObsidianOracleBodyPower() {
  return new Power({
    id: 'obsidian_oracle_body',
    name: 'Obsidian Body',
    costDescription: 'Passive',
    effectDescription: 'When Hit: -1 Armor.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'When Hit:\n-1 Armor',
  });
}

// Dark Vision (Obsidian Oracle) — passive: each enemy turn the Oracle
// scries the top 3 cards of the player's draw pile and discards the
// single highest-value card (tier > rarity > random tiebreaker). Slow
// erosion of the player's best draws. Mirrors PY power.py:create_dark_vision.
export function createDarkVisionPower() {
  return new Power({
    id: 'dark_vision',
    name: 'Dark Vision',
    costDescription: 'Passive',
    effectDescription: 'Start of Turn: Scry 3 of your draw pile. The best card goes to your discard pile.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Scry 3\nDiscard Best',
    // ccgQuest+: per offset Scry depth grows by +2 and the
    // number of cards forced to discard grows by +1. Custom
    // power handler in main.js reads monsterTierOffset to
    // resolve the actual N values at fire time; this entry
    // only exists so the codex stops flagging the power red
    // (cardHasOffsetRules accepts a non-null gamePlusOffset).
    gamePlusOffset: {},
  });
}

// Obsidian Body (Slime boss) — passive: every time the boss is
// attacked (even if armor blocks the whole hit) and still has armor,
// lose 1 base armor AND spawn a small Obsidian Slime (1/1, 5 Armor).
// Mirrors PY power.py:create_obsidian_body.
export function createObsidianBodyPower() {
  return new Power({
    id: 'obsidian_body',
    name: 'Obsidian Body',
    costDescription: 'Passive',
    effectDescription: 'When Hit: -1 Armor, spawn an Obsidian Slime. Turn Start: +1 Armor (max 5).',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'When Hit:\n-1 Armor +Slime',
  });
}

// Dwarven Specter passive — incoming damage is clamped to 1
// regardless of source (attacks, unpreventable, Fire/Poison ticks).
// The CLAMP itself lives in Character.takeDamageWithDefense and
// .takeDamageFromDeck so every damage path picks it up. Mirrors
// PY power.py:create_ethereal.
export function createEthereal() {
  return new Power({
    id: 'ethereal',
    name: 'Ethereal',
    costDescription: 'Passive',
    effectDescription: 'No damage dealt to this character can be greater than 1.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'Max 1 dmg\ntaken / hit',
    // The 1-dmg clamp is binary, not numeric — no tier scaling.
    noTierOffset: true,
  });
}

// Ruga the Slave Master passive — attacks against Ruga deal +1
// extra damage, and Ruga draws a card whenever he's hit. Mirrors PY
// power.py:create_brute.
export function createBrute() {
  return new Power({
    id: 'brute',
    name: 'Brute',
    costDescription: 'Passive',
    // +1 dmg taken + on-hit draw — both already binary triggers.
    noTierOffset: true,
    // Lead with "On Hit:" so the perk-badge tokenizer in main.js
    // catches the prefix and renders the pill. The +1-damage clause
    // sits below as the passive footnote.
    effectDescription: 'On Hit: Draw.\nAttacks against Ruga deal +1 damage.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'On Hit: Draw\n+1 Dmg taken',
  });
}

// Kobold Slyblade passive — on hit (after damage lands), 50% chance
// to phase out and become invulnerable until the start of the
// slyblade's next turn. The attack itself goes through; subsequent
// attacks that turn read the invulnerable flag and absorb. Mirrors
// PY power.py:create_vanish.
export function createVanish() {
  return new Power({
    id: 'vanish',
    name: 'Vanish',
    costDescription: 'Passive',
    effectDescription: 'On Hit: 50% chance to vanish AFTER the attack, becoming invulnerable until next turn.',
    rechargeCost: 0,
    isPassive: true,
    shortDesc: 'On Hit:\n50% Vanish',
    // Doesn't scale — the 50%/invulnerable rule is binary, not numeric.
    noTierOffset: true,
  });
}

export function getClassPower(className) {
  const powers = {
    Paladin: createCleave,
    Ranger: createAimedShot,
    Wizard: createElementalInfusion,
    Rogue: createQuickStrike,
    Warrior: createBattleFury,
    Druid: createFeralForm,
  };
  return (powers[className] || createCleave)();
}
