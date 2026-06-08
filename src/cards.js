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
  });
}

export function createIceToken() {
  return new Card({
    id: 'ice_token', name: 'Ice',
    description: 'Apply 1 Ice to target.',
    shortDesc: 'Ice', subtype: 'ability',
    cardType: CardType.SKILL, costType: CostType.FREE,
    effects: [new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY)],
  });
}

export function createCatFormToken() {
  return new Card({
    id: 'cat_form_token', name: 'Feline Form',
    description: 'Gain 1 Heroism. Draw.',
    shortDesc: 'Heroism, Draw', subtype: 'ability',
    cardType: CardType.SKILL, costType: CostType.FREE,
    effects: [new CardEffect('cat_form', 1, TargetType.SELF)],
  });
}

export function createBearFormToken() {
  return new Card({
    id: 'bear_form_token', name: 'Bear Form',
    description: 'Gain Shield. Draw.',
    shortDesc: 'Shield, Draw', subtype: 'ability',
    cardType: CardType.SKILL, costType: CostType.FREE,
    effects: [new CardEffect('bear_form', 1, TargetType.SELF)],
  });
}

// ============================================================
// Generic Starter Cards
// ============================================================

export function createWoodenSword() {
  return new Card({
    id: 'wooden_sword',
    name: 'Wooden Sword',
    description: 'Recharge -> Deal 3 damage.',
    shortDesc: 'R->3 Dmg',
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
    description: 'Recharge -> Block 2, Draw.',
    shortDesc: 'R->Block 2, Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 2 },
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
    effects: [new CardEffect('heal', 3, TargetType.SELF)],
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
    description: 'Recharge -> Deal 2 Damage to 2 targets.',
    shortDesc: 'R->2 Dmg x2',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('multi_damage', 2, TargetType.SINGLE_ENEMY, 2)],
    // Fractional per: floor(1.5 * offset) → +1 at T1, +3 at T2, +4 at T3.
    gamePlusOffset: { multi_damage: 1.5 },
  });
}

