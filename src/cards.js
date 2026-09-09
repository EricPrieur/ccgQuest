import { Card, CardEffect, CardMode } from './card.js';
import { CardType, CostType, TargetType } from './constants.js';
import { Creature } from './creature.js';

// ============================================================
// Power choice tokens (not real deck cards — used by powers
// like Elemental Infusion / Feral Form to render the choice UI)
// ============================================================

export function createFireToken() {
  return new Card({
    id: 'fire_token', name: 'Fire',
    description: 'Apply 1 Fire to target.',
    shortDesc: 'Fire', subtype: 'ability',
    cardType: CardType.SKILL, costType: CostType.FREE,
    effects: [new CardEffect('apply_fire', 1, TargetType.SINGLE_ENEMY)],
    // Scales alongside Elemental Infusion's power offset (+1 Fire
    // per offset). The power's runtime handler already reads
    // playerTierOffset; this stamp ensures the choice card preview
    // shows the bumped value when it's surfaced by enterPowerChoice.
    gamePlusOffset: { apply_fire: 1 },
  });
}

export function createIceToken() {
  return new Card({
    id: 'ice_token', name: 'Ice',
    description: 'Apply 1 Ice to target.',
    shortDesc: 'Ice', subtype: 'ability',
    cardType: CardType.SKILL, costType: CostType.FREE,
    effects: [new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { apply_ice: 1 },
  });
}

export function createCatFormToken() {
  return new Card({
    id: 'cat_form_token', name: 'Feline Form',
    description: 'Deal Bleed, Draw.',
    shortDesc: 'Bleed, Draw', subtype: 'ability',
    cardType: CardType.SKILL, costType: CostType.FREE,
    effects: [new CardEffect('cat_form', 1, TargetType.SINGLE_ENEMY)],
    // +1 Bleed per offset — handler scales via playerTierOffset;
    // a custom branch in applyGamePlusOffsetInPlace inserts the
    // number into the description at offset > 0 ("Deal Bleed" →
    // "Deal 2 Bleed" → "Deal 3 Bleed" …).
    gamePlusOffset: { cat_form: 1 },
  });
}

export function createBearFormToken() {
  return new Card({
    id: 'bear_form_token', name: 'Bear Form',
    description: 'Gain Shield.\nHeal 1 Ailment, Draw.',
    shortDesc: 'Shield\nHeal Ailment\nDraw', subtype: 'ability',
    cardType: CardType.SKILL, costType: CostType.FREE,
    effects: [new CardEffect('bear_form', 1, TargetType.SELF)],
    gamePlusOffset: { bear_form: 1 },
  });
}

// ============================================================
// Generic Starter Cards
// ============================================================

export function createWoodenSword() {
  return new Card({
    id: 'wooden_sword',
    name: 'Wooden Sword',
    description: 'Deal 3 damage.',
    shortDesc: '3 Dmg',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage', 3, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { damage: 2 },
  });
}

export function createLeatherArmor() {
  return new Card({
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Block 2, Heroism, Draw.',
    shortDesc: 'Block 2, Heroism, Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 2, gain_heroism: 1 },
  });
}

export function createScraps() {
  return new Card({
    id: 'scraps',
    name: 'Scraps',
    description: 'Heal 3. Discard.',
    shortDesc: 'Heal 3, D',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    // SINGLE_ALLY routes through the heal-targeting picker so the
    // player can patch up a companion (or themselves) instead of
    // always auto-targeting the caster.
    effects: [new CardEffect('heal', 3, TargetType.SINGLE_ALLY)],
    gamePlusOffset: { heal: 2 },
  });
}

// ============================================================
// Shared Weapon / Equipment Cards
// ============================================================

export function createWoodenAxe() {
  return new Card({
    id: 'wooden_axe',
    name: 'Wooden Axe',
    description: 'Deal 2 Damage to 2 targets.',
    shortDesc: '2 Dmg x2',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('multi_damage', 2, TargetType.SINGLE_ENEMY, 2)],
    // Fractional per: floor(1.5 * offset) → +1 at T1, +3 at T2, +4 at T3.
    gamePlusOffset: { multi_damage: 1.5 },
  });
}

// Jagged Chopper — uncommon tier-1 martial weapon. The Wooden Axe's
// nastier cousin: 2 damage to 2 targets that also leaves them Bleeding.
// Fields the Elite Kobold Patrol's deck and drops from kobold_base_loot.
export function createJaggedChopper() {
  return new Card({
    id: 'jagged_chopper',
    name: 'Jagged Chopper',
    description: 'Deal 2 + Bleed on 2 targets.',
    shortDesc: '2 +Bleed\nx2',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('multi_damage', 2, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY, 2),
    ],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { multi_damage: 1.5, apply_bleed: 1 },
  });
}

export function createWoodenGreatsword() {
  return new Card({
    id: 'wooden_greatsword',
    name: 'Wooden Greatsword',
    description: 'Recharge a Card -> Deal 5 Damage.',
    shortDesc: 'R-Card->5 Dmg',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 3 },
  });
}

export function createRockMace() {
  return new Card({
    id: 'rock_mace',
    name: 'Rock Mace',
    description: 'Deal 2 damage (+2 vs Armor or Shield).',
    shortDesc: '2 Dmg\n(+2 vs Armor/Shield)',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('armor_bonus_damage', 24, TargetType.SINGLE_ENEMY),
    ],
    // armor_bonus_damage encodes `base * 10 + vsArmorTotal`. Offset
    // adds +1 to base AND +2 to the BONUS-vs-armor (i.e. the extra
    // over base). Custom code in applyTierOffsetToCardPreview reads
    // this { base, bonus } shape and re-encodes the value + rewrites
    // the description numbers.
    gamePlusOffset: { armor_bonus_damage: { base: 1, bonus: 2 } },
  });
}

export function createCrackedBuckler() {
  return new Card({
    id: 'cracked_buckler',
    name: 'Cracked Buckler',
    description: 'Gain Shield.\nFirst Shield: Draw.',
    shortDesc: 'Gain Shield\n1st Shield: Draw',
    subtype: 'light_armor',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
    ],
    gamePlusOffset: { gain_shield: 2 },
  });
}

// Chitin Shield — Path of the Necromancer dining-room loot drop.
// Plague Cockroach husks scraped into a serviceable buckler. Pays
// off the matchup: the cockroach's Skitter Bite poisons you, and
// this card cashes that poison in for extra Shield. First-shield
// draw rider lets it cycle as the opener on subsequent shield turns.
export function createChitinShield() {
  return new Card({
    id: 'chitin_shield',
    name: 'Chitin Shield',
    description: 'Gain Shield.\nIf Poisoned: Gain Shield.\nFirst Shield: Draw.',
    shortDesc: 'Gain Shield\nPoison: +Shield\n1st Shield: Draw',
    // Clothing — the cockroach shell is strapped on like a vest, not
    // a buckler. Routes through the Necromancer's clothing slot.
    subtype: 'clothing',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('gain_shield_if_poisoned', 1, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 1,
    // +1 base shield AND +1 poison-rider shield per offset.
    gamePlusOffset: { gain_shield: 1, gain_shield_if_poisoned: 1 },
  });
}

export function createBuckler() {
  return new Card({
    id: 'buckler',
    name: 'Buckler',
    description: 'Gain 2 Shield.\nFirst Shield: Draw.',
    shortDesc: '+2 Shield\n1st Shield: Draw',
    subtype: 'light_armor',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { gain_shield: 2 },
  });
}

export function createShortBow() {
  return new Card({
    id: 'short_bow',
    name: 'Short Bow',
    description: 'Recharge a Card -> Deal 3 Damage, Draw.',
    shortDesc: 'R-Card->3 Dmg, Draw',
    subtype: 'ranged',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 3 },
  });
}

export function createShortStaff() {
  return new Card({
    id: 'short_staff',
    name: 'Short Staff',
    description: 'Recharge a Card -> Deal 4. Gain Shield.',
    shortDesc: 'R-Card->4 Dmg\nGain Shield',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 2, gain_shield: 1 },
  });
}

export function createSmallPouch() {
  return new Card({
    id: 'small_pouch',
    name: 'Small Pouch',
    description: 'Scout 2. Stays in hand.',
    shortDesc: 'Scout 2\nStays',
    subtype: 'item',
    cardType: CardType.ITEM,
    // FREE cost — the card never leaves the hand, so a recharge cost would let
    // you pay once and ride it free forever (see Kobold Shield / Bone Dagger).
    costType: CostType.FREE,
    effects: [
      new CardEffect('scout', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    gamePlusOffset: { scout: 1 },
  });
}

export function createKoboldSpear() {
  return new Card({
    id: 'kobold_spear',
    name: 'Kobold Spear',
    description: 'Deal 3.\nOn Kill: Draw.',
    shortDesc: '3\nOn Kill: Draw',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('draw_on_kill', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 2 },
  });
}

export function createKoboldShield() {
  return new Card({
    id: 'kobold_shield',
    name: 'Kobold Shield',
    description: 'Deal Bleed, Gain Shield + Stays in hand.',
    shortDesc: 'Bleed, Gain Shield\nStays in hand',
    subtype: 'light_armor',
    cardType: CardType.ATTACK,
    // FREE cost — the card never leaves the hand, so a recharge cost
    // would let you pay once and then ride it free forever. FREE keeps
    // the math honest: every swing is just "1 bleed + 1 shield" with no
    // ramp.
    costType: CostType.FREE,
    effects: [
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    // +1 bleed, +0.5 shield (floor) per offset. At +1 shield stays at 1,
    // +2 bumps to 2, etc. Stays-in-hand means it pings every turn,
    // so even the fractional shield matters over a long fight.
    gamePlusOffset: { apply_bleed: 1, gain_shield: 0.5 },
  });
}

export function createBoneDagger() {
  return new Card({
    id: 'bone_dagger',
    name: 'Bone Dagger',
    description: 'Deal 1 Damage. Stays in hand.',
    shortDesc: '1 Dmg, Stays',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 1 },
  });
}

// White Dragonscale Shield — Varimatras loot pick. Light-armor
// shield turned shield-bash: first dump every Ice stack on the
// player into matching Shields, then gain 4 more Shields and
// swing for total Shield count (heroism scales). Pairs hard with
// Blizzard / Cold Breath piling Ice on you — every chill becomes
// an attack instead of incoming damage.
export function createWhiteDragonscaleShield() {
  return new Card({
    id: 'white_dragonscale_shield', name: 'White Dragonscale Shield',
    description: 'Recharge -> Gain 3 Shields.\nIce -> Shields on yourself.\nDeal damage = Shields.',
    shortDesc: 'R->+3 Shield\nIce -> Shield\nDmg = Shield',
    subtype: 'light_armor',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('transform_ice_to_shield_self', 0, TargetType.SELF),
      new CardEffect('shield_bash', 3, TargetType.SINGLE_ENEMY),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { shield_bash: 2 },
  });
}

// White Dragonscale Armor — heavy-armor DEFENSE drop. Same +8
// Block beat as a normal heavy armor, riding an attacker_gains_ice
// kicker that transfers all of the player's current Ice stacks
// onto the enemy character (typically the attacker in the moment
// this card fires reactively). Note that bosses with Ancient
// White (Varimatras himself) flip incoming Ice into +1 Shield, so
// against him the card is "burn my Ice for his Shield" — a
// strategic call rather than always-on alpha.
export function createWhiteDragonscaleArmor() {
  return new Card({
    id: 'white_dragonscale_armor', name: 'White Dragonscale Armor',
    description: 'Block 7, Douse Fire, Draw.\nAttacker gains your Ice.',
    shortDesc: 'Block 7, Draw\nDouse Fire\nAttacker gets Ice',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 7, TargetType.SELF),
      // value=99 → strip ALL Fire stacks off the player.
      new CardEffect('clear_fire', 99, TargetType.SELF),
      new CardEffect('attacker_gains_ice', 0, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { block: 5 },
  });
}

// Winterborn Robes — Tier 2 epic clothing, 6th option in the Varimatras
// hoard. A defensive setup robe that banks Block + card selection, frosts
// you with 4 Ice, then cashes ALL your Ice in for Heroism (rounded up:
// 5 Ice = 3 Heroism). The conversion sweeps Ice stacked earlier in the
// fight too, so it rewards an Ice-leaning Wizard build.
export function createWinterbornRobes() {
  return new Card({
    id: 'winterborn_robes', name: 'Winterborn Robes',
    description: 'Block 4, Scry 4, Gain 4 Ice.\n2 Ice: Heroism',
    shortDesc: 'Block 4, Scry 4\n+4 Ice\n2 Ice: Heroism',
    subtype: 'clothing',
    cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    // Ice + conversion resolve BEFORE the Scry pick so the Heroism is
    // banked cleanly before the scry overlay takes over the screen
    // (the overlay opening mid-resolution was eating the heroism gain).
    effects: [
      new CardEffect('block', 4, TargetType.SELF),
      new CardEffect('apply_ice_self', 4, TargetType.SELF),
      new CardEffect('transform_ice_to_heroism_self', 0, TargetType.SELF),
      new CardEffect('scry_pick', 4, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { block: 1, scry_pick: 1, apply_ice_self: 1 },
  });
}

// Dragon Bone Bow — Tier 2 ranged drop. Recharge +1 cost (one
// extra hand card burned alongside the bow itself), hits up to
// 3 enemies for 4 damage each, then draws a card. The cycle
// pressure offsets the steep cost so the bow can keep firing
// across a long fight.
export function createDragonBoneBow() {
  return new Card({
    id: 'dragon_bone_bow', name: 'Dragon Bone Bow',
    description: 'Recharge a Card -> Deal a barrage of 4, 3 and 2 Damage, Draw.',
    shortDesc: 'R-Card->4/3/2 Dmg\nDraw',
    subtype: 'ranged',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // dragon_bow_barrage fires 3 sequential shots at one target with
    // descending damage starting from eff.value (4 → 3 → 2). All
    // riders (Vial of Poison, Sahuagin Eye, Obsidian Core) snapshot
    // once and apply to every shot; heroism/rage/ice consumed once
    // and fold into the base. Each shot bumps attacksThisTurn so
    // Sneak Attack scales correctly.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('dragon_bow_barrage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'epic',
    // +1 to the first shot per offset — descending pattern preserved
    // (5/4/3 at +1, 6/5/4 at +2…). The rewriter only patches the
    // first numeric token in the description; that's fine — the log
    // shows each scaled per-shot damage as the volley resolves.
    gamePlusOffset: { dragon_bow_barrage: 1 },
  });
}

// Dragon Eye Mace — Tier 2 martial drop. Strips up to 4 Shield
// stacks off the target and replaces them with the same number
// of Ice stacks, then hits for 5 damage with a +4 Iced-bonus
// rider. The shield → ice transfer is the engine: shred their
// defenses, freeze them with the same number, then the Iced
// bonus pays out via the same damage path Dragon Tooth Dagger uses.
export function createDragonEyeMace() {
  return new Card({
    id: 'dragon_eye_mace', name: 'Dragon Eye Mace',
    description: "Transform up to 4 of the target's Shield into Ice, then deal 5 Damage. Iced: +4 Damage.",
    shortDesc: '4 Shield->Ice\nOn target\n5 Dmg +4 if Iced',
    subtype: 'martial',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('transform_shield_to_ice_target', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('iced_bonus_damage', 4, TargetType.SINGLE_ENEMY),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { transform_shield_to_ice_target: 1, damage: 2, iced_bonus_damage: 2 },
  });
}

// White Dragon Egg — picked up at the foot of the ridge as the
// party flees the erupting volcano. Plays as a summon that fields
// a 0-attack / 3-HP ally carrying 3 Armor. The egg can never swing
// (special-cased in the attack-target picker via the _cantAttack
// flag) but every hit it eats counts toward its hatch threshold
// (Creature._eggDamage, persisted via save.js). At the threshold
// the egg transforms into a White Dragon Wyrmling — stats wired
// once the user provides them.
export function createWhiteDragonEgg() {
  return new Card({
    id: 'white_dragon_egg', name: 'White Dragon Egg',
    description: 'Recharge -> Call the White Dragon Egg to the battle.',
    shortDesc: 'R->Call the Egg\n0/3 Armor 3',
    subtype: 'relic',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_white_dragon_egg', 1, TargetType.SUMMON),
    ],
    tier: 2,
    rarity: 'legendary',
    previewCreature: (() => {
      const c = new Creature({
        name: 'White Dragon Egg', attack: 0, maxHp: 3, armor: 3,
        description: 'Cannot attack. When Attacked: Attacker gains 1 Ice.',
      });
      c._cantAttack = true;
      // Baseline attacker-ice value; CREATURE_TIER_OFFSET bumps
      // this by +0.5 per offset via scaleCreatureWithOffset.
      c.attackerGainsIce = 1;
      return c;
    })(),
    // The egg + Wyrmling scale via CREATURE_TIER_OFFSET; the card
    // itself has no per-effect bump, just the opt-in marker so the
    // codex stamps the name/tier suffix and drops the red badge.
    gamePlusOffset: {},
  });
}

// White Dragon Wyrmling — what hatches from the egg once it's
// eaten the threshold damage. Placeholder stats until the user
// provides final numbers + art. Plays like a normal CREATURE
// card; the summon_white_dragon_wyrmling effect spawns the
// matching ally creature. Hatch flow in main.js
// (hatchWhiteDragonEgg) also swaps the on-field egg for a fresh
// Wyrmling creature without re-playing this card.
export function createWhiteDragonWyrmling() {
  return new Card({
    id: 'white_dragon_wyrmling', name: 'White Dragon Wyrmling',
    description: 'Recharge a card ->\nCall the White Dragon Wyrmling\nto the battle!\nDraw.',
    shortDesc: 'R+1->Call\nthe Wyrmling\nDraw',
    // 'allies' subtype (matches Thorb / Raena / Valdrisa companion
    // cards) — the wyrmling fights alongside the party as a
    // companion ally, so it gets the brown ally-card frame tint
    // and codex-categorizes under Allies instead of Relics.
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    // Effect order matters: arrow + ice spread on enemies first
    // (the "Called" beat the player sees), then the caster's Ice
    // converts to Shield, then the wyrmling actually enters.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_ice_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('transform_ice_to_shield_self', 0, TargetType.SELF),
      new CardEffect('summon_white_dragon_wyrmling', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'legendary',
    previewCreature: new Creature({
      name: 'White Dragon Wyrmling', attack: 3, maxHp: 6, iceAttack: 1, armor: 1,
      description: 'Called: Deal Ice to all enemies. Ice becomes Shields. Attacks apply 1 Ice.',
    }),
    // The on-card "Called: Deal Ice to all enemies" scales +1/3
    // per offset on the apply_ice_all effect (1 → 2 at +3). The
    // Wyrmling creature itself scales via CREATURE_TIER_OFFSET
    // (attack +1, hp +2, armor +1/3, iceAttack +1/3 per offset).
    gamePlusOffset: { apply_ice_all: 1/3 },
  });
}

// Dragon Tooth Dagger — Tier 2 epic stays-in-hand weapon, one of
// the Varimatras loot picks. Hits for a respectable 3 damage on
// any target, and another +2 when the target is already Iced
// (synergizes with Wing Buffet's board-wide chill + the player's
// own Ice spells / Gnikan's Staff Ice tick). Same baton/dagger
// SFX family as the other dagger weapons — wired in main.js via
// the dagger keyword sniff in getWeaponSfxKeys (no override needed).
export function createDragonToothDagger() {
  return new Card({
    id: 'dragon_tooth_dagger',
    name: 'Dragon Tooth Dagger',
    description: 'Deal 3 Damage. Iced: +2 Damage. Stays in hand.',
    shortDesc: '3 Dmg\n+2 if Iced\nStays',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      // Modifier rider — read by the 'damage' handler in main.js
      // (mirrors damaged_bonus_damage). Adds the value to the swing
      // when the picked target currently has any Ice stacks.
      new CardEffect('iced_bonus_damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { damage: 1, iced_bonus_damage: 1 },
  });
}

// ============================================================
// Wizard Cards
// ============================================================

export function createClothArmor() {
  return new Card({
    id: 'cloth_armor',
    name: 'Cloth Armor',
    description: 'Block 1, Heal 1, Scry 2.',
    shortDesc: 'Block 1, Heal 1\nScry 2',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('heal', 1, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    gamePlusOffset: { block: 1, heal: 1, scry_pick: 1 },
  });
}

export function createFireBurst() {
  return new Card({
    id: 'fire_burst',
    name: 'Fire Burst',
    description: 'Deal 1 Damage and 2 Fire.',
    shortDesc: '1 Dmg+2 Fire',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire', 2, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 2, apply_fire: 1 },
    characterClass: ['wizard'],
    tier: 1,
    rarity: 'uncommon',
  });
}

export function createIceBolt() {
  return new Card({
    id: 'ice_bolt',
    name: 'Ice Bolt',
    description: 'Recharge a Card ->\nDeal 3 Ice + 1 Damage, Draw.',
    shortDesc: 'R+1->3 Ice\n+1 Dmg, Draw',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // Effect order matters: stack 3 Ice on the target FIRST, then the
    // 1 damage rolls through with a fresh chance to trigger Ice
    // Shatter (the shatter rider checks the target's ice stack count
    // AT the moment damage lands; with 3 stacks now sitting on the
    // target, the 1 damage has a real chance to detonate). Draw closes
    // the play. recharge_extra 1 makes the cast cost 2 cards (Ice Bolt
    // itself + 1 more recharged from hand) — same template as the
    // martial 2H weapons.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_ice', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 1, apply_ice: 1 },
    characterClass: ['wizard'],
    tier: 1,
    rarity: 'uncommon',
  });
}

export function createMagicMissiles() {
  return new Card({
    id: 'magic_missiles',
    name: 'Magic Missiles',
    description: 'Arcane: Recharge a Card ->\nDeal 1 Damage X 3, Draw.',
    shortDesc: 'R->1 Dmg X3\nDraw',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // magic_missile_barrage value = per-shot damage. Shot count is
    // hard-fixed at 3 in the handler (matches the rebuilt card text).
    // Draw fires after the barrage completes via finishBarrage.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('magic_missile_barrage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { magic_missile_barrage: 1 },
    arcaneHits: 3, // one Vortex proc per hit
    characterClass: ['wizard'],
    tier: 1,
    rarity: 'uncommon',
  });
}

export function createArcaneShield() {
  return new Card({
    id: 'arcane_shield',
    name: 'Arcane Shield',
    description: 'Block 4. Draw.',
    shortDesc: 'Block 4, Draw',
    // Subtype stays 'ability' so it groups with other Wizard abilities,
    // but cardType is DEFENSE so the DEFENDING phase recognizes it as
    // playable like armor.
    subtype: 'ability',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 4, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 3 },
    // Tier 1 ability for both Wizard and Necromancer — the apprentice
    // gets a copy granted from the book at the Stone Stair scene. The
    // 4 block alone is one short of Death Sickle's 5 damage, so the
    // apprentice has to layer another point of mitigation (armor,
    // residual shield, a second defense card) on top to fully absorb
    // and skip the "Hit: Death" rider.
    characterClass: ['wizard', 'necromancer'],
    tier: 1,
    rarity: 'uncommon',
  });
}

// ============================================================
// Rogue Cards
// ============================================================

export function createVialOfPoison() {
  return new Card({
    id: 'vial_of_poison',
    name: 'Vial of Poison',
    description: 'Consume -> Next attack applies 1 Poison.',
    shortDesc: 'C->Next: +1 Poison',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [new CardEffect('grant_poison_buff', 1, TargetType.SELF)],
    characterClass: ['rogue'],
    tier: 1,
    // +0.5 Poison per offset (floor — +1 at +2, +2 at +4 …).
    gamePlusOffset: { grant_poison_buff: 0.5 },
    // Spawned by Pet Spider's play — it's a token, so the Antiquity
    // shop sells it for 0 gp and other shops reject it (token gate).
    // Counted in the deck (added to masterDeck by the handler) so the
    // inventory shows it and the player can rebalance it normally.
    isToken: true,
    // Sellable everywhere despite the token + class-restriction
    // gates — player should be able to offload a vial back to the
    // city's general store / arcane emporium for a couple of gold.
    sellable: true,
  });
}

export function createSneakAttack() {
  return new Card({
    id: 'sneak_attack',
    name: 'Sneak Attack',
    description: 'Deal X Damage.\nX = Attacks this turn (counts itself).',
    shortDesc: 'X Dmg\nX=Attacks (counts itself)',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('sneak_attack', 0, TargetType.SINGLE_ENEMY)],
    characterClass: ['rogue', 'druid'],
    tier: 1,
    rarity: 'uncommon',
    // +2 base damage per offset. Effect value carries the flat bonus
    // (0 by default → 2 → 4…); runtime adds it on top of the X count.
    gamePlusOffset: { sneak_attack: 2 },
  });
}

function createSmallSpiderCreature() {
  return new Creature({
    name: 'Pet Spider',
    attack: 0,
    maxHp: 1,
    poisonAttack: true,
  });
}

export function createPetSpider() {
  return new Card({
    id: 'pet_spider',
    name: 'Pet Spider',
    description: 'Summon 1-2 Pet Spiders.\nCreate 1 Vial of Poison.',
    shortDesc: 'Summon 1-2 Spiders\n+Vial of Poison',
    subtype: 'ability',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      // value=2 → handler rolls 1-2 spiders. Enemy slyblade summons
      // still use value=1 (unchanged) and spawn exactly one.
      new CardEffect('summon_small_spider', 2, TargetType.SUMMON),
      new CardEffect('create_vial_of_poison', 1, TargetType.SELF),
    ],
    characterClass: ['rogue'],
    tier: 1,
    rarity: 'uncommon',
    previewCreature: createSmallSpiderCreature(),
    previewCard: createVialOfPoison(),
    // +1 max spiders summoned per offset (1-2 → 1-3 → 1-4…). Each
    // spider is +1/+1 via CREATURE_TIER_OFFSET['Pet Spider']; the
    // hover preview rescales the creature automatically. Card name
    // / tier still get the standard "+" suffix on top.
    gamePlusOffset: { summon_small_spider: 1 },
  });
}

// ============================================================
// Warrior Cards
// ============================================================

export function createHeroicStrike() {
  return new Card({
    id: 'heroic_strike',
    name: 'Heroic Strike',
    // Melee counterpart to Aimed Shot — a single 4-damage hit that
    // spends Heroism twice (Heroism: +2 via the heroism_double rider
    // the 'damage' case reads). A Heroism SPENDER to pay off the
    // generators (Heroic Heal overheal, etc.), not another generator.
    description: 'Deal 4 Damage.\nHeroism: +2.',
    shortDesc: '4 Dmg\nHeroism: +2',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heroism_double', 1, TargetType.SELF),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['paladin', 'warrior'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { damage: 3 },
  });
}

export function createCharge() {
  return new Card({
    id: 'charge',
    name: 'Charge',
    description: 'Deal 3. First Attack: Draw.',
    shortDesc: '3\nFirst Attack: Draw',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('charge_attack', 3, TargetType.SINGLE_ENEMY)],
    characterClass: ['warrior'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { charge_attack: 2 },
  });
}

export function createGreaterCleave() {
  return new Card({
    id: 'greater_cleave',
    name: 'Greater Cleave',
    description: 'Recharge -> Next martial weapon hits an extra target.',
    shortDesc: 'R->+1 Target',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('greater_cleave_buff', 1, TargetType.SELF)],
    characterClass: ['warrior'],
    tier: 1,
    rarity: 'uncommon',
    noTierOffset: true,
  });
}

export function createRecklessStrike() {
  return new Card({
    id: 'reckless_strike',
    name: 'Reckless Strike',
    // Base damage drops from 8 to 6 — the +4 offset bump (10 at +1,
    // 14 at +2…) is the real reward, so the base sits a tier lower.
    description: 'Discard -> Deal 6 Damage.',
    shortDesc: 'D->6 Dmg',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.DISCARD,
    effects: [new CardEffect('damage', 6, TargetType.SINGLE_ENEMY)],
    characterClass: ['warrior'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { damage: 4 },
  });
}

export function createShieldBash() {
  return new Card({
    id: 'shield_bash',
    name: 'Shield Bash',
    description: 'Gain 1 Shield,\nDeal damage = 1/2 Shields.',
    shortDesc: '+1 Shield\nDmg=1/2 Shield',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('shield_bash_half', 1, TargetType.SINGLE_ENEMY)],
    characterClass: ['warrior', 'paladin'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { shield_bash_half: 1 },
  });
}

// ============================================================
// Paladin Cards
// ============================================================

export function createHolyLight() {
  return new Card({
    id: 'holy_light',
    name: 'Holy Light',
    description: 'Recharge -> Heal 1, Draw.',
    shortDesc: 'R->Heal 1, Draw',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heal', 1, TargetType.SINGLE_ALLY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['paladin'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { heal: 1 },
  });
}

export function createShieldOfFaith() {
  return new Card({
    id: 'shield_of_faith',
    name: 'Shield of Faith',
    description: 'Gain Shield, Draw.',
    shortDesc: 'Gain Shield\nDraw',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 1, TargetType.SINGLE_ALLY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['paladin'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { gain_shield: 2 },
  });
}

// ============================================================
// Ranger Cards
// ============================================================

export function createCarefulStrike() {
  return new Card({
    id: 'careful_strike',
    name: 'Careful Strike',
    description: 'Recharge -> Deal 2 Damage, Gain Shield equal to Damage dealt.',
    shortDesc: 'R->2 Dmg\n+Shield = Dmg',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('careful_strike', 2, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['ranger', 'rogue'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { careful_strike: 2 },
  });
}

// Heroic Tumble — Tier 1 Rogue / Ranger DEFENSE ability. Replaces
// Careful Strike on those classes' starter ability picks. Coin-flip
// on play: 50% to gain 6 Block; leftover Block (after the incoming
// hit lands) converts to Heroism so the swing-after pays off. Always
// draws a card on play.
export function createHeroicTumble() {
  return new Card({
    id: 'heroic_tumble',
    name: 'Heroic Tumble',
    description: '50% to gain 6 Block.\nUnused Block becomes Heroism.\nDraw.',
    shortDesc: '50% +6 Block\nLeftover->Heroism\nDraw',
    subtype: 'ability',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('tumble_block', 50, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['ranger', 'rogue'],
    tier: 1,
    rarity: 'uncommon',
    // +4 block per offset (6 → 10 → 14…). Block amount lives in the
    // runtime handler (tumble_block.value carries the percent
    // chance), so the custom heroic_tumble branch in
    // applyGamePlusOffsetInPlace rewrites the description and the
    // runtime reads playerTierOffset directly.
    gamePlusOffset: { heroic_tumble_block: 4 },
  });
}

export function createMultiShot() {
  return new Card({
    id: 'multi_shot',
    name: 'Multi Shot',
    description: 'Recharge -> Deal 1 Damage to up to 3 targets.',
    shortDesc: 'R->1 Dmg x3',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('multi_damage', 1, TargetType.SINGLE_ENEMY, 3)],
    characterClass: ['ranger'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { multi_damage: 1 },
  });
}

// Aimed Shot — Ranger + Rogue tier-1 attack. Pays an extra Recharge
// card on top of the base recharge cost; in return the attack scales
// twice as hard with stockpiled Heroism (e.g. 4 Heroism + 3 base = 11
// damage instead of 7), plus draws a card. Replaces Multi Shot in the
// Ranger pool and Vial of Poison in the Rogue pool — Rogue still gets
// vials via Pet Spider's play token.
export function createAimedShotCard() {
  return new Card({
    id: 'aimed_shot_card',
    name: 'Aimed Shot',
    // The only ability that's a bow shot, so it feeds a Quiver like one. Stays
    // an Ability everywhere that matters (deck limits, class list, codex tab) —
    // the trait only changes what triggers off it.
    subtype2: 'ranged',
    description: 'Recharge a Card -> Deal 4 Damage, Draw.\nHeroism: +2.',
    shortDesc: 'R-Card->4 Dmg, Draw\nHeroism: +2',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heroism_double', 1, TargetType.SELF),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['ranger', 'rogue'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { damage: 3 },
  });
}

export function createGoodberry() {
  return new Card({
    id: 'goodberry',
    name: 'Goodberry',
    description: 'Consume -> Heal 1 and some sustenance.\nIf No Meal: Basic sustenance for 2 turns.',
    shortDesc: 'C->Heal 1\n+Sustenance\nMeal(if free)',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 1, TargetType.SELF),
      // Sustenance — 50% chance to grant one random buff (Shield /
      // Heroism / Draw / Heal). Resolves in resolveEffect:goodberry_sustenance.
      new CardEffect('goodberry_sustenance', 1, TargetType.SELF),
      // Fallback meal — grant_provision reads the `provision` field
      // below. Marked conditionalOnEmpty so it only fires when no
      // other meal is already active; with a stronger meal on the
      // bar this is a silent no-op (the on-play heal + sustenance
      // still resolved).
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Goodberry',
      effectType: 'goodberry_sustenance',
      value: 1,
      turnsPerCombat: 2,
      conditionalOnEmpty: true,
      description: 'Basic sustenance for 2 turns each combat (if no other meal).',
    },
    isToken: true,
    // +1 heal per offset, +1 sustenance roll per offset. Helper also
    // bumps tier (name suffix) automatically. The provision's own
    // sustenance value mirrors the effect bump in a custom goodberry
    // handler in applyGamePlusOffsetInPlace.
    gamePlusOffset: { heal: 1, goodberry_sustenance: 1 },
  });
}

// Raena — recruited at Calm Grove after the General Zhost fight. Summons
// the multi-attack ranger as a player ally (R+1 cost).
export function createRaenaCard() {
  return new Card({
    id: 'raena_card',
    name: 'Raena',
    description: 'Recharge a card ->\nCall Raena to the battle!\nDraw.\nCalled: Deal 2 Damage.',
    shortDesc: 'Call Raena, Draw\nCalled: 2 Dmg',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    // SINGLE_ENEMY damage effect forces targeting — Raena looses an
    // arrow on the way in (matches her base attack stat). Then the
    // summon spawns her on the field as a normal ally creature.
    // Marked optional so the play flow gracefully skips it when no
    // valid target exists (e.g. Stone Giant invulnerable, no boulders
    // alive) — the card still summons. noAttackCount keeps her arrow
    // out of Sneak Attack's scaling count.
    effects: (() => {
      const arrow = new CardEffect('damage', 2, TargetType.SINGLE_ENEMY);
      arrow.optional = true;
      arrow.noAttackCount = true;
      // fromAlly — the arrow is Raena's shot, so a Riposte lashes back at
      // HER, not the player. Summon resolves FIRST so she's on the field
      // to take it (see the `damage` handler + triggerSplitPower).
      arrow.fromAlly = true;
      return [
        new CardEffect('summon_raena', 1, TargetType.SUMMON),
        arrow,
        new CardEffect('recharge_extra', 1, TargetType.SELF),
        new CardEffect('draw', 1, TargetType.SELF),
      ];
    })(),
    rarity: 'rare',
    isUnique: true,
    tier: 1,
    previewCreature: createRaenaCreature(),
    // Companion card — offset system swaps tier chain ids.
    noTierOffset: true,
  });
}

// Raena (tier 2) — upgraded version awarded at the Welcome to Tharnag
// level-up. Stats bump to 3/4 with the same multi-attack profile.
export function createRaenaCard2() {
  return new Card({
    id: 'raena_card_2',
    name: 'Raena',
    description: 'Recharge a card ->\nCall Raena to the battle!\nDraw.\nCalled: Deal 3 Damage.',
    shortDesc: 'Call Raena, Draw\nCalled: 3 Dmg',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: (() => {
      const arrow = new CardEffect('damage', 3, TargetType.SINGLE_ENEMY);
      arrow.optional = true;
      arrow.noAttackCount = true;
      arrow.fromAlly = true; // Riposte hits Raena, not the player (summon first)
      return [
        new CardEffect('summon_raena_upgraded', 1, TargetType.SUMMON),
        arrow,
        new CardEffect('recharge_extra', 1, TargetType.SELF),
        new CardEffect('draw', 1, TargetType.SELF),
      ];
    })(),
    rarity: 'rare',
    isUnique: true,
    tier: 2,
    previewCreature: createRaenaUpgradedCreature(),
    // Companion card — offset system swaps tier chain ids.
    noTierOffset: true,
  });
}

// Raena tier 3 — ccgQuest+ rescue version at offset 2+. Summons a
// 5/5 multi-attack Raena (see createRaenaTier3Creature). On-call
// arrow scales to 4 to match her bumped power.
export function createRaenaCardTier3() {
  return new Card({
    id: 'raena_card_3',
    name: 'Raena',
    description: 'Recharge a card ->\nCall Raena to the battle!\nDraw.\nCalled: Deal 5 Damage.',
    shortDesc: 'Call Raena, Draw\nCalled: 5 Dmg',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: (() => {
      const arrow = new CardEffect('damage', 5, TargetType.SINGLE_ENEMY);
      arrow.optional = true;
      arrow.noAttackCount = true;
      arrow.fromAlly = true; // Riposte hits Raena, not the player (summon first)
      return [
        new CardEffect('summon_raena_tier3', 1, TargetType.SUMMON),
        arrow,
        new CardEffect('recharge_extra', 1, TargetType.SELF),
        new CardEffect('draw', 1, TargetType.SELF),
      ];
    })(),
    rarity: 'rare',
    isUnique: true,
    tier: 3,
    previewCreature: createRaenaTier3Creature(),
    // Top of the Raena tier chain — no further offset stamping.
    noTierOffset: true,
  });
}

// Lambas Bread — elvish healing item awarded by Raena at Calm Grove.
export function createLambasBread() {
  return new Card({
    id: 'lambas_bread',
    name: 'Lambas Bread',
    description: 'Consume + Recharge 1 -> Heal 6.\nMeal: Heal 1 or Heroism for 3 turns.',
    shortDesc: 'C+R1->Heal 6\nMeal: Heal/Heroism 3T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 6, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Lambas Bread',
      turnsPerCombat: 3,
      effects: [
        { effectType: 'random_pick', options: [
          { effectType: 'heal', value: 1 },
          { effectType: 'gain_heroism', value: 1 },
        ]},
      ],
      description: 'Heal 1 or Heroism each turn for 3 turns (each combat, until rest)',
    },
    rarity: 'uncommon',
    // +3 on-play heal per offset. Meal duration bumps by +1 turn
    // per offset via a custom lambas_bread handler in
    // applyGamePlusOffsetInPlace (the per-turn random_pick value
    // stays at 1 — it's a flavor option, not a numeric scale).
    gamePlusOffset: { heal: 3, lambas_bread_turns: 1 },
  });
}

// Fresh Fish — reward from the Cozy Spot fishing minigame south of
// the outpost (after surviving the Sahuagin Sentinel ambush). Uncommon
// item that doubles as a meal: small persistent heal each turn plus a
// swim-trigger draw for the buff's duration.
export function createFreshFish() {
  return new Card({
    id: 'fresh_fish',
    name: 'Fresh Fish',
    description: 'Consume + Recharge 1 -> Heal 2.\nMeal: Heal 1.\nOn Swim: Draw. (4 turns)',
    shortDesc: 'C+R1->Heal 2\nMeal: Heal 1\nOn Swim: Draw\n(4 turns)',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 2, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Fresh Fish',
      effectType: 'heal',
      value: 1,
      turnsPerCombat: 4,
      // Swim hook is checked imperatively in the swim-recharge handler
      // (main.js) via the buff's `swimDraw` flag.
      swimDraw: 1,
      description: 'Heal 1 each turn for 4 turns. While active, recharging a card during Swim also draws 1.',
    },
    rarity: 'uncommon',
    tier: 1,
    // +2 Consume heal per offset, +0.5 Meal heal per offset (the
    // custom branch in applyGamePlusOffsetInPlace bumps
    // provision.value with a separate fresh_fish_meal rate).
    gamePlusOffset: { heal: 2, fresh_fish_meal: 0.5 },
  });
}

// Frostbloom — rare blue flower from the High Valley above the Last
// Watch. Awarded once on the Frostbloom Patch encounter. Consumes
// to wipe two Ailments and patch up 1 HP — Olbrim's go-to remedy.
// Bag of Herbs — Olbrim's dropped satchel. Recharge cost; the cast
// rolls 2 random picks (with repeats) from a small pool of herbal
// consumables and adds them to the hand. Awarded once at the Cold
// Spring encounter alongside the find of his trail.
export function createBagOfHerbs() {
  const card = new Card({
    id: 'bag_of_herbs',
    name: "Olbrim's Bag of Herbs",
    description: 'Recharge -> Gain 2 Herbs:\nGoodberry, Cave Shroom, or Frostbloom.',
    shortDesc: 'R->2 Herbs\n(GB/CS/FB)',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_random_herbs', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { gain_random_herbs: 1/3 }, // +1 herb every 3 offsets
    // Side preview — show the three herbs it can draw from.
    previewCards: [createGoodberry(), createCaveShroom(), createFrostbloom()],
  });
  return card;
}

export function createFrostbloom() {
  return new Card({
    id: 'frostbloom',
    name: 'Frostbloom',
    description: 'Consume -> Heal 2 Ailments, Heal 1.',
    shortDesc: 'C->Heal 2 Ail\nHeal 1',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal_n_negative_effects', 2, TargetType.SELF),
      new CardEffect('heal', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { heal_n_negative_effects: 0.5, heal: 0.5 }, // +0.5 each per offset
  });
}

// Small Faery — gift from the Calm Stream "Bathe" choice. Banish to heal
// the player and all allies for 3.
export function createSmallFaery() {
  return new Card({
    id: 'small_faery',
    name: 'Small Faery',
    description: 'Consume -> Heal yourself and your allies for 3.',
    shortDesc: 'C->Heal All 3',
    subtype: 'allies',
    cardType: CardType.ABILITY,
    costType: CostType.BANISH,
    effects: [new CardEffect('heal_all', 3, TargetType.SELF)],
    rarity: 'rare',
    tier: 1,
    gamePlusOffset: { heal_all: 3 },
  });
}

export function createGoodberries() {
  return new Card({
    id: 'goodberries',
    name: 'Goodberries',
    description: 'Create some Goodberries.',
    shortDesc: 'Some\nGoodberries',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    // eff.value is the cap on the random roll (1..N). Handler at
    // resolveEffect:create_goodberries rolls 1+rand(value) tokens
    // and adds them to hand (capped by MAX_HAND_SIZE).
    effects: [new CardEffect('create_goodberries', 3, TargetType.SELF)],
    characterClass: ['ranger'],
    tier: 1,
    rarity: 'uncommon',
    previewCard: createGoodberry(),
    // +1 max Goodberry per offset (3 → 4 → 5…). Each spawned berry
    // is also scaled in the create_goodberries runtime via
    // applyGamePlusOffsetInPlace so a Tier+1 Goodberries+ produces
    // Tier+1 Goodberry+ tokens.
    gamePlusOffset: { create_goodberries: 1 },
  });
}

// ============================================================
// Druid Cards
// ============================================================

export function createWrath() {
  return new Card({
    id: 'wrath',
    name: 'Wrath',
    description: 'Choose 1:\n4 Damage\nOR 1 Damage, Draw.',
    shortDesc: 'R->4 Dmg\nOR 1 Dmg, Draw',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [],
    modes: [
      new CardMode('Deal 4 Damage', [
        new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      ]),
      new CardMode('Deal 1 Damage, Draw', [
        new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
        new CardEffect('draw', 1, TargetType.SELF),
      ]),
    ],
    gamePlusOffset: { modes: [{ damage: 3 }, { damage: 1 }] },
    characterClass: ['druid'],
    tier: 1,
    rarity: 'uncommon',
  });
}

// Legacy Regrowth — the original Heal 2 + flat Regen 4 version, kept
// registered (LEGACY_CARD_IDS) so older saves still deserialize. The
// active 'regrowth' below replaced it with the overheal→Treant kit.
export function createRegrowthLegacy() {
  return new Card({
    id: 'regrowth_legacy',
    name: 'Regrowth',
    description: 'Heal 2. Heal 1 at start of turn for 4 turns.',
    shortDesc: 'Heal 2\n+Regen 4t',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heal', 2, TargetType.SELF),
      new CardEffect('regen_buff', 4, TargetType.SELF),
    ],
    characterClass: ['druid'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { heal: 2, regen_per_turn: 1 },
  });
}

// Regrowth — Druid Tier 1. Heal 1 now + Heal 1/turn for 4 turns; ANY
// overheal (healing past max HP, on the on-play heal OR a regen tick)
// sprouts a Treant (2/1 Haste) instead of being wasted. Shows the
// Treant as a side preview via previewCreature.
export function createRegrowth() {
  return new Card({
    id: 'regrowth',
    name: 'Regrowth',
    description: 'Heal 1, Heal 1 for 4 Turns.\nOverheal: Summon a Treant.',
    shortDesc: 'Heal 1, Regen 4t\nOverheal: Treant',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    // SINGLE_ALLY — cast on yourself OR any ally (rare for a regen, but
    // the ally regen channel now supports it). The immediate heal and
    // the 4-turn regen both land on whoever you pick.
    effects: [
      new CardEffect('heal_overheal_treant', 1, TargetType.SINGLE_ALLY),
      new CardEffect('regen_treant_buff', 4, TargetType.SINGLE_ALLY),
    ],
    characterClass: ['druid'],
    tier: 1,
    rarity: 'uncommon',
    previewCreature: createTreantCreature(),
    // +1 on-play heal per offset; per-turn regen bumps in the runtime
    // (heal_overheal_treant buff tick reads playerTierOffset). Custom
    // regrowth handler rebuilds the description from scaled values.
    gamePlusOffset: { heal_overheal_treant: 1, regen_per_turn: 1 },
  });
}

// Legacy Feral Swipe (shield → damage-per-shield version). Kept under
// the new id so older saves still deserialize cleanly, but no longer
// offered on level-up / shrine picks. The active Feral Swipe is the
// bleed-themed rewrite below.
export function createFeralSwipeLegacy() {
  return new Card({
    id: 'feral_swipe_legacy',
    name: 'Feral Swipe',
    description: 'Recharge -> Gain 2 Shield.\nDeal 2 damage per Shield\nto separate enemies.',
    shortDesc: 'R->Shield 2\n2 Dmg x Shield',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('feral_swipe_damage', 2, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['druid'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { gain_shield: 1, feral_swipe_damage: 1 },
  });
}

// Feral Swipe (bleed variant) — Druid tier 1 ability. Applies Bleed
// to up to 3 alive enemies (auto-target: enemy character + their
// creatures, in order), then grants Shield per bleeding enemy on the
// field. Stacks per offset: +1 Bleed per attack, +1 Shield per
// bleeding target. The shield count reads the final state, so
// previously bleeding targets also count.
export function createFeralSwipe() {
  return new Card({
    id: 'feral_swipe',
    name: 'Feral Swipe',
    description: 'Deal Bleed to up to 3 targets.\nGain Shield for each bleeding enemy.',
    shortDesc: 'Bleed 3 tgts\n+Shield/bleeding',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      // SINGLE_ENEMY target type so the click flow routes to the
      // multi-target picker (Multi Shot / Wooden Axe style) instead
      // of self-resolving against the auto-target list.
      new CardEffect('feral_swipe_bleed', 1, TargetType.SINGLE_ENEMY, 3),
    ],
    characterClass: ['druid'],
    tier: 1,
    rarity: 'uncommon',
    // +1 Bleed per attack per offset, +1 Shield per bleeding target
    // per offset. Both numbers scale together; the picker resolution
    // reads playerTierOffset directly for the shield-per-bleeding.
    gamePlusOffset: { feral_swipe_bleed: 1 },
  });
}

// ============================================================
// Starter Deck Functions
// ============================================================

export function getPaladinStarterDeck() {
  const cards = [];
  // 2 Wooden Swords
  for (let i = 0; i < 2; i++) cards.push(createWoodenSword());
  // 3 Leather Armors
  for (let i = 0; i < 3; i++) cards.push(createLeatherArmor());
  // 2 Cracked Buckler
  for (let i = 0; i < 2; i++) cards.push(createCrackedBuckler());
  // 2 Wooden Greatsword
  for (let i = 0; i < 2; i++) cards.push(createWoodenGreatsword());
  // 2 Rock Mace
  for (let i = 0; i < 2; i++) cards.push(createRockMace());
  // 1 Scraps
  cards.push(createScraps());
  return cards;
}

export function getRangerStarterDeck() {
  const cards = [];
  // 3 Short Bow
  for (let i = 0; i < 3; i++) cards.push(createShortBow());
  // 2 Wooden Axe
  for (let i = 0; i < 2; i++) cards.push(createWoodenAxe());
  // 2 Wooden Sword
  for (let i = 0; i < 2; i++) cards.push(createWoodenSword());
  // 3 Leather Armor
  for (let i = 0; i < 3; i++) cards.push(createLeatherArmor());
  // 1 Scraps — the second one is now the Quiver, which the three Short Bows
  // all want as their recharge cost anyway.
  cards.push(createScraps());
  // 1 Quiver
  cards.push(createQuiver());
  return cards;
}

// Necromancer starter deck — Path of the Necromancer side quest. The
// apprentice's house is bare. They start with just three Cloth Armor
// cards; the first heals are earned by rummaging the Storage Area
// (Scraps) and the rest of the kit gets fleshed out by exploring
// the rest of the house and the abbey beyond. Wizard-cloned ability
// pool / power / weapon access lives in the dispatch maps (see
// CLASS_WEAPONS / getAbilityChoices) so the class still functions
// before its own ability list is authored.
export function getNecromancerStarterDeck() {
  const cards = [];
  for (let i = 0; i < 3; i++) cards.push(createClothArmor());
  return cards;
}

// Necromancer MAIN-GAME starter deck — used when the Necromancer is
// picked as a full class at character select (unlocked by finishing
// the Path of the Necromancer side quest). Unlike the side-quest
// apprentice (bare 3 Cloth Armor), the experienced necromancer starts
// with a complete kit AND the Skeleton Mastery power (granted at the
// class start, see startGameWithAbility). The three signature spells
// (Drain Life / Army of the Dead / Shadow Bolt) are baked in, so this
// class skips the character-creation ability pick.
export function getNecromancerMainDeck() {
  const cards = [];
  for (let i = 0; i < 3; i++) cards.push(createClothArmor());
  cards.push(createScraps());
  cards.push(createShortStaff());
  for (let i = 0; i < 2; i++) cards.push(createBoneDagger());
  cards.push(createMortainsStaff());
  cards.push(createApprenticesSpellbook());
  cards.push(createDrainLife());
  cards.push(createArmyOfTheDeadCard());
  cards.push(createShadowBolt());
  return cards;
}

export function getWizardStarterDeck() {
  const cards = [];
  // 3 Short Staff
  for (let i = 0; i < 3; i++) cards.push(createShortStaff());
  // 2 Cloth Armor
  for (let i = 0; i < 2; i++) cards.push(createClothArmor());
  // 1 Fire Burst
  cards.push(createFireBurst());
  // 1 Ice Bolt
  cards.push(createIceBolt());
  // 1 Magic Missiles
  cards.push(createMagicMissiles());
  // 1 Arcane Shield
  cards.push(createArcaneShield());
  // 1 Apprentice's Spellbook — wizard-flavored stays-in-hand Heroism
  // ping. Replaces one Scraps in the starter so the wizard has a
  // signature item out of the gate.
  cards.push(createApprenticesSpellbook());
  // 2 Scraps
  for (let i = 0; i < 2; i++) cards.push(createScraps());
  return cards;
}

export function getRogueStarterDeck() {
  const cards = [];
  // 2 Wooden Swords
  for (let i = 0; i < 2; i++) cards.push(createWoodenSword());
  // 2 Short Bows
  for (let i = 0; i < 2; i++) cards.push(createShortBow());
  // 2 Bone Daggers
  for (let i = 0; i < 2; i++) cards.push(createBoneDagger());
  // 3 Leather Armors
  for (let i = 0; i < 3; i++) cards.push(createLeatherArmor());
  // 2 Scraps
  for (let i = 0; i < 2; i++) cards.push(createScraps());
  // 1 Small Pouch
  cards.push(createSmallPouch());
  return cards;
}

export function getWarriorStarterDeck() {
  const cards = [];
  // 3 Wooden Axe
  for (let i = 0; i < 3; i++) cards.push(createWoodenAxe());
  // 2 Wooden Greatsword
  for (let i = 0; i < 2; i++) cards.push(createWoodenGreatsword());
  // 2 Rock Mace
  for (let i = 0; i < 2; i++) cards.push(createRockMace());
  // 1 Scraps
  cards.push(createScraps());
  // 3 Leather Armor
  for (let i = 0; i < 3; i++) cards.push(createLeatherArmor());
  // 1 Cracked Buckler
  cards.push(createCrackedBuckler());
  return cards;
}

export function getDruidStarterDeck() {
  const cards = [];
  // 1 Bone Dagger
  cards.push(createBoneDagger());
  // 3 Short Staff
  for (let i = 0; i < 3; i++) cards.push(createShortStaff());
  // 3 Leather Armor
  for (let i = 0; i < 3; i++) cards.push(createLeatherArmor());
  // 1 Cracked Buckler
  cards.push(createCrackedBuckler());
  // 2 Scraps
  for (let i = 0; i < 2; i++) cards.push(createScraps());
  // 1 Small Pouch
  cards.push(createSmallPouch());
  // 1 Wrath
  cards.push(createWrath());
  return cards;
}

// ============================================================
// Additional Ability Cards (not in starter decks)
// ============================================================

export function createFlashHeal() {
  return new Card({
    id: 'flash_heal',
    name: 'Flash Heal',
    description: 'Heal 4.',
    shortDesc: 'Heal 4',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('heal', 4, TargetType.SINGLE_ALLY)],
    characterClass: ['paladin'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { heal: 3 },
  });
}

// Heroic Heal — Paladin Tier 1. Replaces Flash Heal in the tier-1 pool.
// Heal 4 (targetable at the player or any ally, like every other heal);
// any healing beyond the target's max HP overflows into Heroism 1:1
// instead of being wasted. Same FlashHeal.jpg art for now.
export function createHeroicHeal() {
  return new Card({
    id: 'heroic_heal',
    name: 'Heroic Heal',
    description: 'Heal 4.\nOverheal: Heroism.',
    shortDesc: 'Heal 4\nOverheal: Heroism',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('heal_overheal_heroism', 4, TargetType.SINGLE_ALLY)],
    characterClass: ['paladin'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { heal_overheal_heroism: 3 },
  });
}

function createTamedRatCreature() {
  return new Creature({
    name: 'Tamed Rat',
    attack: 1,
    maxHp: 1,
    description: 'Forage: 50% to scrounge\na Goodberry on attack.',
  });
}

// Player-summoned Dire Rat (Ranger ally). Distinct from the enemy
// Dire Rat fight (a Character) — this is the spawned creature.
// Bloodfrenzy mirrors Shark: +1 Rage per swing, so the rat grows
// teeth the longer it stays alive.
function createDireRatCreature() {
  return new Creature({
    name: 'Dire Rat',
    attack: 2,
    maxHp: 2,
    armor: 1,
    bloodfrenzy: 1,
    description: 'Bloodfrenzy: +1 Rage after attacking.\nForage: 50% to dig up\na Cave Shroom on attack.',
  });
}

export function createTamedRat() {
  return new Card({
    id: 'tamed_rat',
    name: 'Rat Taming',
    description: 'Summon Rats that can Forage.',
    shortDesc: 'Summon\nForaging Rats',
    subtype: 'ability',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_tamed_rat', 1, TargetType.SUMMON)],
    characterClass: ['ranger'],
    tier: 1,
    rarity: 'uncommon',
    // Both possible summons render in the hover side-preview
    // (50/50: 1-3 Tamed Rats vs 1 Dire Rat).
    previewCreatures: [createTamedRatCreature(), createDireRatCreature()],
    // +1 max Tamed Rat per offset (tamed branch 1-3 → 1-4 → 1-5…),
    // +0.5 max Dire Rats per offset (dire branch 1 → 1 → 1-2 → 1-2
    // → 1-3…). Stats scale via CREATURE_TIER_OFFSET (+1/+1 Tamed,
    // +2/+2 Dire). Runtime reads playerTierOffset directly for
    // both branches; this annotation marks the card as scalable.
    gamePlusOffset: { tamed_rat_summon: 1 },
  });
}

// ============================================================
// Tier 2 Ability Cards (offered at the Tharnag arrival level-up
// and the Cathedral Shrine prayer). Mirrors PY cards_basic.py.
// ============================================================

// --- Paladin Tier 2 ---
export function createConsecration() {
  return new Card({
    id: 'consecration', name: 'Consecration',
    description: 'Deal 8 split across ALL.\nHeroism: +2.',
    shortDesc: '8 split ALL\nHeroism: +2', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // damage_split_all — eff.value is the TOTAL pool, divided by the
    // number of alive non-invulnerable enemies and rounded UP per
    // target. 1 enemy = 8, 2 = 4 each, 3 = 3 each, 4 = 2 each.
    // heroismDamageMult 2 — each Heroism adds +2 to the pool, not +1.
    effects: [new CardEffect('damage_split_all', 8, TargetType.ALL_ENEMIES)],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
    heroismDamageMult: 2,
    gamePlusOffset: { damage_split_all: 2 },
  });
}

// ============================================================
// Paladin tier 2 / tier 3 — the aura-and-judgment line. The class thesis is
// Heroism-from-healing (Overheal -> Heroism), and these extend it outward: the
// auras give the whole party something while they sit in hand, and Hammer of
// Wrath is the bulk payoff that the Heroism generators never had.
//
// Note on the in-hand auras: the passive is a live scan of the player's hand
// (getDamageModifier / the damage-absorb paths in main.js), NOT an effect on
// the card. That's the same pattern Boarhide Bracers, Snow Paws, Miner's Helm
// and Piwafwi use, and it's what gives the cards their cost — you can't spend
// the card without giving up the aura.
// ============================================================

// Aura of Might — Paladin Tier 2 (7). Replaces the old Shock-flavored Hammer of
// Wrath in the tier-2 pool (that card is retired to legacy; the NAME moves to
// the tier-3 judgment below). Fixes two things at once: the tier-2 pool was
// three attacks and one utility, and the class had no party support at all.
//
// While held: +1 damage for you AND every ally, on every swing — which also
// pumps POWERS, so Cleave (two hits) gets +2 a turn out of it on its own.
// Spend it and the aura ends, but everyone banks Heroism instead. Heroism
// persists between turns, so cashing it out as you end your turn front-loads
// the next one — and that's the setup for Hammer of Wrath, which harvests the
// whole party's Heroism at triple value.
export function createAuraOfMight() {
  return new Card({
    id: 'aura_of_might', name: 'Aura of Might',
    description: 'In Hand: You and your allies\ndeal +1 Damage.\nOn Recharge: You and allies\ngain Heroism.',
    shortDesc: 'Hand: +1 Dmg\nyou + allies\nR: Team Heroism',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('on_recharge_team_heroism', 1, TargetType.SELF),
    ],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { on_recharge_team_heroism: 1 },
  });
}

// Holy Steed — Paladin Tier 3. DEFENSE like every other in-hand passive in the
// game (Boarhide Bracers, Snow Paws, Miner's Helm, Piwafwi), which means it is
// spent reactively: you hold it to stay mounted, and the moment you throw it in
// front of a blow you dismount — the horse carries you clear (halve the hit,
// draw) and its parting gift is the heal.
//
// The two halves are mutually exclusive by construction, which is the whole
// card: +5 on your opening swing every turn for as long as you hold it, or one
// big mitigation-plus-heal when you finally need it.
export function createHolySteed() {
  return new Card({
    id: 'holy_steed', name: 'Holy Steed',
    description: 'First Attack: +5.\nDefense: Halve the damage\nagainst you, Draw.\nOn Recharge: Heal 4.\nOverheal: Heroism.',
    shortDesc: 'Hand: +5 First Atk\nDef: Halve dmg, Draw\nR: Heal 4',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('halve_incoming_damage', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_recharge_heal_overheal_heroism', 4, TargetType.SELF),
    ],
    characterClass: ['paladin'], tier: 3, rarity: 'rare',
    gamePlusOffset: { on_recharge_heal_overheal_heroism: 2 },
  });
}

// Devotion Aura — Paladin Tier 3. The defensive twin of Aura of Might: while
// held, every body on your side takes 1 less from every hit. That is flat
// per-swing mitigation, so its value scales with (allies x enemy swings) rather
// than with damage — it blanks 1-attack summons outright and barely registers
// against a boss. Priced high for exactly that reason.
export function createDevotionAura() {
  return new Card({
    id: 'devotion_aura', name: 'Devotion Aura',
    description: 'In Hand: You and your allies\ntake 1 less Damage.\nOn Recharge: You and allies\ngain Shield.',
    shortDesc: 'Hand: -1 Dmg taken\nyou + allies\nR: Team Shield',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('on_recharge_team_shield', 1, TargetType.SELF),
    ],
    characterClass: ['paladin'], tier: 3, rarity: 'rare',
    gamePlusOffset: { on_recharge_team_shield: 1 },
  });
}

// Holy Shield — Paladin Tier 3 armor. 5 Shield (10) plus a heal that can never
// be wasted: whatever can't restore a card converts 1:1 into a single damage
// PACKET at a random enemy. One packet, not N pings — an armored target eats a
// flat reduction per hit, so four 1s would land for nothing where one 4 gets
// through. Random target keeps a free 5-damage burst from being aimed.
//
// Third output for the paladin's Overheal engine: Heroic Heal and Holy Sword
// spend the waste on Heroism, this one spends it on judgment.
export function createHolyShield() {
  return new Card({
    id: 'holy_shield', name: 'Holy Shield',
    description: 'Gain 5 Shields. Heal 5.\nOverheal: Deal 1 Damage.',
    shortDesc: '5 Shields, Heal 5\nOverheal: Damage',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 5, TargetType.SELF),
      new CardEffect('heal_overheal_damage', 5, TargetType.SELF),
    ],
    characterClass: ['paladin'], tier: 3, rarity: 'rare',
    gamePlusOffset: { gain_shield: 1, heal_overheal_damage: 1 },
  });
}

// Hammer of Wrath — Paladin Tier 3 (13) + 12 for the second card = 25. The
// bulk Heroism payoff the class never had: Heroism is normally consumed by
// whatever you swing next at 1 damage a point, so banking a lot of it was worth
// no more per point than banking a little. This spends the WHOLE party's stock
// at 3x.
//
// Consequence worth knowing: it makes turn ORDER matter. Attack with anything
// first — yours or an ally's — and that Heroism is already gone at 1x. The
// correct line is always Hammer first.
//
// New id (the old tier-2 Shock version keeps `hammer_of_wrath` and is retired
// to legacy so existing saves still deserialize); the art file is shared.
export function createHammerOfWrathT3() {
  return new Card({
    id: 'hammer_of_wrath_t3', name: 'Hammer of Wrath',
    description: 'Recharge a Card -> Deal 10.\nUse up Heroism on you and allies.\n+3 Damage per Heroism used.',
    shortDesc: 'R-Card->10 Dmg\n+3 per Heroism\nused (team)',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      // ONE effect, not damage + a harvest: the plain `damage` handler would
      // add and zero the player's Heroism at 1x before any harvest could run,
      // silently giving the WORSE conversion. maxTargets carries the per-point
      // multiplier (3).
      new CardEffect('hammer_of_wrath_strike', 10, TargetType.SINGLE_ENEMY, 3),
    ],
    characterClass: ['paladin'], tier: 3, rarity: 'rare',
    gamePlusOffset: { hammer_of_wrath_strike: 3 },
  });
}

export function createHammerOfWrath() {
  return new Card({
    id: 'hammer_of_wrath', name: 'Hammer of Wrath',
    description: 'Deal Shock and 4 Damage.',
    shortDesc: 'Shock + 4 Dmg', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // apply_shock runs first so the damage step reads the freshly
    // stamped Shock stack via getIncomingDamageModifier — 4 base on
    // a clean target lands as 5 (Shock adds +1 incoming).
    effects: [
      new CardEffect('apply_shock', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 1 },
  });
}

export function createHolySword() {
  return new Card({
    id: 'holy_sword', name: 'Holy Sword',
    description: 'Recharge a Card -> Deal 11, Heal 4.\nOverheal: Heroism.',
    shortDesc: 'R-Card->11 Dmg\nHeal 4, Overheal', subtype: 'martial',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 11, TargetType.SINGLE_ENEMY),
      new CardEffect('heal_overheal_heroism', 4, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 3, heal_overheal_heroism: 1 },
  });
}

export function createRevivify() {
  return new Card({
    id: 'revivify', name: 'Revivify',
    description: 'Revive 1 dead ally,\nHeal 2 per ally.',
    shortDesc: 'Revive 1 ally\nHeal 2 per ally', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [new CardEffect('revivify', 3, TargetType.SELF)],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
    // +0.5 per offset to both picks AND pool: offset 0 = 1/3, offset
    // 2 = 2/4, offset 4 = 3/5, etc. eff.value bumps the pool size; the
    // picks count is computed from playerTierOffset in the handler so
    // a single saved card replays correctly at any offset.
    gamePlusOffset: { revivify: 0.5 },
  });
}

// --- Ranger Tier 2 ---
function createMishaCreature() {
  return new Creature({ name: 'Misha', attack: 4, maxHp: 4, sentinel: true, description: 'Sentinel' });
}
function createHufferCreature() {
  return new Creature({ name: 'Huffer', attack: 4, maxHp: 2, haste: true, description: 'Haste' });
}

export function createHuntersMark() {
  return new Card({
    id: 'hunters_mark', name: "Hunter's Mark",
    description: 'Add Mark(2) to an enemy.\nOn Attack: Consume a Mark\nto deal 2X damage.',
    shortDesc: 'Mark(2)\nOn atk: 2X dmg', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_mark', 2, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    noTierOffset: true,
  });
}

// Marking Shot — Ranger tier-2 pick that REPLACES Hunter's Mark in the player
// ability choice (the old Hunter's Mark card stays put for the Gnoll Hunter
// deck). A bow shot for 4 that consumes/doubles on an EXISTING Mark like any
// attack, then leaves a fresh Mark: the apply_mark resolves AFTER the hit, so
// the Mark it adds isn't spent by this same shot — later swings consume it.
// Reuses the Hunter's Mark art.
export function createMarkingShot() {
  return new Card({
    id: 'marking_shot', name: 'Marking Shot',
    description: 'Recharge a Card ->\nDeal 4 + Mark, Draw.',
    shortDesc: 'R Card->4 + Mark\nDraw',
    subtype: 'ability',
    // It's an arrow, so it feeds a Quiver — and the card cost is what routes it
    // through the recharge picker where a quiver can be spent on it.
    subtype2: 'ranged',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // Deliberately the exact shape of Hunter's Recurve Bow one rarity rung
    // down: same text, 4 damage instead of 8. Mark lands AFTER the damage, so
    // it's the NEXT shot that cashes it, not this one.
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_mark', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 1 },
  });
}

// Bestial Wrath — Ranger Tier 3 (13). The pack card. The buff lands FIRST, so
// the swing counts the boosted Attack — worth about +1 per beast, which is why
// the order is spelled out on the card.
//
// Scales hard with board width: ~7 points on one beast, ~15 on three, ~20 on
// four. A genuine build-around, and a dead card for a Ranger who took neither
// Rat Taming nor Animal Companion — the pool's only two beast sources.
// Everything else (Beastmaster Horn, Jar of Piranhas, Pet Spider) is loot.
// Rain of Arrows — Ranger Tier 2 (7) + 6 for the second card = 13. Five arrows,
// each rolling 1-4 at its own randomly chosen enemy: 12.5 expected, right on
// budget.
//
// Replaces Explosive Shot, which was the same "Recharge a Card -> multi-hit"
// shape but strictly narrower. Losing its Draw is deliberate — the Ranger has
// the deepest card engine in the game and the doc flags draw as the abuse axis.
//
// Rider semantics follow Fan of Blades: Heroism, Rage, Ignite and the Vial
// charges are snapshotted ONCE and paid out on every arrow, so a single charge
// covers the whole volley. An arrow whose target died to an earlier arrow
// re-rolls onto something still standing rather than being lost. Note the flip side of five separate hits — armor
// absorbs per hit, so a volley fares far worse into plate than one big swing of
// the same total.
export function createRainOfArrows() {
  return new Card({
    id: 'rain_of_arrows', name: 'Rain of Arrows',
    // Five arrows — it reads as a bow more than Aimed Shot does, so it feeds a
    // Quiver too. Note the buffs a quiver grants are snapshotted once and
    // re-applied to EVERY arrow, which makes this the biggest quiver payoff in
    // the game; see the barrage note in resolveBarrageShot.
    subtype2: 'ranged',
    description: 'Recharge a Card ->\nDeal 1-4 Randomly 5 times.',
    shortDesc: 'R-Card->1-4 Dmg\nx5, random',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      // value packs the roll as min*10 + max (14 = "1 to 4"), matching
      // damage_range; maxTargets is the arrow count.
      new CardEffect('rain_of_arrows', 14, TargetType.ALL_ENEMIES, 5),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { rain_of_arrows: 1 },
  });
}

// Track — Ranger Tier 1 (4). Scry 3 (~3, since Shield of Faith prices a plain
// Draw at ~2 and Scry adds selection) plus a 50% Goodberry (~0.75). Lands at
// ~3.75.
//
// Replaces Goodberries, and it's a net TIGHTENING of the class's card flow even
// though it scrys: the old card ran create_goodberries: 3, dropping up to three
// tokens into your hand at once. Scry 3 draws one and recharges two. The berries
// survive — the Tamed Rat still forages them, and this rolls for one — they just
// stop being manufactured three at a time by the deepest card engine in the game.
export function createTrack() {
  return new Card({
    id: 'track', name: 'Track',
    description: 'Scry 3.\nMight forage some goodberries.',
    shortDesc: 'Scry 3\n50%: Goodberry',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('scry_pick', 3, TargetType.SELF),
      new CardEffect('forage_goodberry_chance', 50, TargetType.SELF),
    ],
    characterClass: ['ranger'], tier: 1, rarity: 'uncommon',
    // Side preview, same as the retired Goodberries card had — the berry it
    // can forage is the only thing about this card you can't read off the text.
    previewCard: createGoodberry(),
    gamePlusOffset: { scry_pick: 1 },
  });
}

// === Ranger Traps ===
// Trap is a Tier 1 ability that arms a hidden trap: an untargetable, unkillable
// totem that costs nothing but a field slot until something swings at YOU. It
// fires once, reveals itself as a showcased card, and vanishes.
//
// The five outcomes are deliberately kept in a tight 6-9 point band. Rolling a
// random trap only reads as variety rather than a slot machine if no result is
// a dud — that tightness is what earns the card its randomness discount.
//
// The five token cards below exist for display only: they are what the side
// previews show on the Trap card, and what gets showcased centre-screen when
// one springs. They're never in a deck.
export const TRAP_KINDS = ['snake', 'explosive', 'bear', 'ice', 'spike'];

export function createSnakeTrapToken() {
  return new Card({
    id: 'snake_trap', name: 'Snake Trap',
    description: 'Summon 3 Snakes (1/1).',
    shortDesc: '3x 1/1 Snake',
    subtype: 'ability', cardType: CardType.CREATURE, costType: CostType.FREE,
    effects: [], isToken: true, tier: 1, rarity: 'uncommon',
  });
}

export function createExplosiveTrapToken() {
  return new Card({
    id: 'explosive_trap', name: 'Explosive Trap',
    description: 'Deal 1 and Fire to All.',
    shortDesc: '1 Dmg + Fire\nto All',
    subtype: 'ability', cardType: CardType.ATTACK, costType: CostType.FREE,
    effects: [], isToken: true, tier: 1, rarity: 'uncommon',
  });
}

export function createBearTrapToken() {
  return new Card({
    id: 'bear_trap', name: 'Bear Trap',
    description: 'Summon a 2/2 Sentinel Bear.\nThe attack hits the Bear instead.',
    shortDesc: '2/2 Sentinel Bear\nRedirects the hit',
    subtype: 'ability', cardType: CardType.CREATURE, costType: CostType.FREE,
    effects: [], isToken: true, tier: 1, rarity: 'uncommon',
  });
}

export function createIceTrapToken() {
  return new Card({
    id: 'ice_trap', name: 'Ice Trap',
    description: 'Deal 5 Ice to the attacker.',
    shortDesc: '5 Ice to\nthe attacker',
    subtype: 'ability', cardType: CardType.ATTACK, costType: CostType.FREE,
    effects: [], isToken: true, tier: 1, rarity: 'uncommon',
  });
}

export function createSpikeTrapToken() {
  return new Card({
    id: 'spike_trap', name: 'Spike Trap',
    description: 'Deal 5 True Damage\nto the attacker.',
    shortDesc: '5 True Damage\nto the attacker',
    subtype: 'ability', cardType: CardType.ATTACK, costType: CostType.FREE,
    effects: [], isToken: true, tier: 1, rarity: 'uncommon',
  });
}

export function createTrapTokenFor(kind) {
  switch (kind) {
    case 'snake': return createSnakeTrapToken();
    case 'explosive': return createExplosiveTrapToken();
    case 'bear': return createBearTrapToken();
    case 'ice': return createIceTrapToken();
    default: return createSpikeTrapToken();
  }
}

// The bodies two of the traps leave behind. Both are Beasts (Bestial Wrath
// counts them) and both borrow their trap card's art.
export function createTrapSnakeCreature() {
  return new Creature({
    name: 'Snake', attack: 1, maxHp: 1,
    artId: 'snake_trap', traits: ['Beast'],
  });
}

export function createTrapBearCreature() {
  return new Creature({
    name: 'Bear', attack: 2, maxHp: 2, sentinel: true,
    artId: 'bear_trap', traits: ['Beast'],
    description: 'Sentinel.',
  });
}

// The armed trap itself — a totem, exactly like the Arcane Vortex: nothing can
// target it, nothing can damage it, it never acts. All it costs is a field
// slot, and it keeps its kind secret until it springs.
export function createArmedTrapCreature(kind) {
  const c = new Creature({
    name: 'Armed Trap', attack: 0, maxHp: 1,
    artId: 'trap', description: 'Springs when you are attacked.',
  });
  c._invulnerable = true;
  c._untargetableAlly = true;
  c._cantAttack = true;
  c._trapKind = kind;
  // No stat line to grow, so NG+ has nothing to scale — say so explicitly
  // rather than letting the codex paint a "needs offset rules" badge on it.
  c.noTierOffset = true;
  return c;
}

// Trap — Ranger Tier 1 (4), budgeted at ~6 because the payoff is both random
// and delayed. Replaces Heroic Tumble.
export function createTrapCard() {
  return new Card({
    id: 'trap', name: 'Trap',
    description: 'Set a random Trap.\nIt springs when you are attacked.',
    shortDesc: 'Set a random Trap',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_armed_trap', 1, TargetType.SUMMON)],
    characterClass: ['ranger'], tier: 1, rarity: 'uncommon',
    // All five outcomes shown on the card — the roll is random, but which
    // results are possible shouldn't be a mystery.
    previewCards: [
      createSnakeTrapToken(), createExplosiveTrapToken(), createBearTrapToken(),
      createIceTrapToken(), createSpikeTrapToken(),
    ],
    noTierOffset: true,
  });
}

export function createBestialWrath() {
  return new Card({
    id: 'bestial_wrath', name: 'Bestial Wrath',
    description: 'Your Beasts gain +1/+1.\nDeal damage equal to the total\nAttack of your Beasts.',
    shortDesc: 'Beasts +1/+1\nDeal = their Attack',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('bestial_wrath', 1, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['ranger'], tier: 3, rarity: 'rare',
    noTierOffset: true,
  });
}

export function createAnimalCompanion() {
  return new Card({
    id: 'animal_companion', name: 'Animal Companion',
    // Stats omitted from the description so the card text stays
    // accurate at any offset — the actual numbers live on the
    // previewCreatures (which rescale via CREATURE_TIER_OFFSET) and
    // on the summoned creature itself.
    //
    // Reworked from summon → "call". The card is companion-style: the
    // called creature is tied back to this card via sourceCard, so
    // when it dies the card returns to discard. Smart cast logic in
    // main.js handleHandClick filters the modal: if one of the two
    // is already alive, the modal auto-picks the missing one; if both
    // are alive the cast is a no-op and the card just recharges.
    description: 'Call Misha or Huffer.',
    shortDesc: 'Call Misha or Huffer', subtype: 'ability',
    cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [],
    modes: [
      new CardMode('Call Misha (Sentinel)',
        [new CardEffect('summon_misha', 1, TargetType.SUMMON)]),
      new CardMode('Call Huffer (Haste)',
        [new CardEffect('summon_huffer', 1, TargetType.SUMMON)]),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    previewCreatures: [createMishaCreature(), createHufferCreature()],
    // Empty opt-in: scaling lives entirely on the summoned creatures
    // (CREATURE_TIER_OFFSET['Misha'] = +2/+2, ['Huffer'] = +2/+1).
    // The card itself has no per-effect bump.
    gamePlusOffset: {},
  });
}

// Elemental Weapon — replaces Piercing Shot in the Ranger tier-2 pool.
// Discard cost, modal: imbue your future attacks with Fire OR Ice. The
// buff stacks (each cast adds 1 to its chosen element); casting the
// opposite element cancels stacks 1-to-1 the way Fire / Ice already do
// in the status engine.
export function createElementalWeapon() {
  // Per-mode artId — the modal picker uses this to swap the choice
  // card's art (Fire mode shows ElementalWeaponFire, Ice shows
  // ElementalWeaponIce) so the player sees which element they're
  // picking at a glance. Same image is reused on the in-combat buff
  // (imageId 'buff_elemental_weapon_<element>' in the resolver).
  //
  // Both modes now carry a swing as well as the imbue. The buff alone was a
  // pure setup card — it did nothing the turn you spent it, which is what made
  // it the weakest pick in the Ranger tier-2 pool. Budget is T2 uncommon (7):
  // the Fire rider is worth ~4 and the Ice rider ~3 (Ice is mitigation, not
  // damage), so the swing sizes are set to bring each mode to the same place.
  //
  // The grant is ordered BEFORE the damage on purpose: this card's own hit
  // rides its own rider, so Fire mode reads "Deal 2 + 1 Fire" and Ice mode
  // "Deal 3 + 1 Ice" on the cast itself.
  const fireMode = new CardMode('Attacks add 1 Fire, Deal 2', [
    new CardEffect('grant_elemental_weapon_fire', 1, TargetType.SELF),
    new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
  ]);
  fireMode.artId = 'buff_elemental_weapon_fire';
  const iceMode = new CardMode('Attacks add 1 Ice, Deal 3', [
    new CardEffect('grant_elemental_weapon_ice', 1, TargetType.SELF),
    new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
  ]);
  iceMode.artId = 'buff_elemental_weapon_ice';
  return new Card({
    id: 'elemental_weapon', name: 'Elemental Weapon',
    description: 'Choose:\nAttacks add Fire, Deal 2,\nOR attacks add Ice, Deal 3.',
    shortDesc: '+Fire, 2 Dmg\nOR +Ice, 3 Dmg',
    subtype: 'ability',
    // ATTACK now that both modes swing — same shape as Wrath, the other modal
    // attack. The mode picker resolves first, then targeting.
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [],
    modes: [fireMode, iceMode],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { modes: [{ damage: 2 }, { damage: 2 }] },
  });
}

export function createPiercingShot() {
  return new Card({
    id: 'piercing_shot', name: 'Piercing Shot',
    description: 'Recharge -> Deal 4 Unpreventable\nDamage with Overwhelm.',
    shortDesc: 'R->4 Unpreventable\n+Overwhelm', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('unpreventable_damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('player_overwhelm', 0, TargetType.SELF),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { unpreventable_damage: 2 },
  });
}

export function createExplosiveShot() {
  return new Card({
    id: 'explosive_shot', name: 'Explosive Shot',
    description: 'Recharge a Card -> Deal 4 Damage,\n1 Fire to ALL enemies, Draw.',
    shortDesc: 'R-Card->4 Dmg\n1 Fire ALL, Draw', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 3, apply_fire_all: 0.5 },
  });
}

// --- Wizard Tier 2 ---
export function createBurningHands() {
  return new Card({
    id: 'burning_hands', name: 'Burning Hands',
    description: 'Deal 2 Fire to all enemies.',
    shortDesc: '2 Fire ALL', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_fire_all', 2, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { apply_fire_all: 1 },
  });
}

export function createIceNova() {
  return new Card({
    id: 'ice_nova', name: 'Ice Nova',
    // Kept in lockstep with Elemental Nova's ice mode — same name, same card,
    // and drifting stat lines between two copies of "the same" spell is exactly
    // the bug the guardian Regrowth hit.
    description: 'Deal 2 Ice to ALL enemies.',
    shortDesc: '1 Dmg+Ice ALL', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice_all', 2, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { apply_ice_all: 1 },
  });
}

// Ice Shatter — chapter 8 frost-shaman finisher. Strips all Ice
// stacks off every enemy and converts each stack into 1 damage to
// that enemy, so a frozen target eats the entire shelf as a single
// burst. Used by the awakened Gnikan in phase 2; can also drop as
// loot in future content.
export function createIceShatter() {
  return new Card({
    id: 'ice_shatter', name: 'Ice Shatter',
    description: 'Recharge -> Each enemy loses all Ice and takes damage equal to the Ice lost.',
    shortDesc: 'R->Shatter Ice\n1 dmg per Ice',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('ice_shatter', 0, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['wizard'], tier: 2,
    rarity: 'epic',
    // Damage already scales with the Ice stacks consumed, not tier.
    noTierOffset: true,
  });
}

// Cold Breath — Varimatras's signature card. Monster-only: the dragon
// breathes a freezing gale over the party, stacking 3 Ice on every
// enemy (= player + allies) and then immediately shattering it for
// damage equal to the new total. Priority 50 so the AI fires it first
// the turn it has it in hand. Used by overseer_gnikan_phase_2 when the
// dragon takes over from the dying overseer.
export function createColdBreath() {
  return new Card({
    id: 'cold_breath', name: 'Cold Breath',
    description: 'Recharge -> Apply 3 Ice to ALL enemies, then each enemy takes damage equal to their Ice.',
    shortDesc: 'R->3 Ice ALL\nDmg = Ice',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice_all', 3, TargetType.ALL_ENEMIES),
      new CardEffect('damage_per_ice_all', 0, TargetType.ALL_ENEMIES),
    ],
    tier: 2,
    rarity: 'epic',
    priority: 50,
    gamePlusOffset: { apply_ice_all: 2 },
  });
}

// Varimatras Bite — heavy single-target chomp. Monster-only.
export function createVarimatrasBite() {
  return new Card({
    id: 'varimatras_bite', name: 'Bite',
    description: 'Recharge -> Deal 6 Damage + Ice.',
    shortDesc: 'R->6 Dmg + Ice',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { damage: 3, apply_ice: 1 },
  });
}

// Varimatras Claw — picks up to 2 random player-side targets and
// hits each for 2 damage. Monster-only.
export function createVarimatrasClaw() {
  return new Card({
    id: 'varimatras_claw', name: 'Claw',
    description: 'Recharge -> Deal 2 Damage to up to 2 targets.',
    shortDesc: 'R->2 Dmg x2',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_random_split', 2, TargetType.ALL_ENEMIES),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { damage_random_split: 2 },
  });
}

// Varimatras Tail Swipe — 1 damage to the entire party. Monster-only.
export function createVarimatrasTail() {
  return new Card({
    id: 'varimatras_tail', name: 'Tail Swipe',
    description: 'Recharge -> Deal 1 Damage to ALL enemies.',
    shortDesc: 'R->1 Dmg ALL',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_all', 1, TargetType.ALL_ENEMIES),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { damage_all: 1 },
  });
}

// Varimatras Wing Buffet — every creature on the field gains 1 Ice.
// Pairs with Ancient White (dragon converts his own Ice tick into
// Shield) so the buffet stacks the party while still building the
// dragon's defense each turn.
export function createVarimatrasWing() {
  return new Card({
    id: 'varimatras_wing', name: 'Wing Buffet',
    description: 'Recharge -> Every creature gains 1 Ice. Draw.',
    shortDesc: 'R->1 Ice all\nDraw',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice_creatures_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { apply_ice_creatures_all: 1 },
  });
}

// Varimatras Scale — the dragon's own armor card. DEFENSE type so
// it auto-fires reactively on the player's swing (mirrors how
// every other armor card the AI plays works), not on the dragon's
// own action turn. enemyAutoPlayDefenses pulls these out of hand
// when an incoming hit would otherwise land.
export function createVarimatrasScale() {
  return new Card({
    id: 'varimatras_scale', name: 'Varimatras Scale',
    description: 'Recharge -> Block 10,\nDouse Fire. Draw.',
    shortDesc: 'R->Block 10\nDouse Fire, Draw',
    subtype: 'armor',
    cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 10, TargetType.SELF),
      // value=99 → strip ALL Fire stacks off the dragon.
      new CardEffect('clear_fire', 99, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { block: 5 },
  });
}

// Elemental Nova — Wizard Tier 2. Burning Hands and Ice Nova folded into one
// modal card, the same move Rallying Shout made for the warrior: two cards that
// were never picked together become one card that asks the class's central
// question at the moment of casting. Frees a tier-2 seat as a bonus.
//
// The two originals are NOT deleted — their creators stay exported and
// registered. Ice Nova is still Overseer Gnikan's board-clear (8 copies in each
// phase of that fight) and both keep their CARD_REGISTRY entries so older saves
// holding them deserialize cleanly. They simply leave the wizard's pick list.
//
// Per-mode artId swaps the choice card's face so the player sees which element
// they're picking, exactly like Elemental Weapon's fire/ice modes.
export function createElementalNova() {
  // Mode labels are bare elements — "Fire" / "Ice" — matching the two choice
  // tokens Elemental Infusion offers. The card's own description already spells
  // out what each one does, so restating it on the choice tiles was noise.
  const fireMode = new CardMode('Fire', [
    new CardEffect('apply_fire_all', 2, TargetType.ALL_ENEMIES),
  ]);
  fireMode.artId = 'burning_hands';
  const iceMode = new CardMode('Ice', [
    new CardEffect('apply_ice_all', 2, TargetType.ALL_ENEMIES),
  ]);
  iceMode.artId = 'ice_nova';
  return new Card({
    id: 'elemental_nova', name: 'Elemental Nova',
    description: 'Choose:\nDeal 2 Fire to All,\nOR Deal 2 Ice to All.',
    shortDesc: '2 Fire to All\nOR 2 Ice to All',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [],
    modes: [fireMode, iceMode],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
    // Per-mode scaling, mirroring the two cards it replaced.
    gamePlusOffset: { modes: [{ apply_fire_all: 1 }, { apply_ice_all: 1 }] },
  });
}

// Shatter Storm — Wizard Tier 3 (13) + 12 for the second card = 25. The payoff
// the Ice lane never had: Ice is mitigation, so a wizard who commits to it
// spends the whole fight making things weaker without making them dead. This
// converts the whole board's accumulated frost into one burst.
//
// "Min +1" is what keeps it honest at both ends: a target with no Ice still
// gets 1, so the card never whiffs (floor: 1 damage + 1 Shield per enemy), but
// the ceiling has to be built over several turns — and enemy Ice drains a stack
// every time they swing, so the board actively burns down your setup.
//
// Shield is deliberately PER ENEMY, not per Ice: Shield prices at 2 points each,
// so scaling it off the total shattered made the card worth ~3x its budget on a
// wide board and won the next two turns as well as this one.
export function createShatterStorm() {
  return new Card({
    id: 'shatter_storm', name: 'Shatter Storm',
    description: 'Recharge a Card ->\nDouble Ice on enemies (min +1),\nthen shatter it for damage.\nGain 1 Shield per enemy.',
    shortDesc: 'R-Card->2x Ice,\nshatter all\n+1 Shield/enemy',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      // value = Shield granted per enemy shattered. The doubling and the
      // min-+1 floor are structural, not tunable from here.
      new CardEffect('shatter_storm', 1, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['wizard'], tier: 3, rarity: 'rare',
    gamePlusOffset: { shatter_storm: 1 },
  });
}

// Arcane Explosion — Wizard Tier 2 (7). Deal 1 to All (3 with the ALL
// multiplier) plus an On Recharge that repeats it (3) = 6.
//
// The On Recharge is the point of the card, not padding. It's a RECHARGE-cost
// card, so the rider fires on every cast — but it ALSO fires when the card is
// spent as another card's recharge cost, and the wizard pays those constantly:
// 5 of its 12 starter cards demand fodder (3x Short Staff, Ice Bolt, Magic
// Missiles), plus Shatter Storm and Arcane Beam's optional recharges. So this
// is never a dead card — draw it and the board eats 1 whether you cast it or
// feed it to something else.
export function createArcaneExplosion() {
  return new Card({
    id: 'arcane_explosion', name: 'Arcane Explosion',
    description: 'Arcane: Recharge -> Deal 1 to All.\nRecharge up to 3 extra cards\nfor +1 Damage each.\nOn Recharge: Deal 1 to All.',
    shortDesc: '1-4 Dmg to All\nR: 1 Dmg to All',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('optional_recharge_damage', 1, TargetType.SELF),
      new CardEffect('on_recharge_damage_all', 1, TargetType.SELF),
    ],
    arcaneHits: 2, // one Vortex proc per hit
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage_all: 1, optional_recharge_damage: 1 },
  });
}

// The wizard's two elementals. Both convert their WHOLE swing into their
// element rather than dealing damage — attack 0 with a fire/ice rider, the same
// shape the Pet Spider uses for poison. That's why the Ice one prices out at
// roughly Misha/Huffer despite a 5 HP Sentinel body: it can't kill anything.
//
// Fire Body / Ice Body carry the immunity + shrink rules (see the keyword).
export function createWizardFireElemental() {
  return new Creature({
    name: 'Fire Elemental',
    // 0 attack + fireAttack 3: the swing IS the fire. Haste is worth more here
    // than on a damage body — Fire nets +2 stacks a turn against its 1/turn
    // decay, so landing the first application a turn early compounds.
    attack: 0, maxHp: 2, haste: true,
    fireAttack: 3, fireImmune: true,
    riposte: true, riposteAmount: 1, riposteStatus: 'fire',
    artId: 'wizard_fire_elemental',
    description: 'Haste. Fire Body.\nDeal 3 Fire.\nRiposte: 1 Fire.',
  });
}

export function createWizardIceElemental() {
  return new Creature({
    name: 'Ice Elemental',
    attack: 0, maxHp: 5, sentinel: true,
    iceAttack: 2, iceImmune: true,
    riposte: true, riposteAmount: 1, riposteStatus: 'ice',
    artId: 'wizard_ice_elemental',
    description: 'Sentinel. Ice Body.\nDeal 2 Ice.\nRiposte: 1 Ice.',
  });
}

// Summon Elemental — Wizard Tier 2. The class's first summon. Modal like
// Elemental Infusion and Elemental Nova, and the two options are a real choice
// rather than a better/worse pair: Fire is 3 Fire a swing on a body that dies
// to a stiff breeze, Ice is a 5 HP Sentinel wall that deals no damage at all
// but stacks the frost Shatter Storm cashes in.
//
// The Draw is why this ISN'T priced with the second-card bonus (a card that
// replaces itself pays no premium) — it lands at Animal Companion's budget,
// which is the right benchmark: same tier, same "summon one of two" shape.
export function createSummonElemental() {
  // The Draw lives in EACH MODE, not in the card's base effects: a modal card
  // resolves only its chosen mode's effect list, so a draw parked on the card
  // itself is silently dropped. Wrath's "Deal 1 Damage, Draw" mode does the
  // same thing for the same reason.
  const fireMode = new CardMode('Fire', [
    new CardEffect('summon_fire_elemental', 1, TargetType.SUMMON),
    new CardEffect('draw', 1, TargetType.SELF),
  ]);
  fireMode.artId = 'wizard_fire_elemental';
  const iceMode = new CardMode('Ice', [
    new CardEffect('summon_ice_elemental', 1, TargetType.SUMMON),
    new CardEffect('draw', 1, TargetType.SELF),
  ]);
  iceMode.artId = 'wizard_ice_elemental';
  return new Card({
    id: 'summon_elemental', name: 'Summon Elemental',
    description: 'Recharge a Card ->\nSummon an Elemental, Draw.',
    shortDesc: 'R-Card->Fire or\nIce Elemental, Draw',
    subtype: 'ability',
    cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    // recharge_extra stays on the card — getCardRechargeExtra reads the CARD's
    // effects to price the cost before a mode is ever chosen.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    modes: [fireMode, iceMode],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
    previewCreatures: [createWizardFireElemental(), createWizardIceElemental()],
    noTierOffset: true,
  });
}

// Fireball — Wizard Tier 3 (13) + 12 for the second card = 25. The nuke the
// class conspicuously lacked. Priced off Burning Hands, the game's own Fire-to-
// All anchor (2 Fire to All for a 7 budget): 4 Fire to All is ~14, plus 4
// damage to All at 12, landing on 26 against 25.
export function createFireball() {
  return new Card({
    id: 'fireball', name: 'Fireball',
    description: 'Recharge a Card ->\nDeal 4 and 4 Fire to All.',
    shortDesc: 'R-Card->4 Dmg\n+ 4 Fire to All',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('damage_all', 4, TargetType.ALL_ENEMIES),
      new CardEffect('apply_fire_all', 4, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['wizard'], tier: 3, rarity: 'rare',
    gamePlusOffset: { damage_all: 2, apply_fire_all: 1 },
  });
}

// === Arcane Vortex ===
// The Vortex is a TOTEM, not a fighter: it never attacks, never takes damage,
// and enemies ignore it entirely. The only thing it costs you is field space,
// which is why it grows — 5+ charges turns it into a 2x2 that eats a third of
// your line. Charges live on the creature, so they reset with it every fight.
//
// Three stages purely for readability: you can tell at a glance how hard the
// engine is running without counting anything.
export const ARCANE_VORTEX_STAGES = [
  { min: 1, name: 'Small Arcane Vortex',  artId: 'small_arcane_vortex',  w: 1, h: 1 },
  { min: 3, name: 'Medium Arcane Vortex', artId: 'medium_arcane_vortex', w: 1, h: 1 },
  { min: 5, name: 'Large Arcane Vortex',  artId: 'large_arcane_vortex',  w: 2, h: 2 },
];

export function arcaneVortexStageFor(charges) {
  let stage = ARCANE_VORTEX_STAGES[0];
  for (const s of ARCANE_VORTEX_STAGES) if (charges >= s.min) stage = s;
  return stage;
}

// Charge count is the whole stat line, so it goes in the description rather
// than the attack box — the body has 0 attack and can't be hit.
export function arcaneVortexDescription(charges) {
  const lo = charges;
  const hi = charges * 2;
  return `Arcane: Deal ${lo}-${hi}.\nCharges: ${charges}.`;
}

export function createArcaneVortexCreature(charges = 1) {
  const stage = arcaneVortexStageFor(charges);
  const c = new Creature({
    name: stage.name,
    attack: 0, maxHp: 1,
    slotW: stage.w, slotH: stage.h,
    artId: stage.artId,
    description: arcaneVortexDescription(charges),
  });
  // Totem flags. _invulnerable keeps it off every "pick a target" list that
  // already respects it; _untargetableAlly is the player-side equivalent (no
  // enemy-targeting path filtered _invulnerable on our side of the field), and
  // _cantAttack keeps it out of the swing queue and the ally-attack selector.
  c._invulnerable = true;
  c._untargetableAlly = true;
  c._cantAttack = true;
  c._vortexCharges = charges;
  return c;
}

// Arcane Vortex — Wizard Tier 3 (13). Deal 5 (5) plus a permanent-for-the-fight
// engine: every point of Arcane damage you deal fires the Vortex for 1-2 per
// charge at a random enemy.
//
// One charge is worth roughly a Rage stack (5) — the per-trigger number is
// bigger than Rage's flat +1, but it only fires on ARCANE cards rather than
// every attack, so it evens out. 5 + 5 = 10 against 13, and the card is
// deliberately left under budget because the payoff is back-loaded: the turn
// you cast it you have spent a tier-3 slot on 5 damage and a body that can't
// fight.
//
// A second cast never makes a second Vortex — it adds a charge to the one
// standing, and the ORDER matters: the charge lands first, so that cast's own
// Deal 5 already fires at the new, higher rate.
export function createArcaneVortexCard() {
  return new Card({
    id: 'arcane_vortex', name: 'Arcane Vortex',
    description: 'Arcane: Summon an Arcane Vortex.\nDeal 5 Damage.',
    shortDesc: 'Summon Vortex\n5 Arcane Dmg',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      // Charge/summon FIRST so the damage below already benefits from it.
      new CardEffect('summon_arcane_vortex', 1, TargetType.SUMMON),
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['wizard'], tier: 3, rarity: 'rare',
    arcaneHits: 1,
    previewCreature: createArcaneVortexCreature(1),
    gamePlusOffset: { damage: 2 },
  });
}

// Polymorph — Wizard Tier 3. Two spells in one card, sharing the engine's only
// transform-with-memory: the target is REPLACED for a while and remembers what
// it was, and when the form breaks any leftover damage carries through to the
// creature underneath.
//
// Sheep (~8-9 of a 13 budget): an enemy summon spends 3 of its actions as a 1/1
// that can still swing — it just swings for 1 and has forgotten every ability.
// Same restrictions as Paralyze (1x1 creatures only), so it does nothing to a
// lone boss.
//
// Giant Ape (~16): one of YOUR creatures becomes a 6/10 2x2 that roars Weak
// onto the whole enemy line. multiAttack was cut — 6 damage on two targets was
// the single biggest number on the card, and a second target is only worth
// about 1.5x anyway since it can't be the same body twice.
//
// Both halves have a zero floor (no enemy summons / no allies), but in opposite
// situations, so the card is almost always live in ONE mode — which is why
// neither half gets the dead-card discount.
export function createPolymorph() {
  const sheepMode = new CardMode('Sheep', [
    new CardEffect('polymorph_sheep', 3, TargetType.SINGLE_ENEMY),
  ]);
  sheepMode.artId = 'sheep';
  const apeMode = new CardMode('Giant Ape', [
    new CardEffect('polymorph_ape', 6, TargetType.SINGLE_ALLY),
  ]);
  apeMode.artId = 'giant_ape';
  return new Card({
    id: 'polymorph', name: 'Polymorph',
    description: 'Choose:\nSheep an enemy summon for 3,\nOR an ally becomes a Giant Ape.',
    shortDesc: 'Sheep a summon\nOR Giant Ape',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [],
    modes: [sheepMode, apeMode],
    characterClass: ['wizard'], tier: 3, rarity: 'rare',
    noTierOffset: true,
  });
}

export function createIceBlock() {
  return new Card({
    id: 'ice_block', name: 'Ice Block',
    description: 'Gain 4 Ice and 8 Shield.',
    shortDesc: '4 Ice, 8 Shield', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice_self', 4, TargetType.SELF),
      new CardEffect('gain_shield', 8, TargetType.SELF),
    ],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { apply_ice_self: 2, gain_shield: 4 },
  });
}

export function createArcaneBeam() {
  return new Card({
    id: 'arcane_beam', name: 'Arcane Beam',
    description: 'Arcane: Deal 6 Damage.\nRecharge up to 3 extra cards\nfor +3 damage each.',
    shortDesc: '6-15 Dmg', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
      new CardEffect('optional_recharge_damage', 3, TargetType.SELF),
    ],
    arcaneHits: 1, // one Vortex proc per hit
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 2, optional_recharge_damage: 1 },
  });
}

// --- Rogue Tier 2 ---
export function createFanOfBlades() {
  return new Card({
    id: 'fan_of_blades', name: 'Fan of Blades',
    description: 'Deal 1 Damage to ALL enemies, twice.',
    shortDesc: '1 Dmg ALL ×2', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // damage_all_twice swings the AoE twice in one cast. Riders
    // (Vial of Poison, Slime Jar, Sahuagin Eye, Obsidian Core,
    // Ignite, Elemental Weapon, Feral Wrath) are snapshotted once
    // and re-applied on each swing, so a single rider consumption
    // lands on both passes. Counts as 2 attacks for Sneak Attack.
    effects: [
      new CardEffect('damage_all_twice', 1, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['rogue'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage_all_twice: 1 },
  });
}

// Blade Flurry — Rogue Tier 2, alongside Fan of Blades. A 5-shot barrage
// (1 dmg each): click once, aim each strike at any target (same enemy to
// focus, or spread). Every shot carries all riders (Heroism, poison buffs,
// Ignite, etc.) via resolveBarrageShot. Where Fan of Blades is a flat
// hit-everything sweep, this one lets the player choose the spread.
export function createBladeFlurry() {
  return new Card({
    id: 'blade_flurry', name: 'Blade Flurry',
    description: 'Deal 1 Damage X 5.',
    shortDesc: '1 Dmg X5', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [new CardEffect('blade_flurry_barrage', 1, TargetType.SINGLE_ENEMY)],
    characterClass: ['rogue'], tier: 2, rarity: 'uncommon',
    // +1 damage per strike per offset.
    gamePlusOffset: { blade_flurry_barrage: 1 },
  });
}

export function createBackstab() {
  return new Card({
    id: 'backstab', name: 'Backstab',
    description: 'Deal 6 Damage.\nWas Undamaged: Draw.',
    shortDesc: '6 Dmg\nUndamaged->Draw', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // draw_if_target_undamaged runs BEFORE damage so it can read the
    // target's pre-hit state and grant the draw only when the target
    // started the swing at full HP.
    effects: [
      new CardEffect('draw_if_target_undamaged', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['rogue'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 3 },
  });
}

export function createPoisonedDagger() {
  return new Card({
    id: 'poisoned_dagger', name: 'Poisoned Dagger',
    description: 'Deal 1 + Poison\nStays in hand.',
    shortDesc: '1 + Poison\nStays', subtype: 'simple',
    cardType: CardType.ATTACK, costType: CostType.FREE,
    // A single poisoned throw (1 dmg + 1 Poison). Still routed through the
    // barrage flow at one shot so it keeps that path's rider handling
    // (Heroism, poison buffs, Ignite, etc.) and the intrinsic Poison stamp.
    effects: [
      new CardEffect('poison_dagger_barrage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    characterClass: ['rogue'], tier: 2,
    rarity: 'uncommon',
    // +1 dmg per shot per offset.
    gamePlusOffset: { poison_dagger_barrage: 1 },
  });
}

// ============================================================
// Rogue tier 1 / tier 3 — the "fight dirty" line. Bleed, Poison, Sunder and
// Weak instead of Block: the rogue mitigates by shrinking the swing coming
// back, not by absorbing it.
// ============================================================

// Hamstring — Rogue Tier 1 (4). Cut the tendon: 2 Bleed (2) + 1 Weak (2). No
// damage of its own; the whole card is the debuff. Takes Heroic Tumble's slot
// in the Rogue pool (the Ranger keeps Tumble).
export function createHamstring() {
  return new Card({
    id: 'hamstring',
    name: 'Hamstring',
    description: 'Deal 2 Bleed + Weak.',
    shortDesc: '2 Bleed\n+ Weak',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_bleed', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_weak', 1, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['rogue'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { apply_bleed: 1 },
  });
}

// Exploit — Rogue Tier 3 (13). Sunder 1 (3) + Deal 5 (5) + Poison (2) +
// 2 Bleed (2), and the swing hits for 7 instead of 5 into Armor or Shield.
// The damage rides armor_bonus_damage (encoded base*10 + bonus = 57), the same
// effect the Obsidian Forge and Greatclub use, so the Armor/Shield check is
// already built. Sunder is ordered FIRST so the strip helps this same hit.
export function createExploit() {
  return new Card({
    id: 'exploit',
    name: 'Exploit',
    description: 'Sunder, Deal 5 + Poison\n+ 2 Bleed.\nArmor/Shield: +2.',
    shortDesc: 'Sunder, 5 Dmg\n+Poison +2 Bleed\nvs Armor: +2',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_sunder', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('armor_bonus_damage', 57, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_bleed', 2, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['rogue'],
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { apply_sunder: 1, apply_bleed: 1 },
  });
}

// Crippling Venom — Rogue Tier 3 (13). Deal 4 (4) + 2 Poison (4) + 1 Weak for
// every Poison stack this attack lands (2 base = 4). The Weak count is
// measured, not fixed: a Vial of Poison charge or any standing poison rider
// pushes the Poison up and the Weak with it.
export function createCripplingVenom() {
  return new Card({
    id: 'crippling_venom',
    name: 'Crippling Venom',
    description: 'Deal 4 + 2 Poison.\nDeal 1 Weak per Poison\napplied by this attack.',
    shortDesc: '4 Dmg + 2 Poison\n1 Weak per\nPoison applied',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('crippling_venom', 4, TargetType.SINGLE_ENEMY, 2),
    ],
    characterClass: ['rogue'],
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { crippling_venom: 2 },
  });
}

// Assassinate — Rogue Tier 3 (13) + 12 for the second card cost = 25.
// Deal 15 (15), and against a target that hasn't been touched yet: +10 (5 at
// half-weight) and a Draw (~2), plus an On Kill draw (~2). "Was Undamaged" is
// only true on the opening blow of a fight or against a fresh summon, so the
// spike can't be manufactured mid-combat; the base 15 is what carries it the
// rest of the time.
export function createAssassinate() {
  return new Card({
    id: 'assassinate',
    name: 'Assassinate',
    description: 'Recharge a Card ->\nDeal 15.\nWas Undamaged: +10, Draw.\nOn Kill: Draw.',
    shortDesc: 'R-Card->15 Dmg\nUndamaged: +10\n+Draw / Kill: Draw',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('assassinate_strike', 15, TargetType.SINGLE_ENEMY),
      // Read by maybeFireDrawOnKill off the active card once the strike lands.
      new CardEffect('draw_on_kill', 1, TargetType.SELF),
    ],
    characterClass: ['rogue'],
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { assassinate_strike: 3 },
  });
}

export function createSprint() {
  return new Card({
    id: 'sprint',
    name: 'Sprint',
    description: 'Draw 2,\nDiscard the top card.',
    shortDesc: 'Draw 2\nDiscard top',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('draw', 2, TargetType.SELF),
      new CardEffect('discard_top_card', 1, TargetType.SELF),
    ],
    characterClass: ['rogue'],
    // Tier 3 abilities are RARE by default (the tier-3 ability line is the
    // late-game upgrade band; uncommon is where the tier-2 versions sit).
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { draw: 1 },
  });
}

// Slyblade-deck Sprint — enemy-only simpler variant. The player Sprint
// only draws when its hand is empty (a combo card); the Kobold Slyblade
// AI just wants a plain "Draw 2" it can use any turn, so it runs this
// copy instead. Not in CARD_REGISTRY (enemy-only; codex surfaces it via
// the Slyblade deck scan).
export function createSprintEnemy() {
  return new Card({
    id: 'sprint_enemy', name: 'Sprint',
    description: 'Draw 2.',
    shortDesc: 'Draw 2', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [new CardEffect('draw', 2, TargetType.SELF)],
    noTierOffset: true,
  });
}

// --- Warrior Tier 2 ---
// Mortal Strike (replaces Thunderclap as the Warrior T2 third option).
// Single-target burst that stamps a fat Bleed chunk for the warrior to
// keep working in subsequent turns. Card id stays `thunderclap` so
// older saves keep deserializing; only the display name + art +
// effects changed.
export function createThunderclap() {
  return new Card({
    id: 'thunderclap', name: 'Mortal Strike',
    description: 'Deal 3 Damage and 3 Bleed.',
    shortDesc: '3 Dmg + 3 Bleed', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_bleed', 3, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 2, apply_bleed: 1 },
  });
}

export function createShieldWall() {
  return new Card({
    id: 'shield_wall', name: 'Shield Wall',
    description: 'You and allies gain Shield now and at the start of your turn.',
    shortDesc: 'Shield now\n& per turn (stacks)', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    // gain_shield + buff_allies_shield = the "now" half (player +
    // ally creatures). grant_shield_wall_buff stacks a per-turn
    // tick (shield_wall_tick in character.js) — casting again adds
    // another +1 to the stack, so two casts means +2 Shield each
    // turn to you and every ally.
    effects: [
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('buff_allies_shield', 1, TargetType.SELF),
      new CardEffect('grant_shield_wall_buff', 1, TargetType.SELF),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: {
      gain_shield: 1,
      buff_allies_shield: 1,
      grant_shield_wall_buff: 1,
    },
  });
}

export function createBattleShout() {
  return new Card({
    id: 'battle_shout', name: 'Battle Shout',
    description: 'You and allies gain Heroism now and at the start of your turn.',
    shortDesc: 'Heroism now\n& per turn (stacks)', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    // gain_heroism + buff_allies_heroism = the "now" half (player +
    // ally creatures). grant_battle_shout_buff stacks a per-turn
    // tick (battle_shout_tick in character.js) — casting again adds
    // another +1 to the stack, so two casts means +2 Heroism each
    // turn to you and every ally.
    effects: [
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
      new CardEffect('grant_battle_shout_buff', 1, TargetType.SELF),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: {
      gain_heroism: 1,
      buff_allies_heroism: 1,
      grant_battle_shout_buff: 1,
    },
  });
}

// ============================================================
// Warrior tier 2 / tier 3 — the shout-and-carve line. Shield Wall and
// Battle Shout left the pool for LEGACY_CARD_IDS; their "now + every
// turn" aura is folded into the single tier-3 Rallying Shout, and the
// seats they freed go to Intimidating Shout and Rampage.
// ============================================================

// Intimidating Shout — Warrior Tier 2 (7). 1 Weak on every enemy: 2 points a
// stack × 3 for the ALL multiplier = 6. No damage of its own — it's the
// warrior's answer to a wide board, blunting the whole enemy row's next swing
// instead of killing anything.
export function createIntimidatingShout() {
  return new Card({
    id: 'intimidating_shout', name: 'Intimidating Shout',
    description: 'Deal Weak to All.',
    shortDesc: 'Weak to All', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_weak_all', 1, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { apply_weak_all: 1 },
  });
}

// Rampage — Warrior Tier 2 (7) on a Discard cost (× 1.5 = 10.5). Rage 1
// (4-5, permanent +1 damage on every attack for the rest of the fight) plus a
// 3-target chain for 2 (2 + 1 + 1 at the halved rate for extra targets = 4).
// The Rage is what the card is really buying; the chain just makes the turn
// you spend a card on it not feel empty.
export function createRampage() {
  return new Card({
    // Id is `warrior_rampage`, not `rampage`: the Gnoll Fang of Yeenoghu's
    // Rampage POWER already owns the bare `rampage` key in CARD_ART_MAP (its
    // showcase alias, pointing at GnollBite.jpg). A second `rampage` entry in
    // that same object literal is a duplicate key — last one wins — so the
    // card silently rendered the gnoll's bite art.
    id: 'warrior_rampage', name: 'Rampage',
    description: 'Discard -> Gain 1 Rage.\nDeal 2 on 3 targets.',
    shortDesc: 'D->+1 Rage\n2 Dmg x3', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.DISCARD,
    effects: [
      new CardEffect('gain_rage', 1, TargetType.SELF),
      new CardEffect('multi_damage', 2, TargetType.SINGLE_ENEMY, 3),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { multi_damage: 1 },
  });
}

// Whirlwind — Warrior Tier 3 (13) rare. 3 damage to every enemy (3 × 3 for the
// ALL multiplier = 9) plus 1 Bleed to every enemy (1 × 3 = 3) = 12. The
// warrior's board sweep, and the Bleed keeps ticking on whatever survives it.
export function createWhirlwind() {
  return new Card({
    id: 'whirlwind', name: 'Whirlwind',
    description: 'Deal 3 + Bleed to All.',
    shortDesc: '3 Dmg + Bleed\nto All', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_all', 3, TargetType.ALL_ENEMIES),
      new CardEffect('apply_bleed_all', 1, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['warrior'], tier: 3, rarity: 'rare',
    gamePlusOffset: { damage_all: 2, apply_bleed_all: 1 },
  });
}

// Sunder Armor — Warrior Tier 3 (13) rare on a Discard cost (× 1.5 = 19.5).
// 3 Sunder (3 a stack = 9) then 3 damage for EVERY Sunder stack standing on
// the target afterwards — 9 on a clean target, more if the warrior (or an
// Exploit / Mandible Cleaver / Umber Hulk Rend) already stripped it. The
// sunder_armor_strike handler applies the stacks first so this same swing
// carves through the armor it just peeled.
export function createSunderArmor() {
  return new Card({
    id: 'sunder_armor', name: 'Sunder Armor',
    description: 'Discard -> Deal 3 Sunder.\nDeal 3 Damage per Sunder.',
    shortDesc: 'D->3 Sunder\n3 Dmg/Sunder', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.DISCARD,
    effects: [
      new CardEffect('sunder_armor_strike', 3, TargetType.SINGLE_ENEMY),
    ],
    // The handler reads eff.value for BOTH the Sunder applied and the damage
    // per stack, so one offset bumps the strip and the payoff together.
    characterClass: ['warrior'], tier: 3, rarity: 'rare',
    gamePlusOffset: { sunder_armor_strike: 1 },
  });
}

// Rallying Shout — Warrior Tier 3 (13) rare. Shield Wall and Battle Shout
// merged into one card: Shield AND Heroism, on the player and every ally, now
// and at the start of every turn. Each of the two retired tier-2 cards was
// worth 7, so the merge lands at 14 against a 13 budget — close enough, and it
// frees two tier-2 seats.
export function createRallyingShout() {
  return new Card({
    id: 'rallying_shout', name: 'Rallying Shout',
    description: 'You and your allies gain Shield and Heroism now and at the start of your turn.',
    shortDesc: 'Shield + Heroism\nnow & per turn', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    // The "now" half (self + allies, Shield and Heroism) plus ONE per-turn
    // buff of its own — grant_rallying_shout_buff / rallying_shout_tick — not
    // a stacked pair of the retired Shield Wall + Battle Shout buffs. The
    // pair was quicker to wire but showed the player two badges belonging to
    // cards that are no longer in the game; this way the buff row shows a
    // single Rallying Shout badge with its own art. Casting twice stacks it
    // to +2 Shield / +2 Heroism per turn.
    effects: [
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('buff_allies_shield', 1, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
      new CardEffect('grant_rallying_shout_buff', 1, TargetType.SELF),
    ],
    characterClass: ['warrior'], tier: 3, rarity: 'rare',
    gamePlusOffset: {
      gain_shield: 1,
      buff_allies_shield: 1,
      gain_heroism: 1,
      buff_allies_heroism: 1,
      grant_rallying_shout_buff: 1,
    },
  });
}

// Bulwark — Warrior Tier 3 (13) rare on a Discard cost (× 1.5 = 19.5). The
// warrior's last stand, built on the one number this engine already tracks as
// "how much punishment have you taken": the discard pile IS the damage pile
// (deck.js — drawPile is rebuilt as masterDeck minus discard, and only a rest
// or level-up clears it). So the Shield count is literally "1 per point of
// damage since your last rest", Bulwark's own discarded body included.
//
// The three riders are deliberately small next to that scaling number:
//   - Sentinel until your next turn — you join the same Sentinel pool a
//     guarding ally sits in, so attackers must come at a Sentinel first
//     (picking freely between you and any guarding ally), and a multi-target
//     swing fills every Sentinel slot before it spills onto the rest of the
//     row. Only an "attacks ALL" swing ignores it, same as for allies.
//   - Bloodied: Draw — note this is the SAME variable as the Shield count
//     (Bloodied is "discard >= half your deck"), so the draw switches on
//     exactly when the Shield number peaks.
//   - On Recharge: 2 Shields — a Discard-cost card lands in the discard pile,
//     never the recharge pile, so playing Bulwark can't trigger its own
//     rider. It only pays out when ANOTHER card eats Bulwark out of hand as
//     recharge fodder (Arcane Beam and the other recharge_extra costs).
export function createBulwark() {
  return new Card({
    id: 'bulwark', name: 'Bulwark',
    description: 'Discard -> Gain 1 Shield per discarded card.\nGain Sentinel until next turn.\nBloodied: Draw.\nOn Recharge: 2 Shields.',
    shortDesc: 'D->1 Shield per\ndiscard, Sentinel\nBloodied: Draw',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.DISCARD,
    effects: [
      new CardEffect('bulwark_shield', 1, TargetType.SELF),
      new CardEffect('gain_sentinel', 1, TargetType.SELF),
      new CardEffect('bloodied_draw', 1, TargetType.SELF),
      new CardEffect('on_recharge_shield', 2, TargetType.SELF),
    ],
    characterClass: ['warrior'], tier: 3, rarity: 'rare',
    gamePlusOffset: { on_recharge_shield: 1 },
  });
}

export function createExecute() {
  return new Card({
    id: 'execute', name: 'Execute',
    // "Target Bloodied", not the bare "Bloodied": half_hp_draw reads the
    // TARGET's health here, where every other Bloodied card in the game
    // (Shield / Symbol of Last Hope, Frenzy Blood Vial, Bulwark) reads its
    // owner's. Same pill on both would have meant two opposite things.
    // Spelled "Deal 5 Damage" rather than the old bare "Deal 5" so the Game+
    // description swap can actually find the number (EFFECT_DESC_PATTERNS.damage
    // keys on "Deal N Damage" / "N Dmg"); the old wording matched neither, so
    // the printed 5 never scaled with the offset.
    description: 'Deal 5 Damage.\nTarget Bloodied: Draw.',
    shortDesc: '5 Dmg\nTarget Bloodied:\nDraw', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('half_hp_draw', 1, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 3 },
  });
}

// --- Druid Tier 2 ---
// Exported: the Ancients Guardians raise these too (Regrowth overheal and the
// Ancient of War's death burst both spawn Treants on the enemy side).
// The one place a Treant is built. Every grove effect (Summon Treants,
// Regrowth's overheal, Treant Bark, Staff of the Ancients) routes through
// here so the stat line can't drift between them.
//
// `traits` mirrors the necromancer's Skeleton/Undead structure: the narrow
// tag ('Treant') is the summon family that bolster effects draw from, so a
// bigger body can join the grove by carrying the same tag instead of being
// matched on its name. See createAncientOfWarCreature.
export function createTreantCreature() {
  return new Creature({
    name: 'Treant', attack: 2, maxHp: 1, haste: true, description: 'Haste',
    traits: ['Treant'],
  });
}

export function createSummonTreants() {
  return new Card({
    id: 'summon_treants', name: 'Summon Treants',
    description: 'Summon or Bolster 2-3 Treants.',
    shortDesc: 'Summon/Bolster\n2-3 Treants', subtype: 'ability',
    cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_treants', 1, TargetType.SUMMON)],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
    previewCreature: createTreantCreature(),
    // Empty opt-in marker: scaling lives on the runtime handler
    // (max count) + CREATURE_TIER_OFFSET['Treant'] (+1/+1 stats). The
    // description / shortDesc carry the 2-4 range hardcoded — a custom
    // branch in applyGamePlusOffsetInPlace rewrites the max number
    // (4 → 5 at offset 2, → 6 at offset 4).
    gamePlusOffset: { summon_treants: 0.5 },
  });
}

// ============================================================
// Druid tier 1 / tier 3 — the storm-and-grove line. Call Lightning seeds the
// Shock theme at tier 1 (taking Sneak Attack's seat, which was the one card in
// the druid pool with no nature identity and which the Rogue still runs), and
// Summon Storm cashes it in at tier 3.
// ============================================================

// Call Lightning — Druid Tier 1 (4). 1-3 damage (avg 2) + 1 Shock (2).
//
// Effect ORDER is the whole balance of this card. Shock is +1 damage taken per
// stack (getIncomingDamageModifier), so applying it first would raise this very
// hit to 2-4 and push the card to 5 on a 4 budget. Damage resolves FIRST, then
// the Shock lands for whatever comes next — which is also what the printed text
// says, in that order.
export function createCallLightning() {
  return new Card({
    id: 'call_lightning', name: 'Call Lightning',
    description: 'Deal 1-3 and Shock.',
    shortDesc: '1-3 Dmg\n+ Shock', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      // damage_range encodes min*10 + max — 13 = "1 to 3".
      new CardEffect('damage_range', 13, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_shock', 1, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['druid'], tier: 1, rarity: 'uncommon',
    // +1 to the top of the roll per offset (13 → 14 = "1 to 4").
    gamePlusOffset: { damage_range: 1 },
  });
}

// Entangling Roots — Druid Tier 3 (13) rare. Poison on every enemy (2 × 3 for
// the ALL multiplier = 6) and Paralyze on everything that can be paralyzed
// (~3 × 3 = 9), plus a Poison drip when the card recharges (2). That totals ~17
// against a 13 budget, and it is deliberately left there: Paralyze only touches
// 1x1 enemy CREATURES, so against a lone boss — or anything with a 2x2 body —
// this collapses to "1 Poison on one target" and is worth about 2. High
// ceiling, near-zero floor; the average lands where it should.
//
// Note the On Recharge rider fires on EVERY cast, not just when the card is
// used as fodder: playCardSelf runs the on-recharge hooks for any RECHARGE-cost
// card. It's an on-play rider wearing the enchant family's wording.
export function createEntanglingRoots() {
  return new Card({
    id: 'entangling_roots', name: 'Entangling Roots',
    description: 'Deal 1 Poison and\nParalyze All.\nOn Recharge: Poison Randomly.',
    shortDesc: 'Poison + Paralyze\nAll\nR: Poison Rnd', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_poison_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('apply_paralyze_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('on_recharge_poison_random', 1, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 3, rarity: 'rare',
    gamePlusOffset: { apply_poison_all: 1, apply_paralyze_all: 1 },
  });
}

// The player's Ancient of War — the grove's answer to a boss. Smaller than the
// Ancients Guardians' version (that one is 5/15 with 5 Armor) because this one
// body-blocks instead of grinding: Sentinel means every single-target swing has
// to come through its 10 HP and 1 Armor first.
//
// Companion-routed (isCompanion + sourceCard + _routeToPlayPile, set by the
// summon handler): the card sits in the play pile while the Ancient stands, and
// falls into the DISCARD pile when it dies — a permanent point of the player's
// HP. That death cost is why the card is priced against the 19.5 Discard budget
// rather than the flat 13. If it survives the fight, endCombat drops the play
// pile back into the deck; it never carries over to the next fight.
//
// 'Treant' in traits is what puts it in the grove: Summon Treants, Treant Bark
// and the Staff of the Ancients all bolster from the trait now, so a standing
// Ancient is a legal +1/+1 target — the best one there is, since it's the rare
// ally that survives long enough to spend the buff.
export function createPlayerAncientOfWarCreature() {
  const c = new Creature({
    name: 'Ancient of War',
    attack: 3,
    maxHp: 10,
    armor: 1,
    sunderAttack: 1,
    sentinel: true,
    slotW: 2,
    slotH: 2,
    isCompanion: true,
    description: 'Sentinel.\nOn Death: Summon 1-2 Treants.',
    traits: ['Ancient', 'Treant'],
  });
  c.onDeathSummonTreants = [1, 2];
  return c;
}

// Force of Nature — Druid Tier 3 rare. Recharge a Card -> the Ancient walks in,
// and you draw one back. The Draw is why this ISN'T priced with the second-card
// bonus (a card that replaces itself pays no cost premium); the DEATH of the
// Ancient sending its card to discard is what earns the 1.5x instead.
export function createForceOfNature() {
  return new Card({
    id: 'force_of_nature', name: 'Force of Nature',
    description: 'Recharge a Card ->\nCall an Ancient of War\nto the battle! Draw.',
    shortDesc: 'R-Card->Ancient\nof War, Draw', subtype: 'ability',
    cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('summon_ancient_of_war', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 3, rarity: 'rare',
    previewCreature: createPlayerAncientOfWarCreature(),
    // Scaling lives on CREATURE_TIER_OFFSET['Ancient of War'] (main.js), not on
    // an effect value — the marker just opts the card into the offset pass.
    gamePlusOffset: { summon_ancient_of_war: 0 },
  });
}

// Summon Storm — Druid Tier 3 (13) rare + a second card cost (+12) = 25.
// Shock on everything (6), then 4 damage on everything — which lands as 5 per
// target, because the card's own Shock went first and Shock is +1 damage taken
// (15) — plus a 2-turn lightning rider (~5). 26 against 25.
//
// The rider deliberately can NOT proc off its own cast, and that needs no
// special-casing: grant_storm_buff is listed LAST, so the Shock above resolved
// before the buff existed. A SECOND Summon Storm does proc the first one's
// buff, once per enemy it shocks — which is exactly the intended payoff.
export function createSummonStorm() {
  return new Card({
    id: 'summon_storm', name: 'Summon Storm',
    description: 'Recharge a Card ->\nDeal Shock to All,\nDeal 4 to All.\nWhen you Shock, randomly\nDeal 1-3 for 2 turns.',
    shortDesc: 'R-Card->Shock All\n4 Dmg All\nShock->1-3 Dmg 2t',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_shock_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('damage_all', 4, TargetType.ALL_ENEMIES),
      // MUST stay last — see the self-proc note above. Value is the duration
      // in turns, not a damage amount.
      new CardEffect('grant_storm_buff', 2, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 3, rarity: 'rare',
    gamePlusOffset: { damage_all: 2, apply_shock_all: 1 },
  });
}

// Avatar of the Wild — Druid Tier 3 (13) rare on a Discard cost (x1.5 = 19.5).
// Both halves of Feral Form at once and permanently: the cat's Bleed (as a
// rider on every attack for the rest of the fight, 4) and the bear's guard
// (2 Shield = 4, 4 Ailments cleansed ~1), plus 1 Rage (5) and a 4-damage swing
// (4) that already benefits from BOTH new buffs — the Rage and the Bleed rider
// are granted before it, so the opening rake hits for 5 and bleeds.
export function createAvatarOfTheWild() {
  return new Card({
    id: 'avatar_of_the_wild', name: 'Avatar of the Wild',
    description: 'Discard -> Gain 1 Rage,\nGain 2 Shield, Heal 4 Ailments.\nYour attacks also deal Bleed\nthis fight. Deal 4.',
    shortDesc: 'D->Rage, 2 Shield\nHeal 4 Ailments\nAttacks Bleed, 4 Dmg',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.DISCARD,
    effects: [
      new CardEffect('gain_rage', 1, TargetType.SELF),
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('heal_ailments_self', 4, TargetType.SELF),
      // Before the swing on purpose: the Deal 4 below rides its own rider.
      new CardEffect('grant_avatar_bleed', 1, TargetType.SELF),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
    ],
    characterClass: ['druid'], tier: 3, rarity: 'rare',
    gamePlusOffset: { damage: 2, gain_shield: 1 },
  });
}

// Feral Wrath — Druid Tier 2 ability. A single hard swing: Deal 5 + Bleed,
// then gain a random Shield between floor(N/2) and N, where N = your ally count
// (rewards a full board, with a guaranteed floor). Card id stays `feral_bite`
// so older saves deserialize cleanly; changed from the old "damage → Bleed".
export function createFeralBite() {
  return new Card({
    id: 'feral_bite', name: 'Feral Wrath',
    description: 'Deal 5 + Bleed. Gain Shield up to the number of allies.',
    shortDesc: '5 + Bleed\nShield = allies', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield_per_ally', 1, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 2, apply_bleed: 1 },
  });
}

export function createStarfire() {
  return new Card({
    id: 'starfire', name: 'Starfire',
    description: 'Recharge a Card -> Deal 3 Damage and 3 Fire, Draw.\nHeroism: +1 +Fire.',
    shortDesc: 'R-Card->3 Dmg+3 Fire\nDraw\nHeroism: +1 +Fire', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // apply_fire_with_heroism runs BEFORE damage and does NOT clear heroism, so
    // each Heroism adds +1 Fire here AND +1 damage on the swing below.
    effects: [
      new CardEffect('apply_fire_with_heroism', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 2, apply_fire_with_heroism: 1 },
  });
}

export function createHealingTouch() {
  return new Card({
    id: 'healing_touch', name: 'Healing Touch',
    description: 'Recharge +1 Card -> Heal 8.',
    shortDesc: 'R+1->Heal 8', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heal', 8, TargetType.SINGLE_ALLY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { heal: 4 },
  });
}

// Nature's Healing — Druid Tier 2. Heal every stack of every negative
// effect on the player (Bleed, Poison, Fire, Ice, Shock), gain
// Heroism equal to the number of distinct effect types healed, then
// Heal 5 HP. Shares Healing Touch's art.
export function createNaturesHealing() {
  return new Card({
    id: 'natures_healing', name: "Nature's Healing",
    description: 'Heal 3 Ailment to All.\nHeal 3 to All.\nOverheal: Shield/Heroism.',
    shortDesc: 'Heal 3 Ailment ALL\nHeal 3 ALL\nOverheal: Shield/Hero', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    // heal_ailments_all + team_heal_overheal both hit YOU and every alive ally
    // (SELF target = no picker; they iterate the whole friendly side). Overheal
    // is spent per-point randomly on +1 Shield or +1 Heroism (50/50).
    effects: [
      new CardEffect('heal_ailments_all', 3, TargetType.SELF),
      new CardEffect('team_heal_overheal', 3, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { heal_ailments_all: 1, team_heal_overheal: 1 },
  });
}

// ============================================================
// Ability Choice Lists
// ============================================================

export function getPaladinAbilityChoices() {
  // Holy Light was swapped out for Shield Bash at tier 1 — Holy Light's
  // creator stays in CARD_REGISTRY so older saves that already had it
  // still deserialize, but it's no longer offered on level-up / pick
  // screens. If/when we want it back, just put it back in this list.
  // Tier 2: the old Shock-flavored Hammer of Wrath left the pool for Aura of
  // Might — the tier was three attacks and one utility, and the class had no
  // party support at all. Shock is the druid's identity now (Call Lightning ->
  // Summon Storm), so dropping it here separates the two cleanly. The NAME
  // moves up to the tier-3 judgment.
  return [createHeroicStrike(), createShieldBash(), createShieldOfFaith(), createHeroicHeal(),
          createConsecration(), createAuraOfMight(), createHolySword(), createRevivify(),
          createHolySteed(), createDevotionAura(), createHolyShield(), createHammerOfWrathT3()];
}

export function getRangerAbilityChoices() {
  // Piercing Shot retired from the level-up / shrine pool; its creator
  // stays in CARD_REGISTRY so older saves with it still deserialize.
  // Elemental Weapon takes its slot.
  return [createTamedRat(), createTrack(), createAimedShotCard(), createTrapCard(),
          createMarkingShot(), createAnimalCompanion(), createElementalWeapon(),
          createRainOfArrows(),
          createBestialWrath(), createEndlessQuiver(), createKillingGround(),
          createTrueshotBarrage()];
}

// Trueshot Barrage - Ranger Tier 3. Three unpreventable shots, and the ranger's
// answer to the armoured things waiting in the Underdark.
//
// Runs through the barrage flow rather than three stacked effects, and that IS
// the design: resolveBarrageShot snapshots Heroism, Ignite and the poison buff
// ONCE and re-applies them to every shot, so a quiver fed to this card pays out
// three times. Three separate unpreventable_damage effects would consume the
// Heroism on shot one and the poison buff on the first hit, and the whole quiver
// package would do nothing here.
//
// 5x3 = 15 True. At roughly 1.4x normal damage that prices near 21 against a
// tier-3 rare with a card cost (25), deliberately leaving headroom, because
// every point of Heroism on this card is worth 3 damage rather than 1.
//
// It must NEVER gain a Draw: an unconditional draw cancels the second-card cost
// bonus outright, dropping the budget from 25 to 13 and leaving this at nearly
// double its tier.
export function createTrueshotBarrage() {
  return new Card({
    id: 'trueshot_barrage',
    name: 'Trueshot Barrage',
    description: 'Recharge a Card ->\nDeal 5 True Damage 3 times.',
    shortDesc: 'R Card->5 True\nx3',
    subtype: 'ability',
    subtype2: 'ranged',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('trueshot_barrage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['ranger'], tier: 3, rarity: 'rare',
    gamePlusOffset: { trueshot_barrage: 1 },
  });
}

// Killing Ground - Ranger Tier 3. The capstone of the Trap line, and the only
// defensive option in the ranger's whole pool: armour isn't the ranger's answer,
// prepared ground is.
//
// Three traps, and you CHOOSE each one from three random offers — deliberately
// NOT stated on the card, which just reads "Set 3 Traps"; the picker is a
// pleasant surprise rather than a cost to explain. It rewards
// reading the fight (a Bear body when you need a blocker, Spike when you need
// the boss dead). The same trap can come up across rounds, so three Bear Traps
// is possible.
//
// ~18 of raw trap value against a tier-3 rare's 13. The delay and the residual
// randomness (three of five offered, not any of five) pay the difference, which
// is why it takes no second card cost.
export function createKillingGround() {
  return new Card({
    id: 'killing_ground',
    name: 'Killing Ground',
    description: 'Set 3 Traps.',
    shortDesc: 'Set 3 Traps',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('killing_ground', 3, TargetType.SUMMON)],
    characterClass: ['ranger'], tier: 3, rarity: 'rare',
    previewCards: [
      createSnakeTrapToken(), createExplosiveTrapToken(), createBearTrapToken(),
      createIceTrapToken(), createSpikeTrapToken(),
    ],
    noTierOffset: true,
  });
}

// Bone Quiver - Tier 2 rare, taken off the gnolls who were shooting at you.
// Their whole line is Bone-prefixed and their Bone Cleaver already poisons, so
// the toxin rider is the pack's signature rather than a bolted-on keyword.
//
// The Poison is the single-use "your next attack also applies Poison" buff, not
// a random application: the quiver is spent BEFORE the bow picks a target, so
// applying it to a random enemy could poison a hyena while you shoot the
// hunter. Riding the shot means it always lands on what you actually hit.
export function createBoneQuiver() {
  return new Card({
    id: 'bone_quiver',
    name: 'Bone Quiver',
    description: 'On Recharge: Gain Heroism.\nRanged: Gain Poison.',
    shortDesc: 'On Recharge:\n+Heroism\nRanged: +Poison',
    subtype: 'quiver',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('on_recharge_heroism', 1, TargetType.SELF),
      new CardEffect('on_recharge_poison_buff_ranged', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'rare',
    unplayable: true,
    // Bare-keyword stacks, so no number in the text for the NG+ rewriter.
    noTierOffset: true,
  });
}

// Mephit Skin Quiver - Tier 2 uncommon, cured from magma mephit hide, so it
// carries fire the way the Bone Quiver carries rot. Unlike its siblings the
// BASE line is the rider too: it stokes Ignite whatever you feed it to, and a
// bow just gets a second stack.
export function createMephitSkinQuiver() {
  return new Card({
    id: 'mephit_skin_quiver',
    name: 'Mephit Skin Quiver',
    description: 'On Recharge: Gain Ignite.\nRanged: Gain Ignite.',
    shortDesc: 'On Recharge:\n+Ignite\nRanged: +Ignite',
    subtype: 'quiver',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('on_recharge_ignite', 1, TargetType.SELF),
      new CardEffect('on_recharge_ignite_ranged', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'uncommon',
    unplayable: true,
    noTierOffset: true,
  });
}

// Endless Quiver - Ranger Tier 3. The prize is not the Heroism, it is the card
// economy: every ranger bow costs "Recharge a Card ->", and this pays that cost
// for free once per turn, forever. The Heroism is the garnish.
//
// It drops the base Quiver's second Heroism - the Ranged clause buys the return
// instead. Fed to anything that is not a bow it is simply Wolf Fang: one
// Heroism and it is gone, which is what stops it being a generic good card in a
// non-bow deck.
//
// "Stays in hand" is the player-facing wording because that is what it looks
// like from their seat, but mechanically the card really does land in the
// recharge pile - that is precisely why the on-recharge Heroism fires with no
// new plumbing - and is then pulled straight back. See maybeReturnQuiverToHand.
export function createEndlessQuiver() {
  return new Card({
    id: 'endless_quiver',
    name: 'Endless Quiver',
    description: 'On Recharge: Gain Heroism.\nRanged: Stays in hand.',
    shortDesc: 'On Recharge:\n+Heroism\nRanged: Stays',
    subtype: 'quiver',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('on_recharge_heroism', 1, TargetType.SELF),
      new CardEffect('on_recharge_return_ranged', 1, TargetType.SELF),
    ],
    characterClass: ['ranger'], tier: 3, rarity: 'rare',
    unplayable: true,
    // Bare-keyword Heroism, so there is no number in the text for the NG+
    // rewriter to find - same reason the base Quiver opts out.
    noTierOffset: true,
  });
}

export function getWizardAbilityChoices() {
  return [createFireBurst(), createIceBolt(), createMagicMissiles(), createArcaneShield(),
          // Ice Block left the pool: it puts 4 Ice on YOU, and the passive shatter
          // fires on the player too — a 40% chance per incoming hit to take 4
          // that Block can't stop AND spray each of your own allies. Its creator
          // stays registered; Overseer Gnikan still runs 4 copies.
          createElementalNova(), createArcaneBeam(),
          createArcaneExplosion(), createSummonElemental(),
          createShatterStorm(), createFireball(), createArcaneVortexCard(),
          createPolymorph()];
}

export function getRogueAbilityChoices() {
  // Heroic Tumble left the Rogue pool for Hamstring — the class mitigates by
  // shrinking incoming swings (Weak) rather than gambling on Block. Tumble is
  // still a Ranger tier-1 pick, so it stays in active rotation.
  return [createAimedShotCard(), createSneakAttack(), createPetSpider(), createHamstring(),
          createBladeFlurry(), createBackstab(), createPoisonedDagger(), createFanOfBlades(),
          createSprint(), createExploit(), createCripplingVenom(), createAssassinate()];
}

export function getWarriorAbilityChoices() {
  // Tier 1: Heroic Strike, Charge, Reckless Strike, Shield Bash.
  // Tier 2: Mortal Strike (id thunderclap), Execute, Intimidating Shout,
  //         Rampage — Shield Wall and Battle Shout retired to legacy.
  // Tier 3: Whirlwind, Sunder Armor, Rallying Shout, Bulwark.
  return [createHeroicStrike(), createCharge(), createRecklessStrike(), createShieldBash(),
          createThunderclap(), createExecute(),
          createIntimidatingShout(), createRampage(),
          createWhirlwind(), createSunderArmor(), createRallyingShout(), createBulwark()];
}

export function getDruidAbilityChoices() {
  // Tier 1: Wrath, Regrowth, Feral Swipe, Call Lightning. Sneak Attack left
  // the pool for Call Lightning — it's the Rogue's signature (and still sits in
  // that pool), its "X = attacks this turn" scaling wants a multi-attack deck
  // the Druid doesn't build, and it was the only card here with no nature
  // identity. Tier 3: Entangling Roots, Force of Nature, Summon Storm,
  // Avatar of the Wild.
  return [createWrath(), createRegrowth(), createFeralSwipe(), createCallLightning(),
          // Healing Touch retired from the pool in favor of Nature's
          // Healing; its creator stays in CARD_REGISTRY so older
          // saves that already had it still deserialize cleanly.
          createSummonTreants(), createFeralBite(), createStarfire(),
          createNaturesHealing(),
          createEntanglingRoots(), createForceOfNature(), createSummonStorm(),
          createAvatarOfTheWild()];
}

// Necromancer ability pool. Tier 1: Arcane Shield (shared with
// Wizard, the ward against the Specter), Shadow Bolt, Drain Life,
// Army of the Dead. Tier 2: The Butcher (companion call) and Plague
// (AoE poison burst). Cards carry their own `tier`, so the codex /
// getAbilityChoices split them into the Tier 1 and Tier 2 decks. This
// is the canonical list the full Necromancer class will draw from.
export function getNecromancerAbilityChoices() {
  return [createArcaneShield(), createShadowBolt(), createDrainLife(),
          createArmyOfTheDeadCard(),
          createTheButcher(), createPlague(),
          createCorpseExplosion(), createBoneStormNecromancer(),
          createDeathCoil()];
}

export function getAbilityChoices(className, count = 3, tier = 1) {
  const choiceFns = {
    Paladin: getPaladinAbilityChoices,
    Ranger: getRangerAbilityChoices,
    Wizard: getWizardAbilityChoices,
    Rogue: getRogueAbilityChoices,
    Warrior: getWarriorAbilityChoices,
    Druid: getDruidAbilityChoices,
    // Necromancer (Path of the Necromancer side quest) — its own
    // Tier 1 pool (Arcane Shield / Shadow Bolt / Drain Life / Army
    // of the Dead).
    Necromancer: getNecromancerAbilityChoices,
  };
  const all = (choiceFns[className] || getPaladinAbilityChoices)();
  const tierMatch = all.filter(c => c.tier === tier);
  // Show-all calls (count >= tier pool size) sort alphabetically by
  // name so the lineup is stable / predictable. Subset calls (mid-run
  // picks at shrines, churches, level-ups) still shuffle + slice so
  // the choice feels rolled.
  if (count >= tierMatch.length) {
    return tierMatch
      .slice()
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
  const shuffled = tierMatch.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============================================================
// Enemy Cards - Giant Rat
// ============================================================

// Mortain's Staff — Path of the Necromancer side quest. Snatched off
// the desk in Master Mortain's study when the spellbook calls up its
// first skeleton. Mirrors the wizard short-staff archetype but pays
// the apprentice's whole bone-army instead of just her: she AND every
// skeleton ally she's raised get Shield on cast, then the staff
// finishes with 3 damage. gain_shield resolves BEFORE the damage so
// a reactive counter from the target lands on a freshly raised
// buckler (same timing fix as Short Staff).
export function createMortainsStaff() {
  return new Card({
    id: 'mortains_staff',
    name: "Mortain's Staff",
    description: 'Recharge a Card -> Deal 4. You and your skeletons gain Shield.',
    shortDesc: 'R-Card->4 Dmg\n+Shield (you + skeletons)',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 1, TargetType.SELF),
      // buff_skeletons_shield filters allies by the 'Skeleton' trait
      // (see Creature.traits) so the rider only buffs the apprentice's
      // raised dead, not Misha/Huffer/etc. should they ever cross
      // paths. Future bone summons just tag themselves with 'Skeleton'
      // to opt in.
      new CardEffect('buff_skeletons_shield', 1, TargetType.SELF),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 1,
    gamePlusOffset: { damage: 2, gain_shield: 1, buff_skeletons_shield: 1 },
  });
}

// Drain Life — Forgotten Shrine reward (Tier 1 Necromancer ability).
// Deals 2 True damage (bypasses Shield / Armor / Block) and heals the
// apprentice 1 per point that landed. The heal rider reads the
// _lastEffectDamageLanded snapshot the damage handler stamps right
// before this effect resolves, so a partial hit (target died on the
// first point) heals only what actually drained.
// Shadow Bolt — Tier 1 Necromancer ability. Standard recharge cost,
// 2 damage + 1 Poison + draw. The card's hook is the heroism rider:
// any standing Heroism is consumed here and added to the Poison
// stack instead of contributing to the damage effect that runs
// after, so the apprentice has a way to push raw heroism into a
// long-tail Poison tick instead of one big swing. Wired but NOT
// yet placed in the necromancer ability pool — drops in via a
// future encounter / shrine pick once the granting beat is written.
export function createShadowBolt() {
  return new Card({
    id: 'shadow_bolt',
    name: 'Shadow Bolt',
    // "Recharge a Card" = recharge ONE extra card on top of Shadow
    // Bolt itself (cards always recharge themselves by default), so
    // the cast costs 2 cards total. recharge_extra 1 below is what
    // backs the wording.
    description: 'Recharge a Card ->\nDeal 2 + Poison, Draw.\nHeroism: +Poison.',
    // shortDesc keeps the full "Heroism" word so the inline-badge
    // regex catches it and renders the Heroism icon — abbreviating
    // to "H:" silently skips the conversion and the hover preview
    // ends up with a bare letter where the gold token should be.
    shortDesc: 'R+1->2 Dmg\n+Poison, Draw\nHeroism: +Poison',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    // Effect order: convert heroism → poison FIRST (this also clears
    // caster.heroism), then the damage effect runs from the bare
    // eff.value with no heroism bonus. Draw closes the play.
    // recharge_extra 1 makes the cast cost 2 cards (Shadow Bolt
    // itself + 1 more recharged from hand) — same template as
    // Ice Bolt / 2H martials.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_poison_with_heroism', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 1, apply_poison_with_heroism: 1 },
    characterClass: ['necromancer'],
    tier: 1,
    rarity: 'uncommon',
  });
}

export function createDrainLife() {
  return new Card({
    id: 'drain_life',
    name: 'Drain Life',
    description: 'Deal 2 True Damage.\nHeal 1 for each Damage.',
    shortDesc: '2 True Dmg\nHeal/Dmg',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('unpreventable_damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('heal_for_landed_damage', 0, TargetType.SELF),
    ],
    characterClass: ['necromancer'],
    tier: 1,
    rarity: 'uncommon',
    // True-damage value scales with offset; heal follows the damage.
    gamePlusOffset: { unpreventable_damage: 1 },
  });
}

// Army of the Dead — Worn Floor reward (Tier 1 Necromancer ability).
// The apprentice claims the defeated army through the book and can
// now call them at will: summons 2 fresh 1/1 Skeletons with 1 armor
// AND grants Haste to every Skeleton-trait ally on the field (the
// two she just raised + any standing from Skeleton Mastery), so they
// all swing the same turn they enter. The same id is shared with the
// invulnerable boss's power but they live in different registries
// (CARD_REGISTRY vs the power-card art keyed off `power_<id>`).
export function createArmyOfTheDeadCard() {
  return new Card({
    id: 'army_of_the_dead',
    name: 'Army of the Dead',
    description: 'Summon a Skeleton or\nBolster one X 2.\nUndead gain Haste.',
    shortDesc: 'Summon/Bolster x2\nUndead +Haste',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_army_of_the_dead', 2, TargetType.SUMMON),
    ],
    characterClass: ['necromancer'],
    tier: 1,
    rarity: 'uncommon',
    noTierOffset: true,
  });
}

// The Butcher — Necromancer Tier 2 companion call. A hulking 3/10
// undead that swings at 2 targets with a Bleed rider. Stats live on
// the creature (kept in sync with the summon_butcher handler in
// main.js). Like Misha/Huffer he's UNIQUE on the field — the
// unique-companion guard blocks a second summon while one is alive,
// even though a player may run several copies of the Tier 2 card.
export function createButcherCreature() {
  return new Creature({
    name: 'The Butcher', attack: 3, maxHp: 10,
    bleedAttack: 1, multiAttack: 2, isCompanion: true,
    traits: ['Undead'],
    // 2x2 footprint — a hulk that eats 4 of the 12 ally cells.
    slotW: 2, slotH: 2,
    // On Death: bursts Poison across the enemy side.
    onDeathPoisonAll: 1,
    description: 'Attacks 2 targets. On Death: Poison ALL.',
  });
}

export function createTheButcher() {
  return new Card({
    id: 'the_butcher', name: 'The Butcher',
    description: 'Recharge a Card ->\nCall The Butcher!\nDraw.',
    shortDesc: 'R-Card->Call\nThe Butcher, Draw',
    // Ally card (the Butcher himself is the summon). A Tier 3 Necromancer
    // ability CHOICE — it stays in getNecromancerAbilityChoices, it just
    // sits in the tier-3 band now.
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('summon_butcher', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['necromancer'],
    // Tier 3 abilities are rare (see the tier-3 ability line).
    tier: 3,
    rarity: 'rare',
    // Codex Summons tab + hover preview pull from this; the live
    // summon is built in the summon_butcher handler with the same stats.
    previewCreature: createButcherCreature(),
    gamePlusOffset: {},
  });
}

// Plague — Necromancer Tier 2. Stacks Poison on every enemy, then
// immediately resolves all standing Poison as damage (a festering
// burst). Poison never decays in this engine, so the stacks linger
// and keep ticking on later turns — Plague just front-loads them.
export function createPlague() {
  return new Card({
    id: 'plague', name: 'Plague',
    description: 'Deal Poison to ALL.\nApply all Poison Damage.',
    shortDesc: '+Poison to all\nDetonate Poison',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_poison_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('apply_all_poison_damage', 0, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['necromancer'],
    // Tier 3 abilities are rare (see the tier-3 ability line).
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { apply_poison_all: 1 },
  });
}

// Book of the Dead — Necromancer Tier 1. Stays in hand and pumps one
// of your Undead allies +1/+1 every turn it's held (the first living
// Undead on the field). Master Elarion's "real stock" at the Arcane
// Emporium.
export function createBookOfTheDead() {
  return new Card({
    id: 'book_of_the_dead',
    name: 'Book of the Dead',
    description: 'One Undead gains +1/+1.\nStays in hand.',
    shortDesc: '+1/+1 Undead\nStays',
    subtype: 'scroll',
    cardType: CardType.ITEM,
    costType: CostType.FREE,
    effects: [
      new CardEffect('buff_one_undead', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    characterClass: ['necromancer'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { buff_one_undead: 1 },
  });
}

// Bone Buckler — Necromancer Tier 1 clothing. Shields you AND one of
// your Undead allies, and draws on the first shield of the play (same
// "First Shield: Draw" rider as the Buckler).
export function createBoneBuckler() {
  return new Card({
    id: 'bone_buckler',
    name: 'Bone Buckler',
    description: 'Gain Shield.\nOne Undead Gain Shield.\nFirst Shield: Draw.',
    shortDesc: '+2 Shield\n+2 Undead\n1st Shield: Draw',
    subtype: 'clothing',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('buff_one_undead_shield', 2, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
    ],
    characterClass: ['necromancer'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { gain_shield: 1, buff_one_undead_shield: 1 },
  });
}

// Corpse Explosion — Necromancer Tier 2. Sacrifices one of your allies
// (the highest-HP one) and detonates it: every enemy takes damage equal
// to that ally's current HP, and all enemies are Poisoned. A finisher
// that turns a fat skeleton (or The Butcher) into a board-wide nuke.
// Death Coil - Necromancer Tier 2. The class's missing pillar: until now nothing
// in the necromancer's kit raised anything off an ENEMY corpse. Every body it
// fielded came out of a card, and Corpse Explosion consumes one of your own.
//
// Budget: Discard multiplies by 1.5, so a T2 uncommon is 7 x 1.5 = 10.5. Deal 10
// plus a kill-gated Skeleton (a body is worth ~1.5-2, halved behind the gate)
// lands at ~11. Reckless Strike is the anchor for the shape - T1 uncommon,
// Discard -> Deal 6, i.e. 4 x 1.5 exactly.
//
// The Discard cost is doing thematic work, not just paying for numbers: the
// discard pile IS the player's damage track, so this literally spends vitality
// to cast. Fitting for a necromancer, and the reason it shouldn't become the
// pool's default cost - this class has the smallest deck in the game.
//
// 10 damage one-shots most summons and won't drop a boss, so the rider fires
// exactly when you're clearing adds. Sweep the minions, keep the corpses.
export function createDeathCoil() {
  return new Card({
    id: 'death_coil',
    name: 'Death Coil',
    description: 'Discard -> Deal 10.\nOn Kill: Summon a Skeleton.',
    shortDesc: 'D->10 Dmg\nOn Kill: Skeleton',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('damage', 10, TargetType.SINGLE_ENEMY),
      new CardEffect('summon_skeleton_on_kill', 1, TargetType.SUMMON),
    ],
    characterClass: ['necromancer'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 3 },
  });
}

export function createCorpseExplosion() {
  return new Card({
    id: 'corpse_explosion',
    name: 'Corpse Explosion',
    description: 'Kill an ally.\nDeal its HP to ALL.\nDeal Poison to ALL.',
    shortDesc: 'Kill ally ->\nHP dmg to all\n+Poison all',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      // SINGLE_ALLY — the player clicks which of their own creatures to
      // sacrifice; that corpse's HP becomes the AoE damage.
      new CardEffect('corpse_explosion', 0, TargetType.SINGLE_ALLY),
      new CardEffect('apply_poison_all', 1, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['necromancer'],
    tier: 2,
    rarity: 'uncommon',
    gamePlusOffset: { apply_poison_all: 1 },
  });
}

// Bone Storm — Necromancer Tier 2. Strips every enemy's Shield and
// converts it into your own, chips all enemies for 1, and bolsters your
// whole undead host +1/+1.
export function createBoneStormNecromancer() {
  return new Card({
    id: 'bone_storm_necromancer',
    name: 'Bone Storm',
    description: 'Recharge a Card ->\nSteal ALL Shield. Deal 1 to ALL.\nUndead +1/+1. Draw.',
    shortDesc: 'R-Card->Steal Shields\n1 to all, Undead +1/+1\nDraw',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('strip_all_shields_gain', 0, TargetType.ALL_ENEMIES),
      new CardEffect('damage_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('buff_all_undead', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['necromancer'],
    tier: 2,
    rarity: 'uncommon',
    gamePlusOffset: { damage_all: 1, buff_all_undead: 0.5 },
  });
}

// Skitter Bite — Plague Cockroach's dual-mode signature card. Top-
// level effects are the attack mode (used on the cockroach's turn);
// modes[0] is the defense mode (used reactively when the apprentice
// swings at the bug). Both modes stamp +1 Poison on damage so the
// player ramps Poison stacks no matter how the fight flows.
export function createSkitterBite() {
  return new Card({
    id: 'skitter_bite',
    name: 'Skitter Bite',
    description: 'Atk: Deal 2 Damage.\nDef: Block 1, Deal 1 Damage, Draw.\nHit: +Poison.',
    shortDesc: 'Atk: 2 Dmg\nDef: Block 1 +1 Dmg, Draw\nHit: +Poison',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // apply_poison_on_damage replaces a plain apply_poison so the
    // +Poison rider only stamps when the swing actually broke through
    // shield / armor / block. If the apprentice shields up before the
    // bug bites (Short Staff order: gain_shield → damage), the
    // counter is fully absorbed and no Poison applies.
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison_on_damage', 1, TargetType.SINGLE_ENEMY),
    ],
    modes: [
      new CardMode('Block 1, Deal 1 Damage, Draw, +Poison', [
        new CardEffect('block', 1, TargetType.SELF),
        new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
        new CardEffect('draw', 1, TargetType.SELF),
        new CardEffect('apply_poison_on_damage', 1, TargetType.SINGLE_ENEMY),
      ]),
    ],
    noTierOffset: true, // monster card — stays flat across ccgQuest+
  });
}

// Old Spectral Hand — Forgotten Specter's signature card. Dual-mode
// like Skitter Bite: the specter swings it on its turn for a random
// 1-3 damage roll (with Dire Fury's accumulated Rage stacking on
// top — the enemy-turn damage_range handler runs the full buff
// stack), and plays it reactively to block + heal + draw when the
// apprentice attacks. The Block 5 / Heal 5 / Draw defense mode
// makes the specter very hard to crack open with a single big swing
// (heroism stacking helps the apprentice break the threshold).
// Damage range encoded in eff.value as min*10 + max — so 13 = 1 to 3.
// Named "Old Spectral Hand" so the id stays distinct from the
// chapter-7 createSpectralHand drop, which keeps its 2 True / Heal 2
// shape.
export function createOldSpectralHand() {
  return new Card({
    id: 'old_spectral_hand',
    name: 'Old Spectral Hand',
    description: 'Atk: Deal 1 to 3 Damage.\nDef: Block 5, Heal 5, Draw.',
    shortDesc: 'Atk: 1-3 Dmg\nDef: Block 5 +Heal 5\nDraw',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_range', 13, TargetType.SINGLE_ENEMY),
    ],
    modes: [
      new CardMode('Block 5, Heal 5, Draw', [
        new CardEffect('block', 5, TargetType.SELF),
        new CardEffect('heal', 5, TargetType.SELF),
        new CardEffect('draw', 1, TargetType.SELF),
      ]),
    ],
    noTierOffset: true, // monster card — stays flat across ccgQuest+
  });
}

// Specter of Death's signature swing. 4 damage with a "Hit: Death"
// rider — if any damage lands on the player's HP (i.e. mitigation
// didn't fully absorb), the game ends. Arcane Shield's Block 4 is
// the intended counter: full absorption skips the rider's
// damageLanded check at finishIncomingDamage. The rider is
// implemented via the mark_deathly_strike effect, which flips a
// module flag the damage flow consults once the DEFENDING phase
// resolves. Dropped 5 → 4 so the apprentice survives a no-draw
// turn on Arcane Shield alone; 5 would have killed any turn the
// player whiffed an additional defense.
export function createDeathSickle() {
  return new Card({
    id: 'death_sickle',
    name: 'Death Sickle',
    description: 'Deal 4 Damage.\nHit: Death.',
    shortDesc: '4 Dmg\nHit: Death',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('mark_deathly_strike', 1, TargetType.SELF),
    ],
    noTierOffset: true, // monster card — stays flat across ccgQuest+
  });
}

export function createBite() {
  return new Card({
    id: 'bite',
    name: 'Bite',
    description: 'Recharge -> Deal 1 damage.',
    shortDesc: 'R->1 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage', 1, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { damage: 2 },
  });
}

export function createToughHide() {
  return new Card({
    id: 'tough_hide',
    name: 'Tough Hide',
    description: 'Recharge -> Block 1,\nHeal 1 Ailment, Draw.',
    shortDesc: 'R->Block 1\nHeal Ailment, Draw',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('heal_n_negative_effects', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 2 },
  });
}

export function createBigBone() {
  return new Card({
    id: 'big_bone',
    name: 'Big Bone',
    description: 'Recharge +1 Card -> Deal 3 damage.',
    shortDesc: 'R+1->3 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 2 },
  });
}

export function createLooseBone() {
  return new Card({
    id: 'loose_bone',
    name: 'Loose Bone',
    description: 'Recharge -> Block 1, Heal 1 Poison,\nDraw. Summon a Restless Bone.',
    shortDesc: 'R->Block 1, Heal Poison\nDraw, +Restless Bone',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('heal_poison', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    // Offset: +2 Block AND each +1 bumps the random-summon max by 1
    // (base 1, +1 → 1-2, +2 → 1-3...). The summon happens in
    // enemyAutoPlayDefenses keyed off `card.id === 'loose_bone'`.
    gamePlusOffset: { block: 2, loose_bone_summon: 1 },
  });
}

export function createSkreeeeeeeek() {
  return new Card({
    id: 'skreeeeeeeek',
    name: 'Skreeeeeeeek!',
    description: 'Recharge -> Summon 1-3 Rats.',
    shortDesc: 'R->1-3 Rats',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_random', 3, TargetType.SUMMON)],
    // Offset bumps the max rats summoned by 1 per step (1-3 → 1-4 → 1-5…).
    // The description's "3" is the swap target; the range floor stays at 1.
    gamePlusOffset: { summon_random: 1 },
  });
}

// ============================================================
// Enemy Cards - Slime
// ============================================================

export function createSlimeAppendage() {
  return new Card({
    id: 'slime_appendage',
    name: 'Slime Appendage',
    description: 'Recharge -> Deal 1 unpreventable damage.',
    shortDesc: 'R->1 True Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('unpreventable_damage', 1, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { unpreventable_damage: 1 },
  });
}

// === Slime Loot Cards ===

export function createPartiallyDigestedBone() {
  return new Card({
    id: 'partially_digested_bone',
    name: 'Partially Digested Bone',
    description: 'Deal 3 True Damage.',
    shortDesc: '3 True Dmg',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('unpreventable_damage', 3, TargetType.SINGLE_ENEMY)],
    rarity: 'uncommon',
    gamePlusOffset: { unpreventable_damage: 2 },
  });
}

export function createCorrodedArmor() {
  return new Card({
    id: 'corroded_armor',
    name: 'Corroded Armor',
    description: 'Discard -> Block 6, Draw.',
    shortDesc: 'D->Block 6, Draw',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('block', 6, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 4 },
  });
}

function createPetSlimeCreature() {
  return new Creature({
    name: 'Pet Slime',
    attack: 1,
    maxHp: 1,
    unpreventable: true,
    description: 'Deals Unpreventable Damage',
  });
}

export function createPetSlimeCard() {
  return new Card({
    id: 'pet_slime',
    name: 'Pet Slime',
    description: 'Recharge -> Summon 1-2 Pet Slimes to the battle!',
    shortDesc: 'R->Summon 1-2\nSlimes',
    subtype: 'ally',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_pet_slime', 1, TargetType.SUMMON)],
    rarity: 'rare',
    previewCreature: createPetSlimeCreature(),
    // Base summons 1-2 Pet Slimes; +1 max per offset (1-2 → 1-3 →
    // 1-4 …). The pet_slime branch in applyGamePlusOffsetInPlace
    // rebuilds the description; the previewCreature's stats scale via
    // CREATURE_TIER_OFFSET['Pet Slime'] (clones in
    // applyTierOffsetToCardPreview). Runtime spawn loop in
    // case 'summon_pet_slime' reads the bumped value.
    gamePlusOffset: { pet_slime_summon: 1 },
  });
}

export function createSlimeJar() {
  return new Card({
    id: 'slime_jar',
    name: 'Slime Jar',
    description: 'Recharge -> Your next 3 attacks\nare Unpreventable.',
    shortDesc: 'R->Next 3 Unprev.',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('grant_unpreventable_buff', 3, TargetType.SELF)],
    rarity: 'uncommon',
    gamePlusOffset: { grant_unpreventable_buff: 1 },
  });
}

// ============================================================
// Enemy Cards - Kobold Warden
// ============================================================

export function createGuards() {
  return new Card({
    id: 'guards',
    name: 'Guards!',
    description: 'Recharge -> Summon 1-2 Kobold Guards.',
    shortDesc: 'R->1-2 Guards',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_random', 2, TargetType.SUMMON)],
    gamePlusOffset: { summon_random: 1 },
  });
}

export function createHideInCorner() {
  return new Card({
    id: 'hide_in_corner',
    name: 'Hide in the Corner',
    description: 'Recharge -> Block 2, Gain Shield,\nHeal All Ailment, Draw.',
    shortDesc: 'R->Block 2, Shield\nHeal All, Draw',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('heal_all_negative_effects', 0, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 2, gain_shield: 1 },
  });
}

// ============================================================
// Enemy Cards - Dire Rat
// ============================================================

export function createDireRatBite() {
  return new Card({
    id: 'dire_rat_bite',
    name: 'Dire Rat Bite',
    description: 'Recharge -> Deal 3 damage.',
    shortDesc: 'R->3 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage', 3, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { damage: 2 },
  });
}

export function createDireRatScreech() {
  return new Card({
    id: 'dire_rat_screech',
    name: 'Screech!',
    description: 'Recharge -> Summon 1-2 Rats.',
    shortDesc: 'R->1-2 Rats',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_random', 2, TargetType.SUMMON)],
    // +1 max rats per offset (1-2 → 1-3 → 1-4…). Swap target is the
    // "2" in the description.
    gamePlusOffset: { summon_random: 1 },
  });
}

// ============================================================
// Loot Reward Cards
// ============================================================

export function createBoneWand() {
  return new Card({
    id: 'bone_wand',
    name: 'Bone Wand',
    description: 'Deal Poison and Gain Poison.\nStays in hand.',
    shortDesc: 'Poison enemy +\nself, Stays',
    subtype: 'wand',
    cardType: CardType.ATTACK,
    // FREE — stays in hand so the player can zap a stack of Poison
    // every turn forever. A recharge cost would let them pay once and
    // ride it free; FREE + self-poison backlash keeps it honest.
    costType: CostType.FREE,
    effects: [
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison_self', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    // Custom bone_wand handler in applyGamePlusOffsetInPlace:
    //   - poison scales by floor(0.5 * offset) so +1 every 2 tiers
    //   - apply_poison_self is REMOVED at any offset >= 1 (no more
    //     self-poison backlash) — net trade-off: slower scaling, no
    //     downside.
    gamePlusOffset: { bone_wand: 0.5 },
  });
}

export function createBoneClub() {
  return new Card({
    id: 'bone_club',
    name: 'Bone Club',
    description: 'Recharge a Card -> Deal 4 damage. +1 Poison vs Armor/Shield.',
    shortDesc: 'R-Card->4 Dmg\n+1 Poison vs\nArmor/Shield',
    subtype: 'simple_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // Poison rider resolves BEFORE damage so it reads pre-hit
    // armor/shield (see Bone Mace for the rationale).
    effects: [
      new CardEffect('apply_poison_vs_armor', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 2, apply_poison_vs_armor: 1 },
  });
}

export function createBoneMace() {
  return new Card({
    id: 'bone_mace',
    name: 'Bone Mace',
    description: 'Deal 3 damage. +1 Poison vs Armor/Shield.',
    shortDesc: '3 Dmg\n+1 Poison vs\nArmor/Shield',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // Poison rider resolves BEFORE damage so it reads the target's
    // pre-hit armor/shield. Otherwise on-hit armor-peel powers like
    // Obsidian Construct strip the armor down to 0 before the poison
    // check, swallowing the rider against an armored target.
    effects: [
      new CardEffect('apply_poison_vs_armor', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 2, apply_poison_vs_armor: 1 },
  });
}

export function createBoneStaff() {
  return new Card({
    id: 'bone_staff',
    name: 'Bone Staff',
    description: 'Recharge a Card -> Deal 4 + Poison. Gain Shield.',
    shortDesc: 'R-Card->4 Dmg\n+Poison, Gain Shield',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 1, apply_poison: 0.5, gain_shield: 1 },
  });
}

export function createBadRations() {
  return new Card({
    id: 'bad_rations',
    name: 'Bad Rations',
    description: 'Consume + Recharge 1 -> Heal 4,\ndiscard 1.\nMeal: Heal 1-2, Discard 0-1 for 2 turns.',
    shortDesc: 'C+R1->Heal 4,\n-1 deck\nMeal: Heal/Disc 2T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 4, TargetType.SELF),
      new CardEffect('discard_deck', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    // Multi-effect Meal — every tick rolls heal 1-2 AND discard 0-1
    // for 2 turns each combat, until the player rests.
    provision: {
      slot: 'meal',
      name: 'Bad Rations',
      turnsPerCombat: 2,
      effects: [
        { effectType: 'heal_random', value: 2 },
        { effectType: 'discard_deck_random', value: 1 },
      ],
      description: 'Heal 1-2 and Discard 0-1 for 2 turns each combat (until rest)',
    },
    // +2 heal per offset (4 → 6 → 8…), +1 Meal turn per offset
    // (2 → 3 → 4…). Custom bad_rations handler rewrites the
    // "for N turns" tail from the bumped provision.turnsPerCombat.
    gamePlusOffset: { heal: 2, bad_rations_turns: 1 },
  });
}

export function createSturdyBoots() {
  return new Card({
    id: 'sturdy_boots',
    name: 'Sturdy Boots',
    // Dual-mode: top-level (attack) fires on player turn; modes[0] (defense)
    // fires during the defending phase. Defense mode is the meatier line —
    // block + counter + draw — so the card rewards a save for incoming hits.
    description: 'Attack: 2 Dmg\nDefense: Block 2,\nDeal 2 Randomly, Draw',
    shortDesc: 'Atk: 2 Dmg / Def:\nBlock 2, 2 Rand\nDraw',
    subtype: 'light_armor',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
    ],
    modes: [
      new CardMode('Block 2, Deal 2 Randomly, Draw', [
        new CardEffect('block', 2, TargetType.SELF),
        new CardEffect('damage_random', 2, TargetType.RANDOM_ENEMY),
        new CardEffect('draw', 1, TargetType.SELF),
      ]),
    ],
    rarity: 'uncommon',
    // Attack mode: +1.5 dmg per offset (floor). Defense mode:
    // +1 block + +1.5 random-dmg per offset. Custom sturdy_boots
    // handler rebuilds description from scaled values.
    gamePlusOffset: { damage: 1.5, modes: [{ block: 1, damage_random: 1.5 }] },
  });
}

export function createTorch() {
  return new Card({
    id: 'torch',
    name: 'Torch',
    description: 'Discard -> Deal Fire to All. Scout 3.',
    shortDesc: 'D->Fire ALL,\nScout 3',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('apply_fire_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('scout', 3, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { apply_fire_all: 1, scout: 1 },
  });
}

// Rat on a Stick — common Tier 1 meal. Light Consume + Recharge 1
// heal + 2-turn meal buff. Drops as a guaranteed second card from
// the prison's first Giant Rat fight and from the Dire Rat fight in
// the corner cell.
export function createRatOnAStick() {
  return new Card({
    id: 'rat_on_a_stick',
    name: 'Rat on a Stick',
    description: 'Consume + Recharge 1 -> Heal 2.\nMeal: Heal 1 for 2 turns.',
    shortDesc: 'C+R1->Heal 2\nMeal: Heal 1/2T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 2, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Rat on a Stick',
      effectType: 'heal',
      value: 1,
      turnsPerCombat: 2,
      description: 'Heal 1 each turn for 2 turns (each combat, until rest)',
    },
    rarity: 'common',
    tier: 1,
    gamePlusOffset: { heal: 1 },
  });
}

export function createChickenLeg() {
  return new Card({
    id: 'chicken_leg',
    name: 'Chicken Leg',
    description: 'Consume + Recharge 2 -> Heal 5.\nMeal: Heal 2 for 2 turns.',
    shortDesc: 'C+R2->Heal 5\nMeal: Heal 2/2T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 5, TargetType.SELF),
      new CardEffect('recharge_extra', 2, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Chicken Leg',
      effectType: 'heal',
      value: 2,
      turnsPerCombat: 2,
      description: 'Heal 2 each turn for 2 turns (each combat, until rest)',
    },
    // +2 on-play heal per offset; the meal's per-turn heal is bumped
    // by a custom chicken_leg handler in applyGamePlusOffsetInPlace.
    gamePlusOffset: { heal: 2, chicken_leg_meal: 1 },
  });
}

export function createWardensWhip() {
  return new Card({
    id: 'wardens_whip',
    name: "The Warden's Whip",
    // Effect values are still 1 base + offset; the description drops
    // the explicit "1"s so the card reads cleaner. The ccgQuest+ desc
    // rewriter only patches numeric tokens it finds, so a digitless
    // description stays put while the underlying eff.value scales
    // normally at runtime (apply_bleed +1/offset, buff_allies_heroism
    // +0.5/offset).
    description: 'Deal Bleed, Allies gain Heroism.',
    shortDesc: 'Bleed\n+Ally Heroism',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // Swapped raw damage for Bleed — the whip flays rather than thuds.
    effects: [
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    // +1 Bleed per offset, +0.5 ally heroism (floor) per offset.
    gamePlusOffset: { apply_bleed: 1, buff_allies_heroism: 0.5 },
  });
}

export function createSharpRock() {
  return new Card({
    id: 'sharp_rock',
    name: 'Sharp Rock',
    description: 'Deal 1 Damage. Hit: Draw.',
    shortDesc: '1 Dmg\nHit: Draw',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_draw_on_hit', 1, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage_draw_on_hit: 1 },
  });
}

// Rock Barrage — enemy-only card used by the Stone Giant. Shares the
// Sharp Rock art. Magic-missile-style barrage: 2 shots of 1 damage
// each, each shot picks its own target (could be the same enemy
// twice or spread across allies). Always draws.
export function createRockBarrage() {
  return new Card({
    id: 'rock_barrage',
    name: 'Rock Barrage',
    description: 'Recharge -> Deal 1 Damage 2 times, Draw.',
    shortDesc: 'R->1 Dmg x2, Draw',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('enemy_damage_succession', 1, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    // +1 per-shot damage per offset (shot count stays at 2). The
    // { value: 1 } shape uses the same bump helper but skips the
    // maxTargets bump that the earlier wiring added.
    gamePlusOffset: { enemy_damage_succession: { value: 1 } },
  });
}

// ============================================================
// Giant Frog enemy deck (River Cave Mouth lake-rock ambush).
// ============================================================

// Baby Giant Frog — On-attack: hit ALL enemies for 2 then explode.
// The attackAll + attack=2 stack lands the 2-damage AoE on the swing
// itself; selfDestruct then kills the frog right after. No more
// on-death rider — all the damage is folded into the attack.
export function createBabyGiantFrogCreature() {
  return new Creature({
    name: 'Baby Giant Frog', attack: 2, maxHp: 1,
    attackAll: true, selfDestruct: true,
    description: 'On Attack: Explode. Deal 2 Damage to all enemies.',
  });
}

// Baby Frog Swarm — Block 1, Draw, then summon 1-3 Baby Giant Frogs.
// summon_baby_giant_frogs reads eff.value as the max roll on the
// enemy side.
export function createBabyFrogSwarm() {
  return new Card({
    id: 'baby_frog_swarm',
    name: 'Baby Frog Swarm',
    description: 'Recharge -> Block 1, Draw,\nSummon 1 to 2 Baby Giant Frog.',
    shortDesc: 'R->Block 1, Draw\nSummon 1-2 Babies',
    // DEFENSE so the enemy AI auto-plays the card reactively when
    // the player swings (Block 1 in front of incoming damage), and
    // the card renders with the blue defense frame.
    subtype: 'simple',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('summon_baby_giant_frogs', 2, TargetType.SUMMON),
    ],
    previewCreature: createBabyGiantFrogCreature(),
    // +1 block, +1 to the upper bound of the random Baby Giant
    // Frog summon roll per offset. The summon_baby_giant_frogs
    // EFFECT_DESC_PATTERN matches the "1-N" tail (player-side
    // pattern) and the runtime handler reads eff.value as the max.
    gamePlusOffset: { block: 1, summon_baby_giant_frogs: 1 },
  });
}

// Frog Bite — plain 3 damage chomp, no poison rider. Enemy-only.
export function createFrogBite() {
  return new Card({
    id: 'frog_bite',
    name: 'Frog Bite',
    description: 'Recharge -> Deal 4 Damage.',
    shortDesc: 'R->4 Dmg',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 2 },
  });
}

// Giant Frog Swallow — slow heavy strike. Tongue-grab-and-gulp art.
// The recharge_extra effect actually costs the enemy 1 extra card
// from hand (the AI gate at main.js:25671 holds the card unless the
// hand has at least 2 cards), so the frog has to "load up" before
// it can fire this swallow.
export function createGiantFrogSwallow() {
  return new Card({
    id: 'giant_frog_swallow',
    name: 'Giant Frog Swallow',
    description: 'Recharge +1 ->\nDeal 6 Damage + Poison.',
    shortDesc: 'R+1->6 Dmg+Poison',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 3, apply_poison: 1 },
  });
}

// Acid Spit — Poison spray. One Poison stack to the player AND every
// living ally creature, with a green arrow per target (mirrors the
// apply_fire_all / apply_ice_all batch). Enemy-only.
export function createAcidSpit() {
  return new Card({
    id: 'acid_spit',
    name: 'Acid Spit',
    description: 'Recharge -> Poison to all enemies.',
    shortDesc: 'R->Poison ALL',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_poison_all', 1, TargetType.ALL_ENEMIES),
    ],
    // +0.5 poison stacks per offset (floor).
    gamePlusOffset: { apply_poison_all: 0.5 },
  });
}

// ============================================================
// Giant Frog loot drops (River Cave Mouth reef ambush).
// ============================================================

// Frog Nursery — defensive ally card. Block 1 + Draw + 1-2 Baby
// Giant Frog summons on the player's side. The babies use the same
// 2-attack-attackAll-selfDestruct profile as the enemy variant, but
// on the player side multiAttack=99 routes them through the
// "attacks all enemies" auto-resolve path (mirrors Thordak Ashmantle).
export function createPlayerBabyFrogCreature() {
  return new Creature({
    name: 'Baby Giant Frog', attack: 2, maxHp: 1,
    multiAttack: 99, selfDestruct: true,
    description: 'On Attack: Explode. Hits all enemies for 2.',
  });
}

export function createFrogNursery() {
  return new Card({
    id: 'frog_nursery',
    name: 'Frog Nursery',
    description: 'Recharge -> Block 1, Draw,\nSummon 1-2 Baby Frogs.',
    shortDesc: 'R->Block 1, Draw\n+1-2 Baby Frogs',
    subtype: 'ally',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('summon_player_baby_frogs', 2, TargetType.SUMMON),
    ],
    previewCreature: createPlayerBabyFrogCreature(),
    rarity: 'rare',
    tier: 1,
    // +1 block, +1 max baby frog per offset. The Baby Giant Frog
    // creature scales via CREATURE_TIER_OFFSET (+1/+1 atk/hp); since
    // the explosion damage echoes the frog's own attack stat, the
    // hp+atk bump naturally raises the AoE damage too.
    gamePlusOffset: { block: 1, summon_player_baby_frogs: 1 },
  });
}

// Frog Skin Boots — clothing. Block 1 + Heal 1 + Draw + on-swim
// rider that draws another card per swim-recharge of the boots
// themselves (matches Fish Scale Boots).
export function createFrogSkinBoots() {
  return new Card({
    id: 'frog_skin_boots',
    name: 'Frog Skin Boots',
    description: 'Block 1, Heal 1, Scry 2.\nOn Swim: Draw.',
    shortDesc: 'Block 1, Heal 1, Scry 2\nOn Swim: Draw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('heal', 1, TargetType.SINGLE_ALLY),
      new CardEffect('scry_pick', 2, TargetType.SELF),
      new CardEffect('on_swim_recharge_draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 1,
    gamePlusOffset: { block: 1, heal: 1, scry_pick: 1 },
  });
}

// Toxic Frog Extract — common item but plays as an ATTACK so it
// gets the standard player AoE arrow batch (green spit lines to
// every legal target). Consume cost; 1 Poison stack to every enemy.
export function createToxicFrogExtract() {
  return new Card({
    id: 'toxic_frog_extract',
    name: 'Toxic Frog Extract',
    description: 'Consume -> Apply 1 Poison to all enemies.',
    shortDesc: 'C->1 Poison ALL',
    subtype: 'item',
    cardType: CardType.ATTACK,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('apply_poison_all', 1, TargetType.ALL_ENEMIES),
    ],
    rarity: 'common',
    tier: 1,
    gamePlusOffset: { apply_poison_all: 1 },
  });
}

// ============================================================
// Harpy loot drops (post-wreckage_arrival combat).
// ============================================================

// Feather Cloak — clothing. Block 2, Draw on play. Carries an
// on_discard rider so if the cloak itself ever leaves hand to
// discard (Reckless Strike cost, Talon Blade cost, etc.) the player
// also draws 1.
export function createFeatherCloak() {
  return new Card({
    id: 'feather_cloak',
    name: 'Feather Cloak',
    description: 'Block 2, Scry 2.\nOn Discard: Draw.',
    shortDesc: 'Block 2, Scry 2\nOn Discard: Draw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
      new CardEffect('on_discard', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 1,
    gamePlusOffset: { block: 2, scry_pick: 1 },
  });
}

// Harpy Feather — Tier 1 Relic. Passive trigger: whenever the feather
// lands in the discard pile (deck damage random discard, a card's
// Discard cost picking the feather, an effect that discards from
// hand, etc.) it draws 2. Unplayable on its own — players can't fire
// the cycle by spending it as an action. Still pickable as a
// recharge-cost target for any card that wants Recharge +1, since
// the recharge-cost UI looks past the unplayable flag (the feather
// goes to the recharge pile rather than the discard pile in that
// case, so the on_discard trigger naturally doesn't fire).
export function createHarpyFeather() {
  return new Card({
    id: 'harpy_feather',
    name: 'Harpy Feather',
    description: 'On Discard: Draw 2.',
    shortDesc: 'On Discard: Draw 2',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('on_discard', 2, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 1,
    unplayable: true,
    // +0.5 draw per offset (floored): +2 base, +0 at off 1, +1 at off 2, etc.
    gamePlusOffset: { on_discard: 0.5 },
  });
}

// Harpy Egg Omelette — uncommon item. Consume + Recharge 1 → Heal 5
// (poison-first via the standard healPlayer path). Meal provision:
// for 3 turns, every player discard triggers a draw via the
// _onDiscardDraw flag on the projected combat buff.
export function createHarpyEggOmelette() {
  return new Card({
    id: 'harpy_egg_omelette',
    name: 'Harpy Egg Omelette',
    description: 'Consume + Recharge 1 -> Heal 5.\nMeal: When discarding from hand: Draw. 3 Turns.',
    shortDesc: 'C+R1->Heal 5\nMeal: Discard=Draw 3T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 5, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Harpy Egg Omelette',
      // No per-turn tick effect; the meal's payoff fires
      // imperatively from triggerOnDiscard whenever a card moves
      // hand→discard while the buff is active.
      effectType: 'noop',
      value: 0,
      turnsPerCombat: 3,
      onDiscardDraw: 1,
      description: 'Discarding from hand draws a card. Lasts 3 turns each combat.',
    },
    rarity: 'uncommon',
    tier: 1,
    // +2 Consume heal per offset + +1 Meal turn per offset (custom
    // branch in applyGamePlusOffsetInPlace bumps turnsPerCombat).
    gamePlusOffset: { heal: 2 },
  });
}

// Harpy Talon Blade — rare simple weapon. Auto-discards the top card
// of the draw pile as cost, deals 5 damage, stays in hand. The
// discarded card fires its own on_discard rider so chaining the blade
// with feather cloaks / Harpy Feather is the design payoff (no
// player pick — top of deck only).
export function createHarpyTalonBlade() {
  return new Card({
    id: 'harpy_talon_blade',
    name: 'Harpy Talon Blade',
    description: 'Discard the top card -> Deal 5 Damage.\nStays in hand.',
    shortDesc: 'D Top->5 Dmg\nStays',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.FREE,
    effects: [
      new CardEffect('discard_top_card', 1, TargetType.SELF),
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 1,
    gamePlusOffset: { damage: 3 },
  });
}

// Harpy Screaming Charm — rare item. Discard the charm; for every
// enemy: lose 1 random hand card (or take 1 damage if no hand),
// then draw 1. Mirrors the boss Luring Song mechanic but with a
// guaranteed self-draw rider.
export function createHarpyScreamingCharm() {
  return new Card({
    id: 'harpy_screaming_charm',
    name: 'Harpy Screaming Charm',
    description: 'Consume ->\nEnemy discard 1 card or take 1 damage.\nDraw.',
    shortDesc: 'C->Enemy -Card\nor 1 Dmg, Draw',
    subtype: 'item',
    cardType: CardType.ATTACK,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('luring_song', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 1,
    // +3 damage on the discard-or-damage rider per offset (the
    // damage tier of luring_song; the number of cards discarded
    // stays at 1 per enemy regardless of offset).
    gamePlusOffset: { luring_song: 3 },
  });
}

// ============================================================
// Kraken Spawn enemy deck (post-ship_chest fall-in-the-water boss).
// ============================================================

// Tentacle — Kraken Spawn summon. 3/5. Its swing carries the
// onAttackSnagCard rider: lands the damage like a normal attack and
// also splices 1 random hand card off the player, parking it on
// the tentacle creature (`_snaggedCard`). When the tentacle dies,
// the snagged card returns to the player's discard pile. Hovering
// the tentacle in combat surfaces the snagged card.
export function createKrakenTentacleCreature() {
  const c = new Creature({
    name: 'Tentacle', attack: 3, maxHp: 5,
    onAttackSnagCard: true,
    description: 'On Attack: snag 1 random card from your hand.',
  });
  // Tentacle is summoned by Kraken Spawn's deck cards (Tentacle Grab,
  // Tentacle Block, Tentacle). Those cards live in CARD_REGISTRY for
  // codex visibility, but the previewCreature stamper would otherwise
  // tag this creature as a player summon. Pre-stamp the side so the
  // codex Summons tab routes it to the enemy column. The creature
  // itself now scales via CREATURE_TIER_OFFSET['Tentacle'] (+1 atk /
  // +2 hp per offset) so noTierOffset stays off here.
  c._codexSide = 'enemy';
  return c;
}

// Tentacle Grab — Kraken card. Each play summons a fresh Tentacle
// onto the enemy field (and the creature gets to swing immediately
// next tick because it spawns ready). The 3-tentacle cap is
// enforced inside the summon handler in main.js so the AI's Tentacle
// Grab is a no-op once the field is full.
export function createTentacleGrab() {
  return new Card({
    id: 'tentacle_grab',
    name: 'Tentacle Grab',
    // cardType=ATTACK so the enemy AI queues it as an 'attack' action
    // — the 'summon' action path doesn't dispatch
    // summon_kraken_tentacle, which is why the tentacles weren't
    // spawning before. previewCreature still works on ATTACK cards
    // for the hover preview.
    description: 'Recharge ->\nSummon a Tentacle, it attacks.',
    shortDesc: 'R->Tentacle\n+Attack',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_kraken_tentacle', 1, TargetType.SUMMON),
    ],
    previewCreature: createKrakenTentacleCreature(),
    rarity: 'epic',
    // Tentacles spawn at a fixed shape; the Kraken Spawn's pressure
    // scales through deck multiplication (more Tentacle Grabs / Whip
    // / Bite) rather than per-card bumps.
    noTierOffset: true,
  });
}

// Tentacle — passive spawn variant. Same 3/5 Tentacle creature as
// Tentacle Grab, but the summon does NOT inject an immediate attack.
// The tentacle waits in the row until next turn (where it joins the
// normal creature_attack queue). Cheaper card cycle — just builds up
// the row without spending an attack beat.
export function createKrakenTentacleCard() {
  return new Card({
    id: 'kraken_tentacle',
    name: 'Tentacle',
    description: 'Recharge ->\nSummon a Tentacle.',
    shortDesc: 'R->Tentacle',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_kraken_tentacle_passive', 1, TargetType.SUMMON),
    ],
    previewCreature: createKrakenTentacleCreature(),
    rarity: 'epic',
    noTierOffset: true,
  });
}

// Tentacle Block — Kraken defense card. When the player swings on
// the Kraken Spawn, the boss summons a fresh Tentacle that soaks the
// hit instead of the boss. The summon path applies the incoming
// damage directly to the new tentacle (it may die from the swing if
// the player hit hard enough). Also draws so the boss keeps churning
// through its deck of tentacles.
export function createKrakenTentacleBlock() {
  return new Card({
    id: 'kraken_tentacle_block',
    name: 'Tentacle Block',
    description: 'Recharge ->\nSummon a Tentacle\nwho blocks the attack.\nDraw.',
    shortDesc: 'R->Tentacle\nBlocks, Draw',
    subtype: 'spell',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_kraken_tentacle_block', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    previewCreature: createKrakenTentacleCreature(),
    rarity: 'epic',
    noTierOffset: true,
  });
}

// Ink Cloud — Kraken AoE debuff. Stacks INK_CLOUD on every legal
// enemy target. While stacked, each of the afflicted character's
// attacks has a 50% chance to miss outright (no damage, no riders).
// Every attack consumes 1 stack regardless of the hit/miss roll, so
// the debuff naturally burns off over the next few swings.
export function createInkCloud() {
  return new Card({
    id: 'ink_cloud',
    name: 'Ink Cloud',
    description: 'Recharge ->\nAll enemies gain 3 Ink Cloud.',
    shortDesc: 'R->All +3 Ink',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ink_cloud_all', 3, TargetType.ALL_ENEMIES),
    ],
    rarity: 'epic',
    gamePlusOffset: { apply_ink_cloud_all: 1 },
  });
}

// Swallowing Bite — heavy single-shot strike from the Kraken Spawn
// itself (not a tentacle). Damage scales DOWN with the player's hand
// size: base 10, minus the number of cards in hand. An empty hand
// eats the full 10; a stuffed hand softens it almost to nothing.
// "Recharge +1" cost (one extra hand-card to fire), high priority
// so the AI leads with it whenever it's drawn.
export function createSwallowingBite() {
  return new Card({
    id: 'swallowing_bite',
    name: 'Swallowing Bite',
    description: 'Recharge +1 ->\nDeal 12 Damage minus cards in hand.',
    shortDesc: 'R+1->12-hand Dmg',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_minus_hand_count', 12, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    gamePlusOffset: { damage_minus_hand_count: 3 },
  });
}

// Tentacle Whip (Kraken enemy card) — AoE 1 damage to the player +
// every alive ally, then every alive Tentacle gains 1 Heroism so the
// next swing lands harder. High-priority enemy play right under
// Swallowing Bite. Uses the same KrakenSpawnTentacle.jpg art as the
// passive Tentacle card so the family stays visually consistent.
export function createKrakenWhip() {
  return new Card({
    id: 'kraken_whip',
    name: 'Tentacle Whip',
    description: 'Recharge ->\nDeal 1 Damage to all enemies.\nAllies gain 1 Heroism.',
    shortDesc: 'R->1 Dmg All\nAllies +1 Heroism',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    gamePlusOffset: { damage_all: 1, buff_allies_heroism: 1 },
  });
}

// ============================================================
// The Deep Kraken — the Underdark boss beneath the Bottomless Lake.
// A copy of the Kraken Spawn kit with everything scaled up: the boss
// carries 4x the deck (HP), its cards deal double, and it summons
// Deep Tentacles (6/10) instead of the surface 3/5 tentacles. The
// summon EFFECT TYPES are shared with the surface Kraken — the spawn
// handler in main.js reads enemy._deepKraken and swaps in the bigger
// tentacle, so these cards reuse summon_kraken_tentacle* directly.
// ============================================================

// Deep Tentacle — the Deep Kraken's limb. Double the surface Tentacle
// (6 atk / 10 hp) with the same on-attack card-snag.
export function createDeepTentacleCreature() {
  const c = new Creature({
    name: 'Deep Tentacle', attack: 6, maxHp: 10,
    onAttackSnagCard: true,
    description: 'On Attack: snag 1 random card from your hand.',
  });
  c._codexSide = 'enemy';
  return c;
}

// Deep Tentacle Grab — summon a Deep Tentacle that swings immediately.
export function createDeepTentacleGrab() {
  return new Card({
    id: 'deep_tentacle_grab',
    name: 'Deep Tentacle Grab',
    description: 'Recharge ->\nSummon a Deep Tentacle, it attacks.',
    shortDesc: 'R->Deep Tentacle\n+Attack',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_kraken_tentacle', 1, TargetType.SUMMON),
    ],
    previewCreature: createDeepTentacleCreature(),
    rarity: 'epic',
    noTierOffset: true,
  });
}

// Deep Tentacle — passive summon (no immediate swing).
export function createDeepKrakenTentacleCard() {
  return new Card({
    id: 'deep_kraken_tentacle',
    name: 'Deep Tentacle',
    description: 'Recharge ->\nSummon a Deep Tentacle.',
    shortDesc: 'R->Deep Tentacle',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_kraken_tentacle_passive', 1, TargetType.SUMMON),
    ],
    previewCreature: createDeepTentacleCreature(),
    rarity: 'epic',
    noTierOffset: true,
  });
}

// Deep Tentacle Block — DEFENSE summon: a fresh Deep Tentacle soaks the swing.
export function createDeepKrakenTentacleBlock() {
  return new Card({
    id: 'deep_kraken_tentacle_block',
    name: 'Deep Tentacle Block',
    description: 'Recharge ->\nSummon a Deep Tentacle\nwho blocks the attack.\nDraw.',
    shortDesc: 'R->Deep Tentacle\nBlocks, Draw',
    subtype: 'spell',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_kraken_tentacle_block', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    previewCreature: createDeepTentacleCreature(),
    rarity: 'epic',
    noTierOffset: true,
  });
}

// Deep Swallowing Bite — double the surface bite: 24 minus cards in hand.
export function createDeepSwallowingBite() {
  return new Card({
    id: 'deep_swallowing_bite',
    name: 'Deep Swallowing Bite',
    description: 'Recharge +1 ->\nDeal 24 Damage minus cards in hand.',
    shortDesc: 'R+1->24-hand Dmg',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_minus_hand_count', 24, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    gamePlusOffset: { damage_minus_hand_count: 3 },
  });
}

// Deep Tentacle Whip — AoE 5 to all + every alive tentacle gains 2 Heroism.
export function createDeepKrakenWhip() {
  return new Card({
    id: 'deep_kraken_whip',
    name: 'Deep Tentacle Whip',
    description: 'Recharge ->\nDeal 5 Damage to all enemies.\nAllies gain 2 Heroism.',
    shortDesc: 'R->5 Dmg All\nAllies +2 Heroism',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_all', 5, TargetType.ALL_ENEMIES),
      new CardEffect('buff_allies_heroism', 2, TargetType.SELF),
    ],
    rarity: 'epic',
    gamePlusOffset: { damage_all: 1, buff_allies_heroism: 1 },
  });
}

// ============================================================
// Kraken Spawn loot drops (post-fight pick-2 from the wreck).
// All tier-1 epics, all themed around the sea / bleed / heroism.
// ============================================================

// Bloody Eye Patch — defensive light armor. Block 1 + scaling Heroism
// (2 per enemy currently below max HP) + Draw. The bigger the field
// you've already chipped, the bigger the payoff when you eat a hit.
export function createBloodyEyePatch() {
  return new Card({
    id: 'bloody_eye_patch',
    name: 'Bloody Eye Patch',
    description: 'Block 1, Gain 2 Heroism\nfor each Damaged Enemy, Draw.',
    shortDesc: 'Block 1\n+2 Heroism/Damaged\nDraw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('gain_heroism_per_damaged_enemy', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 1,
    // +1 block, +2 Heroism per damaged enemy, per offset.
    gamePlusOffset: { block: 1, gain_heroism_per_damaged_enemy: 2 },
  });
}

// Harpoon of the Deep — clean single-target burst with a Bleed rider.
// Tier-1 epic martial: 4 damage + 2 Bleed for a recharge cost.
export function createHarpoonOfTheDeep() {
  return new Card({
    id: 'harpoon_of_the_deep',
    name: 'Harpoon of the Deep',
    description: 'Deal 4 Damage + 2 Bleed.',
    shortDesc: '4 Dmg\n+2 Bleed',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_bleed', 2, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'epic',
    tier: 1,
    gamePlusOffset: { damage: 3, apply_bleed: 1 },
  });
}

// Tentacle Whip — AoE bleed plus a party rally. Simple weapon so the
// Tentacle Whip equipper doesn't need martial proficiency; both
// effects fire for the recharge cost.
export function createTentacleWhip() {
  return new Card({
    id: 'tentacle_whip',
    name: 'Tentacle Whip',
    // Digits removed from the description so the card reads cleaner.
    // Effect values stay at 1 base + offset (apply_bleed_all: 1,
    // buff_allies_heroism: 1) — the ccgQuest+ rewriter only patches
    // numeric tokens it finds, so a digitless description stays put
    // while the underlying values still scale at runtime.
    description: 'Deal Bleed to all enemies.\nAllies gain Heroism.',
    shortDesc: 'Bleed All\nAllies +Heroism',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_bleed_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 1,
    gamePlusOffset: { apply_bleed_all: 1, buff_allies_heroism: 1 },
  });
}

// Sailor's Lucky Compass — passive relic, can NOT be played manually.
// Every time it's drawn (start of combat, mid-turn draw, end-of-turn
// refill) the player gains 1 Heroism.
export function createSailorsLuckyCompass() {
  return new Card({
    id: 'sailors_lucky_compass',
    name: "Sailor's Lucky Compass",
    description: 'On Draw: Gain 1-3 Heroism.',
    shortDesc: 'On Draw:\n+1-3 Heroism',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    // value here = upper bound of the random roll. Handler rolls 1..value.
    effects: [new CardEffect('on_draw_heroism_random', 3, TargetType.SELF)],
    rarity: 'epic',
    tier: 1,
    unplayable: true,
    // +1 to the upper bound per offset (1-3 → 1-4 → 1-5).
    gamePlusOffset: { on_draw_heroism_random: 1 },
  });
}

// === Ore loot (Tharnag tunnels supply) ===
// Unplayable — they sit in the deck as recharge fodder only ("can use
// them as recharge but that's it"). Copper / Silver / Gold sell for FULL
// value at a weaponsmith or armorsmith (the ORE sell handling in
// main.js); Mithril is too valuable to sell. All Tier 2. `subtype: 'ore'`
// keeps them out of the gear deck-limit categories.
export function createCopperOre() {
  return new Card({
    id: 'copper_ore', name: 'Copper Ore',
    description: 'Raw copper ore. Sells for full value at a\nweaponsmith or armorsmith.',
    shortDesc: 'Sell full:\nsmith shop',
    subtype: 'ore', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [], rarity: 'common', tier: 2, unplayable: true, sellable: true,
  });
}
export function createSilverOre() {
  return new Card({
    id: 'silver_ore', name: 'Silver Ore',
    description: 'Raw silver ore. Sells for full value at a\nweaponsmith or armorsmith.',
    shortDesc: 'Sell full:\nsmith shop',
    subtype: 'ore', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [], rarity: 'uncommon', tier: 2, unplayable: true, sellable: true,
  });
}
export function createGoldOre() {
  return new Card({
    id: 'gold_ore', name: 'Gold Ore',
    description: 'Raw gold ore. Sells for full value at a\nweaponsmith or armorsmith.',
    shortDesc: 'Sell full:\nsmith shop',
    subtype: 'ore', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [], rarity: 'rare', tier: 2, unplayable: true, sellable: true,
  });
}
export function createMithrilOre() {
  return new Card({
    id: 'mithril_ore', name: 'Mithril Ore',
    description: 'Raw mithril ore — too valuable to sell.',
    shortDesc: "Can't sell",
    subtype: 'ore', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [], rarity: 'epic', tier: 2, unplayable: true,
  });
}

export function createAdamantineOre() {
  return new Card({
    id: 'adamantine_ore', name: 'Adamantine Ore',
    description: 'Dense adamantine, veined with Underdark magic — too valuable to sell.',
    shortDesc: "Can't sell",
    subtype: 'ore', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [], rarity: 'epic', tier: 2, unplayable: true,
  });
}

// ============================================================
// The Assassin (Khydhani) drop loot — Part 2. Killing the drow
// assassin at the Great Forge drops exactly one of these (100%),
// picked by weight. See LOOT_TABLES.khydhani_loot in main.js.
// ============================================================

// Drow Parrying Dagger — Tier 2 Rare simple weapon. Dual-mode like the
// Old Spectral Hand: a free, stays-in-hand 3-damage poke as the attack,
// or a reactive parry (Block 3, lash a random foe for 3, cycle a card)
// as the defense.
export function createDrowParryingDagger() {
  return new Card({
    id: 'drow_parrying_dagger', name: 'Drow Parrying Dagger',
    // "Stays in hand" on its own line so it renders as the inline pill
    // cleanly (mid-damage-line it crowded "Deal 3"). No Atk:/Def: labels.
    description: 'Deal 3.\nStays in hand\nBlock 3, Deal 3 Randomly, Draw',
    shortDesc: '3, Stays\nBlock 3, 3 Rand, Draw',
    subtype: 'simple',
    cardType: CardType.ATTACK, costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    modes: [
      new CardMode('Block 3, Deal 3 Randomly, Draw', [
        new CardEffect('block', 3, TargetType.SELF),
        new CardEffect('damage_random', 3, TargetType.RANDOM_ENEMY),
        new CardEffect('draw', 1, TargetType.SELF),
      ]),
    ],
    tier: 2, rarity: 'rare',
    gamePlusOffset: { damage: 1, modes: [{ block: 1, damage_random: 1 }] },
  });
}

// Adamantine Rapier — Tier 2 Rare martial weapon. Deal 6, and if THIS
// card is your first attack of the turn, +4 (First Strike — distinct
// from the bracer's passive "First Attack" which buffs whatever swings
// first; first_strike_attack only fires when the rapier itself leads).
// When it lands in the recharge pile it banks 1 Heroism for your next
// swing.
export function createAdamantineRapier() {
  return new Card({
    id: 'adamantine_rapier', name: 'Adamantine Rapier',
    // "First Strike" and "On Recharge" both auto-render as pills. Drop
    // the "1" — when it's a single Heroism we don't spell the count out.
    description: 'Deal 6 First Strike: +4\nOn Recharge: Heroism',
    shortDesc: '6, First Strike +4\nOnRech: Heroism',
    subtype: 'martial',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      // value = base 6; maxTargets carries the +4 First Strike bonus.
      new CardEffect('first_strike_attack', 6, TargetType.SINGLE_ENEMY, 4),
      new CardEffect('on_recharge_heroism', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'rare',
    gamePlusOffset: { first_strike_attack: 2 },
  });
}

// Adamantine Chain Shirt — Tier 2 Rare light armor. Boarhide Bracers'
// shape scaled up: Block 6, +2 Heroism, Draw on defense, and banks +1
// Heroism whenever it recharges.
export function createAdamantineChainShirt() {
  return new Card({
    id: 'adamantine_chain_shirt', name: 'Adamantine Chain Shirt',
    description: 'Block 6, 2 Heroism, Draw\nOn Recharge: Heroism',
    shortDesc: 'Block 6, 2 Heroism, Draw\nOnRech: Heroism',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 6, TargetType.SELF),
      new CardEffect('gain_heroism', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_recharge_heroism', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'rare',
    gamePlusOffset: { block: 2, gain_heroism: 1 },
  });
}

// Shield of Last Hope — Tier 2 Rare light armor (Guildmaster reward). A panic
// button: Gain 4 Shield, plus a scaling heal by how hurt you are. Bruised
// (lost 25%+ HP) heals 4; Bloodied (half HP or less) heals another 4 on top,
// so a Bloodied character heals 8 total, a Bruised-but-not-Bloodied one 4, and
// above 75% HP it's just the shield. The bloodied_heal is listed first so it
// resolves before bruised_heal (see the bruised_heal case in main.js).
export function createShieldOfLastHope() {
  return new Card({
    id: 'shield_of_last_hope', name: 'Shield of Last Hope',
    description: 'Gain 4 Shield.\nBruised: Heal 4.\nBloodied: Heal 4.',
    // shortDesc drops the "Heal" word so each pill + number fits ONE row on the
    // 96px inventory card (a full "[BLOODIED] Heal 4" line wraps and overflows
    // the 3-line box). The full description above keeps the readable wording.
    shortDesc: '+4 Shield\nBruised: 4\nBloodied: 4',
    subtype: 'light_armor',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 4, TargetType.SELF),
      new CardEffect('bloodied_heal', 4, TargetType.SELF),
      new CardEffect('bruised_heal', 4, TargetType.SELF),
    ],
    tier: 2, rarity: 'rare',
    gamePlusOffset: { gain_shield: 1, bloodied_heal: 2, bruised_heal: 2 },
  });
}

// Symbol of Last Hope — Tier 2 Rare relic (the other half of the Guildmaster
// reward pick). FREE and stays in hand, so once per turn you Heal 2 — plus a
// step-up by how hurt you are: Bruised (lost 25%+ HP) heals 2 more, and
// Bloodied (half HP or less) heals another 2 on top. So a healthy character
// heals 2, a Bruised one 4, and a Bloodied one 6. A slow, reliable sustain
// engine, the counterpart to the Shield's burst. The bloodied_heal is listed
// before bruised_heal so it resolves first (see the bruised_heal case).
export function createSymbolOfLastHope() {
  return new Card({
    id: 'symbol_of_last_hope', name: 'Symbol of Last Hope',
    description: 'Heal 2.\nBruised: Heal 2.\nBloodied: Heal 2.\nStays in hand.',
    // Compact shortDesc: base heal + "Stays" fold onto row 1, the two pill
    // conditionals drop the "Heal" word so each fits one row — keeps the whole
    // card to 3 lines on the 96px inventory card. Full wording is above.
    shortDesc: 'Heal 2, Stays\nBruised: 2\nBloodied: 2',
    subtype: 'relic',
    cardType: CardType.RELIC, costType: CostType.FREE,
    effects: [
      new CardEffect('heal', 2, TargetType.SELF),
      new CardEffect('bloodied_heal', 2, TargetType.SELF),
      new CardEffect('bruised_heal', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    tier: 2, rarity: 'rare',
    gamePlusOffset: { heal: 1, bloodied_heal: 2, bruised_heal: 2 },
  });
}

// Darkwood Hand Crossbow — Tier 2 Rare simple weapon. 2 True Damage
// (unpreventable) plus Poison equal to the damage dealt. True damage
// always lands in full, so the Poison rider matches it 1:1.
export function createDarkwoodHandCrossbow() {
  return new Card({
    id: 'darkwood_hand_crossbow', name: 'Darkwood Hand Crossbow',
    description: 'Deal 2 True Damage.\n+Poison equal to damage dealt.',
    shortDesc: '2 True Dmg\n+Poison = dmg',
    subtype: 'simple',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      // True Damage folds in Heroism / Rage / first-attack perks; the
      // rider then drips Poison equal to whatever actually landed.
      new CardEffect('unpreventable_damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison_per_damage', 0, TargetType.SINGLE_ENEMY),
    ],
    tier: 2, rarity: 'rare',
    gamePlusOffset: { unpreventable_damage: 1 },
  });
}

// Piwafwi — Tier 2 Epic clothing (the drow's spider-silk cloak).
// While it sits in the player's HAND, enemies weight the player at HALF
// when picking a swing target (see pickEnemyAttackTarget / playerHasPiwafwi).
// Defense: Block 3, +3 Shield, Scry 3.
export function createPiwafwi() {
  return new Card({
    id: 'piwafwi', name: 'Piwafwi',
    description: 'Enemies target you less.\nBlock 3, Gain 3 Shield, Scry 3',
    shortDesc: 'Foes target you less\nBlock 3, +3 Shield, Scry 3',
    subtype: 'clothing',
    cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('gain_shield', 3, TargetType.SELF),
      new CardEffect('scry_pick', 3, TargetType.SELF),
    ],
    tier: 2, rarity: 'epic',
    gamePlusOffset: { block: 1, gain_shield: 1, scry_pick: 1 },
  });
}

// Drow Sleep Poison — Tier 2 Uncommon item. Consume to coat your next
// swing: it applies 1 Drow Sleep Poison (a Poison variant that ticks
// like Poison, is healed dead-last, and saps 1 attack damage per stack).
// Mirrors Vial of Poison's grant-buff → consume-on-next-attack flow.
export function createDrowSleepPoison() {
  return new Card({
    id: 'drow_sleep_poison', name: 'Drow Sleep Poison',
    // "DrowPoison" is a keyword token that renders as the washed Drow
    // Sleep Poison icon (NOT the green Poison icon).
    description: 'Consume -> Next attack applies 1 DrowPoison',
    shortDesc: 'C->Next:\n+1 DrowPoison',
    subtype: 'item',
    cardType: CardType.ITEM, costType: CostType.BANISH,
    effects: [new CardEffect('grant_drow_sleep_buff', 1, TargetType.SELF)],
    // No class restriction — the Assassin drops it for any class, so any
    // class can uncork it. Sellable so it's never dead loot.
    tier: 2, rarity: 'uncommon',
    sellable: true,
    gamePlusOffset: { grant_drow_sleep_buff: 0.5 },
  });
}

// Enemy-only Drow Sleep Poison — the Assassin's version. Unlike the
// player's consumable (BANISH), the monster's vial RECHARGES like any
// other card and is an ABILITY (so the enemy planner queues it as a
// utility play, not an attack). Playing it buffs his NEXT swing with an
// extra Drow Sleep Poison stack (consumed via consumePoisonBuff). Not in
// CARD_REGISTRY — enemy-only, surfaced in the codex via the Assassin deck.
export function createDrowSleepPoisonEnemy() {
  return new Card({
    id: 'drow_sleep_poison_enemy', name: 'Drow Sleep Poison',
    description: 'Next attack applies 1 DrowPoison',
    shortDesc: 'Next: +1\nDrowPoison',
    subtype: 'item',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [new CardEffect('grant_drow_sleep_buff', 1, TargetType.SELF)],
    tier: 2, rarity: 'uncommon',
    noTierOffset: true,
  });
}

// Kraken's Eye Spyglass — item that lets you sculpt your discard pile.
// Peek the top 3 of discard, pick 1 into hand, the unpicked cards
// stay in the discard pile (don't move to recharge).
export function createKrakensEyeSpyglass() {
  return new Card({
    id: 'krakens_eye_spyglass',
    name: "Kraken's Eye Spyglass",
    description: 'Recharge ->\nScry 3 from your discard pile.',
    shortDesc: 'R->Scry 3\nfrom discard',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('scry_pick_discard', 3, TargetType.SELF)],
    rarity: 'epic',
    tier: 1,
    gamePlusOffset: { scry_pick_discard: 1 },
  });
}

// Barnacle-Covered Buckler — light armor with shield generation, a
// Barnacle token spawn (1..N banish-heal token, mirrors Sahuagin Baron's
// Plate), First Shield: Draw, and an on-swim draw rider.
export function createBarnacleCoveredBuckler() {
  return new Card({
    id: 'barnacle_covered_buckler',
    name: 'Barnacle-Covered Buckler',
    description: 'Gain 2 Shield. Create 1 Barnacle.\nFirst Shield, On Swim: Draw.',
    shortDesc: '+2 Shield\n+1 Barnacle\n1st/Swim: Draw',
    subtype: 'light_armor',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('create_barnacle', 1, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
      new CardEffect('on_swim_recharge_draw', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 1,
    // Side preview of the Barnacle token the create_barnacle effect
    // drops into hand — same pattern as Barnacle-Encrusted Plate.
    previewCard: createBarnacle(),
    // +3 shield, +0.5 barnacle (floor) per offset.
    gamePlusOffset: { gain_shield: 3, create_barnacle: 0.5 },
  });
}

// ============================================================
// Harpy enemy deck (shipwreck_deck "Harpies" boss).
// ============================================================

// Harpy summon — 2/6 creature spawned at fight start. On death:
// every enemy discards their hand OR takes 5 damage. Wired via the
// onDeathDiscardOrDamage field; the handler lives in main.js.
export function createHarpyCreature() {
  return new Creature({
    name: 'Harpy', attack: 2, maxHp: 6,
    onDeathDiscardOrDamage: 5,
    description: 'On Death: Enemies discard their hand, or take 5 damage if empty.',
  });
}

// Luring Song — Harpy boss spell. For every enemy: lose 1 random
// hand card OR take 1 damage if the hand is empty. Ally creatures
// have no hand, so the rider always lands as damage on them.
export function createLuringSong() {
  return new Card({
    id: 'luring_song',
    name: 'Luring Song',
    description: 'Recharge ->\nEnemies lose 1 random card\nor take 1 damage.',
    shortDesc: 'R->Lose Card\nOR 1 Dmg',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('luring_song', 1, TargetType.ALL_ENEMIES),
    ],
    noTierOffset: true, // stays flat across ccgQuest+
  });
}

// Zhost's Buckler — drops as boss loot. Light armor that hits for
// 2 damage + 1 Ice, grants 2 Shields, and pulls a card if the player
// has built up at least 2 Shields by the end of the play.
export function createZhostsBuckler() {
  return new Card({
    id: 'zhosts_buckler',
    name: "Zhost's Buckler",
    description: 'Deal 1 Damage + Ice.\nGain 2 Shields.\nFirst Shield: Draw.',
    shortDesc: '1 Dmg + Ice\n+2 Shield\n1st Shield: Draw',
    subtype: 'light_armor',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
    ],
    rarity: 'rare',
    // apply_ice intentionally omitted from offset — the description
    // reads "+ Ice" (no number), so a swapInDescription bump would
    // either no-match (fine) OR clobber the unrelated "1" in "Deal 1
    // Damage" via the fallback word-boundary swap. Keeping the Ice at
    // 1 forever sidesteps that trap; damage and shield still scale.
    gamePlusOffset: { damage: 1, gain_shield: 1 },
  });
}

export function createLuckyPebble() {
  return new Card({
    id: 'lucky_pebble',
    name: 'Lucky Pebble',
    description: 'On Discard: Draw 1.',
    shortDesc: 'On Discard:\nDraw 1',
    subtype: 'relic',
    cardType: CardType.RELIC,
    // Plays for free (Recharge cost = no effect when played, just goes into
    // the recharge pile). The "On Discard" trigger fires only when the card
    // is discarded passively (deck damage, hand-discard effects, etc.) —
    // see Character.takeDamageFromDeck for the hook.
    costType: CostType.RECHARGE,
    effects: [new CardEffect('on_discard_draw', 1, TargetType.SELF)],
    rarity: 'rare',
    // +1/3 draw per offset — at offset 3 the pebble draws 2 on discard.
    gamePlusOffset: { on_discard_draw: 1/3 },
  });
}

// Boar Tusk — Rare tier-1 relic. Grants Regen 2 whenever it's discarded
// (passive deck damage). On the Giant Boar's own deck, a hit that discards
// a Tusk stacks Regen so the boar heals over its coming turns, then the
// Regen decays (see on_discard_regen in Character.takeDamageFromDeck).
export function createBoarTusk() {
  return new Card({
    id: 'boar_tusk',
    name: 'Boar Tusk',
    description: 'On Discard: Regen 2.',
    shortDesc: 'On Discard:\nRegen 2',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('on_discard_regen', 2, TargetType.SELF)],
    tier: 1,
    rarity: 'epic',
    gamePlusOffset: { on_discard_regen: 1 },
  });
}

// === Giant Boar loot (armorer's-son quest) ===

// Boarhide Bracers — Rare Tier-1 Light Armor. Played reactively as a Defense
// card (Block 2 + 2 Heroism + Draw), AND a passive while it sits in hand: the
// FIRST attack of your turn hits for +2. The passive is handled in
// getDamageModifier (main.js), which checks the hand for this card on the
// first swing (attacksThisTurn === 0) — so no per-card effect is needed and
// it naturally fires once per turn.
export function createBoarhideBracers() {
  return new Card({
    id: 'boarhide_bracers',
    name: 'Boarhide Bracers',
    description: 'First Attack: +2.\nDefense: Block 2, 2 Heroism, Draw.',
    shortDesc: 'First Atk: +2\nDef: Block 2, 2 Heroism, Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_heroism', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 1,
    rarity: 'rare',
    gamePlusOffset: { block: 2, gain_heroism: 1 },
  });
}

// Frenzy Blood Vial — Uncommon Tier-1 Item / Beverage. Consume to gain the
// Bloodied Fury buff (same as the Giant Boar): while at half HP or less, gain
// +2 Rage each turn. Persists across combats until the next rest. Handled via
// the grant_bloodied_frenzy effect + the player-turn-start check in main.js;
// the Bloodied buff reuses GiantBoar art.
export function createFrenzyBloodVial() {
  return new Card({
    id: 'frenzy_blood_vial',
    name: 'Frenzy Blood Vial',
    description: 'Consume. Beverage: Bloodied: +2 Rage.',
    shortDesc: 'Consume\nBloodied: +2 Rage',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('grant_bloodied_frenzy', 2, TargetType.SELF),
    ],
    tier: 1,
    rarity: 'uncommon',
  });
}

// Boarhide Bandage — Uncommon Tier-1 Item. A field dressing: Heal 2 and apply
// Regen 2 (heal-over-time), then the card is discarded.
export function createBoarhideBandage() {
  return new Card({
    id: 'boarhide_bandage',
    name: 'Boarhide Bandage',
    description: 'Heal 2, Regen 2. Discard.',
    shortDesc: 'Heal 2, Regen 2\nDiscard',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    // SINGLE_ALLY — same as Bandages: the player picks self or an ally
    // creature to patch up. On the player the Regen lands as the usual REGEN
    // status; on an ally creature (no status system) it routes through the
    // regenBuffs heal-over-time channel as a decaying Regen (see apply_regen).
    effects: [
      new CardEffect('heal', 2, TargetType.SINGLE_ALLY),
      new CardEffect('apply_regen', 2, TargetType.SINGLE_ALLY),
    ],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { heal: 1, apply_regen: 1 },
  });
}

// === Buff Pseudo-Cards ===
// Codex-only entries showing each CombatBuff granted by a source card or
// encounter choice. Match Python's image_id (which reuses the source-card
// art) and description text. Never placed in a deck — purely informational.
export function createBuffVialOfPoison() {
  return new Card({
    id: 'buff_vial_of_poison',
    name: 'Vial of Poison',
    description: 'Next attack also applies Poison.',
    shortDesc: 'Next attack:\n+Poison',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    // Scales via the source Vial of Poison item (+0.5 Poison/offset).
    // Empty opt-in suppresses the codex red badge.
    gamePlusOffset: {},
  });
}
export function createBuffSlimeJar() {
  return new Card({
    id: 'buff_slime_jar',
    name: 'Slime Jar',
    description: 'Next weapon attack is Unpreventable.',
    shortDesc: 'Next attack:\nUnpreventable',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    // Slime Jar item scales charges, not the unpreventable bonus.
    noTierOffset: true,
  });
}
export function createBuffScrollOfPotency() {
  return new Card({
    id: 'buff_scroll_of_potency',
    name: 'Scroll of Potency',
    description: 'Start of Turn: +1 Heroism',
    shortDesc: '+1 Heroism/turn',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    // Buff tick scales +1 Heroism per offset via the runtime handler.
    gamePlusOffset: {},
  });
}
export function createBuffAle() {
  return new Card({
    id: 'buff_ale',
    name: 'Ale',
    description: 'Start of Turn: +1 Heroism',
    shortDesc: '+1 Heroism/turn',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    noTierOffset: true,
  });
}
export function createBuffDwarvenBrew() {
  return new Card({
    id: 'buff_dwarven_brew',
    name: 'Dwarven Brew',
    description: 'Start of Turn: +Shield',
    shortDesc: '+Shield/turn',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    noTierOffset: true,
  });
}
// Deep River Water — Beverage granted by drinking at the Quiet Pool (the
// untainted river near the Bottomless Lake). Heals 1 each turn for 3 turns;
// if the heal would overheal (already at full HP), draws instead.
export function createBuffDeepRiverWater() {
  return new Card({
    id: 'buff_deep_river_water',
    name: 'Deep River Water',
    description: 'Start of Turn: Heal 1.\nOverheal: Draw.',
    shortDesc: 'Heal 1/turn\nOverheal: Draw',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    noTierOffset: true,
  });
}
export function createBuffRegrowth() {
  return new Card({
    id: 'buff_regrowth',
    name: 'Regrowth',
    description: 'Turn Start: Heal 1.\nOverheal: Summon a Treant.',
    shortDesc: 'Heal 1/turn\nOverheal: Treant',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    // Side preview of the Treant the overheal can summon (codex + hover).
    previewCreature: createTreantCreature(),
    // Buff tick scales +1 Heal per offset via the heal_overheal_treant handler.
    gamePlusOffset: {},
  });
}

// Legacy Regrowth buff — the old flat "Start of Turn: Heal 1" version,
// kept as a legacy codex entry (LEGACY_CARD_IDS) after the overheal→
// Treant rework above replaced it.
export function createBuffRegrowthLegacy() {
  return new Card({
    id: 'buff_regrowth_legacy',
    name: 'Regrowth',
    description: 'Start of Turn: Heal 1',
    shortDesc: 'Heal 1/turn',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
    gamePlusOffset: {},
  });
}

// === Encounter Buff Cards ===
// Pseudo-cards rendered as `Buff` codex entries. They aren't placed in any
// deck; they describe a CombatBuff granted by an encounter choice and let
// the player browse the buff card art / description in the codex.
export function createBuffElfReinforcements() {
  return new Card({
    id: 'buff_elf_reinforcements',
    name: 'Elf Reinforcements',
    description: 'Start of Turn: Summon 1 Elf Warrior.',
    shortDesc: '+1 Elf/turn',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    noTierOffset: true,
  });
}
export function createBuffBlizzard() {
  // Wolf Pack fight debuff: every turn the player + every alive ally
  // takes one Ice stack. Pseudo-card so the buff appears in the codex.
  return new Card({
    id: 'buff_blizzard',
    name: 'Blizzard',
    description: 'Start of Turn: You and allies get Ice.',
    shortDesc: 'Ice/turn',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    // Per-tick Ice scales +0.5 per monster offset in the Wolf Pack
    // fight setup (handler reads monsterTierOffset).
    gamePlusOffset: {},
  });
}

export function createBuffSahuaginEye() {
  // Granted by the Sahuagin Eye relic. Consumed on any attack — adds
  // +1 damage when the target is already wounded.
  return new Card({
    id: 'buff_sahuagin_eye',
    name: 'Sahuagin Eye',
    description: 'Next Attack: +1 damage if target is damaged.',
    shortDesc: 'Next Attack +1\nif damaged',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    // Bonus scales +0.5 per offset via the source relic.
    gamePlusOffset: {},
  });
}
export function createBuffVolcanoBlessing() {
  // Granted by sacrificing gear at the Heart of the Volcano. Each
  // sacrifice picks the per-turn effect (weapon→Heroism, armor→Shield,
  // item→Heal, relic→Draw) and the duration in turns (tier × rarity).
  // Active only in volcano-area combats.
  return new Card({
    id: 'buff_volcano_blessing',
    name: "Volcano's Blessing",
    description: 'Turn Start: Gain 1 of a buff per turn for N turns in volcano combats. Effect & duration depend on what you sacrificed.',
    shortDesc: 'Volcano combats:\n+1 buff/turn (N turns)',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    rarity: 'rare',
    // Special encounter-bound buff — duration / effect depend on the
    // sacrifice, not on tier offset.
    noTierOffset: true,
  });
}

export function createBuffMapKnowledge() {
  // Granted by copying the map at the Map Table (Map Room). Display-
  // only — the actual −2% encounter-step lookup reads mapTableCopied
  // directly in dwarvenCityEncounterStep / undergroundEncounterStep.
  return new Card({
    id: 'buff_map_knowledge',
    name: 'Map Knowledge',
    description: 'Reduced random encounters across the volcano city and underground.',
    shortDesc: 'Reduced random\nencounters',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    rarity: 'uncommon',
    noTierOffset: true,
  });
}

export function createBuffMagmaTablet() {
  // Granted by playing Magma Tablet. Persists for N turns; each
  // start-of-turn tick grants +1 Ignite, with a Burning rider that
  // adds +1 more Ignite and Draw 1. Codex preview only — the actual
  // ticking lives in character.processCombatBuffs.
  return new Card({
    id: 'buff_magma_tablet',
    name: 'Magma Tablet',
    description: 'Turn Start: +1 Ignite.\nBurning: +1 Ignite and Draw.',
    shortDesc: '+Ignite/turn\nBurning: +Ignite, Draw',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    rarity: 'uncommon',
    noTierOffset: true,
  });
}

export function createBuffObsidianCore() {
  // Granted by playing the Obsidian Core relic. Consumed on the next
  // attack — adds +2 damage when the target has Armor or Shield.
  return new Card({
    id: 'buff_obsidian_core',
    name: 'Obsidian Core',
    description: 'Next Attack: +2 damage vs Armor/Shield.',
    shortDesc: 'Next Attack +2\nvs Armor/Shield',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    // Bonus scales +2 per offset via the source relic.
    gamePlusOffset: {},
  });
}
export function createBuffOldGodBlessing() {
  // Granted by praying at the Old God Statue. Permanent — projects
  // into combat as a fresh CombatBuff at the start of every Sahuagin
  // fight (Sentinel / Priest / Baron). Every attack against a
  // wounded Sahuagin gets +1. The "Vs Sahuagin" prefix renders as a
  // sea-green pill via the inline badge tokenizer.
  return new Card({
    id: 'buff_old_god_blessing',
    name: "Old God's Blessing",
    description: 'Vs Sahuagin: +1 Damage vs damaged.',
    shortDesc: 'Vs Sahuagin\n+1 vs damaged',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    rarity: 'rare',
    noTierOffset: true,
  });
}
// Bloodied Frenzy — granted by consuming the Frenzy Blood Vial. Permanent
// (until rest); projects into every combat. While the player is Bloodied
// (half HP or less) they gain +2 Rage each turn — the Giant Boar's signature
// passive, turned on the player. Reuses the boar portrait.
export function createBuffBloodiedFrenzy() {
  return new Card({
    id: 'buff_bloodied_frenzy',
    name: 'Bloodied Frenzy',
    description: 'While Bloodied: +2 Rage.',
    shortDesc: 'While Bloodied\n+2 Rage',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    rarity: 'uncommon',
    noTierOffset: true,
  });
}
export function createBuffRunning() {
  return new Card({
    id: 'buff_running',
    name: 'Running',
    description: 'Start of Turn: Draw 1',
    shortDesc: 'Draw 1/turn',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    noTierOffset: true,
  });
}
export function createBuffHiding() {
  return new Card({
    id: 'buff_hiding',
    name: 'Hiding',
    description: 'Start of Turn: +Shield',
    shortDesc: '+Shield/turn',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    noTierOffset: true,
  });
}
export function createBuffCalculating() {
  return new Card({
    id: 'buff_calculating',
    name: 'Calculating',
    description: 'Start of Turn: +1 Heroism',
    shortDesc: '+1 Heroism/turn',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    noTierOffset: true,
  });
}

// Stone Giant boulder card — randomized payload. 50% chance: 2-4 Small
// Boulders (2/2, self-destruct, Sharp Rock art). 50% chance: 1 Large
// Boulder (6/4/1-armor self-destruct) PLUS another 50% to add a Small
// Boulder alongside. Played as a CREATURE summon (priority 10 so it
// lands before any Rock Barrage swings).
export function createLargeBoulder() {
  return new Card({
    id: 'large_boulder',
    name: 'Boulder',
    description: 'Recharge -> Boulder(s) rolling down the mountain!',
    shortDesc: 'R->Summon\nBoulder(s)',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_boulders_random', 1, TargetType.SUMMON)],
    priority: 10,
    previewCreatures: [
      new Creature({
        name: 'Large Boulder', attack: 6, maxHp: 4, armor: 1, selfDestruct: true,
        description: 'Self-Destruct: explodes after attacking.',
      }),
      new Creature({
        name: 'Small Boulder', attack: 2, maxHp: 2, selfDestruct: true,
        description: 'Self-Destruct: explodes after attacking.',
      }),
    ],
    // +0.5 extra boulder per offset (floor — so the first +1
    // shows up at offset 2). Runtime reads
    // monsterTierOffset to bump both branches of the random
    // summon roll. Per-creature stat bumps come from
    // CREATURE_TIER_OFFSET (Small Boulder +1/+1, Large Boulder
    // +2/+2 +1 armor).
    gamePlusOffset: { summon_boulders_random: 0.5 },
  });
}

// ============================================================
// Shop Cards - General Store
// ============================================================

export function createTravelRations() {
  return new Card({
    id: 'travel_rations',
    name: 'Travel Rations',
    description: 'Consume + Recharge 2 -> Heal 4, Draw.\nMeal: Heal 1 for 3 turns.',
    shortDesc: 'C+R2->Heal 4, Draw\nMeal: Heal 1/3T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 4, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 2, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Travel Rations',
      effectType: 'heal',
      value: 1,
      turnsPerCombat: 3,
      description: 'Heal 1 each turn for 3 turns (each combat, until rest)',
    },
    rarity: 'uncommon',
    // +1 Consume heal per offset + +1 Meal heal (only the heal arm
    // of the random_pick scales; the draw arm stays at 1).
    // applyGamePlusOffsetInPlace bumps the random_pick option via a
    // custom branch below.
    gamePlusOffset: { heal: 1 },
  });
}

export function createBandages() {
  return new Card({
    id: 'bandages',
    name: 'Bandages',
    description: 'Heal 4. Discard.',
    shortDesc: 'Heal 4, D',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    // SINGLE_ALLY — player picks a target ally creature (or self)
    // for the patch-up. Same change as Scraps.
    effects: [new CardEffect('heal', 4, TargetType.SINGLE_ALLY)],
    rarity: 'uncommon',
    gamePlusOffset: { heal: 3 },
  });
}

// Cured Bandage — common Tier 2 patch-up that also strips an Ailment
// off the target. Same Discard cost + SINGLE_ALLY targeting as
// Bandages so it slots in cleanly alongside it (Mithril Remedies
// stocks both).
export function createCuredBandage() {
  return new Card({
    id: 'cured_bandage',
    name: 'Cured Bandage',
    description: 'Heal 1 Ailment, Heal 4. Discard.',
    shortDesc: '1 Ail+Heal 4, D',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('heal_n_negative_effects', 1, TargetType.SINGLE_ALLY),
      new CardEffect('heal', 4, TargetType.SINGLE_ALLY),
    ],
    rarity: 'common',
    tier: 2,
    gamePlusOffset: { heal: 2 },
  });
}

export function createTravelersClothing() {
  return new Card({
    id: 'travelers_clothing',
    name: "Traveler's Clothing",
    description: 'Block 2, Scry 3.',
    shortDesc: 'Block 2, Scry 3',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('scry_pick', 3, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 1,
    gamePlusOffset: { block: 1, scry_pick: 1 },
  });
}

export function createSack() {
  return new Card({
    id: 'sack',
    name: 'Sack',
    description: 'Scout 3. Stays in hand.',
    shortDesc: 'Scout 3\nStays',
    subtype: 'item',
    cardType: CardType.ITEM,
    // FREE cost — never leaves the hand (see Small Pouch / Kobold Shield).
    costType: CostType.FREE,
    effects: [
      new CardEffect('scout', 3, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { scout: 1 },
  });
}

// ============================================================
// Shop Cards - Weaponsmith
// ============================================================

export function createSteelAxe() {
  return new Card({
    id: 'steel_axe',
    name: 'Steel Axe',
    description: 'Deal 3 Damage to 2 targets.',
    shortDesc: '3 Dmg x2',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('multi_damage', 3, TargetType.SINGLE_ENEMY, 2)],
    rarity: 'uncommon',
    gamePlusOffset: { multi_damage: 2 },
  });
}

export function createSteelMace() {
  return new Card({
    id: 'steel_mace',
    name: 'Steel Mace',
    description: 'Deal 3 damage (+2 vs Armor/Shield).',
    shortDesc: '3 Dmg\n(+2 vs Armor/Shield)',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('armor_bonus_damage', 35, TargetType.SINGLE_ENEMY)],
    rarity: 'uncommon',
    // +3 base / +2 vs Armor-Shield per offset (3/+2 → 6/+4 → 9/+6…).
    gamePlusOffset: { armor_bonus_damage: { base: 3, bonus: 2 } },
  });
}

export function createSteelSword() {
  return new Card({
    id: 'steel_sword',
    name: 'Steel Sword',
    description: 'Deal 4 Damage.',
    shortDesc: '4 Dmg',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage', 4, TargetType.SINGLE_ENEMY)],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 4 },
  });
}

export function createSteelGreataxe() {
  return new Card({
    id: 'steel_greataxe',
    name: 'Steel Greataxe',
    description: 'Recharge a Card -> Deal 4 to 3 targets.',
    shortDesc: 'R-Card->4 Dmg\nto 3 targets',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      // 4 to primary AND 4 to up to 2 other targets (3 total) — uniform 4 to
      // 3 targets. Encoded as 44 (primary 4 / secondary 4).
      new CardEffect('split_damage', 44, TargetType.SINGLE_ENEMY, 3),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    // +2 to all targets per offset (4 → 6 → 8…), kept uniform.
    gamePlusOffset: { split_damage: { primary: 2, secondary: 2 } },
  });
}

export function createBow() {
  return new Card({
    id: 'bow',
    name: 'Bow',
    description: 'Recharge a Card -> Deal 4 damage, Draw.',
    shortDesc: 'R-Card->4 Dmg, Draw',
    subtype: 'ranged',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 3 },
  });
}

export function createSteelDagger() {
  return new Card({
    id: 'steel_dagger',
    name: 'Steel Dagger',
    description: 'Deal 2 Damage. Stays in hand.',
    shortDesc: '2 Dmg, Stays',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 1 },
  });
}

// ============================================================
// Shop Cards - Armorsmith
// ============================================================

export function createStuddedLeatherArmor() {
  return new Card({
    id: 'studded_leather_armor',
    name: 'Studded Leather',
    description: 'Block 2, Heroism, Shield, Draw.',
    shortDesc: 'Block 2, Heroism,\nShield, Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { block: 2, gain_heroism: 1, gain_shield: 0.5 },
  });
}

export function createRingMail() {
  return new Card({
    id: 'ring_mail',
    name: 'Ring Mail',
    description: 'Block 3, Gain Shield, Draw.',
    shortDesc: 'Block 3, Gain Shield\nDraw',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { block: 2, gain_shield: 1 },
  });
}

// ============================================================
// Shop Cards - Arcane Emporium
// ============================================================

// Apprentice's Spellbook — common Tier 1 scroll. Stays in hand and
// pings 1 Heroism every turn. Wizard starter pool + Abandoned Camp
// salvage + Prison Gear Barrel + Arcane Emporium.
export function createApprenticesSpellbook() {
  return new Card({
    id: 'apprentices_spellbook',
    name: "Apprentice's Spellbook",
    description: 'Gain Heroism.\nStays in hand.',
    shortDesc: 'Gain Heroism\nStays',
    subtype: 'scroll',
    cardType: CardType.ITEM,
    // FREE — same shape as the other stays-in-hand cards (Wand of
    // Fire, Bone Dagger). The card never leaves the hand, so the
    // costType is moot for placement; FREE keeps the math honest
    // (each turn pings 1 Heroism, no extra cost).
    costType: CostType.FREE,
    effects: [
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 1,
    gamePlusOffset: { gain_heroism: 1 },
  });
}

// Quiver — Tier 1 uncommon, and the first card of its own `quiver` subtype.
// Unplayable: its only use is as another card's recharge cost, which is a fine
// deal for an archer (bows are RECHARGE-cost, so you pay one nearly every turn)
// and deliberately a poor one for anyone else.
//
// The conditional second Heroism is what keeps it honest. Fed to a greataxe it
// gives 1 — Apprentice's Spellbook parity, except the Spellbook stays in hand
// and this doesn't, so there's no reason for a 2-hander build to want it. Fed
// to a bow it gives 2, which is the "slightly better than the Spellbook per
// use, but one-shot" trade it's priced for. Both stacks land BEFORE the card
// they paid for resolves, so the bow fires with them already up.
//
// Class access is gated on RANGED proficiency rather than a hand-maintained
// list — see the `quiver` branch of canClassEquip. Ranger, Rogue, Warrior.
export function createQuiver() {
  return new Card({
    id: 'quiver',
    name: 'Quiver',
    description: 'On Recharge: Gain Heroism.\nRanged: Gain Heroism.',
    shortDesc: 'On Recharge:\n+Heroism\nRanged: +Heroism',
    subtype: 'quiver',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('on_recharge_heroism', 1, TargetType.SELF),
      new CardEffect('on_recharge_heroism_ranged', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 1,
    unplayable: true,
    // The description states its stacks as bare keywords (house style for a
    // single stack), so there is no number in the text for the NG+ rewriter to
    // find — scaling the effect would silently desync the card face from what
    // it does. Opt out rather than lie.
    noTierOffset: true,
  });
}

export function createScrollOfPotency() {
  return new Card({
    id: 'scroll_of_potency',
    name: 'Scroll of Potency',
    description: 'Discard -> Gain 3 Heroism and 1 Heroism for 3 turns.',
    shortDesc: 'D->+3 Heroism\n+1/turn 3T',
    subtype: 'scroll',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('gain_heroism', 3, TargetType.SELF),
      new CardEffect('grant_potency_buff', 3, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { gain_heroism: 1 },
  });
}

export function createMinorHealingPotion() {
  return new Card({
    id: 'minor_healing_potion',
    name: 'Minor Healing Potion',
    description: 'Consume -> Heal 5.',
    shortDesc: 'C->Heal 5',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [new CardEffect('heal', 5, TargetType.SELF)],
    rarity: 'rare',
    gamePlusOffset: { heal: 3 },
  });
}

// Potion of Greater Healing — Tier 2 rare consumable item. Same
// Consume / heal pattern as Minor Healing Potion, just a bigger
// pop. Stocked by Olbrim's Mithril Remedies shop once the
// Stormwatcher's brazier is lit.
export function createPotionOfGreaterHealing() {
  return new Card({
    id: 'potion_of_greater_healing',
    name: 'Potion of Greater Healing',
    description: 'Consume -> Heal 9.',
    shortDesc: 'C->Heal 9',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [new CardEffect('heal', 9, TargetType.SELF)],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { heal: 4 },
  });
}

export function createWandOfFire() {
  return new Card({
    id: 'wand_of_fire',
    name: 'Wand of Fire',
    description: 'Deal Fire.\nStays in hand.',
    shortDesc: 'Fire, Stays',
    subtype: 'wand',
    cardType: CardType.ATTACK,
    // FREE — stays in hand so the wizard pings 1 Fire stack on a
    // target every turn forever. Self-application of fire on
    // ourselves is the implicit downside (Fire ticks the holder).
    costType: CostType.FREE,
    characterClass: ['wizard'],
    effects: [
      new CardEffect('apply_fire', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    // Sellable in the Arcane Emporium (wand stock) — bypasses the
    // wizard-class lock so the player can offload an unused copy.
    sellable: true,
    // +1 Fire per offset. Base description has no number ("Deal
    // Fire") — the custom wand_of_fire handler injects the scaled
    // count into the rebuilt description.
    gamePlusOffset: { apply_fire: 1 },
  });
}

export function createMimicTongue() {
  return new Card({
    id: 'mimic_tongue',
    name: 'Mimic Tongue',
    description: '1 Poison randomly, Draw.',
    shortDesc: '1 Poison rand\nDraw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_poison', 1, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 1,
    // +0.5 poison per offset (floored).
    gamePlusOffset: { apply_poison: 0.5 },
  });
}

// ============================================================
// Enemy Cards - Kobold Patrol
// ============================================================

export function createSpearThrow() {
  return new Card({
    id: 'spear_throw',
    name: 'Spear Throw',
    description: 'Recharge +1 -> Deal 3 Damage, Draw.',
    shortDesc: 'R+1->3 Dmg, Draw',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    priority: 30,
    gamePlusOffset: { damage: 2 },
  });
}

export function createIcyBreath() {
  return new Card({
    id: 'icy_breath',
    name: 'Icy Breath',
    description: 'Deal Ice, Draw.',
    shortDesc: 'Ice, Draw',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    priority: 10,
    gamePlusOffset: { apply_ice: 1 },
  });
}

export function createShieldBashEnemy() {
  return new Card({
    id: 'shield_bash_enemy',
    name: 'Shield Bash',
    description: 'Recharge -> Deal 1 Damage, Gain Shield.',
    shortDesc: 'R->1 Dmg, +Shield',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 1, TargetType.SELF),
    ],
    priority: 5,
  });
}

// ============================================================
// Loot Cards - Story Rewards
// ============================================================

export function createWhiteClaw() {
  return new Card({
    id: 'white_claw',
    name: 'The White Claw',
    description: 'Deal 4 Damage + Ice.',
    shortDesc: '4 Dmg + Ice',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'rare',
    gamePlusOffset: { damage: 3, apply_ice: 1 },
  });
}

export function createGreatclub() {
  return new Card({
    id: 'greatclub',
    name: 'Greatclub',
    description: 'Recharge a Card -> Deal 5 (+4 vs Armor/Shield).',
    shortDesc: 'R-Card->5 Dmg\n(+4 Armor)',
    subtype: 'simple_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      // armor_bonus_damage encodes base*10 + vsArmorTotal: 59 = base 5,
      // total 9 vs Armor/Shield (5 + 4 bonus).
      new CardEffect('armor_bonus_damage', 59, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    // +2 base / +2 vs Armor-Shield per offset (4/+4 → 6/+6 → 8/+8…).
    gamePlusOffset: { armor_bonus_damage: { base: 2, bonus: 2 } },
  });
}

export function createQuarterstaff() {
  return new Card({
    id: 'quarterstaff',
    name: 'Quarterstaff',
    description: 'Recharge a Card -> Deal 5. Gain 2 Shields.',
    shortDesc: 'R-Card->5 Dmg\nGain 2 Shields',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 2, gain_shield: 1 },
  });
}

export function createAle() {
  return new Card({
    id: 'ale',
    name: 'Ale',
    description: 'Consume -> Heal 1, Gain 1 Heroism.\nBeverage: +Heroism for 2 turns.',
    shortDesc: 'C->Heal 1, +1 Heroism\nBeverage: +Heroism/2T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 1, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      // grant_provision reads `provision` below — drops a PersistentBuff
      // in the BEVERAGE slot, re-projected each combat for the
      // turnsPerCombat window, fades on rest.
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    // Provision metadata — picked up by the grant_provision handler.
    // Beverage stays at +1 Heroism/turn flat regardless of offset.
    provision: {
      slot: 'beverage',
      name: 'Ale',
      effectType: 'gain_heroism',
      value: 1,
      turnsPerCombat: 2,
      description: '+1 Heroism/turn for 2 turns each combat (until rest)',
    },
    // +1 Consume heal + +1 Consume heroism per offset. The Beverage
    // description intentionally drops the "+1" number prefix so the
    // generic gain_heroism description swap doesn't rewrite the
    // tick value too (provision.value is untouched mechanically,
    // but a visible "+2 Heroism for 2 turns" would lie about the
    // tick math). The swap will only match "Gain 1 Heroism" on the
    // Consume line.
    gamePlusOffset: { heal: 1, gain_heroism: 1 },
  });
}

// ============================================================
// Enemy Cards - Sahuagin
// ============================================================

// Sahuagin Trident Throw (monster card) — 1 damage, draw, with a
// Bleeding-only damage rider that pairs with the priest's bleed kit.
export function createTridentThrow() {
  return new Card({
    id: 'trident_throw',
    name: 'Trident Throw',
    description: 'Recharge -> Deal 2 Damage, Draw. Bleeding: +1 Damage.',
    shortDesc: 'R->2 Dmg, Draw\nBleeding: +1',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('bleeding_bonus_damage', 1, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 1, bleeding_bonus_damage: 1 },
  });
}

// Sahuagin Trident Thrust (monster card) — 3 damage on a recharge+1
// cost that also stamps Bleed for the priest's downstream payoff.
export function createTridentThrust() {
  return new Card({
    id: 'trident_thrust',
    name: 'Trident Thrust',
    description: 'Recharge +1 -> Deal 3 + Bleed.',
    shortDesc: 'R+1->3 Dmg\n+1 Bleed',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 2, apply_bleed: 1 },
  });
}

export function createScaleArmor() {
  return new Card({
    id: 'scale_armor',
    name: 'Scale Armor',
    description: 'Block 3, 2 Ice Randomly, Draw.\nOn Swim: Draw 2.',
    shortDesc: 'Block 3, 2 Ice Rand\nDraw\nOn Swim: Draw 2',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('apply_ice_random', 2, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_swim_recharge_draw', 2, TargetType.SELF),
    ],
    rarity: 'rare',
    // +2 block, +1 ice per offset.
    gamePlusOffset: { block: 2, apply_ice_random: 1 },
  });
}

export function createBloodInTheWater() {
  // CREATURE-summon spell that drops 1-2 Sharks (random) into the
  // priest's row + bumps the priest's own Rage by 1 each cast. The
  // Shark itself carries Bloodfrenzy in its creature description so
  // we don't repeat it here.
  return new Card({
    id: 'blood_in_the_water',
    name: 'Blood in the Water',
    description: 'Recharge -> Summon 1-2 Sharks. Gain 1 Rage.',
    shortDesc: 'R->Summon 1-2\nSharks, +1 Rage',
    subtype: 'spell',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_shark_random', 2, TargetType.SUMMON),
      new CardEffect('gain_rage', 1, TargetType.SELF),
    ],
    priority: 8,
    // +1 to the upper-bound shark roll (1-2 → 1-3 → 1-4 …) and
    // +0.5 rage gained per offset (1 base → 2 at offset 2 → …).
    gamePlusOffset: { summon_shark_random: 1, gain_rage: 0.5 },
  });
}

// Player-facing Barnacle Encrusted Plate — Sahuagin Baron drop.
// Mirrors PY create_barnacle_encrusted_plate. Heavy armor that
// also creates a Barnacle (banishable Heal 1 token) on every
// recharge, plus a swim-recharge draw.
export function createBarnacleEncrustedPlate() {
  return new Card({
    id: 'barnacle_encrusted_plate',
    name: 'Barnacle Encrusted Plate',
    description: 'Block 5, create 1-2 Barnacle.\nDraw.\nOn Swim: Draw 2.',
    shortDesc: 'Block 5, Draw\n+1-2 Barnacle\nOn Swim: Draw 2',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
      // value=2 → create_barnacle handler rolls 1..2 barnacles.
      new CardEffect('create_barnacle', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_swim_recharge_draw', 2, TargetType.SELF),
    ],
    rarity: 'epic',
    // Side-preview the Barnacle token on the full hover card so the
    // player sees what create_barnacle drops into hand.
    previewCard: createBarnacle(),
    // +5 block, +1 to the upper bound of the barnacle roll per offset.
    gamePlusOffset: { block: 5, create_barnacle: 1 },
  });
}

// Barnacle — disposable heal token created by Barnacle Encrusted
// Plate. Banishes for 1 heal. Mirrors PY create_barnacle.
export function createBarnacle() {
  return new Card({
    id: 'barnacle',
    name: 'Barnacle',
    description: 'Consume -> Heal 1.',
    shortDesc: 'C->Heal 1',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [new CardEffect('heal', 1, TargetType.SELF)],
    gamePlusOffset: { heal: 0.5 },
  });
}

export function createBarnacleEncrustedPlateEnemy() {
  // Simpler than the player loot version: Block 5 + Heal 1-2 (no
  // Barnacle, no swim draw). Heal moves cards from the enemy's
  // discard pile back into their recharge pile, so the priest/baron
  // can grind out a fight.
  return new Card({
    id: 'barnacle_encrusted_plate_enemy',
    name: 'Barnacle Plate',
    description: 'Recharge -> Block 5,\nHeal 1-2. Draw.',
    shortDesc: 'R->Block 5\nHeal 1-2, Draw',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
      new CardEffect('heal_random', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 3, heal_random: 1 },
  });
}

// ============================================================
// Enemy Cards - Forest Spider
// ============================================================

export function createPoisonedBite() {
  return new Card({
    id: 'poisoned_bite',
    name: 'Poisoned Bite',
    description: 'Recharge -> Deal 1 Damage + 1 Poison.',
    shortDesc: 'R->1 Dmg + Poison',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
    ],
    // +1 dmg, +0.5 poison (floor) per offset.
    gamePlusOffset: { damage: 1, apply_poison: 0.5 },
  });
}

export function createWebSpider() {
  return new Card({
    id: 'web_spider',
    name: 'Web',
    description: 'Recharge -> Throw 1 Web at the enemy. Clogs their deck with a Web token.',
    shortDesc: 'R->1 Web enemy\n+1 clog',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('add_web_token', 1, TargetType.SELF)],
    // No tier scaling — one web per cast is the design, the spider
    // pressure comes from the dungeon's loop-level count.
    noTierOffset: true,
  });
}

// Web token — junk card the spiders shove into the player's draw pile
// at a random position. Banish-cost: pay by recharging another card,
// then it's gone forever (until the next Web hit). On discard it drags
// another card into the discard with it (clogs the deck even when
// "skipped" via damage flow).
export function createWebToken() {
  return new Card({
    id: 'web_token',
    name: 'Web',
    description: 'Recharge a card -> Consume.\nWhen discarded, discard a card.',
    shortDesc: 'R1->Consume\nDiscard: -1',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('on_discard_discard', 1, TargetType.SELF),
    ],
    isToken: true,
    // No tier scaling — the web token is a junk-card debuff, the
    // spider's Web ability already opts out and the token mirrors
    // that decision. Without the flag the codex paints a red
    // "needs offset rules" border at +1+.
    noTierOffset: true,
  });
}

// Slyblade-specific card creators were removed — the Kobold Slyblade
// now reuses the player Rogue tier-2 cards directly (createBackstab,
// createPoisonedDagger, createFanOfBlades, createSprint,
// createPetSpider, createSneakAttack), plus createCarefulStrike and
// createBow. Priorities are stamped at deck-build time in main.js's
// ENEMY_DECKS.kobold_slyblade.

// ============================================================
// Slyblade Loot Cards (Chapter 7 upper-path drops)
// ============================================================

// Sly Blade — uncommon simple weapon. PY parity (cards_basic.py:4416):
// 2 damage + 2 bonus damage if the target is Poisoned + stays in hand.
// `poison_bonus_damage` effect handler ported to main.js.
export function createSlyBlade() {
  return new Card({
    id: 'sly_blade',
    name: 'Sly Blade',
    description: 'Deal 2 Damage.\nPoisoned: +2.\nStays in hand.',
    shortDesc: '2 Dmg, Poisoned +2\nStays in hand',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('poison_bonus_damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { damage: 1, poison_bonus_damage: 1 },
  });
}

// Shadow Cloak — uncommon clothing defense. Coin-flip Block 10 +
// draw 1. On heads the cloak grants a wall of Block (effectively
// soaks any reasonable swing); on tails the swing lands at full
// force with no block.
export function createShadowCloak() {
  return new Card({
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: '50% to gain 10 Block. Scry 2.',
    shortDesc: '50% Block 10\nScry 2',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      // value = chance %, handler grants 10 Block (default) or the
      // bumped _chanceBlockAmount stamped by ccgQuest+ offset.
      new CardEffect('block_chance_10', 50, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +4 Block per offset on the on-success grant — the chance stays
    // 50%, just the payoff swells. Custom branch in
    // applyGamePlusOffsetInPlace stamps `_chanceBlockAmount` and
    // rebuilds the description.
    gamePlusOffset: {},
  });
}

// Kobold Smoke Bomb — common item. PY: Banish → 1 Shield per enemy
// + draw 1. The per-enemy scaling needs a `shield_per_enemy` effect
// that JS doesn't have yet — for now we drop a flat 2 Shield + draw
// (matches the most common 2-enemy fight scenario).
export function createKoboldSmokeBomb() {
  return new Card({
    id: 'kobold_smoke_bomb',
    name: 'Kobold Smoke Bomb',
    description: 'Consume -> Avoid all damage. Draw.',
    shortDesc: 'C->Avoid ALL dmg\nDraw',
    subtype: 'item',
    // DEFENSE so it's played reactively in the defending phase, even
    // though it's an Item subtype. The dodge_chance_all rider (100 =
    // guaranteed avoid) zeroes pendingIncomingDamage in the defense
    // play loop; the Consume cost permanently removes the bomb.
    cardType: CardType.DEFENSE,
    costType: CostType.BANISH,
    // 100% dodge is binary — nothing to scale per offset.
    noTierOffset: true,
    effects: [
      new CardEffect('dodge_chance_all', 100, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
  });
}

// Kobold Lockpick Set — uncommon relic. Recharge → Scry 3 (pick one
// to keep on top). scry_pick effect already supported.
export function createKoboldLockpickSet() {
  return new Card({
    id: 'kobold_lockpick_set',
    name: 'Kobold Lockpick Set',
    description: 'Recharge -> Scry 3.',
    shortDesc: 'R->Scry 3',
    subtype: 'relic',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('scry_pick', 3, TargetType.SELF)],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { scry_pick: 1 },
  });
}

// ============================================================
// Dwarven Specter Loot Cards
// ============================================================

// Gravechill Shard — common wand. Two staggered ice bolts (each pickable
// target), stays in hand so the wizard pings 2 Ice stacks every turn for
// free. Same magic-missile barrage feel as Wand of Fire (was).
export function createGravechillShard() {
  return new Card({
    id: 'gravechill_shard',
    name: 'Gravechill Shard',
    description: 'Deal Ice 2 times.\nStays in hand.',
    shortDesc: 'Ice x2, Stays',
    subtype: 'wand',
    cardType: CardType.ATTACK,
    // FREE — same reasoning as Bone Wand / Wand of Fire: stays in hand,
    // no recharge cost so each turn the player pings 2 Ice stacks
    // across one or two targets.
    costType: CostType.FREE,
    effects: [
      // value=2 → two staggered ice-bolt shots (magic-missile feel),
      // each shot picks its own target. Routed through the elemental
      // barrage flow.
      new CardEffect('apply_ice_multi', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    // +1 Ice attack per offset (3 attacks at +1, 4 at +2…).
    gamePlusOffset: { apply_ice_multi: 1 },
  });
}

// Soul Ward — uncommon clothing. Block 1 + Shield 1 + Heal 1.
export function createSoulWard() {
  return new Card({
    id: 'soul_ward',
    name: 'Soul Ward',
    description: 'Block 1-2, 1-2 Shield, Heal 1-2, Scry 2.',
    shortDesc: 'Block 1-2\n+1-2 Shield/Heal\nScry 2',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block_random', 2, TargetType.SELF),
      new CardEffect('gain_shield_random', 2, TargetType.SELF),
      new CardEffect('heal_random', 2, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +1 to the upper bound of each random roll per offset
    // (1-2 → 1-3 → 1-4 …).
    gamePlusOffset: { block_random: 1, gain_shield_random: 1, heal_random: 1, scry_pick: 1 },
  });
}

// Spectral Hand — uncommon simple weapon. PY: 1-4 necrotic + heal
// same. JS doesn't have `player_necrotic_drain` yet — use a flat
// 2 unpreventable damage + heal 2 as a placeholder. TODO: port the
// 1-4 random roll + necrotic flavor.
export function createSpectralHand() {
  return new Card({
    id: 'spectral_hand',
    name: 'Spectral Hand',
    description: 'Deal 2 True Damage,\nHeal 1 for each damage.',
    shortDesc: '2 True Dmg\nHeal 1/dmg',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('unpreventable_damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('heal', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { unpreventable_damage: 1, heal: 1 },
  });
}

// Summon Ancestor — rare ability, drops from the Sarcophagus fight.
// Mirrors PY cards_basic.py:3904 — recharge + 1 card from hand to
// summon a random Ancestor (Durin / Balgrim / Thordak). The random
// pick + creature spawn is handled by the `summon_ancestor` effect
// dispatcher in main.js.
export function createSummonAncestor() {
  return new Card({
    id: 'summon_ancestor',
    name: 'Summon Ancestor',
    description: 'Recharge a Card ->\nSummon 1 Ancestor.\n(Durin, Balgrim, or Thordak)\nDraw.',
    shortDesc: 'R->Summon\nAncestor, Draw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('summon_ancestor', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'rare',
    // Mini-preview the 3 possible summons next to the card (same
    // treatment Animal Companion gets for Misha/Huffer). Stats here
    // must mirror the player-side variant in main.js's
    // `summon_ancestor` effect handler — these are weaker than the
    // boss-shell versions in setupEnemyForCombat.
    previewCreatures: [
      new Creature({ name: 'Durin Stoneheart', attack: 4, maxHp: 6,
        endTurnHealAllies: 1,
        description: 'End of Turn: Heal 1 to all allies.' }),
      new Creature({ name: 'Balgrim Ironvein', attack: 3, maxHp: 4, armor: 1,
        endTurnShieldAllies: 1,
        description: 'End of Turn: All allies gain 1 Shield.' }),
      new Creature({ name: 'Thordak Ashmantle', attack: 3, maxHp: 3, multiAttack: 99,
        haste: true,
        description: 'Haste. Attacks ALL enemies.' }),
    ],
    // The card has no per-effect bump — the ccgQuest+ scaling lives
    // on the ancestor creatures (Durin / Balgrim / Thordak), each
    // wired in CREATURE_TIER_OFFSET. Empty `{}` is the explicit
    // opt-in so the codex stamps the name/tier bump and drops the
    // red "needs rules" badge.
    gamePlusOffset: {},
  });
}

// Specter Ectoplasm — rare relic. PY: Discard → grant Ethereal
// (reduce all damage taken to 1) until next turn. JS doesn't have
// the grant_ethereal effect or a 1-turn invuln buff yet — for now
// the card heals 1-2 + draws 1 as a placeholder consumable. TODO:
// proper Ethereal grant when the buff exists.
export function createSpecterEctoplasm() {
  return new Card({
    id: 'specter_ectoplasm',
    name: 'Specter Ectoplasm',
    description: 'Heal 1, Draw.',
    shortDesc: 'Heal 1, Draw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heal', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { heal: 1 },
  });
}

// ============================================================
// Enemy Cards - Obsidian
// ============================================================

// Siege Spoils — dropped after the third siege gauntlet falls.
// Common but tier-2 stat lines.
export function createGoblinRocketBoots() {
  return new Card({
    id: 'goblin_rocket_boots',
    name: 'Goblin Rocket Boots',
    description: 'Block 2, Fire ALL, Draw.',
    shortDesc: 'Block 2, Fire ALL\nDraw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('apply_fire_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    // +1 block, +1/3 Fire to all enemies per offset (floor — +1 at +3).
    gamePlusOffset: { block: 1, apply_fire_all: 1/3 },
  });
}

export function createGoblinSapperCharges() {
  return new Card({
    id: 'goblin_sapper_charges',
    name: 'Goblin Sapper Charges',
    description: 'Consume -> Deal 1 to 3 Damage + Fire to a random enemy 3 times.',
    shortDesc: 'C->1-3 Dmg+Fire\nrandom x3',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('sapper_charges', 3, TargetType.RANDOM_ENEMY),
    ],
    rarity: 'common',
    tier: 2,
    // +1 damage per offset to BOTH ends of the 1-3 random roll
    // (becomes 2-4 at +1, 3-5 at +2, …). Runtime handler reads the
    // stamped _sapperChargesDmgBump from the card; the custom
    // branch in applyGamePlusOffsetInPlace stamps it and rebuilds
    // the description.
    gamePlusOffset: {},
  });
}

// === Goblin Swarm loot drops (Part 2 tunnels) ===

// Goblin Spike Trap — summons 1-2 stationary spike-trap allies that
// can't attack but Riposte (deal their attack to anything that hits them).
export function createGoblinSpikeTrap() {
  return new Card({
    id: 'goblin_spike_trap', name: 'Goblin Spike Trap',
    description: 'Summon 1 or 2 Goblin Spike Trap.',
    shortDesc: 'Summon 1-2\nSpike Traps',
    subtype: 'item', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_goblin_spike_trap', 2, TargetType.SUMMON)],
    rarity: 'uncommon', tier: 2,
    noTierOffset: true, // trap-count scaling lives in the summon handler
    previewCreature: (() => {
      const c = new Creature({
        name: 'Goblin Spike Trap', attack: 2, maxHp: 1,
        description: "Can't Attack. Riposte.", noTierOffset: true,
      });
      c._cantAttack = true;
      c.riposte = true;
      return c;
    })(),
  });
}

// Goblin War Banner — summons a 0/4 banner that can't attack but buffs
// every player ally's damage by +1 while it stands.
export function createGoblinWarBanner() {
  return new Card({
    id: 'goblin_war_banner', name: 'Goblin War Banner',
    description: 'Summon a Goblin War Banner.',
    shortDesc: 'Summon\nWar Banner',
    subtype: 'item', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_goblin_war_banner', 1, TargetType.SUMMON)],
    rarity: 'uncommon', tier: 2,
    noTierOffset: true, // the item is unchanged; the summoned banner scales
    previewCreature: (() => {
      const c = new Creature({
        name: 'Goblin War Banner', attack: 0, maxHp: 4,
        description: "Can't Attack.\nAllies deal +1 Damage.", noTierOffset: true,
      });
      c._cantAttack = true;
      c._allyDamageAura = 1;
      return c;
    })(),
  });
}

// Spiked Goblin Helmet — light armor: block + a random spike strike + draw.
export function createSpikedGoblinHelmet() {
  return new Card({
    id: 'spiked_goblin_helmet', name: 'Spiked Goblin Helmet',
    description: 'Block 3, Deal 5 Randomly. Draw.',
    shortDesc: 'Block 3\n5 random, Draw',
    subtype: 'light_armor', cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('damage_random', 5, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    gamePlusOffset: { block: 1, damage_random: 2 },
  });
}

// Goblin Boss's Whistle — summons 1-3 random goblins (Minion / Sapper /
// Warrior) to fight on the player's side. Game+ raises the MAX by +1 per
// offset (1-4, 1-5, …) — handled in the summon_random_goblins effect.
export function createGoblinBossWhistle() {
  return new Card({
    id: 'goblin_bosss_whistle', name: "Goblin Boss's Whistle",
    description: 'Summon 1 to 3 Random Goblins.',
    shortDesc: 'Summon 1-3\nRandom Goblins',
    subtype: 'allies', cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_random_goblins', 2, TargetType.SUMMON)],
    rarity: 'rare', tier: 2,
    noTierOffset: true, // goblin-count scaling lives in the summon handler
  });
}

// Bag of Stolen Teeth — relic that converts the combat's body count into
// Heroism (1 per enemy defeated this combat).
export function createBagOfStolenTeeth() {
  return new Card({
    id: 'bag_of_stolen_teeth', name: 'Bag of Stolen Teeth',
    description: 'Gain Heroism for each\nenemy defeated this combat.',
    shortDesc: 'Heroism per\nenemy slain',
    subtype: 'relic', cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [new CardEffect('gain_heroism_per_defeated', 1, TargetType.SELF)],
    rarity: 'epic', tier: 2,
  });
}

// === Rampaging Troll loot drops (Part 2 tunnels) ===

// Ring of Regeneration — recharge relic; gain 2 Regen and draw a card.
export function createRingOfRegeneration() {
  return new Card({
    id: 'ring_of_regeneration', name: 'Ring of Regeneration',
    description: 'Gain 2 Regen.\nStays in hand.',
    shortDesc: '+2 Regen\nStays in hand',
    subtype: 'relic', cardType: CardType.ITEM, costType: CostType.FREE,
    effects: [
      new CardEffect('apply_regen', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'epic', tier: 2,
    gamePlusOffset: { apply_regen: 1 },
  });
}

// Troll Skin Jacket — clothing armor: block + regen + draw.
export function createTrollSkinJacket() {
  return new Card({
    id: 'troll_skin_jacket', name: 'Troll Skin Jacket',
    description: 'Block 3, Gain 2 Regen, Scry 2.',
    shortDesc: 'Block 3, Regen 2\nScry 2',
    subtype: 'clothing', cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('apply_regen', 2, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    rarity: 'rare', tier: 2,
    gamePlusOffset: { block: 1, apply_regen: 1 },
  });
}

// Troll Blood Vial — Consume for an immediate 3 Regen; also slots as a
// Beverage that grants 2 Regen each turn for 3 turns.
export function createTrollBloodVial() {
  return new Card({
    id: 'troll_blood_vial', name: 'Troll Blood Vial',
    description: 'Gain 3 Regen, Gain 2 Regen for 3 turns.',
    shortDesc: '+3 Regen\n+2 Regen 3t',
    subtype: 'item', cardType: CardType.ITEM, costType: CostType.BANISH,
    effects: [
      new CardEffect('apply_regen', 3, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'beverage',
      name: 'Troll Blood Vial',
      // 'regen' tick ADDS to the Regen stack each turn (merges with
      // existing Regen) rather than healing separately — so 3 Regen +2
      // from the vial → 5 Regen, heal 5, decay to 3, etc.
      effectType: 'regen',
      value: 2,
      turnsPerCombat: 3,
      description: 'Gain 2 Regen each turn for 3 turns.',
    },
    rarity: 'common', tier: 2,
    // +1 immediate Regen per offset; the beverage gains +1 turn per offset
    // (provision.turnsPerCombat scaled in applyGamePlusOffsetInPlace).
    gamePlusOffset: { apply_regen: 1, provisionTurns: 1 },
  });
}

// Severed Troll Arm — summons an exact Loathsome Limb ally (3 Atk... it
// IS the troll's limb: 2/6 wounded to 3, Regen 2, Bleed). When the limb
// regrows to full HP it re-attaches: you heal for its HP (6) and draw 1.
export function createSeveredTrollArm() {
  return new Card({
    id: 'severed_troll_arm', name: 'Severed Troll Arm',
    description: 'Summon a Loathsome Limb.',
    shortDesc: 'Summon a\nLoathsome Limb',
    subtype: 'allies', cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_severed_troll_arm', 1, TargetType.SUMMON)],
    rarity: 'rare', tier: 2,
    noTierOffset: true, // always summons exactly 1 arm — no ccgQuest+ scaling
    previewCreature: (() => {
      const c = new Creature({
        name: 'Loathsome Limbs', attack: 2, maxHp: 6, currentHp: 3,
        bleedAttack: 1, description: 'Regen 2.', noTierOffset: true,
      });
      c._regen = 2; c._regenMax = 2;
      return c;
    })(),
  });
}

// Long Troll Teeth — stays-in-hand dagger that scales with how many
// times it has struck this combat (Deal 2 + X, X = prior swings).
export function createLongTrollTeeth() {
  return new Card({
    id: 'long_troll_teeth', name: 'Long Troll Teeth',
    description: 'Deal X.\n(2 + swings this combat)\nStays in hand.',
    shortDesc: 'Deal X\n2+swings, Stays',
    subtype: 'simple', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('troll_teeth_attack', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    gamePlusOffset: { troll_teeth_attack: 1 }, // +1 base damage per offset
  });
}

export function createOgreMaul() {
  return new Card({
    id: 'ogre_maul',
    name: 'Ogre Maul',
    description: 'Recharge 3 Cards -> Deal 8 Damage (+8 vs Armor/Shield).',
    shortDesc: 'R-3 Cards->8 Dmg\n(+8 Armor)',
    subtype: 'simple_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // armor_bonus_damage encodes base * 100 + vsArmorTotal when the
    // total is >= 10. 8 base + 8 vs Armor = 16 total → 8*100+16 = 816.
    effects: [
      new CardEffect('armor_bonus_damage', 816, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 3, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    // +4 base / +2 vs Armor-Shield per offset (8/+8 → 12/+10 → 16/+12…).
    gamePlusOffset: { armor_bonus_damage: { base: 4, bonus: 2 } },
  });
}

export function createCrush() {
  return new Card({
    id: 'crush',
    name: 'Crush',
    description: 'Recharge -> Deal 4 Damage.',
    shortDesc: 'R->4 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage', 4, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { damage: 2 },
  });
}

export function createRockyAppendage() {
  return new Card({
    id: 'rocky_appendage',
    name: 'Rocky Appendage',
    description: 'Recharge -> Deal 2 Damage.\n(+2 vs Armor/Shield)',
    shortDesc: 'R->2 Dmg\n+2 vs Armor/Shield',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // value 22 = base 2, bonus 2 (armor_bonus_damage value < 100 is base*10+bonus).
    effects: [new CardEffect('armor_bonus_damage', 22, TargetType.SINGLE_ENEMY)],
    // +1 base damage and +1 vs Armor/Shield per offset.
    gamePlusOffset: { armor_bonus_damage: { base: 1, bonus: 1 } },
  });
}

// ============================================================
// Enemy Cards - Siege
// ============================================================

// JS variant: stays-in-hand ABILITY. Each turn the ogre plays one,
// gaining 1 Rage. The played card stays in hand and Rage accumulates
// onto the eventual Massive Ogre Ram swing.
export function createPullingBackTheRam() {
  return new Card({
    id: 'pulling_back_the_ram',
    name: 'Pulling Back the Ram',
    description: 'The ogre heaves the ram backward. Gain 1 Rage. Stays in hand.',
    shortDesc: '+1 Rage\nStays in hand',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [
      new CardEffect('gain_rage', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 1, TargetType.SELF),
    ],
    // The Siege Ogre's hand cycle is rate-limited by hand size, not
    // by per-card Rage scaling; tier offset already bumps the
    // resulting ram swing via the Massive Ogre Ram offset rule.
    noTierOffset: true,
  });
}

// ============================================================
// Enemy Cards - Drake Rider
// ============================================================

export function createDrakeRiderCharge() {
  // Mirrors PY cards_basic.py:create_drake_rider_charge. The rider buffs
  // the warband (+1 Heroism to itself and every ally) then jabs for 2
  // damage, AND a random drake ally on the enemy side gets a free
  // attack (drake_attack effect). The drake doesn't exhaust — it can
  // still swing on its own turn afterward.
  return new Card({
    id: 'drake_rider_charge',
    name: 'Drake Rider Charge!',
    description: 'Recharge +1 -> You and allies gain 1 Heroism. Deal 3 Damage. A random drake attacks.',
    shortDesc: 'R+1->+1 Heroism\n3 Dmg, Drake',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('drake_attack', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 2, buff_allies_heroism: 1 },
    // The drake's reptilian roar plays alongside the showcase art when
    // the enemy fires this card. Wired via CARD_SFX_OVERRIDES in main.js.
  });
}

export function createChainShirt() {
  return new Card({
    id: 'chain_shirt',
    name: 'Chain Shirt',
    // Lighter than Ring Mail — torso-only mail, mobile enough to count
    // as light armor in this game's two-tier subtype system (D&D 5e
    // would tag it Medium, but light_armor is the closer mapping).
    description: 'Block 3, Heroism, Draw.',
    shortDesc: 'Block 3, Heroism,\nDraw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { block: 2, gain_heroism: 1 },
  });
}

// Frost Drake Scale — relic dropped by the Kobold Drake Rider on the
// Qualibaf Volcano path. Mirrors PY cards_basic.py:create_frost_drake_scale.
export function createFrostDrakeScale() {
  return new Card({
    id: 'frost_drake_scale',
    name: 'Frost Drake Scale',
    description: '1 Ice randomly, Draw.',
    shortDesc: '1 Ice rand\nDraw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice_random', 1, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { apply_ice_random: 1 },
  });
}

// ============================================================
// Enemy Cards - Boss
// ============================================================

// Ruga's Spiked Gauntlets — rare martial weapon dropped by Ruga the
// Slave Master. PY parity: X damage where X = attacks this turn,
// plus draw 1. Reuses the player-side sneak_attack effect (same
// scaling rule) since PY's `sneak_attack_damage` isn't ported as a
// separate effect type.
export function createRugasSpikedGauntlets() {
  return new Card({
    id: 'rugas_spiked_gauntlets',
    name: "Ruga's Spiked Gauntlets",
    description: 'Deal X Damage, Draw.\nX = Attacks this turn.',
    shortDesc: 'X Dmg, Draw\nX=Attacks',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('sneak_attack', 0, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    // +2 base dmg per offset on the sneak_attack scaling.
    gamePlusOffset: { sneak_attack: 2 },
  });
}

export function createPummel() {
  // Mirrors PY cards_basic.py:create_pummel — Ruga's signature swing.
  // Damage scales with the number of cards Ruga has played this
  // turn (uses the same enemy_sneak_attack effect as Slyblade's
  // finisher). Priority 1 so it always plays last for max X.
  return new Card({
    id: 'pummel',
    name: 'Pummel',
    description: 'Recharge -> Deal X Damage.\nX = attacks this turn (counts itself).',
    shortDesc: 'R->X Dmg\nX=attacks',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('enemy_sneak_attack', 0, TargetType.SINGLE_ENEMY)],
    priority: 1,
    // +1 flat bonus damage per offset (X + 1 → X + 2…). The
    // enemy_sneak_attack runtime adds eff.value as a flat bonus on
    // top of the per-turn X count.
    gamePlusOffset: { enemy_sneak_attack: 1 },
  });
}

export function createDrainEssence() {
  // PY parity (cards_basic.py:4215) — random 1-4 unpreventable damage
  // (necrotic), Specter heals for the amount actually drained.
  // Wrapped as a single `necrotic_drain` effect; the enemy-side
  // handler in main.js rolls the random + does the heal.
  return new Card({
    id: 'drain_essence',
    name: 'Drain Essence',
    description: 'Recharge -> Deal 1-4 Necrotic damage. Heal for the same amount.',
    shortDesc: 'R->1-4 True Dmg\nHeal same',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('necrotic_drain', 4, TargetType.SINGLE_ENEMY)],
    priority: 10,
    // +1 to both ends of the 1-N roll per offset. The card-level
    // bump moves the max (effect value) up by 1; the necrotic_drain
    // handler reads monsterTierOffset to shift the min so 1-4 reads
    // 2-5 at offset 1, 3-6 at offset 2, etc. Custom branch in
    // applyGamePlusOffsetInPlace rebuilds the description range.
    gamePlusOffset: { necrotic_drain: 1 },
  });
}

export function createObsidianCurse() {
  // Obsidian Oracle's signature card. PY parity (cards_basic.py:4628):
  // each play wedges 1 Obsidian Shard into the player's draw pile, then
  // deals damage to every player-side target equal to the TOTAL number
  // of shards currently in the player's deck (draw + hand + recharge +
  // discard). Snowballs hard if the player doesn't banish the shards.
  return new Card({
    id: 'obsidian_curse',
    name: 'Obsidian Curse',
    description: 'Recharge -> Add 1 Obsidian Shard to your deck. Deal X damage to all (X = Shards in your deck).',
    shortDesc: 'R->+1 Shard\nX Dmg ALL',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('add_obsidian_shard', 1, TargetType.SELF),
      new CardEffect('damage_all_shard_count', 0, TargetType.ALL_ENEMIES),
    ],
    priority: 10,
    // +1 shard wedged into the player's deck per cast per offset
    // (snowballs harder at higher tier — same shape, more shards).
    gamePlusOffset: { add_obsidian_shard: 1 },
  });
}

// Obsidian Candle — Oracle mini-boss loot drop. Rare tier-2 item that
// turns a forced recharge (pay 1 from hand) into a Scry 2 + stays in
// hand. Powerful deck-sculpting effect. Mirrors PY
// cards_basic.py:create_obsidian_candle.
// Molten Scale Armor — loot variant dropped after the Magma Drake.
// Distinct from the boss's deck card (`molten_scale_armor` is its
// block-2 + shield defense). The loot version is light_armor with a
// random-target fire rider. Mirrors PY cards_basic.py:4675.
export function createMoltenScaleArmorLoot() {
  return new Card({
    id: 'molten_scale_armor_loot',
    name: 'Molten Scale Armor',
    description: 'Block 6, Fire ALL, Draw.',
    shortDesc: 'Block 6, Fire ALL\nDraw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 6, TargetType.SELF),
      new CardEffect('apply_fire_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    // +2 block, +1 Fire to all enemies per offset.
    gamePlusOffset: { block: 2, apply_fire_all: 1 },
  });
}

// Molten Scale — relic-tier drop from the Magma Drake loot pool.
// Playable relic. FREE cost: gain 1 Ignite then draw to replace itself.
export function createMoltenScaleRelic() {
  return new Card({
    id: 'molten_scale_relic',
    name: 'Molten Scale',
    description: '+1 Ignite, Draw.',
    shortDesc: '+1 Ignite, Draw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_ignite', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { gain_ignite: 1 },
  });
}

export function createObsidianCandle() {
  return new Card({
    id: 'obsidian_candle',
    name: 'Obsidian Candle',
    description: 'Recharge a card: Scry 2. Stays in hand.',
    shortDesc: 'R other->Scry 2\nStays in hand',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.FREE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { scry_pick: 1 },
  });
}

// Obsidian Shard — junk token the Oracle's Curse shoves into the
// player's draw pile. BANISH cost: pay by recharging another card (the
// shard goes away forever). On banish, the Oracle gains 1 Armor —
// banishing shards is the only way to clear them, but each clear
// tightens the noose. Mirrors PY cards_basic.py:create_obsidian_shard_token.
export function createObsidianShardToken() {
  return new Card({
    id: 'obsidian_shard_token',
    name: 'Obsidian Shard',
    description: 'Recharge a card -> Consume.\nEnemy gains 1 Armor.',
    shortDesc: 'R1->Consume\nEnemy +1 Armor',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      // gain_shield starts at 0 so base-tier players never get an
      // unexpected freebie on banish. ccgQuest+ bumps the value by
      // +1 per offset, and the custom branch in
      // applyGamePlusOffsetInPlace rewrites the description to
      // include the new "+N Shield" line.
      new CardEffect('gain_shield', 0, TargetType.SELF),
      new CardEffect('enemy_gain_armor', 1, TargetType.SELF),
    ],
    isToken: true,
    // +1 Shield to the player per offset — small consolation for
    // recharging through enemy-injected junk. AND +1 Armor to the
    // enemy per offset, making the shard meaner the further into
    // ccgQuest+ the player goes.
    gamePlusOffset: { gain_shield: 1, enemy_gain_armor: 1 },
  });
}

// ============================================================
// Enemy Cards - Zhost Revenge
// ============================================================

export function createWhiteClawReforged() {
  // Mirrors PY create_white_claw_reforged (cards_basic.py:4150) — Zhost's
  // upgraded blade. Used in both Zhost Revenge's deck AND as the player
  // loot card (PY had a parallel _loot variant; we share one creator and
  // mark tier 2 so it equips into the player's inventory cleanly).
  return new Card({
    id: 'white_claw_reforged',
    name: 'The White Claw Reforged',
    description: 'Deal 6 Damage.\nDeal Ice to ALL.',
    shortDesc: '6 Dmg\nIce ALL',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice_all', 1, TargetType.ALL_ENEMIES),
    ],
    rarity: 'rare',
    tier: 2,
    // +5 dmg / +0.5 Ice (floor) per offset.
    gamePlusOffset: { damage: 5, apply_ice_all: 0.5 },
  });
}

export function createIronforgeChainmail() {
  // Heavy armor — Block 5 + Gain 1 Shield + Draw, plus an on-recharge
  // Shield trickle that mirrors Dwarven Greaves. Heavy_armor subtype
  // matters for the inventory filter + the default defense SFX
  // (block_heavy).
  return new Card({
    id: 'ironforge_chainmail',
    name: 'Ironforge Chainmail',
    description: 'Block 5, Gain Shield, Draw.\nOn Recharge: Gain Shield.',
    shortDesc: 'Block 5, Gain Shield\nDraw / On R: +Shield',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_recharge_shield', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { block: 2, gain_shield: 1 },
  });
}

export function createDwarvenWarhammer() {
  // Mirrors PY create_dwarven_warhammer (cards_basic.py:4530). Heavy
  // 2H martial weapon — first cracks 2 Shield off the target, then
  // lands 4 damage. Pairs naturally with the dwarven market gear.
  return new Card({
    id: 'dwarven_warhammer',
    name: 'Dwarven Warhammer',
    description: 'Strip 2 Shields\nand Deal 4 Damage.',
    shortDesc: 'Strip 2 Shield\n4 Dmg',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('destroy_shield', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'common',
    tier: 2,
    gamePlusOffset: { destroy_shield: 2, damage: 1 },
  });
}

export function createMinersPickaxe() {
  // Mirrors PY create_miners_pickaxe (cards_basic.py:4587). Simple
  // weapon with a chunky armor-bonus damage encoded as 68 (6 base /
  // 8 vs armor or shield) plus the shield-destroy rider. Costs an
  // extra recharge to play.
  return new Card({
    id: 'miners_pickaxe',
    name: "Miner's Pickaxe",
    description: 'Recharge a Card -> Strip 2 Shields, Deal 7 (+2 vs Armor/Shield).',
    shortDesc: 'R-Card->Strip 2 Shield\nDeal 7 (+2 vs Armor)',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('destroy_shield', 2, TargetType.SINGLE_ENEMY),
      // 7 base + 2 vs Armor/Shield = 9 total → encoded 79.
      new CardEffect('armor_bonus_damage', 79, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    // +1 strip, +1 base dmg, +1 vs Armor/Shield per offset.
    gamePlusOffset: { destroy_shield: 1, armor_bonus_damage: { base: 1, bonus: 1 } },
  });
}

export function createDwarvenThrowingAxe() {
  // Two-target martial — Cleave-shaped: 2 damage to up to 2 enemies,
  // draws a card only when the player picks a 2nd target. The draw
  // rider is `draw_on_two_targets`, read by the multi_damage handler
  // at end of swing.
  return new Card({
    id: 'dwarven_throwing_axe',
    name: 'Dwarven Throwing Axe',
    description: 'Deal 2 Damage to 2 targets.\n2 Targets: Draw.',
    shortDesc: '2 Dmg x2\n2 Targets: Draw',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('multi_damage', 2, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('draw_on_two_targets', 1, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    gamePlusOffset: { multi_damage: 1 },
  });
}

export function createRuneforgedBuckler() {
  // ABILITY (proactive), grants 2 Shield + 2 Heroism + a stacking-draw
  // payoff if the player ends up with at least 2 Shields after play.
  return new Card({
    id: 'runeforged_buckler',
    name: 'Runeforged Buckler',
    description: 'Gain 2 Shields, Gain 2 Heroism.\nFirst Shield: Draw.',
    shortDesc: '+2 Shield\n+2 Heroism\n1st Shield: Draw',
    subtype: 'light_armor',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('gain_heroism', 2, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    gamePlusOffset: { gain_shield: 1, gain_heroism: 1 },
  });
}

export function createDwarvenTowerShield() {
  return new Card({
    id: 'dwarven_tower_shield',
    name: 'Dwarven Tower Shield',
    description: 'Recharge a card -> Gain 3 Shields.\nStays in hand.',
    shortDesc: 'R+1->+3 Shield\nStays in hand',
    subtype: 'heavy_armor',
    // ABILITY (not DEFENSE) so it can only be played proactively on the
    // player's turn, not reactively during the defending phase.
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 3, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    tier: 2,
    gamePlusOffset: { gain_shield: 2 },
  });
}

// ============================================================
// Enemy Cards - Magma Drake
// ============================================================

export function createTailSwipe() {
  return new Card({
    id: 'tail_swipe',
    name: 'Tail Swipe',
    description: 'Recharge -> Deal 1 Damage to ALL.',
    shortDesc: 'R->1 Dmg ALL',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage_all', 1, TargetType.ALL_ENEMIES)],
    gamePlusOffset: { damage_all: 1 },
  });
}

export function createFireBreath() {
  return new Card({
    id: 'fire_breath',
    name: 'Fire Breath',
    description: 'Recharge -> Apply 3 Fire to ALL.',
    shortDesc: 'R->3 Fire ALL',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('apply_fire_all', 3, TargetType.ALL_ENEMIES)],
    gamePlusOffset: { apply_fire_all: 2 },
  });
}

export function createMoltenBite() {
  return new Card({
    id: 'molten_bite',
    name: 'Molten Bite',
    description: 'Recharge -> Deal 5 Damage + 1 Fire.',
    shortDesc: 'R->5 Dmg + 1 Fire',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire', 1, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 2, apply_fire: 1 },
  });
}

export function createMoltenScaleArmor() {
  // Boss-deck Molten Scale (player can also loot via separate
  // _loot creator). Both share the same rare stat line + offset
  // shape: Block 5 + Fire to all enemies + Draw.
  return new Card({
    id: 'molten_scale_armor',
    name: 'Molten Scale',
    description: 'Block 6, Fire ALL, Draw.',
    shortDesc: 'Block 6, Fire ALL\nDraw',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 6, TargetType.SELF),
      new CardEffect('apply_fire_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    // Same offset as the player loot variant: +2 block, +1 Fire ALL.
    gamePlusOffset: { block: 2, apply_fire_all: 1 },
  });
}

export function createMagmaMephitSummonCard() {
  return new Card({
    id: 'magma_mephit_summon',
    name: 'Magma Mephit',
    description: 'Recharge -> Summon 1-2 Mephits.',
    shortDesc: 'R->1-2 Mephits',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_random', 2, TargetType.SUMMON)],
    // +1 to max mephits per offset (1-2 → 1-3 → 1-4…).
    gamePlusOffset: { summon_random: 1 },
  });
}

// Magma Rock — common weapon dropped by Magma Mephits. Trades a bit
// of self-burn (1 Fire on yourself) for a strong 2 dmg + 1 Fire +
// Draw hit. Mirrors PY cards_basic.py:create_magma_rock.
export function createMagmaRock() {
  return new Card({
    id: 'magma_rock',
    name: 'Magma Rock',
    description: 'Deal 2 + Fire Damage.\nDeal Fire to yourself.\nHit: Draw.',
    shortDesc: '2 Dmg+Fire\nFire Self\nHit: Draw',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // damage_draw_on_hit replaces the legacy damage+unconditional draw
    // pair so the draw rider only fires when the swing actually lands.
    // The unscaled value travels through to the target via apply_fire;
    // apply_fire_self splashes one stack back on the caster.
    effects: [
      new CardEffect('damage_draw_on_hit', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire_self', 1, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    gamePlusOffset: { damage_draw_on_hit: 1 },
  });
}

// Mephit Skin Sandals — uncommon clothing. Block 1 + Draw + if you
// were burning at card-play time, heal 1 Fire + Draw again. Mirrors
// PY cards_basic.py:create_mephit_skin_sandals.
export function createMephitSkinSandals() {
  return new Card({
    id: 'mephit_skin_sandals',
    name: 'Mephit Skin Sandals',
    description: 'Block 2, 2 Fire Randomly, Scry 2.\nBurning: Douse Fire.',
    shortDesc: 'Block 2, 2 Fire Rand\nScry 2 / Burning:\nDouse Fire',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('apply_fire_random', 2, TargetType.RANDOM_ENEMY),
      new CardEffect('scry_pick', 2, TargetType.SELF),
      // value=99 → if burning, Douse ALL Fire stacks.
      new CardEffect('if_burning_heal_fire', 99, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +1 block, +2 random Fire, +1 douse (the "Douse ALL" rider
    // is already maxed at 99; the +1 here is symbolic and shows in
    // the description swap via the if_burning_heal_fire pattern).
    gamePlusOffset: { block: 1, apply_fire_random: 2, if_burning_heal_fire: 1, scry_pick: 1 },
  });
}

// Mephit Skin Gloves — uncommon clothing. Block 2 + Gain 2 Ignite +
// if Burning: Heal 1 Fire + 2 more Ignite. Mirrors PY
// cards_basic.py:create_mephit_skin_gloves.
export function createMephitSkinGloves() {
  return new Card({
    id: 'mephit_skin_gloves',
    name: 'Mephit Skin Gloves',
    description: 'Block 2, +2 Ignite, Scry 2.\nBurning: +2 Ignite.',
    shortDesc: 'Block 2, +2 Ignite\nScry 2 / Burning:\n+2 Ignite',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_ignite', 2, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
      new CardEffect('if_burning_gain_ignite', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +1 block, +1 Ignite, +1 Ignite while burning per offset.
    gamePlusOffset: {
      block: 1,
      gain_ignite: 1,
      if_burning_gain_ignite: 1,
      scry_pick: 1,
    },
  });
}

// Magma Tablet — uncommon scroll. Stays in hand and pings 2 Ignite
// onto the player every turn it's held (same shape as the Apprentice's
// Spellbook's Heroism ping).
export function createMagmaTablet() {
  return new Card({
    id: 'magma_tablet',
    name: 'Magma Tablet',
    description: 'Gain 2 Ignite.\nStays in hand.',
    shortDesc: '+2 Ignite\nStays',
    subtype: 'scroll',
    cardType: CardType.ITEM,
    costType: CostType.FREE,
    effects: [
      new CardEffect('gain_ignite', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +1 Ignite per offset on the per-turn ping.
    gamePlusOffset: { gain_ignite: 1 },
  });
}

// ============================================================
// Enemy Cards - Zhost Army
// ============================================================

export function createDefensiveFormation() {
  // Mirrors Python: ability card, on play caster + every alive ally gets
  // +1 Shield. Used by General Zhost's Army to stack shields each turn
  // after kobold_army repopulates the field.
  return new Card({
    id: 'defensive_formation',
    name: 'Defensive Formation',
    description: 'Recharge -> You and allies gain 1 Shield.',
    shortDesc: 'R->Team Shield 1',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('team_shield', 1, TargetType.SELF)],
    gamePlusOffset: { team_shield: 1 },
  });
}

// ============================================================
// Enemy Cards - Mimic
// ============================================================

export function createMimicBite() {
  return new Card({
    id: 'mimic_bite',
    name: 'Bite!',
    description: 'Recharge -> Deal 10 Damage. Apply Poison.',
    shortDesc: 'R->10 Dmg\n+Poison',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 10, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 5, apply_poison: 1 },
  });
}

// ============================================================
// Enemy Cards - Bone Storm
// ============================================================

export function createBoneStorm() {
  return new Card({
    id: 'bone_storm',
    name: 'Bone Storm',
    description: 'All enemies lose Shields. Deal 1 Damage to all enemies. Allies gain +1 Atk, +1 HP, +Shield.',
    shortDesc: 'Strip Shield\n1 Dmg All\nBuff Allies',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('bone_storm', 1, TargetType.ALL_ENEMIES)],
    priority: 15,
    // +2 storm damage, +1 atk/hp/shield to allies per monster offset
    // (runtime reads monsterTierOffset to apply the ally buff bumps;
    // the damage portion bumps the bone_storm effect value).
    gamePlusOffset: { bone_storm: 2 },
  });
}

// ============================================================
// Valdrisa Emberforge — joins the party in the Personal Quarters
// hallway after the rest. Mirrors PY cards_basic.py:create_valdrisa_*.
// ============================================================

export function createValdrisaCreature() {
  const c = new Creature({
    name: 'Valdrisa', attack: 4, maxHp: 6, isCompanion: true,
    // +3 vs Armor/Shield (Tier 3 parity). armorBonusOverride bumps the
    // default +2 obsidian-family bonus to +3 — applyObsidianAllyBonus
    // reads this when the swing target has any armor or shield.
    armorBonusOverride: 3,
    description: '+3 vs Armor/Shield. Turn End: Heal 3 a random damaged ally.',
    noTierOffset: true,
  });
  // endTurnHealRandomAlly isn't a Creature constructor param — set it directly
  // so the runtime heal tick reads 3 (default fallback is only 2).
  c.endTurnHealRandomAlly = 3;
  return c;
}

// Valdrisa tier 3 — ccgQuest+ rescue version (offset 1+, since base
// Val is already tier 2). +1/+1 over tier 2, +1 to the end-of-turn
// heal (2 → 3), and +1 to the obsidian-family armor bonus (+2 → +3
// vs Armor/Shield). The endTurnHealRandomAlly and armorBonusOverride
// fields are read by the runtime tick + applyObsidianAllyBonus.
export function createValdrisaTier3Creature() {
  const c = new Creature({
    name: 'Valdrisa', attack: 5, maxHp: 10, isCompanion: true,
    armorBonusOverride: 3,
    description: '+3 vs Armor/Shield. Turn End: Heal 4 a random damaged ally.',
    noTierOffset: true,
  });
  // endTurnHealRandomAlly isn't a Creature constructor param — set it directly
  // (the value passed in the constructor object was silently dropped before).
  c.endTurnHealRandomAlly = 4;
  return c;
}

export function createValdrisaCard() {
  return new Card({
    id: 'valdrisa_card',
    name: 'Valdrisa Emberforge',
    description: 'Recharge a card ->\nCall Valdrisa to the battle!\nDraw.',
    shortDesc: 'Call Valdrisa\nDraw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_valdrisa', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    isUnique: true,
    previewCreature: createValdrisaCreature(),
    // Companion card — offset swaps tier chain ids.
    noTierOffset: true,
  });
}

// Valdrisa tier 3 — ccgQuest+ rescue version at offset 1+. Summons
// a 3/5 Valdrisa with +1 heal per turn (see createValdrisaTier3Creature)
// AND fires a 3-heal on-call onto a chosen ally — mirrors Raena's
// optional on-call arrow but on the heal side. The heal is marked
// optional so the play still resolves cleanly when no ally needs it
// (the card still summons Val).
export function createValdrisaCardTier3() {
  return new Card({
    id: 'valdrisa_card_3',
    name: 'Valdrisa Emberforge',
    description: 'Recharge a card ->\nCall Valdrisa to the battle!\nDraw.\nCalled: Heal 3 (optional).',
    shortDesc: 'Call Valdrisa, Draw\nCalled: Heal 3',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: (() => {
      const callHeal = new CardEffect('heal', 3, TargetType.SINGLE_ALLY);
      callHeal.optional = true;
      return [
        callHeal,
        new CardEffect('summon_valdrisa_tier3', 1, TargetType.SUMMON),
        new CardEffect('recharge_extra', 1, TargetType.SELF),
        new CardEffect('draw', 1, TargetType.SELF),
      ];
    })(),
    rarity: 'rare',
    tier: 3,
    isUnique: true,
    previewCreature: createValdrisaTier3Creature(),
    // Top of the Valdrisa tier chain — no further offset stamping.
    noTierOffset: true,
  });
}

// ============================================================
// Obsidian Wastes Loot — drops from the random labyrinth golem +
// slime encounters. Mirrors PY cards_basic.py:create_obsidian_*.
// All seven cards share the +2 vs Armor/Shield motif (encoded via
// the existing armor_bonus_damage effect).
// ============================================================

export function createObsidianSlimeSummonCreature() {
  return new Creature({
    name: 'Obsidian Slime', attack: 1, maxHp: 1, armor: 5,
    description: '+2 vs Armor/Shield.',
  });
}

export function createObsidianConstructCreature() {
  return new Creature({
    name: 'Obsidian Construct', attack: 2, maxHp: 5, armor: 1, sentinel: true,
    description: 'Sentinel. +2 vs Armor/Shield.',
  });
}

export function createObsidianRock() {
  return new Card({
    id: 'obsidian_rock', name: 'Obsidian Rock',
    description: 'Deal 2 Damage (+2 and Draw vs Armor/Shield).',
    shortDesc: '2 Dmg\n+2 & Draw vs\nArmor/Shield',
    subtype: 'simple', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // Draw rider sits BEFORE the damage effect so it reads pre-hit
    // armor/shield (matches the apply_poison_vs_armor pattern on
    // Bone Mace / Bone Club).
    effects: [
      new CardEffect('draw_vs_armor', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('armor_bonus_damage', 24, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'common', tier: 2,
    // +1 base, +1 vs Armor/Shield per offset (2/+2 -> 3/+3 …).
    gamePlusOffset: { armor_bonus_damage: { base: 1, bonus: 1 } },
  });
}

export function createObsidianEdge() {
  return new Card({
    id: 'obsidian_edge', name: 'Obsidian Edge',
    description: 'Deal 5 Damage (+2 vs Armor/Shield) + Fire.',
    shortDesc: '5 Dmg (+2 vs\nArmor) + Fire',
    subtype: 'martial', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // armor_bonus_damage encodes base * 10 + total. 5 base + 2 vs Armor
    // = 7 total → 57.
    effects: [
      new CardEffect('armor_bonus_damage', 57, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire', 1, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'uncommon', tier: 2,
    // +2 base, +1 vs Armor/Shield, +1 Fire per offset.
    gamePlusOffset: { armor_bonus_damage: { base: 2, bonus: 1 }, apply_fire: 1 },
  });
}

export function createObsidianStaff() {
  return new Card({
    id: 'obsidian_staff', name: 'Obsidian Staff',
    description: 'Recharge a Card -> Deal 2 (+2 vs Armor/Shield). Summon an Obsidian Construct, Draw.',
    shortDesc: 'R-Card->2 Dmg (+2)\nSummon, Draw',
    subtype: 'staff', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // armor_bonus_damage encodes base * 10 + total. 2 base + 2 vs Armor
    // = 4 total → 24.
    effects: [
      new CardEffect('armor_bonus_damage', 24, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('summon_obsidian_construct', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    previewCreature: createObsidianConstructCreature(),
    // +1 base / +1 vs Armor-Shield per offset for the hit. The
    // Obsidian Construct summon scales via CREATURE_TIER_OFFSET
    // ('Obsidian Construct': { attack: 1, hp: 1, armor: 1/3,
    // armorBonus: 1 }); custom branch in applyGamePlusOffsetInPlace
    // rebuilds the description so the summon line shows the bumped
    // 3/5 (+3 vs Armor/Shield) numbers at offset 1, 4/6 at +2, etc.
    gamePlusOffset: { armor_bonus_damage: { base: 1, bonus: 1 } },
  });
}

export function createObsidianSpear() {
  return new Card({
    id: 'obsidian_spear', name: 'Obsidian Spear',
    description: 'Recharge a Card -> Deal 8, Draw vs Armor/Shield.',
    shortDesc: 'R-Card->8 Dmg\nDraw vs Armor',
    subtype: 'martial_2h', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // draw_vs_armor sits BEFORE the damage effect so it reads pre-hit
    // armor/shield (matches Obsidian Rock / Bone Mace ordering). Target
    // is SINGLE_ENEMY so the handler checks the enemy's armor instead
    // of the caster's. With SELF the check always saw player.armor = 0
    // and silently failed.
    effects: [
      new CardEffect('draw_vs_armor', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 8, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    gamePlusOffset: { damage: 4 },
  });
}

export function createObsidianShard() {
  return new Card({
    id: 'obsidian_shard', name: 'Obsidian Shard',
    description: 'Deal 2 Damage (+2 vs Armor/Shield). Stays in hand.',
    shortDesc: '2 Dmg (+2 vs\nArmor), Stay',
    subtype: 'simple', cardType: CardType.ATTACK, costType: CostType.FREE,
    effects: [
      new CardEffect('armor_bonus_damage', 24, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    // +1 base, +1 vs Armor/Shield per offset.
    gamePlusOffset: { armor_bonus_damage: { base: 1, bonus: 1 } },
  });
}

export function createObsidianCore() {
  return new Card({
    id: 'obsidian_core', name: 'Obsidian Core',
    description: 'Next attack: +2 vs Armor/Shield, Draw.',
    shortDesc: '+2 vs Armor\nDraw',
    subtype: 'relic', cardType: CardType.RELIC, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('grant_obsidian_buff', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare', tier: 2,
    gamePlusOffset: { grant_obsidian_buff: 2 },
  });
}

export function createObsidianSlimeCard() {
  return new Card({
    id: 'obsidian_slime_card', name: 'Obsidian Slime',
    description: 'Recharge -> Summon 1 Obsidian Slime.\n+2 vs Armor/Shield.',
    shortDesc: 'R->Summon\nObsidian Slime',
    subtype: 'allies', cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_obsidian_slime', 1, TargetType.SUMMON)],
    rarity: 'rare', tier: 2,
    previewCreature: createObsidianSlimeSummonCreature(),
    // +1 max Obsidian Slime per offset. Each spawned slime scales via
    // CREATURE_TIER_OFFSET['Obsidian Slime'] (+1 atk / +1 hp / +1
    // armor / +1 vs Armor-Shield bonus). Custom obsidian_slime_card
    // branch in applyGamePlusOffsetInPlace rebuilds the description
    // so it reads "Summon 1-N Obsidian Slimes. +X vs Armor/Shield."
    gamePlusOffset: { summon_obsidian_slime: 1 },
  });
}

// ============================================================
// Personal Quarters Loot — The Queen's Locket
// Granted by the chest in the Personal Quarters after the throne
// audience. Mirrors PY cards_basic.py:create_queens_locket.
// ============================================================

export function createQueensLocket() {
  return new Card({
    id: 'queens_locket',
    name: "The Queen's Locket",
    description: "Queen's Gift, Draw.\nA random blessing of Shield, Heroism, Heal or Draw.",
    shortDesc: "Queen's Gift\nDraw",
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('queens_gift', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    isUnique: true,
    // Empty {} opts in to the codex codex no-rules-needed badge —
    // the gift roll is implicit and scales by breadth, not digits.
    gamePlusOffset: {},
  });
}

// ============================================================
// Companion Cards
// ============================================================

// Thorb the Dwarf Warrior — player ally summoned by Thorb cards.
// Ready immediately (not exhausted), gains +1 Shield at end of player turn
// (the actual shield-gain hook lives in main.js's endPlayerTurn — keyed by
// creature.name === "Thorb").
export function createThorbCreature() {
  return new Creature({
    name: 'Thorb',
    attack: 2,
    maxHp: 4,
    armor: 1,
    isCompanion: true,
    // Turn End: +Shield power dropped across all three Thorb tiers
    // (per balance pass) — the standing buff is just Armor 1 now.
    description: '',
    noTierOffset: true,
  });
}

export function createThorbUpgradedCreature() {
  return new Creature({
    name: 'Thorb',
    attack: 3,
    maxHp: 6,
    armor: 1,
    sentinel: true,
    isCompanion: true,
    description: 'Sentinel.',
    noTierOffset: true,
  });
}

// Thorb tier 3 — ccgQuest+ rescue version (offset 2+). Bigger stat
// line over tier 2 (+1 attack), keeps Sentinel + 1 armor. Turn End
// shield power dropped per balance pass — the armor + Sentinel kit
// is the standing buff now.
export function createThorbTier3Creature() {
  return new Creature({
    name: 'Thorb',
    attack: 4,
    maxHp: 11,
    armor: 1,
    sentinel: true,
    isCompanion: true,
    description: 'Sentinel.',
    noTierOffset: true,
  });
}

// Brad the Fox — tier-3 rare Ally companion. Glass-cannon skirmisher:
// hits hard the turn he lands (Haste) and slips half the blows aimed at
// him (dodgeChance 50). Summoned by createBradCard / the summon_brad
// handler; the dodge is resolved centrally in Creature.takeDamage.
export function createBradCreature() {
  return new Creature({
    name: 'Brad the Fox',
    attack: 3,
    maxHp: 4,
    haste: true,
    poisonAttack: true,
    dodgeChance: 50,
    isCompanion: true,
    // Poison is shown by the poisonAttack rider icon next to the attack
    // stat — don't repeat the word here or it renders a second inline icon.
    description: 'Haste.\nOn Hit: 50% to avoid the damage.',
    noTierOffset: true,
  });
}

// Cornis Metalhands — deep gnome smith of the Underdark village, his hands
// mithril from the wrist down and cut to take a socketed tool: he screws on a
// hammer, a pick, a blade, whatever the fight wants. Haste + Attack Twice makes
// him a burst of two swings the turn he lands, and at end of turn he walks off
// the field and back into your hand (see the end-of-turn return in main.js), so
// he's re-castable every turn instead of holding ground.
export function createCornisCreature() {
  return new Creature({
    name: 'Cornis Metalhands',
    attack: 2,
    maxHp: 3,
    haste: true,
    isCompanion: true,
    // Mithril hands chew plate: every swing stacks 1 Sunder. Shown as the
    // Sunder rider icon next to the attack stat (like Brad's poison fang), so
    // the word isn't repeated in the description.
    sunderAttack: 1,
    description: 'Haste. Attack Twice.\nEnd of turn: return to hand.',
    noTierOffset: true,
  });
}

// Raena base creature — recruited at Calm Grove. Attacks 2 targets.
export function createRaenaCreature() {
  return new Creature({
    name: 'Raena', attack: 2, maxHp: 3, multiAttack: 2, isCompanion: true,
    description: 'Attacks 2 targets.',
    noTierOffset: true,
  });
}

// Raena tier-2 — Welcome to Tharnag upgrade. +1 attack, +1 max HP.
export function createRaenaUpgradedCreature() {
  return new Creature({
    name: 'Raena', attack: 3, maxHp: 5, multiAttack: 2, isCompanion: true,
    description: 'Attacks 2 targets.',
    noTierOffset: true,
  });
}

// Raena tier 3 — ccgQuest+ rescue version (offset 2+). Multi-attack count is
// unchanged; the glass-cannon stat line jumps to 5/7 over tier 2's 3/5.
export function createRaenaTier3Creature() {
  return new Creature({
    name: 'Raena', attack: 5, maxHp: 7, multiAttack: 2, isCompanion: true,
    description: 'Attacks 2 targets.',
    noTierOffset: true,
  });
}

export function createThorbCard() {
  return new Card({
    id: 'thorb_card',
    name: 'Thorb',
    description: 'Recharge a card ->\nCall Thorb to the battle!\nDraw.',
    shortDesc: 'Call Thorb\nDraw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_thorb', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    isUnique: true,
    tier: 1,
    previewCreature: createThorbCreature(),
    // Companion card — the offset system swaps to the next tier card
    // via COMPANION_TIER_CHAINS rather than name-stamping this one.
    noTierOffset: true,
  });
}

export function createThorbUpgradedCard() {
  return new Card({
    id: 'thorb_card_2',
    name: 'Thorb',
    description: 'Recharge a card ->\nCall Thorb to the battle!\nDraw.',
    shortDesc: 'Call Thorb\nDraw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_thorb_upgraded', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    isUnique: true,
    tier: 2,
    previewCreature: createThorbUpgradedCreature(),
    // Companion card — the offset system swaps tier chain ids
    // rather than name-stamping this card.
    noTierOffset: true,
  });
}

// Thorb tier 3 — ccgQuest+ rescue version at offset 2+. Summons a
// 3/7 sentinel Thorb (see createThorbTier3Creature).
export function createThorbTier3Card() {
  return new Card({
    id: 'thorb_card_3',
    name: 'Thorb',
    description: 'Recharge a card ->\nCall Thorb to the battle!\nDraw.',
    shortDesc: 'Call Thorb\nDraw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_thorb_tier3', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    isUnique: true,
    tier: 3,
    previewCreature: createThorbTier3Creature(),
    // Top of the Thorb tier chain — no further offset stamping.
    noTierOffset: true,
  });
}

// Brad the Fox — tier-3 rare Ally companion card. Same call-a-companion
// shape as Thorb (Recharge a card -> summon + draw), but Brad is a Haste
// glass cannon with a 50% on-hit dodge (see createBradCreature). Single
// tier for now — not in COMPANION_TIER_CHAINS, so the ccgQuest+ offset
// system leaves it as-is.
export function createBradCard() {
  return new Card({
    id: 'brad_card',
    name: 'Brad the Fox',
    description: 'Recharge a Card ->\nCall Brad the Fox\nto the battle!\nDraw.',
    shortDesc: 'Call Brad\nDraw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_brad', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    isUnique: true,
    tier: 3,
    previewCreature: createBradCreature(),
    // Companion card — no name-stamp / offset scaling.
    noTierOffset: true,
  });
}

// Cornis Metalhands — tier-3 rare Ally card, same call-a-companion shape as
// Thorb / Brad (Recharge a card -> summon + draw). The difference is he doesn't
// stay: he swings twice on arrival and returns to hand at end of turn, BEFORE
// the refill draw, so he occupies a hand slot going into the next turn.
export function createCornisCard() {
  return new Card({
    id: 'cornis_card',
    name: 'Cornis Metalhands',
    description: 'Recharge a Card ->\nCall Cornis Metalhands\nto the battle!\nDraw.',
    shortDesc: 'Call Cornis\nDraw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_cornis', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    isUnique: true,
    tier: 3,
    previewCreature: createCornisCreature(),
    // Companion card — no name-stamp / offset scaling.
    noTierOffset: true,
  });
}

// ============================================================
// Dwarven Shop Cards
// ============================================================

export function createDwarvenCrossbow() {
  return new Card({
    id: 'dwarven_crossbow',
    name: 'Dwarven Crossbow',
    description: 'Recharge a Card -> Deal 4 True Damage, Draw.',
    shortDesc: 'R-Card->4 True Dmg, Draw',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('unpreventable_damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    gamePlusOffset: { unpreventable_damage: 2 },
  });
}

export function createDwarvenGreaves() {
  return new Card({
    id: 'dwarven_greaves',
    name: 'Dwarven Greaves',
    description: 'Block 3, Strip 2 Shields randomly, Draw.\nOn Recharge: Gain Shield.',
    shortDesc: 'Block 3\nStrip 2 Shield\nDraw / On R: +Shield',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      // Strips 1 Shield from up to 2 random shielded enemies — total
      // shields destroyed = min(2, # enemies with shield). See
      // destroy_shield_random handler in main.js.
      new CardEffect('destroy_shield_random', 2, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_recharge_shield', 1, TargetType.SELF),
    ],
    tier: 2,
    // +2 block, +1 to max strip-shield targets per offset.
    gamePlusOffset: { block: 2, destroy_shield_random: 1 },
  });
}

function createDwarvenScoutCreature() {
  return new Creature({
    name: 'Dwarven Scout',
    attack: 2,
    maxHp: 5,
    shield: 1,
    endTurnDamage: 1,
    isCompanion: true,
    // Compact phrasing — "to random enemy" overflowed the small
    // preview box (Animal-Companion-style modal pick) at base sizes;
    // dropping the article keeps the rider on one wrapped line.
    description: 'Turn End: 1 Random Dmg',
  });
}

export function createDwarvenScoutCard() {
  return new Card({
    id: 'dwarven_scout',
    name: 'Dwarven Scout',
    description: 'Play -> Call Dwarven Scout to the battle!',
    shortDesc: 'Call Scout',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_dwarven_scout', 1, TargetType.SUMMON)],
    rarity: 'common',
    tier: 2,
    previewCreature: createDwarvenScoutCreature(),
    // Card carries no numeric effect to bump — the offset just stamps
    // the "+" / tier suffix on the card (helps the codex preview show
    // the upgrade). The Dwarven Scout summon is what actually scales,
    // via CREATURE_TIER_OFFSET (+1 atk / +1 hp / +1 turn-end damage).
    gamePlusOffset: {},
  });
}

// Dwarven Crossbowman — Dwarven Tavern recruit (post-dragon). Summons the
// same 2-Atk True-Damage crossbowman that mans the line at the Gate of the
// Deep. Companion-routed like the Dwarven Scout.
export function createDwarvenCrossbowmanCard() {
  return new Card({
    id: 'dwarven_crossbowman',
    name: 'Dwarven Crossbowman',
    description: 'Call Dwarven Crossbowman\nto the battle!',
    shortDesc: 'Call\nCrossbowman',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_dwarven_crossbowman', 1, TargetType.SUMMON)],
    rarity: 'uncommon',
    tier: 2,
    previewCreature: new Creature({
      name: 'Dwarven Crossbowman', attack: 2, maxHp: 5, shield: 1,
      unpreventable: true, description: 'Attacks deal True Damage.',
    }),
    gamePlusOffset: {},
  });
}

// Dwarven Battle Cleric — Dwarven Tavern recruit (post-dragon). Front-line
// healer: hits harder vs armored foes and patches up a wounded ally each
// turn. Companion-routed like the Crossbowman.
export function createDwarvenBattleClericCard() {
  return new Card({
    id: 'dwarven_battle_cleric',
    name: 'Dwarven Battle Cleric',
    description: 'Call Dwarven Battle Cleric\nto the battle!',
    shortDesc: 'Call\nBattle Cleric',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_dwarven_battle_cleric', 1, TargetType.SUMMON)],
    rarity: 'uncommon',
    tier: 2,
    previewCreature: (() => {
      const c = new Creature({
        name: 'Dwarven Battle Cleric', attack: 2, maxHp: 5, armor: 1,
        description: '+2 vs Armor/Shield.\nTurn End: Heal an ally 2.',
      });
      c.endTurnHealRandomAlly = 2;
      return c;
    })(),
    gamePlusOffset: {},
  });
}

export function createDwarvenBrew() {
  return new Card({
    id: 'dwarven_brew',
    name: 'Dwarven Brew',
    description: 'Consume -> Heal 2, Gain Shield.\nBeverage: +Shield for 4 turns.',
    shortDesc: 'C->Heal 2, +Shield\nBeverage: +Shield/4T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 2, TargetType.SELF),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'beverage',
      name: 'Dwarven Brew',
      effectType: 'gain_shield',
      value: 1,
      turnsPerCombat: 4,
      description: '+1 Shield each turn for 4 turns (each combat, until rest)',
    },
    tier: 2,
    // +1 Consume heal + +1 Consume shield per offset.
    gamePlusOffset: { heal: 1, gain_shield: 1 },
  });
}

// Whitescale Brew — post-dragon premium beverage. Frost-herb mead
// brewed from Varimatras's downfall: served very cold, honors the
// kill. Consume → Heal 2 + Heroism + Ice a random enemy. Beverage
// slot ticks +1 Heroism + 1 Ice on a random enemy each turn for
// 4 turns each combat (until rest). The Ice-to-random-enemy tick
// is handled by the new `apply_ice_random_enemy` case in
// _applyBuffTickEffect which receives the enemy reference.
export function createWhitescaleBrew() {
  return new Card({
    id: 'whitescale_brew',
    name: 'Whitescale Brew',
    description: 'Consume -> Heal 2, Gain 1 Heroism, Gain 1 Ice.\nBeverage: +Heroism, Deal Ice Randomly for 4 turns.',
    shortDesc: 'C->Heal 2, +1 Heroism\n+1 Ice self\nBev: Heroism+Ice/4T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 2, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      // Consume puts the Ice on the PLAYER (you drink it cold — it
      // shows up on YOU). The beverage tick is the part that
      // throws Ice at a random enemy.
      new CardEffect('apply_ice_self', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    // Multi-effect beverage — every tick fires Heroism + Ice on a
    // random alive enemy. "Randomly" in the description implies
    // enemy-only per the player request.
    provision: {
      slot: 'beverage',
      name: 'Whitescale Brew',
      turnsPerCombat: 4,
      effects: [
        { effectType: 'gain_heroism', value: 1 },
        { effectType: 'apply_ice_random_enemy', value: 1 },
      ],
      description: '+1 Heroism + 1 Ice Randomly each turn for 4 turns (each combat, until rest)',
    },
    rarity: 'uncommon',
    tier: 2,
    // +1 Consume heal, +1 Consume heroism, +1 Consume Ice per
    // offset. The beverage tick stays flat (its job is the
    // sustained pressure, not the burst).
    gamePlusOffset: { heal: 1, gain_heroism: 1, apply_ice_self: 1 },
  });
}

export function createWhiteWolfCloak() {
  return new Card({
    id: 'white_wolf_cloak',
    name: 'White Wolf Cloak',
    description: 'Block 2, Clear 2 Ice, Scry 2.',
    shortDesc: 'Block 2, Clear 2 Ice\nScry 2',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('clear_ice', 2, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    rarity: 'rare',
    gamePlusOffset: { block: 2, clear_ice: 2, scry_pick: 1 },
  });
}

// === Sahuagin Sentinel loot drops (mirrors PY get_sahuagin_sentinel_loot) ===
export function createSahuaginTridentLoot() {
  return new Card({
    id: 'sahuagin_trident',
    name: 'Sahuagin Trident',
    description: 'Recharge a Card -> Deal 3 + Bleed, Draw.',
    shortDesc: 'R-Card->3 Dmg+Bleed\nDraw',
    subtype: 'simple_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 2, apply_bleed: 1 },
  });
}

export function createFishScaleBoots() {
  return new Card({
    id: 'fish_scale_boots',
    name: 'Fish Scale Boots',
    // "On Swim" prefix renders as a pill thanks to inlineBadgeRe.
    description: 'Block 2, Ice ALL, Draw.\nOn Swim: Draw 2.',
    shortDesc: 'Block 2, Ice ALL\nDraw\nOn Swim: Draw 2',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('apply_ice_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_swim_recharge_draw', 2, TargetType.SELF),
    ],
    rarity: 'rare',
    gamePlusOffset: { block: 1, apply_ice_all: 1 },
  });
}

export function createSahuaginEye() {
  return new Card({
    id: 'sahuagin_eye',
    name: 'Sahuagin Eye',
    description: 'Next Attack: Bleeding: +1 Damage.\nStays in hand.',
    shortDesc: 'Next Atk:\nBleeding +1\nStays',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.FREE,
    effects: [
      new CardEffect('grant_bleeding_damage_buff', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'epic',
    // +1 bleeding damage per offset on the one-shot rider. The card
    // is FREE + stays-in-hand, so the player re-plays it every turn
    // to refresh the buff.
    gamePlusOffset: { grant_bleeding_damage_buff: 1 },
  });
}

// Piranhas swarm summon — disposable bleed swarm that crumbles at end
// of turn. Reused art from the Piranha Pool swim phase.
function createPiranhasCreature() {
  return new Creature({
    name: 'Piranhas',
    attack: 0,
    maxHp: 1,
    bleedAttack: 1,
    haste: true,
    endOfTurnDeath: true,
    description: 'Atk + Bleed. Haste.\nDies at end of turn.\nOccasionally Edible.',
  });
}

// Jar of Piranhas — Sahuagin Sentinel rare drop. Pops 1-2 Piranhas
// every recharge for a short bleed burst. The swarm's bleed pings
// pair with Sahuagin Eye / Trident Throw bleed payoffs.
export function createJarOfPiranhas() {
  return new Card({
    id: 'jar_of_piranhas',
    name: 'Jar of Piranhas',
    description: 'Recharge -> Summon 1-2 Piranhas.',
    shortDesc: 'R->Summon\n1-2 Piranhas',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_piranhas', 2, TargetType.SUMMON),
    ],
    previewCreature: createPiranhasCreature(),
    rarity: 'rare',
    tier: 1,
    // +1 max piranhas per offset. Each piranha scales separately via
    // CREATURE_TIER_OFFSET['Piranhas'] (+1 bleed per offset).
    gamePlusOffset: { summon_piranhas: 1 },
  });
}

// Swimming In Current — pseudo-card displayed in the showcase slot
// during the Piranha Pool swim phase (and any future encounter that
// uses the swim mechanic). Not playable. Mirrors PY's swim overlay
// title + description; the visible art is SwimingInCurrent.jpg.
export function createSwimmingShowcase(opts = {}) {
  // Default text matches the Piranha Pool / open-water swim phase
  // (1-3 cards per turn). Other callers (Giant Frog swim_drag forces
  // exactly 1) can override the description + shortDesc so the card
  // reflects their own recharge cap.
  const description = opts.description || 'To Swim: Recharge 1 to 3 cards.';
  const shortDesc = opts.shortDesc || 'Swim:\nR 1-3 Cards';
  return new Card({
    id: 'swimming_in_current',
    name: 'Swimming In Current',
    description,
    shortDesc,
    subtype: 'spell',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [],
    isToken: true,
    rarity: 'rare',
  });
}

// Whirlpool — Sahuagin Priest spell. Mirrors PY create_whirlpool:
// applies one Whirlpool stack on the player. At the start of the
// player's next turn, each stack forces a swim of 1 (one hand-card
// recharge OR 1 deck damage if the hand is empty). On Swim effects
// (Fish Scale Boots / Barnacle Encrusted Plate) fire on each
// recharge. Played by the priest's deck AND by the High Priest
// creature summon — both routes funnel through apply_whirlpool.
export function createWhirlpool() {
  return new Card({
    id: 'whirlpool',
    name: 'Whirlpool',
    description: 'Recharge -> Whirlpool: Player must recharge 1 card or take 1 damage at start of turn.',
    shortDesc: 'R->Whirlpool\nDebuff',
    subtype: 'spell',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_whirlpool', 1, TargetType.SINGLE_ENEMY),
    ],
    priority: 7,
    rarity: 'rare',
    // +0.5 stacks of Whirlpool per offset (floor) — more cards the
    // player has to recharge on resolution. The apply_whirlpool
    // handler also reads monsterTierOffset to bump the per-stack
    // failure damage by +3 per offset.
    gamePlusOffset: { apply_whirlpool: 0.5 },
  });
}

// Gnikan's Staff — chapter-8 frost-shaman drop. Builds up Ice on
// the caster, then explodes that Ice into an Ice Elemental ally
// whose stats scale with the burst size. Each cast deals 1 dmg +
// applies 1 Ice to the target AND adds 1 Ice to the caster; then
// `summon_ice_burst` consumes ALL stacked Ice on the caster and
// spawns an N/N elemental (N = Ice lost). So a fresh first cast
// summons a 1/1, but if the caster already had Ice stacked (from
// Ice Bolt riders, Gravechill Shard, Ice Block, etc.) the staff
// pays off proportionally — 5 Ice stored + 1 from the cast → 6/6
// elemental.
export function createGnikansStaff() {
  return new Card({
    id: 'gnikans_staff',
    name: "Gnikan's Staff",
    description: 'Recharge a Card -> Gain Ice. Allies lose all Ice -> Summon an Ice Elemental with Atk and HP equal to the Ice lost. Then Deal 3 + Ice, Draw.',
    shortDesc: 'R-Card->Gain Ice\nAllies->N/N\nDeal 3+Ice, Draw',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // Effect order matters: gain Ice on the caster first (cosmetic
    // for Gnikan, useful synergy for the player), then the burst
    // strips all Ice from the caster's allies and converts the sum
    // into an Ice Elemental, THEN the swing lands.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_ice_self', 1, TargetType.SELF),
      new CardEffect('summon_ice_burst', 1, TargetType.SUMMON),
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 2,
    // +2 self-Ice (= bigger pre-burst stack → fatter Ice Elemental),
    // +1 hit damage, and +1/3 Ice on the swing per offset.
    gamePlusOffset: { apply_ice_self: 2, damage: 1, apply_ice: 1/3 },
    previewCreature: (() => {
      // Ice Elemental side preview. `_iceAbsorb` matches the boss's
      // version so the codex Summons entry advertises the same
      // power; `_codexVariableStats` keeps the player-side card
      // entry collapsed to a single X / X tile. `iceAttack` shows
      // the ice rider in the codex stats panel.
      const c = new Creature({
        name: 'Ice Elemental', attack: 1, maxHp: 1, iceAttack: 1,
        description: 'Ice Absorb: gain +1/+1 from any Ice that would land. Attacks apply 1 Ice.',
        // Ice Elemental's scaling comes from the Ice consumed at
        // cast time, not from tier offset — opt out of the codex
        // "needs rules" badge entirely.
        noTierOffset: true,
      });
      c._iceAbsorb = true;
      c._codexVariableStats = true;
      return c;
    })(),
  });
}

// Sahuagin Priest Staff — Sahuagin Priest drop. Stamps Bleed + Ice and
// summons a Shark; the Shark's own bite then applies extra Bleed and
// hits harder on bleeding targets, so the whole package compounds.
export function createSahuaginPriestStaffLoot() {
  return new Card({
    id: 'sahuagin_priest_staff',
    name: 'Sahuagin Priest Staff',
    description: 'Recharge a Card -> Deal Bleed + Ice, Summon a Shark, Draw.',
    shortDesc: 'R-Card->Bleed+Ice\nSummon Shark, Draw',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('summon_shark', 1, TargetType.SUMMON),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    previewCreature: new Creature({
      name: 'Shark', attack: 2, maxHp: 4, bleedAttack: 1, bleedingBonus: 2,
      description: 'Atk + Bleed. Bleeding: +2 Damage.',
    }),
    // +1 Bleed / +1 Ice per offset. The Shark summon scales via
    // CREATURE_TIER_OFFSET['Shark'].
    gamePlusOffset: { apply_bleed: 1, apply_ice: 1 },
  });
}

// Dire Bear — Mountain Cave boss attack cards.
export function createDireClaws() {
  return new Card({
    id: 'dire_claws',
    name: 'Dire Claws',
    description: 'Recharge -> Deal 2 Damage to up to 2 Targets.',
    shortDesc: 'R->2 Dmg\nx2 Targets',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_random_split', 2, TargetType.ALL_ENEMIES),
    ],
    priority: 5,
    gamePlusOffset: { damage_random_split: 1 },
  });
}

export function createDireBite() {
  return new Card({
    id: 'dire_bite',
    name: 'Dire Bite',
    description: 'Recharge -> Deal 6 Damage.',
    shortDesc: 'R->6 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
    ],
    priority: 6,
    gamePlusOffset: { damage: 2 },
  });
}

export function createDireHide() {
  return new Card({
    id: 'dire_hide',
    name: 'Dire Hide',
    description: 'Recharge -> Block 4, Heal 1 Ailment, Draw.',
    shortDesc: 'R->Block 4\nHeal 1 Ail, Draw',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 4, TargetType.SELF),
      new CardEffect('heal_n_negative_effects', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    priority: 4,
    gamePlusOffset: { block: 2 },
  });
}

// Giant Hyena — the Gnoll Hunter's summon (East Mountain random encounter).
// 3 Atk + 1 Bleed on hit, 6 HP, and a fixed Riposte 1 (reflects 1 to whoever
// strikes it, regardless of its 3 attack — see maybeEnemyRiposte's riposteAmount).
export function createGiantHyenaCreature() {
  const c = new Creature({
    name: 'Giant Hyena', attack: 3, maxHp: 6, bleedAttack: 1,
    description: 'Riposte 1.',
  });
  c.riposte = true;
  c.riposteAmount = 1;
  return c;
}

// Gnoll — the Pack Lord's rank-and-file (start-of-fight litter + the Gnoll
// Pack power's per-turn top-up). A plain 4/4 brawler, no riders.
export function createGnollCreature() {
  const c = new Creature({
    name: 'Gnoll', attack: 3, maxHp: 4,
    description: 'Savage packmate.',
  });
  // Codex framing — summoned by the Gnoll Pack Lord (an ally-type boss summon).
  c._codexSide = 'enemy';
  c._sourceRarity = 'uncommon';
  c._sourceSubtype = 'allies';
  return c;
}

// Gnoll Warrior (summoned ally) — a tougher 4/5 with 1 Armor that carries its
// OWN Rampage: when it kills one of your units it frenzies for +1-2 Heroism and
// +1-2 Shield (the `_rampageOnKill` flag is read by Character.onCreaturesRemoved
// in main.js, the same hook that drives the standalone Gnoll Warrior enemy).
export function createGnollWarriorCreature() {
  const c = new Creature({
    name: 'Gnoll Warrior', attack: 4, maxHp: 5, armor: 1,
    description: 'Rampage: on kill, +1-2 Heroism, +1-2 Shield.',
  });
  c._rampageOnKill = true;
  // Codex framing — summoned by the Gnoll Pack Lord (an ally-type boss summon).
  c._codexSide = 'enemy';
  c._sourceRarity = 'uncommon';
  c._sourceSubtype = 'allies';
  return c;
}

// Gnoll Pack Lord (summoned creature) — called in by the Gnoll Fang of Yeenoghu
// boss (its "1 Pack Lord + 1-2 Hyenas" choice). A 4/4 brute. Reuses the Pack
// Lord portrait automatically via its name (creature_gnoll_pack_lord).
export function createGnollPackLordCreature() {
  const c = new Creature({
    name: 'Gnoll Pack Lord', attack: 4, maxHp: 4,
    description: 'The pack answers to one.',
  });
  // Codex framing — summoned by the Gnoll Fang of Yeenoghu (an ally-type boss summon).
  c._codexSide = 'enemy';
  c._sourceRarity = 'epic';
  c._sourceSubtype = 'allies';
  return c;
}

// Floating Skull — the Floating Skulls ability's swarm summon. A 1/1 with 1
// Armor whose attack applies Poison, and which spits 1 Poison at a random foe
// when it dies (onDeathPoisonRandom). Summoned on either side (the Fang's deck
// AND the player card), so codex framing is stamped at spawn time, not here.
export function createFloatingSkullCreature() {
  const c = new Creature({
    name: 'Floating Skull', attack: 1, maxHp: 1, armor: 1, poisonAttack: true,
    onDeathPoisonRandom: 1,
    description: 'On Death: Deal Poison Randomly.',
  });
  c._sourceRarity = 'epic';
  c._sourceSubtype = 'ability';
  return c;
}

// Bone Flail — Epic Tier 2 Martial Weapon (the Gnoll Fang of Yeenoghu's weapon,
// also its rare drop). Flails wildly: 3 times it strikes a RANDOM foe for 2
// damage + 1 Poison. The `damage_poison_random` effect is caster-aware — the
// player hits the enemy side; the Fang (enemy) hits the player + their summons.
export function createBoneFlail() {
  return new Card({
    id: 'bone_flail', name: 'Bone Flail',
    description: 'Deal 2 + Poison to a random enemy, 3 times.',
    shortDesc: '2 + Poison\nrandom x3',
    subtype: 'martial',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_poison_random', 2, TargetType.RANDOM_ENEMY),
    ],
    tier: 2, rarity: 'epic',
    gamePlusOffset: { damage_poison_random: 1 },
  });
}

// Shadow Clone — Epic Tier 2 Ability. Kills one of the foe's summons (Sentinel
// first, else random) and raises a Shadow Copy of it on the caster's side: same
// stats, a very dark tint, 1 Poison, and it can't attack the turn it's made.
// Caster-aware `shadow_clone` — a player cast steals an enemy summon; the Fang's
// cast steals one of the player's allies. Built-in recharge cost.
export function createShadowClone() {
  return new Card({
    id: 'shadow_clone', name: 'Shadow Clone',
    description: 'Kill an enemy summon and create a Shadow Copy with 1 Poison.',
    shortDesc: 'Kill a summon\nRaise a Shadow',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('shadow_clone', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'epic',
  });
}

// Floating Skulls — Epic Tier 2 Ability. Summons one Floating Skull per foe (the
// enemy boss + each of its allies count). Caster-aware `summon_floating_skulls`.
// Built-in recharge cost. previewCreature surfaces the skull in the codex.
export function createFloatingSkulls() {
  const card = new Card({
    id: 'floating_skulls', name: 'Floating Skulls',
    description: 'Summon 1 Floating Skulls per enemy.',
    shortDesc: '1 Skull\nper enemy',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_floating_skulls', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'epic',
  });
  card.previewCreature = createFloatingSkullCreature();
  return card;
}

// Shadow Drain — Epic Tier 2 Ability. Every one of the caster's allies loses 1
// life (TRUE, unpreventable — it can kill them); then deal 1 to all foes and
// heal the caster 1 per life lost that way. DISCARD cost — like Bandage, the
// card lands in the discard pile after it resolves. Caster-aware `shadow_drain`.
export function createShadowDrain() {
  return new Card({
    id: 'shadow_drain', name: 'Shadow Drain',
    description: 'Each ally lose 1 life.\nDeal to All + Heal, 1 per life lost.',
    shortDesc: 'Allies -1 life\nDrain: AoE + Heal',
    subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.DISCARD,
    effects: [
      new CardEffect('shadow_drain', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'epic',
  });
}

// Ancient Bones — Epic Tier 2 crafting material (like Mithril / Adamantine ore),
// dropped by the Gnoll Fang of Yeenoghu. Can't be played (unplayable) and can't
// be sold (id-gated in canSellAtShop), but the player CAN stock multiples — it's
// the fuel for the Corrupted Shrine enchant, spent 1-per-enchant.
export function createAncientBones() {
  return new Card({
    id: 'ancient_bones', name: 'Ancient Bones',
    description: 'A bundle of ancient, yellowed bones. A powerful aura radiates from within — cold, and patient.',
    shortDesc: 'A powerful aura\nradiates from within',
    subtype: 'item',
    cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [],
    tier: 2, rarity: 'epic',
    unplayable: true,
  });
}

// Bluecap — Common Tier 3 meal, the Underdark's staple crop. The deep gnomes
// grind it into flour; the party just eats it. Light Consume + Recharge 1 heal
// plus a long, cheap 4-turn meal tick.
export function createBluecap() {
  return new Card({
    id: 'bluecap',
    name: 'Bluecap',
    description: 'Consume + Recharge 1 -> Heal 5.\nMeal: Heal 1 for 4 turns.',
    shortDesc: 'C+R1->Heal 5\nMeal: Heal 1/4T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 5, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Bluecap',
      effectType: 'heal',
      value: 1,
      turnsPerCombat: 4,
      description: 'Heal 1 each turn for 4 turns (each combat, until rest)',
    },
    rarity: 'common',
    tier: 3,
    gamePlusOffset: { heal: 2 },
  });
}

// Barrelstalk — Uncommon Tier 3 fungus that's food AND drink: the stalk holds
// clean water, the flesh is a meal. The only card that fills BOTH provision
// slots off one Consume (see the `provisions` array support in the
// grant_provision handler).
export function createBarrelstalk() {
  return new Card({
    id: 'barrelstalk',
    name: 'Barrelstalk',
    description: 'Consume + Recharge 2 -> Heal 6.\nMeal: Heal 1 for 3 turns.\nBeverage: Heal 1 for 3 turns.',
    shortDesc: 'C+R2->Heal 6\nMeal: Heal 1/3T\nBev: Heal 1/3T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 6, TargetType.SELF),
      new CardEffect('recharge_extra', 2, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    // Dual-slot: one bite fills the Meal slot, the water in the stalk fills
    // the Beverage slot. Each replaces whatever was in its own slot.
    provisions: [
      {
        slot: 'meal',
        name: 'Barrelstalk',
        effectType: 'heal',
        value: 1,
        turnsPerCombat: 3,
        description: 'Heal 1 each turn for 3 turns (each combat, until rest)',
      },
      {
        slot: 'beverage',
        name: 'Barrelstalk Water',
        imageId: 'barrelstalk',
        effectType: 'heal',
        value: 1,
        turnsPerCombat: 3,
        description: 'Heal 1 each turn for 3 turns (each combat, until rest)',
      },
    ],
    rarity: 'uncommon',
    tier: 3,
    gamePlusOffset: { heal: 2 },
  });
}

// Rare Mushroom — Rare Tier 3 material, the Ancient Bones treatment: can't be
// played (unplayable), can't be sold (id-gated in canSellAtShop), stacks freely
// in the backpack. No use wired yet — it's fuel for something later.
export function createRareMushroom() {
  return new Card({
    id: 'rare_mushroom', name: 'Rare Mushroom',
    description: 'An exceptionally rare fungus with powerful magical properties. Its true use is unknown.',
    shortDesc: 'Powerful magic within\nIts use is unknown',
    subtype: 'item',
    cardType: CardType.ITEM, costType: CostType.RECHARGE,
    effects: [],
    tier: 3, rarity: 'rare',
    unplayable: true,
  });
}

// Bone Whip (Gnoll Pack Lord) — the boss's rally engine. A Simple Weapon that
// lashes Poison across the whole party and rouses the pack (every enemy ally
// gains Heroism). Uses the caster-aware `apply_poison_all_foes` so an enemy
// holder poisons the PLAYER side; `buff_allies_heroism` only touches allies,
// never the caster. Sound auto-routes to whip_crack via the id substring.
export function createBoneWhip() {
  return new Card({
    id: 'bone_whip', name: 'Bone Whip',
    description: 'Deal Poison to All.\nAllies Gain Heroism.',
    shortDesc: 'Poison All\nAllies +Heroism',
    subtype: 'simple', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_poison_all_foes', 1, TargetType.ALL_ENEMIES),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
    ],
    priority: 20,
    tier: 2, rarity: 'epic', noTierOffset: true,
    gamePlusOffset: { apply_poison_all_foes: 1, buff_allies_heroism: 1 },
  });
}

export function createSummonGiantHyena() {
  return new Card({
    id: 'summon_giant_hyena', name: 'Summon Giant Hyena',
    description: 'Summon a Giant Hyena (3 + Bleed, 6 HP, Riposte 1).',
    shortDesc: 'Summon\nGiant Hyena',
    subtype: 'allies', cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_giant_hyena', 1, TargetType.SUMMON)],
    previewCreature: createGiantHyenaCreature(),
    tier: 2, rarity: 'uncommon', noTierOffset: true,
  });
}

// Gnoll Hunter weapons (East Mountain). Enemy-played attacks — their effects
// (first_strike_poison_attack / bone_javelin_attack / bite_attack) resolve in
// the enemy attack loop in main.js and each bumps attacksThisTurn so Bone Bow's
// First Strike reads correctly.
export function createBoneBow() {
  return new Card({
    id: 'bone_bow', name: 'Bone Bow',
    description: 'Recharge a Card -> Deal 8, Draw.\nFirst Strike: Poison',
    shortDesc: 'R-Card->8, Draw\nFirst Strike: Poison',
    subtype: 'ranged', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('first_strike_poison_attack', 8, TargetType.SINGLE_ENEMY, 1),
      new CardEffect('draw', 1, TargetType.SELF),
      // "Recharge a Card" — costs an extra card, so the Draw offsets the
      // recharge instead of net-growing the turn (no infinite draw chain).
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    priority: 25,
    tier: 2, rarity: 'rare', noTierOffset: true,
  });
}

export function createBoneJavelin() {
  return new Card({
    id: 'bone_javelin', name: 'Bone Javelin',
    description: 'Deal 6 + Poison.\n+6 Against Summons.',
    shortDesc: '6 + Poison\n+6 vs Summons',
    subtype: 'martial_2h', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('bone_javelin_attack', 6, TargetType.SINGLE_ENEMY, 6),
    ],
    priority: 15,
    tier: 2, rarity: 'rare', noTierOffset: true,
  });
}

export function createGnollBite() {
  return new Card({
    id: 'gnoll_bite', name: 'Bite',
    description: 'Deal 4 + Bleed.',
    shortDesc: '4 + Bleed',
    subtype: 'simple', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('bite_attack', 4, TargetType.SINGLE_ENEMY),
    ],
    priority: 12,
    tier: 2, rarity: 'uncommon', noTierOffset: true,
  });
}

// Gnoll Hunter loot (East Mountain). Beast Collar's Riposte 1 + Beastmaster
// Horn's summon resolve in main.js; Pack Hyena scales +1 Atk per ally.
export function createPackHyenaCreature() {
  const c = new Creature({
    name: 'Pack Hyena', attack: 1, maxHp: 4,
    description: '+1 Atk per adjacent ally (max 3).',
  });
  c.packTactics = true;
  // Rare-rarity framing in the codex (all spawns route through this creator).
  c._sourceRarity = 'rare';
  c._sourceSubtype = 'allies';
  return c;
}

// Summon Hyena Pack (Gnoll Warrior, monster-only) — drops 2-4 Pack Hyenas at
// once. Each Pack Hyena gains +1 Atk per orthogonally adjacent ally (max +3),
// so a tightly-packed litter hits far above its 1 base attack.
export function createSummonHyenaPack() {
  return new Card({
    id: 'summon_hyena_pack', name: 'Summon Hyena Pack',
    description: 'Summon 2-4 Pack Hyenas.',
    shortDesc: 'Summon 2-4\nPack Hyenas',
    subtype: 'allies', cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_hyena_pack', 3, TargetType.SUMMON)],
    previewCreature: createPackHyenaCreature(),
    tier: 2, rarity: 'rare', noTierOffset: true,
  });
}

// Bone Cage (Gnoll Warrior) — Tier 2 epic heavy armor. A bigger reactive wall
// than Dire Hide: Block 5, poison the whole opposing side, and draw. Played
// reactively when its holder is attacked (works on either side —
// apply_poison_all_foes is caster-aware).
export function createBoneCage() {
  return new Card({
    id: 'bone_cage', name: 'Bone Cage',
    description: 'Block 5, Deal Poison to All, Draw.',
    shortDesc: 'Block 5\nPoison All, Draw',
    subtype: 'heavy_armor', cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
      new CardEffect('apply_poison_all_foes', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    priority: 5,
    tier: 2, rarity: 'epic',
    gamePlusOffset: { block: 2 },
  });
}

export function createBeastCollar() {
  return new Card({
    id: 'beast_collar', name: 'Beast Collar',
    description: 'Riposte 1.\nBlock 5, Heal 2 Bleed, Draw.',
    shortDesc: 'Riposte 1\nBlock 5, Heal 2 Bleed, Draw',
    subtype: 'light_armor', cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
      new CardEffect('heal_bleed', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    gamePlusOffset: { block: 2 },
  });
}

// Bone Cleaver — Uncommon Tier 2 simple weapon from the gnoll loot. A crude
// two-headed bone chopper: 2 damage + Poison to 2 targets (multi_damage +
// multi-target apply_poison, same shape as the Jagged Chopper's Bleed version).
export function createBoneCleaver() {
  return new Card({
    id: 'bone_cleaver', name: 'Bone Cleaver',
    description: 'Deal 2 + Poison on 2 targets.',
    shortDesc: '2 + Poison\nx2',
    subtype: 'simple', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('multi_damage', 2, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY, 2),
    ],
    tier: 2, rarity: 'uncommon',
    gamePlusOffset: { multi_damage: 1.5, apply_poison: 1 },
  });
}

// Cracked Marrow-Bone — Common Tier 2 food (a gnaw-open marrow bone, gnoll
// staple). Modeled on Bear Fat Rations: a Consume + Recharge 1 meal that clears
// ALL Bleed and heals 6, milling 1 card as the queasy cost, then leaves a 3-turn
// meal buff of Heal 2 Bleed + Heal 1.
export function createCrackedMarrowBone() {
  return new Card({
    id: 'cracked_marrow_bone', name: 'Cracked Marrow-Bone',
    description: 'Consume + Recharge 1 ->\nHeal all Bleed, Heal 6, discard 1.\nMeal: Heal 2 Bleed, Heal 1 for 3 turns.',
    shortDesc: 'C+R1->Heal Bleed\nHeal 6, discard 1\nMeal: 2 Bleed+1 3T',
    subtype: 'item', cardType: CardType.ITEM, costType: CostType.BANISH,
    effects: [
      new CardEffect('heal_bleed', 99, TargetType.SELF),
      new CardEffect('heal', 6, TargetType.SELF),
      new CardEffect('discard_deck', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Cracked Marrow-Bone',
      turnsPerCombat: 3,
      effects: [
        { effectType: 'heal_bleed', value: 2 },
        { effectType: 'heal', value: 1 },
      ],
      description: 'Heal 2 Bleed and Heal 1 each turn for 3 turns (each combat, until rest).',
    },
    tier: 2, rarity: 'common',
    gamePlusOffset: { heal: 3 },
  });
}

export function createBeastmasterHorn() {
  return new Card({
    id: 'beastmaster_horn', name: 'Beastmaster Horn',
    description: 'Summon 1-2 Hyenas.\n25%: a Giant Hyena instead.',
    shortDesc: 'Summon 1-2 Hyenas\n25%: Giant Hyena',
    subtype: 'allies', cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_beastmaster_horn', 0, TargetType.SELF),
    ],
    // Both possible summons shown side-by-side in the mini showcase.
    previewCreatures: [createGiantHyenaCreature(), createPackHyenaCreature()],
    rarity: 'epic', tier: 2,
  });
}

export function createHuntersRecurveBow() {
  return new Card({
    id: 'hunters_recurve_bow', name: "Hunter's Recurve Bow",
    description: 'Recharge a Card ->\nDeal 8 Damage + Mark, Draw.',
    shortDesc: 'R Card->8 + Mark\nDraw',
    subtype: 'ranged', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 8, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_mark', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'epic', tier: 2,
    gamePlusOffset: { damage: 3 },
  });
}

// Crag Cat cards (East Mountain). Pounce + Cat Reflexes resolve their custom
// effects (pounce_attack / reflexes_dodge) in main.js — the cat plays Pounce
// proactively and Cat Reflexes reactively (it's a DEFENSE card).
export function createPounce() {
  return new Card({
    id: 'pounce', name: 'Pounce',
    description: 'Deal 5 + Bleed.\nIts damage hits your hand first.',
    shortDesc: '5 + Bleed\nDmg hits hand first',
    subtype: 'weapon', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('pounce_attack', 5, TargetType.SINGLE_ENEMY),
    ],
    priority: 8,
    tier: 2, rarity: 'uncommon', noTierOffset: true,
  });
}

export function createCatReflexes() {
  return new Card({
    id: 'cat_reflexes', name: 'Cat Reflexes',
    description: '50% to avoid all damage from the attack.\n+2 Heroism. Draw.',
    shortDesc: '50% dodge\n+2 Heroism, Draw',
    subtype: 'ability', cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('reflexes_dodge', 50, TargetType.SELF),
      new CardEffect('gain_heroism', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2, rarity: 'uncommon', noTierOffset: true,
  });
}

// Cat Claws — Dire Claws (2 dmg to up to 2 targets) plus a Draw. Crag Cat deck.
export function createCatClaws() {
  return new Card({
    id: 'cat_claws', name: 'Cat Claws',
    description: 'Recharge -> Deal 2 to up to 2 Targets, Draw.',
    shortDesc: 'R->2 Dmg x2\nDraw',
    subtype: 'weapon', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_random_split', 2, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    priority: 6,
    tier: 2, rarity: 'uncommon', noTierOffset: true,
  });
}

// Crag Cat loot (East Mountain). Dropped 50% of the time (crag_cat_loot).
export function createMountainPredatorFang() {
  return new Card({
    id: 'mountain_predator_fang', name: 'Mountain Predator Fang',
    description: 'Heal 1 Ailment, Heroism, Draw.',
    shortDesc: 'Heal 1 Ailment\nHeroism, Draw',
    subtype: 'relic', cardType: CardType.RELIC, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heal_n_negative_effects', 1, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'common', tier: 2,
    gamePlusOffset: { gain_heroism: 1 },
  });
}

export function createCloakOfTheSilentProwler() {
  return new Card({
    id: 'cloak_silent_prowler', name: 'Cloak of the Silent Prowler',
    description: 'Block 3, Heal 6 Ailments, Scry 2.',
    shortDesc: 'Block 3\nHeal 6 Ailments, Scry 2',
    subtype: 'clothing', cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('heal_n_negative_effects', 6, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    gamePlusOffset: { block: 2 },
  });
}

// Snow Paws — clothing armor. "First Attack: +3" is a passive keyed by card id
// in main.js (mirrors Boarhide Bracers); the effects array is its Defense mode.
export function createSnowPaws() {
  return new Card({
    id: 'snow_paws', name: 'Snow Paws',
    description: 'First Attack: +3.\nDefense: Block 2, Clear 2 Ice, Draw.',
    shortDesc: 'First Atk: +3\nDef: Block 2, Clear Ice, Draw',
    subtype: 'clothing', cardType: CardType.DEFENSE, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('clear_ice', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon', tier: 2,
    gamePlusOffset: { block: 1 },
  });
}

export function createCatsEyePendant() {
  return new Card({
    id: 'cats_eye_pendant', name: "Cat's Eye Pendant",
    description: 'Heal half your Ailments,\nRemove all Mark, Draw.',
    shortDesc: 'Heal 1/2 Ailments\nRemove Mark, Draw',
    subtype: 'relic', cardType: CardType.RELIC, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('cats_eye_cleanse', 0, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare', tier: 2,
  });
}

// Rend — Rampaging Troll's signature claw attack (Part 2 tunnels).
// Picks up to 2 random player-side targets and rakes each for 4 damage
// plus 1 Bleed (the bleed rider rides the damage_random_split handler).
// Monster-only. Base damage stays 4 in the normal game; Game+ scales it
// +2 per monster offset via gamePlusOffset.
export function createRend() {
  return new Card({
    id: 'rend',
    name: 'Rend',
    description: 'Recharge -> Deal 4 + Bleed to 2 targets.',
    shortDesc: 'R->4 + Bleed x2',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_random_split', 4, TargetType.ALL_ENEMIES, 2, 1),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { damage_random_split: 2 },
  });
}

// Rend (Umber Hulk) — the hulk's version of the troll's claw rake: wider (3
// targets instead of 2) and a touch weaker per hit (3 instead of 4), with the
// same Bleed rider riding the damage_random_split handler. Monster-only, and
// the bulk of the hulk's 40-card deck. Uses its own art (UmberHulk.jpg).
export function createRendUmberHulk() {
  return new Card({
    id: 'rend_umber_hulk',
    name: 'Rend',
    description: 'Recharge -> Sunder, Deal 3 + Bleed to 2-3 targets.',
    shortDesc: 'R->Sunder, 3\n+ Bleed x2-3',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // Target count rolls 2 or 3 per cast — minTargets is stamped on the
    // effect below (the CardEffect constructor doesn't take it positionally),
    // as is the Sunder rider. Sunder lands first on each pick, so the claw
    // that follows bites into already-stripped Armor.
    effects: [
      Object.assign(
        new CardEffect('damage_random_split', 3, TargetType.ALL_ENEMIES, 3, 1),
        { minTargets: 2, sunder: 1 },
      ),
    ],
    priority: 10,
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { damage_random_split: 2 },
  });
}

// Staff of Fungi — Psilofyr's answer to a full offering bowl. Rare T3 (13) plus
// 9 for the second card cost: the party-wide version of the Mycelial Codex,
// a full Poison scrub on your whole line, and a handful of caps grown out of
// whatever it pulled off you. Not a drop — it forms out of the altar's growth
// once enough has been offered (see the psilofyr_donate handler).
//
// "Living ally" here means Creature.isAlive (currentHp > 0), NOT a creature
// TYPE check — Skeletons and every other Undead ally are buffed exactly like
// anything else on the field. The Necromancer is a first-class user of this.
export function createStaffOfFungi() {
  return new Card({
    id: 'staff_of_fungi',
    name: 'Staff of Fungi',
    description: 'Recharge a Card ->\nAllies gain +1/+1 and\ntheir attacks Poison.\nHeal all Poison on you\nand your allies, and\ngrow mushrooms from it.',
    shortDesc: 'R-Card->Allies\n+1/+1 +Poison\nScrub Poison',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('all_allies_growth', 1, TargetType.SELF),
      new CardEffect('fungal_bloom', 0, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { all_allies_growth: 1 },
  });
}

// ============================================================
// The Ancients Guardians — the Silverwood circle fight. The guardians
// themselves are an untouchable presence; what you actually fight is the ring
// of Ancients of War standing between you and the trees.
// ============================================================

// Ancient of War — a 2x2 Sentinel with 5 Armor over 10 HP. Killing one is the
// point of the fight, and killing one is also the problem: the wood puts the
// pieces back up as a spray of smaller Treants.
export function createAncientOfWarCreature() {
  const c = new Creature({
    name: 'Ancient of War',
    attack: 5,
    maxHp: 15,
    armor: 5,
    // Sunder rider instead of Sentinel: the Ancients don't body-block for the
    // wood, they grind your guard down. The stack lands BEFORE the swing
    // resolves (see the creature-swing path in main.js), so the Armor/Block it
    // strips is already gone when that same hit is mitigated.
    sunderAttack: 1,
    slotW: 2,
    slotH: 2,
    // No "Attacks Sunder" line: sunderAttack draws its own rider icon beside
    // the attack stat, so spelling it out again would render the pill twice.
    description: 'On Death: Summon 2-4 Treants.',
    // Same shape as the necromancer's ['Skeleton', 'Undead']: the specific
    // tag first, the summon family second. Carrying 'Treant' is what puts an
    // Ancient in the grove — Summon Treants, Treant Bark and the Staff of the
    // Ancients all bolster from the trait now, not from the name, so the big
    // body is a legal target for +1/+1. That is deliberately the strongest
    // place to put the buff: most allies die the turn they're hit, so a body
    // that survives several turns is the only one that ever cashes it in.
    traits: ['Ancient', 'Treant'],
  });
  // On-death summon rider — [min, max] Treants raised on the SAME side the
  // Ancient was standing on. Handled in the death sweep in main.js.
  c.onDeathSummonTreants = [2, 4];
  return c;
}

// Regrowth (Ancients Guardians) — the guardians' only card, and they hold two
// of them, so the ring is healed twice a turn. Overheal spills into a fresh
// Treant exactly like the druid version the player knows.
// Built FROM the player's Regrowth so the two can't drift — same tier, same
// rarity, same art, same numbers (Heal 1 now + Heal 1 for 4 turns, each tick
// sprouting a Treant on overheal). The only difference is the routing: the
// guardians can't be asked who to target, so their copy carries a single
// `guardian_regrowth` effect that picks a random creature on their line and
// then runs the player card's two effects on it.
export function createGuardianRegrowth() {
  const card = createRegrowth();
  card.id = 'guardian_regrowth';
  card.description = 'Heal 1 on a random ally,\nHeal 1 for 4 Turns.\nOverheal: Summon a Treant.';
  card.shortDesc = 'Heal 1 random\nRegen 4t\nOverheal: Treant';
  card.effects = [new CardEffect('guardian_regrowth', 4, TargetType.SELF)];
  // Not a player card — drop the class gate so it never shows up as loot or
  // an ability pick. MUST be an empty array, not null: Card.copy() spreads
  // this field ([...this.characterClass]) and a null throws mid-copy, which
  // takes out Deck.startCombat when the fight tries to deal the enemy's hand.
  card.characterClass = [];
  card.noTierOffset = true;
  return card;
}

// Ancients Guardians loot — both drop, every time. This is a one-shot story
// fight that never recurs, so there's no farming to price against: the pair is
// the reward for the whole Silverwood beat.

// Staff of the Ancients — epic T3 (16) + 15 for the second card cost = 31.
// Sunder lands first, then the swing, and every point that actually gets
// through pays out twice: a Shield for you and a Treant grown or grown-into.
// Against a naked target that's 5 Shields and 5 Treant actions; against armor
// it is a good deal less, which is what the Sunder is there to fix.
export function createStaffOfTheAncients() {
  return new Card({
    id: 'staff_of_the_ancients',
    name: 'Staff of the Ancients',
    description: 'Recharge a Card ->\nSunder, Deal 5 Damage.\nPer damage dealt: gain 1\nShield and Summon or\nBolster a Treant.',
    shortDesc: 'R-Card->Sunder\n5 Dmg / Per dmg:\n1 Shield + Treant',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('ancients_staff_strike', 5, TargetType.SINGLE_ENEMY),
    ],
    tier: 3,
    rarity: 'epic',
    previewCreature: createTreantCreature(),
    gamePlusOffset: { ancients_staff_strike: 2 },
  });
}

// Treant Bark — epic T3 relic (16). A grove in your pocket: one Treant grown
// or bolstered every time you play it, and the relic cantrip pays for itself.
export function createTreantBark() {
  return new Card({
    id: 'treant_bark',
    name: 'Treant Bark',
    description: 'Summon or Bolster a Treant,\nDraw.',
    shortDesc: 'Summon/Bolster\nTreant, Draw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_or_bolster_treant', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'epic',
    previewCreature: createTreantCreature(),
    gamePlusOffset: { summon_or_bolster_treant: 1 },
  });
}

// ============================================================
// Carrion Crawler loot — Chapter 3 Underdark. The crawler's set is Poison and
// Paralyze: it wins by taking your turn away from you, and its gear hands that
// back. Paralyze lands on SUMMONS only (see the apply_paralyze handler).
// ============================================================

// Carapace Buckler — common T3 (7): 3 Shields (6) + Heal 1 Sunder (1), with
// the first-shield draw riding the defense card's free cantrip.
export function createCarapaceBuckler() {
  return new Card({
    id: 'carapace_buckler',
    name: 'Carapace Buckler',
    description: 'Gain 3 Shields,\nHeal 1 Sunder.\nFirst Shield: Draw.',
    shortDesc: '3 Shields\nHeal 1 Sunder\n1st Shield: Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 3, TargetType.SELF),
      new CardEffect('heal_sunder', 1, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { gain_shield: 1 },
  });
}

// Crawler Skullcap — uncommon T3 (10): Block 5 (5) + the defense draw, plus a
// standing rider that laces every attack you make this fight with 1 Poison.
// The rider rides the shared consumePoisonBuff choke point, so it works on
// every attack shape without touching the individual damage cases.
export function createCrawlerSkullcap() {
  return new Card({
    id: 'crawler_skullcap',
    name: 'Crawler Skullcap',
    description: 'Attacks also apply 1 Poison.\nBlock 5, Draw.',
    shortDesc: 'Attacks +1 Poison\nBlock 5, Draw',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('grant_poison_attacks', 1, TargetType.SELF),
      new CardEffect('block', 5, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { block: 2 },
  });
}

// Paralytic Stinger — uncommon T3 (10). The caster's answer to summon spam:
// 1-2 Poison, and if the target is a summon it loses its next action.
export function createParalyticStinger() {
  return new Card({
    id: 'paralytic_stinger',
    name: 'Paralytic Stinger',
    description: 'Deal 1-2 Poison,\nParalyze if a Summon.\nAllies gain 1 Heroism.',
    shortDesc: '1-2 Poison\nParalyze Summon\nAllies +Heroism',
    subtype: 'wand',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      // Range encoding matches damage_range: min*10 + max (12 = "1 to 2").
      new CardEffect('apply_poison_range', 12, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_paralyze', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { buff_allies_heroism: 1 },
  });
}

// Paralytic Glaive — uncommon T3 (10) + 9 for the second card cost = 19. The
// melee half of the same answer: Deal 6 (6) + 1-2 Poison (3) + Paralyze (3)
// on the first target, half again on the second.
export function createParalyticGlaive() {
  return new Card({
    id: 'paralytic_glaive',
    name: 'Paralytic Glaive',
    description: 'Recharge a Card ->\nDeal 6 + 1-2 Poison,\nParalyze if a Summon,\nOn 2 Targets.',
    shortDesc: 'R-Card->6 Dmg\n1-2 Poison\nParalyze x2',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('multi_damage', 6, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('apply_poison_range', 12, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('apply_paralyze', 1, TargetType.SINGLE_ENEMY, 2),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { multi_damage: 2 },
  });
}

// Carrion Satchel — rare T3 (13). Whatever the crawler had been digesting,
// bottled. Creates 2-3 poisons rolled off the underdark_poisons table; the
// copies are stamped as tokens so they can't be sold, even though the same
// cards bought or looted normally still can be.
export function createCarrionSatchel() {
  return new Card({
    id: 'carrion_satchel',
    name: 'Carrion Satchel',
    description: 'Create 2-3 Poisons.',
    shortDesc: 'Create 2-3\nPoisons',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('create_random_poisons', 3, TargetType.SELF)],
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { create_random_poisons: 1 },
  });
}

// ============================================================
// Roper loot — Chapter 3 Underdark. Where the hulk's set is Sunder, the
// roper's is Poison, Shields and tentacles: it fights by holding you still and
// wearing you down, and its drops do the same.
// ============================================================

// Roperhide Armor — uncommon T3 (10): Block 5 (5) + 1 Shield per living enemy
// (2 each) + the defense card's free Draw. Scales with the swarm fights the
// Underdark keeps throwing (tentacles, crawler segments, warparties).
export function createRoperhideArmor() {
  return new Card({
    id: 'roperhide_armor',
    name: 'Roperhide Armor',
    description: 'Block 5,\nGain 1 Shield per enemy,\nDraw.',
    shortDesc: 'Block 5\n1 Shield/enemy\nDraw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
      new CardEffect('shield_per_enemy', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { block: 2 },
  });
}

// Roper Mandible Blade — uncommon T3 (10): Deal 8 (8) + Poison (2). The
// chapter's clean 1H martial line, with none of the hulk gear's armor tax.
export function createRoperMandibleBlade() {
  return new Card({
    id: 'roper_mandible_blade',
    name: 'Roper Mandible Blade',
    description: 'Deal 8 + Poison.',
    shortDesc: '8 Dmg\n+ Poison',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 8, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { damage: 3, apply_poison: 1 },
  });
}

// Stone Mimic Veil — common T3 (7). Dual-mode like the Burrower's Gauntlet,
// but the modes trade differently: the play mode (Scout 2 + 2 Shields) KEEPS
// the veil in hand, so it can be re-read every turn; using it as a block
// spends it to the recharge pile and scries instead. Deliberately weak per
// use — the value is that it never runs out until you cash it in.
export function createStoneMimicVeil() {
  return new Card({
    id: 'stone_mimic_veil',
    name: 'Stone Mimic Veil',
    description: 'Scout 2, Gain 2 Shields.\nStays in hand.\nDefense: Block 2, Scry 2',
    shortDesc: 'Scout 2, 2 Shields\nStays / Def:\nBlock 2, Scry 2',
    subtype: 'clothing',
    cardType: CardType.ATTACK,
    // RECHARGE, but the play mode never pays it (stays-in-hand skips the
    // cost) — so the cost only lands when the veil is spent as a block,
    // which is exactly the "Block recharges the card" behavior.
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('scout', 2, TargetType.SELF),
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    modes: [
      new CardMode('Block 2, Scry 2', [
        new CardEffect('block', 2, TargetType.SELF),
        new CardEffect('scry_pick', 2, TargetType.SELF),
      ]),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { gain_shield: 1 },
  });
}

// Tendril Lash — rare T3 (13), the chapter's only ranged weapon. The second
// card cost earns no bonus because the Draw hands the card straight back
// (same rule as the Bone Bow). On a kill the severed tendril keeps moving and
// fights for you.
export function createTendrilLash() {
  return new Card({
    id: 'tendril_lash',
    name: 'Tendril Lash',
    description: 'Recharge a Card ->\nDeal 9 + Poison, Draw.\nOn Kill: Summon a\nRoper Tentacle.',
    shortDesc: 'R-Card->9 + Poison\nDraw / On Kill:\nTentacle',
    subtype: 'ranged',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('damage', 9, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('summon_tentacle_on_kill', 1, TargetType.SUMMON),
    ],
    tier: 3,
    rarity: 'rare',
    previewCreature: createRoperTentacleCreature(),
    gamePlusOffset: { damage: 3, apply_poison: 1 },
  });
}

// Grasping Tendrils — uncommon T3 (10). The chapter's only summon card. Roper
// Tentacles are Sentinels with 2 armor and a Poison rider, so a pair of them
// is a wall that also stacks the roper set's damage type.
export function createGraspingTendrils() {
  return new Card({
    id: 'grasping_tendrils',
    name: 'Grasping Tendrils',
    description: 'Summon 1-2 Roper Tentacles.',
    shortDesc: 'Summon 1-2\nTentacles',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_roper_tentacles', 1, TargetType.SUMMON)],
    tier: 3,
    rarity: 'uncommon',
    previewCreature: createRoperTentacleCreature(),
    // Base 1-2; +1 max per offset, read by the summon handler.
    gamePlusOffset: { roper_tentacle_summon: 1 },
  });
}

// ============================================================
// Umber Hulk loot — Chapter 3 Underdark. The hulk is the chapter's armor
// breaker, and its drops are the Sunder set: every piece either strips armor,
// punishes it, or cleans Sunder off you. Budgets follow the loot table
// (T3: common 7 / uncommon 10 / rare 13), with a second card cost paying for
// its own budget - 1 on the two Recharge-a-Card weapons.
// ============================================================

// Umber Shield — the hulk's own shell strapped to an arm. Common T3 (7):
// 4 Shields (8) + Heal 1 Sunder (1).
export function createUmberShield() {
  return new Card({
    id: 'umber_shield',
    name: 'Umber Shield',
    description: 'Gain 4 Shields,\nHeal 1 Sunder.',
    shortDesc: '4 Shields\nHeal 1 Sunder',
    subtype: 'light_armor',
    // ABILITY, not DEFENSE: this grants Shield, and Shield is a proactive
    // buff you put up on your own turn — DEFENSE is for reactive Block cards
    // played in the enemy's attack phase. Every other pure gain_shield card
    // (Buckler, Cracked Buckler, Shield of Last Hope, Roc Eggshell Shield…)
    // is an ABILITY; this one was the lone outlier and could only be played
    // reactively.
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 4, TargetType.SELF),
      new CardEffect('heal_sunder', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { gain_shield: 1 },
  });
}

// Mandible Cleaver — a hulk's jaw on a haft, swung two-handed. Uncommon T3
// (10) + 9 for the second card cost = 19: Sunder (3) + Deal 9 (9) + Bleed (1)
// on the first target, half again on the second. Sunder is ordered ahead of
// the damage so the armor it strips is gone before the swing lands.
export function createMandibleCleaver() {
  return new Card({
    id: 'mandible_cleaver',
    name: 'Mandible Cleaver',
    description: 'Recharge a Card ->\nSunder + 9 Damage\n+ Bleed, On 2 Targets.',
    shortDesc: 'R-Card->Sunder\n9 Dmg + Bleed\nx2',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_sunder', 1, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('multi_damage', 9, TargetType.SINGLE_ENEMY, 2),
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY, 2),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { multi_damage: 3, apply_sunder: 1 },
  });
}

// Umber Eye Charm — one of the hulk's four eyes, still looking. Rare T3 (13):
// a Sunder ping (3) on a random enemy plus the relic cantrip that carries the
// rest of the budget.
export function createUmberEyeCharm() {
  return new Card({
    id: 'umber_eye_charm',
    name: 'Umber Eye Charm',
    description: 'Sunder Randomly, Draw.',
    shortDesc: 'Sunder Rand\nDraw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_sunder_random', 1, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'rare',
    gamePlusOffset: { apply_sunder_random: 1 },
  });
}

// Burrower's Gauntlet — the hulk's digging claw, worn. Dual-mode like Sturdy
// Boots: the top-level effects are the ATTACK play (a free Sunder that keeps
// the glove in hand), modes[0] is what it does when thrown up as a block —
// and blocking spends it, because the defending path always plays the card.
// Deliberately narrow: worth a lot against the chapter's armored monsters,
// close to dead against anything without armor.
export function createBurrowersGauntlet() {
  return new Card({
    id: 'burrowers_gauntlet',
    name: "Burrower's Gauntlet",
    description: 'Attack: Sunder.\nStays in hand.\nDefense: Block 2, Scry 2',
    shortDesc: 'Atk: Sunder\nStays / Def:\nBlock 2, Scry 2',
    subtype: 'clothing',
    cardType: CardType.ATTACK,
    // RECHARGE, but the attack mode never pays it (stays-in-hand skips the
    // cost) — so the cost only lands when the glove is spent as a block, and
    // it recharges rather than discarding. Same deal as the Stone Mimic Veil.
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_sunder', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    modes: [
      new CardMode('Block 2, Scry 2', [
        new CardEffect('block', 2, TargetType.SELF),
        new CardEffect('scry_pick', 2, TargetType.SELF),
      ]),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { apply_sunder: 1 },
  });
}

// Tunnelbreaker Pick — what the hulk's claws leave you when you rebuild one
// into a tool. Uncommon T3 (10) + 9 for the second card cost = 19:
// Sunder 3 (9) + Deal 10 (10). The heavier sibling of the Deep Pick.
export function createTunnelbreakerPick() {
  return new Card({
    id: 'tunnelbreaker_pick',
    name: 'Tunnelbreaker Pick',
    description: 'Recharge a Card ->\nSunder 3, Deal 10.',
    shortDesc: 'R-Card->Sunder 3\nDeal 10',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_sunder', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 10, TargetType.SINGLE_ENEMY),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { damage: 3, apply_sunder: 1 },
  });
}

// ============================================================
// Deep Gnome gear — Chapter 3 Underdark, sold by the roaming merchants.
// Every attacking piece lists Sunder BEFORE its damage on purpose: Sunder
// shaves Armor (then Block) as it resolves, so the strike that follows lands
// into the softened defense and gets the extra point through.
// ============================================================

// Svirfhammer — the plain deep-gnome work hammer. Sunder, then Deal 4.
export function createSvirfhammer() {
  return new Card({
    id: 'svirfhammer',
    name: 'Svirfhammer',
    description: 'Sunder, Deal 4.',
    shortDesc: 'Sunder\nDeal 4',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      // Sunder FIRST — it strips 1 Armor/Block so the swing behind it lands
      // for +1 against anything defended.
      new CardEffect('apply_sunder', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { damage: 2 },
  });
}

// Deep Pick — the heavy two-hand version: pay a card, break more armor, hit
// much harder.
export function createDeepPick() {
  return new Card({
    id: 'deep_pick',
    name: 'Deep Pick',
    description: 'Recharge a Card -> Sunder 2, Deal 7.',
    shortDesc: 'R-Card->Sunder 2\nDeal 7',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_sunder', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 7, TargetType.SINGLE_ENEMY),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { damage: 3, apply_sunder: 1 },
  });
}

// Work Gloves — miner's leathers. Defensive line that still chews someone's
// armor on the way past.
export function createWorkGloves() {
  return new Card({
    id: 'work_gloves',
    name: 'Work Gloves',
    description: 'Block 4, Sunder Randomly, Draw.',
    shortDesc: 'Block 4\nSunder Rand\nDraw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 4, TargetType.SELF),
      new CardEffect('apply_sunder_random', 1, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { block: 2, apply_sunder_random: 1 },
  });
}

// Fungal Lantern — held, never played. Scouts deep on arrival, and while it's
// in your hand every card-driven Draw on your turn becomes a Scry 2 instead
// (the end-of-turn refill is untouched — see the draw case in main.js).
export function createFungalLantern() {
  return new Card({
    id: 'fungal_lantern',
    name: 'Fungal Lantern',
    description: 'Scout 4.\nWhen you Draw, you Scry 2 instead.\nStays in hand.',
    shortDesc: 'Scout 4\nDraw -> Scry 2\nStays',
    subtype: 'item',
    cardType: CardType.ITEM,
    // FREE — the card never leaves hand, so a recharge cost would be paid once
    // and ridden forever (same reasoning as Small Pouch).
    costType: CostType.FREE,
    effects: [
      new CardEffect('scout', 4, TargetType.SELF),
      new CardEffect('draw_becomes_scry', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { scout: 1, draw_becomes_scry: 1 },
  });
}

// Mining Goggles — Ondrik Sootspindle's stock-in-trade at The Deep Tinker.
// Held, never spent. While they're in hand the top card of your draw pile is
// face-up to you (drawn on the character panel), and reading the seams through
// them arms the next swing with Sunder — re-play them each turn to re-arm.
export function createMiningGoggles() {
  return new Card({
    id: 'mining_goggles',
    name: 'Mining Goggles',
    description: 'In Hand: Reveal the top card of your deck.\nYour next attack gains Sunder.\nStays in hand.',
    shortDesc: 'See next card\nNext atk: Sunder\nStays',
    subtype: 'item',
    cardType: CardType.ITEM,
    // FREE for the same reason as the Fungal Lantern / Miner's Helm — the card
    // never leaves hand, so a recharge cost would be paid once and ridden all
    // fight.
    costType: CostType.FREE,
    effects: [
      // Passive marker — the reveal is read off the hand by the combat UI, not
      // resolved (same shape as armor_in_hand / draw_becomes_scry).
      new CardEffect('reveal_top_card', 0, TargetType.SELF),
      new CardEffect('grant_sunder_buff', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { grant_sunder_buff: 1 },
  });
}

// Mycelial Codex — the prize off Sivvi Duskcap's back shelf at The Spore &
// Sprig. Held, never spent: each turn you can read a page over one of your
// allies and the fungus takes to it, growing it +1/+1 and lacing every swing
// it makes with spores from then on.
export function createMycelialCodex() {
  return new Card({
    id: 'mycelial_codex',
    name: 'Mycelial Codex',
    description: '1 Ally gains +1/+1.\nIts attacks also deal Poison.\nStays in hand.',
    shortDesc: 'Ally +1/+1\nAtk +Poison\nStays',
    subtype: 'scroll',
    cardType: CardType.ITEM,
    // FREE for the same reason as the Fungal Lantern — the card never leaves
    // hand, so a recharge cost would be paid once and ridden all fight.
    costType: CostType.FREE,
    effects: [
      new CardEffect('mycelial_growth', 1, TargetType.SINGLE_ALLY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'uncommon',
    gamePlusOffset: { mycelial_growth: 1 },
  });
}

// Miner's Helm — the Armor is passive while the helm sits in your hand; play it
// and you trade that standing Armor for an immediate Block 3 + Draw.
export function createMinersHelm() {
  return new Card({
    id: 'miners_helm',
    name: "Miner's Helm",
    description: '1 Armor while in hand.\nBlock 3, Draw.',
    shortDesc: '+1 Armor in hand\nBlock 3, Draw',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('armor_in_hand', 1, TargetType.SELF),
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { block: 2, armor_in_hand: 1 },
  });
}

// Drow Priestess (Drow Warparty) — the warparty's spine. Swings a flail across
// 3 targets for 2 + Bleed each, and every attack rallies the rest of the party
// (On Attack: Allies gain Heroism). 1 Armor over 20 HP; kill her and the
// warriors stop getting free damage.
export function createDrowPriestessCreature() {
  return new Creature({
    name: 'Drow Priestess',
    attack: 2,
    maxHp: 20,
    armor: 1,
    bleedAttack: 1,
    multiAttack: 3,
    description: 'Attacks 3 targets.\nOn Attack: Allies gain Heroism.',
  });
}

// Drow Warrior (Drow Warparty) — opens with a poisoned hand-crossbow bolt, then
// closes with the blade. Two swings a turn: the bolt is 1 + Poison (bow cue),
// the sword follow-up lands for 4 with no rider (sword cue). 1 Armor over 15 HP.
export function createDrowWarriorCreature() {
  return new Creature({
    name: 'Drow Warrior',
    attack: 1,
    maxHp: 15,
    armor: 1,
    poisonAttack: true,
    description: 'Crossbow: 1 + Poison.\nThen blade: 4.',
  });
}

// Carrion Crawler Torso — the segments of the crawler's body. They never
// attack; they just sit there soaking, 3 Armor over 12 HP, and burst into a
// cloud of spores when cut down (On Death: Poison to All). Killing all five is
// the win condition — the crawler's head itself is invulnerable.
//
// Note: Paralyze does nothing to these on purpose. _cantAttack keeps them off
// the action queue entirely, so there is no action for a stack to eat — the
// crawler is immune to its own paralytic poison. Not a bug to "fix".
export function createCarrionCrawlerTorsoCreature() {
  const c = new Creature({
    name: 'Carrion Crawler Torso',
    attack: 0,
    maxHp: 12,
    armor: 3,
    onDeathPoisonAll: 1,
    description: "Can't attack.\nOn Death: Poison to All.",
  });
  // attack: 0 alone does NOT keep a creature off the attack queue — the enemy
  // planner deliberately queues 0-attack bodies so rider-only creatures (Pet
  // Spider) still land their poison. _cantAttack is the flag that actually
  // benches them, same as the prison cart and the dragon eggs.
  c._cantAttack = true;
  return c;
}

// Bite (Carrion Crawler) — the head's swing. Solid damage plus a variable
// 1-3 Poison, so the toxin load builds fast across a long clear.
export function createCarrionCrawlerBite() {
  return new Card({
    id: 'carrion_crawler_bite',
    name: 'Bite',
    description: 'Deal 5 Damage + 1 to 3 Poison.',
    shortDesc: '5 Dmg\n+1-3 Poison',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      // Rolls 1-3 at resolve time (see apply_poison_random in the enemy path).
      new CardEffect('apply_poison_random', 3, TargetType.SINGLE_ENEMY),
    ],
    priority: 10,
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { damage: 2 },
  });
}

// Roper Tentacle — the Roper's grasping ring. Sentinel forces the party to
// chew through the tentacles before they can reach the body, and every lash
// stacks Poison, so a slow clear costs a lot of toxin. The Roper's Tentacles
// power regrows one each turn up to 6.
export function createRoperTentacleCreature() {
  return new Creature({
    name: 'Roper Tentacle',
    attack: 1,
    maxHp: 4,
    armor: 2,
    poisonAttack: true,
    sentinel: true,
    // Poison shows as the rider icon beside the attack stat — don't repeat it
    // in the text or it renders a second inline icon.
    description: 'Sentinel.',
  });
}

// Bite (Roper) — the body's only card, and the payoff for all that Poison: a
// heavy single hit (10) that grows by 2 per Poison stack already on the target, with
// Overwhelm spilling overkill off a dying ally onto the player.
export function createRoperBite() {
  return new Card({
    id: 'roper_bite',
    name: 'Bite',
    description: 'Deal 10 Damage + 2 per Poison on target.\nOverwhelm.',
    shortDesc: '10 Dmg +2/Poison\nOverwhelm',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 10, TargetType.SINGLE_ENEMY),
      new CardEffect('damage_per_poison_stack', 2, TargetType.SINGLE_ENEMY),
    ],
    priority: 10,
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { damage: 2 },
  });
}

// Rock Skin (Umber Hulk) — the defensive quarter of the hulk's deck, and a
// REACTIVE card: it never burns the hulk's own turn, it fires when the player's
// blow is about to land. Scrubs 1 Ailment stack off itself; if it is
// clean, it hardens instead for a permanent +1 base Armor. Either way it takes
// Block 3 and draws. That makes it a wall against Bleed/Poison strategies AND
// a slow armor climb against parties that can't inflict anything — no dead
// draw either way.
export function createRockSkin() {
  return new Card({
    id: 'rock_skin',
    name: 'Rock Skin',
    description: 'Recharge -> Heal 1 Ailment, or Gain 1 Armor if none to heal.\nBlock 3, Draw.',
    shortDesc: 'R->Heal 1 Ail\n(else +1 Armor)\nBlock 3, Draw',
    subtype: 'armor',
    // DEFENSE — the hulk never spends its own turn on this. The reactive
    // defense pass (enemyAutoPlayDefenses) plays it out of hand the moment the
    // player's damage is about to land, same as the troll's Dire Hide.
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('heal_ailments_or_armor', 1, TargetType.SELF),
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    priority: 4,
    tier: 3,
    rarity: 'common',
    gamePlusOffset: { block: 1 },
  });
}

// Gore — Giant Boar's signature charge. Deal 2, and the boar's opening
// swing of the turn lands for double (First Attack: +2).
export function createGore() {
  return new Card({
    id: 'gore',
    name: 'Gore',
    description: 'Deal 2. First Attack: +2.',
    shortDesc: '2\nFirst Attack: +2',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('gore_attack', 2, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { gore_attack: 2 },
  });
}

// Bear Roar — Dire Bear ABILITY card. On play: bear gains 1 Rage
// (so subsequent swings hit harder) and every "enemy" (player +
// alive player allies) loses all their shield. Replaces the old
// passive Dire Fury rage tick — rage now scales with HOW often the
// bear draws + plays the roar, not flat per turn.
export function createBearRoar() {
  return new Card({
    id: 'bear_roar',
    name: 'Bear Roar',
    description: 'Recharge -> Gain 1 Rage. Enemies lose all Shields.',
    shortDesc: 'R->+1 Rage\nStrip Shields',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('bear_roar', 1, TargetType.SELF),
    ],
    priority: 9,
    // The strip payoff doesn't scale numerically with
    // monsterTierOffset — empty object opts into the codex
    // no-rules-needed badge.
    gamePlusOffset: {},
  });
}

// A Storm is Coming — Roc ABILITY card. The invulnerable Roc
// circling overhead drops 1 Shock onto a single random target on
// the party (player or any alive ally). Cycles every turn via the
// Roc's single-card deck + hand size 1. Uses RocCircling.jpg art.
export function createAStormIsComing() {
  return new Card({
    id: 'a_storm_is_coming',
    name: 'A Storm is Coming',
    description: 'Recharge -> Deal Shock Randomly up to 2 times.',
    shortDesc: 'R->Shock Rand x1-2',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_shock_random_player_side', 1, TargetType.SELF),
    ],
    priority: 8,
    gamePlusOffset: { apply_shock_random_player_side: 1 },
  });
}

// Enraged Strike — auto-added to the enemy's hand on every turn
// from turn 11 onward as a soft pity timer. Mirrors PY
// create_enraged_strike: 1 damage + 1 rage on play, priority 10
// so the AI fires it early in the queued action list.
export function createEnragedStrike() {
  return new Card({
    id: 'enraged_strike',
    name: 'Enraged Strike',
    description: 'Recharge -> Deal 1 Damage, Gain 1 Rage.',
    shortDesc: 'R->1 Dmg\n+1 Rage',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_rage', 1, TargetType.SELF),
    ],
    priority: 10,
    gamePlusOffset: { damage: 4, gain_rage: 1 },
  });
}

// Cave Shroom — healing item found at the cave river landing.
// Mirrors PY create_cave_shroom: BANISH cost, Heal 1 + Scry 2 (look at
// top 2 cards, pick one, recharge the other).
export function createCaveShroom() {
  return new Card({
    id: 'cave_shroom',
    name: 'Cave Shroom',
    // "Scry 2" is rendered as a colored keyword with a hover tooltip
    // (the standard "Look at the top N cards. Pick 1, recharge the
    // rest." description) thanks to the keyword tokenizer.
    description: 'Consume -> Heal 1. Scry 2.',
    shortDesc: 'C->Heal 1\nScry 2, Pick 1',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 1, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    gamePlusOffset: { heal: 1, scry_pick: 1 },
    rarity: 'uncommon',
  });
}

// Wolf Fang — relic mirroring PY create_wolf_teeth. The card has no
// active effect when played; instead its Heroism trigger fires every
// time it lands in the recharge pile (paid as cost or self-recharged
// at end of turn). Effect handler lives in main.js (applyOnRechargeHeroism).
export function createWolfFang() {
  return new Card({
    id: 'wolf_teeth',
    name: 'Wolf Fang',
    description: 'On Recharge: Gain 1 Heroism.',
    shortDesc: 'On Recharge:\n+1 Heroism',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('on_recharge_heroism', 1, TargetType.SELF)],
    rarity: 'rare',
    unplayable: true,
    gamePlusOffset: { on_recharge_heroism: 0.5 },
  });
}

// ============================================================
// Dire Bear loot — drops from the Circular Ruins boss fight.
// Roll twice on the table, distinct picks. Theme: bear bone / fur
// trophies that lean on Bleed, Ailment clears, and per-enemy
// scaling (mirroring the bear's roar / pack mechanics).
// ============================================================

// Bear Teeth Necklace — playable relic. FREE cost: fires 1 Bleed at a
// random enemy then draws to replace itself in hand.
export function createBearTeethNecklace() {
  return new Card({
    id: 'bear_teeth_necklace',
    name: 'Bear Teeth Necklace',
    description: '1 Bleed randomly, Draw.',
    shortDesc: '1 Bleed rand\nDraw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_bleed', 1, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { apply_bleed: 1 },
  });
}

// Bear Claw — simple weapon. 3 damage single target. Draws a card if
// the target is Bleeding (bleeding_draw rider checks at resolve time).
export function createBearClaw() {
  return new Card({
    id: 'bear_claw',
    name: 'Bear Claw',
    description: 'Deal 3 Damage.\nBleeding: Draw.',
    shortDesc: '3 Dmg\nBleeding: Draw',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('bleeding_draw', 1, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { damage: 2 },
  });
}

// Bear Hide Armor — light armor defense card. Shields + Ailment
// purge + cycle, the all-purpose mid-fight reset.
export function createBearHideArmor() {
  return new Card({
    id: 'bear_hide_armor',
    name: 'Bear Hide Armor',
    description: '4 Shield, Heroism, Heal 1 Ailment, Draw.',
    shortDesc: '4 Shield, Heroism\nHeal 1 Ail, Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 4, TargetType.SELF),
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('heal_n_negative_effects', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { gain_shield: 2, gain_heroism: 1 },
  });
}

// Bear Fat Rations — consumable meal. Big on-play Ailment purge +
// HP heal, then leaves a 3-turn meal buff that ticks 1 Ailment +
// 1 HP heal each turn. Meal slot — replaces whatever's currently
// active.
export function createBearFatRations() {
  return new Card({
    id: 'bear_fat_rations',
    name: 'Bear Fat Rations',
    description: 'Consume + Recharge 1 -> Heal 4 Ailments, Heal 4.\nMeal: Heal 1 Ailment, Heal 1 for 3 turns.',
    shortDesc: 'C+R1->Heal 4 Ail\n+Heal 4. Meal:\n1 Ail+1 HP 3T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal_n_negative_effects', 4, TargetType.SELF),
      new CardEffect('heal', 4, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Bear Fat Rations',
      turnsPerCombat: 3,
      effects: [
        { effectType: 'heal_n_negative_effects', value: 1 },
        { effectType: 'heal', value: 1 },
      ],
      description: 'Heal 1 Ailment and Heal 1 for 3 turns each combat.',
    },
    rarity: 'common',
    tier: 2,
    gamePlusOffset: { heal: 2 },
  });
}

// Roaring Helm — heavy armor defense card. Block + Heroism that
// both scale with enemy count, plus a draw. Strong vs swarms,
// average vs single-target.
export function createRoaringHelm() {
  return new Card({
    id: 'roaring_helm',
    name: 'Roaring Helm',
    description: 'Recharge -> Gain 1 Block for each enemy, Gain Heroism for each enemy, Draw.',
    shortDesc: 'R->Block/enemy\n+Heroism/enemy, Draw',
    subtype: 'heavy_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block_per_enemy', 1, TargetType.SELF),
      new CardEffect('heroism_per_enemy', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { block_per_enemy: 1, heroism_per_enemy: 0 },
  });
}

// Winterheart Pelt — clothing armor defense card. Solid Block 3,
// strips up to 3 Ice off the player (uses the existing clear_ice
// handler), and cycles.
export function createWinterheartPelt() {
  return new Card({
    id: 'winterheart_pelt',
    name: 'Winterheart Pelt',
    description: 'Block 3, Clear 3 Ice, Scry 2.',
    shortDesc: 'Block 3, Clear 3 Ice\nScry 2',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('clear_ice', 3, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { block: 2, scry_pick: 1 },
  });
}

// ============================================================
// Baby Roc loot — drops from the Nest Interior boss fight. Pick 2
// distinct items from a weighted pool of Roc-themed gear. The Egg
// allies in this pool spawn player-side chicks on death, mirroring
// the enemy egg/chick relationship from the fight itself.
// ============================================================

// Playable relic. Recharge cost: 1 Shock on a random enemy, then draws.
export function createStormwingFeather() {
  return new Card({
    id: 'stormwing_feather',
    name: 'Stormwing Feather',
    description: 'Deal Shock Randomly, Draw.',
    shortDesc: 'Shock rand\nDraw',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_shock', 1, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { apply_shock: 1 },
  });
}

// Roc Chick Leg — heavy 2H simple weapon. Costs Recharge + 2 extra
// recharges (pay 2 cards) for a 10-damage swing that grows by 4 vs
// a Bleeding target.
export function createRocChickLeg() {
  return new Card({
    id: 'roc_chick_leg',
    name: 'Roc Chick Leg',
    description: 'Recharge 2 Cards -> Deal 10 Damage.\nBleeding: +4 Damage.',
    shortDesc: 'R-2 Cards->10 Dmg\nBleeding +4',
    subtype: 'simple_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 10, TargetType.SINGLE_ENEMY),
      new CardEffect('bleeding_bonus_damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { damage: 3, bleeding_bonus_damage: 2 },
  });
}

// Roc Talon Dagger — light simple weapon. Cheap stab + 1 Bleed,
// stays in hand so the player can replay it every turn for steady
// Bleed pressure. FREE cost so it's always available, but
// stays_in_hand exhausts after each turn play.
export function createRocTalonDagger() {
  return new Card({
    id: 'roc_talon_dagger',
    name: 'Roc Talon Dagger',
    description: 'Deal 2 Damage + Bleed.\nStays in hand.',
    shortDesc: '2 Dmg\n+Bleed, Stays',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_bleed', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { damage: 2, apply_bleed: 1 },
  });
}

// Roc Eggshell Shield — light shield defense card. Big +6 Shields
// for a single discard.
export function createRocEggshellShield() {
  return new Card({
    id: 'roc_eggshell_shield',
    name: 'Roc Eggshell Shield',
    description: 'Discard -> Gain 6 Shields.',
    shortDesc: 'D->+6 Shield',
    subtype: 'light_armor',
    // ABILITY (not DEFENSE) so the player plays it proactively on
    // their own turn — same shape as the other player-side shields
    // (Cracked Buckler, Buckler, Barnacle-Covered Buckler, Runeforged
    // Buckler). DEFENSE-typed shields are reactive auto-plays during
    // the defending phase, which isn't the intent here.
    cardType: CardType.ABILITY,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('gain_shield', 6, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { gain_shield: 3 },
  });
}

// Lost Adventurer's Ring — stays-in-hand relic: Heal 1-2 + 1-2 Heroism.
export function createLostAdventurersRing() {
  return new Card({
    id: 'lost_adventurers_ring',
    name: "Lost Adventurer's Ring",
    description: 'Heal 1-2, Gain 1-2 Heroism.\nStays in hand.',
    shortDesc: 'Heal 1-2, 1-2 Heroism\nStays',
    subtype: 'relic',
    cardType: CardType.ITEM,
    costType: CostType.FREE,
    effects: [
      new CardEffect('heal_random', 2, TargetType.SELF),
      new CardEffect('gain_heroism_random', 2, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    gamePlusOffset: { heal_random: 1, gain_heroism_random: 1 },
  });
}

// Player-side Unhatched Roc Egg creature — the ally that spawns
// from the Unhatched Roc Egg card. Inert (0 atk, _cantAttack), but
// 10 HP and 1 armor make it a meatshield, and onDeathSpawnPlayerChick
// hatches a 3 atk Roc Chick when it dies (handled in
// countAndRemoveDeadCreatures). _endTurnSelfDamage tracks the
// boss-side egg's 1-3 crack per turn end so the codex preview
// matches what actually spawns on the field. _hitSfxKey + _cantAttack
// are stamped after the Creature constructor since the destructured
// constructor silently drops unlisted fields.
export function createUnhatchedRocEggCreature() {
  const egg = new Creature({
    name: 'Unhatched Roc Egg',
    attack: 0,
    maxHp: 3,
    armor: 1,
    description: 'On Death: Hatch into a Roc Chick.\nTurn Start: Deal 5 damage to self.',
  });
  egg._cantAttack = true;
  egg._hitSfxKey = 'egg_hatch_01';
  egg._startTurnSelfDamage = { min: 5, max: 5 };
  return egg;
}

// Player-side hatched chick. Standalone helper so other code (the
// egg-hatch handler, codex preview, etc.) can spawn a fresh one.
// bloodfrenzy 1 stacks rage every swing — same family the boss-side
// Roc Chick uses. `randomTarget` flag tells the combat input layer
// that clicking the chick doesn't enter ALLY_TARGETING; it auto-fires
// a swing at a random alive enemy (with the standard arrow animation)
// instead of waiting for the player to pick a target.
export function createRocChickCreature() {
  const c = new Creature({
    name: 'Roc Chick',
    attack: 2,
    maxHp: 6,
    bloodfrenzy: 1,
    description: 'Attacks a random enemy.\nGain 1 Rage per attack.',
  });
  c.randomTarget = true;
  return c;
}

// Unhatched Roc Egg card — Recharge cost summon. Drops the egg ally
// on the player's row. previewCreatures lists BOTH the egg AND the
// Roc Chick it hatches into so the card's side preview tells the
// full story (egg now, chick on death), and the codex picks both up
// as player-side summons via the previewCreatures scan in
// buildCodexSourceCache.
export function createUnhatchedRocEggCard() {
  return new Card({
    id: 'unhatched_roc_egg',
    name: 'Unhatched Roc Egg',
    description: 'Recharge a Card -> Call an Unhatched Roc Egg to the battle!\nDraw.',
    shortDesc: 'R Card->Call\nRoc Egg\nDraw',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_unhatched_roc_egg', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 2,
    previewCreatures: [createUnhatchedRocEggCreature(), createRocChickCreature()],
    // No straight numeric bump — the egg's HP / armor / chick stats
    // are fixed by the card. Empty object opts into the codex no-
    // rules-needed badge so the offset preview is silent.
    gamePlusOffset: {},
  });
}
