/**
 * A creature that persists on the battlefield.
 */
export class Creature {
  constructor({
    name,
    attack,
    maxHp,
    currentHp = null,
    unpreventable = false,
    armor = 0,
    shield = 0,
    poisonAttack = false,
    // Optional taxonomy tags for cross-creature effects (e.g.
    // Mortain's Staff: "you and your skeletons gain Shield"). Keep
    // them as plain strings like 'Skeleton' / 'Undead' so the rider
    // handler can do `creature.traits.includes('Skeleton')`. Default
    // is an empty array — existing creatures don't carry any tag.
    traits = [],
    fireAttack = 0,
    iceAttack = 0,
    iceAttackAll = 0,
    bleedAttack = 0,
    bleedingBonus = 0,
    endOfTurnDeath = false,
    fireImmune = false,
    attackAll = false,
    // Roc Chick rider — extends attackAll to also hit the attacker's
    // own teammates (sibling chicks + unhatched eggs) on the same
    // swing. Read inside the attackAll branch in the enemy-creature
    // attack flow; ignored when attackAll is false.
    attackAllIncludingOwn = false,
    multiAttack = 0,
    sentinel = false,
    haste = false,
    selfDestruct = false,
    swarm = false,
    bloodfrenzy = 0,
    isCompanion = false,
    endTurnDamage = 0,
    onDeathDamage = 0,
    onDeathPoisonAll = 0,
    onDeathFireHits = 0,
    onDeathDiscardOrDamage = 0,
    onAttackSnagCard = false,
    endTurnHealAllies = 0,
    endTurnShieldAllies = 0,
    endTurnHeroismAllies = 0,
    description = '',
    sourceCard = null,
    // Codex opt-out — flagged true on companion-chain summons
    // (Thorb / Raena / Valdrisa) and special-scaling creatures
    // (Ice Elemental's Ice-Absorb math) so the "needs rules" red
    // badge in the codex stays off. Read by creatureHasOffsetRules.
    noTierOffset = false,
    // Ethereal-style per-hit damage cap (0 = uncapped). When > 0,
    // takeDamage / takeUnpreventableDamage clamp each incoming hit to
    // this value — a 3-HP creature with damageCap 1 needs 3 hits to
    // die (Death Specter horde summon mirrors the Specter of Death's
    // Ethereal power).
    damageCap = 0,
    // Hit: Death — when this creature lands an attack on the PLAYER,
    // arm the Specter-of-Death instakill (resolved by
    // finishIncomingDamage if HP damage actually got through).
    hitDeath = false,
    // Lifesteal — the creature heals itself for the damage its swing
    // deals (Forgotten Specter horde summon).
    lifesteal = false,
    // Field footprint in grid cells (default 1x1). A creature with a
    // larger footprint (e.g. the enemy Butcher at 2x2) occupies that
    // many cells of the 12-cell ally grid and renders proportionally
    // bigger. addCreature reserves the block; getCreatureSlotRect
    // spans the rect.
    slotW = 1,
    slotH = 1,
  }) {
    this.name = name;
    this.attack = attack;
    this.maxHp = maxHp;
    this.currentHp = currentHp !== null ? currentHp : maxHp;

    // Haste keyword — creature is ready to attack the turn it arrives.
    // Mirrors PY's per-summon `exhausted=False` override (Huffer,
    // Treants, etc.). Stored as a flag so the codex / hover preview
    // can render a "Haste" pill in the creature description.
    this.haste = haste;
    this.exhausted = !haste;
    // justSummoned: true on the turn this creature arrives. Cleared when the
    // owner's ready() fires at the start of their next turn. Lets the UI tell
    // the player "can't attack the turn it's summoned" instead of "already attacked".
    this.justSummoned = !haste;
    this.owner = null;
    this.unpreventable = unpreventable;

    this.armor = armor;
    this.shield = shield;
    this.heroism = 0;
    this.rage = 0;
    this.ignite = 0;

    this.fireStacks = 0;
    this.iceStacks = 0;
    this.poisonStacks = 0;
    this.shockStacks = 0;
    this.bleedStacks = 0;
    this.inkCloudStacks = 0;
    this.markStacks = 0;

    this.poisonAttack = poisonAttack;
    this.traits = Array.isArray(traits) ? [...traits] : [];
    this.fireAttack = fireAttack;
    this.iceAttack = iceAttack;
    this.iceAttackAll = iceAttackAll;
    this.bleedAttack = bleedAttack;
    // +N swing damage when the target is currently Bleeding. Read by
    // applyAllyBleedingBonus on player-ally and enemy-creature swings.
    this.bleedingBonus = bleedingBonus;
    // Piranhas-style "dies at end of turn" rider — checked during the
    // owner's end-of-turn cleanup so the summon crumbles automatically.
    this.endOfTurnDeath = endOfTurnDeath;
    this.fireImmune = fireImmune;
    this.attackAll = attackAll;
    this.attackAllIncludingOwn = attackAllIncludingOwn;
    this.multiAttack = multiAttack;

    this.sentinel = sentinel;
    this.selfDestruct = selfDestruct;
    // Note: this.haste is set above (alongside this.exhausted) so the
    // initial-exhaust check sees it.
    this.swarm = swarm;
    this.bloodfrenzy = bloodfrenzy;
    this.isCompanion = isCompanion;

    this.endTurnDamage = endTurnDamage;
    this.onDeathDamage = onDeathDamage;
    this.onDeathPoisonAll = onDeathPoisonAll;
    this.onDeathFireHits = onDeathFireHits;
    this.onDeathDiscardOrDamage = onDeathDiscardOrDamage;
    // Kraken Tentacle: on swing land, splice 1 random hand card off
    // the player and park it on this creature (`_snaggedCard`). When
    // the tentacle dies the card returns to the player's discard.
    this.onAttackSnagCard = onAttackSnagCard;
    this._snaggedCard = null;
    this.endTurnHealAllies = endTurnHealAllies;
    this.endTurnShieldAllies = endTurnShieldAllies;
    this.endTurnHeroismAllies = endTurnHeroismAllies;

    this.description = description;
    this.sourceCard = sourceCard;
    this.noTierOffset = noTierOffset;
    this.damageCap = damageCap;
    this.hitDeath = hitDeath;
    this.lifesteal = lifesteal;
    this.slotW = slotW;
    this.slotH = slotH;
    this.slot = -1;
  }

