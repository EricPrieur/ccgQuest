import { StatusEffect } from './constants.js';
import { Creature } from './creature.js';

/**
 * Buff applied to a character.
 */
export class Buff {
  constructor(buffType, value, duration = 'next_attack') {
    this.buffType = buffType;
    this.value = value;
    this.duration = duration; // 'next_attack', 'end_of_turn', 'start_of_turn'
  }
}

/**
 * Multi-combat buff persisting across encounters.
 */
export class CombatBuff {
  constructor({ id, name, description, imageId, effectType, effectValue, trigger = 'start_of_turn', combatsRemaining = 1, turnsRemaining = 0, effects = null, tickSfxKey = null, tickSfxCount = 1, tickSfxStagger = 150, isDebuff = false }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageId = imageId;
    this.effectType = effectType;
    this.effectValue = effectValue;
    this.trigger = trigger;
    this.combatsRemaining = combatsRemaining;
    this.turnsRemaining = turnsRemaining;
    // Debuff flag — flips the icon border color from green to red so
    // the player can scan-distinguish "good thing happening to me"
    // from "bad thing happening to me" on the buff bar.
    this.isDebuff = isDebuff;
    // Optional multi-effect array for buffs that fire several things per tick
    // (Bad Rations: heal_random + discard_deck_random). When set, the
    // processCombatBuffs loop iterates these instead of using the legacy
    // single { effectType, effectValue } pair.
    this.effects = effects;
    // Optional per-buff SFX override for the start-of-turn tick. When
    // set, processCombatBuffs stamps this onto every log entry the
    // buff emits, overriding the effect-type defaults
    // (gain_heroism → buff_angelic_03, gain_shield → protection_buff_01,
    // draw_card → card_draw). Stone Giant's Running uses 'footstep'
    // so its draw tick plays footsteps instead of card_draw.
    this.tickSfxKey = tickSfxKey;
    // Per-tick SFX repeat count + stagger (ms). Used for buffs whose
    // tick should play multiple staggered samples — e.g. Stone Giant's
    // Running plays 4 footsteps each turn. Defaults to a single play.
    this.tickSfxCount = tickSfxCount;
    this.tickSfxStagger = tickSfxStagger;
  }
}

/**
 * Permanent character-sheet buff. Lives on the player forever (no
 * combats_remaining decrement) and projects into combat as a fresh
 * CombatBuff at combat start when its `condition` matches the
 * current enemy. Mirrors PY's persistent buff concept (Old God's
 * Blessing, etc.).
 *
 * `condition` shapes:
 *   { type: 'always' }                           — always active
 *   { type: 'enemyName', includes: ['Sahuagin'] }— active when
 *      enemy.name contains ANY of the given substrings (case-insensitive).
 *   { type: 'enemyId', oneOf: ['sahuagin_baron'] } — exact enemy id match.
 */
export class PersistentBuff {
  constructor({ id, name, description, imageId, effectType, effectValue,
    trigger = 'on_attack', condition = { type: 'always' } }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageId = imageId;
    this.effectType = effectType;
    this.effectValue = effectValue;
    this.trigger = trigger;
    this.condition = condition;
  }
  matches(enemy, enemyId) {
    const cond = this.condition || { type: 'always' };
    if (cond.type === 'always') return true;
    if (cond.type === 'enemyName' && Array.isArray(cond.includes)) {
      const name = (enemy && enemy.name || '').toLowerCase();
      return cond.includes.some(s => name.includes(String(s).toLowerCase()));
    }
    if (cond.type === 'enemyId' && Array.isArray(cond.oneOf)) {
      return cond.oneOf.includes(enemyId);
    }
    return false;
  }
}

/**
 * A perk chosen during character progression.
 */
export class Perk {
  constructor({ id, name, description, imageId, effectType, effectValue, unique = false, tier = 1, rarity = null, requires = null, replaces = null }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageId = imageId;
    this.effectType = effectType;
    this.effectValue = effectValue;
    this.unique = unique;
    this.tier = tier;
    // Optional explicit rarity ('rare' for tier-2 rare perks); null falls
    // back to unique→uncommon / common in perkToCardLike.
    this.rarity = rarity;
    // Upgrade perks: `requires` is a tier-1 perk id that must be owned for
    // this perk to be OFFERED; `replaces` is a perk id removed when this one
    // is taken. (Divine Protection requires but does not replace.)
    this.requires = requires;
    this.replaces = replaces;
  }
}

/**
 * Base class for any entity in combat. Health = deck + hand cards.
 */
export class Character {
  constructor(name) {
    this.name = name;
    this.deck = null;
    this.statusEffects = {};
    this.creatures = [];
    this.powers = [];
    this.baseArmor = 0;
    this.currentBlock = 0;
    this.pendingSummons = [];
    this.buffs = [];
    this.combatBuffs = [];
    // Persistent (character-sheet) buffs. Survive end-of-combat
    // cleanup; project into combatBuffs at combat start when their
    // condition matches the current enemy.
    this.persistentBuffs = [];
    this.buffDisplayOrder = [];
    this.heroism = 0;
    this.shield = 0;
    this.rage = 0;
    this.ignite = 0;
    this.poisonBuff = 0;
    this.unpreventableBuff = 0;
    this.level = 1;
    this.perks = [];
    // Level-up deck-limit bonuses: { weapon: N, armor: N, ... }
    // Each key can hold up to +3 total across all level-ups.
    this.deckLimitBonuses = {};
  }

  get armor() {
    let a = this.baseArmor;
    for (const p of this.powers) {
      if (p.id === 'armor' && !p.exhausted) a += (p.armorLevel || 1);
    }
    return a;
  }

  get isAlive() {
    if (!this.deck) return false;
    return (this.deck.drawPile.length + this.deck.hand.length + this.deck.rechargePile.length) > 0;
  }

  get totalCards() {
    if (!this.deck) return 0;
    return this.deck.drawPile.length + this.deck.hand.length +
      this.deck.rechargePile.length + this.deck.discardPile.length +
      this.deck.damagePile.length + this.deck.playPile.length;
  }

  // --- Buffs ---

  addBuff(buffType, value, duration = 'next_attack') {
    this.buffs.push(new Buff(buffType, value, duration));
  }

  getBuffValue(buffType) {
    return this.buffs
      .filter(b => b.buffType === buffType)
      .reduce((sum, b) => sum + b.value, 0);
  }

  consumeBuff(buffType, duration = null) {
    let total = 0;
    this.buffs = this.buffs.filter(b => {
      if (b.buffType === buffType && (duration === null || b.duration === duration)) {
        total += b.value;
        return false;
      }
      return true;
    });
    return total;
  }

  clearBuffsByDuration(duration) {
    this.buffs = this.buffs.filter(b => b.duration !== duration);
  }

  // --- Defense ---

  getDefenseCards() {
    if (!this.deck) return [];
    return this.deck.hand
      .filter(c => c.cardType === 'DEFENSE')
      .map((c, i) => [c, i]);
  }

  addBlock(amount) {
    this.currentBlock += amount;
  }

  clearBlock() {
    this.currentBlock = 0;
  }

  // --- Damage ---

