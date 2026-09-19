# Card budgets & loot math

Reference for pricing new cards and building drop tables. Derived from the
cards already in the game (mostly the Chapter 3 deep-gnome gear, which was
priced deliberately) and confirmed against the Chapter 2 tables.

**This is a guide, not a law.** The cards have to feel playable and good first;
the numbers are here to keep things in the same neighbourhood and to make
outliers visible. Where a card breaks the formula on purpose, say so in its
comment.

---

## 1. Item budget by tier and rarity

Every card is worth a number of **budget points**, read off its tier + rarity:

| | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| **Tier 1** | 3 | 4 | 5 | 6 | 7 |
| **Tier 2** | 5 | 7 | 9 | 11 | 13 |
| **Tier 3** | 7 | 10 | 13 | 16 | 19 |
| **Tier 4** | 9 | 13 | 17 | 21 | 25 |

```
points = (2 × tier + 1) + tier × rarityStep
rarityStep: common 0, uncommon 1, rare 2, epic 3, legendary 4
```

Two things fall out of that:

- **Common by tier** is 3 / 5 / 7 / 9 — flat +2 per tier.
- **The rarity step equals the tier.** A rarity rung is worth +1 at Tier 1 and
  +4 at Tier 4, so rarity matters four times as much on a Tier 4 item. A Tier 4
  Legendary (25) beats three Tier 1 Legendaries.

Tier 5, if it ever exists, would be 11 / 16 / 21 / 26 / 31.

Both inputs already live on every card (`card.tier`, `card.rarity`), so scoring
is a pure lookup — nothing to maintain.

---

## 2. Costs

A weapon's **own Recharge cost is the baseline** and is already priced into the
number above. "Deal 6 → Recharge" is the free-standing shape.

**A second card cost** (recharge/discard *another* card, i.e. a `recharge_extra`
effect) is a real cost, so it earns a bonus:

```
bonus = that card's own budget − 1
```

| Tier 3 | Common | Uncommon | Rare | Epic |
|---|---|---|---|---|
| base | 7 | 10 | 13 | 16 |
| with a 2-card cost | **13** | **19** | **25** | **31** |

**A Discard cost multiplies the budget by 1.5.** Discarding is harsher than a
recharge — the card is out of rotation until the pile reshuffles, not waiting
at the bottom of the draw pile — so it buys half again as much card:

| | Common | Uncommon | Rare | Epic |
|---|---|---|---|---|
| Tier 1 × 1.5 | 4.5 | **6** | 7.5 | 9 |
| Tier 3 × 1.5 | 10.5 | 15 | **19.5** | 24 |

Reckless Strike is the anchor: T1 uncommon (4) × 1.5 = 6, and it reads
*Discard → Deal 6 Damage*.

**A Draw on the card cancels the bonus** — when the draw reliably refunds the
card that paid for it. The net cost returns to baseline. Bone Bow (*Recharge a
Card → Deal 8, Draw*) gets no bonus; Tunnelbreaker Pick (*Recharge a Card →
Sunder 3, Deal 10*) gets the full +9.

A **gated** draw is different, because it does not reliably hand the card back:

| Draw shape | Cost bonus |
|---|---|
| Unconditional (*"… , Draw"*) | **cancelled in full** |
| Bounded to once per turn (*"First Attack: Draw"*) | **kept** — see §4 |
| Gated on target state (*"On Kill: Draw"*, *"Was Undamaged: Draw"*) | **half** |

---

## 3. What effects cost

