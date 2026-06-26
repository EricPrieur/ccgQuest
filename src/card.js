import { CardType, CostType, TargetType } from './constants.js';

let nextUid = 1;
function generateUid() {
  return `c${nextUid++}`;
}

/**
 * A single effect on a card.
 */
export class CardEffect {
  constructor(effectType, value, target = TargetType.SINGLE_ENEMY, maxTargets = 0, bleed = 0) {
    this.effectType = effectType;
    this.value = value;
    this.target = target;
    this.maxTargets = maxTargets;
    // optional Bleed rider applied to each target this effect hits.
    // Used by the Rampaging Troll's Rend (damage_random_split + Bleed).
    this.bleed = bleed;
    // optional: the play flow will skip this effect entirely when no
    // valid target exists (e.g. Raena's Called arrow vs an invulnerable-
    // only-enemy fight). Lets the card still resolve as a pure summon
    // instead of becoming unplayable.
    this.optional = false;
    // noAttackCount: damage from this effect does NOT increment
    // attacksThisTurn. Used by ally-rider attacks like Raena's Called
    // arrow so they don't inflate Sneak Attack scaling — the ally's
    // shot is conceptually theirs, not the player's swing.
    this.noAttackCount = false;
  }

  copy() {
    const c = new CardEffect(this.effectType, this.value, this.target, this.maxTargets, this.bleed);
    c.optional = this.optional;
    c.noAttackCount = this.noAttackCount;
    return c;
  }
}

/**
 * A mode option for modal cards (choose one).
 */
export class CardMode {
  constructor(description, effects = []) {
    this.description = description;
    this.effects = effects;
  }

  copy() {
    const m = new CardMode(this.description, this.effects.map(e => e.copy()));
    if (this.artId) m.artId = this.artId;
    return m;
  }
}

/**
 * A card in the game.
 */
