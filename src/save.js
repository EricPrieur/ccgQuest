/**
 * Save/Load system using localStorage.
 */

const SAVE_KEY = 'ccgquest_save';
const AUTO_SAVE_KEY = 'ccgquest_autosave';

export const MANUAL_SLOT_COUNT = 20;
export const AUTO_SLOT_COUNT = 10;

function slotKey(slot) {
  // Slot can be 'manual_1', 'manual_2', ..., 'auto_1', 'auto_2', ...
  // For backward compat: 'auto' === 'auto_1', plain numbers === manual
  if (slot === 'auto') return AUTO_SAVE_KEY;
  if (typeof slot === 'string' && slot.startsWith('auto_')) return `${AUTO_SAVE_KEY}_${slot.slice(5)}`;
  if (typeof slot === 'string' && slot.startsWith('manual_')) return `${SAVE_KEY}_${slot.slice(7)}`;
  return `${SAVE_KEY}_${slot}`;
}

// Cards normally serialize as bare ids, but cards carrying in-place
// modifications (e.g. an Obsidian Forge enchant) need their enchant
// list captured so loadFromSave can re-apply the effect. We expand
// only cards that actually have enchants — everything else stays as
// a string so existing saves load unchanged.
function serializeCard(c) {
  const hasEnchants = Array.isArray(c._enchants) && c._enchants.length > 0;
  const hasOffset = typeof c._tierOffset === 'number' && c._tierOffset > 0;
  if (!hasEnchants && !hasOffset) return c.id;
  // ccgQuest+ offset travels alongside enchants so a card looted at
  // tier 3 stays at tier 3 on reload, even if the run's current
  // offset has since dropped. Card identity is its (id + offset);
  // newly-looted cards in a +1 run carry offset=1, base cards stay
  // at offset 0 (the bare-id form, no wrapper).
  const out = { id: c.id };
  if (hasEnchants) out.enchants = c._enchants.slice();
  if (hasOffset) out.offset = c._tierOffset;
  return out;
}