| Effect | Points |
|---|---|
| Damage | 1 per point |
| **True (unpreventable) Damage** | **1.3 per point** — bypasses Block, Shield and Armor |
| Block | 1 per point |
| Shield | 2 per point |
| **Sunder** | **3 per stack** |
| Poison | 2 per stack |
| Bleed | 1 per stack |
| **Weak** | **2 per stack** — halves one attack (rounds down), one stack per attack |
| **Shock** | **2 per stack** — −1 damage dealt AND +1 damage taken, decays 1/turn |
| **Rage** | **7 per stack** — permanent +1 damage to every attack, no decay |
| **Heal** | **0.5 per point** |
| **Heal 1 Ailment** | **~0.25** — cheap enough that "Heal 4 Ailments" is about 1 point |
| Scout | ~0.5 (weak — it filters, it doesn't draw) |
| **Shield per enemy (1)** | **6** — Shield 2/point x the ALL multiplier |
| Armor-while-in-hand (1) | 4 |
| **Bleed-on-attack rider, rest of fight** | **8** — see the permanent-rider table below |
| **Draw** | **free on DEFENSE cards**; expensive everywhere else |

**Healing is cheap; cleansing is nearly free.** A heal restores a card from the
discard pile — real, but slow and never lethal — so it prices at half a damage
point. Scrubbing an Ailment is cheaper still: it's conditional (worth nothing
when you're clean) and the ailments it removes were mostly going to decay on
their own. Don't be shy with the numbers on a cleanse line — "Heal 4 Ailments"
reads generous and costs about a point.

**True damage is 1.3, and it is the most situational number in this table.**
It bypasses Block, Shield and Armor, which is worth nothing against a naked
target and a great deal against plate — 1.3 is the average, not a promise. The
number is fitted to the two shipped cards that are pure True damage with no
riders muddying them:

| card | budget | True | implied |
|---|---|---|---|
| Dwarven Crossbow (T2 common) | 5 | 4 | 1.25× |
| Partially Digested Bone (T1 uncommon) | 4 | 3 | 1.33× |

Do **not** fit the multiplier to Drain Life, Soul Harvest, Spectral Hand or the
Darkwood Hand Crossbow: those read as 2.0×–4.5×, but only because lifesteal,
poison-per-damage and on-kill summons are carrying value this table does not
price. They say nothing about True.

**Multi-hit True is worth more than single-hit True**, because armour absorbs
*per hit*: a 3-shot volley into 2 Armor loses 6 damage where one big swing of the
same total loses 2. So a barrage that goes unpreventable is buying its way out of
a bigger problem, and ~1.4 is fair there. Trueshot Barrage is priced on that
basis (6×3 = 18 True → 25.2 against a 25 budget); read it as the multi-hit case,
not as the baseline.

**Shock is the two-way debuff.** It's the only status that both blunts the
target's swing and softens them for yours, which is why it matches Weak's price
despite decaying every turn. It also means **effect order changes the bill**:
Shock applied BEFORE your own damage raises that hit by 1 per stack (the damage
handlers read `getIncomingDamageModifier`), so "Shock then Deal 2" is a 3-damage
card wearing a 2-damage description. Put the damage first unless you're paying
for the bump.

### Permanent riders are not consumables — price them separately

A **consumable** rider (Heroism, Ignite, Vial of Poison, Sahuagin Eye, Obsidian
Core, Feral Wrath) is snapshotted once and spent on one card play. Its multiplier
is that card's hit count, and then it's gone.

A **permanent** rider fires on every attack **for the rest of the fight**. Its
multiplier is your whole remaining turn count, so it is a different category of
effect and belongs with these prices, never with the one-shot charges:

| Permanent rider | Points |
|---|---|
| **Rage** | **7** — +1 damage on every attack |
| **Bleed-on-attack, rest of fight** | **8** — see the tempo warning below |
| **Elemental Weapon — Fire** | **10** — +1 Fire on every attack |
| **Elemental Weapon — Ice** | **5** — +1 Ice on every attack |

**Why Rage is 7, not 5.** A Rage stack delivers `hits per turn × turns remaining`
damage, so it has no single price — the same shape the Bleed note below warns
about. Simulated over a 6-turn fight it is worth ~2.5 at 1 hit/turn, 5 at 2, 7.5
at 3 and 10 at 4. The original 5 was fitted at 2 hits a turn; the game now
routinely runs at 3 — Trueshot Barrage, Magic Missiles and the Dragon Bone Bow
are all 3 shots, Blade Flurry is 2, and a multi-target sweep stamps per target.
7 is the 3-hit value. Re-derive it, do not reuse it, for a card that pushes the
hit count higher still.

**Why the Fire rider is 10 and not 12.** Fire tracks Rage at a stable
**1.71-1.78x** across every hit count (simulated on the shipped halving rule),
so against a Rage of 7 the model says ~12. It is deliberately set to **10**
instead, which is a playability call rather than a modelling one: 12 would put
Elemental Weapon past what a Tier 2 uncommon Discard can carry (10.5) and force
the card up a tier or strip its body to nothing, and it is a card that reads
well and is fun where it sits. At 10 + Deal 1 it bills 11 against 10.5 — about
5% hot, knowingly. The gap between 10 and the modelled 12 is the standing
warning: do NOT stack a second Fire rider on top of this one, and re-derive
rather than reuse the 10 for any card that pushes hits per turn past 3.
**Why Fire is nearly double Rage.** Fire halves rather than ticking down by 1, so
a stack that keeps getting topped up *converges* instead of draining — steady-state
Fire damage per turn lands at roughly **2× the Fire stamped per turn**. It also
beats Rage into armour: armour absorbs per hit, so Rage's +1 is eaten on every
swing while Fire arrives as one lump absorbed once. Against that: fire-immune
enemies no-sell it, Ice cancels it 1-for-1, and the tick is delayed so a killing
blow wastes it. Net ≈ 1.8× Rage.

**Why Ice is only 5.** Ice is mitigation with a hard ceiling. The target burns one
stack per attack it makes plus one at end of turn, so against a 2-attack boss only
about 3 stacks a turn ever do work no matter how many you stamp; the overflow only
feeds Ice Shatter. It cannot run away the way Fire can.

**Why Bleed is 8, and why that number is unstable.** Measured against the Rage
anchor over a 6-turn fight with the enemy attacking twice a turn, one stack of the
Bleed rider delivers 1.5–1.7× Rage at 2–3 player hits a turn — and it is
*unpreventable* where Rage is absorbed on every hit, so the real gap is wider.
That is the 8. But the number has a **cliff**, because Bleed's decay is flat:
−1 per attack the bleeder makes, −1 more at end of their turn. Against a
twice-attacking enemy that is 3/turn, so:

| player hits/turn | vs decay 3 | behaviour | implied price |
|---|---|---|---|
| 2–3 | at or under | self-limiting | 7.5–8.3 |
| 4 | +1/turn | **runs away** — total goes quadratic | ~15 |
| 6 | +3/turn | runs away hard | ~22 |

Price it at 8 for a class that plays 2–3 attacks a turn. If a Bleed rider ever
lands somewhere with a higher hit count — a barrage class, or a card that stamps
per hit across an AoE board — re-derive it, because the flat decay means it does
not have one price.

**Every permanent rider needs a brake, and the brake is part of the price.** The
options are a stack cap, or a **Discard** cost so re-stacking costs HP-equity
(deck size *is* hit points, and a discarded card only returns on a heal). Elemental
Weapon shipped with neither — priced at 4 as if it were a consumable, on a Recharge,
stacking unbounded — so one copy cycled three times in a fight reached 3 stacks in
ordinary play and, fed by a barrage, produced ~36 Fire damage a turn indefinitely.
It is now T2 uncommon on a Discard (7 × 1.5 = 10.5): Fire 9 + Deal 1, Ice 5 + Deal 5.

*(Plain Fire and Ice stacks are still unpriced in the table above. Fire lands near
1.5/stack — cheaper than Poison's 2, which never decays and is unpreventable —
but that number has not been pinned down against shipped cards yet.)*

### Draw is deliberately rare

**Most cards in this game cost nothing to play.** A recharge is not a resource
the way mana is — it comes back. So a card that replaces itself is very close
to free tempo, and enough of them in one deck is an engine that draws the whole
pile every turn. Draw is priced high outside the defensive slot for that reason;
*defense* cards get one free because they're reactive and spend themselves to
block.

This is also why **relics look weak on paper**: most carry a draw cantrip, and
the cantrip eats most of the budget. Umber Eye Charm is a 13-point rare whose
printed effect is only *Sunder Randomly* — the Draw is the rest of the cost.

### The relic cantrip ladder

A relic is *"<status> Randomly, Draw."* — and the **Draw is worth 10 of it**.
Umber Eye Charm pins that: a Rare T3 (13) whose printed effect is only Sunder
Randomly (3). So a relic's budget is almost entirely the cantrip, and the
**status is the differentiator, not the payload**:

| Relic budget | Status package it buys | Example |
|---|---|---|
| T3 uncommon (10) | ~0 — the Draw alone | a bare cantrip |
| T3 rare (13) | **3** | Sunder Randomly (3) · Mark Randomly (3) |
| T3 epic (16) | **6** | Mark 2 Randomly (6) · Mark + Shock (3+2) |
| T3 legendary (19) | **9** | Sunder 3 Randomly · a stacked package |

Climbing a rarity rung on a relic buys a **stronger status**, not a second
mechanic. Keep the shape identical and change what it applies — that is what
makes the family legible on sight.

Two traps this closes:

- **Don't re-price a status because the tier went up.** Mark is 3 whether it is
  on a Tier 2 attack or a Tier 3 relic. It doubles your next hit, so it *feels*
  like it should scale with your damage — it doesn't, and pricing it that way
  quietly inflates every relic above rare.
- **Statuses by cost, for reference:** Shock 2 · Weak 2 · Poison 2 · Bleed 1 ·
  Sunder 3 · **Mark 3**.

### Conditionals

A bonus behind a condition is worth **half** its face value — *Armor/Shield:
+2* prices at 1. Two caveats:

- **Who controls the condition?** *Bloodied*, *Was Undamaged* and *On Kill*
  depend on the target's state and are genuinely uncertain. A condition the
  player can simply choose to satisfy is closer to full price for its
  numeric part (see First Attack in §4).
- **Conditions are not a discount on Draw.** Halving the value of a draw
  misses the point — what matters is the abuse ceiling, not the average. §4.

### Multipliers

| | Rule |
|---|---|
| **Stays in hand** | **×3** on the body. A stays-in-hand card's printed effect should read *weak* for its rarity, because it fires every turn. Prefer utility bodies (scout, reveal, a rider) over repeatable raw stats. |
| **2nd target** | **half value.** *Sunder + 3 damage* = 6 on the first target, +3 for the second = 9. |
| **ALL targets** | **×3.** Sunder All = 9 points, Poison All = 6. Prices AoE debuffs out of the low rarities. |
| **ALL your own summons** | **roughly half the ALL-targets price — less again when the caster is excluded.** The ×3 above assumes an enemy board that is full and outside your control. Your own host is bounded by the bodies you actually have (often 1–3, sometimes 0 — and at 0 the card is dead), so it cannot be priced like a guaranteed sweep. *2 Shields across your Undead* is **4**, not 12. |

### Specialisation discount

Gear that only works against one thing may run above its budget, because it's
close to a dead card the rest of the time. Burrower's Gauntlet gets an unlimited
free Sunder every turn precisely because Sunder does nothing to an unarmored
monster.

### Worked examples

All exact fits, no rounding:

| Card | Budget | Breakdown |
|---|---|---|
| Svirfhammer (T3 C) | 7 | Sunder 1 (3) + Deal 4 (4) |
| Deep Pick (T3 C + 2-card cost) | 7 + 6 = 13 | Sunder 2 (6) + Deal 7 (7) |
| Tunnelbreaker Pick (T3 U + 2-card cost) | 10 + 9 = 19 | Sunder 3 (9) + Deal 10 (10) |
| Work Gloves (T3 C) | 7 | Block 4 + Sunder 1 (3) + free draw |
| Miner's Helm (T3 C) | 7 | Armor-in-hand (4) + Block 3 + free draw |
| Umber Shield (T3 C) | 7 | Shield 3 (6) + Heal 1 Sunder (1) |
| Mandible Cleaver (T3 U + 2-card cost) | 19 | (Sunder 3 + Deal 9 + Bleed 1) = 13, +6.5 for target 2 |

**Don't calibrate off the Chapter 2 cards.** Bone Bow, Hunter's Recurve and
Bone Cleaver all run 2–5 points hot against this line; they predate the system.

**Don't calibrate off enemy-only cards either.** Some creators in `cards.js`
exist purely to drive a monster mechanic and were never priced as player cards.
Enraged Strike is the trap here: it looks like a cheap Rage card, but it is the
universal monster pity timer — from turn 11 the enemy is handed a fresh copy
every turn — so its numbers say nothing about what Rage costs a player. Check
whether a card is in any class ability pool, starter deck, shop or loot table
before treating it as a data point.

---

## 4. The deck-abuse test

Before pricing a card, ask the question a player trying to break the game asks:

> **What happens if I fill my deck with this card?**

Averages don't break decks; *ceilings* do. A card that is fair as a one-of and
absurd as a ten-of is mispriced no matter what the point math says.

**The cautionary tale.** The old Rock read *"Deal 1, Draw."* Fine on its own.
Then three Sneak Attacks joined it (X = attacks this turn) and the deck drew
itself: every Rock replaced itself, every swing grew the next Sneak Attack, and
the turn stopped ending. Nothing in the point math flagged it, because the
problem was N copies, not one.

### Gate types

What matters is whether **N copies produce N triggers**.

| Gate | N copies → | Verdict |
|---|---|---|
| **Per-turn cap** — *First Attack: Draw* | 1 trigger, however many you run | **Strong gate.** The ceiling is fixed no matter the deck. |
| **Target state** — *Was Undamaged / Bloodied / On Kill* | up to N, given enough targets | Real gate on each instance, weak ceiling against a wide board |
| **Probability** — *50% to …* | ~N/2 | **Weakest.** Randomness slows abuse, it doesn't cap it. |

A per-turn cap is the only one that bounds the deck rather than the card, which
is why *First Attack: Draw* is an acceptable rider on a strong card: it also
carries a real tempo cost, since drawing the card late in a turn (off an ally
cycle) leaves you holding a much weaker version of it.

### A cost can be its own gate

A second card cost is self-limiting at deck scale: a deck stuffed with
two-card-cost weapons mills itself out. Assassinate (*Recharge a Card → Deal
15…*) spends two cards per cast and only refunds one on a qualifying hit, so
running ten is its own punishment.

---

## 5. Loot tables

Two stages, and they compose:

**Stage 1 — the gate.** Tables listed in `GATED_LOOT` (search main.js) drop
nothing 50% of the time. A LOOT phase with `guaranteedLoot: true` bypasses it
(e.g. the Gnoll Pack Lord's guards-cave den fight, which force-sets the flag).

**Stage 2 — the pick.** On a drop, ONE item is drawn by weight. A few tables
override with `pickCount` / `distinct` (Giant Boar, Khydhani — 2 distinct).

```
itemDropChance = gate × (weight / totalWeight)
tableQuality   = Σ(share × points)        // "EV on a drop"
perKill        = gate × tableQuality
```

**EV on a drop is the number that matters** for comparing monsters. Per-kill is
only meaningful for farmable enemies; bosses have their own budget because you
can't farm them.

### House weights

| Rarity | Weight |
|---|---|
| Common | 1.00 |
| Uncommon | 0.75 |
| Rare | 0.50 |
| Ancient Bones | 0.175 (≈4.5% of a roll, ≈2.2% per kill) |

Weighting barely moves the result — composition does. For a fixed set of
rarities, every sane weight shape lands within ~10%. To change a table's value
meaningfully, change the *rarity mix*, not the weights.

### Reference values

| Table | Shape | EV on a drop | Per kill |
|---|---|---|---|
| Crag Cat | C, U, U, R | 6.67 | 3.33 |
| Gnoll Hunter / Warrior / Pack Lord | T2, C→E | ~7.55 | ~3.78 |
| Gnoll Pack Lord (den, guaranteed) | — | 7.59 | 7.59 |
| Gnoll Fang of Yeenoghu (boss, flat) | — | — | 33.0 |
| Umber Hulk / Roper / Carrion Crawler | C, U, U, U, R + bones | **9.66** | 4.83 |

Chapter 3's monsters sit ~28% above Chapter 2's gnolls, which is the intended
step for a chapter deeper.

### Merged pools

`mergeLootEntries(...lists)` unions several tables, deduping by creator and
keeping the **highest** weight (not the sum) — appearing on three tables
shouldn't triple a card's odds. Used to build the Deep Gnome Merchants' rare
stock from the four Underdark hunting tables.

---

## 6. Adding a card or table — checklist

1. Pick tier + rarity → budget from §1.
2. Add the cost bonus if it takes a second card and doesn't Draw (§2).
3. Spend the budget with §3, applying the multipliers — then run the
   deck-abuse test in §4 on anything that draws, repeats or scales.
4. Sanity-check the slot: does the chapter already have three light armors and
   no ranged weapon? Coverage matters as much as the number — the classes are
   Warrior, Paladin, Rogue, Ranger, Wizard, Necromancer, Druid, and the slots
   are `simple` / `martial` / `martial_2h` / `ranged` / `wand` / `staff` /
   `light_armor` / `heavy_armor` / `clothing` / `relic` / `item` / `allies` /
   `ability`.
5. Wire it: `CARD_REGISTRY`, `CARD_ART_MAP`, `CARD_SFX_OVERRIDES`,
   `LOOT_TABLES` + `LOOT_TABLE_LABELS` + `LOOT_TABLE_NOTES`, `GATED_LOOT`, and
   the encounter's LOOT phase. See CLAUDE.md for the codex wiring rules.
6. Re-check the table's EV against §5 and note it in the table's comment.
