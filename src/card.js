import { CardType, CostType, TargetType } from './constants.js';

let nextUid = 1;
function generateUid() {
  return `c${nextUid++}`;
}

/**
 * A single effect on a card.
 */
export class CardEffect {
  constructor(effectType, value, target = TargetType.SINGLE_ENEMY, maxTargets = 0) {
    this.effectType = effectType;
    this.value = value;
    this.target = target;
    this.maxTargets = maxTargets;
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
    const c = new CardEffect(this.effectType, this.value, this.target, this.maxTargets);
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
    return new CardMode(this.description, this.effects.map(e => e.copy()));
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
      provision: this.provision,
      unplayable: this.unplayable,
    });
    if (preserveUid) c.uid = this.uid;
    // Preserve the on-card enchant tags (Obsidian Forge, Dwarven
    // Workbench, etc.) — drawCard reads `_enchants` to render the
    // badge + tooltip. Without this, copying an enchanted card into
    // hand or recharge stripped the badge mid-combat.
    if (Array.isArray(this._enchants) && this._enchants.length > 0) {
      c._enchants = [...this._enchants];
    }
    return c;
  }

  toString() {
    return `${this.name} (${this.cardType}/${this.costType})`;
  }
}