export function saveGame(state, saveName = '') {
  const data = {
    version: 1,
    timestamp: Date.now(),
    saveName: saveName,
    selectedClass: state.selectedClass,
    gold: state.gold,
    // ccgQuest+ tier offsets — persisted so a reload keeps the run's
    // scaling intact (without these the loaded run silently reverts
    // to base, Take Aim+ drops the suffix, loot stops scaling, etc.).
    playerTierOffset: state.playerTierOffset || 0,
    monsterTierOffset: state.monsterTierOffset || 0,
    // Player deck (master deck card IDs)
    masterDeck: state.player.deck.masterDeck.map(serializeCard),
    // Persistent piles (survive between combats)
    hand: state.player.deck.hand.map(serializeCard),
    discardPile: state.player.deck.discardPile.map(serializeCard),
    // Map state
    mapId: state.currentMap.id,
    currentNodeId: state.currentMap.currentNodeId,
    visitedNodes: [...state.visitedNodes],
    // Player progression
    level: state.player.level || 1,
    perks: (state.player.perks || []).map(p => p.id),
    deckLimitBonuses: state.player.deckLimitBonuses || {},
    // ccgQuest+ level-up cap bonus. Game+ from save bumps the per-
    // category cap from +3 to +5; persisted so a save/reload mid-
    // Game+ keeps the extra headroom.
    deckLimitCapBonus: state.player.deckLimitCapBonus || 0,
    // Backpack
    backpack: (state.backpack || []).map(serializeCard),
    // Story flags that drive later encounters (kitchen choice gates the
    // prison barrel snatch chance; barrel-looted flag skips the post-combat
    // rummage phase).
    kitchenChoiceMade: state.kitchenChoiceMade || null,
    prisonBarrelLooted: !!state.prisonBarrelLooted,
    shownDeckTutorial: !!state.shownDeckTutorial,
    calmGroveRaenaJoined: !!state.calmGroveRaenaJoined,
    calmGroveBreadTaken: !!state.calmGroveBreadTaken,
    // Antiquity shop: monster cleared yet? + buyback ledger.
    antiquityShopCleared: !!state.antiquityShopCleared,
    // Obsidian Forge one-time flags + Volcano Heart sacrifice flag.
    // Drive the revisit-encounter selector + gray-out of the
    // forge_weapon / forge_rest / sacrifice_* choices on revisit.
    forgeUsed: !!state.forgeUsed,
    forgeRested: !!state.forgeRested,
    volcanoHeartSacrificed: !!state.volcanoHeartSacrificed,
    // Volcano's Blessing flavor — type + per-combat duration set at
    // sacrifice time. Re-applied at each volcano-area combat start.
    volcanoBuffType: state.volcanoBuffType || '',
    volcanoBuffTurns: typeof state.volcanoBuffTurns === 'number' ? state.volcanoBuffTurns : 0,
    // Cathedral Shrine one-time flags. Drive the revisit-encounter
    // selector + gray-out of pray_cathedral / cathedral_rest choices.
    cathedralPrayed: !!state.cathedralPrayed,
    cathedralRested: !!state.cathedralRested,
    // Cozy Spot fishing one-time success flag. Once latched, the
    // encounter swaps to the quieter "already fished here" variant.
    cozySpotFishingCaught: !!state.cozySpotFishingCaught,
    // Outpost resting tent one-time short rest. Once latched, the
    // tent encounter short-circuits in startNodeEncounter.
    outpostTentRested: !!state.outpostTentRested,
    // Storehouse one-time pickup. Latches when the player takes any
    // card off the supply pile; never re-armed.
    supplyPileTaken: !!state.supplyPileTaken,
    // Lake Giant Frog ambush placement — rolled lazily on the first
    // reef-stone arrival, holds up to 2 rock node ids. Persisted so a
    // save/load in the middle of crossing the reef doesn't re-roll
    // which stones are mined (the frogs would otherwise visibly
    // re-appear on cleared rocks). Cleared via setWellRested on rest.
    lakeFrogRocks: Array.isArray(state.lakeFrogRocks) ? state.lakeFrogRocks.slice() : null,
    // Kraken Spawn one-time boss. Latches forever (never cleared on
    // rest) so a save+reload after the kraken fight remembers the
    // post-kraken level-up was awarded.
    krakenDefeated: !!state.krakenDefeated,
    krakenLevelUpClaimed: !!state.krakenLevelUpClaimed,
    // Harpy nest — latches when the wreckage harpies (first fight or
    // revisit) are defeated. Cleared by respawnSouthernMonsters at
    // any explicit rest beat so walking back onto the cog refires
    // the short revisit encounter.
    harpiesDefeated: !!state.harpiesDefeated,
    // Tomb of the Ancestor + Dwarven Workshop + Map Room one-time
    // flags. Each drives a revisit-encounter selector AND a
    // mechanical buff (ancestor rest pool, workbench armor enchant,
    // map knowledge -2% encounter step). Without persisting these,
    // a reload lost the Map Knowledge buff + reset the once-per-
    // save heal/forge gates.
    ancestorSpiritsDefeated: !!state.ancestorSpiritsDefeated,
    ancestorRested: !!state.ancestorRested,
    workbenchRested: !!state.workbenchRested,
    workbenchUsed: !!state.workbenchUsed,
    mapTableCopied: !!state.mapTableCopied,
    mapTableRested: !!state.mapTableRested,
    caveEntranceDoubledBack: !!state.caveEntranceDoubledBack,
    corridorEntranceDoubledBack: !!state.corridorEntranceDoubledBack,
    backwardRefoggedOnce: state.backwardRefoggedOnce instanceof Set
      ? Array.from(state.backwardRefoggedOnce)
      : (Array.isArray(state.backwardRefoggedOnce) ? state.backwardRefoggedOnce.slice() : []),
    // Persistent buffs (Old God's Blessing, Volcano's Blessing) — these
    // live on the character sheet and survive between combats. Previously
    // wiped on every load because the load path rebuilt Character from
    // scratch.
    persistentBuffs: (state.player && Array.isArray(state.player.persistentBuffs))
      ? state.player.persistentBuffs.map(b => ({
          id: b.id,
          name: b.name,
          description: b.description,
          imageId: b.imageId,
          effectType: b.effectType,
          effectValue: b.effectValue,
          trigger: b.trigger,
          condition: b.condition,
          // Provision metadata (Beverage / Meal slot tag, per-combat
          // turn cap, multi-effect array). Without these the underscore
          // fields are stripped on autosave and the buff escapes the
          // rest-clear filter (clearActiveProvisions matches on
          // _provisionSlot). Result: a Chicken Leg buff that survives
          // every rest until end of run.
          _provisionSlot: b._provisionSlot || null,
          _provisionTurnsPerCombat: b._provisionTurnsPerCombat || 0,
          _provisionEffects: b._provisionEffects || null,
          _swimDraw: b._swimDraw || 0,
          _onDiscardDraw: b._onDiscardDraw || 0,
        }))
      : [],
    soldCardsHistory: Array.isArray(state.soldCardsHistory) ? state.soldCardsHistory.slice() : [],
    // Per-run Mimic Tongue purchase flag — gates Grimbold's fresh-
    // stock Tongue slot. Wiped on Game+ launch by resetStoryFlags.
    mimicTongueAcquiredThisRun: !!state.mimicTongueAcquiredThisRun,
    // Filibaf Forest maze state — drives the post-clear teleport pair
    // and the in-loop counters when saving mid-maze.
    forestCleared: !!state.forestCleared,
    forestLoopLevel: typeof state.forestLoopLevel === 'number' ? state.forestLoopLevel : 1,
    forestCorrectPath: state.forestCorrectPath === 'right' ? 'right' : 'left',
    // Tharnag siege gauntlet — progress is reset on bail (handled at
    // arrive-time in main.js), siegeComplete latches on for good once
    // the third line falls.
    siegeProgress: typeof state.siegeProgress === 'number' ? state.siegeProgress : 0,
    siegeComplete: !!state.siegeComplete,
    // Tharnag interior — throne audience gates the side-exit, the
    // quarters rest unlocks it, and Valdrisa joins on the first
    // post-rest exit through the hallway.
    throneAudienceComplete: !!state.throneAudienceComplete,
    quartersRested: !!state.quartersRested,
    dragonSlain: !!state.dragonSlain,
    staircaseTopDragonDialogSeen: !!state.staircaseTopDragonDialogSeen,
    mithrilRemediesVisited: !!state.mithrilRemediesVisited,
    templeMoradinPrayed: !!state.templeMoradinPrayed,
    dwarvenTavernFreebieGiven: !!state.dwarvenTavernFreebieGiven,
    dragonEggDamage: typeof state.dragonEggDamage === 'number' ? state.dragonEggDamage : 0,
    heroesOfQualibaf: !!state.heroesOfQualibaf,
    volcanoChoiceCompleted: !!state.volcanoChoiceCompleted,
    chapter8SlybladeSeen: !!state.chapter8SlybladeSeen,
    valdrisaJoined: !!state.valdrisaJoined,
    upperStairsReturnSeen: !!state.upperStairsReturnSeen,
    tharnagExitSeen: !!state.tharnagExitSeen,
    // Globally completed encounter ids — persisted as a flat list so
    // a one-shot encounter (north_crossroad, etc.) stays done after a
    // cross-map hop, even when the destination map's cache was wiped
    // by a load. arriveAtNode forces node.isDone for any node whose
    // encounterId is in this set.
    completedEncounters: state.completedEncounters instanceof Set
      ? Array.from(state.completedEncounters)
      : (Array.isArray(state.completedEncounters) ? state.completedEncounters.slice() : []),
    // Obsidian Wastes labyrinth — seed + state so the same layout is
    // regenerated on load.
    labyrinthGenerated: !!state.labyrinthGenerated,
    labyrinthSeed: typeof state.labyrinthSeed === 'number' ? state.labyrinthSeed : 0,
    labyrinthEncounterChance: typeof state.labyrinthEncounterChance === 'number' ? state.labyrinthEncounterChance : 0.2,
    labyrinthComplete: !!state.labyrinthComplete,
    // Well Rested snapshot: the deck size at the time of the last
    // qualifying rest / level-up rebalance. Without this in the save
    // payload the city gates re-locked the player after a reload even
    // when they were minutes past an inn rest.
    wellRestedDeckSize: typeof state.wellRestedDeckSize === 'number' ? state.wellRestedDeckSize : -1,
    // Node states for the CURRENT map (kept for back-compat with old
    // loaders; the same data also lives in mapCacheStates below).
    nodeStates: {},
    // Per-map node states for every map the player has visited this
    // run. Without this, loading at any cross-map node (e.g. forge)
    // wipes progress on the maps that aren't currently loaded
    // (lower_caverns / lava_chamber / obsidian_tunnels …) — they get
    // re-created fresh by MAP_CREATORS the next time the player
    // teleports back. mapCacheStates restores them in place.
    mapCacheStates: {},
  };

  // Helper: serialize one map's nodes the same shape as the legacy
  // top-level nodeStates blob. Used for both currentMap and every
  // cached map.
  const serializeMapNodes = (map) => {
    const out = {};
    for (const [id, node] of Object.entries(map.nodes)) {
      out[id] = {
        isDone: node.isDone,
        isLocked: node.isLocked,
        canRevisit: node.canRevisit,
        // Persist the hidden labels so unlocking via a story flag
        // (north_pass clearing "???" after the throne audience, etc.)
        // survives a load. Only carries through when the node was
        // unlocked at save time and its label was cleared.
        hiddenName: node.hiddenName || '',
        hiddenDescription: node.hiddenDescription || '',
        exhaustedChoices: Array.isArray(node.exhaustedChoices) ? node.exhaustedChoices.slice() : [],
      };
    }
    return out;
  };

  data.nodeStates = serializeMapNodes(state.currentMap);
  data.mapCacheStates[state.currentMap.id] = {
    nodeStates: data.nodeStates,
    currentNodeId: state.currentMap.currentNodeId,
  };
  if (state.mapCache && typeof state.mapCache === 'object') {
    for (const [mid, m] of Object.entries(state.mapCache)) {
      if (!m || mid === state.currentMap.id) continue;
      data.mapCacheStates[mid] = {
        nodeStates: serializeMapNodes(m),
        currentNodeId: m.currentNodeId,
      };
    }
  }

  return data;
}

