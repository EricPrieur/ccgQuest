/**
 * Optional UI hook fired when a creature avoids a hit via dodgeChance
 * (Brad the Fox's On Hit avoid). Wired by main.js so creature.js can
 * surface a float / log without importing the renderer (avoids a
 * circular import). Left null in headless / test contexts.
 */
export let onCreatureDodge = null;
export function setCreatureDodgeHandler(fn) { onCreatureDodge = fn; }

/**
 * Optional UI hook fired whenever a creature actually loses HP. Wired by
 * main.js so per-creature reaction cues (the Carrion Crawler Torso's chitter)
 * can play from one place instead of every damage call site. Left null in
 * headless / test contexts.
 */
export let onCreatureDamaged = null;
export function setCreatureDamagedHandler(fn) { onCreatureDamaged = fn; }

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
    // Sunder rider — each swing stacks N Sunder on the target (Cornis
    // Metalhands: 1). Mirrors poisonAttack / bleedAttack.
    sunderAttack = 0,
    // "On Attack: Allies gain Heroism" (Drow Priestess) — every OTHER alive
    // creature on this creature's side banks N Heroism whenever it swings.
    onAttackHeroismAllies = 0,
    // Per-swing damage override for multi-swing creatures: the LAST queued
    // swing uses this attack value instead of `attack` (Drow Warrior: 1 first,
    // 4 second). Only meaningful alongside _attacksPerTurn > 1.
    secondSwingAttack = null,
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
    // Ice Body's other half. Mirrors fireImmune: the holder no-sells the
    // status (its swings are never blunted by Ice) but stacks still land
    // and still cancel the opposing element, which is what lets banked Ice
    // shield the body from Fire.
    iceImmune = false,
    // Riposte was previously only ever set post-construction (trap.riposte =
    // true). Declaring it here lets factories pass it inline like sentinel.
    // riposteAmount MUST default to null, not 0 — the resolver reads
    // `riposteAmount != null ? riposteAmount : attack`.
    riposte = false,
    riposteAmount = null,
    // Riposte flavour: 'fire' | 'ice' makes the lash-back apply that element
    // (riposteAmount stacks of it) instead of damage, which is what lets a
    // 0-attack elemental body riposte at all.
    riposteStatus = null,
    // Art override. Creature art is normally keyed off the snake-cased NAME,
    // which breaks as soon as two creatures share a name — the wizard's summoned
    // Ice Elemental and Overseer Gnikan's are different bodies with different
    // art. Set this to a CARD_ART_MAP key to win over the name slug.
    artId = null,
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
    // Floating Skull — on death, fling N Poison at ONE random target on the
    // opposing side (vs onDeathPoisonAll which poisons the whole enemy line).
    onDeathPoisonRandom = 0,
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
    // On Hit dodge — % chance (0-100) to avoid an incoming NORMAL hit
    // entirely (no HP lost, no armor/shield spent). Rolled at the top of
    // takeDamage; true damage (takeUnpreventableDamage) ignores it.
    // Brad the Fox is the first user (50).
    dodgeChance = 0,
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
    // Sunder stacks carried BY this creature (each shaves 1 off its armor).
    this.sunderStacks = 0;
    // Paralyze (Carrion Crawler set) — each stack makes the creature skip one
    // action it would have taken, then decays by 1. Summons only: creatures
    // with a footprint bigger than 1x1 (slotW/slotH) shrug it off, and it can
    // never land on an enemy CHARACTER (bosses aren't creatures).
    this.paralyzeStacks = 0;
    // Weak — each stack HALVES one attack this creature makes, then is spent.
    // The mirror of Mark (which doubles one attack made against a target).
    this.weakStacks = 0;
    // Drow Sleep Poison — a Poison variant that also saps 1 attack/stack
    // and heals dead-last. Applied by the Drow Sleep Poison item.
    this.drowSleepStacks = 0;
    this.inkCloudStacks = 0;
    this.markStacks = 0;

    // Heal-over-time buffs (Regrowth and similar). Each entry is
    // { healPerTurn, turnsRemaining, summonsTreant }. Ticked once per
    // player turn by tickAllyRegen() in main.js — Creatures don't run
    // the full Character combatBuffs system, so this is the lightweight
    // regen channel that lets buff-style heals land on allies.
    this.regenBuffs = [];

    this.poisonAttack = poisonAttack;
    this.sunderAttack = sunderAttack;
    this.onAttackHeroismAllies = onAttackHeroismAllies;
    this._secondSwingAttack = secondSwingAttack;
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
    this.iceImmune = iceImmune;
    this.riposte = riposte;
    this.riposteAmount = riposteAmount;
    this.riposteStatus = riposteStatus;
    this.artId = artId;
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
    this.onDeathPoisonRandom = onDeathPoisonRandom;
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
    this.dodgeChance = dodgeChance;
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
    // Totems (the Arcane Vortex) are scenery: nothing damages them, from any
    // source. Guarding here rather than at the call sites catches the DoT
    // ticks, which hit creatures directly and never pass through
    // applyDamageToAlly.
    if (this._untargetableAlly) return 0;
    // On Hit dodge (Brad the Fox) — roll BEFORE any mitigation. On a
    // success the whole hit is avoided: 0 HP lost, no armor/shield spent.
    // Only real, positive hits can be dodged (a 0-damage swing isn't a
    // "hit" worth a roll). True damage bypasses this via
    // takeUnpreventableDamage, which never calls here.
    if (this.dodgeChance > 0 && amount > 0 && Math.random() * 100 < this.dodgeChance) {
      if (onCreatureDodge) onCreatureDodge(this);
      return 0;
    }
    // Ethereal cap — clamp the whole hit before armor/shield so the
    // post-mitigation HP loss can never exceed damageCap.
    if (this.damageCap > 0) amount = Math.min(amount, this.damageCap);
    // Armor absorbs FIRST — a permanent flat reduction off the top
    // of every hit. Without this, a swing equal to the armor value
    // (e.g. 1 dmg vs 1 armor) would burn a Shield stack instead of
    // bouncing off the armor, and a small shielded creature would
    // hemorrhage shields to chip damage that armor should have
    // soaked for free. Shield is the persistent buffer behind it.
    // Sunder shaves the armor 1 per stack. Creatures carry no block pool, so
    // any leftover stacks simply have nothing else to eat here.
    const effArmor = Math.max(0, (this.armor || 0) - (this.sunderStacks || 0));
    if (effArmor > 0) {
      const armorAbsorb = Math.min(effArmor, amount);
      amount -= armorAbsorb;
    }
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, amount);
      this.shield -= shieldAbsorb;
      amount -= shieldAbsorb;
    }
    // Record how far past 0 this hit went. Polymorph needs it: when a Sheep or
    // a Giant Ape is destroyed the form ends and the LEFTOVER damage carries
    // through to the creature underneath, so the clamp below can't simply
    // throw the excess away.
    this._lastOverkill = Math.max(0, amount - this.currentHp);
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (amount > 0 && onCreatureDamaged) onCreatureDamaged(this, amount);
    return amount;
  }

  takeUnpreventableDamage(amount) {
    if (this._untargetableAlly) return 0;
    // Ethereal caps even true damage — "can't take more than N".
    if (this.damageCap > 0) amount = Math.min(amount, this.damageCap);
    // True Damage burns Regen 1:1 — same rule as Character true damage.
    // Keeps regenerating creatures (Armored Troll, Loathsome Limbs) honest:
    // True Damage chips the Regen pool, which only recovers +1/turn.
    if (this._regenMax && (this._regen || 0) > 0 && amount > 0) {
      this._regen = Math.max(0, this._regen - amount);
    }
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (amount > 0 && onCreatureDamaged) onCreatureDamaged(this, amount);
    return amount;
  }

  ready() {
    this.exhausted = false;
    this.justSummoned = false;
    // Multi-swing allies get their full allowance back each turn.
    this._swingsUsed = 0;
  }

  exhaust() {
    // Attack Twice (Cornis Metalhands) and any other _attacksPerTurn > 1
    // ally spends ONE swing per attack and only exhausts once the
    // allowance runs out. Single-swing creatures (the default) exhaust
    // immediately, exactly as before.
    const per = Math.max(1, this._attacksPerTurn || 1);
    if (per > 1) {
      this._swingsUsed = (this._swingsUsed || 0) + 1;
      if (this._swingsUsed < per) return;
      this._swingsUsed = 0;
    }
    this.exhausted = true;
  }

  toString() {
    return `${this.name} (${this.attack}/${this.currentHp})`;
  }
}