  takeDamageFromDeck(amount) {
    if (this._invulnerable) return 0;
    if (!this.deck) return 0;
    if (amount <= 0) return 0;
    // Ethereal — clamp incoming damage to 1 BEFORE deck removal.
    // Catches unpreventable hits, Fire/Poison/Shock ticks, and any
    // other path that bypasses takeDamageWithDefense's clamp.
    // Mirrors PY game.py's repeated "damage > 1 and ethereal"
    // checks at every direct deck-damage site.
    if (amount > 1 && Array.isArray(this.powers)
        && this.powers.some(p => p && p.id === 'ethereal')) {
      amount = 1;
    }
    // Outside combat, ensure there's a draw pile for non-combat damage events.
    if (!this.deck.drawPile.length && !this.deck.hand.length && !this.deck.rechargePile.length) {
      this.deck.initializeForAdventure();
    }
    // Flag the whole deck-damage pass: every on_discard_regen card discarded
    // in here applies its Regen DIRECTLY below, so the player-deck onCardDiscarded
    // hook (triggerOnDiscard) must NOT re-apply it. Pure hand-discards (a discard
    // effect outside this method) leave the flag unset, so the hook handles them.
    this._inDeckDamage = true;
    let taken = 0;
    // On Discard: Regen (Boar Tusk) — each discarded relic stacks Regen on
    // the character (a status that heals at the start of the next turns and
    // decays by 1). No card-move heal here, so spent relics don't cycle
    // back and heal forever — the heal is naturally bounded by Regen decay.
    let regenGained = 0;
    let regenSource = '';
    // Use a while-loop so token discards don't consume the damage
    // counter — Web tokens (and any other isToken card sitting in the
    // draw pile) get dragged out without counting as HP, and the loop
    // tries again for a real card to absorb the hit.
    while (taken < amount) {
      const card = this.deck.damageFromDrawPile();
      if (card) {
        // damageFromDrawPile pushes the card to discardPile directly, so the
        // generic discardCard hook didn't fire — re-check the on-discard
        // passives here (Lucky Pebble draw, Web token cascade).
        const effects = (card.effects || []);
        if (effects.some(e => e && e.effectType === 'on_discard_draw')) {
          this.deck.draw(1, this.maxHandSize || 10);
        }
        for (const e of effects) {
          if (e && e.effectType === 'on_discard_discard') {
            const n = Math.max(1, e.value || 1);
            for (let k = 0; k < n; k++) {
              if (this.deck.drawPile.length === 0) break;
              const dragged = this.deck.drawPile.pop();
              this.deck.discardCard(dragged);
            }
          }
          if (e && e.effectType === 'on_discard_regen') { const rv = Math.max(0, e.value || 0); if (rv > 0) { regenGained += this.applyRegen(rv); regenSource = card.name; } }
        }
        // damageFromDrawPile bypassed discardCard, so fire the generic
        // on-discard hook here too (Harpy Feather's `on_discard` draw,
        // the meal hook). Player deck only.
        if (typeof this.deck.onCardDiscarded === 'function') this.deck.onCardDiscarded(card);
        // Tokens (Web token most importantly) are clog, not lifeforce —
        // they discard without absorbing the swing.
        if (!card.isToken) taken++;
        continue;
      }
      // No more cards in deck — pull from hand instead (random card).
      // Tokens in hand (Goodberries, etc.) similarly skip the HP cost.
      if (this.deck.hand.length > 0) {
        const idx = Math.floor(Math.random() * this.deck.hand.length);
        const handCard = this.deck.hand.splice(idx, 1)[0];
        handCard.exhausted = false;
        for (const e of (handCard.effects || [])) {
          if (e && e.effectType === 'on_discard_regen') { const rv = Math.max(0, e.value || 0); if (rv > 0) { regenGained += this.applyRegen(rv); regenSource = handCard.name; } }
        }
        this.deck.discardCard(handCard);
        if (!handCard.isToken) taken++;
        continue;
      }
      // No cards anywhere — character is dead
      break;
    }
    // Shed any Regen-relics (Boar Tusk) sitting dead in hand when real
    // damage lands — discarding frees the hand slot AND applies their Regen.
    if (taken > 0 && this.deck && Array.isArray(this.deck.hand) && this.deck.hand.length > 0) {
      for (let h = this.deck.hand.length - 1; h >= 0; h--) {
        const hc = this.deck.hand[h];
        const re = (hc.effects || []).find(e => e && e.effectType === 'on_discard_regen');
        if (!re) continue;
        this.deck.hand.splice(h, 1);
        const rv = Math.max(0, re.value || 0);
        if (rv > 0) { regenGained += this.applyRegen(rv); regenSource = hc.name; }
        this.deck.discardCard(hc);
      }
    }
    // Feedback (main.js installs the hook): log the Regen gained + float a
    // token. The actual healing happens at this character's turn start when
    // processStatusEffects ticks the Regen status.
    if (regenGained > 0 && typeof globalThis !== 'undefined'
        && typeof globalThis.__onDiscardRegen === 'function') {
      globalThis.__onDiscardRegen(this, regenGained, regenSource);
    }
    // True Damage (unpreventable) burns Regen 1:1. A DIRECT
    // takeDamageFromDeck call IS True Damage — the defense wrappers
    // (takeDamageWithDefense / takeDamageNoBlock) set _suppressRegenBurn so
    // ordinary / Ice-Shatter damage leaves Regen alone.
    if (!this._suppressRegenBurn && taken > 0) {
      const rg = this.getStatus('REGEN');
      if (rg > 0) this.removeStatus('REGEN', Math.min(rg, taken));
    }
    this._inDeckDamage = false;
    return taken;
  }