export class Card {
  constructor({
    id,
    name,
    description,
    cardType,
    costType = CostType.FREE,
    effects = [],
    shortDesc = '',
    subtype = '',
    upgraded = false,
    upgradeEffects = null,
    modes = null,
    priority = 0,
    characterClass = [],
    tier = 1,
    rarity = 'common',
    previewCard = null,
    previewCreature = null,
    previewCreatures = [],
    isToken = false,
    isUnique = false,
    provision = null,
    unplayable = false,
    gamePlusOffset = null,
    noTierOffset = false,
    sellable = false,
    heroismDamageMult = 1,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.cardType = cardType;
    this.costType = costType;
    this.effects = effects;
    this.shortDesc = shortDesc;
    this.subtype = subtype;
    this.uid = generateUid();
    this.upgraded = upgraded;
    this.upgradeEffects = upgradeEffects;
    this.modes = modes;
    this.priority = priority;
    this.characterClass = characterClass;
    this.tier = tier;
    this.rarity = rarity;
    this.previewCard = previewCard;
    this.previewCreature = previewCreature;
    this.previewCreatures = previewCreatures;
    this.isToken = isToken;
    this.isUnique = isUnique;
    this.provision = provision;
    this.unplayable = unplayable;
    // ccgQuest+ tier-offset scaling rules — optional. Object with
    // per-effect-type bump amounts applied PER offset point. Example:
    //   gamePlusOffset: { heal: 3 }     // Flash Heal: 4 → 7 → 10 ...
    //   gamePlusOffset: { gain_heroism: 3 }
    //   gamePlusOffset: { shield_bash: 1 }
    //   gamePlusOffset: { gain_shield: 2 }
    //   gamePlusOffset: { damage: 1 }
    // Cards without this field still get the name+tier suffix on the
    // codex preview, but the codex flags them with a red "+N?" badge
    // until offset rules are wired.
    this.gamePlusOffset = gamePlusOffset;
    // "Heroism: +N" nomenclature — each Heroism point adds this much to
    // the card's damage instead of the default +1 (Consecration: 2).
    this.heroismDamageMult = heroismDamageMult;
    // Explicit "this card does not scale with tier offset" marker —
    // suppresses the codex red "+N?" badge for cards/powers that
    // intentionally stay flat (Overwhelm, Vanish, etc.).
    this.noTierOffset = noTierOffset;
    // Opt-in flag that overrides canSellAtShop's class-restriction
    // and token gates. Used for cards a player should be allowed to
    // sell back even though they normally wouldn't qualify (the
    // Spider's Vial of Poison token, the Wizard-only Wand of Fire,
    // etc.). The category-vs-shop-stock check still applies.
    this.sellable = sellable;
    this.exhausted = false;
  }

  get isModal() {
    return this.modes !== null && this.modes.length > 0;
  }

  get currentEffects() {
    if (this.upgraded && this.upgradeEffects) {
      return this.upgradeEffects;
    }
    return this.effects;
  }

  canPlay() {
    return !this.exhausted && !this.unplayable;
  }

  copy(preserveUid = false) {
    const c = new Card({
      id: this.id,
      name: this.name,
      description: this.description,
      cardType: this.cardType,
      costType: this.costType,
      effects: this.effects.map(e => e.copy()),
      shortDesc: this.shortDesc,
      subtype: this.subtype,
      upgraded: this.upgraded,
      upgradeEffects: this.upgradeEffects ? this.upgradeEffects.map(e => e.copy()) : null,
      modes: this.modes ? this.modes.map(m => m.copy()) : null,
      priority: this.priority,
      characterClass: [...this.characterClass],
      tier: this.tier,
      rarity: this.rarity,
      previewCard: this.previewCard,
      previewCreature: this.previewCreature,
      previewCreatures: [...this.previewCreatures],
      isToken: this.isToken,
      isUnique: this.isUnique,
      // Deep-clone provision so card.copy() (used by codex preview,
      // hand draws, etc.) doesn't share the same object with the
      // base card. The codex preview re-stamps the offset on every
      // render frame, and the custom-branch bumps that mutate
      // provision.turnsPerCombat / provision.value (Bad Rations,
      // Chicken Leg, Fresh Fish, Harpy Egg Omelette, Travel Rations)
      // would otherwise climb +per-offset every single frame until
      // the codex displayed numbers like "200 turns".
      provision: this.provision ? {
        ...this.provision,
        effects: Array.isArray(this.provision.effects)
          ? this.provision.effects.map(e => ({
              ...e,
              options: Array.isArray(e.options) ? e.options.map(o => ({ ...o })) : e.options,
            }))
          : this.provision.effects,
      } : this.provision,
      unplayable: this.unplayable,
      gamePlusOffset: this.gamePlusOffset,
      noTierOffset: this.noTierOffset,
      sellable: this.sellable,
      // Carry the Heroism multiplier (Consecration: 2) — without it a
      // drawn/recharged copy fell back to the default 1, so Heroism only
      // added +1 each instead of +2.
      heroismDamageMult: this.heroismDamageMult,
    });
    if (preserveUid) c.uid = this.uid;
    // Preserve the on-card enchant tags (Obsidian Forge, Dwarven
    // Workbench, etc.) — drawCard reads `_enchants` to render the
    // badge + tooltip. Without this, copying an enchanted card into
    // hand or recharge stripped the badge mid-combat.
    if (Array.isArray(this._enchants) && this._enchants.length > 0) {
      c._enchants = [...this._enchants];
    }
    // Carry the ccgQuest+ offset stamp on the copy. copy() above
    // already preserves the stamped name / tier / effect values
    // (it reads `this.name`, `this.tier`, `this.effects.map(...)`),
    // so the only thing left to forward is the bookkeeping field
    // serializeCard reads to persist the offset across save/load.
    if (typeof this._tierOffset === 'number' && this._tierOffset > 0) {
      c._tierOffset = this._tierOffset;
    }
    return c;
  }

  toString() {
    return `${this.name} (${this.cardType}/${this.costType})`;
  }
}