export function createWoodenGreatsword() {
  return new Card({
    id: 'wooden_greatsword',
    name: 'Wooden Greatsword',
    description: 'Recharge +1 Card -> Deal 5 Damage.',
    shortDesc: 'R+1->5 Dmg',
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
    description: 'Recharge -> Deal 2 damage (+2 vs Armor or Shield).',
    shortDesc: 'R->2 Dmg\n(+2 vs Armor/Shield)',
    subtype: 'martial',
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
    description: 'Recharge -> Gain 1 Shield.\nFirst Shield: Draw.',
    shortDesc: 'R->+1 Shield\n1st Shield: Draw',
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

export function createBuckler() {
  return new Card({
    id: 'buckler',
    name: 'Buckler',
    description: 'Recharge -> Gain 2 Shield.\nFirst Shield: Draw.',
    shortDesc: 'R->+2 Shield\n1st Shield: Draw',
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
    description: 'Recharge +1 Card -> Deal 3 Damage, Draw.',
    shortDesc: 'R+1->3 Dmg, Draw',
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
    description: 'Recharge +1 Card -> Deal 4 Damage, Gain 1 Shield.',
    shortDesc: 'R+1->4 Dmg, Shield',
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
    description: 'Recharge -> Scry 2.',
    shortDesc: 'R->Scry 2',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('scry_pick', 2, TargetType.SELF)],
    gamePlusOffset: { scry_pick: 1 },
  });
}

export function createKoboldSpear() {
  return new Card({
    id: 'kobold_spear',
    name: 'Kobold Spear',
    description: 'Recharge -> Deal 3 Damage.\nOn Kill: Draw.',
    shortDesc: 'R->3 Dmg\nOn Kill: Draw',
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
    description: 'Deal 1 Damage, Gain Shield.\nStays in hand.',
    shortDesc: '1 Dmg, +Shield\nStays',
    subtype: 'light_armor',
    cardType: CardType.ATTACK,
    // FREE cost — the card never leaves the hand, so a recharge cost
    // would let you pay once and then ride it free forever. FREE keeps
    // the math honest: every swing is just "1 dmg + 1 shield" with no
    // ramp.
    costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    // +1 dmg, +0.5 shield (floor) per offset. At +1 shield stays at 1,
    // +2 bumps to 2, etc. Stays-in-hand means it pings every turn,
    // so even the fractional shield matters over a long fight.
    gamePlusOffset: { damage: 1, gain_shield: 0.5 },
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
    description: 'Recharge -> Gain 4 Shields.\nIce -> Shields on yourself.\nDeal damage = Shields.',
    shortDesc: 'R->+4 Shield\nIce -> Shield\nDmg = Shield',
    subtype: 'light_armor',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('transform_ice_to_shield_self', 0, TargetType.SELF),
      new CardEffect('shield_bash', 4, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Block 7.\nDouse Fire. Attacker gains your Ice.\nDraw.',
    shortDesc: 'R->Block 7, Draw\nDouse Fire\nAttacker gets Ice',
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

// Dragon Bone Bow — Tier 2 ranged drop. Recharge +1 cost (one
// extra hand card burned alongside the bow itself), hits up to
// 3 enemies for 4 damage each, then draws a card. The cycle
// pressure offsets the steep cost so the bow can keep firing
// across a long fight.
export function createDragonBoneBow() {
  return new Card({
    id: 'dragon_bone_bow', name: 'Dragon Bone Bow',
    description: 'Recharge +1 -> Deal 4 Damage to up to 3 targets. Draw.',
    shortDesc: 'R+1->4 Dmg x3\nDraw',
    subtype: 'ranged_2h',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('multi_damage', 4, TargetType.SINGLE_ENEMY, 3),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    tier: 2,
    rarity: 'epic',
    gamePlusOffset: { multi_damage: 2 },
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
    description: "Recharge -> Transform up to 4 of the target's Shield into Ice, then deal 5 Damage. Iced: +4 Damage.",
    shortDesc: 'R->4 Shield->Ice\nOn target\n5 Dmg +4 if Iced',
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
    description: 'Recharge a card ->\nCall the White Dragon Wyrmling to the battle!',
    shortDesc: 'R+1->Call\nthe Wyrmling',
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
    description: 'Recharge -> Block 1, Draw.',
    shortDesc: 'R->Block 1, Draw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 1 },
  });
}

export function createFireBurst() {
  return new Card({
    id: 'fire_burst',
    name: 'Fire Burst',
    description: 'Recharge -> Deal 2 Damage and 2 Fire.',
    shortDesc: 'R->2 Dmg+2 Fire',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Deal 1 Damage and Ice, Draw.',
    shortDesc: 'R->1 Dmg+Ice, Draw',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 1 },
    characterClass: ['wizard'],
    tier: 1,
    rarity: 'uncommon',
  });
}

export function createMagicMissiles() {
  return new Card({
    id: 'magic_missiles',
    name: 'Magic Missiles',
    description:
      'Recharge -> Deal 1 Damage, Draw.\nOptional: Recharge 1 more -> 3 shots of 1 damage each.',
    shortDesc: 'R->1 Dmg, Draw\nOpt R+1->3x1 Dmg',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('barrage', 2, TargetType.SELF),
    ],
    // +1 per-shot damage AND +1 barrage shot on the recharge-extra.
    // Description is rebuilt by applyGamePlusOffsetInPlace from the
    // scaled values (regex swap can't handle two damage numbers + a
    // shot count derived from barrage+1).
    gamePlusOffset: { damage: 1, barrage: 1 },
    characterClass: ['wizard'],
    tier: 1,
    rarity: 'uncommon',
  });
}

export function createArcaneShield() {
  return new Card({
    id: 'arcane_shield',
    name: 'Arcane Shield',
    description: 'Recharge -> Block 4. Draw.',
    shortDesc: 'R->Block 4, Draw',
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
    characterClass: ['wizard'],
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
    description: 'Recharge -> Deal X Damage.\nX = attacks this turn (counts itself).',
    shortDesc: 'R->X Dmg\nX = # attacks',
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
    description: 'Recharge -> Summon 1-2 Pet Spiders.\nCreate 1 Vial of Poison.',
    shortDesc: 'R->Summon 1-2 Spiders\n+Vial of Poison',
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
    description: 'Recharge -> Gain 4 Heroism.',
    shortDesc: 'R->Heroism 4',
    subtype: 'ability',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('gain_heroism', 4, TargetType.SELF)],
    characterClass: ['paladin', 'warrior'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { gain_heroism: 3 },
  });
}

export function createCharge() {
  return new Card({
    id: 'charge',
    name: 'Charge',
    description: 'Recharge -> Deal 3 Damage. Draw if first attack this turn.',
    shortDesc: 'R->3 Dmg\nDraw if 1st atk',
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
    description: 'Recharge -> Gain 1 Shield,\nDeal damage = Shield.',
    shortDesc: 'R->+1 Shield\nDmg=Shield',
    subtype: 'ability',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('shield_bash', 1, TargetType.SINGLE_ENEMY)],
    characterClass: ['warrior', 'paladin'],
    tier: 1,
    rarity: 'uncommon',
    gamePlusOffset: { shield_bash: 1 },
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
  });
}

export function createShieldOfFaith() {
  return new Card({
    id: 'shield_of_faith',
    name: 'Shield of Faith',
    description: 'Recharge -> Gain 1 Shield, Draw.',
    shortDesc: 'R->+1 Shield\nDraw',
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
    description: 'Recharge -> 50% to gain 6 Block.\nUnused Block becomes Heroism.\nDraw.',
    shortDesc: 'R->50% +6 Block\nLeftover->Heroism\nDraw',
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
    description: 'Recharge +1 Card -> Deal 4 Damage.\nHeroism is added twice.\nDraw.',
    shortDesc: 'R+1->4 Dmg\nHeroism x2\nDraw',
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
    description: 'Recharge a card ->\nCall Raena to the battle!\nCalled: Deal 2 Damage.',
    shortDesc: 'Call Raena\nCalled: 2 Dmg',
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
      return [
        arrow,
        new CardEffect('summon_raena', 1, TargetType.SUMMON),
        new CardEffect('recharge_extra', 1, TargetType.SELF),
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
    description: 'Recharge a card ->\nCall Raena to the battle!\nCalled: Deal 3 Damage.',
    shortDesc: 'Call Raena\nCalled: 3 Dmg',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: (() => {
      const arrow = new CardEffect('damage', 3, TargetType.SINGLE_ENEMY);
      arrow.optional = true;
      arrow.noAttackCount = true;
      return [
        arrow,
        new CardEffect('summon_raena_upgraded', 1, TargetType.SUMMON),
        new CardEffect('recharge_extra', 1, TargetType.SELF),
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
    description: 'Recharge a card ->\nCall Raena to the battle!\nCalled: Deal 4 Damage.',
    shortDesc: 'Call Raena\nCalled: 4 Dmg',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: (() => {
      const arrow = new CardEffect('damage', 4, TargetType.SINGLE_ENEMY);
      arrow.optional = true;
      arrow.noAttackCount = true;
      return [
        arrow,
        new CardEffect('summon_raena_tier3', 1, TargetType.SUMMON),
        new CardEffect('recharge_extra', 1, TargetType.SELF),
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
    shortDesc: 'C+R1->Heal 6\nMeal: Heal/Hero 3T',
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
    description: 'Recharge -> Create some Goodberries.',
    shortDesc: 'R->Some\nGoodberries',
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

export function createRegrowth() {
  return new Card({
    id: 'regrowth',
    name: 'Regrowth',
    description: 'Recharge -> Heal 2. Heal 1 at start of turn for 4 turns.',
    shortDesc: 'R->Heal 2\n+Regen 4t',
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
    // +2 on-play heal per offset. Per-turn regen bumps in the runtime
    // (regen_buff handler reads playerTierOffset → healPerTurn).
    // Custom regrowth handler rebuilds the dual-heal description.
    gamePlusOffset: { heal: 2, regen_per_turn: 1 },
  });
}

export function createFeralSwipe() {
  return new Card({
    id: 'feral_swipe',
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
  // 2 Scraps
  for (let i = 0; i < 2; i++) cards.push(createScraps());
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
  // 3 Scraps
  for (let i = 0; i < 3; i++) cards.push(createScraps());
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
  // 1 Small Pouch
  cards.push(createSmallPouch());
  // 2 Scraps
  for (let i = 0; i < 2; i++) cards.push(createScraps());
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
  // 1 Small Pouch
  cards.push(createSmallPouch());
  // 2 Scraps
  for (let i = 0; i < 2; i++) cards.push(createScraps());
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
    description: 'Recharge -> Heal 4.',
    shortDesc: 'R->Heal 4',
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

function createTamedRatCreature() {
  return new Creature({
    name: 'Tamed Rat',
    attack: 1,
    maxHp: 1,
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
    description: 'Bloodfrenzy: +1 Rage after attacking.',
  });
}

export function createTamedRat() {
  return new Card({
    id: 'tamed_rat',
    name: 'Rat Taming',
    description: 'Recharge -> Summon Rats.',
    shortDesc: 'R->Summon Rats',
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
    description: 'Recharge -> Deal 2 Damage to ALL enemies.',
    shortDesc: 'R->2 Dmg ALL', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [new CardEffect('damage_all', 2, TargetType.ALL_ENEMIES)],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
  });
}

export function createHammerOfWrath() {
  return new Card({
    id: 'hammer_of_wrath', name: 'Hammer of Wrath',
    description: 'Recharge -> Deal 2 Damage, Draw.',
    shortDesc: 'R->2 Dmg, Draw', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
  });
}

export function createHolySword() {
  return new Card({
    id: 'holy_sword', name: 'Holy Sword',
    description: 'Recharge +1 Card -> Deal 6 Damage. Heal 3.',
    shortDesc: 'R+1->6 Dmg, Heal 3', subtype: 'martial',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
      new CardEffect('heal', 3, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
  });
}

export function createRevivify() {
  return new Card({
    id: 'revivify', name: 'Revivify',
    description: 'Recharge -> Choose 1 of up to 3\ndead allies in your discard pile\nand summon it.',
    shortDesc: 'R->Revive 1 of\nup to 3 Allies', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [new CardEffect('revivify', 3, TargetType.SELF)],
    characterClass: ['paladin'], tier: 2, rarity: 'uncommon',
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
    description: 'Recharge -> Mark an enemy.\nDraw. +1 dmg per Mark.',
    shortDesc: 'R->Mark, Draw', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_mark', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
  });
}

export function createAnimalCompanion() {
  return new Card({
    id: 'animal_companion', name: 'Animal Companion',
    description: 'Recharge +1 Card -> Summon:\nMisha (4/4 Sentinel)\nOR Huffer (4/2 Haste)',
    shortDesc: 'R+1->Summon\nMisha or Huffer', subtype: 'ability',
    cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    // +1 recharge cost on top of the base play. Mode picks resolve
    // their own summon effect; the recharge_extra effect just sets
    // the cost the play handler reads via getCardRechargeExtra.
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    modes: [
      new CardMode('Summon Misha (4/4 Sentinel)',
        [new CardEffect('summon_misha', 1, TargetType.SUMMON)]),
      new CardMode('Summon Huffer (4/2 Haste)',
        [new CardEffect('summon_huffer', 1, TargetType.SUMMON)]),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
    previewCreatures: [createMishaCreature(), createHufferCreature()],
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
  });
}

export function createExplosiveShot() {
  return new Card({
    id: 'explosive_shot', name: 'Explosive Shot',
    description: 'Recharge -> Deal 4 Damage.\n1 Fire to all other enemies.',
    shortDesc: 'R->4 Dmg\n+Fire ALL', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('splash_fire', 1, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['ranger'], tier: 2, rarity: 'uncommon',
  });
}

// --- Wizard Tier 2 ---
export function createBurningHands() {
  return new Card({
    id: 'burning_hands', name: 'Burning Hands',
    description: 'Recharge -> Deal 2 Fire to all enemies.',
    shortDesc: 'R->2 Fire ALL', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_fire_all', 2, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
  });
}

export function createIceNova() {
  return new Card({
    id: 'ice_nova', name: 'Ice Nova',
    description: 'Recharge -> Deal 1 Damage and 1 Ice to ALL enemies.',
    shortDesc: 'R->1 Dmg+Ice ALL', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('apply_ice_all', 1, TargetType.ALL_ENEMIES),
    ],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
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
    description: 'Recharge -> Deal 5 Damage + Ice.',
    shortDesc: 'R->5 Dmg + Ice',
    subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
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

export function createIceBlock() {
  return new Card({
    id: 'ice_block', name: 'Ice Block',
    description: 'Recharge -> Gain 4 Ice and 8 Shield.',
    shortDesc: 'R->4 Ice, 8 Shield', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice_self', 4, TargetType.SELF),
      new CardEffect('gain_shield', 8, TargetType.SELF),
    ],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
  });
}

export function createArcaneBeam() {
  return new Card({
    id: 'arcane_beam', name: 'Arcane Beam',
    description: 'Recharge -> Deal 4 Damage. Recharge up to 3 extra cards for +2 damage each.',
    shortDesc: 'R->4-10 Dmg', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
      new CardEffect('optional_recharge_damage', 2, TargetType.SELF),
    ],
    characterClass: ['wizard'], tier: 2, rarity: 'uncommon',
  });
}

// --- Rogue Tier 2 ---
export function createFanOfBlades() {
  return new Card({
    id: 'fan_of_blades', name: 'Fan of Blades',
    description: 'Recharge -> Deal 1 Damage to ALL enemies.\nDraw.',
    shortDesc: 'R->1 Dmg ALL\nDraw', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['rogue'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage_all: 1 },
  });
}

export function createBackstab() {
  return new Card({
    id: 'backstab', name: 'Backstab',
    description: 'Recharge -> Deal 6 Damage.\nWas Undamaged: Draw.',
    shortDesc: 'R->6 Dmg\nUndamaged->Draw', subtype: 'ability',
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
    description: 'Deal 2 Damage + Poison.\nStays in hand.',
    shortDesc: '2 Dmg+Poison\nStays', subtype: 'simple',
    cardType: CardType.ATTACK, costType: CostType.FREE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    characterClass: ['rogue'], tier: 2,
    rarity: 'uncommon',
    // +1 dmg, +0.5 poison (floor) per offset.
    gamePlusOffset: { damage: 1, apply_poison: 0.5 },
  });
}

export function createSprint() {
  return new Card({
    id: 'sprint', name: 'Sprint',
    description: 'Recharge -> Draw 2 cards.',
    shortDesc: 'R->Draw 2', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [new CardEffect('draw', 2, TargetType.SELF)],
    characterClass: ['rogue'], tier: 2, rarity: 'uncommon',
    noTierOffset: true,
  });
}

// --- Warrior Tier 2 ---
export function createThunderclap() {
  return new Card({
    id: 'thunderclap', name: 'Thunderclap',
    description: 'Recharge -> Apply 1 Shock to ALL enemies.',
    shortDesc: 'R->Shock ALL', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [new CardEffect('apply_shock_all', 1, TargetType.ALL_ENEMIES)],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { apply_shock_all: 0.5 },
  });
}

export function createShieldWall() {
  return new Card({
    id: 'shield_wall', name: 'Shield Wall',
    description: 'Recharge -> Gain 4 Shield.\nAllies gain 1 Shield.',
    shortDesc: 'R->4 Shld, Ally 1', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 4, TargetType.SELF),
      new CardEffect('buff_allies_shield', 1, TargetType.SELF),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { gain_shield: 1, buff_allies_shield: 1 },
  });
}

export function createBattleShout() {
  return new Card({
    id: 'battle_shout', name: 'Battle Shout',
    description: 'Recharge -> You and allies gain 1 Heroism, Draw.',
    shortDesc: 'R->Hero+Ally Hero\nDraw', subtype: 'ability',
    cardType: CardType.ABILITY, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_heroism', 1, TargetType.SELF),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { gain_heroism: 1, buff_allies_heroism: 1 },
  });
}

export function createExecute() {
  return new Card({
    id: 'execute', name: 'Execute',
    description: 'Recharge -> Deal 5 Damage, Draw.\nMust target enemy below half HP.',
    shortDesc: 'R->5 Dmg, Draw\n(<50% HP)', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('execute_restriction', 0, TargetType.SELF),
    ],
    characterClass: ['warrior'], tier: 2, rarity: 'uncommon',
    gamePlusOffset: { damage: 3 },
  });
}

// --- Druid Tier 2 ---
function createTreantCreature() {
  return new Creature({ name: 'Treant', attack: 2, maxHp: 1, haste: true, description: 'Haste' });
}

export function createSummonTreants() {
  return new Card({
    id: 'summon_treants', name: 'Summon Treants',
    description: 'Recharge -> Summon 2-4 Treants.\n(2/1 with Haste)',
    shortDesc: 'R->Summon 2-4\nTreants', subtype: 'ability',
    cardType: CardType.CREATURE, costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_treants', 1, TargetType.SUMMON)],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
    previewCreature: createTreantCreature(),
  });
}

export function createFeralBite() {
  return new Card({
    id: 'feral_bite', name: 'Feral Bite',
    description: 'Recharge -> Deal 3 Damage. Gain 3 Shield.',
    shortDesc: 'R->3 Dmg, 3 Shield', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 3, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
  });
}

export function createStarfire() {
  return new Card({
    id: 'starfire', name: 'Starfire',
    description: 'Recharge +1 Card -> Deal 6 Damage. Draw.',
    shortDesc: 'R+1->6 Dmg, Draw', subtype: 'ability',
    cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    characterClass: ['druid'], tier: 2, rarity: 'uncommon',
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
  return [createHeroicStrike(), createShieldBash(), createShieldOfFaith(), createFlashHeal(),
          createConsecration(), createHammerOfWrath(), createHolySword(), createRevivify()];
}

export function getRangerAbilityChoices() {
  return [createTamedRat(), createGoodberries(), createAimedShotCard(), createHeroicTumble(),
          createHuntersMark(), createAnimalCompanion(), createPiercingShot(), createExplosiveShot()];
}

export function getWizardAbilityChoices() {
  return [createFireBurst(), createIceBolt(), createMagicMissiles(), createArcaneShield(),
          createBurningHands(), createIceNova(), createIceBlock(), createArcaneBeam()];
}

export function getRogueAbilityChoices() {
  return [createAimedShotCard(), createSneakAttack(), createPetSpider(), createHeroicTumble(),
          createFanOfBlades(), createBackstab(), createPoisonedDagger(), createSprint()];
}

export function getWarriorAbilityChoices() {
  return [createHeroicStrike(), createCharge(), createRecklessStrike(), createShieldBash(),
          createThunderclap(), createShieldWall(), createBattleShout(), createExecute()];
}

export function getDruidAbilityChoices() {
  return [createWrath(), createRegrowth(), createFeralSwipe(), createSneakAttack(),
          createSummonTreants(), createFeralBite(), createStarfire(), createHealingTouch()];
}

export function getAbilityChoices(className, count = 3, tier = 1) {
  const choiceFns = {
    Paladin: getPaladinAbilityChoices,
    Ranger: getRangerAbilityChoices,
    Wizard: getWizardAbilityChoices,
    Rogue: getRogueAbilityChoices,
    Warrior: getWarriorAbilityChoices,
    Druid: getDruidAbilityChoices,
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
    description: 'Recharge -> Block 1, Draw.',
    shortDesc: 'R->Block 1, Draw',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    gamePlusOffset: { block: 2 },
  });
}

export function createBigBone() {
  return new Card({
    id: 'big_bone',
    name: 'Big Bone',
    description: 'Recharge +1 Card -> Deal 2 damage.',
    shortDesc: 'R+1->2 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    gamePlusOffset: { damage: 2 },
  });
}

export function createLooseBone() {
  return new Card({
    id: 'loose_bone',
    name: 'Loose Bone',
    description: 'Recharge -> Block 1, Draw.\nSummon a Restless Bone.',
    shortDesc: 'R->Block 1, Draw\n+Restless Bone',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
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
    description: 'Recharge -> Deal 2 Unpreventable Damage.',
    shortDesc: 'R->2 True Dmg',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('unpreventable_damage', 2, TargetType.SINGLE_ENEMY)],
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
    description: 'Recharge -> Summon a Pet Slime to the battle!',
    shortDesc: 'R->Summon Slime',
    subtype: 'ally',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('summon_pet_slime', 1, TargetType.SUMMON)],
    rarity: 'rare',
    previewCreature: createPetSlimeCreature(),
    // +1 max Pet Slimes summoned per offset (1 → 1-2 → 1-3 …). The
    // pet_slime branch in applyGamePlusOffsetInPlace rebuilds the
    // description; the previewCreature's stats scale via
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
    description: 'Recharge -> Block 2,\nGain 1 Shield. Draw.',
    shortDesc: 'R->Block 2\n+1 Shield, Draw',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_shield', 1, TargetType.SELF),
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
    description: 'Recharge -> Deal 2 damage.',
    shortDesc: 'R->2 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage', 2, TargetType.SINGLE_ENEMY)],
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
    description: 'Recharge +1 Card -> Deal 4 damage. +1 Poison vs Armor/Shield.',
    shortDesc: 'R+1->4 Dmg\n+1 Poison vs\nArmor/Shield',
    subtype: 'martial_2h',
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
    description: 'Recharge -> Deal 3 damage. +1 Poison vs Armor/Shield.',
    shortDesc: 'R->3 Dmg\n+1 Poison vs\nArmor/Shield',
    subtype: 'martial',
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
    description: 'Recharge +1 Card -> Deal 3 Damage + Poison, Shield 1.',
    shortDesc: 'R+1->3 Dmg\n+Poison, Shield 1',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
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
    description: 'Attack: 2 Dmg\nDefense: Block 1,\n2 Dmg random, Draw',
    shortDesc: 'R->2 Dmg / Def:\nBlock 1 +2 rand\nDraw',
    subtype: 'light_armor',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
    ],
    modes: [
      new CardMode('Block 1, 2 Dmg random, Draw', [
        new CardEffect('block', 1, TargetType.SELF),
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
    description: 'Discard -> Deal 1 Fire to all. Scry 3.',
    shortDesc: 'D->Fire ALL,\nScry 3',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('apply_fire_all', 1, TargetType.ALL_ENEMIES),
      new CardEffect('scry_pick', 3, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { apply_fire_all: 1, scry_pick: 1 },
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
    description: 'Recharge -> Deal 1 Damage, Allies gain 1 Heroism.',
    shortDesc: "R->1 Dmg\n+1 Ally Heroism",
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // Second effect buffs all player creature allies with +1 Heroism on
    // play. Matches PY: the card was missing this half of its effect list.
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    // +1 dmg, +0.5 ally heroism (floor) per offset. At +1 ally heroism
    // stays at 1, +2 makes it 2, etc.
    gamePlusOffset: { damage: 1, buff_allies_heroism: 0.5 },
  });
}

export function createSharpRock() {
  return new Card({
    id: 'sharp_rock',
    name: 'Sharp Rock',
    description: 'Recharge -> Deal 1 Damage. Hit: Draw.',
    shortDesc: 'R->1 Dmg\nHit: Draw',
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
    // +2 per-shot damage per offset (shot count stays at 2). The
    // { value: 2 } shape uses the same bump helper but skips the
    // maxTargets bump that the earlier wiring added.
    gamePlusOffset: { enemy_damage_succession: { value: 2 } },
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
    description: 'Recharge -> Deal 3 Damage.',
    shortDesc: 'R->3 Dmg',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge +1 ->\nDeal 5 Damage + Poison.',
    shortDesc: 'R+1->5 Dmg+Poison',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 5, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Block 1, Heal 1, Draw.\nOn Swim: Draw.',
    shortDesc: 'R->Block 1, Heal 1, Draw\nOn Swim: Draw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('heal', 1, TargetType.SINGLE_ALLY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_swim_recharge_draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 1,
    gamePlusOffset: { block: 1, heal: 1 },
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
    description: 'Recharge -> Block 2, Draw.\nOn Discard: Draw.',
    shortDesc: 'R->Block 2, Draw\nOn Discard: Draw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('on_discard', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 1,
    gamePlusOffset: { block: 2 },
  });
}

// Harpy Feather — Tier 1 Relic. Sole effect is the on_discard
// trigger (draw 2 whenever the feather moves to discard). Costs
// nothing on its own — players cycle it deliberately to mill draws.
export function createHarpyFeather() {
  return new Card({
    id: 'harpy_feather',
    name: 'Harpy Feather',
    description: 'On Discard: Draw 2.',
    shortDesc: 'On Discard: Draw 2',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.FREE,
    effects: [
      new CardEffect('on_discard', 2, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 1,
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
    // +2 damage on the discard-or-damage rider per offset (the
    // damage tier of luring_song; the number of cards discarded
    // stays at 1 per enemy regardless of offset).
    gamePlusOffset: { luring_song: 2 },
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
    description: 'Recharge +1 ->\nDeal 10 Damage minus cards in hand.',
    shortDesc: 'R+1->10-hand Dmg',
    subtype: 'spell',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage_minus_hand_count', 10, TargetType.SINGLE_ENEMY),
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
    shortDesc: 'R->1 Dmg All\nAllies +1 H',
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
    description: 'Recharge ->\nBlock 1, Gain 2 Heroism for each Damaged Enemy, Draw.',
    shortDesc: 'R->Block 1\n+2H/Damaged\n+Draw',
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
    description: 'Recharge ->\nDeal 4 Damage + 2 Bleed.',
    shortDesc: 'R->4 Dmg\n+2 Bleed',
    subtype: 'martial',
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
    description: 'Recharge ->\nDeal 1 Bleed to all enemies.\nAllies gain 1 Heroism.',
    shortDesc: 'R->1 Bleed All\nAllies +1 H',
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
    description: 'On Draw: Gain 1 Heroism.',
    shortDesc: 'On Draw:\n+1 Heroism',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('on_draw_heroism', 1, TargetType.SELF)],
    rarity: 'epic',
    tier: 1,
    unplayable: true,
    gamePlusOffset: { on_draw_heroism: 0.5 },
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
    description: 'Recharge ->\nGain 3 Shield. Create 1 Barnacle.\nFirst Shield, On Swim: Draw.',
    shortDesc: 'R->3 Shield\n+1 Barnacle\n1st/Swim: Draw',
    subtype: 'light_armor',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 3, TargetType.SELF),
      new CardEffect('create_barnacle', 1, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
      new CardEffect('on_swim_recharge_draw', 1, TargetType.SELF),
    ],
    rarity: 'epic',
    tier: 1,
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
  });
}

// Zhost's Buckler — drops as boss loot. Light armor that hits for
// 2 damage + 1 Ice, grants 2 Shields, and pulls a card if the player
// has built up at least 2 Shields by the end of the play.
export function createZhostsBuckler() {
  return new Card({
    id: 'zhosts_buckler',
    name: "Zhost's Buckler",
    description: 'Recharge -> Deal 2 Damage + 1 Ice.\nGain 2 Shields.\nFirst Shield: Draw.',
    shortDesc: 'R->2 Dmg, 1 Ice\n+2 Shield\n1st Shield: Draw',
    subtype: 'light_armor',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('gain_shield', 2, TargetType.SELF),
      new CardEffect('draw_if_no_shield', 0, TargetType.SELF),
    ],
    rarity: 'rare',
    gamePlusOffset: { damage: 2, apply_ice: 1, gain_shield: 1 },
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
  });
}
export function createBuffRegrowth() {
  return new Card({
    id: 'buff_regrowth',
    name: 'Regrowth',
    description: 'Start of Turn: Heal 1',
    shortDesc: 'Heal 1/turn',
    subtype: 'buff', cardType: CardType.ABILITY, costType: CostType.FREE,
    effects: [],
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
    shortDesc: '+Ignite/turn\nBurning: +Ign,Draw',
    subtype: 'buff',
    cardType: CardType.ABILITY,
    costType: CostType.FREE,
    effects: [],
    rarity: 'uncommon',
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
    description: 'Consume + Recharge 1 -> Heal 4, Draw.\nMeal: Heal 1 or Draw for 3 turns.',
    shortDesc: 'C+R1->Heal 4, Draw\nMeal: Heal/Draw 3T',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.BANISH,
    effects: [
      new CardEffect('heal', 4, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('grant_provision', 0, TargetType.SELF),
    ],
    provision: {
      slot: 'meal',
      name: 'Travel Rations',
      turnsPerCombat: 3,
      effects: [
        { effectType: 'random_pick', options: [
          { effectType: 'heal', value: 1 },
          { effectType: 'draw_card', value: 1 },
        ]},
      ],
      description: 'Heal 1 or Draw each turn for 3 turns (each combat, until rest)',
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
    effects: [new CardEffect('heal', 4, TargetType.SELF)],
    rarity: 'uncommon',
    gamePlusOffset: { heal: 3 },
  });
}

export function createTravelersClothing() {
  return new Card({
    id: 'travelers_clothing',
    name: "Traveler's Clothing",
    description: 'Recharge -> Block 2, Scry 2.',
    shortDesc: 'R->Block 2\nScry 2',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('scry_pick', 2, TargetType.SELF),
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
    description: 'Recharge -> Scry 3.',
    shortDesc: 'R->Scry 3',
    subtype: 'item',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('scry_pick', 3, TargetType.SELF)],
    rarity: 'uncommon',
    gamePlusOffset: { scry_pick: 1 },
  });
}

// ============================================================
// Shop Cards - Weaponsmith
// ============================================================

export function createSteelAxe() {
  return new Card({
    id: 'steel_axe',
    name: 'Steel Axe',
    description: 'Recharge -> Deal 3 Damage to 2 targets.',
    shortDesc: 'R->3 Dmg x2',
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
    description: 'Recharge -> Deal 3 damage (+2 vs Armor/Shield).',
    shortDesc: 'R->3 Dmg\n(+2 vs Armor/Shield)',
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
    description: 'Recharge -> Deal 4 damage.',
    shortDesc: 'R->4 Dmg',
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
    description: 'Recharge +1 Card -> Deal 4 Damage and\n3 Damage to 2 other targets.',
    shortDesc: 'R+1->4 Dmg\n+3 Dmg x2',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      // 4 to primary, 3 to up to 2 other targets (3 total max). Encoded as 43.
      new CardEffect('split_damage', 43, TargetType.SINGLE_ENEMY, 3),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    // +2 primary / +1 secondary per offset (4/3 → 6/4 → 8/5…).
    gamePlusOffset: { split_damage: { primary: 2, secondary: 1 } },
  });
}

export function createBow() {
  return new Card({
    id: 'bow',
    name: 'Bow',
    description: 'Recharge +1 -> Deal 4 damage, Draw.',
    shortDesc: 'R+1->4 Dmg, Draw',
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
    description: 'Recharge -> Block 2,\nGain Shield. Draw.',
    shortDesc: 'R->Block 2, Shield\nDraw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_shield', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { block: 2, gain_shield: 0.5 },
  });
}

export function createRingMail() {
  return new Card({
    id: 'ring_mail',
    name: 'Ring Mail',
    description: 'Recharge -> Block 3,\nGain Shield. Draw.',
    shortDesc: 'R->Block 3\n+Shield, Draw',
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

export function createScrollOfPotency() {
  return new Card({
    id: 'scroll_of_potency',
    name: 'Scroll of Potency',
    description: 'Recharge -> Gain 1 Heroism now and for the next 3 turns.',
    shortDesc: 'R->+1 Heroism\n3 turns',
    subtype: 'scroll',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_heroism', 1, TargetType.SELF),
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
    description: 'Recharge -> Apply 1 Poison, Draw.',
    shortDesc: 'R->Poison 1,\nDraw',
    subtype: 'relic',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_poison', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
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
    description: 'Recharge +1 -> Deal 2 Damage, Draw.',
    shortDesc: 'R+1->2 Dmg, Draw',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Apply 1 Ice.',
    shortDesc: 'R->+Ice',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY)],
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
    description: 'Recharge -> Deal 4 Damage and 1 Ice.',
    shortDesc: 'R->4 Dmg, Ice',
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
    description: 'Recharge +1 -> Deal 4 damage (+4 vs Armor/Shield).',
    shortDesc: 'R+1->4 Dmg\n(+4 Armor)',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('armor_bonus_damage', 48, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge +1 Card -> Deal 4 Damage, Gain 2 Shields.',
    shortDesc: 'R+1->4 Dmg\n+2 Shield',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 4, TargetType.SINGLE_ENEMY),
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
    shortDesc: 'C->Heal 1, +1H\nBeverage: +Hero/2T',
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

// Mirrors Python create_trident_throw exactly: 1 damage + Draw 1 +
// 1 bonus if target is damaged.
export function createTridentThrow() {
  return new Card({
    id: 'trident_throw',
    name: 'Trident Throw',
    description: 'Recharge -> Deal 1 Damage, Draw 1. +1 if target is damaged.',
    shortDesc: 'R->1 Dmg, Draw 1\n+1 if damaged',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('damaged_bonus_damage', 1, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 1, damaged_bonus_damage: 1 },
  });
}

// Mirrors Python create_trident_thrust exactly: 3 damage with a
// 1-card recharge cost + 1 bonus if target is damaged.
export function createTridentThrust() {
  return new Card({
    id: 'trident_thrust',
    name: 'Trident Thrust',
    description: 'Recharge +1 -> Deal 3 Damage. +1 if target is damaged.',
    shortDesc: 'R+1->3 Dmg\n+1 if damaged',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('damaged_bonus_damage', 1, TargetType.SINGLE_ENEMY),
    ],
    gamePlusOffset: { damage: 2, damaged_bonus_damage: 1 },
  });
}

export function createScaleArmor() {
  return new Card({
    id: 'scale_armor',
    name: 'Scale Armor',
    description: 'Recharge -> Block 3, Draw.\nDeal 2 Ice randomly.\nOn Swim: Draw 2.',
    shortDesc: 'R->Block 3, Draw\n2 Ice random\nOn Swim: Draw 2',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('apply_ice_random', 2, TargetType.RANDOM_ENEMY),
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

export function createSahuaginStaffEnemy() {
  // Mirrors PY create_sahuagin_staff_enemy — Recharge +1, 1 dmg +
  // 1 Ice + summon a Shark. Was incorrectly applying Fire instead
  // of Ice, with no extra recharge cost or shark summon.
  return new Card({
    id: 'sahuagin_staff_enemy',
    name: 'Sahuagin Staff',
    description: 'Recharge +1 -> Deal 1 Damage + Ice, Summon a Shark.',
    shortDesc: 'R+1->1 Dmg+Ice\nSummon Shark',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('summon_shark', 1, TargetType.SUMMON),
    ],
    priority: 2,
    // +1 dmg, +1 ice, +0.5 max shark per offset (floor — first
    // extra shark lands at offset 2, second at offset 4…).
    gamePlusOffset: { damage: 1, apply_ice: 1, summon_shark: 0.5 },
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
    description: 'Recharge -> Block 5,\ncreate 1-2 Barnacle. Draw.\nOn Swim: Draw 2.',
    shortDesc: 'R->Block 5, Draw\n+1-2 Barnacle\nOn Swim: Draw 2',
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
    description: 'Deal 2 Damage. +2 if target is Poisoned. Stays in hand.',
    shortDesc: '2 Dmg (+2 Poison)\nStays in hand',
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
    description: 'Recharge -> 50% to gain\n10 Block. Draw.',
    shortDesc: 'R->50% Block 10\nDraw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      // value = chance %, handler grants 10 Block (default) or the
      // bumped _chanceBlockAmount stamped by ccgQuest+ offset.
      new CardEffect('block_chance_10', 50, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
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
    description: 'Recharge -> Block 1-2,\nGain 1-2 Shield, Heal 1-2.\nDraw.',
    shortDesc: 'R->Block 1-2\n+1-2 Shield/Heal\nDraw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block_random', 2, TargetType.SELF),
      new CardEffect('gain_shield_random', 2, TargetType.SELF),
      new CardEffect('heal_random', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +1 to the upper bound of each random roll per offset
    // (1-2 → 1-3 → 1-4 …).
    gamePlusOffset: { block_random: 1, gain_shield_random: 1, heal_random: 1 },
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
    description: 'Recharge -> Deal 2 True Damage. Heal 2.',
    shortDesc: 'R->2 True Dmg\nHeal 2',
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
    description: 'Recharge +1 -> Summon 1 Random Ancestor.\n(Durin, Balgrim, or Thordak)',
    shortDesc: 'R+1->Summon\nAncestor',
    subtype: 'ability',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('summon_ancestor', 1, TargetType.SUMMON),
    ],
    tier: 2,
    rarity: 'rare',
    // Mini-preview the 3 possible summons next to the card (same
    // treatment Animal Companion gets for Misha/Huffer). Stats here
    // must mirror the player-side variant in main.js's
    // `summon_ancestor` effect handler — these are weaker than the
    // boss-shell versions in setupEnemyForCombat.
    previewCreatures: [
      new Creature({ name: 'Durin Stoneheart', attack: 3, maxHp: 6,
        endTurnHealAllies: 1,
        description: 'End of Turn: Heal 1 to all allies.' }),
      new Creature({ name: 'Balgrim Ironvein', attack: 2, maxHp: 4, armor: 1,
        endTurnShieldAllies: 1,
        description: 'End of Turn: All allies gain 1 Shield.' }),
      new Creature({ name: 'Thordak Ashmantle', attack: 2, maxHp: 5, multiAttack: 99,
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
// the card heals 4 + draws 1 as a placeholder consumable. TODO:
// proper Ethereal grant when the buff exists.
export function createSpecterEctoplasm() {
  return new Card({
    id: 'specter_ectoplasm',
    name: 'Specter Ectoplasm',
    description: 'Heal 2. Discard. Draw.',
    shortDesc: 'Heal 2, Discard\nDraw',
    subtype: 'relic',
    cardType: CardType.ITEM,
    costType: CostType.DISCARD,
    effects: [
      new CardEffect('heal', 2, TargetType.SELF),
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
    description: 'Recharge -> Block 1.\nDeal Fire to all enemies. Draw.',
    shortDesc: 'R->Block 1, Draw\nFire ALL',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
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

export function createOgreMaul() {
  return new Card({
    id: 'ogre_maul',
    name: 'Ogre Maul',
    description: 'Recharge +3 Cards -> Deal 8 damage (+6 vs Armor/Shield).',
    shortDesc: 'R+3->8 Dmg\n(+6 Armor)',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('armor_bonus_damage', 814, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 3, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    // +4 base / +2 vs Armor-Shield per offset (8/+6 → 12/+8 → 16/+10…).
    gamePlusOffset: { armor_bonus_damage: { base: 4, bonus: 2 } },
  });
}

export function createCrush() {
  return new Card({
    id: 'crush',
    name: 'Crush',
    description: 'Recharge -> Deal 3 Damage.',
    shortDesc: 'R->3 Dmg',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('damage', 3, TargetType.SINGLE_ENEMY)],
    gamePlusOffset: { damage: 2 },
  });
}

export function createRockyAppendage() {
  return new Card({
    id: 'rocky_appendage',
    name: 'Rocky Appendage',
    description: 'Recharge -> Deal 1 Damage.\n(+2 vs Armor/Shield)',
    shortDesc: 'R->1 Dmg\n+2 vs Arm/Shd',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    // value 12 = base 1, bonus 2 (armor_bonus_damage value < 100 is base*10+bonus).
    effects: [new CardEffect('armor_bonus_damage', 12, TargetType.SINGLE_ENEMY)],
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
    description: 'Recharge +1 -> You and allies gain 1 Heroism. Deal 2 Damage. A random drake attacks.',
    shortDesc: 'R+1->+1 Hero\n2 Dmg, Drake',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('buff_allies_heroism', 1, TargetType.SELF),
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Block 3. Draw.',
    shortDesc: 'R->Block 3, Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 3, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { block: 2 },
  });
}

// Frost Drake Scale — relic dropped by the Kobold Drake Rider on the
// Qualibaf Volcano path. Mirrors PY cards_basic.py:create_frost_drake_scale.
export function createFrostDrakeScale() {
  return new Card({
    id: 'frost_drake_scale',
    name: 'Frost Drake Scale',
    description: 'Recharge -> Deal Ice to a random enemy. Draw.',
    shortDesc: 'R->Ice random\nDraw',
    subtype: 'relic',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('apply_ice', 1, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    gamePlusOffset: { apply_ice: 1 },
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
    description: 'Recharge -> Deal X Damage. Draw.\nX = attacks this turn (counts itself).',
    shortDesc: 'R->X Dmg, Draw\nX=attacks',
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
    // +2 flat bonus damage per offset (X + 2 → X + 4…). The
    // enemy_sneak_attack runtime adds eff.value as a flat bonus on
    // top of the per-turn X count.
    gamePlusOffset: { enemy_sneak_attack: 2 },
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
    description: 'Recharge -> Block 5.\nDeal Fire to all enemies. Draw.',
    shortDesc: 'R->Block 5\nFire ALL, Draw',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
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
// Recharge → 1 Ignite + Draw. Mirrors PY cards_basic.py:create_molten_scale_relic.
export function createMoltenScaleRelic() {
  return new Card({
    id: 'molten_scale_relic',
    name: 'Molten Scale',
    description: 'Recharge -> Gain 1 Ignite. Draw.',
    shortDesc: 'R->+1 Ignite\nDraw',
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
    description: 'Recharge -> Deal 6 Damage to target.\nApply 1 Ice to ALL enemies.',
    shortDesc: 'R->6 Dmg\n1 Ice ALL',
    subtype: 'martial',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 6, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_ice_all', 1, TargetType.ALL_ENEMIES),
    ],
    rarity: 'rare',
    tier: 2,
    // +3 dmg / +0.5 Ice (floor) per offset.
    gamePlusOffset: { damage: 3, apply_ice_all: 0.5 },
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
    description: 'Recharge -> Block 5,\nGain 1 Shield. Draw.\nOn Recharge: Gain Shield.',
    shortDesc: 'R->Block 5\n+1 Shield, Draw\nOn R: +Shield',
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
    description: 'Recharge -> Strip 2 Shields\nand Deal 4 Damage.',
    shortDesc: 'R->Strip 2 Shield\n4 Dmg',
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
    description: 'Recharge +1 -> Strip 2 Shields\nand Deal 6 Damage (+2 vs Armor/Shield).',
    shortDesc: 'R+1->Strip 2 Shield\n6 Dmg (+2 vs Armor)',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('destroy_shield', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('armor_bonus_damage', 68, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Deal 2 Damage to 2 targets.\n2 Targets: Draw.',
    shortDesc: 'R->2 Dmg x2\n2 Targets: Draw',
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
    description: 'Recharge -> Gain 2 Shields,\nGain 2 Heroism.\nFirst Shield: Draw.',
    shortDesc: 'R->+2 Shield\n+2 Heroism\n1st Shield: Draw',
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
    description: 'Recharge a card ->\nGain 5 Shields.\nStays in hand.',
    shortDesc: 'R+1->+5 Shield\nStays in hand',
    subtype: 'heavy_armor',
    // ABILITY (not DEFENSE) so it can only be played proactively on the
    // player's turn, not reactively during the defending phase.
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('gain_shield', 5, TargetType.SELF),
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
    description: 'Recharge -> Deal 3 Damage + 1 Fire.',
    shortDesc: 'R->3 Dmg + 1 Fire',
    subtype: 'weapon',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Block 5.\nDeal Fire to all enemies. Draw.',
    shortDesc: 'R->Block 5\nFire ALL, Draw',
    subtype: 'armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 5, TargetType.SELF),
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
    description: 'Recharge -> Deal 2 Damage and Fire. Deal Fire to yourself. Draw.',
    shortDesc: 'R->2 Dmg+Fire\nFire Self, Draw',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 2, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('apply_fire_self', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'common',
    tier: 2,
    gamePlusOffset: { damage: 1 },
  });
}

// Mephit Skin Sandals — uncommon clothing. Block 1 + Draw + if you
// were burning at card-play time, heal 1 Fire + Draw again. Mirrors
// PY cards_basic.py:create_mephit_skin_sandals.
export function createMephitSkinSandals() {
  return new Card({
    id: 'mephit_skin_sandals',
    name: 'Mephit Skin Sandals',
    description: 'Recharge -> Block 1.\nDeal 2 Fire randomly. Draw.\nBurning: Douse Fire and Draw.',
    shortDesc: 'Block 1, 2 Fire rand\nDraw / Burning:\nDouse Fire, Draw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
      new CardEffect('apply_fire_random', 2, TargetType.RANDOM_ENEMY),
      new CardEffect('draw', 1, TargetType.SELF),
      // value=99 → if burning, Douse ALL Fire stacks.
      new CardEffect('if_burning_heal_fire', 99, TargetType.SELF),
      new CardEffect('if_burning_draw', 1, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +1 block, +2 random Fire, +1 douse (the "Douse ALL" rider
    // is already maxed at 99; the +1 here is symbolic and shows in
    // the description swap via the if_burning_heal_fire pattern).
    gamePlusOffset: { block: 1, apply_fire_random: 2, if_burning_heal_fire: 1 },
  });
}

// Mephit Skin Gloves — uncommon clothing. Block 2 + Gain 2 Ignite +
// if Burning: Heal 1 Fire + 2 more Ignite. Mirrors PY
// cards_basic.py:create_mephit_skin_gloves.
export function createMephitSkinGloves() {
  return new Card({
    id: 'mephit_skin_gloves',
    name: 'Mephit Skin Gloves',
    description: 'Recharge -> Block 2,\nGain 2 Ignite. Draw.\nBurning: Douse 1 Fire and Gain 2 Ignite.',
    shortDesc: 'Block 2, +2 Ignite\nDraw / Burning:\nDouse 1, +2 Ignite',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('gain_ignite', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
      new CardEffect('if_burning_heal_fire', 1, TargetType.SELF),
      new CardEffect('if_burning_gain_ignite', 2, TargetType.SELF),
    ],
    rarity: 'uncommon',
    tier: 2,
    // +1 block, +1 Ignite, +1 Douse (if_burning_heal_fire),
    // +1 Ignite while burning per offset.
    gamePlusOffset: {
      block: 1,
      gain_ignite: 1,
      if_burning_heal_fire: 1,
      if_burning_gain_ignite: 1,
    },
  });
}

// Magma Tablet — uncommon scroll. Gain 1 Ignite + 1 Ignite/turn for
// 4 turns. If Burning: +1 Ignite + Draw. Mirrors PY
// cards_basic.py:create_magma_tablet.
export function createMagmaTablet() {
  return new Card({
    id: 'magma_tablet',
    name: 'Magma Tablet',
    description: 'Recharge -> Gain 1 Ignite now and for the next 4 turns.\nBurning: Gain 1 Ignite and Draw.',
    shortDesc: 'R->+1 Ignite\n4 turns (+Burning)',
    subtype: 'scroll',
    cardType: CardType.ITEM,
    costType: CostType.RECHARGE,
    effects: [new CardEffect('grant_magma_tablet_buff', 4, TargetType.SELF)],
    rarity: 'uncommon',
    tier: 2,
    // +0.5 turns per offset (4 → 5 at +2, 6 at +4 …) — the value
    // here IS the turn count. Custom branch in
    // applyGamePlusOffsetInPlace bumps the per-turn Ignite by +1
    // per offset via a stamped `_magmaTabletIgnite` field.
    gamePlusOffset: { grant_magma_tablet_buff: 0.5 },
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
  return new Creature({
    name: 'Valdrisa', attack: 2, maxHp: 4, isCompanion: true,
    description: '+2 vs Armor/Shield. Turn End: Heal 2 a random damaged ally.',
    noTierOffset: true,
  });
}

// Valdrisa tier 3 — ccgQuest+ rescue version (offset 1+, since base
// Val is already tier 2). +1/+1 over tier 2, +1 to the end-of-turn
// heal (2 → 3), and +1 to the obsidian-family armor bonus (+2 → +3
// vs Armor/Shield). The endTurnHealRandomAlly and armorBonusOverride
// fields are read by the runtime tick + applyObsidianAllyBonus.
export function createValdrisaTier3Creature() {
  return new Creature({
    name: 'Valdrisa', attack: 3, maxHp: 5, isCompanion: true,
    endTurnHealRandomAlly: 3,
    armorBonusOverride: 3,
    description: '+3 vs Armor/Shield. Turn End: Heal 3 a random damaged ally.',
    noTierOffset: true,
  });
}

export function createValdrisaCard() {
  return new Card({
    id: 'valdrisa_card',
    name: 'Valdrisa Emberforge',
    description: 'Recharge a card ->\nCall Valdrisa to the battle!',
    shortDesc: 'Call Valdrisa',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_valdrisa', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
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
    description: 'Recharge a card ->\nCall Valdrisa to the battle!\nCalled: Heal 3 (optional).',
    shortDesc: 'Call Valdrisa\nCalled: Heal 3',
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
    name: 'Obsidian Construct', attack: 2, maxHp: 4, armor: 1, sentinel: true,
    description: 'Sentinel. +2 vs Armor/Shield.',
  });
}

export function createObsidianRock() {
  return new Card({
    id: 'obsidian_rock', name: 'Obsidian Rock',
    description: 'Recharge -> Deal 2 Damage (+2 and Draw vs Armor/Shield).',
    shortDesc: 'R->2 Dmg\n+2 & Draw vs\nArmor/Shield',
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
    description: 'Recharge -> Deal 4 Damage (+2 vs Armor/Shield) and 1 Fire.',
    shortDesc: 'R->4 Dmg (+2 vs\nArmor), +1 Fire',
    subtype: 'martial', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('armor_bonus_damage', 46, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge +1 -> Deal 1 Damage (+2 vs Armor/Shield). Summon a 2/4 Obsidian Construct (Sentinel, 1 Armor, +2 vs Armor/Shield).',
    shortDesc: 'R+1->1 Dmg (+2)\nSummon Construct',
    subtype: 'staff', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    effects: [
      new CardEffect('armor_bonus_damage', 13, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('summon_obsidian_construct', 1, TargetType.SUMMON),
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
    description: 'Recharge +1 -> Deal 7 Damage. Draw 1 vs Armor/Shield.',
    shortDesc: 'R+1->7 Dmg\nDraw 1 vs Armor',
    subtype: 'martial_2h', cardType: CardType.ATTACK, costType: CostType.RECHARGE,
    // draw_vs_armor sits BEFORE the damage effect so it reads pre-hit
    // armor/shield (matches Obsidian Rock / Bone Mace ordering). Target
    // is SINGLE_ENEMY so the handler checks the enemy's armor instead
    // of the caster's. With SELF the check always saw player.armor = 0
    // and silently failed.
    effects: [
      new CardEffect('draw_vs_armor', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('damage', 7, TargetType.SINGLE_ENEMY),
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
    description: 'Recharge -> Your next attack gains: +2 vs Armor/Shield. Draw.',
    shortDesc: 'R->+2 vs Armor\nDraw',
    subtype: 'relic', cardType: CardType.ABILITY, costType: CostType.RECHARGE,
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
    description: "Recharge -> Gain the Queen's Gift. Draw. A random blessing of Shield, Heroism, Heal, or Draw.",
    shortDesc: 'R->Gift+Draw',
    subtype: 'relic',
    cardType: CardType.ABILITY,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('queens_gift', 1, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    tier: 2,
    isUnique: true,
    // No per-effect bump — the random gift roll already mixes
    // Shield / Heroism / Heal / Draw so the card scales by
    // breadth rather than digits. Empty `{}` is the opt-in
    // marker so the codex still stamps the name/tier bump and
    // drops the red "needs rules" badge.
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
    isCompanion: true,
    description: 'Turn End: +Shield',
    // Companion-chain creature — the upgraded / Tier-3 variants are
    // distinct factories swapped in on loot, so per-tier creature
    // scaling stays opt-out at the codex level.
    noTierOffset: true,
  });
}

export function createThorbUpgradedCreature() {
  return new Creature({
    name: 'Thorb',
    attack: 2,
    maxHp: 5,
    sentinel: true,
    isCompanion: true,
    description: 'Sentinel. Turn End: +Shield',
    noTierOffset: true,
  });
}

// Thorb tier 3 — ccgQuest+ rescue version (offset 2+). +1/+2 over
// tier 2, sentinel, and the end-of-turn shield extends to every ally
// (player + all alive creatures). shieldsAllAllies flag is read in
// endPlayerTurn's Thorb tick.
export function createThorbTier3Creature() {
  return new Creature({
    name: 'Thorb',
    attack: 3,
    maxHp: 7,
    sentinel: true,
    isCompanion: true,
    shieldsAllAllies: true,
    description: 'Sentinel. Turn End: +Shield to ALL allies.',
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
    name: 'Raena', attack: 3, maxHp: 4, multiAttack: 2, isCompanion: true,
    description: 'Attacks 2 targets.',
    noTierOffset: true,
  });
}

// Raena tier 3 — ccgQuest+ rescue version (offset 2+). +2 attack,
// +1 max HP over tier 2. Multi-attack count is unchanged.
export function createRaenaTier3Creature() {
  return new Creature({
    name: 'Raena', attack: 5, maxHp: 5, multiAttack: 2, isCompanion: true,
    description: 'Attacks 2 targets.',
    noTierOffset: true,
  });
}

export function createThorbCard() {
  return new Card({
    id: 'thorb_card',
    name: 'Thorb',
    description: 'Recharge a card ->\nCall Thorb to the battle!',
    shortDesc: 'Call Thorb',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_thorb', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
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
    description: 'Recharge a card ->\nCall Thorb to the battle!',
    shortDesc: 'Call Thorb',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_thorb_upgraded', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
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
    description: 'Recharge a card ->\nCall Thorb to the battle!',
    shortDesc: 'Call Thorb',
    subtype: 'allies',
    cardType: CardType.CREATURE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('summon_thorb_tier3', 1, TargetType.SUMMON),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    isUnique: true,
    tier: 3,
    previewCreature: createThorbTier3Creature(),
    // Top of the Thorb tier chain — no further offset stamping.
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
    description: 'Recharge +1 -> Deal 5 Unpreventable Damage.',
    shortDesc: 'R+1->5 True Dmg',
    subtype: 'simple',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('unpreventable_damage', 5, TargetType.SINGLE_ENEMY),
    ],
    tier: 2,
    gamePlusOffset: { unpreventable_damage: 2 },
  });
}

export function createDwarvenGreaves() {
  return new Card({
    id: 'dwarven_greaves',
    name: 'Dwarven Greaves',
    description: 'Recharge -> Block 3.\nStrip 2 Shields randomly. Draw.\nOn Recharge: Gain Shield.',
    shortDesc: 'R->Block 3\nStrip 2 Shield\nDraw / On R: +Shield',
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
    maxHp: 2,
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

export function createDwarvenBrew() {
  return new Card({
    id: 'dwarven_brew',
    name: 'Dwarven Brew',
    description: 'Consume -> Heal 2, Gain 1 Shield.\nBeverage: +Shield for 4 turns.',
    shortDesc: 'C->Heal 2, +1 Sh\nBeverage: +Shld/4T',
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
    description: 'Consume -> Heal 2, Gain 1 Heroism, Gain 1 Ice.\nBeverage: +Heroism, Ice Randomly for 4 turns.',
    shortDesc: 'C->Heal 2, +1H\n+1 Ice self\nBev: H+Ice/4T',
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
    description: 'Recharge -> Block 2,\nClear 2 Ice. Draw.',
    shortDesc: 'R->Block 2\nClear 2 Ice, Draw',
    subtype: 'clothing',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 2, TargetType.SELF),
      new CardEffect('clear_ice', 2, TargetType.SELF),
      new CardEffect('draw', 1, TargetType.SELF),
    ],
    rarity: 'rare',
    gamePlusOffset: { block: 2, clear_ice: 2 },
  });
}

// === Sahuagin Sentinel loot drops (mirrors PY get_sahuagin_sentinel_loot) ===
export function createSahuaginTridentLoot() {
  return new Card({
    id: 'sahuagin_trident',
    name: 'Sahuagin Trident',
    description: 'Recharge +1 -> Deal 3 Damage. +3 if target is damaged.',
    shortDesc: 'R+1->3 Dmg\n+3 if damaged',
    subtype: 'martial_2h',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 3, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('damaged_bonus_damage', 3, TargetType.SINGLE_ENEMY),
    ],
    rarity: 'uncommon',
    gamePlusOffset: { damage: 2, damaged_bonus_damage: 2 },
  });
}

export function createFishScaleBoots() {
  return new Card({
    id: 'fish_scale_boots',
    name: 'Fish Scale Boots',
    // Line 1 = recharge / block / ice spread / draw, line 2 = swim pill.
    // The "On Swim" prefix renders as a pill thanks to inlineBadgeRe.
    description: 'Recharge -> Block 1.\nDeal Ice to all enemies. Draw.\nOn Swim: Draw 2.',
    shortDesc: 'R->Block 1, Draw\nIce ALL\nOn Swim: Draw 2',
    subtype: 'light_armor',
    cardType: CardType.DEFENSE,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('block', 1, TargetType.SELF),
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
    description: 'Next Attack: +1 damage if target is damaged. Stays in hand.',
    shortDesc: 'Next Attack +1\nif damaged',
    subtype: 'relic',
    cardType: CardType.RELIC,
    costType: CostType.FREE,
    effects: [
      new CardEffect('grant_eye_buff', 1, TargetType.SELF),
      new CardEffect('stays_in_hand', 0, TargetType.SELF),
    ],
    rarity: 'epic',
    // +0.5 damage per offset (floored): +1 base, +1 at off 1, +2 at off 2, etc.
    gamePlusOffset: { grant_eye_buff: 0.5 },
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
    description: 'Recharge +1 -> Gain 1 Ice. Allies lose all Ice -> Summon an Ice Elemental with Atk and HP equal to the Ice lost. Then 3 Damage + Ice.',
    shortDesc: 'R+1->Gain Ice\nAllies->N/N\n3 Dmg + Ice',
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

// Sahuagin Priest Staff — Sahuagin Priest drop. Mirrors PY
// create_sahuagin_priest_staff: Recharge +1 Card, deal 1 damage +
// apply 1 Ice, summon a Shark.
export function createSahuaginPriestStaffLoot() {
  return new Card({
    id: 'sahuagin_priest_staff',
    name: 'Sahuagin Priest Staff',
    description: 'Recharge +1 -> Deal 1 Damage + Ice, Summon a Shark.',
    shortDesc: 'R+1->1 Dmg+Ice\nSummon Shark',
    subtype: 'staff',
    cardType: CardType.ATTACK,
    costType: CostType.RECHARGE,
    effects: [
      new CardEffect('damage', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('recharge_extra', 1, TargetType.SELF),
      new CardEffect('apply_ice', 1, TargetType.SINGLE_ENEMY),
      new CardEffect('summon_shark', 1, TargetType.SUMMON),
    ],
    rarity: 'epic',
    previewCreature: new Creature({
      name: 'Shark', attack: 1, maxHp: 4, bloodfrenzy: 1,
      description: 'Bloodfrenzy: +1 Rage after attacking.',
    }),
    // +1 dmg / +1 Ice per offset. The Shark summon scales via
    // CREATURE_TIER_OFFSET['Shark'] (+1/+1 on the player side).
    gamePlusOffset: { damage: 1, apply_ice: 1 },
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