  // Damage path used by effects that bypass the one-shot Block window
  // but still respect the persistent defense layers (Shield, Armor).
  // Currently fired by Ice Shatter — the icy burst skips the
  // reactive defense phase entirely yet stacked Shield / Armor still
  // soaks it. Brute / Ethereal apply the same as takeDamageWithDefense.
  takeDamageNoBlock(amount) {
    if (this._invulnerable) return [0, 0];
    if (amount > 0 && Array.isArray(this.powers)
        && this.powers.some(p => p && p.id === 'brute')) {
      amount = amount + 1;
    }
    if (amount > 1 && Array.isArray(this.powers)
        && this.powers.some(p => p && p.id === 'ethereal')) {
      amount = 1;
    }
    let remaining = amount;
    // Armor FIRST (permanent flat reduction off the top), shield
    // afterward — same rule as Creature.takeDamage. Without this the
    // standing Shield stack would burn off chip damage that armor
    // should soak for free.
    const armorAbsorb = Math.min(this.armor, remaining);
    remaining -= armorAbsorb;
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, remaining);
      this.shield -= shieldAbsorb;
      remaining -= shieldAbsorb;
    }
    // Not True Damage — shield/armor mitigated it, so it doesn't burn Regen.
    this._suppressRegenBurn = true;
    const taken = this.takeDamageFromDeck(remaining);
    this._suppressRegenBurn = false;
    return [amount - remaining, taken];
  }

  takeDamageWithDefense(amount) {
    if (this._invulnerable) return [amount, 0];
    // Brute (Ruga's passive) — every incoming attack deals +1 more
    // damage. Applied at the source so every damage-routing path in
    // main.js benefits without each site having to know about it.
    if (amount > 0 && Array.isArray(this.powers)
        && this.powers.some(p => p && p.id === 'brute')) {
      amount = amount + 1;
    }
    // Ethereal (Dwarven Specter passive) — clamp any incoming
    // attack damage to a maximum of 1, regardless of source. Run
    // AFTER Brute so a +1 bonus can't sneak past. Mirrors PY
    // game.py:9396-9398 — every damage-routing site clamps to 1.
    if (amount > 1 && Array.isArray(this.powers)
        && this.powers.some(p => p && p.id === 'ethereal')) {
      amount = 1;
    }
    // Drow Riposte (Khydhani) — parry 1-3 of an incoming ATTACK BEFORE
    // block / armor / shield, so his standing defenses aren't burned on
    // damage he can simply dodge. The parried amount is PREVENTED (no card
    // restoration → he never net-heals). The FULL 1-3 roll is stashed for
    // the lash-back, which triggerSplitPower applies (it runs only on
    // attacks, so DoTs never lash). `_noRiposte` gates out the Fire DoT
    // tick. True damage skips this (it doesn't route through here).
    this._pendingRiposteParry = 0;
    this._pendingRiposteLash = 0;
    if (amount > 0 && !this._noRiposte && Array.isArray(this.powers)
        && this.powers.some(p => p && p.id === 'riposte')) {
      const roll = 1 + Math.floor(Math.random() * 2); // 1-2
      const parry = Math.min(roll, amount);
      amount -= parry;
      this._pendingRiposteParry = parry;
      this._pendingRiposteLash = roll; // full roll lashes back, even > damage
    }
    let remaining = amount;
    // Block absorbs FIRST — it's a one-attack temp absorber, so
    // consume it before the persistent layers (shield, armor) so
    // the player's standing buffs aren't wasted. NOTE: legacy
    // behavior wiped currentBlock to 0 after the first hit; that
    // turned a Block 4 into "absorb 1 then vanish". We now drain
    // only what we used so multi-hit turns chip away at block.
    if (this.currentBlock > 0) {
      const blockAbsorb = Math.min(this.currentBlock, remaining);
      this.currentBlock -= blockAbsorb;
      remaining -= blockAbsorb;
    }
    // Armor next (permanent, doesn't deplete) — applied BEFORE Shield
    // so the persistent buffer isn't burned on damage that armor
    // soaks for free. Order is block (temp) → armor (flat) → shield
    // (persistent), so chip damage against a shielded + armored
    // creature first scrubs off block, then bounces off armor, then
    // chips shields only if anything is left over.
    const armorAbsorb = Math.min(this.armor, remaining);
    remaining -= armorAbsorb;
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, remaining);
      this.shield -= shieldAbsorb;
      remaining -= shieldAbsorb;
    }
    // Block/Shield/Armor absorbed — this is a mitigated hit, not True
    // Damage, so it doesn't burn Regen.
    this._suppressRegenBurn = true;
    const taken = this.takeDamageFromDeck(remaining);
    this._suppressRegenBurn = false;
    return [amount - remaining, taken];
  }

  // --- Status Effects ---

  // Opposing damage-over-time stacks cancel 1-for-1 on application, exactly
  // like Fire/Ice. Regen is the "positive DoT" and opposes Fire, Poison, and
  // Bleed; each of those opposes Regen back. Centralising this here means
  // EVERY application site (all the apply_poison / apply_bleed / fire paths)
  // gets the cancellation for free and Regen can never coexist with a
  // negative DoT. The manual Ice/Regen cancel still living in the apply_fire
  // / apply_ice cases is harmless: it fully consumes the opposite before its
  // leftover applyStatus() call, so the check below just no-ops there.
  // _lastStatusCancel records what got eaten so callers can log/float it.
  static STATUS_OPPOSITES = {
    // Regen cancels DoTs in this priority order: Bleed → Poison →
    // Drow Sleep → Fire (matches the healing-clear order).
    REGEN: ['BLEED', 'POISON', 'DROW_SLEEP', 'FIRE'],
    FIRE: ['REGEN'],
    POISON: ['REGEN'],
    BLEED: ['REGEN'],
    // Drow Sleep Poison behaves like Poison: Regen cancels it 1-for-1 on
    // application (and it cancels Regen), so Regen / heals can clear it.
    DROW_SLEEP: ['REGEN'],
  };

  // THE single source of truth for the heal-clear order. Every heal that
  // spends points clearing Ailments before HP (healPlayer, meal ticks,
  // Regrowth, Bad Rations…) routes through healAilments() below, which
  // walks this list in order. Change the order HERE and every heal follows.
  // (Heal-Ailment "cure" cards use PLAYER_NEGATIVE_STATUSES in main.js,
  // which is kept in the same Bleed → Poison → Drow order.)
  static HEAL_AILMENTS = [
    { key: 'BLEED',      label: 'Bleed',             verb: 'stops',  color: '#ff5050' },
    { key: 'POISON',     label: 'Poison',            verb: 'purges', color: '#3cc83c' },
    { key: 'DROW_SLEEP', label: 'Drow Sleep Poison', verb: 'purges', color: '#9fb8e8' },
  ];

  // THE single source of truth for the "cure" (Heal-Ailment) priority order.
  // Unlike HEAL_AILMENTS (which only the heal-points paths use, and which
  // Fire/Ice/Shock can't be spent on), a cure strips ONE stack of each
  // Ailment in this order. Used by main.js (PLAYER_NEGATIVE_STATUSES alias →
  // healOneNegativeEffectOn for Heal-Ailment cards) AND the Bear Fat Rations
  // meal tick below. Same Bleed → Poison → Drow Sleep head as HEAL_AILMENTS,
  // then the decaying elementals.
  static CURE_AILMENTS = [
    { key: 'BLEED',      label: 'Bleed',             color: '#c83c3c' },
    { key: 'POISON',     label: 'Poison',            color: '#3cc83c' },
    { key: 'DROW_SLEEP', label: 'Drow Sleep Poison', color: '#dfe7ff' },
    { key: 'FIRE',       label: 'Fire',              color: '#dc8c28' },
    { key: 'ICE',        label: 'Ice',               color: '#78c8ff' },
    { key: 'SHOCK',      label: 'Shock',             color: '#ffe650' },
  ];
  applyStatus(status, stacks) {
    // Spell Turning (Crag Cat power) — each negative-status application has a
    // 50% chance to be turned aside entirely (one roll per application,
    // all-or-nothing for its stacks). Gated on the holder carrying the power,
    // so it only ever protects that enemy.
    if (stacks > 0
        && (status === 'POISON' || status === 'BLEED' || status === 'FIRE'
          || status === 'ICE' || status === 'SHOCK' || status === 'MARK')
        && Array.isArray(this.powers)
        && this.powers.some(p => p && p.id === 'spell_turning')
        && Math.random() < 0.5) {
      this._spellTurned = status;
      // Let the host log it (character.js is log-agnostic — main.js installs
      // Character._onSpellTurned). `stacks` is the amount that was negated.
      if (typeof Character._onSpellTurned === 'function') Character._onSpellTurned(this, status, stacks);
      return;
    }
    this._spellTurned = null;
    let n = stacks;
    this._lastStatusCancel = null;
    if (n > 0) {
      const opposites = Character.STATUS_OPPOSITES[status];
      if (opposites) {
        for (const opp of opposites) {
          if (n <= 0) break;
          const have = this.getStatus(opp);
          if (have > 0) {
            const cancel = Math.min(have, n);
            this.removeStatus(opp, cancel);
            n -= cancel;
            (this._lastStatusCancel || (this._lastStatusCancel = {}))[opp] = cancel;
          }
        }
      }
    }
    if (n > 0) this.statusEffects[status] = (this.statusEffects[status] || 0) + n;
  }

  // Regen is applied through applyStatus (single source of truth for the
  // Fire/Poison/Bleed cancellation). This wrapper just stamps the per-type
  // _lastRegen*Cancel fields the apply_regen effect case reads for its log
  // lines, and returns the Regen stacks actually added (post-cancellation).
  applyRegen(amount) {
    const n = Math.max(0, amount || 0);
    const before = this.getStatus('REGEN');
    this.applyStatus('REGEN', n);
    const eaten = this._lastStatusCancel || {};
    this._lastRegenFireCancel = eaten.FIRE || 0;
    this._lastRegenPoisonCancel = eaten.POISON || 0;
    this._lastRegenBleedCancel = eaten.BLEED || 0;
    this._lastRegenDrowCancel = eaten.DROW_SLEEP || 0;
    return this.getStatus('REGEN') - before;
  }

  // Spend up to `amount` healing points clearing Ailments in the canonical
  // HEAL_AILMENTS order (Bleed → Poison → Drow Sleep), 1 point per stack.
  // Calls onClear({ key, n, label, verb, color }) for each type cleared so
  // the caller can log it however it formats (addLog, a logs[] array, a
  // toast…). Returns the leftover points for HP healing.
  healAilments(amount, onClear = null) {
    let remaining = Math.max(0, amount || 0);
    for (const a of Character.HEAL_AILMENTS) {
      if (remaining <= 0) break;
      const have = this.getStatus ? (this.getStatus(a.key) || 0) : 0;
      if (have <= 0) continue;
      const n = Math.min(have, remaining);
      this.removeStatus(a.key, n);
      remaining -= n;
      if (onClear) onClear({ key: a.key, n, label: a.label, verb: a.verb, color: a.color });
    }
    return remaining;
  }

  removeStatus(status, stacks = null) {
    if (stacks === null) {
      delete this.statusEffects[status];
    } else {
      this.statusEffects[status] = Math.max(0, (this.statusEffects[status] || 0) - stacks);
      if (this.statusEffects[status] === 0) delete this.statusEffects[status];
    }
  }

  getStatus(status) {
    return this.statusEffects[status] || 0;
  }

  // --- Creatures ---

  // Hard cap on simultaneous allies. Mirrors PY (player + enemy max_creatures
  // = 12 in this build) — anything past the cap is silently refused so
  // callers can branch on the return value to short-circuit summon effects.
  // The field is a CREATURE_COLS-wide grid (2 rows of 6). Capacity is
  // counted in CELLS, not array entries, so a multi-cell creature (the
  // enemy Butcher at 2x2 = 4 cells) eats its footprint of the 12.
  static MAX_CREATURES = 12;
  static CREATURE_COLS = 6;

  // Total grid cells currently occupied by allies (sum of footprints).
  // Equals creatures.length whenever every creature is the default 1x1.
  usedCells() {
    let n = 0;
    for (const c of this.creatures) n += (c.slotW || 1) * (c.slotH || 1);
    return n;
  }

  // Set of grid-cell indices covered by the existing creatures' footprints.
  _occupiedCells() {
    const cols = Character.CREATURE_COLS;
    const occ = new Set();
    for (const c of this.creatures) {
      const a = c.slot;
      if (a == null || a < 0) continue;
      const cw = c.slotW || 1, ch = c.slotH || 1;
      const ac = a % cols, ar = Math.floor(a / cols);
      for (let dr = 0; dr < ch; dr++) {
        for (let dc = 0; dc < cw; dc++) occ.add((ac + dc) + (ar + dr) * cols);
      }
    }
    return occ;
  }

  addCreature(creature) {
    const cols = Character.CREATURE_COLS;
    // Default field is 2 rows (12 cells). A fight can widen THIS character's
    // field via `_gridRows` (e.g. the Gate of the Deep Goblin Front gives
    // the enemy 3 rows so goblins spawn in front of the trolls).
    const rows = this._gridRows || (Character.MAX_CREATURES / cols);
    const maxCells = rows * cols;
    const fw = creature.slotW || 1;
    const fh = creature.slotH || 1;
    // Cell-budget check first (fast reject).
    if (this.usedCells() + fw * fh > maxCells) return false;
    // Find the lowest anchor whose fw x fh block is fully in-grid AND
    // free. For 1x1 creatures this is just the lowest free slot, so
    // existing behavior is unchanged.
    const occ = this._occupiedCells();
    let anchor = -1;
    for (let s = 0; s < cols * rows; s++) {
      const ac = s % cols, ar = Math.floor(s / cols);
      if (ac + fw > cols || ar + fh > rows) continue; // off the grid
      let fits = true;
      for (let dr = 0; dr < fh && fits; dr++) {
        for (let dc = 0; dc < fw && fits; dc++) {
          if (occ.has((ac + dc) + (ar + dr) * cols)) fits = false;
        }
      }
      if (fits) { anchor = s; break; }
    }
    if (anchor < 0) return false; // no contiguous block (fragmented field)
    creature.owner = this;
    creature.slot = anchor;
    this.creatures.push(creature);
    return true;
  }

  // Like addCreature, but tries to AVOID the given slot anchors when
  // picking a spot (falls back to any free slot if none else is open).
  // Used by the Goblin Swarm resummon so a replacement goblin doesn't
  // pop into the exact slot just vacated by the one you killed — making
  // it obvious it's a fresh goblin, not the same one refusing to die.
  addCreatureAvoiding(creature, avoidSlots = []) {
    const cols = Character.CREATURE_COLS;
    const rows = this._gridRows || (Character.MAX_CREATURES / cols);
    const maxCells = rows * cols;
    const fw = creature.slotW || 1;
    const fh = creature.slotH || 1;
    if (this.usedCells() + fw * fh > maxCells) return false;
    const occ = this._occupiedCells();
    const avoid = new Set(avoidSlots);
    const findAnchor = (respectAvoid) => {
      for (let s = 0; s < cols * rows; s++) {
        const ac = s % cols, ar = Math.floor(s / cols);
        if (ac + fw > cols || ar + fh > rows) continue;
        if (respectAvoid && avoid.has(s)) continue;
        let fits = true;
        for (let dr = 0; dr < fh && fits; dr++) {
          for (let dc = 0; dc < fw && fits; dc++) {
            if (occ.has((ac + dc) + (ar + dr) * cols)) fits = false;
          }
        }
        if (fits) return s;
      }
      return -1;
    };
    let anchor = findAnchor(true);
    if (anchor < 0) anchor = findAnchor(false); // field full except vacated slot
    if (anchor < 0) return false;
    creature.owner = this;
    creature.slot = anchor;
    this.creatures.push(creature);
    return true;
  }

  // True if a default 1x1 ally can still be summoned. Footprint-aware
  // callers (the enemy Butcher) rely on addCreature's boolean return
  // instead, which checks the actual 2x2 block.
  canSummonMore() {
    const maxCells = this._gridRows
      ? this._gridRows * Character.CREATURE_COLS
      : Character.MAX_CREATURES;
    return this.usedCells() < maxCells;
  }

  readyCreatures() {
    for (const c of this.creatures) {
      c.ready();
    }
  }

  removeDeadCreatures() {
    const dead = this.creatures.filter(c => !c.isAlive);
    // Companion cards (e.g. Thorb) are linked to a sourceCard sitting in the
    // play pile while alive. When the companion dies, route its source card
    // to the discard pile so the player visibly loses it (PY parity).
    if (this.deck) {
      for (const c of dead) {
        if (c.isCompanion && c.sourceCard) {
          this.deck.playPileToDiscard(c.sourceCard);
        }
      }
    }
    this.creatures = this.creatures.filter(c => c.isAlive);
    return dead;
  }

  // --- Powers ---

  addPower(power) {
    power.owner = this;
    this.powers.push(power);
  }

  readyPowers() {
    for (const p of this.powers) {
      if (!p.isPassive) p.ready();
    }
  }

  getUsablePowers() {
    return this.powers.filter(p => p.canUse());
  }

  // --- Combat Buffs ---
  addCombatBuff(buff) {
    this.combatBuffs.push(buff);
  }

  // Apply a single per-tick effect for a CombatBuff. Pulled out of the
  // processCombatBuffs switch so multi-effect provisions (Bad Rations:
  // heal_random + discard_deck_random) can call this once per entry in
  // their effects array. `eff` shape:
  //   { effectType, effectValue }                     — standard tick
  //   { effectType: 'random_pick', options: [ ... ] } — pick one option
  //                                                     uniformly each tick
  _applyBuffTickEffect(buff, eff, logs, enemy = null) {
    if (!eff) return;
    const effectType = eff.effectType;
    const effectValue = eff.effectValue;
    if (effectType === 'random_pick' && Array.isArray(eff.options) && eff.options.length > 0) {
      // Lambas Bread / Travel Rations Meal tick — pick one option
      // uniformly per tick. Each pick is independent so a 3-turn run
      // can mix-and-match (Heal/Heroism/Heal, Heroism/Heroism/Heal, ...).
      const choice = eff.options[Math.floor(Math.random() * eff.options.length)];
      this._applyBuffTickEffect(buff, {
        effectType: choice.effectType || choice.type,
        effectValue: choice.value != null ? choice.value : choice.effectValue,
      }, logs, enemy);
      return;
    }
    switch (effectType) {
      // Frenzy Blood Vial's Bloodied Frenzy is a marker buff — its Rage is
      // applied in startPlayerTurn (which needs the main.js isBloodied check),
      // so the per-tick effect here is a deliberate no-op.
      case 'bloodied_rage':
        break;
      case 'gain_heroism': {
        this.heroism += effectValue;
        const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'buff_angelic_03';
        logs.push({
          text: `  ${buff.name}: +${effectValue} Heroism`,
          color: '#ffd700',
          token: 'Heroism', tokenAmount: effectValue, tokenColor: '#ffd700',
          buff,
          sfxKey: tickSfx,
          sfxCount: buff.tickSfxCount || 1,
          sfxStagger: buff.tickSfxStagger || 150,
        });
        break;
      }
      case 'gain_shield': {
        this.shield += effectValue;
        const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'protection_buff_01';
        logs.push({
          text: `  ${buff.name}: +${effectValue} Shield`,
          color: '#64b4dc',
          token: 'Shield', tokenAmount: effectValue, tokenColor: '#64b4dc',
          buff,
          sfxKey: tickSfx,
          sfxCount: buff.tickSfxCount || 1,
          sfxStagger: buff.tickSfxStagger || 150,
        });
        break;
      }
      case 'draw_card':
        if (this.deck) {
          const drawn = this.deck.draw(effectValue, 10);
          // Stone Giant's Running buff sets tickSfxKey: 'footstep' +
          // tickSfxCount: 4 so the start-of-turn draw plays 4
          // staggered footsteps. Default for other Draw buffs stays a
          // single card_draw cue on the first entry only.
          const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'card_draw';
          const count = buff.tickSfxCount || 1;
          const stagger = buff.tickSfxStagger || 150;
          drawn.forEach((d, idx) => {
            logs.push({
              text: `  ${buff.name}: Draw ${d.name}`,
              color: '#3c3cc8',
              card: d,
              buff,
              sfxKey: idx === 0 ? tickSfx : undefined,
              sfxCount: idx === 0 ? count : 1,
              sfxStagger: idx === 0 ? stagger : 0,
            });
          });
        }
        break;
      case 'regen': {
        // Regen-granting tick (Troll Blood Vial beverage). Instead of a
        // flat heal, this ADDS to the Regen stack — so it merges with any
        // Regen the holder already has and rides the normal Regen rules
        // (heal = stacks at turn start, then -1, cancels DoTs). applyRegen
        // returns the net stacks added after DoT cancellation.
        const added = this.applyRegen(effectValue);
        const regenSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
        // Surface what the Regen ATE on application (DoT cancellation, in the
        // STATUS_OPPOSITES order Bleed → Poison → Drow Sleep → Fire) — without
        // this, a tick fully consumed cancelling Poison reads as "did nothing".
        const regenCancels = [
          { n: this._lastRegenBleedCancel || 0,  label: 'Bleed',             color: '#ff5050' },
          { n: this._lastRegenPoisonCancel || 0, label: 'Poison',            color: '#3cc83c' },
          { n: this._lastRegenDrowCancel || 0,   label: 'Drow Sleep Poison', color: '#9fb8e8' },
          { n: this._lastRegenFireCancel || 0,   label: 'Fire',              color: '#dc8c28' },
        ];
        for (const rc of regenCancels) {
          if (rc.n <= 0) continue;
          logs.push({
            text: `  ${buff.name}: Regen cancels ${rc.n} ${rc.label}`,
            color: rc.color,
            buff,
            sfxKey: regenSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        }
        if (added > 0) {
          logs.push({
            text: `  ${buff.name}: +${added} Regen`,
            color: '#7cff9c',
            token: 'Regen', tokenAmount: added, tokenColor: '#7cff9c',
            buff,
            sfxKey: regenSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        }
        break;
      }
      case 'heal': {
        // Food / meal heal tick. Heal priority Bleed → Poison → Drow Sleep
        // → HP card (each "point" of healing clears one stack in that order).
        // Value defaults to 1.
        let remaining = Math.max(1, effectValue || 1);
        const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
        remaining = this.healAilments(remaining, ({ n, label, verb, color }) => {
          const V = verb.charAt(0).toUpperCase() + verb.slice(1);
          logs.push({
            text: `  ${buff.name}: ${V} ${n} ${label}`,
            color,
            buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        });
        while (remaining > 0 && this.deck && this.deck.discardPile.length > 0) {
          const card = this.deck.discardPile.pop();
          this.deck.addToRechargePile(card);
          logs.push({
            text: `  ${buff.name}: Healed 1 (${card.name})`,
            color: '#3cc83c',
            card, healed: 1, buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
          remaining--;
        }
        break;
      }
      case 'heal_overheal_treant': {
        // Regrowth regen tick — heal exactly like the 'heal' case, but
        // any overflow past full HP (deck full, no ailments left) is
        // flagged as `summonTreant` so main.js sprouts that many Treants.
        let remaining = Math.max(1, effectValue || 1);
        const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
        remaining = this.healAilments(remaining, ({ n, label, verb, color }) => {
          const V = verb.charAt(0).toUpperCase() + verb.slice(1);
          logs.push({ text: `  ${buff.name}: ${V} ${n} ${label}`, color, buff, sfxKey: tickSfx, sfxCount: buff.tickSfxCount || 1, sfxStagger: buff.tickSfxStagger || 150 });
        });
        while (remaining > 0 && this.deck && this.deck.discardPile.length > 0) {
          const card = this.deck.discardPile.pop();
          this.deck.addToRechargePile(card);
          logs.push({ text: `  ${buff.name}: Healed 1 (${card.name})`, color: '#3cc83c', card, healed: 1, buff, sfxKey: tickSfx, sfxCount: buff.tickSfxCount || 1, sfxStagger: buff.tickSfxStagger || 150 });
          remaining--;
        }
        // Leftover = overheal → Summon Treants. Flag-only entry (no
        // text); main.js's summonTreant handler emits the single
        // "Overheal! Summon N Treant" log so it isn't doubled.
        if (remaining > 0) {
          logs.push({ summonTreant: remaining, buff });
        }
        break;
      }
      case 'goodberry_sustenance': {
        // Tick variant of the on-play goodberry_sustenance roll. 50%
        // for nothing, otherwise pick one of: +1 Shield / +1 Heroism /
        // Draw 1 / Heal 1. Used by Goodberry's "If No Meal" fallback
        // meal so the provision feels like a steady trickle of random
        // small boons over 2 turns instead of a fixed buff.
        if (Math.random() < 0.5) {
          logs.push({ text: `  ${buff.name}: nothing this turn.`, color: '#808080', buff });
          break;
        }
        const roll = Math.floor(Math.random() * 4);
        if (roll === 0) {
          this.shield = (this.shield || 0) + 1;
          logs.push({
            text: `  ${buff.name}: +1 Shield`,
            color: '#64b4dc',
            token: 'Shield', tokenAmount: 1, tokenColor: '#64b4dc',
            buff,
            sfxKey: 'protection_buff_01',
          });
        } else if (roll === 1) {
          this.heroism = (this.heroism || 0) + 1;
          logs.push({
            text: `  ${buff.name}: +1 Heroism`,
            color: '#ffd700',
            token: 'Heroism', tokenAmount: 1, tokenColor: '#ffd700',
            buff,
            sfxKey: 'buff_angelic_03',
          });
        } else if (roll === 2) {
          if (this.deck) {
            const drawn = this.deck.draw(1, 10);
            drawn.forEach((d, idx) => {
              logs.push({
                text: `  ${buff.name}: Draw ${d.name}`,
                color: '#3c3cc8',
                card: d, buff,
                sfxKey: idx === 0 ? 'card_draw' : undefined,
              });
            });
            if (drawn.length === 0) logs.push({ text: `  ${buff.name}: (no cards to draw)`, color: '#808080', buff });
          }
        } else {
          // Heal 1 branch — status-first (Bleed → Poison → Drow Sleep →
          // card) so the heal point never goes to waste. healAilments
          // clears 1 of the first present ailment; if none, the leftover
          // point heals a card.
          const left = this.healAilments(1, ({ n, label, verb, color }) => {
            const V = verb.charAt(0).toUpperCase() + verb.slice(1);
            logs.push({
              text: `  ${buff.name}: ${V} ${n} ${label}`,
              color,
              buff,
              sfxKey: 'heal_spell',
            });
          });
          if (left > 0 && this.deck && this.deck.discardPile.length > 0) {
            const card = this.deck.discardPile.pop();
            this.deck.addToRechargePile(card);
            logs.push({
              text: `  ${buff.name}: Heal 1 (${card.name})`,
              color: '#3cc83c',
              card, healed: 1, buff,
              sfxKey: 'heal_spell',
            });
          }
        }
        break;
      }
      case 'swim_drag_recharge': {
        // Giant Frog swim debuff — no-op at the tick level. The actual
        // forced-recharge is interactive (player picks which card to
        // recharge) and is dispatched in main.js at the start-of-turn
        // hook by calling startWhirlpoolPhase(effectValue). That path
        // already wires on_swim_recharge_draw + Fresh Fish _swimDraw
        // through the standard swim recharge handler.
        logs.push({
          text: `  ${buff.name}: Swim ${Math.max(1, effectValue || 1)} — pick a card to recharge.`,
          color: '#64b4dc',
          buff,
        });
        break;
      }
      case 'heal_random': {
        // Bad Rations Meal tick — heal 1..effectValue (random). Rolls
        // each tick so a 2-turn buff with value=2 gives a 1-1, 1-2,
        // 2-1, or 2-2 spread. Same poison-first rule as the standard
        // 'heal' meal tick: each healing point clears one Poison stack
        // before falling through to card-from-discard.
        let remaining = 1 + Math.floor(Math.random() * Math.max(1, effectValue));
        const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
        remaining = this.healAilments(remaining, ({ n, label, verb, color }) => {
          const V = verb.charAt(0).toUpperCase() + verb.slice(1);
          logs.push({
            text: `  ${buff.name}: ${V} ${n} ${label}`,
            color,
            buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        });
        let healed = 0;
        for (let i = 0; i < remaining && this.deck && this.deck.discardPile.length > 0; i++) {
          const card = this.deck.discardPile.pop();
          this.deck.addToRechargePile(card);
          healed++;
        }
        if (healed > 0) {
          logs.push({
            text: `  ${buff.name}: Healed ${healed}`,
            color: '#3cc83c',
            healed, buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        }
        break;
      }
      case 'heal_n_negative_effects': {
        // Bear Fat Rations Meal tick — strip up to N Ailment stacks off
        // the eater in the shared CURE_AILMENTS order (Bleed → Poison →
        // Drow Sleep → Fire → Ice → Shock). Same constant main.js's
        // PLAYER_NEGATIVE_STATUSES aliases, so both cures stay in lockstep.
        let remaining = Math.max(1, effectValue || 1);
        const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
        while (remaining > 0) {
          let cleared = false;
          for (const s of Character.CURE_AILMENTS) {
            if (!this.getStatus) break;
            if ((this.getStatus(s.key) || 0) > 0) {
              this.removeStatus(s.key, 1);
              logs.push({
                text: `  ${buff.name}: -1 ${s.label}`,
                color: s.color,
                buff,
                sfxKey: tickSfx,
                sfxCount: buff.tickSfxCount || 1,
                sfxStagger: buff.tickSfxStagger || 150,
              });
              cleared = true;
              break;
            }
          }
          if (!cleared) break;
          remaining--;
        }
        break;
      }
      case 'discard_deck_random': {
        // Bad Rations Meal tick — roll 0..effectValue, discard that
        // many cards from the deck (player.takeDamageFromDeck). Value
        // = 1 → 50/50 between 0 and 1.
        const rolled = Math.floor(Math.random() * (effectValue + 1));
        if (rolled > 0) {
          const before = this.deck ? this.deck.drawPile.length + this.deck.rechargePile.length : 0;
          const taken = (typeof this.takeDamageFromDeck === 'function') ? this.takeDamageFromDeck(rolled) : 0;
          if (taken > 0) logs.push({ text: `  ${buff.name}: Lost ${taken} card${taken > 1 ? 's' : ''} from deck`, color: '#c83c3c', buff });
          else if (before === 0) logs.push({ text: `  ${buff.name}: (no cards in deck to discard)`, color: '#888', buff });
        }
        break;
      }
      case 'apply_ice': {
        this.applyStatus('ICE', effectValue);
        for (const ally of (this.creatures || [])) {
          if (!ally.isAlive) continue;
          ally.iceStacks = (ally.iceStacks || 0) + effectValue;
        }
        logs.push({
          text: `  ${buff.name}: +${effectValue} Ice on you and all allies`,
          color: '#7ec8e3',
          token: 'Ice', tokenAmount: effectValue, tokenColor: '#7ec8e3',
          buff,
        });
        break;
      }
      case 'apply_ice_random_enemy': {
        // Whitescale Brew beverage tick — pour a stack of Ice onto a
        // random alive enemy. The pool is the enemy's living
        // creatures plus the enemy character itself; if everything
        // is dead the tick noops silently. Cross-character target
        // pickup needs the enemy passed in by processCombatBuffs.
        if (!enemy) break;
        const pool = [];
        if (Array.isArray(enemy.creatures)) {
          for (const c of enemy.creatures) {
            if (c && c.isAlive) pool.push(c);
          }
        }
        if (enemy.isAlive && !enemy._invulnerable) pool.push(enemy);
        if (pool.length === 0) break;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick instanceof Creature) {
          pick.iceStacks = (pick.iceStacks || 0) + effectValue;
        } else if (typeof pick.applyStatus === 'function') {
          pick.applyStatus('ICE', effectValue);
        }
        logs.push({
          text: `  ${buff.name}: +${effectValue} Ice on ${pick.name}`,
          color: '#7ec8e3',
          token: 'Ice', tokenAmount: effectValue, tokenColor: '#7ec8e3',
          buff,
          // Stash the pick so main.js can spawn the visual token on
          // the right target (logs that name a creature route the
          // token spawn through that creature instead of the player).
          creature: pick instanceof Creature ? pick : null,
        });
        break;
      }
      case 'summon_elf_warrior': {
        const aliveAllies = (this.creatures || []).filter(c => c.isAlive).length;
        if (aliveAllies < 6) {
          const elf = new Creature({ name: 'Elf Warrior', attack: 2, maxHp: 2 });
          // ccgQuest+ scaling — main.js stamps the player tier
          // offset on the buff when adding it; bump +1/+1 per tier
          // here so the per-turn elf matches the up-front spawn
          // (CREATURE_TIER_OFFSET['Elf Warrior'] = { attack:1, hp:1 }).
          const tOff = buff._tierOffset || 0;
          if (tOff > 0) {
            elf.attack += tOff;
            elf.maxHp += tOff;
            elf.currentHp = elf.maxHp;
          }
          if (this.addCreature(elf)) {
            logs.push({ text: `  ${buff.name}: Elf Warrior reinforces!`, color: '#3cc83c', creature: elf, buff });
          }
        }
        break;
      }
      case 'shield_wall_tick': {
        // Shield Wall — guard tick. effectValue carries the current
        // stack count (one stack per cast). Grant that many Shield
        // to the character and every alive ally creature.
        this.shield = (this.shield || 0) + effectValue;
        logs.push({
          text: `  ${buff.name}: +${effectValue} Shield`,
          color: '#64b4dc',
          token: 'Shield', tokenAmount: effectValue, tokenColor: '#64b4dc',
          buff,
        });
        for (const ally of (this.creatures || [])) {
          if (!ally.isAlive) continue;
          ally.shield = (ally.shield || 0) + effectValue;
          logs.push({
            text: `    ${ally.name}: +${effectValue} Shield`,
            color: '#64b4dc',
            token: 'Shield', tokenAmount: effectValue, tokenColor: '#64b4dc',
            buff,
            creature: ally,
          });
        }
        break;
      }
      case 'battle_shout_tick': {
        // Battle Shout — rally tick. effectValue carries the current
        // stack count (one stack per cast). Grant that many Heroism
        // to the character and every alive ally creature.
        this.heroism = (this.heroism || 0) + effectValue;
        logs.push({
          text: `  ${buff.name}: +${effectValue} Heroism`,
          color: '#ffd700',
          token: 'Heroism', tokenAmount: effectValue, tokenColor: '#ffd700',
          buff,
        });
        for (const ally of (this.creatures || [])) {
          if (!ally.isAlive) continue;
          ally.heroism = (ally.heroism || 0) + effectValue;
          logs.push({
            text: `    ${ally.name}: +${effectValue} Heroism`,
            color: '#ffd700',
            token: 'Heroism', tokenAmount: effectValue, tokenColor: '#ffd700',
            buff,
            creature: ally,
          });
        }
        break;
      }
      case 'magma_tablet_tick': {
        this.ignite = (this.ignite || 0) + effectValue;
        logs.push({
          text: `  ${buff.name}: +${effectValue} Ignite (Ignite:${this.ignite})`,
          color: '#ff8c40',
          token: 'Ignite', tokenAmount: effectValue, tokenColor: '#ff8c40',
          buff,
        });
        const fire = (this.statusEffects && this.statusEffects.FIRE) || 0;
        if (fire > 0) {
          this.ignite += 1;
          logs.push({
            text: `    Burning! +1 Ignite (Ignite:${this.ignite})`,
            color: '#ff8c40',
            token: 'Ignite', tokenAmount: 1, tokenColor: '#ff8c40',
            buff,
          });
          if (this.deck && typeof this.deck.draw === 'function') {
            const drawn = this.deck.draw(1, this.maxHandSize || 10);
            for (const d of drawn) {
              logs.push({ text: `    Burning! Draw ${d.name}`, color: '#7ec8ff', card: d, buff });
            }
          }
        }
        break;
      }
    }
  }

  processCombatBuffs(enemy = null) {
    const logs = [];
    // Overheal-converter ticks (Regrowth: heal_overheal_treant) must
    // fire AFTER plain heals (food / meal buffs) so the food tops the
    // player off FIRST, leaving Regrowth's heal to overflow into
    // Treants. Stable sort keeps every other buff in insertion order.
    const tickOrder = (b) => (b && b.effectType === 'heal_overheal_treant') ? 1 : 0;
    const ordered = [...this.combatBuffs].sort((a, b) => tickOrder(a) - tickOrder(b));
    for (const buff of ordered) {
      if (buff.trigger === 'start_of_turn') {
        // Multi-effect provisions (Bad Rations Meal, Whitescale Brew)
        // carry an effects array and resolve each entry per tick.
        // Single-effect buffs fall through to the legacy
        // { effectType, effectValue } path. The optional `enemy`
        // parameter is passed through so cross-character effects
        // (apply_ice_random_enemy on Whitescale Brew) can land on
        // the live opponent without the character class needing a
        // module-level enemy reference.
        if (Array.isArray(buff.effects) && buff.effects.length > 0) {
          for (const e of buff.effects) {
            this._applyBuffTickEffect(buff, e, logs, enemy);
          }
        } else {
          this._applyBuffTickEffect(buff, { effectType: buff.effectType, effectValue: buff.effectValue }, logs, enemy);
        }
        if (buff.turnsRemaining > 0) {
          buff.turnsRemaining--;
          if (buff.turnsRemaining === 0) buff._expired = true;
        }
      }
    }
    // Remove only buffs whose turn count just ran out. Buffs with
    // turnsRemaining === 0 from the start (no per-turn limit) stay until
    // endCombatBuffCleanup() drops them at end of combat.
    this.combatBuffs = this.combatBuffs.filter(b => !b._expired);
    return logs;
  }

  endCombatBuffCleanup() {
    this.combatBuffs = this.combatBuffs.filter(b => {
      b.combatsRemaining--;
      return b.combatsRemaining > 0;
    });
  }

  // --- Perks ---
  getPerkStacks(effectType) {
    return this.perks
      .filter(p => p.effectType === effectType)
      .reduce((sum, p) => sum + p.effectValue, 0);
  }

  hasPerk(perkId) {
    return this.perks.some(p => p.id === perkId);
  }
}

// ============================================================
// Perk Creators
// ============================================================

// All perk descriptions follow the "Trigger: Effect." convention so the
// in-game text line reads the same as the overlay badge. Triggers used:
//   Combat Start, Combat End, Turn Start, Turn End.

// ----- Common (repeatable) -----

export function createToughPerk() {
  return new Perk({
    id: 'tough', name: 'Tough',
    description: 'Combat Start: +Shield.',
    imageId: 'tough_perk', effectType: 'combat_start_shield', effectValue: 1,
  });
}

export function createPreparedPerk() {
  return new Perk({
    id: 'prepared', name: 'Prepared',
    description: 'Combat Start: +1 Heroism.',
    imageId: 'prepared_perk', effectType: 'combat_start_heroism', effectValue: 1,
  });
}

export function createFlashOfGeniusPerk() {
  return new Perk({
    id: 'flash_of_genius', name: 'Flash of Genius',
    description: 'Combat Start: Recharge a card to draw 1 (optional).',
    imageId: 'flash_of_genius_perk', effectType: 'combat_start_flash', effectValue: 1,
  });
}

export function createGritPerk() {
  return new Perk({
    id: 'grit', name: 'Grit',
    description: 'Combat End: Heal 1.',
    imageId: 'grit_perk', effectType: 'combat_end_heal', effectValue: 1,
  });
}

export function createLuckyFindPerk() {
  return new Perk({
    id: 'lucky_find', name: 'Lucky Find',
    // Triggers at loot time (combat-end gold award) — not combat start.
    // Uses the "Loot" trigger (yellow badge).
    description: 'Loot: When gaining gold, gain an extra 1d6.',
    imageId: 'lucky_find_perk', effectType: 'loot_bonus_gold', effectValue: 1,
  });
}

// ----- Common, Tier 2 (repeatable) -----
// Upgraded forms of the four common perks — same art as the base perks,
// double the effect. Offered only from the tier-2 perk pool (wired into
// CLASS_PERK_WEIGHTS[2] later). combat_start_shield / combat_start_heroism /
// combat_end_heal already sum effectValue via getPerkStacks, so the bumped
// values "just work"; loot_ore_chance is a new effect handled in main.js.

export function createVeryToughPerk() {
  return new Perk({
    id: 'very_tough', name: 'Very Tough',
    description: 'Combat Start: +2 Shield.',
    imageId: 'tough_perk', effectType: 'combat_start_shield', effectValue: 2,
    tier: 2,
  });
}

export function createWellPreparedPerk() {
  return new Perk({
    id: 'well_prepared', name: 'Well Prepared',
    description: 'Combat Start: +2 Heroism.',
    imageId: 'prepared_perk', effectType: 'combat_start_heroism', effectValue: 2,
    tier: 2,
  });
}

export function createVeryGrittyPerk() {
  return new Perk({
    id: 'very_gritty', name: 'Very Gritty',
    description: 'Combat End: Heal 2.',
    imageId: 'grit_perk', effectType: 'combat_end_heal', effectValue: 2,
    tier: 2,
  });
}

// Prospector — the miner's-eye upgrade of Lucky Find. When gold is gained,
// 10% chance per stack to also turn up a chunk of raw ore (rolled from the
// ore_cache loot table). Effect lives in the loot-gold handler in main.js.
export function createProspectorPerk() {
  return new Perk({
    id: 'prospector', name: 'Prospector',
    description: 'Loot: When gaining gold, 5% chance to find ore.',
    imageId: 'lucky_find_perk', effectType: 'loot_ore_chance', effectValue: 1,
    tier: 2,
  });
}

export function createReadinessPerk() {
  return new Perk({
    id: 'readiness', name: 'Readiness',
    description: 'Combat Start: Draw 1.',
    imageId: 'flash_of_genius_perk', effectType: 'combat_start_draw', effectValue: 1,
    tier: 2,
  });
}

// ----- Uncommon (unique) -----

export function createArsenalPerk() {
  return new Perk({
    id: 'arsenal', name: 'Arsenal',
    description: 'Turn Start: If no weapon in hand, draw 1.',
    imageId: 'arsenal_perk', effectType: 'turn_start_no_weapon_draw', effectValue: 1,
    unique: true,
  });
}

export function createTalentedPerk() {
  return new Perk({
    id: 'talented', name: 'Talented',
    description: 'Turn Start: If no ability in hand, draw 1.',
    imageId: 'talented_perk', effectType: 'turn_start_no_ability_draw', effectValue: 1,
    unique: true,
  });
}

export function createFirstStrikePerk() {
  return new Perk({
    id: 'first_strike', name: 'First Strike',
    description: 'Combat Start: Deal 1 unpreventable damage to a random enemy.',
    imageId: 'first_strike_perk', effectType: 'combat_start_first_strike', effectValue: 1,
    unique: true,
  });
}

export function createSecondWindPerk() {
  return new Perk({
    id: 'second_wind', name: 'Second Wind',
    description: 'Turn Start: If you took 4+ damage last turn, Heal 1.',
    imageId: 'second_wind_perk', effectType: 'turn_start_second_wind', effectValue: 1,
    unique: true,
  });
}

export function createAmbushPerk() {
  return new Perk({
    id: 'ambush', name: 'Ambush',
    description: 'Combat Start: Your first attack this combat is unpreventable.',
    imageId: 'ambush_perk', effectType: 'combat_first_unpreventable', effectValue: 1,
    unique: true,
  });
}

export function createArmoredPerk() {
  return new Perk({
    id: 'armored', name: 'Armored',
    description: 'Turn End: If no armor in hand, draw 1.',
    imageId: 'armored_perk', effectType: 'turn_end_no_armor_draw', effectValue: 1,
    unique: true,
  });
}

// Armorer's Training — granted by Doran & Mira when Kellen is rescued (not a
// level-up roll; kept out of CLASS_PERK_WEIGHTS). At the end of your turn you
// MAY recharge an Armor card from hand to draw 1 (interactive prompt, handled
// in main.js endPlayerTurn). Reuses the Armored perk art.
export function createArmorerTrainingPerk() {
  return new Perk({
    id: 'armorer_training', name: "Armorer's Training",
    description: 'After Enemy Turn: You may recharge an Armor card to Draw.',
    imageId: 'armorer_training_perk', effectType: 'turn_end_armor_recharge_draw', effectValue: 1,
    unique: true,
  });
}

export function createPowerSurgePerk() {
  return new Perk({
    id: 'power_surge', name: 'Power Surge',
    // Uses the "Combat" trigger (not "Combat Start") — the effect fires
    // when the player *first applies a debuff* during combat, not at the
    // opening bell. Shorter label reflects that gate.
    description: 'Combat: Your first debuff also hits a random enemy.',
    imageId: 'power_surge_perk', effectType: 'combat_first_debuff_spread', effectValue: 1,
    unique: true,
  });
}

export function createBalancedPerk() {
  return new Perk({
    id: 'balanced', name: 'Balanced',
    description: 'Turn Start: If 1 Weapon, 1 Armor and 1 Ability in hand, draw 1.',
    imageId: 'balanced_perk', effectType: 'turn_start_balanced_draw', effectValue: 1,
    unique: true,
  });
}

// Necromancer-flavored unique: the first Skeleton-trait ally summoned
// during combat gets a one-time +1/+1 (atk + maxHp + currentHp). Tied
// to the Skeleton Mastery / Army of the Dead summon flow — fires once
// per combat regardless of how many skeletons go on to enter the
// field after. Uses the Skeleton Mastery art (NecromancerPower.jpg).
export function createSkeletalStrengthPerk() {
  return new Perk({
    id: 'skeletal_strength', name: 'Skeletal Strength',
    description: 'Combat: Your First Skeleton gets +1/+1.',
    imageId: 'skeletal_strength_perk', effectType: 'combat_first_skeleton_buff', effectValue: 1,
    unique: true,
  });
}

// Druid-flavored unique: tops up a Goodberry in hand on combat start,
// mirroring the Druid's starter ally-food card. Uses the Druid-themed
// "Harvest" art.
export function createHarvestPerk() {
  return new Perk({
    id: 'harvest', name: 'Harvest',
    description: 'Combat Start: Add a Goodberry to your hand.',
    imageId: 'harvest_perk', effectType: 'combat_start_goodberry', effectValue: 1,
    unique: true,
  });
}

// ----- Uncommon, Tier 2 (unique upgrades) -----
// Each upgrades a tier-1 unique perk. All but Divine Protection REPLACE
// their prerequisite (the "requires X / replaces X" gating is wired with
// the tier-2 selection later). Art is keyed by perk id in CARD_ART_MAP.

export function createThirdWindPerk() {
  return new Perk({
    id: 'third_wind', name: 'Third Wind',
    description: 'Turn Start: If you took damage last turn, Heal 1.',
    imageId: 'second_wind_perk', effectType: 'turn_start_third_wind', effectValue: 1,
    unique: true, tier: 2, requires: 'second_wind', replaces: 'second_wind',
  });
}

export function createPoisonersAmbushPerk() {
  return new Perk({
    id: 'poisoners_ambush', name: "Poisoner's Ambush",
    description: 'Combat Start: Your first attack is Unpreventable and applies Poison.',
    imageId: 'ambush_perk', effectType: 'combat_first_unpreventable_poison', effectValue: 1,
    unique: true, tier: 2, requires: 'ambush', replaces: 'ambush',
  });
}

export function createFirstVolleyPerk() {
  return new Perk({
    id: 'first_volley', name: 'First Volley',
    description: 'Combat Start: Deal 1 Unpreventable damage to a random enemy 3 times.',
    imageId: 'first_strike_perk', effectType: 'combat_start_volley', effectValue: 3,
    unique: true, tier: 2, requires: 'first_strike', replaces: 'first_strike',
  });
}

export function createPowerInfusionPerk() {
  return new Perk({
    id: 'power_infusion', name: 'Power Infusion',
    description: 'Combat: Your first 3 debuffs also hit a random enemy.',
    imageId: 'power_surge_perk', effectType: 'combat_debuff_spread_charges', effectValue: 3,
    unique: true, tier: 2, requires: 'power_surge', replaces: 'power_surge',
  });
}

export function createGrandHarvestPerk() {
  return new Perk({
    id: 'grand_harvest', name: 'Grand Harvest',
    description: 'Combat Start: Gain 2 random Herbs (Goodberry, Cave Shroom or Frostbloom).',
    imageId: 'harvest_perk', effectType: 'combat_start_herbs', effectValue: 2,
    unique: true, tier: 2, requires: 'harvest', replaces: 'harvest',
  });
}

export function createEmpoweredSkeletonsPerk() {
  return new Perk({
    id: 'empowered_skeletons', name: 'Empowered Skeletons',
    description: 'Combat: Your Skeletons get +1/+1.',
    imageId: 'skeletal_strength_perk', effectType: 'combat_skeleton_buff_all', effectValue: 1,
    unique: true, tier: 2, requires: 'skeletal_strength', replaces: 'skeletal_strength',
  });
}

export function createDivineProtectionPerk() {
  return new Perk({
    id: 'divine_protection', name: 'Divine Protection',
    description: 'Combat: Your Armor cards also Heal 1.',
    imageId: 'divine_protection_perk', effectType: 'armor_on_play_heal', effectValue: 1,
    unique: true, tier: 2, requires: 'armored', // requires Armored but does NOT replace it
  });
}

// ----- Rare, Tier 2 -----

export function createTrollAncestryPerk() {
  return new Perk({
    id: 'troll_ancestry', name: 'Troll Ancestry',
    description: 'Combat Start: Gain 2 Regen.',
    imageId: 'troll_ancestry_perk', effectType: 'combat_start_regen', effectValue: 2,
    unique: true, tier: 2, rarity: 'rare',
  });
}

export function createBloodiedRagePerk() {
  return new Perk({
    id: 'bloodied_rage', name: 'Bloodied Rage',
    description: 'Combat: While Bloodied, gain 1 Rage.',
    imageId: 'bloodied_rage_perk', effectType: 'bloodied_rage', effectValue: 1,
    unique: true, tier: 2, rarity: 'rare',
  });
}

export function createCleansingArmorPerk() {
  return new Perk({
    id: 'cleansing_armor', name: 'Cleansing Armor',
    description: 'Combat: Your Armor cards also Heal 1 Ailment.',
    imageId: 'cleansing_armor_perk', effectType: 'armor_on_play_cleanse', effectValue: 1,
    unique: true, tier: 2, rarity: 'rare',
  });
}

// Swift Assault STACKS (not unique) — like Boarhide Bracers, +1 per copy on
// the first attack of the turn.
export function createSwiftAssaultPerk() {
  return new Perk({
    id: 'swift_assault', name: 'Swift Assault',
    description: 'Combat: First Attack: +1 Damage.',
    imageId: 'swift_assault_perk', effectType: 'first_attack_damage', effectValue: 1,
    tier: 2, rarity: 'rare',
  });
}

// Tier-2 Unique Epic provision perks — Beverages / Meals last 1 extra turn.
// Wired in applyStartOfCombatBuffs (the projected provision's turn cap reads
// these perk stacks per slot).
export function createBrewmasterPerk() {
  return new Perk({
    id: 'brewmaster', name: 'Brewmaster',
    description: 'Beverages last 1 additional turn.',
    imageId: 'brewmaster_perk', effectType: 'beverage_extra_turn', effectValue: 1,
    unique: true, tier: 2, rarity: 'epic',
  });
}

export function createGourmandPerk() {
  return new Perk({
    id: 'gourmand', name: 'Gourmand',
    description: 'Meals last 1 additional turn.',
    imageId: 'gourmand_perk', effectType: 'meal_extra_turn', effectValue: 1,
    unique: true, tier: 2, rarity: 'epic',
  });
}

// Per-class perk weights at each level-up tier. Mirrors PY's
// `CLASS_PERK_WEIGHTS` dict. Tier 2 is currently empty (reserved for
// future expansion) — falls back to tier 1 if empty for a class.
export const CLASS_PERK_WEIGHTS = {
  1: {
    Warrior: { tough: 0.5,  prepared: 0.5,  flash_of_genius: 0.25, grit: 1.0,  arsenal: 0.5,  second_wind: 0.25, lucky_find: 0.5 },
    Rogue:   { tough: 0.5,  prepared: 1.0,  flash_of_genius: 0.5,  grit: 0.25, arsenal: 0.5,  ambush: 0.25,      lucky_find: 0.5 },
    Wizard:  { tough: 0.5,  prepared: 0.5,  flash_of_genius: 1.0,  grit: 0.25, talented: 0.5, power_surge: 0.25, lucky_find: 0.5 },
    Ranger:  { tough: 0.5,  prepared: 1.0,  flash_of_genius: 0.25, grit: 0.5,  arsenal: 0.5,  first_strike: 0.25, lucky_find: 0.5 },
    Paladin: { tough: 1.0,  prepared: 0.5,  flash_of_genius: 0.25, grit: 0.5,  arsenal: 0.5,  armored: 0.25,     lucky_find: 0.5 },
    Druid:   { tough: 0.75, prepared: 0.75, flash_of_genius: 0.25, grit: 0.5,  balanced: 0.5, harvest: 0.25,     lucky_find: 0.5 },
    // Necromancer — heavy on Grit, light on Skeletal Strength / Talented.
    // Targets ~ 14/14/14/14/7/29/7 distribution over total weight 3.5.
    Necromancer: { tough: 0.5, prepared: 0.5, flash_of_genius: 0.5, grit: 1.0, talented: 0.25, lucky_find: 0.5, skeletal_strength: 0.25 },
  },
  2: {
    Warrior: {
      very_tough: 0.75, well_prepared: 0.50, very_gritty: 0.75, prospector: 0.75,
      readiness: 0.50, third_wind: 0.25, troll_ancestry: 0.25, bloodied_rage: 0.50,
      cleansing_armor: 0.25, swift_assault: 0.25,
      brewmaster: 0.125, gourmand: 0.125,
    },
    Ranger: {
      very_tough: 0.50, well_prepared: 1.00, very_gritty: 0.75, prospector: 0.75,
      readiness: 0.50, first_volley: 0.25, troll_ancestry: 0.25, bloodied_rage: 0.25,
      cleansing_armor: 0.25, swift_assault: 0.50,
      brewmaster: 0.125, gourmand: 0.125,
    },
    Paladin: {
      very_tough: 1.00, well_prepared: 0.50, very_gritty: 0.75, prospector: 0.75,
      readiness: 0.50, divine_protection: 0.25, troll_ancestry: 0.25, bloodied_rage: 0.25,
      cleansing_armor: 0.50, swift_assault: 0.25,
      brewmaster: 0.125, gourmand: 0.125,
    },
    Rogue: {
      very_tough: 0.50, well_prepared: 1.00, very_gritty: 0.50, prospector: 0.75,
      readiness: 0.75, poisoners_ambush: 0.25, troll_ancestry: 0.25, bloodied_rage: 0.25,
      cleansing_armor: 0.25, swift_assault: 0.50,
      brewmaster: 0.125, gourmand: 0.125,
    },
    Druid: {
      very_tough: 0.75, well_prepared: 0.75, very_gritty: 0.75, prospector: 0.75,
      readiness: 0.75, grand_harvest: 0.25, troll_ancestry: 0.50, bloodied_rage: 0.25,
      cleansing_armor: 0.25, swift_assault: 0.25,
      brewmaster: 0.125, gourmand: 0.125,
    },
    Wizard: {
      very_tough: 0.50, well_prepared: 1.00, very_gritty: 0.50, prospector: 0.75,
      readiness: 1.00, power_infusion: 0.25, troll_ancestry: 0.25, bloodied_rage: 0.25,
      cleansing_armor: 0.50, swift_assault: 0.25,
      brewmaster: 0.125, gourmand: 0.125,
    },
    Necromancer: {
      very_tough: 0.75, well_prepared: 0.75, very_gritty: 0.75, prospector: 0.75,
      readiness: 0.75, empowered_skeletons: 0.25, troll_ancestry: 0.50, bloodied_rage: 0.25,
      cleansing_armor: 0.25, swift_assault: 0.25,
      brewmaster: 0.125, gourmand: 0.125,
    },
  },
};

// id → creator map. Lets getPerkChoices look up a creator by string id
// (the weights tables only reference ids, not functions).
export const PERK_REGISTRY = {
  tough:           createToughPerk,
  prepared:        createPreparedPerk,
  flash_of_genius: createFlashOfGeniusPerk,
  grit:            createGritPerk,
  lucky_find:      createLuckyFindPerk,
  // Tier-2 common perks (upgraded forms; offered from the tier-2 pool).
  very_tough:      createVeryToughPerk,
  well_prepared:   createWellPreparedPerk,
  very_gritty:     createVeryGrittyPerk,
  prospector:      createProspectorPerk,
  readiness:       createReadinessPerk,
  // Tier-2 uncommon perks (unique upgrades; offered from the tier-2 pool).
  third_wind:          createThirdWindPerk,
  poisoners_ambush:    createPoisonersAmbushPerk,
  first_volley:        createFirstVolleyPerk,
  power_infusion:      createPowerInfusionPerk,
  grand_harvest:       createGrandHarvestPerk,
  empowered_skeletons: createEmpoweredSkeletonsPerk,
  divine_protection:   createDivineProtectionPerk,
  // Tier-2 rare perks.
  troll_ancestry:      createTrollAncestryPerk,
  bloodied_rage:       createBloodiedRagePerk,
  cleansing_armor:     createCleansingArmorPerk,
  swift_assault:       createSwiftAssaultPerk,
  brewmaster:          createBrewmasterPerk,
  gourmand:            createGourmandPerk,
  arsenal:         createArsenalPerk,
  talented:        createTalentedPerk,
  second_wind:     createSecondWindPerk,
  ambush:          createAmbushPerk,
  first_strike:    createFirstStrikePerk,
  armored:         createArmoredPerk,
  armorer_training: createArmorerTrainingPerk,
  power_surge:     createPowerSurgePerk,
  balanced:        createBalancedPerk,
  harvest:         createHarvestPerk,
  skeletal_strength: createSkeletalStrengthPerk,
};

// Pick `count` unique perks via weighted random without replacement from
// the class + tier pool. Falls back to tier 1 when the requested tier is
// empty for this class. Filters out unique perks the player already owns.
// Append a ccgQuest+ tier suffix to a perk so it counts as a distinct
// perk from its base-tier sibling (Tough vs Tough+ vs Tough++ etc.).
// id becomes `<base>_p<N>` so save/load can parse the offset back out
// and the unique / stack-cap filter treats the variants independently.
// Stats are unchanged — perks gain new identity, not new power.
export function stampPerkOffset(perk, offset) {
  if (!perk || !offset || offset <= 0) return perk;
  const suffix = offset === 1 ? '+' : offset === 2 ? '++' : offset === 3 ? '+++' : `+${offset}`;
  perk.id = `${perk.id}_p${offset}`;
  perk.name = `${perk.name}${suffix}`;
  // Bump the tier so the perk card's tier badge matches the rest of
  // the ccgQuest+ run. Stats stay flat (per spec) — the tier label
  // is just visual to make the variant feel distinct from the base
  // perk in the picker.
  perk.tier = (perk.tier || 1) + offset;
  return perk;
}
// Save/load helper — rebuild a perk from a serialized id. Handles
// both base ids (tough) and stamped ones (tough_p1).
export function recreatePerkFromId(perkId) {
  if (!perkId) return null;
  const m = perkId.match(/^(.*)_p(\d+)$/);
  if (m) {
    const fn = PERK_REGISTRY[m[1]];
    if (fn) return stampPerkOffset(fn(), parseInt(m[2], 10));
  }
  const fn = PERK_REGISTRY[perkId];
  return fn ? fn() : null;
}

export function getPerkChoices(existingPerks = [], count = 2, characterClass = '', tier = 1, tierOffset = 0) {
  let weights = (CLASS_PERK_WEIGHTS[tier] || {})[characterClass];
  if (!weights && tier > 1) weights = (CLASS_PERK_WEIGHTS[1] || {})[characterClass];
  if (!weights) {
    // Unknown class — fall back to "all perks equal weight" so the flow
    // never breaks (matches the old pre-class behavior).
    weights = {};
    for (const id of Object.keys(PERK_REGISTRY)) weights[id] = 1.0;
  }
  // ccgQuest+ stamp — at offset > 0, the perks offered get an id +
  // name suffix so they count as distinct from the base versions in
  // the unique / stack-cap filter. Owned base perks DON'T block the
  // stamped variants (player can stack Tough+ on top of 5x Tough).
  const idSuffix = tierOffset > 0 ? `_p${tierOffset}` : '';
  const ownedUniqueIds = new Set(existingPerks.filter(p => p.unique).map(p => p.id));
  // Count current stacks per perk id so non-unique (common/repeatable)
  // perks cap at 5 — once the player has 5 copies the perk drops out
  // of the offer pool entirely. Unique perks already filter on the
  // ownedUniqueIds rule above (cap is implicitly 1).
  const stackCount = {};
  for (const p of existingPerks) {
    if (!p || p.unique) continue;
    stackCount[p.id] = (stackCount[p.id] || 0) + 1;
  }
  const STACK_CAP = 5;
  // Upgrade perks (Third Wind, Poisoner's Ambush, …) only appear once the
  // player owns their `requires` prerequisite. Match on base ids so a
  // ccgQuest+ stamped prereq (second_wind_p1) still counts.
  const ownedBaseIds = new Set(existingPerks.map(p => (p.id || '').replace(/_p\d+$/, '')));
  let ids = Object.keys(weights).filter(id => {
    const creator = PERK_REGISTRY[id];
    if (!creator) return false;
    const sample = creator();
    const fullId = id + idSuffix;
    if (sample.requires && !ownedBaseIds.has(sample.requires)) return false;
    if (sample.unique) return !ownedUniqueIds.has(fullId);
    return (stackCount[fullId] || 0) < STACK_CAP;
  });
  let w = ids.map(id => weights[id]);
  const chosen = [];
  for (let k = 0; k < Math.min(count, ids.length); k++) {
    const total = w.reduce((s, v) => s + v, 0);
    if (total <= 0) break;
    let roll = Math.random() * total;
    let picked = 0;
    for (let j = 0; j < ids.length; j++) {
      roll -= w[j];
      if (roll <= 0) { picked = j; break; }
    }
    chosen.push(stampPerkOffset(PERK_REGISTRY[ids[picked]](), tierOffset));
    ids.splice(picked, 1);
    w.splice(picked, 1);
  }
  return chosen;
}