export function saveToSlot(state, slot = 'manual_1', saveName = '') {
  const data = saveGame(state, saveName);
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

// Save to next available auto slot, rolling over when full
export function saveToAutoSlot(state) {
  // Find oldest auto slot to overwrite, or first empty
  let oldestSlot = 'auto_1';
  let oldestTime = Infinity;
  let firstEmpty = null;
  for (let i = 1; i <= AUTO_SLOT_COUNT; i++) {
    const slotName = `auto_${i}`;
    if (!hasSave(slotName)) {
      firstEmpty = slotName;
      break;
    }
    const info = getSaveInfo(slotName);
    if (info && info.timestamp < oldestTime) {
      oldestTime = info.timestamp;
      oldestSlot = slotName;
    }
  }
  return saveToSlot(state, firstEmpty || oldestSlot);
}

export function loadFromSlot(slot = 'manual_1') {
  try {
    const raw = localStorage.getItem(slotKey(slot));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
}

export function hasSave(slot = 'manual_1') {
  return localStorage.getItem(slotKey(slot)) !== null;
}

export function deleteSave(slot = 'manual_1') {
  localStorage.removeItem(slotKey(slot));
}

export function getSaveInfo(slot = 'manual_1') {
  const data = loadFromSlot(slot);
  if (!data) return null;
  return {
    class: data.selectedClass,
    gold: data.gold,
    deckSize: data.masterDeck.length,
    node: data.currentNodeId,
    level: data.level || 1,
    timestamp: data.timestamp,
    date: new Date(data.timestamp).toLocaleString(),
    saveName: data.saveName || '',
    consumedForGamePlus: !!data.consumedForGamePlus,
  };
}

// Stamp a save slot as "already used to launch a ccgQuest+ run".
// The Game+ picker filters consumed slots out; the player must
// finish another Part 1 (killing the dragon overwrites the
// part1_complete_<class> slot with a fresh data blob, clearing
// the flag) before they can launch another Game+ run from the
// same class.
export function markSlotConsumedForGamePlus(slot) {
  const data = loadFromSlot(slot);
  if (!data) return false;
  data.consumedForGamePlus = true;
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Mark-consumed failed:', e);
    return false;
  }
}

// Check if any save exists (manual or auto)
export function hasAnySave() {
  for (let i = 1; i <= MANUAL_SLOT_COUNT; i++) {
    if (hasSave(`manual_${i}`)) return true;
  }
  for (let i = 1; i <= AUTO_SLOT_COUNT; i++) {
    if (hasSave(`auto_${i}`)) return true;
  }
  return false;
}

// True when the player has ever finished Part 1 — checked via the
// class-keyed end-of-Part-1 snapshot slots (`part1_complete_<class>`).
// One slot is written per class on the after-credits autosave so a
// player who has cleared the dragon on ANY class qualifies for the
// ccgQuest+ unlock.
export function hasPart1CompleteSave() {
  const classes = ['paladin', 'ranger', 'wizard', 'rogue', 'warrior', 'druid'];
  for (const cls of classes) {
    if (hasSave(`part1_complete_${cls}`)) return true;
  }
  return false;
}
