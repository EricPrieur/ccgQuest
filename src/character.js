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
  constructor({ id, name, description, imageId, effectType, effectValue, unique = false, tier = 1 }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageId = imageId;
    this.effectType = effectType;
    this.effectValue = effectValue;
    this.unique = unique;
    this.tier = tier;
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
    let taken = 0;
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
        }
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
        this.deck.discardCard(handCard);
        if (!handCard.isToken) taken++;
        continue;
      }
      // No cards anywhere — character is dead
      break;
    }
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
    const taken = this.takeDamageFromDeck(remaining);
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
    const taken = this.takeDamageFromDeck(remaining);
    return [amount - remaining, taken];
  }

  // --- Status Effects ---

  applyStatus(status, stacks) {
    this.statusEffects[status] = (this.statusEffects[status] || 0) + stacks;
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
  static MAX_CREATURES = 12;

  addCreature(creature) {
    if (this.creatures.length >= Character.MAX_CREATURES) return false;
    creature.owner = this;
    // Assign the lowest free slot so creatures fill 2 rows of 6 in display order
    const used = new Set(this.creatures.map(c => c.slot).filter(s => s >= 0));
    let slot = 0;
    while (used.has(slot)) slot++;
    creature.slot = slot;
    this.creatures.push(creature);
    return true;
  }

  canSummonMore() {
    return this.creatures.length < Character.MAX_CREATURES;
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
      case 'heal': {
        // Food / meal heal tick. Each "point" of healing first clears
        // a Poison stack, then a Bleed stack, then heals a card from
        // discard as the remainder. Value defaults to 1.
        let remaining = Math.max(1, effectValue || 1);
        const poison = this.getStatus ? (this.getStatus('POISON') || 0) : 0;
        if (poison > 0 && remaining > 0) {
          const toClear = Math.min(poison, remaining);
          this.removeStatus('POISON', toClear);
          remaining -= toClear;
          const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
          logs.push({
            text: `  ${buff.name}: Purged ${toClear} Poison`,
            color: '#3cc83c',
            buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        }
        const bleed = this.getStatus ? (this.getStatus('BLEED') || 0) : 0;
        if (bleed > 0 && remaining > 0) {
          const toClear = Math.min(bleed, remaining);
          this.removeStatus('BLEED', toClear);
          remaining -= toClear;
          const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
          logs.push({
            text: `  ${buff.name}: Stopped ${toClear} Bleed`,
            color: '#ff5050',
            buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        }
        while (remaining > 0 && this.deck && this.deck.discardPile.length > 0) {
          const card = this.deck.discardPile.pop();
          this.deck.addToRechargePile(card);
          const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
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
          // Heal 1 branch — status-first like the standard meal heal:
          // clear a Poison stack, then a Bleed stack, before falling
          // through to card-from-discard, so the heal point never goes
          // to waste.
          const poison = this.getStatus ? (this.getStatus('POISON') || 0) : 0;
          const bleed = this.getStatus ? (this.getStatus('BLEED') || 0) : 0;
          if (poison > 0) {
            this.removeStatus('POISON', 1);
            logs.push({
              text: `  ${buff.name}: Purged 1 Poison`,
              color: '#3cc83c',
              buff,
              sfxKey: 'heal_spell',
            });
          } else if (bleed > 0) {
            this.removeStatus('BLEED', 1);
            logs.push({
              text: `  ${buff.name}: Stopped 1 Bleed`,
              color: '#ff5050',
              buff,
              sfxKey: 'heal_spell',
            });
          } else if (this.deck && this.deck.discardPile.length > 0) {
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
        const poison = this.getStatus ? (this.getStatus('POISON') || 0) : 0;
        if (poison > 0 && remaining > 0) {
          const toClear = Math.min(poison, remaining);
          this.removeStatus('POISON', toClear);
          remaining -= toClear;
          logs.push({
            text: `  ${buff.name}: Purged ${toClear} Poison`,
            color: '#3cc83c',
            buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        }
        const bleed = this.getStatus ? (this.getStatus('BLEED') || 0) : 0;
        if (bleed > 0 && remaining > 0) {
          const toClear = Math.min(bleed, remaining);
          this.removeStatus('BLEED', toClear);
          remaining -= toClear;
          logs.push({
            text: `  ${buff.name}: Stopped ${toClear} Bleed`,
            color: '#ff5050',
            buff,
            sfxKey: tickSfx,
            sfxCount: buff.tickSfxCount || 1,
            sfxStagger: buff.tickSfxStagger || 150,
          });
        }
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
        // Bear Fat Rations Meal tick — strip up to N Ailment stacks
        // off the eater in Bleed → Poison → Fire → Ice → Shock
        // priority order. Mirrors the resolveEffect player path
        // (healOneNegativeEffectOn) but logs through the buff line
        // so the meal banner shows the heal source.
        const order = [
          { key: 'BLEED',  label: 'Bleed',  color: '#ff5050' },
          { key: 'POISON', label: 'Poison', color: '#3cc83c' },
          { key: 'FIRE',   label: 'Fire',   color: '#dc8c28' },
          { key: 'ICE',    label: 'Ice',    color: '#78c8ff' },
          { key: 'SHOCK',  label: 'Shock',  color: '#ffe650' },
        ];
        let remaining = Math.max(1, effectValue || 1);
        const tickSfx = buff.tickSfxKey != null ? buff.tickSfxKey : 'heal_spell';
        while (remaining > 0) {
          let cleared = false;
          for (const s of order) {
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
    for (const buff of this.combatBuffs) {
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
  },
  2: {
    // Tier 2 rolls currently empty; getPerkChoices falls back to tier 1.
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
  arsenal:         createArsenalPerk,
  talented:        createTalentedPerk,
  second_wind:     createSecondWindPerk,
  ambush:          createAmbushPerk,
  first_strike:    createFirstStrikePerk,
  armored:         createArmoredPerk,
  power_surge:     createPowerSurgePerk,
  balanced:        createBalancedPerk,
  harvest:         createHarvestPerk,
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
  let ids = Object.keys(weights).filter(id => {
    const creator = PERK_REGISTRY[id];
    if (!creator) return false;
    const sample = creator();
    const fullId = id + idSuffix;
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