  get isAlive() {
    return this.currentHp > 0;
  }

  takeDamage(amount) {
    // Ethereal cap — clamp the whole hit before armor/shield so the
    // post-mitigation HP loss can never exceed damageCap.
    if (this.damageCap > 0) amount = Math.min(amount, this.damageCap);
    // Armor absorbs FIRST — a permanent flat reduction off the top
    // of every hit. Without this, a swing equal to the armor value
    // (e.g. 1 dmg vs 1 armor) would burn a Shield stack instead of
    // bouncing off the armor, and a small shielded creature would
    // hemorrhage shields to chip damage that armor should have
    // soaked for free. Shield is the persistent buffer behind it.
    if (this.armor > 0) {
      const armorAbsorb = Math.min(this.armor, amount);
      amount -= armorAbsorb;
    }
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, amount);
      this.shield -= shieldAbsorb;
      amount -= shieldAbsorb;
    }
    this.currentHp = Math.max(0, this.currentHp - amount);
    return amount;
  }

  takeUnpreventableDamage(amount) {
    // Ethereal caps even true damage — "can't take more than N".
    if (this.damageCap > 0) amount = Math.min(amount, this.damageCap);
    this.currentHp = Math.max(0, this.currentHp - amount);
    return amount;
  }

  ready() {
    this.exhausted = false;
    this.justSummoned = false;
  }

  exhaust() {
    this.exhausted = true;
  }

  toString() {
    return `${this.name} (${this.attack}/${this.currentHp})`;
  }
}
