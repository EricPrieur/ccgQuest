/**
 * Map system - nodes connected by paths, each with encounters.
 */

export class MapNode {
  constructor({
    id, name, description, encounterId = '',
    connections = [], position = [0, 0], mapArea = '',
    isLocked = false, canRevisit = false, unlocks = [],
    hiddenName = '', hiddenDescription = '',
    passthroughTo = '', repeatableUntil = '',
    wip = false, discoverable = false,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.encounterId = encounterId;
    this.connections = connections;
    this.position = position;
    this.mapArea = mapArea;
    this.isLocked = isLocked;
    this.isDone = false;
    this.canRevisit = canRevisit;
    this.unlocks = unlocks;
    this.hiddenName = hiddenName;
    this.hiddenDescription = hiddenDescription;
    // When the node is done and clicked, auto-move to this node id instead
    // of retriggering the encounter (e.g. the kitchen shunts back to the
    // sewer passage once you've resolved it).
    this.passthroughTo = passthroughTo;
    // When set, the encounter repeats while canRevisit is true UNTIL the
    // node id named here is isDone — at that point this node stops
    // refiring its encounter (e.g. Sentinel Patrol stops once the Baron
    // is killed). Combined with canRevisit:true.
    this.repeatableUntil = repeatableUntil;
    // Keys of encounter choices that have been permanently exhausted on this node.
    // Used for repeat-visit encounters (Abandoned Camp: one rest, one search).
    this.exhaustedChoices = [];
    // wip: marks a node as "work in progress" — invisible + unreachable
    // unless debug mode is on. Render layer + click router gate on the
    // debugMode flag in main.js. Lets us push half-built content to main
    // without leaking it to players.
    this.wip = wip;
    // discoverable: hides the node from the map until the player is
    // within 1 hop (accessible from the current node) — even on
    // outdoor maps where everything is normally visible. Once visited,
    // the node stays visible forever. Combine with hiddenName: '???'
    // so the close-but-unexplored render reads as a mystery dot.
    this.discoverable = discoverable;
  }

  get displayName() {
    if (!this.isDone && this.hiddenName) return this.hiddenName;
    return this.name;
  }

  get displayDescription() {
    if (!this.isDone && this.hiddenDescription) return this.hiddenDescription;
    return this.description;
  }
}

export class GameMap {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.nodes = {};
    this.currentNodeId = '';
    this.mapImages = {}; // areaId -> image path
  }

  addNode(node) {
    this.nodes[node.id] = node;
  }

  getNode(id) {
    return this.nodes[id] || null;
  }

  getCurrentNode() {
    return this.getNode(this.currentNodeId);
  }

  getAccessibleNodes() {
    const current = this.getCurrentNode();
    if (!current) return [];
    return current.connections
      .map(id => this.getNode(id))
      .filter(n => n && !n.isLocked);
  }

  moveTo(nodeId) {
    const accessible = this.getAccessibleNodes();
    const node = accessible.find(n => n.id === nodeId);
    if (!node) return false;
    this.currentNodeId = nodeId;
    return true;
  }

  completeCurrentNode() {
    const node = this.getCurrentNode();
    if (!node) return;
    node.isDone = true;
    for (const unlockId of node.unlocks) {
      const target = this.getNode(unlockId);
      if (target) target.isLocked = false;
    }
  }
}

// === Prison Cell Map ===
export function createPrisonCellMap() {
  const map = new GameMap('prison_cell', 'Prison Cell');
  map.mapImages = {
    prison_cell: 'Maps/PrisonCellMap.jpg',
    sewers: 'Maps/SewerMap.jpg',
    upper_prison: 'Maps/KoboldCastlePrisonMap.jpg',
  };

  const nodes = [
    { id: 'bed', name: 'Bed', description: 'A filthy straw mattress where you woke up. The rats are gone now.', encounterId: 'giant_rat', connections: ['door', 'bone_pile'], position: [720, 280], mapArea: 'prison_cell' },
    { id: 'door', name: 'The Door', description: 'A heavy iron door. Locked tight.', encounterId: 'locked_door', connections: ['bed'], position: [512, 160], mapArea: 'prison_cell', canRevisit: true },
    { id: 'bone_pile', name: 'Bone Pile', description: 'A pile of old bones in the corner.', encounterId: 'bone_pile', connections: ['bed', 'crack'], position: [300, 720], mapArea: 'prison_cell', unlocks: ['crack'] },
    { id: 'crack', name: 'The Crack', description: 'A narrow crack in the floor.', encounterId: 'crack', connections: ['bone_pile'], position: [180, 580], mapArea: 'prison_cell', isLocked: true, canRevisit: true },
    { id: 'splash_point', name: 'Splash Point', description: 'Where you fell into the foul sewer water.', encounterId: 'splash_point', connections: ['dead_end', 'sewer_junction'], position: [728, 110], mapArea: 'sewers', isLocked: true, unlocks: ['dead_end', 'sewer_junction'] },
    { id: 'dead_end', name: 'Dead End', description: 'A sturdy metal gate blocks the way.', encounterId: 'dead_end', connections: ['splash_point', 'tight_opening'], position: [1050, 250], mapArea: 'sewers', isLocked: true, unlocks: ['tight_opening'], hiddenName: 'Deeper Sewer', hiddenDescription: 'The tunnel slopes upward into darkness.' },
    { id: 'tight_opening', name: 'Tight Opening', description: 'A narrow gap carved through rock by slime acid.', encounterId: 'tight_opening', connections: ['dead_end', 'lost_shrine'], position: [1220, 380], mapArea: 'sewers', isLocked: true, canRevisit: true, hiddenName: 'Deeper Sewer', hiddenDescription: 'The tunnel continues into darkness.' },
    // Lost Shrine — single-shot. The encounter grants a class-specific
    // ability card via the ABILITY_SELECT flow; re-firing would let the
    // player stack extra ability picks. canRevisit removed accordingly.
    { id: 'lost_shrine', name: 'Lost Shrine', description: 'A forgotten shrine glowing with faint golden light.', encounterId: 'lost_shrine', connections: ['tight_opening'], position: [1320, 220], mapArea: 'sewers', isLocked: true, hiddenName: '???', hiddenDescription: 'Something glows faintly beyond the gap.' },
    { id: 'sewer_junction', name: 'Sewer Junction', description: 'A junction where passages branch.', encounterId: 'sewer_junction', connections: ['splash_point', 'deeper_sewer', 'less_deep_sewer'], position: [500, 420], mapArea: 'sewers', isLocked: true, unlocks: ['deeper_sewer', 'less_deep_sewer'], hiddenName: 'Deeper Sewer', hiddenDescription: 'The tunnel descends deeper into darkness.' },
    { id: 'deeper_sewer', name: 'Abandoned Camp', description: 'An old campsite left behind by adventurers.', encounterId: 'abandoned_camp', connections: ['sewer_junction'], position: [728, 420], mapArea: 'sewers', isLocked: true, canRevisit: true, hiddenName: 'Dark Passage', hiddenDescription: 'A passage descending into total darkness.' },
    // Upward Passage: dialog only fires the first time. After that, the node
    // is a silent move-through and `passthroughTo: 'kitchen'` means clicking
    // it while already standing on it shortcuts straight up to the Kitchen.
    { id: 'less_deep_sewer', name: 'Upward Passage', description: 'The tunnel slopes upward. Light from above.', encounterId: 'upward_passage', connections: ['sewer_junction', 'kitchen'], position: [200, 420], mapArea: 'sewers', isLocked: true, canRevisit: false, passthroughTo: 'kitchen', hiddenName: 'Upward Passage', hiddenDescription: 'A passage that seems to lead upward.' },
    // Kitchen: one-shot encounter. Once the player has made their choice
    // (attack / talk / sneak), the node is "done" but still clickable — it
    // auto-routes the player back down to the sewer via `passthroughTo`.
    { id: 'kitchen', name: 'Kitchen', description: 'A warm kitchen where a reptilian cook works.', encounterId: 'kitchen', connections: ['less_deep_sewer', 'prison_entrance'], position: [180, 350], mapArea: 'upper_prison', isLocked: true, canRevisit: false, passthroughTo: 'less_deep_sewer', hiddenName: '???', hiddenDescription: 'You sense warmth and the smell of cooking from above.' },
    // Prison Entrance: one-shot (no revisit) — the warden is defeated once.
    { id: 'prison_entrance', name: 'Prison Entrance', description: 'The main entrance to the prison complex.', encounterId: 'prison_entrance', connections: ['kitchen', 'leave_prison', 'prison_wing'], position: [580, 350], mapArea: 'upper_prison', isLocked: true, canRevisit: false, unlocks: ['leave_prison', 'prison_wing'], hiddenName: 'Passage Beyond', hiddenDescription: 'A corridor leading somewhere beyond the kitchen.' },
    { id: 'leave_prison', name: 'Leave the Prison', description: 'A heavy door leading outside. Daylight through the gap.', encounterId: 'leave_prison', connections: ['prison_entrance'], position: [550, 150], mapArea: 'upper_prison', isLocked: true, canRevisit: true, hiddenName: 'Heavy Door', hiddenDescription: 'A heavy door. It seems important.' },
    // Prison Wing: one-shot — the investigate choice unlocks corner_cell and
    // the node is done. Clicking it again moves silently.
    { id: 'prison_wing', name: 'Prison Wing', description: 'A corridor lined with prison cells.', encounterId: 'prison_wing', connections: ['prison_entrance', 'corner_cell'], position: [1000, 450], mapArea: 'upper_prison', isLocked: true, canRevisit: false, hiddenName: 'Locked Door', hiddenDescription: 'A locked iron door. You hear sounds from beyond.' },
    // Corner Cell: one-shot — fight the Dire Rat, get Thorb card. Once done
    // it's just a silent node; leave_prison reads `corner_cell.isDone` as the
    // thorb-rescued flag.
    { id: 'corner_cell', name: 'Corner Cell', description: 'A cell at the far corner. Someone is fighting inside.', encounterId: 'corner_cell', connections: ['prison_wing'], position: [1100, 220], mapArea: 'upper_prison', isLocked: true, canRevisit: false, hiddenName: '???', hiddenDescription: 'Something is at the end of the corridor.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'bed';
  return map;
}

// === Mountain Path Map ===
export function createMountainPathMap() {
  const map = new GameMap('mountain_path', 'Mountain Path');
  map.mapImages = {
    mountain_path: 'Maps/Chapter2MountainPathMap.jpg',
  };

  const nodes = [
    { id: 'mountain_camp', name: 'Mountain Camp', description: 'A sheltered campsite on the mountainside.', encounterId: 'mountain_camp', connections: ['mountain_pass'], position: [512, 150], mapArea: 'mountain_path', unlocks: ['mountain_pass'] },
    { id: 'mountain_pass', name: 'Mountain Pass', description: 'A narrow pass through the peaks.', encounterId: 'mountain_pass', connections: ['mountain_camp', 'calm_stream'], unlocks: ['calm_stream'], position: [780, 200], mapArea: 'mountain_path', isLocked: true, hiddenName: '???', hiddenDescription: 'A path deeper into the mountains.' },
    { id: 'calm_stream', name: 'Calm Stream', description: 'A peaceful mountain stream.', encounterId: 'calm_stream', connections: ['mountain_pass', 'general_zhost'], unlocks: ['general_zhost'], position: [700, 310], mapArea: 'mountain_path', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Something lies further down the mountain path.' },
    { id: 'general_zhost', name: "General Zhost's Army", description: 'A Kobold army camps near the river crossing.', encounterId: 'general_zhost', connections: ['calm_stream', 'calm_grove'], unlocks: ['calm_grove'], position: [780, 500], mapArea: 'mountain_path', isLocked: true, hiddenName: '???', hiddenDescription: 'A wide river crossing, somewhere ahead.' },
    { id: 'calm_grove', name: 'Calm Grove', description: 'A hidden grove where Raena and the surviving elves rest.', encounterId: 'calm_grove', connections: ['general_zhost', 'to_the_plains'], unlocks: ['to_the_plains'], position: [400, 450], mapArea: 'mountain_path', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Dense forest to the west.' },
    { id: 'to_the_plains', name: 'To the Plains', description: 'The edge of the forest, overlooking the Plains of No Hope.', encounterId: 'to_the_plains', connections: ['calm_grove'], position: [200, 450], mapArea: 'mountain_path', isLocked: true, hiddenName: '???', hiddenDescription: 'The forest thins to the southwest.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'mountain_camp';
  return map;
}

// === Plains Map ===
export function createPlainsMap() {
  const map = new GameMap('plains', 'The Plains of No Hope');
  map.mapImages = {
    plains: 'Maps/PlainsOfNoHopeMap.jpg',
  };

  const nodes = [
    { id: 'plains_of_no_hope', name: 'Plains of No Hope', description: 'A desolate expanse stretching to the horizon.', encounterId: '', connections: ['bone_valley'], position: [195, 95], mapArea: 'plains', canRevisit: true },
    { id: 'bone_valley', name: 'Bone Valley', description: 'A valley littered with ancient bones.', encounterId: 'bone_valley', connections: ['plains_of_no_hope', 'wolf_blizzard'], position: [300, 350], mapArea: 'plains', unlocks: ['wolf_blizzard'], hiddenName: '???' },
    { id: 'wolf_blizzard', name: 'Wolf Blizzard', description: 'A blinding blizzard howls through the pass.', encounterId: 'wolf_blizzard', connections: ['bone_valley'], position: [530, 520], mapArea: 'plains', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'plains_of_no_hope';
  return map;
}

// === Cave Map ===
export function createCaveMap() {
  const map = new GameMap('cave', 'The Cave');
  map.mapImages = {
    cave: 'Maps/UndergroundCaveMap.jpg',
  };

  const nodes = [
    { id: 'cave_entrance', name: 'Cave Entrance', description: 'The mouth of a dark underground cave.', encounterId: 'cave_entrance', connections: ['cave_ledge'], position: [750, 920], mapArea: 'cave', unlocks: ['cave_ledge'] },
    { id: 'cave_ledge', name: 'Cave Ledge', description: 'A narrow ledge above the cavern floor.', encounterId: 'cave_ledge', connections: ['cave_entrance', 'cave_river_landing'], position: [610, 910], mapArea: 'cave', isLocked: true, unlocks: ['cave_river_landing'], hiddenName: '???' },
    { id: 'cave_river_landing', name: 'Cave River Landing', description: 'A rocky landing beside an underground river.', encounterId: 'cave_river_landing', connections: ['cave_ledge', 'cave_river_path'], position: [490, 800], mapArea: 'cave', isLocked: true, unlocks: ['cave_river_path'], hiddenName: '???' },
    { id: 'cave_river_path', name: 'Cave River Path', description: 'A path along the underground river.', encounterId: 'underground_river', connections: ['cave_river_landing'], position: [270, 580], mapArea: 'cave', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'cave_entrance';
  return map;
}

// === Ruins Basin Map ===
export function createRuinsBasinMap() {
  const map = new GameMap('ruins_basin', 'The Ruins Basin');
  map.mapImages = {
    ruins_basin: 'Maps/EndofRiverBasinStartOfRuins.jpg',
    flood_temple: 'Maps/FloodTemple.jpg',
    flooded_altar: 'Maps/SacredAreaFloodedTemple.jpg',
    temple_exit: 'Maps/TempleTowardTheExit.jpg',
    arriving_city: 'Maps/ArrivingAtTheCity.jpg',
    flood_temple_boss_wing: 'Maps/FloodTempleBossWing.jpg',
    qualibaf: 'Maps/QualibafMap.jpg',
  };

  const nodes = [
    // After the first dive the player can hop straight back across the
    // basin to the temple entrance; the pool/sentinel/exit chain stays
    // walkable for anyone who wants the long way around.
    { id: 'piranha_pool', name: 'Piranha Pool', description: 'Dark water churns with hungry fish.', encounterId: 'piranha_pool', connections: ['pool_edge'], position: [512, 500], mapArea: 'ruins_basin', passthroughTo: 'flooded_entrance' },
    { id: 'pool_edge', name: 'Pool Edge', description: 'The edge of the pool, a sentinel watches.', encounterId: 'sahuagin_sentinel', connections: ['pool_south'], position: [760, 380], mapArea: 'ruins_basin' },
    { id: 'pool_south', name: 'Pool South', description: 'The southern edge of the basin.', encounterId: 'pool_south', connections: ['pool_edge', 'pool_exit'], position: [798, 686], mapArea: 'ruins_basin', unlocks: ['pool_exit'] },
    { id: 'pool_exit', name: "Pool's Exit", description: 'A patrolling sentinel blocks the corridor.', encounterId: 'pool_exit', connections: ['pool_south', 'flooded_entrance'], position: [520, 910], mapArea: 'ruins_basin', isLocked: true, unlocks: ['flooded_entrance'], passthroughTo: 'flooded_entrance' },
    // Flooded entrance hops back to Pool's Exit so the cross-area pair
    // is symmetric (pool_exit ↔ flooded_entrance). Earlier this hopped
    // to piranha_pool to "skip the cleared corridor", but pool_exit's
    // own forward-teleport chained into that backward-teleport and
    // dumped the player back at piranha_pool right after the sentinel
    // fight — fixed by repointing here and the suppressFloodPair guard
    // in arriveAtNode is no longer needed (kept for safety).
    { id: 'flooded_entrance', name: 'Flooded Entrance', description: 'The entrance to a flooded temple.', encounterId: '', connections: ['pool_exit', 'temple_right', 'temple_left', 'flooded_atrium'], position: [512, 120], mapArea: 'flood_temple', canRevisit: true, passthroughTo: 'pool_exit' },
    { id: 'temple_right', name: 'Conservatory Wing', description: 'A well-conserved area of the temple. Some light shows through cracks in the ceiling.', encounterId: 'conservatory_wing', connections: ['flooded_entrance', 'temple_depths', 'altar_entrance', 'flooded_atrium'], position: [902, 492], mapArea: 'flood_temple', passthroughTo: 'altar_entrance', unlocks: ['altar_entrance'] },
    // Atrium: new mid-room node not in the PY map. A direct link from
    // the flooded entrance straight down to the temple depths so the
    // player has a center-line path in addition to the flanks. Also
    // bridges the two side-wings (Conservatory + Dark Corridor) so
    // players can cut across the room without backtracking.
    { id: 'flooded_atrium', name: 'Flooded Atrium', description: 'A vast central chamber, half-submerged.', encounterId: '', connections: ['flooded_entrance', 'temple_depths', 'temple_left', 'temple_right'], position: [512, 500], mapArea: 'flood_temple', canRevisit: true },
    { id: 'temple_depths', name: 'Flooded Passage', description: 'Deep within the flooded temple.', encounterId: 'flooded_passage', connections: ['temple_right', 'temple_left', 'passage_entrance', 'flooded_atrium'], position: [512, 883], mapArea: 'flood_temple', passthroughTo: 'passage_entrance' },
    { id: 'temple_left', name: 'Dark Corridor', description: 'A wide corridor that leads deeper into the temple. This area looks dangerous.', encounterId: 'dark_corridor', connections: ['flooded_entrance', 'temple_depths', 'boss_wing_sentinel', 'flooded_atrium'], position: [160, 450], mapArea: 'flood_temple', passthroughTo: 'boss_wing_sentinel' },
    // --- Flood Temple Boss Wing (revealed by Dark Corridor descend) ---
    // Mirrors PY: same map, separate map_area. PY has three nodes
    // (sentinel sighting / sentinel combat / priest combat); JS port
    // wires the sighting node here and stubs the deeper rooms as
    // simple passages until the dedicated combats land.
    // Deeper Corridor — no encounter; the dark_corridor descend
    // teleports here directly. Acts as a bidirectional teleport
    // pair with temple_left thereafter. Reaching it unlocks the
    // Sentinel Patrol so the player can press deeper.
    { id: 'boss_wing_sentinel', name: 'Deeper Corridor', description: 'A flooded corridor descending into the dark wing of the temple.', encounterId: '', connections: ['boss_wing_entrance', 'temple_left'], unlocks: ['boss_wing_entrance'], position: [502, 960], mapArea: 'flood_temple_boss_wing', isLocked: true, canRevisit: true, passthroughTo: 'temple_left' },
    { id: 'boss_wing_entrance', name: 'Sentinel Patrol', description: 'A Sahuagin sentinel blocks the way deeper into the temple wing.', encounterId: 'boss_wing_sentinel_combat', connections: ['boss_wing_sentinel', 'boss_wing_priest'], unlocks: ['boss_wing_priest'], position: [312, 720], mapArea: 'flood_temple_boss_wing', isLocked: true, hiddenName: 'Deeper Corridor', canRevisit: true, repeatableUntil: 'boss_wing_priest' },
    { id: 'boss_wing_priest', name: 'Flooded Chamber', description: 'A grand chamber at the heart of the temple wing. Dark power radiates from within.', encounterId: 'boss_wing_priest_combat', connections: ['boss_wing_entrance'], position: [502, 310], mapArea: 'flood_temple_boss_wing', isLocked: true, hiddenName: '???' },
    // --- Flooded Altar (revealed via Conservatory Wing) ---
    { id: 'altar_entrance', name: 'Sacred Chamber', description: 'A vast chamber. The air is thick with brine and decay.', encounterId: '', connections: ['temple_right', 'flooded_altar'], unlocks: ['flooded_altar'], position: [200, 500], mapArea: 'flooded_altar', isLocked: true, canRevisit: true, passthroughTo: 'temple_right' },
    { id: 'flooded_altar', name: 'Flooded Altar', description: 'A sacred area within the temple. Dark shapes move beneath the water.', encounterId: 'flooded_altar', connections: ['altar_entrance', 'old_god_statue'], unlocks: ['old_god_statue'], position: [750, 500], mapArea: 'flooded_altar', isLocked: true },
    // Old God Statue — single-shot. The prayer encounter grants the
    // permanent Old God's Blessing buff + a Sahuagin Eye relic on
    // completion; re-firing the dialog would let the player double up.
    { id: 'old_god_statue', name: 'Statue of an Old God', description: 'An ancient statue stands half-submerged, its hands outstretched.', encounterId: 'old_god_statue', connections: ['flooded_altar'], position: [890, 512], mapArea: 'flooded_altar', isLocked: true },
    { id: 'passage_entrance', name: 'Passage Entrance', description: 'The entrance to a passage beyond the temple.', encounterId: '', connections: ['temple_depths', 'passage_ambush'], position: [512, 150], mapArea: 'temple_exit', canRevisit: true, passthroughTo: 'temple_depths' },
    // Passage Ambush — repeatable combat. The sahuagin keep prowling
    // this corridor regardless of how many fall, so each return trip
    // rolls a fresh fight.
    { id: 'passage_ambush', name: 'Passage Ambush', description: 'A shadowed gallery.', encounterId: 'passage_ambush', connections: ['passage_entrance', 'cave_exit'], position: [512, 500], mapArea: 'temple_exit', hiddenName: 'Shadowed Gallery', canRevisit: true },
    // Cave Exit is a one-shot narrative beat that ends with the
    // party stepping out onto the mountain overlook (different
    // map_area). passthroughTo makes a click after first completion
    // auto-route to the overlook so the player doesn't have to
    // manually click out of the cave.
    { id: 'cave_exit', name: 'Cave Exit', description: 'A passage leading out.', encounterId: 'cave_exit', connections: ['passage_ambush', 'mountain_overlook'], position: [512, 850], mapArea: 'temple_exit', hiddenName: 'Passage', passthroughTo: 'mountain_overlook' },
    { id: 'mountain_overlook', name: 'Mountain Overlook', description: 'A vista overlooking the land below.', encounterId: '', connections: ['cave_exit', 'river_crossing'], position: [212, 670], mapArea: 'arriving_city', canRevisit: true, passthroughTo: 'cave_exit' },
    { id: 'river_crossing', name: 'River Crossing', description: 'A crossing over the river.', encounterId: 'river_crossing', connections: ['mountain_overlook', 'east_side'], position: [322, 510], mapArea: 'arriving_city' },
    // East Side — waypoint between river_crossing and south_gate. With
    // debug OFF the encounter no-ops (silent passthrough). With debug ON
    // the sign dialog fires, pointing to South Outpost down the new
    // river_path branch. River Path + South Trail are wip:true so they
    // only surface when debug is on.
    // East Side, River Path, South Trail — one-shot encounters: the
    // sign dialog and the river-walk dialog each fire on first arrival
    // only (no canRevisit, so subsequent walk-throughs stay silent
    // while the node remains navigable).
    { id: 'east_side', name: 'East Side', description: 'A path running east of the river.', encounterId: 'east_side', connections: ['river_crossing', 'south_gate', 'river_path'], position: [490, 380], mapArea: 'arriving_city' },
    { id: 'river_path', name: 'River Path', description: 'A trail winding south along the river bank.', encounterId: '', connections: ['east_side', 'south_trail'], position: [459, 630], mapArea: 'arriving_city', canRevisit: true },
    // South Trail — last node on this map before the cross-map jump to
    // South of Qualibaf. Its encounter plays the "follow the river south"
    // dialog (with a tongue-in-cheek meta beat from Raena/Thorb pre-
    // dragon), then teleports to the south_of_qualibaf map entry.
    { id: 'south_trail', name: 'South Trail', description: 'A trail leading east along the river toward the southern outpost.', encounterId: 'south_trail', connections: ['river_path'], position: [870, 810], mapArea: 'arriving_city' },
    { id: 'south_gate', name: 'South Gate', description: 'The southern gate of Qualibaf.', encounterId: 'south_gate', connections: ['east_side', 'city_south_gate'], position: [662, 260], mapArea: 'arriving_city', passthroughTo: 'city_south_gate' },
    { id: 'city_south_gate', name: 'City South Gate', description: 'Inside the southern gate of Qualibaf.', encounterId: '', connections: ['city_square', 'weaponsmith', 'armorsmith', 'general_store', 'inn', 'church', 'guild_hall', 'antiquity_shop', 'arcane_emporium', 'city_north_gate'], position: [512, 900], mapArea: 'qualibaf', canRevisit: true, passthroughTo: 'south_gate' },
    { id: 'city_square', name: 'City Square', description: 'The central square of Qualibaf.', encounterId: 'city_square', connections: ['city_south_gate', 'weaponsmith', 'armorsmith', 'general_store', 'inn', 'church', 'guild_hall', 'antiquity_shop', 'arcane_emporium', 'city_north_gate'], position: [512, 500], mapArea: 'qualibaf', canRevisit: true },
    { id: 'weaponsmith', name: 'Weaponsmith', description: 'A weaponsmith shop.', encounterId: 'weaponsmith', connections: ['city_south_gate', 'city_square'], position: [340, 390], mapArea: 'qualibaf', canRevisit: true },
    { id: 'armorsmith', name: 'Armorsmith', description: 'An armorsmith shop.', encounterId: 'armorsmith', connections: ['city_south_gate', 'city_square'], position: [324, 470], mapArea: 'qualibaf', canRevisit: true },
    { id: 'general_store', name: 'General Store', description: 'A general goods store.', encounterId: 'general_store', connections: ['city_south_gate', 'city_square'], position: [650, 610], mapArea: 'qualibaf', canRevisit: true },
    { id: 'inn', name: 'Inn', description: 'A cozy inn.', encounterId: 'inn', connections: ['city_south_gate', 'city_square'], position: [684, 430], mapArea: 'qualibaf', canRevisit: true },
    { id: 'church', name: 'Church', description: 'A place of worship.', encounterId: 'church', connections: ['city_south_gate', 'city_square'], position: [820, 350], mapArea: 'qualibaf', canRevisit: true },
    // Guild Hall — Aldric's briefing is single-shot. On completion it
    // unlocks the city's North Gate (declared via `unlocks` so the
    // hydration pass on a fresh map can recover the unlock state too).
    { id: 'guild_hall', name: 'Guild Hall', description: "The Adventurer's Guild hall. A place to find work and information.", encounterId: 'guild_hall', connections: ['city_south_gate', 'city_square'], position: [520, 401], mapArea: 'qualibaf', unlocks: ['city_north_gate'] },
    { id: 'antiquity_shop', name: 'Antiquity Shop', description: 'A dusty shop filled with ancient relics and curious artifacts.', encounterId: 'antiquity_shop', connections: ['city_south_gate', 'city_square'], position: [420, 270], mapArea: 'qualibaf', canRevisit: true },
    { id: 'arcane_emporium', name: 'Arcane Emporium', description: 'A shop of arcane goods.', encounterId: 'arcane_emporium', connections: ['city_south_gate', 'city_square'], position: [260, 710], mapArea: 'qualibaf', canRevisit: true },
    { id: 'city_north_gate', name: 'City North Gate', description: 'The northern gate of Qualibaf.', encounterId: 'city_north_gate', connections: ['city_south_gate', 'city_square'], position: [512, 100], mapArea: 'qualibaf', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'piranha_pool';
  return map;
}

// === South of Qualibaf Map ===
// WIP placeholder map reached via the East Side / River Path / South
// Trail branch off the arriving_city map. Entry node sits at the top
// of the layout so the player arrives "from the north" walking down.
// No background image yet — the canvas just renders the node graph.
export function createSouthOfQualibafMap() {
  const map = new GameMap('south_of_qualibaf', 'South of Qualibaf');
  map.mapImages = {
    south_of_qualibaf: 'Maps/SouthOfQualibaf.jpg',
  };

  const nodes = [
    { id: 'outpost_approach', name: 'Outpost Approach', description: 'The trail descends toward the South Outpost.', encounterId: '', connections: ['outpost'], position: [872, 370], mapArea: 'south_of_qualibaf', canRevisit: true },
    // South Outpost — first visit fires the outpost_meeting encounter
    // (Gontran the Guard) which then teleports into the south_outpost
    // map. Subsequent visits hop straight into south_outpost via the
    // post-isDone gate dispatch.
    { id: 'outpost', name: 'South Outpost', description: 'A small fortified tower rises out of the plain.', encounterId: 'outpost_meeting', connections: ['outpost_approach', 'south_bend', 'high_meadow'], position: [802, 470], mapArea: 'south_of_qualibaf' },
    // South Bend — the road south of the outpost. Discoverable too:
    // hidden until the party walks out of the outpost via the south
    // gate (transitionToSouthBend then reveals it). South Bend also
    // links back to outpost so the player can re-enter the city by
    // the south door (special-cased in transitionToSouthOutpost: when
    // arriving from south_bend, land at river_trail instead of
    // north_path_entry).
    { id: 'south_bend', name: 'South Bend', description: 'The road continues south past the outpost walls, hugging the river.', encounterId: '', connections: ['cozy_spot', 'outpost'], position: [700, 560], mapArea: 'south_of_qualibaf', canRevisit: true, discoverable: true, hiddenName: '???' },
    // Cozy Spot — fishing dialog. Discoverable: invisible until the
    // party is at South Bend (one hop), shown as ??? when close, named
    // after a first visit. Fishing is a recharge-per-attempt minigame
    // with cumulative 10% chance.
    { id: 'cozy_spot', name: 'Cozy Spot', description: 'A flat, mossy stone juts over the river — perfect for sitting, or for fishing.', encounterId: 'cozy_spot', connections: ['south_bend', 'river_trail_south'], position: [830, 660], mapArea: 'south_of_qualibaf', canRevisit: true, discoverable: true, hiddenName: '???' },
    // River Trail South — placeholder next-step node beyond Cozy Spot.
    // Same discoverable rules so the player only sees it once they
    // reach Cozy Spot.
    { id: 'river_trail_south', name: 'River Trail South', description: 'The trail bends back along the water, heading deeper south.', encounterId: '', connections: ['cozy_spot'], position: [1050, 760], mapArea: 'south_of_qualibaf', canRevisit: true, discoverable: true, hiddenName: '???' },
    // Chapter 2 — the road east toward the gnoll chasms. Both nodes start
    // LOCKED (hidden) and reveal only after the gnoll-territories talk with
    // Gontran (gontran_gnoll_territories) — see hydrateMapFromGlobalState + the
    // re-hydrate in transitionFromSouthOutpostBack. high_meadow links back to
    // the outpost; east_mountain_trail_gate is `discoverable` (draws as ???
    // until walked onto) and teleports to the East Mountain Trail map.
    // (Positions are placeholders to tune against SouthOfQualibaf.jpg.)
    { id: 'high_meadow', name: 'High Meadow', description: 'Open grassland rising east of the outpost, where Gontran\'s trappers run their circuit toward the foothills.', encounterId: '', connections: ['outpost', 'east_mountain_trail_gate'], position: [1010, 510], mapArea: 'south_of_qualibaf', canRevisit: true, isLocked: true },
    { id: 'east_mountain_trail_gate', name: 'East Mountain Trail', description: 'Where the meadow gives out, a climbing track cuts east into the mountains — and gnoll country.', encounterId: '', connections: ['high_meadow'], position: [1120, 460], mapArea: 'south_of_qualibaf', canRevisit: true, isLocked: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A track climbing east, out past the meadow.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'outpost_approach';
  return map;
}

// East Mountain Trail — Chapter 2 climb east of the South Outpost toward gnoll
// country. Reached by teleport from south_of_qualibaf's east_mountain_trail_gate
// (see transitionToEastMountainTrail). Small exterior trail of three nodes: a
// trail head (the way back), a pass, and the high crags. In NO_FOG_MAPS (no
// dark fog overlay), but every node past the Trail Head is `discoverable`, so
// they reveal one hop at a time (??? until the party gets close).
export function createEastMountainTrailMap() {
  const map = new GameMap('east_mountain_trail', 'East Mountain Trail');
  map.mapImages = {
    east_mountain_trail: 'Maps/EastMountainTrailMap.jpg',
  };
  const nodes = [
    { id: 'emt_entry', name: 'Trail Head', description: 'The trail crests out of the high meadow; the South Outpost road falls away behind you to the west.', encounterId: '', connections: ['emt_pass'], position: [570, 920], mapArea: 'east_mountain_trail', canRevisit: true },
    { id: 'emt_pass', name: 'Mountain Pass', description: 'The track narrows between shoulders of grey stone, climbing steadily east.', encounterId: '', connections: ['emt_entry', 'emt_deep'], position: [410, 660], mapArea: 'east_mountain_trail', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The trail climbs on, into the rock.' },
    { id: 'emt_deep', name: 'High Crags', description: 'The path levels onto a broken shelf high in the crags — and somewhere ahead, gnoll country.', encounterId: '', connections: ['emt_pass'], position: [430, 570], mapArea: 'east_mountain_trail', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Higher still, where the crags break the sky.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'emt_entry';
  return map;
}

// East Mountain Trail continuation — a linear climb in four exterior segments
// (EastMountainTrail_01..04), chained High Crags → 01 → 02 → 03 → 04 toward the
// gnoll chasms. Each map's ENTRY node teleports back to the previous segment and
// its LAST node teleports on to the next (see EAST_TRAIL_CHAIN in main.js). In
// NO_FOG_MAPS (no dark overlay) but every node is `discoverable`, so the trail
// reveals one hop at a time; the deeper segments seed gnoll sign + the chasm.
export function createEastMountainTrail01Map() {
  const map = new GameMap('east_mountain_trail_01', 'East Mountain Trail');
  map.mapImages = { east_mountain_trail_01: 'Maps/EastMountainTrail_01.jpg' };
  const nodes = [
    { id: 'emt01_1', name: 'Lower Switchbacks', description: 'The trail doubles back on itself up the first shoulder of rock, the meadow shrinking below.', encounterId: '', connections: ['emt01_2'], position: [580, 950], mapArea: 'east_mountain_trail_01', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt01_2', name: 'The Narrows', description: 'The path pinches to single file between a sheer wall and a long drop.', encounterId: '', connections: ['emt01_1', 'emt01_3'], position: [440, 690], mapArea: 'east_mountain_trail_01', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt01_3', name: 'Windbreak Ledge', description: 'A flat shelf in the lee of a crag — a natural place to catch your breath.', encounterId: 'east_trail_gnoll_tracks', connections: ['emt01_2', 'emt01_4'], position: [600, 540], mapArea: 'east_mountain_trail_01', discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt01_4', name: 'Cairn Bend', description: 'An old stone cairn marks where the trail bends and climbs on.', encounterId: '', connections: ['emt01_3'], position: [450, 480], mapArea: 'east_mountain_trail_01', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'emt01_1';
  return map;
}

export function createEastMountainTrail02Map() {
  const map = new GameMap('east_mountain_trail_02', 'East Mountain Trail');
  map.mapImages = { east_mountain_trail_02: 'Maps/EastMountainTrail_02.jpg' };
  const nodes = [
    { id: 'emt02_1', name: 'Scree Slope', description: 'Loose stone shifts underfoot; the climb steepens.', encounterId: '', connections: ['emt02_2'], position: [500, 950], mapArea: 'east_mountain_trail_02', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt02_2', name: 'The Hogback', description: 'The trail rides a knife-edge ridge with open sky on either hand.', encounterId: '', connections: ['emt02_1', 'emt02_3'], position: [680, 670], mapArea: 'east_mountain_trail_02', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt02_3', name: 'Eagle\'s Rest', description: 'A wind-scoured notch where raptors nest in the cliffs above.', encounterId: '', connections: ['emt02_2', 'emt02_4'], position: [500, 540], mapArea: 'east_mountain_trail_02', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt02_4', name: 'Frostgrass Shelf', description: 'Pale grass clings to a high terrace, stiff with cold even now.', encounterId: '', connections: ['emt02_3', 'emt02_5'], position: [740, 370], mapArea: 'east_mountain_trail_02', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt02_5', name: 'The Saddle', description: 'The path crosses a low saddle between two peaks and starts down the far side.', encounterId: '', connections: ['emt02_4'], position: [870, 310], mapArea: 'east_mountain_trail_02', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'emt02_1';
  return map;
}

export function createEastMountainTrail03Map() {
  const map = new GameMap('east_mountain_trail_03', 'East Mountain Trail');
  map.mapImages = { east_mountain_trail_03: 'Maps/EastMountainTrail_03.jpg' };
  const nodes = [
    { id: 'emt03_1', name: 'Boulder Field', description: 'A chaos of fallen rock the trail threads between.', encounterId: '', connections: ['emt03_2'], position: [670, 910], mapArea: 'east_mountain_trail_03', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt03_2', name: 'The Cleft', description: 'The way drops into a narrow cleft, walls close enough to touch.', encounterId: '', connections: ['emt03_1', 'emt03_3'], position: [580, 590], mapArea: 'east_mountain_trail_03', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt03_3', name: 'Goat Path', description: 'A faint track scored into the slope — and, pressed in the mud, prints that are not a goat\'s.', encounterId: '', connections: ['emt03_2', 'emt03_4'], position: [670, 490], mapArea: 'east_mountain_trail_03', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt03_4', name: 'Wind Gap', description: 'A gap in the ridge funnels a constant, moaning wind.', encounterId: '', connections: ['emt03_3', 'emt03_5'], position: [670, 390], mapArea: 'east_mountain_trail_03', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt03_5', name: 'Shattered Steps', description: 'Broken stairs, ancient and dwarf-cut, climb on into the heights.', encounterId: '', connections: ['emt03_4'], position: [810, 310], mapArea: 'east_mountain_trail_03', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'emt03_1';
  return map;
}

export function createEastMountainTrail04Map() {
  const map = new GameMap('east_mountain_trail_04', 'East Mountain Trail');
  map.mapImages = { east_mountain_trail_04: 'Maps/EastMountainTrail_04.jpg' };
  const nodes = [
    { id: 'emt04_1', name: 'High Traverse', description: 'The trail edges across an exposed face, the valley a dizzying drop below.', encounterId: '', connections: ['emt04_2'], position: [560, 950], mapArea: 'east_mountain_trail_04', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt04_2', name: 'The Spine', description: 'A long rib of bare rock runs east toward the deep peaks.', encounterId: 'east_trail_battle_site', connections: ['emt04_1', 'emt04_3'], position: [650, 730], mapArea: 'east_mountain_trail_04', discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt04_3', name: 'Vulture Roost', description: 'Carrion birds wheel over a ledge littered with old bones.', encounterId: '', connections: ['emt04_2', 'emt04_4'], position: [410, 500], mapArea: 'east_mountain_trail_04', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt04_4', name: 'Bonepile Bend', description: 'A heap of gnawed bones marks a bend in the trail — a kill-site, or a warning.', encounterId: '', connections: ['emt04_3', 'emt04_5'], position: [390, 360], mapArea: 'east_mountain_trail_04', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
    { id: 'emt04_5', name: 'Chasm Overlook', description: 'The trail ends at the lip of a vast chasm cut into the mountains — gnoll country, and somewhere below, the deep.', encounterId: 'east_trail_chasm_crags', connections: ['emt04_4'], position: [420, 200], mapArea: 'east_mountain_trail_04', discoverable: true, hiddenName: '???', hiddenDescription: 'A stretch of trail further up the mountain.' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'emt04_1';
  return map;
}

// East Mountain Crags & Chasm — the cave-and-chasm wilderness past the trail's
// end. Chained Chasm Overlook → crags_chasm_01 (8 nodes, one line) →
// crags_chasm_02 (a Y: a 4-node stem that forks into a 1-node dead drop and a
// 4-node gallery). NO_FOG (no dark overlay) + every node `discoverable`.
export function createEastMountainCragsChasm01Map() {
  const map = new GameMap('east_mountain_crags_chasm_01', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_01: 'Maps/EastMountainCragsChasm_01.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the crags and chasms.' };
  const nodes = [
    { id: 'c1_1', name: 'Chasm Mouth', description: 'The way drops off the overlook into a maze of crags and fissures.', encounterId: '', connections: ['c1_2'], position: [670, 90], mapArea: 'east_mountain_crags_chasm_01', ...D },
    { id: 'c1_2', name: 'Crumbling Ledge', description: 'A narrow ledge sketched along a sheer drop; loose stone skitters away underfoot.', encounterId: '', connections: ['c1_1', 'c1_3'], position: [830, 320], mapArea: 'east_mountain_crags_chasm_01', ...D },
    { id: 'c1_3', name: 'Hollow Rock', description: 'A low dark mouth yawns in the rock — one of many cave entrances pocking the crags.', encounterId: '', connections: ['c1_2', 'c1_4'], position: [550, 540], mapArea: 'east_mountain_crags_chasm_01', ...D },
    { id: 'c1_4', name: 'Boulder Choke', description: 'Fallen slabs nearly seal the way; you squeeze through the gap.', encounterId: '', connections: ['c1_3', 'c1_5'], position: [830, 880], mapArea: 'east_mountain_crags_chasm_01', ...D },
    { id: 'c1_5', name: 'Wind-Cut Notch', description: 'A slot in the rock where the wind screams through.', encounterId: '', connections: ['c1_4', 'c1_6'], position: [300, 920], mapArea: 'east_mountain_crags_chasm_01', ...D },
    { id: 'c1_6', name: 'Hanging Path', description: 'The path clings to the chasm wall, nothing but air to the left.', encounterId: '', connections: ['c1_5', 'c1_7'], position: [150, 690], mapArea: 'east_mountain_crags_chasm_01', ...D },
    { id: 'c1_7', name: 'Bone Scatter', description: 'Cracked bones lie scattered across the stone — old gnoll leavings.', encounterId: '', connections: ['c1_6', 'c1_8'], position: [290, 580], mapArea: 'east_mountain_crags_chasm_01', ...D },
    { id: 'c1_8', name: 'Deep Fissure', description: 'The crags open onto a deeper rift, the way pressing on into shadow.', encounterId: '', connections: ['c1_7'], position: [140, 480], mapArea: 'east_mountain_crags_chasm_01', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c1_1';
  return map;
}

export function createEastMountainCragsChasm02Map() {
  const map = new GameMap('east_mountain_crags_chasm_02', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_02: 'Maps/EastMountainCragsChasm_02.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the crags and chasms.' };
  const nodes = [
    // Stem (4 nodes).
    { id: 'c2_1', name: 'Lower Gully', description: 'You descend into a narrow gully, walls rising sheer on either side.', encounterId: '', connections: ['c2_2'], position: [530, 80], mapArea: 'east_mountain_crags_chasm_02', ...D },
    { id: 'c2_2', name: 'The Cleft', description: 'The gully tightens to a cleft you turn sideways to pass.', encounterId: '', connections: ['c2_1', 'c2_3'], position: [440, 240], mapArea: 'east_mountain_crags_chasm_02', ...D },
    { id: 'c2_3', name: 'Slick Stone', description: 'Water seeps down the rock here, the footing treacherous.', encounterId: '', connections: ['c2_2', 'c2_4'], position: [600, 420], mapArea: 'east_mountain_crags_chasm_02', ...D },
    // Branch point — forks to the dead drop (c2_5 → crags_chasm_03) and the
    // gallery (c2_6); the gallery ends at Black Chasm (c2_9 → crags_chasm_04).
    { id: 'c2_4', name: 'The Branching', description: 'The way splits — a steep drop down to one side, a long gallery sinking deeper on the other.', encounterId: '', connections: ['c2_3', 'c2_5', 'c2_6'], position: [420, 610], mapArea: 'east_mountain_crags_chasm_02', ...D },
    // Branch A (1 node) — teleports on to crags_chasm_03.
    { id: 'c2_5', name: 'Dead Drop', description: 'The side passage drops away into the dark — but old hand-holds and a knotted rope mark a way down.', encounterId: '', connections: ['c2_4'], position: [330, 360], mapArea: 'east_mountain_crags_chasm_02', ...D },
    // Branch B (4 nodes) — ends at Black Chasm, which teleports to crags_chasm_04.
    { id: 'c2_6', name: 'Lower Gallery', description: 'A long cave gallery runs on, the ceiling lost in dark.', encounterId: '', connections: ['c2_4', 'c2_7'], position: [720, 760], mapArea: 'east_mountain_crags_chasm_02', ...D },
    { id: 'c2_7', name: 'Bat Roost', description: 'The reek of guano; unseen wings stir in the blackness overhead.', encounterId: '', connections: ['c2_6', 'c2_8'], position: [480, 810], mapArea: 'east_mountain_crags_chasm_02', ...D },
    { id: 'c2_8', name: 'The Squeeze', description: 'The passage pinches to a crawl through cold stone.', encounterId: '', connections: ['c2_7', 'c2_9'], position: [130, 860], mapArea: 'east_mountain_crags_chasm_02', ...D },
    { id: 'c2_9', name: 'Black Chasm', description: 'The crawl opens above a vast black chasm — and far below, the breath of the deep.', encounterId: '', connections: ['c2_8'], position: [90, 710], mapArea: 'east_mountain_crags_chasm_02', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c2_1';
  return map;
}

// Crags & Chasm 03 — the lower passage reached by dropping from Dead Drop
// (crags_chasm_02 c2_5). 6 nodes, one line, deeper into gnoll country and the
// threshold of the deep.
export function createEastMountainCragsChasm03Map() {
  const map = new GameMap('east_mountain_crags_chasm_03', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_03: 'Maps/EastMountainCragsChasm_03.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the crags and chasms.' };
  const nodes = [
    { id: 'c3_1', name: 'Rope Descent', description: 'The rope brings you down into a cold lower passage.', encounterId: '', connections: ['c3_2'], position: [590, 80], mapArea: 'east_mountain_crags_chasm_03', ...D },
    { id: 'c3_2', name: 'Dripping Hall', description: 'Water drips steadily from unseen heights; the dark drinks the sound.', encounterId: '', connections: ['c3_1', 'c3_3'], position: [710, 260], mapArea: 'east_mountain_crags_chasm_03', ...D },
    { id: 'c3_3', name: 'Gnoll Sign', description: 'Crude markings are daubed on the wall in something dark — a warning, or a border.', encounterId: '', connections: ['c3_2', 'c3_4'], position: [390, 440], mapArea: 'east_mountain_crags_chasm_03', ...D },
    { id: 'c3_4', name: 'Bone Midden', description: 'A reeking heap of cracked bones and gnawed leavings clogs the passage.', encounterId: '', connections: ['c3_3', 'c3_5'], position: [700, 780], mapArea: 'east_mountain_crags_chasm_03', ...D },
    { id: 'c3_5', name: 'Den Mouth', description: 'The passage widens; the stink of gnoll is thick here. A den, and close.', encounterId: '', connections: ['c3_4', 'c3_6'], position: [140, 830], mapArea: 'east_mountain_crags_chasm_03', ...D },
    { id: 'c3_6', name: 'The Lower Dark', description: 'The way bottoms out into a black, echoing void, and the gnoll-sign leads on down into it.', encounterId: '', connections: ['c3_5'], position: [280, 550], mapArea: 'east_mountain_crags_chasm_03', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c3_1';
  return map;
}

// Crags & Chasm 04 — the descent reached from Black Chasm (crags_chasm_02 c2_9).
// 5 nodes, one line, down toward an old dwarf-worked gate into the deep.
export function createEastMountainCragsChasm04Map() {
  const map = new GameMap('east_mountain_crags_chasm_04', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_04: 'Maps/EastMountainCragsChasm_04.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the crags and chasms.' };
  const nodes = [
    { id: 'c4_1', name: 'Chasm Ledge', description: 'A narrow ledge switchbacks down the chasm wall into the dark.', encounterId: '', connections: ['c4_2'], position: [560, 60], mapArea: 'east_mountain_crags_chasm_04', ...D },
    { id: 'c4_2', name: 'The Long Fall', description: 'The ledge skirts a drop with no visible bottom.', encounterId: '', connections: ['c4_1', 'c4_3'], position: [430, 430], mapArea: 'east_mountain_crags_chasm_04', ...D },
    { id: 'c4_3', name: 'Old Diggings', description: 'Pick-marks scar the stone — dwarf-work, ancient and long abandoned.', encounterId: '', connections: ['c4_2', 'c4_4'], position: [200, 710], mapArea: 'east_mountain_crags_chasm_04', ...D },
    { id: 'c4_4', name: 'The Warren', description: 'Side-tunnels branch off in the gloom, rank with the smell of gnoll.', encounterId: '', connections: ['c4_3', 'c4_5'], position: [720, 840], mapArea: 'east_mountain_crags_chasm_04', ...D },
    { id: 'c4_5', name: 'Gate of the Lower Deep', description: 'A worked archway, half-collapsed, opens onto a deeper, gnoll-held dark beyond.', encounterId: '', connections: ['c4_4'], position: [760, 410], mapArea: 'east_mountain_crags_chasm_04', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c4_1';
  return map;
}

// Crags & Chasm 05 — the deepest gnoll-held crags, reached
// from The Lower Dark (crags_chasm_03 c3_6). A 6-node line that forks at its end
// (c5_6) into a 1-node dead gallery and a 2-node stair to a sealed black gate.
export function createEastMountainCragsChasm05Map() {
  const map = new GameMap('east_mountain_crags_chasm_05', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_05: 'Maps/EastMountainCragsChasm_05.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Onward through the deep crags.' };
  const nodes = [
    { id: 'c5_1', name: 'Threshold of the Deep', description: 'Past the lower dark the air turns colder and older — the gnoll-warrens run deep here indeed.', encounterId: '', connections: ['c5_2'], position: [530, 90], mapArea: 'east_mountain_crags_chasm_05', ...D },
    { id: 'c5_2', name: 'The Pale Road', description: 'A worked road, dust-grey and ancient, runs on through the black.', encounterId: '', connections: ['c5_1', 'c5_3'], position: [620, 230], mapArea: 'east_mountain_crags_chasm_05', ...D },
    { id: 'c5_3', name: 'Fungal Hollow', description: 'Pallid fungus glows faintly across a wide cavern, lighting nothing.', encounterId: '', connections: ['c5_2', 'c5_4'], position: [470, 350], mapArea: 'east_mountain_crags_chasm_05', ...D },
    { id: 'c5_4', name: 'Gnoll Spoor', description: 'Fresh tracks and dropped gnaw-bones — the pack came this way, and not long ago.', encounterId: '', connections: ['c5_3', 'c5_5'], position: [660, 550], mapArea: 'east_mountain_crags_chasm_05', ...D },
    { id: 'c5_5', name: 'The Crossing', description: 'A natural span of stone bridges a rushing underground stream.', encounterId: '', connections: ['c5_4', 'c5_6'], position: [340, 810], mapArea: 'east_mountain_crags_chasm_05', ...D },
    // Fork — dead gallery (c5_7) and the stair down to the black gate (c5_8/c5_9).
    { id: 'c5_6', name: 'The Fork', description: 'The road splits — a dead gallery to one hand, a longer way curving down to the other.', encounterId: 'east_trail_deep_gnoll', connections: ['c5_5', 'c5_7', 'c5_8'], position: [670, 950], mapArea: 'east_mountain_crags_chasm_05', ...D, canRevisit: false },
    { id: 'c5_7', name: 'Sealed Gallery', description: 'A wall of fused stone seals the gallery — but a crack at its base has been worried wide, and a cold draft breathes through from the dark beyond.', encounterId: '', connections: ['c5_6'], position: [870, 950], mapArea: 'east_mountain_crags_chasm_05', ...D },
    { id: 'c5_8', name: 'Deepening Stair', description: 'Dwarf-cut stairs spiral down into deeper dark.', encounterId: '', connections: ['c5_6', 'c5_9'], position: [910, 630], mapArea: 'east_mountain_crags_chasm_05', ...D },
    { id: 'c5_9', name: 'The Black Gate', description: 'A great sealed door of black iron, worked with old dwarf-runes — it grinds open onto deeper dark beyond.', encounterId: '', connections: ['c5_8'], position: [840, 430], mapArea: 'east_mountain_crags_chasm_05', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c5_1';
  return map;
}

// Crags & Chasm 06 — the lower deep reached from the Gate of the Lower Deep
// (crags_chasm_04 c4_5). 7 nodes, one line, through a gnoll war-camp toward an
// old sunken dwarf road running on into deeper dark.
export function createEastMountainCragsChasm06Map() {
  const map = new GameMap('east_mountain_crags_chasm_06', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_06: 'Maps/EastMountainCragsChasm_06.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Onward through the deep crags.' };
  const nodes = [
    { id: 'c6_1', name: 'The Lower Deep', description: 'Through the broken arch the crags open into a vast, lightless, cold gulf the gnolls have made their own.', encounterId: '', connections: ['c6_2'], position: [620, 30], mapArea: 'east_mountain_crags_chasm_06', ...D },
    { id: 'c6_2', name: 'Cavern of Pillars', description: 'A forest of stone pillars marches off into the dark.', encounterId: '', connections: ['c6_1', 'c6_3'], position: [190, 250], mapArea: 'east_mountain_crags_chasm_06', ...D },
    { id: 'c6_3', name: 'The Gnoll Camp', description: 'Cook-fires and crude hide tents — a gnoll war-camp, sprawled across the cavern floor.', encounterId: '', connections: ['c6_2', 'c6_4'], position: [790, 470], mapArea: 'east_mountain_crags_chasm_06', ...D },
    { id: 'c6_4', name: 'Slave Pens', description: 'Rough cages of bone and sinew line the wall — some of them recently emptied.', encounterId: '', connections: ['c6_3', 'c6_5'], position: [810, 750], mapArea: 'east_mountain_crags_chasm_06', ...D },
    { id: 'c6_5', name: 'The War-Drum', description: 'A great drum of stretched hide stands silent at the camp\'s heart.', encounterId: '', connections: ['c6_4', 'c6_6'], position: [150, 880], mapArea: 'east_mountain_crags_chasm_06', ...D },
    { id: 'c6_6', name: 'Deep Tunnel Mouth', description: 'A worked tunnel bores away from the camp, deeper still.', encounterId: '', connections: ['c6_5', 'c6_7'], position: [170, 540], mapArea: 'east_mountain_crags_chasm_06', ...D },
    { id: 'c6_7', name: 'The Sunken Road', description: 'An old dwarf road, half-flooded, runs on into the deeper dark.', encounterId: '', connections: ['c6_6'], position: [50, 70], mapArea: 'east_mountain_crags_chasm_06', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c6_1';
  return map;
}

// Crags & Chasm 07 — the flooded dwarf road on from The Sunken Road
// (crags_chasm_06 c6_7). 8 nodes, one line, deep in gnoll country; the last
// node bores underground, deeper into gnoll country.
export function createEastMountainCragsChasm07Map() {
  const map = new GameMap('east_mountain_crags_chasm_07', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_07: 'Maps/EastMountainCragsChasm_07.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Onward through the deep crags.' };
  const nodes = [
    { id: 'c7_1', name: 'The Flooded Road', description: 'The old road runs on, ankle-deep in cold black water.', encounterId: '', connections: ['c7_2'], position: [410, 30], mapArea: 'east_mountain_crags_chasm_07', ...D },
    { id: 'c7_2', name: 'Sunken Pillars', description: 'Drowned pillars break the water\'s surface, marching off into the dark.', encounterId: '', connections: ['c7_1', 'c7_3'], position: [710, 200], mapArea: 'east_mountain_crags_chasm_07', ...D },
    { id: 'c7_3', name: 'The Gnoll Ford', description: 'A shallows where the pack crosses — the mud churned with countless prints.', encounterId: '', connections: ['c7_2', 'c7_4'], position: [320, 380], mapArea: 'east_mountain_crags_chasm_07', ...D },
    { id: 'c7_4', name: 'Drowned Hall', description: 'A great flooded hall, its dwarf-carved galleries swallowed to the waist.', encounterId: '', connections: ['c7_3', 'c7_5'], position: [500, 570], mapArea: 'east_mountain_crags_chasm_07', ...D },
    { id: 'c7_5', name: 'The Reek', description: 'The water gives way to a fouler stretch — the stink of gnoll thick as fog.', encounterId: '', connections: ['c7_4', 'c7_6'], position: [830, 710], mapArea: 'east_mountain_crags_chasm_07', ...D },
    { id: 'c7_6', name: 'Bone Weir', description: 'A dam of bones and debris chokes the channel; you climb over it.', encounterId: '', connections: ['c7_5', 'c7_7'], position: [570, 910], mapArea: 'east_mountain_crags_chasm_07', ...D },
    { id: 'c7_7', name: 'The Descent', description: 'The road tilts down, the water draining away into deeper dark ahead.', encounterId: '', connections: ['c7_6', 'c7_8'], position: [290, 820], mapArea: 'east_mountain_crags_chasm_07', ...D },
    { id: 'c7_8', name: 'Into the Dark', description: 'The dwarf road bores down into true blackness, deeper into the gnoll-held dark — with no end to it in sight.', encounterId: '', connections: ['c7_7'], position: [350, 600], mapArea: 'east_mountain_crags_chasm_07', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c7_1';
  return map;
}

// Crags & Chasm 08 — beyond The Black Gate (crags_chasm_05 c5_9). 6 nodes, one
// line, a long-sealed dwarf stair sinking into deeper dark.
export function createEastMountainCragsChasm08Map() {
  const map = new GameMap('east_mountain_crags_chasm_08', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_08: 'Maps/EastMountainCragsChasm_08.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Onward through the deep crags.' };
  const nodes = [
    { id: 'c8_1', name: 'Beyond the Gate', description: 'The black gate groans open onto a long-sealed stair, the air beyond dead and ancient.', encounterId: '', connections: ['c8_2'], position: [610, 950], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_2', name: 'The Sealed Stair', description: 'Dwarf-cut steps spiral down, untrodden for an age.', encounterId: '', connections: ['c8_1', 'c8_3'], position: [710, 760], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_3', name: 'Cracked Vault', description: 'A vaulted chamber, its ceiling split, rubble strewn across the floor.', encounterId: '', connections: ['c8_2', 'c8_4'], position: [200, 530], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_4', name: 'The Still Water', description: 'A black pool fills the lower chamber, perfectly still.', encounterId: '', connections: ['c8_3', 'c8_5'], position: [540, 320], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_5', name: 'Drowned Doorway', description: 'A dwarf archway stands half-submerged, the way pressing on beneath the water.', encounterId: '', connections: ['c8_4', 'c8_6'], position: [440, 160], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_6', name: 'The Deep Stair', description: 'Stairs descend into the flood and the dark, sinking deeper still.', encounterId: '', connections: ['c8_5'], position: [590, 40], mapArea: 'east_mountain_crags_chasm_08', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c8_1';
  return map;
}

// Crags & Chasm 09 — through the crack in the Sealed Gallery (crags_chasm_05
// c5_7). 7 nodes, one line, old diggings + a gnoll-held junction down to a lower
// sealed gate.
export function createEastMountainCragsChasm09Map() {
  const map = new GameMap('east_mountain_crags_chasm_09', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_09: 'Maps/EastMountainCragsChasm_09.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Onward through the deep crags.' };
  const nodes = [
    { id: 'c9_1', name: 'Through the Crack', description: 'You worm through the gap in the fused stone into a cramped passage beyond.', encounterId: '', connections: ['c9_2'], position: [590, 180], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_2', name: 'The Old Diggings', description: 'Tool-marks and a collapsed shaft — dwarves mined here once, long ago.', encounterId: '', connections: ['c9_1', 'c9_3'], position: [380, 300], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_3', name: 'Spider Hollow', description: 'Thick webs choke a side-cavern; something large shifts in the dark.', encounterId: '', connections: ['c9_2', 'c9_4'], position: [700, 420], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_4', name: 'The Narrow Way', description: 'The passage squeezes down to a crawl over cold stone.', encounterId: '', connections: ['c9_3', 'c9_5'], position: [540, 550], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_5', name: 'Gnoll Outpost', description: 'A crude barricade and a cold watch-fire — the gnolls hold this junction.', encounterId: '', connections: ['c9_4', 'c9_6'], position: [880, 740], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_6', name: 'The Underway', description: 'A wide worked tunnel runs off level and straight into the deep.', encounterId: '', connections: ['c9_5', 'c9_7'], position: [630, 910], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_7', name: 'The Lower Gate', description: 'Another sealed dwarf gate bars the way down — locked fast, with no opening it from this side.', encounterId: '', connections: ['c9_6'], position: [260, 760], mapArea: 'east_mountain_crags_chasm_09', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c9_1';
  return map;
}

// Crags & Chasm 10 — the drowned deep below The Deep Stair (crags_chasm_08
// c8_6). 6 nodes, one line, ending at a great collapse with no way past for now.
export function createEastMountainCragsChasm10Map() {
  const map = new GameMap('east_mountain_crags_chasm_10', 'The Crags');
  map.mapImages = { east_mountain_crags_chasm_10: 'Maps/EastMountainCragsChasm_10.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Onward through the deep crags.' };
  const nodes = [
    { id: 'c10_1', name: 'The Flooded Stair', description: 'The stair plunges on beneath the black water, step by drowned step.', encounterId: '', connections: ['c10_2'], position: [580, 970], mapArea: 'east_mountain_crags_chasm_10', ...D },
    { id: 'c10_2', name: 'Sunken Vault', description: 'A flooded vault, its dwarf-treasures long since looted or lost.', encounterId: '', connections: ['c10_1', 'c10_3'], position: [660, 800], mapArea: 'east_mountain_crags_chasm_10', ...D },
    { id: 'c10_3', name: 'Gnoll Shrine', description: 'A crude shrine of bone and hide — the gnolls worship something down here.', encounterId: '', connections: ['c10_2', 'c10_4'], position: [170, 610], mapArea: 'east_mountain_crags_chasm_10', ...D },
    { id: 'c10_4', name: 'Drowned Crossroad', description: 'Flooded passages branch off in the dark; the gnoll-trail holds to one.', encounterId: '', connections: ['c10_3', 'c10_5'], position: [770, 370], mapArea: 'east_mountain_crags_chasm_10', ...D },
    { id: 'c10_5', name: 'The Deep Pool', description: 'A still, deep pool fills the cavern wall to wall; the trail skirts its edge.', encounterId: '', connections: ['c10_4', 'c10_6'], position: [420, 200], mapArea: 'east_mountain_crags_chasm_10', ...D },
    { id: 'c10_6', name: 'The Sealed Deep', description: 'The way ends at a great collapse of stone and water — no passing it, not without finding another road.', encounterId: '', connections: ['c10_5'], position: [510, 110], mapArea: 'east_mountain_crags_chasm_10', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c10_1';
  return map;
}

// === South Outpost Map ===
// Detailed map of the outpost grounds reached after the Gontran the
// Guard dialog. WIP — currently a single north-path entry node that
// teleports back to the outpost on south_of_qualibaf so the player
// can come and go while the rest of the area (merchant boat crash,
// cave entrance) is being built out.
export function createSouthOutpostMap() {
  const map = new GameMap('south_outpost', 'South Outpost');
  map.mapImages = {
    south_outpost: 'Maps/SouthOutpostMap.jpg',
  };

  // south_outpost lives in CITY_FREE_MOVE_AREAS in main.js, so the
  // `connections` field is only used as a structural hint — the render
  // skips edge lines and the click router relaxes the adjacency check,
  // letting the player one-click between any two nodes here.
  const nodes = [
    { id: 'north_path_entry', name: 'North Path', description: 'The trail back north toward the outpost gate.', encounterId: '', connections: [], position: [912, 300], mapArea: 'south_outpost', canRevisit: true },
    // Watchtower — Gontran posted at the top. Each click fires the
    // watchtower_check dialog (canRevisit) so the player can drop in
    // any time before / after the merchant boat investigation.
    { id: 'watchtower', name: 'Watchtower', description: 'A wooden ladder climbs to Gontran\'s post atop the tower.', encounterId: 'watchtower_check', connections: [], position: [492, 220], mapArea: 'south_outpost', canRevisit: true },
    // Supply Pile — Gontran offered the storehouse on the way out.
    // One-shot loot picker (two sequential picks: weapon/armor then
    // supplies/rations). Card ids are rolled per visit in
    // startNodeEncounter so the offering re-rolls between runs.
    { id: 'supply_pile', name: 'Supply Pile', description: 'A pile of crates and barrels by the inner wall.', encounterId: 'supply_pile', connections: [], position: [302, 760], mapArea: 'south_outpost' },
    // Resting Tent — one-time short rest for +5 HP. Latches via
    // outpostTentRested (save-persisted) so the dialog only fires
    // until the player accepts the rest; "Move on" leaves the tent
    // available for a later visit.
    { id: 'outpost_tent', name: 'Resting Tent', description: 'A small canvas tent pitched inside the palisade — bedroll, water flask, room for one.', encounterId: 'outpost_tent', connections: [], position: [752, 750], mapArea: 'south_outpost', canRevisit: true },
    // River Trail — south of the outpost, still on this map for now.
    // No encounter yet; the merchant boat investigation hooks in here
    // on the next pass.
    { id: 'river_trail', name: 'River Trail', description: 'The road slips out the south gate and tracks the river bank toward the wreck.', encounterId: '', connections: [], position: [482, 960], mapArea: 'south_outpost', canRevisit: true },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'north_path_entry';
  return map;
}

// === River Cave Mouth Map ===
// Reached by walking onto river_trail_south on south_of_qualibaf —
// the road empties out onto a wide mountain lake with a stranded
// merchant ship in the middle. WIP: currently a single lake-shore
// entry node that fires the arrival dialog, then sits there waiting
// for the next-pass investigation content.
export function createRiverCaveMouthMap() {
  const map = new GameMap('river_cave_mouth', 'River Cave Mouth');
  map.mapImages = {
    river_cave_mouth: 'Maps/RiverCaveMouth.jpg',
    // Boarding the cog swaps mapArea to 'shipwreck_deck' so the canvas
    // background changes from the lake view to the deck plan.
    shipwreck_deck: 'Maps/ShipwreckDeckMap.jpg',
  };

  // Linear shore-to-rocks chain across the lake. Player walks two
  // shore nodes toward the cave (lake_path_1 is silent, lake_path_2
  // fires the birds + Raena-points + Thorb-assault dialog), then
  // hops four water/reef nodes across to the far side, ending on
  // South Hill on the opposite shore. Every node past lake_shore is
  // discoverable — invisible until the party is one hop away — so the
  // lake reads as a fog-of-war exploration rather than a laid-out
  // path. All wip until the assault content lands in the next pass.
  const nodes = [
    { id: 'lake_shore', name: 'Lake Shore', description: 'The river widens here, opening onto a still mountain lake. A merchant ship sits stranded in the middle.', encounterId: 'river_cave_mouth_entry', connections: ['lake_path_1'], position: [682, 200], mapArea: 'river_cave_mouth', canRevisit: true },
    { id: 'lake_path_1', name: 'Lake Path', description: 'The trail hugs the shore, closing the distance to the wreck.', encounterId: '', connections: ['lake_shore', 'lake_path_2'], position: [590, 330], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_path_2', name: 'Vantage Point', description: 'A vantage point — close enough to see the gouges down the cog\'s hull, and the dark birds circling the mast.', encounterId: 'lake_path_2', connections: ['lake_path_1', 'lake_rock_1'], position: [750, 380], mapArea: 'river_cave_mouth', discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_1', name: 'First Rock', description: 'A flat-topped stone breaks the surface — easy hop from shore.', encounterId: '', connections: ['lake_path_2', 'lake_rock_2'], position: [820, 440], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_2', name: 'Second Rock', description: 'Another slab. The channel deepens here — the next jump is longer.', encounterId: '', connections: ['lake_rock_1', 'lake_rock_3'], position: [720, 460], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_3', name: 'Third Rock', description: 'The reef chain breaks. From here it\'s a short swim to the last stone.', encounterId: '', connections: ['lake_rock_2', 'lake_rock_4'], position: [790, 530], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_4', name: 'Far Rock', description: 'The last stone before the far shore. The merchant cog sits just upstream of you now.', encounterId: '', connections: ['lake_rock_3', 'south_hill'], position: [720, 550], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    // South Hill — first node on the far shore. Fires the "birds have
    // LEGS?" reconnaissance beat from the brush. Connects forward to
    // ship_approach (the boarding beat on the lake) which in turn
    // crosses into the shipwreck_deck mapArea at wreckage.
    { id: 'south_hill', name: 'South Hill', description: 'A low scrub-covered hill with a view straight down onto the listing cog.', encounterId: 'south_hill', connections: ['lake_rock_4', 'ship_approach'], position: [630, 610], mapArea: 'river_cave_mouth', discoverable: true, hiddenName: '???' },
    // Ship Approach + Wreckage form a paired teleport across mapAreas.
    // Walking onto ship_approach (from south_hill) auto-jumps to
    // wreckage (lake → deck). After the harpy dialog, any path back
    // INTO wreckage — including clicking the back-direction from
    // ship_passage — bounces the party out to ship_approach (outside
    // the wreck). The passthroughTo "same-from" guard keeps the pair
    // from ping-ponging.
    { id: 'ship_approach', name: 'Ship Approach', description: 'A scramble through reeds and shallow water — close enough now to grab the cog\'s anchor chain.', encounterId: '', connections: ['south_hill', 'wreckage'], position: [580, 510], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???', passthroughTo: 'wreckage' },
    { id: 'wreckage', name: 'Wreckage', description: 'The cog\'s deck — listing hard to one side, ropes flapping, no crew in sight.', encounterId: 'wreckage_arrival', connections: ['ship_approach', 'ship_passage'], position: [622, 760], mapArea: 'shipwreck_deck', discoverable: true, hiddenName: '???', passthroughTo: 'ship_approach' },
    { id: 'ship_passage', name: 'Forecastle Passage', description: 'A narrow walkway under the leaning forecastle. Doors thrown open.', encounterId: '', connections: ['wreckage', 'ship_hold'], position: [800, 460], mapArea: 'shipwreck_deck', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'ship_hold', name: 'Top of the Deck', description: 'A ladder drops below. The list of the ship makes the floor feel wrong.', encounterId: '', connections: ['ship_passage', 'ship_chest'], position: [850, 330], mapArea: 'shipwreck_deck', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'ship_chest', name: 'Deck Chest', description: 'A heavy iron-banded chest wedged against the rail — somehow untouched by the harpies.', encounterId: 'ship_chest', connections: ['ship_hold'], position: [940, 370], mapArea: 'shipwreck_deck', discoverable: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'lake_shore';
  return map;
}

// === North Qualibaf Map ===
export function createNorthQualibafMap() {
  const map = new GameMap('north_qualibaf', 'North of Qualibaf');
  map.mapImages = {
    north_qualibaf: 'Maps/NorthGateQualibafExternalMap.jpg',
  };

  const nodes = [
    { id: 'north_gate_return', name: 'North Gate Return', description: 'Outside the northern gate of Qualibaf.', encounterId: '', connections: ['north_crossroad'], position: [480, 947], mapArea: 'north_qualibaf', canRevisit: true },
    { id: 'north_crossroad', name: 'North Crossroad', description: 'A crossroad north of the city.', encounterId: 'north_crossroad', connections: ['north_gate_return', 'filibaf_entrance', 'north_road'], position: [580, 170], mapArea: 'north_qualibaf', unlocks: ['filibaf_entrance'] },
    { id: 'filibaf_entrance', name: 'Filibaf Entrance', description: 'The entrance to Filibaf Forest.', encounterId: 'filibaf_entrance', connections: ['north_crossroad'], position: [825, 160], mapArea: 'north_qualibaf', isLocked: true, canRevisit: true, hiddenName: '???' },
    // Armorer's-son side quest — opens once the crossroad quest dialog is
    // finished (handleEncounterChoiceClick unlocks it). Goes nowhere yet:
    // no encounter, a placeholder node for the rescue beat to come.
    { id: 'north_road', name: 'The North Road', description: 'The road climbs north toward the smoke-hazed hills.', encounterId: '', connections: ['north_crossroad'], position: [540, 85], mapArea: 'north_qualibaf', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'The road runs on into the northern hills.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'north_gate_return';
  return map;
}

// === Qualibaf Bridge Map (armorer's-son side quest, WIP) ===
// Reached by walking the unlocked north_road node off the North
// Crossroad (see transitionToQualibafBridge in main.js). The party
// climbs the Frontier Road from the entry, up alongside the river, into
// the treeline, to an overlook above the partially-destroyed bridge.
// Walking back onto the entry returns to the North Qualibaf map. The
// overlook is the current end of content — the rescue beat comes later.
export function createQualibafBridgeMap() {
  const map = new GameMap('qualibaf_bridge', 'The Frontier Road');
  map.mapImages = {
    qualibaf_bridge: 'Maps/QualibafBridgeMap.jpg',
  };
  // Standard fog of war (see CLAUDE.md): every node past the entry is
  // `discoverable` + '???' — invisible until the party is one hop away,
  // then shown as '???', then named once walked onto. The two patrol
  // zones — {river_climb, treeline} on the climb and {bridge,
  // trail_north} past the overlook — each host the Elite Kobold
  // Patrol on ONE randomly chosen node (persisted in _bridgePatrolNodes,
  // respawns on rest), mirroring the frog-rocks pattern. The waterfall
  // is the current end of content.
  const nodes = [
    { id: 'frontier_road', name: 'The Frontier Road', description: 'The narrowing trade road, climbing north toward the broken bridge.', encounterId: 'qualibaf_bridge_approach', connections: ['river_climb'], position: [840, 960], mapArea: 'qualibaf_bridge', canRevisit: false },
    { id: 'river_climb', name: 'The River Path', description: 'A switchback track hugging the gorge as the river drops away below.', encounterId: '', connections: ['frontier_road', 'treeline'], position: [650, 800], mapArea: 'qualibaf_bridge', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The path climbs on beside the water.' },
    { id: 'treeline', name: 'The Treeline', description: 'Wind-bent pines crowd the path, dim and close.', encounterId: '', connections: ['river_climb', 'bridge_overlook'], position: [910, 650], mapArea: 'qualibaf_bridge', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The pines thicken above you.' },
    { id: 'bridge_overlook', name: 'Bridge Overlook', description: 'A rise above the gorge, looking down on the bridge.', encounterId: 'qualibaf_bridge_overlook', connections: ['treeline', 'bridge'], position: [750, 550], mapArea: 'qualibaf_bridge', canRevisit: false, discoverable: true, hiddenName: '???', hiddenDescription: 'The trees thin toward an overlook.' },
    { id: 'bridge', name: 'The Broken Bridge', description: 'The near end of the shattered span, slick with spray.', encounterId: '', connections: ['bridge_overlook', 'trail_north'], position: [940, 420], mapArea: 'qualibaf_bridge', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The broken bridge lies ahead.' },
    { id: 'trail_north', name: 'The North Trail', description: 'A steep, broken trail clawing north off the bridge toward the falls.', encounterId: '', connections: ['bridge', 'waterfall'], position: [960, 250], mapArea: 'qualibaf_bridge', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A rough trail climbs north.' },
    // Teleporter to the Qualibaf Waterfall map (goes back and forth). The
    // transition fires on walk-onto / click-on-self via arriveAtNode.
    { id: 'waterfall', name: 'To The Waterfall', description: 'The trail climbs out of sight toward the falls beyond.', encounterId: '', connections: ['trail_north'], position: [940, 100], mapArea: 'qualibaf_bridge', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The roar of falling water ahead.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'frontier_road';
  return map;
}

// === Qualibaf Waterfall Map (armorer's-son side quest, WIP) ===
// Reached from the 'To The Waterfall' node on the bridge map — a
// bidirectional teleport pair (transitionToQualibafWaterfall / Back in
// main.js). One entry node for now; the rescue beat continues here later.
export function createQualibafWaterfallMap() {
  const map = new GameMap('qualibaf_waterfall', 'The Waterfall');
  map.mapImages = {
    qualibaf_waterfall: 'Maps/QualibafWaterFallMap.jpg',
  };
  // Entry fires the one-shot arrival dialog (canRevisit:false) and acts as
  // the teleport-back node. From it, an off-trail ambush path of four
  // `discoverable` nodes climbs through cover toward the falls — the
  // "keep off the trail and find an opening" beat. Empty for now (WIP).
  const nodes = [
    { id: 'waterfall_entry', name: 'The Falls Trail', description: 'The trail crests into the waterfall valley, the falls thundering ahead beyond the river.', encounterId: 'qualibaf_waterfall_arrival', connections: ['ambush_rocks'], position: [840, 970], mapArea: 'qualibaf_waterfall', canRevisit: false },
    { id: 'ambush_rocks', name: 'Off the Trail', description: 'You slip off the trail into a jumble of mossy boulders, the column just visible below.', encounterId: '', connections: ['waterfall_entry', 'ambush_pines'], position: [910, 780], mapArea: 'qualibaf_waterfall', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Boulders break the slope off the trail.' },
    { id: 'ambush_pines', name: 'The Pinewood', description: 'Dense pines screen your approach as you shadow the wagon up the valley.', encounterId: '', connections: ['ambush_rocks', 'ambush_ledge'], position: [890, 610], mapArea: 'qualibaf_waterfall', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Dark pines climb the valley side.' },
    { id: 'ambush_ledge', name: 'The Spray Ledge', description: 'A wet ledge above the river, the falls roaring close now, mist soaking everything.', encounterId: '', connections: ['ambush_pines', 'ambush_overlook'], position: [780, 530], mapArea: 'qualibaf_waterfall', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A misted ledge above the water.' },
    { id: 'ambush_overlook', name: 'Forest Ambush', description: 'A vantage over the head of the column where it bunches at the mouth of the mountain — good cover, a clean line to the wagon.', encounterId: '', connections: ['ambush_ledge'], position: [620, 620], mapArea: 'qualibaf_waterfall', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A rise overlooking the falls.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'waterfall_entry';
  return map;
}

// === Filibaf Forest Map ===
export function createFilibafForestMap() {
  const map = new GameMap('filibaf_forest', 'Filibaf Forest');
  map.mapImages = {
    filibaf_forest: 'Maps/FilibafForestMap.jpg',
  };

  const nodes = [
    { id: 'forest_edge', name: 'Forest Edge', description: 'The edge of Filibaf Forest.', encounterId: '', connections: ['forest_shadows'], position: [512, 850], mapArea: 'filibaf_forest', canRevisit: true, unlocks: ['forest_shadows'] },
    { id: 'forest_shadows', name: 'Forest Shadows', description: 'Deep shadows among the trees.', encounterId: 'forest_shadows', connections: ['forest_edge', 'forest_ambush_left', 'forest_ambush_right'], position: [512, 600], mapArea: 'filibaf_forest', isLocked: true, unlocks: ['forest_ambush_left', 'forest_ambush_right'], hiddenName: '???' },
    { id: 'forest_ambush_left', name: 'Forest Ambush Left', description: 'A narrow path to the left.', encounterId: 'forest_ambush_left', connections: ['forest_shadows', 'forest_return_left'], position: [300, 400], mapArea: 'filibaf_forest', isLocked: true, unlocks: ['forest_return_left'], hiddenName: '???' },
    { id: 'forest_ambush_right', name: 'Forest Ambush Right', description: 'A narrow path to the right.', encounterId: 'forest_ambush_right', connections: ['forest_shadows', 'forest_return_right'], position: [700, 400], mapArea: 'filibaf_forest', isLocked: true, unlocks: ['forest_return_right'], hiddenName: '???' },
    { id: 'forest_return_left', name: 'Forest Return Left', description: 'A clearing on the left path.', encounterId: '', connections: ['forest_ambush_left'], position: [250, 150], mapArea: 'filibaf_forest', isLocked: true, hiddenName: '???' },
    { id: 'forest_return_right', name: 'Forest Return Right', description: 'A clearing on the right path.', encounterId: '', connections: ['forest_ambush_right'], position: [750, 150], mapArea: 'filibaf_forest', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'forest_edge';
  return map;
}

// === Tharnag Map ===
export function createTharnagMap() {
  const map = new GameMap('tharnag', 'Tharnag');
  map.mapImages = {
    tharnag: 'Maps/TharnagMap.jpg',
  };

  const nodes = [
    { id: 'tharnag_entry', name: 'Tharnag Entry', description: 'The approach to Tharnag.', encounterId: 'tharnag_arrival', connections: ['siege_gauntlet_1'], position: [930, 940], mapArea: 'tharnag', canRevisit: true },
    { id: 'siege_gauntlet_1', name: 'Siege Gauntlet 1', description: 'The first siege line.', encounterId: 'siege_gauntlet_1', connections: ['tharnag_entry', 'siege_gauntlet_2'], position: [550, 780], mapArea: 'tharnag', isLocked: true, unlocks: ['siege_gauntlet_2'], hiddenName: 'Siege Line' },
    { id: 'siege_gauntlet_2', name: 'Siege Gauntlet 2', description: 'The second siege line.', encounterId: 'siege_gauntlet_2', connections: ['siege_gauntlet_1', 'siege_gauntlet_3'], position: [440, 700], mapArea: 'tharnag', isLocked: true, unlocks: ['siege_gauntlet_3'], hiddenName: 'Siege Line' },
    { id: 'siege_gauntlet_3', name: 'Siege Gauntlet 3', description: 'The third siege line.', encounterId: 'siege_gauntlet_3', connections: ['siege_gauntlet_2', 'siege_gauntlet_dialog', 'north_pass'], position: [450, 570], mapArea: 'tharnag', isLocked: true, unlocks: ['siege_gauntlet_dialog'], hiddenName: 'Siege Line' },
    { id: 'siege_gauntlet_dialog', name: 'Siege Gauntlet Dialog', description: 'Beyond the siege lines.', encounterId: 'siege_gauntlet_dialog', connections: ['siege_gauntlet_3', 'tharnag_side_door'], position: [640, 580], mapArea: 'tharnag', isLocked: true, unlocks: ['tharnag_side_door'], hiddenName: '???' },
    { id: 'tharnag_side_door', name: 'Tharnag Side Door', description: 'A side entrance to Tharnag.', encounterId: 'tharnag_side_door', connections: ['siege_gauntlet_dialog'], position: [790, 450], mapArea: 'tharnag', isLocked: true, canRevisit: true, hiddenName: '???' },
    // Main Door — sits west of the Side Door. Cross-map back into
    // Tharnag's Grand Hall Main Entrance via the teleport pair in
    // arriveAtNode. Branches up the cliff into the Stairs of the
    // Infinite side quest. No direct link to the Side Door — the two
    // exterior gates are intentionally separate paths.
    { id: 'tharnag_main_door', name: 'Tharnag Main Door', description: 'The great front doors of Tharnag, scarred and propped open. A switchback road climbs up the cliff above.', encounterId: '', connections: ['mountain_path'], position: [540, 410], mapArea: 'tharnag', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A massive set of doors stands in the cliff face.' },
    // Post-dragon Stairs of the Infinite chain — unlocked once
    // mithrilRemediesVisited fires (the dialog tells the party to
    // climb the stairs after Olbrim). All three nodes start locked
    // and chain unlock via the standard `unlocks` field. The third
    // node (climbing_stairs) will cross-map to the upper-mountain
    // map once that art lands; for now it just sits as a placeholder.
    { id: 'mountain_path', name: 'Mountain Path', description: 'A narrow switchback path climbs the cliff face toward an old stairway carved into the rock.', encounterId: '', connections: ['tharnag_main_door', 'bottom_stairs'], position: [360, 450], mapArea: 'tharnag', canRevisit: true, isLocked: true, unlocks: ['bottom_stairs'], hiddenName: '???', hiddenDescription: 'A mountain path winds up the cliff.' },
    { id: 'bottom_stairs', name: 'Bottom of the Infinite Stairs', description: 'The mountain path ends at the foot of a colossal stairway. The dwarves call it the Stairs of the Infinite.', encounterId: '', connections: ['mountain_path', 'climbing_stairs'], position: [280, 360], mapArea: 'tharnag', canRevisit: true, isLocked: true, unlocks: ['climbing_stairs'], hiddenName: '???', hiddenDescription: 'A colossal stairway climbs the mountain.' },
    { id: 'climbing_stairs', name: 'Climbing the Stairs', description: 'You set foot on the Stairs of the Infinite. The climb begins.', encounterId: '', connections: ['bottom_stairs'], position: [420, 200], mapArea: 'tharnag', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'The stairway disappears into the mist.' },
    // North Pass — unlocked after the throne audience. Clicking it
    // hops to the Obsidian Wastes map (wastes_entry). Mirrors PY
    // map.py:1088-1099 + game.py:2322-2341.
    { id: 'north_pass', name: 'North Pass', description: 'A narrow mountain pass leading north to the Obsidian Wastes.', encounterId: '', connections: ['siege_gauntlet_3'], position: [60, 320], mapArea: 'tharnag', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A path continues north through the mountains.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tharnag_entry';
  return map;
}

// === Volcano Map ===
export function createVolcanoMap() {
  const map = new GameMap('volcano', 'Qualibaf Volcano');
  map.mapImages = {
    volcano: 'Maps/QualibafVolcano.jpg',
  };

  // Names + descriptions mirror PY map.py:create_volcano_map. Nodes
  // step up the slope: approach -> east -> crossing -> base, each one
  // unlocking the next. Drake-rider risk fires on every step past the
  // approach (handled in arriveAtNode). Volcano approach revisits warp
  // back to the Northern Wastes.
  const nodes = [
    { id: 'volcano_approach', name: 'Volcano Approach', description: "The frozen lava fields give way to the volcano's base.", encounterId: 'volcano_arrival', connections: ['volcano_east_path'], position: [642, 940], mapArea: 'volcano', canRevisit: true, unlocks: ['volcano_east_path'] },
    { id: 'volcano_east_path', name: 'Eastern Path', description: 'A winding path through frozen lava flows on the east side.', encounterId: '', connections: ['volcano_approach', 'volcano_lava_crossing'], position: [750, 790], mapArea: 'volcano', isLocked: true, canRevisit: true, unlocks: ['volcano_lava_crossing'] },
    { id: 'volcano_lava_crossing', name: 'Lava Crossing', description: 'Rivers of half-frozen lava crisscross the path ahead.', encounterId: '', connections: ['volcano_east_path', 'volcano_base'], position: [800, 630], mapArea: 'volcano', isLocked: true, canRevisit: true, unlocks: ['volcano_base'] },
    { id: 'volcano_base', name: 'Volcano Base', description: 'The mountain rises sheer above you. Kobold patrols are everywhere.', encounterId: 'volcano_choice', connections: ['volcano_lava_crossing'], position: [770, 540], mapArea: 'volcano', isLocked: true, canRevisit: true },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'volcano_approach';
  return map;
}

// === Lower Caverns Map (Chapter 7 — lower path) ===
// Mirrors PY map.py:create_lower_caverns_map. Three-node tunnel
// descent from the volcano base: entrance -> winding descent ->
// chamber opening. Player arrives at cavern_entrance which fires the
// lower_caverns_arrival narrative.
export function createLowerCavernsMap() {
  const map = new GameMap('lower_caverns', 'Tunnel to Lower Chamber');
  map.mapImages = {
    lower_caverns: 'Maps/VolcanoTunnelToLowerChamber.jpg',
  };

  const nodes = [
    // cavern_entrance: arrival dialog fires once (canRevisit:false so
    // the dialog doesn't replay). After done, walking back onto it
    // teleports the party back to the volcano map (handled in
    // arriveAtNode). Same pattern on chamber_entry below.
    { id: 'cavern_entrance', name: 'Cavern Entrance', description: 'A narrow opening in the rock leads down into darkness. Warm air rises from below.', encounterId: 'lower_caverns_arrival', connections: ['cavern_descent'], unlocks: ['cavern_descent'], position: [790, 740], mapArea: 'lower_caverns', hiddenName: '???', hiddenDescription: 'A passage leads back.' },
    { id: 'cavern_descent', name: 'Winding Descent', description: 'The tunnel spirals downward, carved by ancient lava flows. Obsidian veins glitter in the walls.', encounterId: '', connections: ['cavern_entrance', 'cavern_exit'], unlocks: ['cavern_entrance', 'cavern_exit'], isLocked: true, canRevisit: true, position: [550, 510], mapArea: 'lower_caverns', hiddenName: '???', hiddenDescription: 'The tunnel continues deeper.' },
    { id: 'cavern_exit', name: 'Chamber Opening', description: 'The tunnel widens dramatically. A vast cavern opens up ahead, glowing with inner heat.', encounterId: '', connections: ['cavern_descent'], isLocked: true, canRevisit: true, position: [280, 330], mapArea: 'lower_caverns', hiddenName: '???', hiddenDescription: 'Something glows in the distance.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'cavern_entrance';
  return map;
}

// === Lava Chamber Map (Chapter 7 — lower path, second area) ===
// Mirrors PY map.py:create_lava_chamber_map. Five-node climb from
// the lower-caverns exit up through molten rivers to the obsidian
// tunnels above. Both the bottom entry (chamber_entry) AND the top
// entry (upper_passage) carry the same arrival encounter id so the
// "first visit" dialog fires exactly once regardless of direction.
export function createLavaChamberMap() {
  const map = new GameMap('lava_chamber', 'Lava Lower Chamber');
  map.mapImages = {
    lava_chamber: 'Maps/VolcanoLavvaLowerChamber.jpg',
  };

  // Symmetric unlocks: every inner node lists BOTH neighbors in its
  // unlocks array so the path opens in either direction as the player
  // walks through. Means a future top-entry at upper_passage chains
  // back down through thermal_vent → magma_shelf → lava_bridge →
  // chamber_entry the same way the bottom-entry chains up. The
  // arrival encounter id is stamped on both terminal nodes so the
  // first-visit dialog fires exactly once regardless of direction
  // (completedEncounters force-isDone catches the second-time entry).
  const nodes = [
    // chamber_entry / upper_passage: terminal arrival nodes. The
    // dialog fires once (canRevisit:false), then subsequent arrivals
    // teleport the party back to the previous map (see arriveAtNode).
    { id: 'chamber_entry', name: 'Chamber Entry', description: 'You emerge into a massive underground cavern. Rivers of sluggish lava cast an orange glow over everything.', encounterId: 'lava_chamber_arrival', connections: ['lava_bridge'], unlocks: ['lava_bridge'], position: [1080, 750], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'lava_bridge', name: 'Lava Bridge', description: 'A natural stone bridge spans a river of slowly moving magma.', encounterId: '', connections: ['chamber_entry', 'magma_shelf'], unlocks: ['chamber_entry', 'magma_shelf'], isLocked: true, canRevisit: true, position: [960, 500], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'A crossing of some kind.' },
    { id: 'magma_shelf', name: 'Magma Shelf', description: 'A wide ledge of cooled obsidian overlooks the churning magma below.', encounterId: '', connections: ['lava_bridge', 'thermal_vent'], unlocks: ['lava_bridge', 'thermal_vent'], isLocked: true, canRevisit: true, position: [570, 420], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'A dark shelf above the glow.' },
    { id: 'thermal_vent', name: 'Thermal Vent', description: 'Superheated air blasts upward through cracks in the floor. The walls are streaked with mineral deposits.', encounterId: '', connections: ['magma_shelf', 'upper_passage'], unlocks: ['magma_shelf', 'upper_passage'], isLocked: true, canRevisit: true, position: [630, 250], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'Heat shimmers in the air ahead.' },
    { id: 'upper_passage', name: 'Upper Passage', description: 'The path climbs steeply, leaving the magma behind. Cooler obsidian tunnels branch ahead.', encounterId: 'lava_chamber_arrival', connections: ['thermal_vent'], unlocks: ['thermal_vent'], isLocked: true, canRevisit: false, position: [670, 50], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'The path leads upward.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'chamber_entry';
  return map;
}

// === Obsidian Tunnels Map (Chapter 7 — branching hub above the
// lava chamber). Mirrors PY map.py:create_obsidian_tunnels_map.
// Tree layout: tunnel_entry (bottom) → obsidian_ledge →
// tunnel_junction (4-way) → { north_tunnel, west_tunnel,
// southeast_tunnel → pillar_passage }. The three terminal arms
// (north/west/pillar) each connect to a future chapter 7+ area
// (Temple District, Obsidian Forge, etc.). All four terminal nodes
// carry the same arrival encounter id so the first-visit dialog
// plays once regardless of which entry the player uses.
// Inner-node unlocks list both connections so the chain opens in
// either direction (matches the lava_chamber pattern).
export function createObsidianTunnelsMap() {
  const map = new GameMap('obsidian_tunnels', 'Obsidian Tunnels');
  map.mapImages = {
    obsidian_tunnels: 'Maps/VolcanoObsidianTunnel.jpg',
  };

  const nodes = [
    { id: 'tunnel_entry',     name: 'Tunnel Entry',       description: 'The obsidian tunnels stretch before you, smooth walls reflecting your torchlight in dark mirrors.', encounterId: 'obsidian_tunnels_arrival', connections: ['obsidian_ledge'], unlocks: ['obsidian_ledge'], position: [420, 740], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'obsidian_ledge',   name: 'Obsidian Ledge',     description: 'A narrow ledge of razor-sharp obsidian juts over a deep chasm. One wrong step and it\'s a long way down.', encounterId: '', connections: ['tunnel_entry', 'tunnel_junction'], unlocks: ['tunnel_entry', 'tunnel_junction'], isLocked: true, canRevisit: true, position: [620, 590], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A narrow ledge ahead.' },
    { id: 'tunnel_junction',  name: 'Tunnel Junction',    description: 'The tunnel splits into a wide crossroads. Faded carvings mark the walls in three directions.', encounterId: '', connections: ['obsidian_ledge', 'north_tunnel', 'southeast_tunnel', 'west_tunnel'], unlocks: ['obsidian_ledge', 'north_tunnel', 'southeast_tunnel', 'west_tunnel'], isLocked: true, canRevisit: true, position: [810, 430], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'The tunnel branches ahead.' },
    { id: 'north_tunnel',     name: 'North Passage',      description: 'A wide, well-traveled passage heading north. The air hums with distant activity.', encounterId: 'obsidian_tunnels_arrival', connections: ['tunnel_junction'], unlocks: ['tunnel_junction'], isLocked: true, canRevisit: false, position: [880, 180], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage heading north.' },
    { id: 'southeast_tunnel', name: 'Southeast Passage',  description: 'A narrow tunnel sloping downward to the southeast. The walls are scorched black.', encounterId: '', connections: ['tunnel_junction', 'pillar_passage'], unlocks: ['tunnel_junction', 'pillar_passage'], isLocked: true, canRevisit: true, position: [950, 340], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage heading southeast.' },
    { id: 'pillar_passage',   name: 'Behind the Pillar',  description: 'A hidden passage behind a massive obsidian pillar. The air here is thick with heat from somewhere below.', encounterId: 'obsidian_tunnels_arrival', connections: ['southeast_tunnel'], unlocks: ['southeast_tunnel'], isLocked: true, position: [1310, 450], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'Something behind the pillar.' },
    { id: 'west_tunnel',      name: 'West Passage',       description: 'A corridor heading west, lined with ancient carvings. A faint scent of old incense drifts from the darkness.', encounterId: 'obsidian_tunnels_arrival', connections: ['tunnel_junction'], unlocks: ['tunnel_junction'], isLocked: true, position: [440, 360], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage heading west.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnel_entry';
  return map;
}

// === Temple District Map (Chapter 7 — west branch from
// west_tunnel). Mirrors PY map.py:create_temple_district_map.
// Inner Road is the 4-way hub. temple_left_passage leads to the
// future Obsidian Cathedral; temple_deep_chamber is the volcano_heart
// encounter (not yet wired). For now they settle silently on arrival.
export function createTempleDistrictMap() {
  const map = new GameMap('temple_district', 'Temple District');
  map.mapImages = {
    temple_district: 'Maps/ObsidianTempleDistrict.jpg',
  };

  const nodes = [
    { id: 'temple_entry',         name: 'Temple Entry',     description: 'The tunnel opens into a vast chamber lined with crumbling stone columns. The air is heavy with the scent of old incense.', encounterId: 'temple_district_arrival', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], position: [650, 760], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A chamber opens here.' },
    { id: 'temple_inner_road',    name: 'Inner Road',        description: 'A wide road of polished obsidian stretches through the heart of the district. Passages branch off in several directions.', encounterId: '', connections: ['temple_entry', 'temple_side_passage', 'temple_left_passage', 'temple_deep_chamber'], unlocks: ['temple_entry', 'temple_side_passage', 'temple_left_passage', 'temple_deep_chamber'], isLocked: true, canRevisit: true, position: [690, 520], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A wide road ahead.' },
    { id: 'temple_side_passage',  name: 'Side Passage',     description: 'A narrow passage branches off to the right, partially concealed by fallen masonry.', encounterId: 'temple_district_arrival_side', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], isLocked: true, canRevisit: false, position: [1180, 540], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A passage to the right.' },
    { id: 'temple_left_passage',  name: 'Gate to Cathedral', description: 'A grand archway leads to what was once a cathedral. Faded murals of forgotten deities line the walls.', encounterId: '', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], isLocked: true, canRevisit: true, position: [300, 550], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A passage to the left.' },
    { id: 'temple_deep_chamber',  name: 'Deep Chamber',     description: 'The deepest part of the temple district. Strange symbols glow faintly on the obsidian walls.', encounterId: 'volcano_heart', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], isLocked: true, canRevisit: true, position: [790, 360], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A faint glow in the distance.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'temple_entry';
  return map;
}

// === Obsidian Cathedral Map (Chapter 7 — accessed from the temple
// district's left passage). Mirrors PY map.py:create_obsidian_cathedral_map.
// Three-node lane: cathedral_entry (arrival dialog) → cathedral_ruins
// (Obsidian Oracle mini-boss) → cathedral_shrine (pray for a tier 2
// ability OR rest for 8 HP).
export function createObsidianCathedralMap() {
  const map = new GameMap('obsidian_cathedral', 'Obsidian Cathedral');
  map.mapImages = {
    obsidian_cathedral: 'Maps/ObsidianCathedral.jpg',
  };

  const nodes = [
    { id: 'cathedral_entry',  name: 'Cathedral Entry',  description: 'The archway opens into a vast ruined cathedral. Broken pillars rise into darkness above.', encounterId: 'cathedral_arrival', connections: ['cathedral_ruins'], unlocks: ['cathedral_ruins'], position: [970, 750], mapArea: 'obsidian_cathedral' },
    { id: 'cathedral_ruins',  name: 'Cathedral Ruins',  description: 'The remains of the cathedral nave. Shattered pews and fallen stones litter the floor.', encounterId: 'obsidian_oracle', connections: ['cathedral_entry', 'cathedral_shrine'], unlocks: ['cathedral_shrine'], isLocked: true, position: [650, 570], mapArea: 'obsidian_cathedral', hiddenName: '???', hiddenDescription: 'Ruins stretch ahead.' },
    { id: 'cathedral_shrine', name: 'Ancient Shrine',   description: 'At the far end of the cathedral, a shrine stands untouched by time. Strange power radiates from it.', encounterId: 'cathedral_shrine', connections: ['cathedral_ruins'], isLocked: true, canRevisit: true, position: [920, 440], mapArea: 'obsidian_cathedral', hiddenName: '???', hiddenDescription: 'Something glows at the end of the cathedral.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'cathedral_entry';
  return map;
}

// === Obsidian Plaza Map (Chapter 7 — north passage hub). Mirrors
// PY map.py:create_obsidian_plaza_map. Two entry points feed into the
// same map: north_tunnel (obsidian_tunnels) lands on plaza_entry, and
// the temple_side_passage (temple_district) lands on plaza_west. Both
// of those nodes share the same `obsidian_plaza_arrival` encounter id
// so the first visit (from either side) plays the dialog once; the
// global completedEncounters force-isDone rule blocks the re-fire.
// plaza_center is the one-time Magma Drake mini-boss fight.
export function createObsidianPlazaMap() {
  const map = new GameMap('obsidian_plaza', 'Obsidian Plaza');
  map.mapImages = {
    obsidian_plaza: 'Maps/ObsidianPlaza.jpg',
  };

  const nodes = [
    { id: 'plaza_entry',     name: 'Plaza Entry',      description: 'The tunnel opens into a vast underground plaza. Obsidian pillars rise to a ceiling lost in shadow.', encounterId: 'obsidian_plaza_arrival', connections: ['plaza_center'], unlocks: ['plaza_center'], position: [520, 730], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'plaza_center',    name: 'Center Plaza',     description: 'The heart of the plaza. A crumbling fountain of obsidian stands at the center, long dry.', encounterId: 'magma_drake', connections: ['plaza_entry', 'plaza_west', 'plaza_north', 'plaza_northwest'], unlocks: ['plaza_west', 'plaza_north', 'plaza_northwest'], isLocked: true, position: [720, 420], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'The center of the plaza.' },
    { id: 'plaza_west',      name: 'Western Passage',  description: 'A passage heading west toward the Temple District. Faded carvings mark the archway.', encounterId: 'obsidian_plaza_arrival_west', connections: ['plaza_center'], unlocks: ['plaza_center'], isLocked: true, position: [240, 550], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A passage to the west.' },
    { id: 'plaza_north',     name: 'Northern Corridor', description: 'A wide corridor stretches north into darkness. The air grows colder.', encounterId: '', connections: ['plaza_center'], unlocks: ['plaza_center'], isLocked: true, canRevisit: true, position: [730, 190], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A corridor heading north.' },
    { id: 'plaza_northwest', name: 'Northwest Passage', description: 'A narrow passage winds northwest. Strange sounds echo from within.', encounterId: 'obsidian_plaza_arrival_nw', connections: ['plaza_center'], unlocks: ['plaza_center'], isLocked: true, canRevisit: false, position: [160, 400], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A passage heading northwest.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'plaza_entry';
  return map;
}

// === Obsidian Streets Map (Chapter 7 — reached via the plaza's
// Northern Corridor). Mirrors PY map.py:create_obsidian_streets_map.
// Linear flow: streets_entry → streets_market → streets_residential
// → streets_upper. streets_upper will lead to the Upper Bridge in a
// future pass (left as a locked dead-end here).
export function createObsidianStreetsMap() {
  const map = new GameMap('obsidian_streets', 'Obsidian Streets');
  map.mapImages = {
    obsidian_streets: 'Maps/ObsidianStreets.jpg',
  };

  const nodes = [
    { id: 'streets_entry',       name: 'Streets Entry',       description: 'The corridor opens into a network of narrow obsidian streets. Buildings carved from the rock line both sides.', encounterId: 'obsidian_streets_arrival', connections: ['streets_market'], unlocks: ['streets_market'], position: [920, 740], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'streets_market',      name: 'Quiet Crossroads',    description: 'A small intersection where several streets meet. Faded signs hang above doorways long sealed shut.', encounterId: '', connections: ['streets_entry', 'streets_residential'], unlocks: ['streets_residential'], isLocked: true, canRevisit: true, position: [760, 560], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'Open space ahead.' },
    { id: 'streets_residential', name: 'Residential Quarter', description: 'Rows of small dwellings carved into the obsidian walls. Some still have furnishings inside.', encounterId: '', connections: ['streets_market', 'streets_upper'], unlocks: ['streets_upper'], isLocked: true, canRevisit: true, position: [640, 490], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'Dwellings line the walls.' },
    { id: 'streets_upper',       name: 'To the Bridge',       description: 'The streets climb upward, opening to a vast underground bridge spanning a chasm of darkness.', encounterId: 'obsidian_streets_arrival_upper', connections: ['streets_residential'], isLocked: true, canRevisit: false, position: [580, 360], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'The streets rise ahead.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'streets_entry';
  return map;
}

// === Obsidian Market Map (Chapter 7 — reached via the plaza's
// Northern Corridor). Mirrors PY map.py:create_obsidian_market_map.
// Flow: market_entry → market_street (4-way hub) → market_stalls
// (search-for-loot) + market_square → market_deep (rest).
export function createObsidianMarketMap() {
  const map = new GameMap('obsidian_market', 'Obsidian Market');
  map.mapImages = {
    obsidian_market: 'Maps/ObsidianMarket.jpg',
  };

  const nodes = [
    { id: 'market_entry',  name: 'Market Entry',  description: 'The corridor opens into a vast marketplace. Stalls and shops stretch in every direction.', encounterId: 'obsidian_market_arrival', connections: ['market_street'], unlocks: ['market_street'], position: [560, 740], mapArea: 'obsidian_market' },
    { id: 'market_street', name: 'Market Street', description: 'A wide street flanked by merchant stalls. The obsidian cobblestones are worn smooth by countless footsteps.', encounterId: '', connections: ['market_entry', 'market_stalls', 'market_square'], unlocks: ['market_stalls', 'market_square'], isLocked: true, canRevisit: true, position: [750, 620], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'A wide street ahead.' },
    { id: 'market_stalls', name: 'Market Stalls', description: 'Rows of abandoned stalls, some still bearing goods covered in dust.', encounterId: 'market_stalls', connections: ['market_street'], unlocks: ['market_street'], isLocked: true, canRevisit: true, position: [570, 450], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'Stalls line the passage.' },
    { id: 'market_square', name: 'Market Square', description: 'The central square of the market. A dry fountain sits at its center, surrounded by larger shops.', encounterId: '', connections: ['market_street', 'market_deep'], unlocks: ['market_deep'], isLocked: true, canRevisit: true, position: [1130, 550], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'An open space ahead.' },
    { id: 'market_deep',   name: 'Deep Market',   description: 'The far end of the market. Larger warehouses and sealed vaults line the walls.', encounterId: 'deep_market_rest', connections: ['market_square'], isLocked: true, canRevisit: true, position: [1240, 460], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'Something larger lies beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'market_entry';
  return map;
}

// === Upper Bridge Map (Chapter 7 — reached via the obsidian streets'
// streets_upper exit). Mirrors PY map.py:create_upper_bridge_map.
// Flow: bridge_down_city (entry from streets) → bridge_entry
// (General Zhost's Revenge boss fight) → bridge_middle →
// bridge_far_side → bridge_to_volcano (point-of-no-return bridge
// crossing dialog). bridge_to_dwarven is a future side exit.
export function createUpperBridgeMap() {
  const map = new GameMap('upper_bridge', 'The Upper Bridge');
  map.mapImages = {
    upper_bridge: 'Maps/UpperBridgeMap.jpg',
  };

  const nodes = [
    { id: 'bridge_down_city',  name: 'Down to Obsidian City', description: 'A stairway descends back toward the streets of the underground city below.', encounterId: 'upper_bridge_arrival', connections: ['bridge_entry'], unlocks: ['bridge_entry'], canRevisit: false, position: [120, 620], mapArea: 'upper_bridge' },
    { id: 'bridge_entry',      name: 'Bridge Entry',          description: 'The streets open onto a massive obsidian bridge. It spans a seemingly bottomless chasm, disappearing into darkness on the far side.', encounterId: 'zhost_revenge', connections: ['bridge_down_city', 'bridge_middle', 'bridge_to_dwarven'], unlocks: ['bridge_down_city', 'bridge_middle', 'bridge_to_dwarven'], isLocked: true, canRevisit: false, position: [370, 490], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'The bridge stretches ahead.' },
    { id: 'bridge_to_dwarven', name: 'Up to Dwarven City',    description: 'A passage leads back toward the upper levels of an ancient dwarven settlement.', encounterId: 'upper_bridge_arrival', connections: ['bridge_entry'], isLocked: true, canRevisit: false, position: [480, 740], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'A passage leads somewhere.' },
    { id: 'bridge_middle',     name: 'Bridge Midpoint',       description: 'The center of the bridge. Wind howls up from the chasm below. The far side is barely visible through the gloom.', encounterId: '', connections: ['bridge_entry', 'bridge_far_side'], unlocks: ['bridge_far_side'], isLocked: true, canRevisit: true, position: [780, 380], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'The bridge stretches on.' },
    { id: 'bridge_far_side',   name: 'Far Side',              description: 'The far end of the bridge. A great obsidian gate looms ahead, partially open.', encounterId: '', connections: ['bridge_middle', 'bridge_to_volcano'], unlocks: ['bridge_to_volcano'], isLocked: true, canRevisit: true, position: [1000, 310], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'Something looms on the far side.' },
    { id: 'bridge_to_volcano', name: 'To Upper Volcano',      description: "A steep path climbs upward toward the volcano's upper chambers.", encounterId: 'bridge_crossing', connections: ['bridge_far_side'], isLocked: true, canRevisit: true, position: [590, 90], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'A path leads upward.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'bridge_down_city';
  return map;
}

// === Volcano Stairs Maps (Chapter 8 — post-bridge climb into the
// upper volcano). Three back-to-back maps form a linear ascent:
// stairs_1 → stairs_2 → stairs_3. Each map has 5 nodes wired
// linearly entry → 3 middle → exit. The exit node of map N
// auto-transitions to the entry of map N+1 (cross-map gate in
// main.js arriveAtNode, same pattern as streets_upper →
// bridge_down_city). No encounters yet — placeholder lanes that
// the next content pass will populate.
function buildVolcanoStairsMap(id, label, imageKey, imageFile, entryId, middleIds, exitId, entryName, exitName, positions) {
  const map = new GameMap(id, label);
  map.mapImages = { [imageKey]: imageFile };
  // positions: [entry, mid_a, mid_b, mid_c, exit] — per-map override
  // so each stairway's dots can be tuned against its own background.
  const nodes = [
    {
      id: entryId,
      name: entryName,
      description: `The stair levels out for a breath before the climb resumes.`,
      encounterId: '',
      connections: [middleIds[0]],
      unlocks: [middleIds[0]],
      canRevisit: true,
      position: positions[0],
      mapArea: id,
    },
    {
      id: middleIds[0],
      name: 'Ascending Steps',
      description: 'Volcanic stone steps wind upward, glowing faintly at the edges.',
      encounterId: '',
      connections: [entryId, middleIds[1]],
      unlocks: [middleIds[1]],
      isLocked: true,
      canRevisit: true,
      position: positions[1],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'Steps climb ahead.',
    },
    {
      id: middleIds[1],
      name: 'Landing',
      description: 'A narrow landing carved from black rock. Heat radiates from below.',
      encounterId: '',
      connections: [middleIds[0], middleIds[2]],
      unlocks: [middleIds[2]],
      isLocked: true,
      canRevisit: true,
      position: positions[2],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'A landing waits.',
    },
    {
      id: middleIds[2],
      name: 'Higher Steps',
      description: 'The stair steepens. Below, the molten chasm stretches out of sight.',
      encounterId: '',
      connections: [middleIds[1], exitId],
      unlocks: [exitId],
      isLocked: true,
      canRevisit: true,
      position: positions[3],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'The stair climbs higher.',
    },
    {
      id: exitId,
      name: exitName,
      description: 'The stair continues beyond into the next stretch of the climb.',
      encounterId: '',
      connections: [middleIds[2]],
      isLocked: true,
      canRevisit: true,
      position: positions[4],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'The stair continues upward.',
    },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = entryId;
  return map;
}

// Default fallback positions for the stairs maps when no per-map
// override has been authored yet. Hand-tuned via the debug node-
// position editor (ctrl-click + arrow keys).
const _STAIRS_DEFAULT_POSITIONS = [
  [180, 820], [380, 640], [560, 470], [740, 300], [920, 140],
];

export function createVolcanoStairs1Map() {
  return buildVolcanoStairsMap(
    'volcano_stairs_1', 'Volcano Stairs - Lower',
    'volcano_stairs_1', 'Maps/VolcanoStairs1.jpg',
    'stairs1_entry', ['stairs1_a', 'stairs1_b', 'stairs1_c'], 'stairs1_exit',
    'Stair Foot', 'Upward Bend',
    // User-tuned via the debug node-position editor.
    [
      [380, 910],  // Stair Foot
      [211, 660],  // Ascending Steps
      [800, 420],  // Landing
      [340, 160],  // Higher Steps
      [590, 70],   // Upward Bend
    ],
  );
}

export function createVolcanoStairs2Map() {
  return buildVolcanoStairsMap(
    'volcano_stairs_2', 'Volcano Stairs - Middle',
    'volcano_stairs_2', 'Maps/VolcanoStairs2.jpg',
    'stairs2_entry', ['stairs2_a', 'stairs2_b', 'stairs2_c'], 'stairs2_exit',
    'Mid-Stair Landing', 'Higher Path',
    // User-tuned via the debug node-position editor.
    [
      [640, 930],  // Mid-Stair Landing
      [240, 700],  // Ascending Steps
      [660, 460],  // Landing
      [450, 390],  // Higher Steps
      [640, 310],  // Higher Path
    ],
  );
}

export function createVolcanoStairs3Map() {
  return buildVolcanoStairsMap(
    'volcano_stairs_3', 'Volcano Stairs - Upper',
    'volcano_stairs_3', 'Maps/VolcanoStairs3.jpg',
    'stairs3_entry', ['stairs3_a', 'stairs3_b', 'stairs3_c'], 'stairs3_exit',
    'Upper Stair Landing', 'To Summit Ridge',
    // User-tuned via the debug node-position editor.
    [
      [930, 870],  // Upper Stair Landing
      [370, 790],  // Ascending Steps
      [880, 450],  // Landing
      [490, 240],  // Higher Steps
      [560, 150],  // To Summit Ridge
    ],
  );
}

// === Volcano Summit Ridge Map (Chapter 8 — exit of the stairs
// climb). Player walks onto a clifftop plateau. 4 nodes: 1 entry
// (back-teleport to stairs3_exit), 2 stair-path movement nodes,
// 1 ridge encounter node. Encounter TBD.
export function createVolcanoSummitRidgeMap() {
  const map = new GameMap('volcano_summit_ridge', 'Volcano Summit Ridge');
  map.mapImages = { volcano_summit_ridge: 'Maps/Volcano_SummitRidge.jpg' };
  // Fully open plateau — every node unlocked from the start (NO_FOG_MAPS
  // already removes the fog overlay, and now there's nothing keeping
  // the player from clicking forward as soon as they arrive). Click
  // adjacency still forces them along the chain entry → a → b → ridge.
  const nodes = [
    // Entry — drops in from the stairs (image's stair landing at the
    // bottom-right). Click-on-self back-teleports to stairs3_exit.
    { id: 'summit_entry',     name: 'Stair Top',     description: 'The stair levels out onto a wind-swept ridge.', encounterId: 'stair_top_arrival', connections: ['summit_path_a'], unlocks: ['summit_path_a'], canRevisit: false, position: [1160, 750], mapArea: 'volcano_summit_ridge' },
    { id: 'summit_path_a',    name: 'Ridge Stairs',  description: 'Rough-cut steps lead upward along the clifftop.', encounterId: '', connections: ['summit_entry', 'summit_path_b'], unlocks: ['summit_path_b'], canRevisit: true, position: [900, 430], mapArea: 'volcano_summit_ridge' },
    { id: 'summit_path_b',    name: 'Higher Steps',  description: 'The path narrows. The sheer drop yawns to the left.', encounterId: '', connections: ['summit_path_a', 'summit_ridge'], unlocks: ['summit_ridge'], canRevisit: true, position: [1170, 220], mapArea: 'volcano_summit_ridge' },
    // Boss node on the ridge — Overseer Gnikan, kobold frost shaman.
    // canRevisit=true so the player can walk back here post-dragon to
    // fire the ridge_post_dragon_offer "leave?" dialog (the dragonSlain
    // gate in startNodeEncounter swaps the Gnikan fight for the
    // farewell prompt).
    { id: 'summit_ridge',     name: 'The Ridge',     description: 'A bare obsidian ridge above the volcano. A lone figure waits at the far end.', encounterId: 'overseer_gnikan', connections: ['summit_path_b'], canRevisit: true, position: [690, 130], mapArea: 'volcano_summit_ridge' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'summit_entry';
  return map;
}

// === Obsidian Forge Map (Chapter 7 — southeast branch from
// pillar_passage). Mirrors PY map.py:create_obsidian_forge_map.
// Three-node lane: forge_entry → forge_passage → the_obsidian_forge.
// forge_entry is the only entry slot (no future side-routes here);
// the_obsidian_forge is the inner shrine, encounter to be wired
// later. forge_passage is the rolling random-encounter node.
export function createObsidianForgeMap() {
  const map = new GameMap('obsidian_forge', 'The Obsidian Forge');
  map.mapImages = {
    obsidian_forge: 'Maps/TheObsidianForge.jpg',
  };

  const nodes = [
    { id: 'forge_entry',        name: 'Forge Entry',     description: 'The tunnel opens into a scorching chamber. The walls glow with residual heat from ancient forges.', encounterId: 'obsidian_forge_arrival', connections: ['forge_passage'], unlocks: ['forge_passage'], position: [210, 310], mapArea: 'obsidian_forge' },
    { id: 'forge_passage',      name: 'Molten Corridor', description: 'A wide corridor lined with dormant furnaces. Slag and cooled metal litter the floor.', encounterId: '', connections: ['forge_entry', 'the_obsidian_forge'], unlocks: ['forge_entry', 'the_obsidian_forge'], isLocked: true, canRevisit: true, position: [400, 590], mapArea: 'obsidian_forge', hiddenName: '???', hiddenDescription: 'A corridor stretches ahead.' },
    { id: 'the_obsidian_forge', name: 'The Obsidian Forge', description: 'A massive forge dominates the chamber, its anvil carved from a single block of obsidian. Even dormant, the air shimmers with heat.', encounterId: 'obsidian_forge', connections: ['forge_passage'], unlocks: ['forge_passage'], isLocked: true, canRevisit: true, position: [830, 420], mapArea: 'obsidian_forge', hiddenName: '???', hiddenDescription: 'An intense heat radiates from ahead.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'forge_entry';
  return map;
}

// === Obsidian Wastes Map ===
// Base map only carries the entry + exit. The labyrinth in between
// is generated procedurally via generateLabyrinthNodes(map, seed) on
// the first arrival, then re-generated from the same seed on load.
// Mirrors PY map.py:create_obsidian_wastes_map.
export function createObsidianWastesMap() {
  const map = new GameMap('obsidian_wastes', 'Obsidian Wastes');
  map.mapImages = {
    obsidian_wastes: 'Maps/ObsidianWastesMap.jpg',
  };

  const nodes = [
    // Encounter is single-shot — once the arrival dialog plays, the
    // node becomes a cross-map teleporter back to Tharnag's North
    // Pass (handled in handleMapClick via isCrossMapGate +
    // arriveAtNode's wastes_entry-revisit branch). canRevisit stays
    // false so the dialog never re-fires.
    { id: 'wastes_entry', name: 'Edge of the Wastes', description: 'The frozen lava fields begin here, stretching endlessly northward.', encounterId: 'obsidian_wastes_arrival', connections: [], position: [500, 950], mapArea: 'obsidian_wastes' },
    // Northern Wastes — rest-stop encounter is single-shot. After it
    // plays once, the node becomes a cross-map teleporter to the
    // Qualibaf Volcano (handled in handleMapClick via isCrossMapGate +
    // arriveAtNode's wastes_north revisit branch). canRevisit stays
    // false so the rest dialog never repeats.
    { id: 'wastes_north', name: 'Northern Wastes', description: 'The Volcano looms closer. Thorgazad must be near.', encounterId: 'wastes_north', connections: [], position: [410, 220], mapArea: 'obsidian_wastes', isLocked: true, hiddenName: '???', hiddenDescription: 'Something ahead, near the Volcano.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'wastes_entry';
  return map;
}

// Procedural labyrinth generation between wastes_entry and
// wastes_north. Mirrors PY map.py:generate_labyrinth_nodes — same
// shape, same seeded RNG behavior so the generated layout is
// deterministic per playthrough.
const LABYRINTH_NAMES = [
  'Obsidian Tunnel', 'Lava Crust Passage', 'Glass Cavern',
  'Molten Corridor', 'Basalt Chamber', 'Cinder Path',
  'Volcanic Vent', 'Sulfur Grotto', 'Magma Seam',
  'Scorched Gallery', 'Ember Crossing', 'Ash-Choked Passage',
  'Obsidian Ridge', 'Crystal Vein', 'Slag Heap',
  'Smoke-Filled Chamber', 'Cooled Flow', 'Black Glass Trail',
  'Fissure Path', 'Pyroclast Tunnel',
];
const LABYRINTH_DESCRIPTIONS = [
  'Sharp obsidian formations crunch underfoot. The haze is thick here.',
  'The ground is warm beneath your feet. Faint red light pulses from cracks below.',
  'Walls of jagged black glass rise on either side, distorting your reflection.',
  'Sulfurous fumes sting your eyes. The path narrows between volcanic boulders.',
  'A vast cavern of cooled lava, its ceiling lost in darkness above.',
  'The obsidian here is smooth as a mirror, treacherous to walk on.',
  'Thin wisps of steam rise from vents in the rock floor.',
  'Broken columns of basalt stand like petrified trees in the fog.',
  'The air shimmers with heat. Pools of molten rock glow dimly nearby.',
  'A narrow passage between towering obsidian walls. Every sound echoes.',
  'The ground slopes unpredictably. Loose volcanic gravel slides beneath your boots.',
  'Crystals of yellow sulfur crust the walls, casting a sickly glow.',
  'A wide chamber where the lava cooled in strange rippling waves.',
  'The fog is so thick you can barely see your own hands.',
  'Scorched rock formations twist into bizarre, almost organic shapes.',
  'A thin crust of obsidian over hollow ground — every step feels precarious.',
  'The path forks around a massive volcanic boulder, then rejoins.',
  'Ash drifts like black snow from somewhere above.',
  'A field of obsidian shards, sharp as broken glass, blocks easy passage.',
  'The remnants of an ancient lava tube, its walls smooth and dark.',
];

// Tiny seeded PRNG so layouts are deterministic for a given seed.
// Mulberry32 — fast, non-crypto, fine for layout reproducibility.
function _seededRng(seed) {
  let s = (seed >>> 0) || 1;
  return function() {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function _rngInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function _rngChoice(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function _rngShuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function _rngSample(rng, arr, k) {
  return _rngShuffle(rng, arr.slice()).slice(0, k);
}

export function generateLabyrinthNodes(gameMap, seed) {
  const rng = _seededRng(seed);
  // 7 inner tiers of 3-5 nodes each.
  const tierSizes = Array.from({ length: 7 }, () => _rngInt(rng, 3, 5));
  const names = _rngShuffle(rng, LABYRINTH_NAMES.slice());
  const descs = _rngShuffle(rng, LABYRINTH_DESCRIPTIONS.slice());

  const tiers = [['wastes_entry']];
  for (let t = 1; t <= tierSizes.length; t++) {
    const ids = [];
    for (let i = 0; i < tierSizes[t - 1]; i++) ids.push(`lab_${t}_${i}`);
    tiers.push(ids);
  }
  tiers.push(['wastes_north']);

  // Random positions, min 80px spacing.
  const allLab = {};
  const used = [];
  let nameIdx = 0;
  for (let t = 1; t < tiers.length - 1; t++) {
    for (const nodeId of tiers[t]) {
      let x = 0, y = 0;
      for (let attempt = 0; attempt < 50; attempt++) {
        x = _rngInt(rng, 100, 900);
        y = _rngInt(rng, 120, 850);
        let close = false;
        for (const [px, py] of used) {
          if (Math.abs(x - px) < 80 && Math.abs(y - py) < 80) { close = true; break; }
        }
        if (!close) break;
      }
      used.push([x, y]);
      allLab[nodeId] = {
        name: names[nameIdx % names.length],
        description: descs[nameIdx % descs.length],
        position: [x, y],
      };
      nameIdx++;
    }
  }

  // Build connection graph.
  const allNodeIds = [].concat(...tiers);
  const connections = {};
  for (const nid of allNodeIds) connections[nid] = [];

  for (let t = 0; t < tiers.length - 1; t++) {
    const cur = tiers[t];
    const next = tiers[t + 1];
    // Every next-tier node has at least one incoming forward edge.
    for (const nextNid of next) {
      const parent = _rngChoice(rng, cur);
      if (!connections[parent].includes(nextNid)) connections[parent].push(nextNid);
    }
    // wastes_entry caps at 3 forward connections.
    if (t === 0) {
      const fwd = connections['wastes_entry'].filter(c => next.includes(c));
      if (fwd.length > 3) {
        const keep = _rngSample(rng, fwd, 3);
        connections['wastes_entry'] = connections['wastes_entry'].filter(c => !fwd.includes(c) || keep.includes(c));
      }
    }
    // Each current-tier node aims for 2 forward connections.
    for (const curNid of cur) {
      const existing = connections[curNid].filter(c => next.includes(c));
      const need = 2 - existing.length;
      if (need > 0) {
        const candidates = next.filter(n => !connections[curNid].includes(n));
        for (let i = 0; i < Math.min(need, candidates.length); i++) {
          const pick = _rngChoice(rng, candidates);
          connections[curNid].push(pick);
          candidates.splice(candidates.indexOf(pick), 1);
        }
      }
    }
  }

  // Cap forward connections (wastes_entry: 3, others: 2).
  for (let t = 0; t < tiers.length - 1; t++) {
    const cur = tiers[t];
    const next = tiers[t + 1];
    for (const curNid of cur) {
      const maxFwd = curNid === 'wastes_entry' ? 3 : 2;
      const fwd = connections[curNid].filter(c => next.includes(c));
      if (fwd.length > maxFwd) {
        const keep = _rngSample(rng, fwd, maxFwd);
        connections[curNid] = connections[curNid].filter(c => !fwd.includes(c) || keep.includes(c));
      }
    }
  }

  // Add 1 backward (or sideways) connection per lab node.
  for (let t = 1; t < tiers.length - 1; t++) {
    for (const curNid of tiers[t]) {
      let back = 1;
      if (t >= 3 && rng() < 0.25) back = 2;
      const targetTier = tiers[Math.max(0, t - back)];
      const target = _rngChoice(rng, targetTier);
      if (!connections[curNid].includes(target)) connections[curNid].push(target);
    }
  }

  // Normalize the graph: every edge becomes bidirectional. PY parity
  // shipped the one-way graph (forward fan-out + one back-edge per
  // node), which left many connections un-walkable in reverse — the
  // player would see a link line to a node they couldn't actually
  // click. Mirroring every edge guarantees the player can always
  // retrace, and the fog/accessibility check (which uses the current
  // node's `connections`) now matches the visible line graph.
  for (const a of allNodeIds) {
    for (const b of connections[a]) {
      if (!connections[b].includes(a)) connections[b].push(a);
    }
  }

  // Shuffle each connection list so the player can't tell forward from back.
  for (const nid of Object.keys(connections)) _rngShuffle(rng, connections[nid]);

  // Add the lab nodes to the map.
  for (const [nodeId, info] of Object.entries(allLab)) {
    gameMap.addNode(new MapNode({
      id: nodeId,
      name: info.name,
      description: info.description,
      connections: connections[nodeId].slice(),
      position: info.position,
      mapArea: 'obsidian_wastes',
      isLocked: true,
      canRevisit: true,
      hiddenName: '???',
      hiddenDescription: 'Darkness ahead.',
    }));
  }

  // Update entry + north connections.
  const entry = gameMap.getNode('wastes_entry');
  if (entry) {
    entry.connections = connections['wastes_entry'].slice();
    entry.unlocks = entry.connections.filter(c => c.startsWith('lab_'));
  }
  const north = gameMap.getNode('wastes_north');
  if (north) north.connections = connections['wastes_north'].slice();

  // Each lab node unlocks its connections on visit.
  for (const nodeId of Object.keys(allLab)) {
    const n = gameMap.getNode(nodeId);
    if (n) n.unlocks = n.connections.slice();
  }
}

// === Tharnag Interior Map ===
// Mirrors PY map.py:create_tharnag_interior_map. The Grand Hall lane
// (side entry → lower → mid → upper stairs) is wired now; the
// Artisan Hall and beyond are stubbed for future work — their nodes
// stay in the data so encounters keep resolving by id, but they're
// not connected to the navigable path yet.
export function createTharnagInteriorMap() {
  const map = new GameMap('tharnag_interior', 'Tharnag Interior');
  map.mapImages = {
    grand_hall: 'Maps/TharnagGrandHall.jpg',
    grand_staircase: 'Maps/TharnagGrandStairCase.jpg',
    throne_room: 'Maps/TharnagThroneRoom.jpg',
    personal_quarters: 'Maps/TharnagPersonalQuarter.jpg',
    artisan_hall: 'Maps/ArtisanHallMap.jpg',
  };

  const nodes = [
    // Grand Hall lane — side entry fires once (canRevisit:false), the
    // stairs above it are pure navigation nodes (no encounters yet).
    { id: 'grand_hall_side_entry', name: 'Grand Hall Side Entry', description: 'The side door opens into the vast Grand Hall of Tharnag.', encounterId: 'grand_hall_arrival', connections: ['grand_hall_lower_stairs'], position: [940, 620], mapArea: 'grand_hall', canRevisit: false },
    { id: 'grand_hall_lower_stairs', name: 'Lower Stairs', description: 'Wide stone stairs carved into the mountain rock.', encounterId: '', connections: ['grand_hall_side_entry', 'grand_hall_mid_stairs', 'artisan_hall_entry', 'grand_hall_main_entrance'], position: [580, 660], mapArea: 'grand_hall', canRevisit: true },
    // Main Entrance — the city's front door out to the mountain.
    // WIP / debug-only for now; clicking it cross-maps to the
    // Tharnag exterior at the new Main Door node west of the
    // Side Door (eventual gateway to the Stairs of the Infinite
    // side-quest line).
    { id: 'grand_hall_main_entrance', name: 'Main Entrance', description: 'The grand front doors of Tharnag — the path out to the mountain road.', encounterId: '', connections: ['grand_hall_lower_stairs'], position: [420, 970], mapArea: 'grand_hall', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A massive set of doors leads out of the city.' },
    { id: 'grand_hall_mid_stairs', name: 'Middle Stairs', description: 'The stairs continue upward past towering pillars.', encounterId: '', connections: ['grand_hall_lower_stairs', 'grand_hall_upper_stairs', 'grand_hall_to_tunnels', 'grand_hall_to_forge'], position: [690, 520], mapArea: 'grand_hall', canRevisit: true },
    // Part 2 — side stair off the Middle Stairs toward the Great Forge.
    // Opens only after the player returns from the Gate of the Deep with
    // the King's order to call the Great Pour (unlocked in the post-dialog
    // handler). Destination map wired later.
    { id: 'grand_hall_to_forge', name: 'To the Forge', description: 'A stair off the Middle Stairs leads down toward the Great Forge, where the mountain\'s lava is tamed.', encounterId: '', connections: ['grand_hall_mid_stairs'], position: [560, 460], mapArea: 'grand_hall', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A stair leads off toward the forges.' },
    // Part 2 — side stair off the Middle Stairs down to the Tharnag
    // Tunnels / mine workings (where the goblins broke in). Locked +
    // hidden until part2Started (hydrateMapFromGlobalState reveals it);
    // a Part 1 player never sees it. Cross-maps to the
    // tharnag_tunnels_entrance map via the teleport pair in arriveAtNode
    // (grand_hall_to_tunnels <-> tunnels_entry) + the isCrossMapGate
    // click handler.
    { id: 'grand_hall_to_tunnels', name: 'To the Tunnels', description: 'A side stair off the Middle Stairs drops toward the deep tunnels — the sealed galleries that run down to the underdark, where the goblins broke through.', encounterId: '', connections: ['grand_hall_mid_stairs'], position: [870, 470], mapArea: 'grand_hall', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A dark stair leads down off the Middle Stairs.' },
    { id: 'grand_hall_upper_stairs', name: 'Upper Stairs', description: 'The top of the grand stairway. A massive archway leads deeper into Tharnag.', encounterId: '', connections: ['grand_hall_mid_stairs', 'staircase_entry'], position: [740, 420], mapArea: 'grand_hall', canRevisit: true, passthroughTo: 'staircase_entry' },
    // Grand Staircase area — Thorb's homecoming dialog at the entry,
    // then a top + landing bridge into the throne room.
    { id: 'staircase_entry', name: 'Grand Staircase', description: 'A monumental staircase hewn from the living rock, lit by rivers of molten forge-light.', encounterId: 'grand_staircase_arrival', connections: ['grand_hall_upper_stairs', 'staircase_top'], position: [100, 970], mapArea: 'grand_staircase', canRevisit: false, passthroughTo: 'grand_hall_upper_stairs' },
    { id: 'staircase_top', name: 'Top of the Staircase', description: 'The stairs open onto a broad landing. To the left, a passage leads to the Throne Room.', encounterId: '', connections: ['staircase_entry', 'staircase_landing', 'quarters_hallway'], position: [650, 640], mapArea: 'grand_staircase', canRevisit: true },
    // To the Throne Room ↔ Throne Room — teleport pair across the
    // staircase / throne_room area boundary. Walking onto the landing
    // from the staircase auto-hops into the throne room and fires the
    // arrival dialog on first visit; walking back out of the throne
    // room hops you onto the landing. The teleport guard suppresses
    // the bounce when fromNodeId already matches the paired node, so
    // the encounter-complete re-fire doesn't ping-pong forever.
    { id: 'staircase_landing', name: 'To the Throne Room', description: 'A wide landing where the passage turns toward the Throne Room.', encounterId: '', connections: ['staircase_top', 'throne_room_to_grand_stairway'], position: [400, 580], mapArea: 'grand_staircase', canRevisit: true, passthroughTo: 'throne_room_to_grand_stairway' },
    { id: 'throne_room_entry', name: 'Throne Room', description: 'Massive iron doors stand open, revealing the Throne Room of Tharnag.', encounterId: 'throne_room_arrival', connections: ['throne', 'temple_moradin_door', 'throne_room_to_grand_stairway'], position: [500, 950], mapArea: 'throne_room', canRevisit: false },
    { id: 'throne', name: 'The Throne', description: "The ancient stone throne of Tharnag's king sits upon a raised dais.", encounterId: 'throne_audience', connections: ['throne_room_entry'], position: [510, 820], mapArea: 'throne_room', canRevisit: false },
    // Throne Room exit node — pairs with `staircase_landing` (in the
    // Grand Staircase area) as a teleport gate. Walking onto either
    // half auto-hops to the other; the anti-bounce check on the
    // passthrough chase keeps the player from ping-ponging.
    { id: 'throne_room_to_grand_stairway', name: 'To the Grand Stairway', description: 'A wide landing opens toward the grand staircase out of the throne room.', encounterId: '', connections: ['throne_room_entry'], position: [860, 930], mapArea: 'throne_room', canRevisit: true, passthroughTo: 'staircase_landing' },
    // Temple of Moradin doorway — post-dragon side quest. Locked
    // until dragonSlain (hydrate unlocks + _stateRevealed). Walking
    // here cross-maps to the Temple of Moradin via the teleport pair
    // in arriveAtNode (temple_moradin_door ↔ temple_moradin_entry).
    { id: 'temple_moradin_door', name: 'To the Temple of Moradin', description: 'A side passage opens toward an old temple devoted to Moradin.', encounterId: '', connections: ['throne_room_entry'], position: [110, 920], mapArea: 'throne_room', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A passage leads off the throne room.', passthroughTo: 'temple_moradin_entry' },
    // Personal Quarters lane — locked until the throne audience
    // completes (handled by the throne_audience completion hook in
    // main.js, which flips quarters_hallway.isLocked off and reveals
    // its hidden name). Mirrors PY map.py:1493-1535. Hallway is a
    // bridge node into the quarters; the quarters entry is a hub with
    // bed (rest) + chest (Queen's Locket) leaves.
    { id: 'quarters_hallway', name: 'Hallway to Quarters', description: 'A torchlit corridor leading to the personal quarters.', encounterId: '', connections: ['staircase_top', 'personal_quarters_entry'], position: [900, 640], mapArea: 'grand_staircase', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leading somewhere.', passthroughTo: 'personal_quarters_entry' },
    { id: 'personal_quarters_entry', name: 'Personal Quarters', description: "A private chamber prepared for Thorb's companions.", encounterId: '', connections: ['quarters_hallway', 'quarters_bed', 'quarters_chest'], position: [520, 920], mapArea: 'personal_quarters', canRevisit: true, passthroughTo: 'quarters_hallway' },
    { id: 'quarters_bed', name: 'Bed', description: 'A sturdy dwarven bed with thick furs. It looks incredibly inviting after the long journey.', encounterId: 'quarters_rest', connections: ['personal_quarters_entry', 'quarters_chest'], position: [520, 260], mapArea: 'personal_quarters', canRevisit: true },
    { id: 'quarters_chest', name: 'Chest with Personal Belongings', description: 'A wooden chest containing personal items left for the party.', encounterId: 'quarters_chest', connections: ['personal_quarters_entry', 'quarters_bed'], position: [940, 540], mapArea: 'personal_quarters', canRevisit: false },
    // Artisan Hall lane — unlocked by the throne audience completion.
    // The entry sits on the Grand Hall side as a hidden gate; once
    // open, it's a single navigation hop into the Artisan Hall hub
    // which then connects city-style to the tavern + smithy.
    // Mirrors PY map.py:1375-1418.
    { id: 'artisan_hall_entry', name: 'To the Artisan Hall', description: "A wide passage leads to the Artisan Hall where Tharnag's craftsmen work.", encounterId: '', connections: ['grand_hall_lower_stairs', 'artisan_hall'], position: [350, 500], mapArea: 'grand_hall', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leads somewhere deeper into Tharnag.', passthroughTo: 'artisan_hall' },
    { id: 'artisan_hall', name: 'Artisan Hall', description: "The great workshop of Tharnag's master craftsmen.", encounterId: '', connections: ['artisan_hall_entry', 'dwarven_tavern', 'dwarven_smithy', 'mithril_remedies'], position: [770, 870], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???', passthroughTo: 'artisan_hall_entry' },
    { id: 'dwarven_tavern', name: 'Dwarven Tavern', description: 'A warm tavern filled with the smell of ale and roasting meat.', encounterId: 'dwarven_tavern', connections: ['artisan_hall', 'dwarven_smithy'], position: [400, 500], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???' },
    { id: 'dwarven_smithy', name: 'Dwarven Smithy', description: 'A massive forge where master smiths craft the finest dwarven arms and armor.', encounterId: 'dwarven_smithy', connections: ['artisan_hall', 'dwarven_tavern'], position: [400, 800], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???' },
    // Mithril Remedies — Olbrim Goldbalm's apothecary in Tharnag's
    // Artisan Hall. Unlock gate: throne audience complete (the side
    // quest fires while the party is still in Tharnag, regardless of
    // dragonSlain). The full downstream chain (Stairs of the Infinite
    // → Last Watch → Valley → Cave → Nest) is shipping with the
    // mini-expansion, so the node is no longer wip-gated.
    { id: 'mithril_remedies', name: 'Mithril Remedies', description: "Olbrim Goldbalm's apothecary, tucked between the tavern and the smithy.", encounterId: 'mithril_remedies', connections: ['artisan_hall', 'dwarven_tavern', 'dwarven_smithy'], position: [550, 710], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A small workshop tucked between the others.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'grand_hall_side_entry';
  return map;
}

// === Tharnag Tunnels Entrance (Part 2) ===
// The old mine workings under Tharnag where the goblins broke in.
// Placeholder area for now: 8 connected nodes, no encounters / dialog
// yet. `tunnels_entry` is the landing + teleport-back node (cross-maps
// to the Tharnag interior's grand_hall_to_tunnels via arriveAtNode +
// the isCrossMapGate click handler).
export function createTharnagTunnelsEntranceMap() {
  const map = new GameMap('tharnag_tunnels_entrance', 'Tharnag Tunnels');
  map.mapImages = {
    tharnag_tunnels: 'Maps/TharnagTunnelsEntrance.jpg',
  };
  // tunnels_entry is the visible landing/teleport node; every other
  // node is `discoverable` (revealed one hop at a time as ???). Flooded
  // Drift and West Drift are also cross-map gates into the West-Top
  // tunnels (see arriveAtNode + isCrossMapGate in main.js).
  const nodes = [
    { id: 'tunnels_entry', name: 'Tunnel Mouth', description: 'The stair from the Grand Hall opens into the deep tunnels — the sealed gates now smashed wide.', encounterId: '', connections: ['tunnels_fork'], position: [510, 130], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stair drops away into the dark.' },
    { id: 'tunnels_fork', name: 'The Fork', description: 'The tunnel splits around a great pillar of unworked stone.', encounterId: '', connections: ['tunnels_entry', 'tunnels_deep_east', 'tunnels_right', 'tunnels_gallery'], position: [500, 310], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The tunnel runs on into the dark.' },
    { id: 'tunnels_right', name: 'East Drift', description: 'The eastern drift, cart rails rusting into the rock.', encounterId: '', connections: ['tunnels_fork'], position: [740, 310], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A side drift branches off into the dark.' },
    { id: 'tunnels_deep_east', name: 'Flooded Drift', description: 'Black water pools in this side drift, dripping steadily from the ceiling.', encounterId: '', connections: ['tunnels_fork'], position: [300, 310], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A side drift branches off into the dark.' },
    { id: 'tunnels_gallery', name: 'The Gallery', description: 'A tall worked gallery, pillars marching off into the dark.', encounterId: '', connections: ['tunnels_fork', 'tunnels_deep_west', 'tunnels_left', 'tunnels_lower'], position: [500, 670], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The tunnel opens into a larger space ahead.' },
    { id: 'tunnels_deep_west', name: 'Collapsed Drift', description: 'A fresh collapse blocks this side gallery — new tool-marks in the rubble.', encounterId: '', connections: ['tunnels_gallery'], position: [810, 670], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A side gallery branches off into the dark.' },
    { id: 'tunnels_left', name: 'West Drift', description: 'A low drift heads west, props sagging under the weight of the mountain.', encounterId: '', connections: ['tunnels_gallery'], position: [140, 630], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A side drift branches off into the dark.' },
    { id: 'tunnels_lower', name: 'Lower Galleries', description: 'The galleries fall away toward the deep roads and the underdark below — and the sound of fighting.', encounterId: '', connections: ['tunnels_gallery'], position: [500, 870], mapArea: 'tharnag_tunnels', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The galleries fall away into deeper dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnels_entry';
  return map;
}

// === Tharnag Tunnels — West Top (Part 2) ===
// Western extension off the entrance map. Two 3-node paths: the top
// path connects (cross-map gate) to the entrance map's Flooded Drift,
// the south path to its West Drift. The gate nodes (wt_*_gate) are the
// visible landing nodes; the rest are `discoverable` (??? one hop at a
// time). Cross-map teleports live in main.js arriveAtNode +
// isCrossMapGate. No encounters / dialog yet.
export function createTharnagTunnelsWestTop01Map() {
  const map = new GameMap('tharnag_tunnels_west_top', 'Tharnag Tunnels — West');
  map.mapImages = {
    tharnag_tunnels_west_top: 'Maps/TharnagTunnelsWestTop01.jpg',
  };
  // Top path (4 nodes): gate ↔ entrance map's Flooded Drift.
  // South path (4 nodes): gate ↔ entrance map's West Drift.
  // Gate nodes (wt_*_gate) are visible landings; the rest are
  // `discoverable` (??? one hop at a time). New-node positions are
  // first-pass placeholders pending art-aligned coords.
  const nodes = [
    // Top path: Upper Drift → The Descent → Cracked Pillars → Old Workings.
    { id: 'wt_top_gate', name: 'Upper Drift', description: 'A worked drift climbing west off the flooded gallery.', encounterId: '', connections: ['wt_top_b'], position: [870, 190], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A drift opens off the gallery.' },
    { id: 'wt_top_b', name: 'The Descent', description: 'The drift drops in rough-cut steps, deeper into the rock.', encounterId: '', connections: ['wt_top_gate', 'wt_top_mid'], position: [530, 30], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'wt_top_mid', name: 'Cracked Pillars', description: 'Squat pillars, split and weeping dust, hold up a low roof.', encounterId: '', connections: ['wt_top_b', 'wt_top_end'], position: [320, 70], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'wt_top_end', name: 'Old Workings', description: 'Abandoned diggings, tools left where they were dropped.', encounterId: '', connections: ['wt_top_mid'], position: [90, 380], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift dead-ends somewhere ahead.' },
    // South path: Lower Drift → The Small Bridge → Deep Cut → Fresh Diggings.
    { id: 'wt_south_gate', name: 'Lower Drift', description: 'A sagging drift heading west off the lower workings.', encounterId: '', connections: ['wt_south_mid'], position: [840, 660], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A drift opens off the gallery.' },
    { id: 'wt_south_mid', name: 'The Small Bridge', description: 'A narrow span of old timber crosses a black crevice.', encounterId: '', connections: ['wt_south_gate', 'wt_south_end'], position: [530, 590], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'wt_south_end', name: 'Deep Cut', description: 'A raw cut driven hard into the rock — and not by dwarven hands.', encounterId: '', connections: ['wt_south_mid', 'wt_south_d'], position: [240, 700], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The cut drives deeper somewhere ahead.' },
    { id: 'wt_south_d', name: 'Fresh Diggings', description: 'Raw goblin diggings, the spoil still loose underfoot.', encounterId: '', connections: ['wt_south_end'], position: [500, 970], mapArea: 'tharnag_tunnels_west_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The diggings run on into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'wt_top_gate';
  return map;
}

// === Tharnag Tunnels — East Top (Part 2) ===
// Eastern extension off the entrance map. A single line of 8 nodes: the
// top gate connects (cross-map) to the entrance map's East Drift, the
// bottom gate to its Collapsed Drift, with 6 nodes forming a single
// line between them. Gate nodes are visible landings; the rest are
// `discoverable` (??? one hop at a time). Positions are first-pass
// placeholders pending art-aligned coords. No encounters / dialog yet.
export function createTharnagTunnelsEastTop01Map() {
  const map = new GameMap('tharnag_tunnels_east_top', 'Tharnag Tunnels — East');
  map.mapImages = {
    tharnag_tunnels_east_top: 'Maps/TharnagTunnelsEastTop01.jpg',
  };
  const nodes = [
    { id: 'et_top', name: 'Eastern Drift', description: 'A worked drift running east off the upper gallery.', encounterId: '', connections: ['et_2'], position: [440, 100], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A drift opens off the gallery.' },
    { id: 'et_2', name: 'Cart Track', description: 'Rusted cart rails run on down the slope.', encounterId: '', connections: ['et_top', 'et_3'], position: [590, 90], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'et_3', name: 'The Winze', description: 'A steep winze drops away, ladders rotted to splinters.', encounterId: '', connections: ['et_2', 'et_4'], position: [560, 240], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'et_4', name: 'Ore Stope', description: 'A worked-out stope, the walls scarred where the seam was chased.', encounterId: '', connections: ['et_3', 'et_5'], position: [700, 380], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'et_5', name: 'The Deeps', description: 'The air turns cold and dead. Something has been through here.', encounterId: '', connections: ['et_4', 'et_6', 'et_collapsed'], position: [300, 630], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'et_6', name: 'Black Seam', description: 'A black seam of unworked ore glitters in the dark.', encounterId: '', connections: ['et_5', 'et_6b'], position: [370, 870], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'et_6b', name: 'Broken Steps', description: 'A flight of broken steps drops toward the old gate.', encounterId: '', connections: ['et_6', 'et_7'], position: [590, 880], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'et_7', name: 'The Undergate', description: 'An old sealed gate, the seal broken — the way down to the deep roads.', encounterId: '', connections: ['et_6b'], position: [830, 770], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'et_collapsed', name: 'Collapsed Gallery', description: 'A side gallery choked with fresh-fallen rubble.', encounterId: '', connections: ['et_5'], position: [150, 600], mapArea: 'tharnag_tunnels_east_top', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A side gallery opens into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'et_top';
  return map;
}

// === Tharnag Tunnels — East Top 2 (Part 2) ===
// Past the East map's Undergate. A series of 5 nodes with a 6th
// branching off the 2nd (a Y). The top gate connects (cross-map) to the
// East map's The Undergate. Gate node is the landing; the rest are
// `discoverable` (??? one hop at a time). Positions are first-pass
// placeholders pending art-aligned coords. No encounters / dialog yet.
export function createTharnagTunnelsEastTop02Map() {
  const map = new GameMap('tharnag_tunnels_east_top_2', 'Tharnag Tunnels — Far East');
  map.mapImages = {
    tharnag_tunnels_east_top_2: 'Maps/TharnagTunnelsEastTop02.jpg',
  };
  const nodes = [
    { id: 'e2_1', name: 'Beyond the Gate', description: 'Past the broken Undergate, the deep roads run on into the black.', encounterId: '', connections: ['e2_2'], position: [210, 680], mapArea: 'tharnag_tunnels_east_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The road runs on past the gate.' },
    { id: 'e2_2', name: 'The Split', description: 'The road splits around a fallen column.', encounterId: '', connections: ['e2_1', 'e2_3', 'e2_branch'], position: [500, 760], mapArea: 'tharnag_tunnels_east_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The road forks somewhere ahead.' },
    { id: 'e2_3', name: 'Deep Drift', description: 'A long drift driven deep into the rock.', encounterId: '', connections: ['e2_2', 'e2_4'], position: [610, 510], mapArea: 'tharnag_tunnels_east_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The road runs on into the dark.' },
    { id: 'e2_4', name: 'The Hollow', description: 'A wide hollow worn smooth by ages of water.', encounterId: '', connections: ['e2_3', 'e2_5'], position: [650, 270], mapArea: 'tharnag_tunnels_east_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The road runs on into the dark.' },
    { id: 'e2_5', name: 'The Far Deep', description: 'The road ends — for now — at the edge of the far deep.', encounterId: '', connections: ['e2_4'], position: [570, 90], mapArea: 'tharnag_tunnels_east_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The road runs on into the dark.' },
    // Branch off the 2nd node (the Y). Side Cavern teleports to the East
    // Middle map (see arriveAtNode + isCrossMapGate in main.js).
    { id: 'e2_branch', name: 'Side Cavern', description: 'A natural cavern opens off the road.', encounterId: '', connections: ['e2_2'], position: [490, 940], mapArea: 'tharnag_tunnels_east_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A cavern opens off the road.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'e2_1';
  return map;
}

// === Tharnag Tunnels — Middle (Part 2) ===
// Central descent off the entrance map. A single line of 4 nodes; the
// top gate connects (cross-map) to the entrance map's Lower Galleries.
// Gate node is the visible landing; the rest are `discoverable` (??? one
// hop at a time). Positions are first-pass placeholders pending
// art-aligned coords. No encounters / dialog yet.
export function createTharnagTunnelsMiddleMap() {
  const map = new GameMap('tharnag_tunnels_middle', 'Tharnag Tunnels — Deep');
  map.mapImages = {
    tharnag_tunnels_middle: 'Maps/TharnagTunnelsMiddle.jpg',
  };
  const nodes = [
    { id: 'tm_top', name: 'Deep Stair', description: 'A long stair drops from the lower galleries into the dark.', encounterId: '', connections: ['tm_2'], position: [500, 240], mapArea: 'tharnag_tunnels_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A stair drops away into the dark.' },
    { id: 'tm_2', name: 'The Shaft', description: 'A wide shaft, the floor lost somewhere far below.', encounterId: '', connections: ['tm_top', 'tm_3'], position: [500, 470], mapArea: 'tharnag_tunnels_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The stair drops on into the dark.' },
    { id: 'tm_3', name: 'Sunless Drift', description: 'A drift that has never seen daylight, the walls slick and cold.', encounterId: '', connections: ['tm_2', 'tm_4'], position: [500, 700], mapArea: 'tharnag_tunnels_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'tm_4', name: 'The Threshold', description: 'The drift opens onto the black mouth of the deep roads.', encounterId: '', connections: ['tm_3'], position: [500, 930], mapArea: 'tharnag_tunnels_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something vast opens up ahead.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tm_top';
  return map;
}

// === Tharnag Tunnels — Middle Bottom (Part 2) ===
// Off the Middle map's Threshold. A straight line of 5 nodes with a 6th
// branching off the 4th (a Y). The top gate connects (cross-map) to the
// Middle map's The Threshold. Gate node is the visible landing; the rest
// are `discoverable` (??? one hop at a time). Positions are first-pass
// placeholders pending art-aligned coords. No encounters / dialog yet.
export function createTharnagTunnelsMiddleBottomMap() {
  const map = new GameMap('tharnag_tunnels_middle_bottom', 'Tharnag Tunnels — Deep Roads');
  map.mapImages = {
    tharnag_tunnels_middle_bottom: 'Maps/TharnagTunnelsMiddleBottom.jpg',
  };
  // Inverse cross (8 nodes): a 4-node vertical line (top gate ↔ the West
  // map's Fresh Diggings), with a horizontal arm off the 3rd node (The
  // Fork) — 2 nodes left, 2 nodes right. Plus an isolated 2-node pair
  // above The Pit (unlinked for now; left visible so it can be placed).
  // Positions for unspecified nodes are first-pass placeholders.
  const nodes = [
    // Vertical line.
    { id: 'mb_1', name: 'The Deep Road', description: 'The diggings open onto a broad, ancient road running into the underdark.', encounterId: '', connections: ['mb_2'], position: [510, 170], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A broad road runs off into the dark.' },
    { id: 'mb_2', name: 'Black Gallery', description: 'A vast black gallery, the roof lost in darkness overhead.', encounterId: '', connections: ['mb_1', 'mb_3'], position: [510, 450], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The road runs on into the dark.' },
    { id: 'mb_3', name: 'The Fork', description: 'The road forks around a spur of black stone.', encounterId: '', connections: ['mb_2', 'mb_4', 'mb_left1'], position: [500, 730], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The road forks somewhere ahead.' },
    { id: 'mb_4', name: 'Fallen Guard Tower', description: 'A toppled guard tower, dwarven stone cracked and scattered across the road.', encounterId: '', connections: ['mb_3'], position: [510, 940], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A ruined shape looms ahead.' },
    // Horizontal arm — left.
    { id: 'mb_left1', name: 'Bone Midden', description: 'A heaped midden of cracked bones, picked clean.', encounterId: '', connections: ['mb_3', 'mb_pit'], position: [320, 800], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
    { id: 'mb_pit', name: 'The Pit', description: 'A black pit yawns at the road\'s edge, dropping away forever.', encounterId: '', connections: ['mb_left1'], position: [140, 830], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
    // Horizontal arm — right.
    // Slave Pens + War Camp are a standalone pair (NOT linked to The
    // Fork) — reached only by the Goblin Hole teleport from the Left
    // Bottom map. Slave Pens is the landing/return gate.
    { id: 'mb_right1', name: 'Slave Pens', description: 'Rusted cages line the wall, their doors hanging open.', encounterId: '', connections: ['mb_right2'], position: [80, 330], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
    { id: 'mb_right2', name: 'War Camp', description: 'A goblin war camp, cookfires still smoking.', encounterId: '', connections: ['mb_right1'], position: [290, 120], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
    // Isolated pair above The Pit — unlinked for now. Left visible (not
    // discoverable) so they render before being wired into the graph.
    { id: 'mb_pit_a', name: 'Old Cell', description: 'An old dwarven holding cell, the door long rusted away.', encounterId: '', connections: ['mb_pit_b'], position: [140, 600], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true },
    { id: 'mb_pit_b', name: 'Forgotten Cell', description: 'A deeper cell, forgotten by everyone but its last occupant.', encounterId: '', connections: ['mb_pit_a'], position: [140, 400], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true },
    // Top-right dead-end chain (3 nodes) — reached only by the Side Pool
    // teleport from the West Bottom 2 map. mb_tr1 is the landing/return
    // gate; the chain dead-ends at mb_tr3.
    { id: 'mb_tr1', name: 'Upper Causeway', description: 'A raised causeway runs along the gallery wall.', encounterId: '', connections: ['mb_tr2'], position: [990, 480], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A causeway runs off into the dark.' },
    { id: 'mb_tr2', name: 'The Buttress', description: 'A great stone buttress holds back the dark.', encounterId: '', connections: ['mb_tr1', 'mb_tr3'], position: [910, 230], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The causeway runs on into the dark.' },
    { id: 'mb_tr3', name: 'Sealed Vault', description: 'A sealed vault at the causeway\'s end — the way no further.', encounterId: '', connections: ['mb_tr2'], position: [760, 90], mapArea: 'tharnag_tunnels_middle_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The causeway dead-ends somewhere ahead.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'mb_1';
  return map;
}

// === Tharnag Tunnels — Left Bottom (Part 2) ===
// Off the West map's Fresh Diggings. An inverse cross of 8 nodes: a
// 4-node vertical line (top gate ↔ Fresh Diggings) with a horizontal arm
// off the 3rd node — 2 nodes left, 2 nodes right. Top gate is the
// landing; all nodes are `discoverable` (??? one hop at a time).
// Positions are first-pass placeholders pending art-aligned coords.
export function createTharnagTunnelsLeftBottomMap() {
  const map = new GameMap('tharnag_tunnels_left_bottom', 'Tharnag Tunnels — Lower West');
  map.mapImages = {
    tharnag_tunnels_left_bottom: 'Maps/TharnagTunnelsLeftBottom.jpg',
  };
  const nodes = [
    // Vertical line.
    { id: 'lb_1', name: 'Sunken Drift', description: 'The diggings drop into an older, sunken drift.', encounterId: '', connections: ['lb_2'], position: [510, 170], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A drift drops away into the dark.' },
    { id: 'lb_2', name: 'The Long Gallery', description: 'A long gallery, its far end lost in the dark.', encounterId: '', connections: ['lb_1', 'lb_3'], position: [510, 450], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The gallery runs on into the dark.' },
    { id: 'lb_3', name: 'The Crossways', description: 'Old workings cross and part again here.', encounterId: '', connections: ['lb_2', 'lb_4', 'lb_left1', 'lb_right1'], position: [510, 650], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The way forks somewhere ahead.' },
    { id: 'lb_4', name: 'Drowned Hall', description: 'A flooded hall, black water to the knees.', encounterId: '', connections: ['lb_3'], position: [510, 940], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A larger space opens ahead.' },
    // Horizontal arm — left.
    { id: 'lb_left1', name: 'West Stope', description: 'A worked-out stope branching west.', encounterId: '', connections: ['lb_3', 'lb_left2'], position: [210, 510], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
    { id: 'lb_left2', name: 'The Sump', description: 'A black sump where the water pools and stills.', encounterId: '', connections: ['lb_left1'], position: [40, 580], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
    // Horizontal arm — right. Goblin Hole teleports to the Middle Bottom
    // map's Slave Pens (see arriveAtNode + isCrossMapGate in main.js).
    { id: 'lb_right1', name: 'East Stope', description: 'A worked-out stope branching east.', encounterId: '', connections: ['lb_3', 'lb_right2'], position: [810, 520], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
    { id: 'lb_right2', name: 'Goblin Hole', description: 'A raw hole gnawed through the rock by goblin hands.', encounterId: '', connections: ['lb_right1'], position: [980, 650], mapArea: 'tharnag_tunnels_left_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage branches off into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'lb_1';
  return map;
}

// === Tharnag Tunnels — West Middle (Part 2) ===
// A straight line of 7 nodes off the Left Bottom map's The Sump. Top
// gate connects (cross-map) to The Sump; the rest are `discoverable`.
// Positions are first-pass placeholders pending art-aligned coords.
export function createTharnagTunnelsWestMiddleMap() {
  const map = new GameMap('tharnag_tunnels_west_middle', 'Tharnag Tunnels — West Deep');
  map.mapImages = {
    tharnag_tunnels_west_middle: 'Maps/TharnagTunnelsWestMiddle.jpg',
  };
  const nodes = [
    { id: 'wm_1', name: 'Sump Passage', description: 'A waterlogged passage leading off the sump.', encounterId: '', connections: ['wm_2'], position: [400, 400], mapArea: 'tharnag_tunnels_west_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage runs off into the dark.' },
    { id: 'wm_2', name: 'Drowned Stair', description: 'A stair vanishing into still black water.', encounterId: '', connections: ['wm_1', 'wm_3'], position: [200, 660], mapArea: 'tharnag_tunnels_west_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'wm_3', name: 'The Cistern', description: 'A vast old cistern, the water mirror-still.', encounterId: '', connections: ['wm_2', 'wm_4'], position: [400, 940], mapArea: 'tharnag_tunnels_west_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'wm_4', name: 'Weeping Drift', description: 'Water weeps from every crack in the stone.', encounterId: '', connections: ['wm_3', 'wm_5'], position: [840, 820], mapArea: 'tharnag_tunnels_west_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'wm_5', name: 'Still Water', description: 'A flooded chamber, the water dead and silent.', encounterId: '', connections: ['wm_4', 'wm_6'], position: [800, 480], mapArea: 'tharnag_tunnels_west_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'wm_6', name: 'The Deep Well', description: 'A black well drops away into nothing.', encounterId: '', connections: ['wm_5', 'wm_7'], position: [480, 270], mapArea: 'tharnag_tunnels_west_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'wm_7', name: 'Flooded End', description: 'The passage ends at a wall of black water — and a crack just wide enough to slip through.', encounterId: '', connections: ['wm_6'], position: [520, 60], mapArea: 'tharnag_tunnels_west_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'wm_1';
  return map;
}

// === Tharnag Tunnels — West Top 2 (Part 2) ===
// Two SEPARATE lines on one map: a 3-node line whose gate links
// (cross-map) to the West Middle map's Flooded End, and a 5-node line
// whose gate links to the West map's Old Workings. The two lines are not
// connected to each other. Gate nodes are landings; the rest are
// `discoverable`. Positions are first-pass placeholders.
export function createTharnagTunnelsWestTop02Map() {
  const map = new GameMap('tharnag_tunnels_west_top_2', 'Tharnag Tunnels — Upper West');
  map.mapImages = {
    tharnag_tunnels_west_top_2: 'Maps/TharnagTunnelsWestTop02.jpg',
  };
  const nodes = [
    // Line A (3 nodes) — gate ↔ West Middle's Flooded End.
    { id: 'w2_a1', name: 'The Crack', description: 'You squeeze through the crack into a drier passage beyond.', encounterId: '', connections: ['w2_a2'], position: [500, 950], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage opens beyond the crack.' },
    { id: 'w2_a2', name: 'Drowned Gallery', description: 'A gallery half-reclaimed by the water table.', encounterId: '', connections: ['w2_a1', 'w2_a3'], position: [500, 640], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'w2_a3', name: 'Sunken Vault', description: 'A flooded vault, its contents long since claimed.', encounterId: '', connections: ['w2_a2'], position: [500, 410], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    // Line B (5 nodes) — gate ↔ West map's Old Workings.
    { id: 'w2_b1', name: 'Old Adit', description: 'An old adit driven straight into the rock.', encounterId: '', connections: ['w2_b2'], position: [960, 480], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A drift opens into the dark.' },
    { id: 'w2_b2', name: 'Timbered Drift', description: 'Sagging timbers hold back the weight of the mountain.', encounterId: '', connections: ['w2_b1', 'w2_b3'], position: [700, 340], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'w2_b3', name: 'The Stope', description: 'A tall worked stope, ladders climbing into the dark.', encounterId: '', connections: ['w2_b2', 'w2_b4'], position: [590, 110], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'w2_b4', name: 'Ore Chute', description: 'A steep ore chute drops away below.', encounterId: '', connections: ['w2_b3', 'w2_b5'], position: [370, 130], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
    { id: 'w2_b5', name: 'Dead Drift', description: 'A worked-out drift, dead and silent.', encounterId: '', connections: ['w2_b4'], position: [90, 480], mapArea: 'tharnag_tunnels_west_top_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The drift runs on into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'w2_a1';
  return map;
}

// === Tharnag Tunnels — West Bottom (Part 2) ===
// A V of 9 nodes: a bottom vertex (the teleport gate to the Left Bottom
// map's Drowned Hall) with a 4-node arm climbing up-left and a 4-node
// arm climbing up-right. The vertex is the landing; the rest are
// `discoverable`. Positions are first-pass placeholders.
export function createTharnagTunnelsWestBottomMap() {
  const map = new GameMap('tharnag_tunnels_west_bottom', 'Tharnag Tunnels — Sunken West');
  map.mapImages = {
    tharnag_tunnels_west_bottom: 'Maps/TharnagTunnelsWestBottom.jpg',
  };
  const nodes = [
    // Bottom vertex of the V — gate ↔ Drowned Hall.
    { id: 'wb_bottom', name: 'The Confluence', description: 'Two flooded channels meet at a still black pool.', encounterId: '', connections: ['wb_mid'], position: [520, 130], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Water pools where two channels meet.' },
    // Junction between The Confluence and the two channels.
    { id: 'wb_mid', name: 'The Antechamber', description: 'A small antechamber where the two channels join.', encounterId: '', connections: ['wb_bottom', 'wb_l1', 'wb_r1'], position: [520, 230], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channels meet somewhere ahead.' },
    // Left arm.
    { id: 'wb_l1', name: 'West Channel', description: 'A flooded channel running up to the west.', encounterId: '', connections: ['wb_mid', 'wb_l2'], position: [360, 340], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A channel runs off into the dark.' },
    { id: 'wb_l2', name: 'Sunken Stair', description: 'A stair drowned to the rail.', encounterId: '', connections: ['wb_l1', 'wb_l3'], position: [310, 580], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channel runs on into the dark.' },
    { id: 'wb_l3', name: 'The Drowned Drift', description: 'A drift lost beneath the water table.', encounterId: '', connections: ['wb_l2', 'wb_l4'], position: [130, 780], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channel runs on into the dark.' },
    { id: 'wb_l4', name: 'West Source', description: 'The spring that feeds the flooded west.', encounterId: '', connections: ['wb_l3'], position: [210, 970], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channel runs on into the dark.' },
    // Right arm.
    { id: 'wb_r1', name: 'East Channel', description: 'A flooded channel running up to the east.', encounterId: '', connections: ['wb_mid', 'wb_r2'], position: [690, 390], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A channel runs off into the dark.' },
    { id: 'wb_r2', name: 'Flooded Stope', description: 'A worked stope half-full of black water.', encounterId: '', connections: ['wb_r1', 'wb_r3'], position: [850, 570], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channel runs on into the dark.' },
    { id: 'wb_r3', name: 'The Deep Pool', description: 'A deep, glassy pool, bottomless to the eye.', encounterId: '', connections: ['wb_r2', 'wb_r4'], position: [790, 820], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channel runs on into the dark.' },
    { id: 'wb_r4', name: 'East Source', description: 'The spring that feeds the flooded east.', encounterId: '', connections: ['wb_r3'], position: [890, 970], mapArea: 'tharnag_tunnels_west_bottom', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channel runs on into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'wb_bottom';
  return map;
}

// === Tharnag Tunnels — West Bottom 2 (Part 2) ===
// Off the West Bottom map's East Source. A line of 5 nodes with a 6th
// branching off the 2nd (a Y). The left/first node is the gate
// (cross-map) to East Source. Gate is the landing; the rest are
// `discoverable`. Positions are first-pass placeholders.
export function createTharnagTunnelsWestBottom2Map() {
  const map = new GameMap('tharnag_tunnels_west_bottom_2', 'Tharnag Tunnels — Lower Deep');
  map.mapImages = {
    tharnag_tunnels_west_bottom_2: 'Maps/TharnagTunnelsWestBottom2.jpg',
  };
  const nodes = [
    { id: 'wb2_1', name: 'The Spillway', description: 'Water spills away down a long, dark race.', encounterId: '', connections: ['wb2_2'], position: [240, 40], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A passage opens off into the dark.' },
    { id: 'wb2_2', name: 'The Junction', description: 'The race splits at an old stone junction.', encounterId: '', connections: ['wb2_1', 'wb2_3', 'wb2_branch'], position: [350, 200], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The way forks somewhere ahead.' },
    { id: 'wb2_3', name: 'Black Current', description: 'A black current pulls steadily into the deep.', encounterId: '', connections: ['wb2_2', 'wb2_4', 'wb2_br1'], position: [390, 380], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'wb2_4', name: 'The Undertow', description: 'The water drags hard at your boots here.', encounterId: '', connections: ['wb2_3', 'wb2_5'], position: [290, 660], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    { id: 'wb2_5', name: 'Drowned Deep', description: 'The passage ends — for now — in drowned dark.', encounterId: '', connections: ['wb2_4', 'wb2_br2'], position: [660, 960], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The passage runs on into the dark.' },
    // Right-hand branch (2 nodes) bridging Black Current → Drowned Deep,
    // forming a loop with the Undertow on the left.
    { id: 'wb2_br1', name: 'The Eddy', description: 'A slow eddy turns endlessly against the wall.', encounterId: '', connections: ['wb2_3', 'wb2_br2'], position: [800, 410], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A side channel branches off into the dark.' },
    { id: 'wb2_br2', name: 'Sluice Gate', description: 'A rotted sluice gate, jammed half-open.', encounterId: '', connections: ['wb2_br1', 'wb2_5'], position: [890, 640], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The channel runs on into the dark.' },
    // Branch off the 2nd node (the Y). Side Pool teleports to the Middle
    // Bottom map's top-right dead-end chain (see main.js).
    { id: 'wb2_branch', name: 'Side Pool', description: 'A still side pool, fed by an unseen spring.', encounterId: '', connections: ['wb2_2'], position: [540, 110], mapArea: 'tharnag_tunnels_west_bottom_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A pool opens off the passage.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'wb2_1';
  return map;
}

// === Tharnag Tunnels — West Top 3 (Part 2) ===
// A single line of 7 nodes off the West Top 2 map's Dead Drift. The gate
// (first node) connects cross-map to Dead Drift; the rest are
// `discoverable`. Positions are first-pass placeholders.
export function createTharnagTunnelsWestTop03Map() {
  const map = new GameMap('tharnag_tunnels_west_top_3', 'Tharnag Tunnels — Old Workings');
  map.mapImages = {
    tharnag_tunnels_west_top_3: 'Maps/TharnagTunnelsWestTop03.jpg',
  };
  const nodes = [
    { id: 'wt3_1', name: 'The Crosscut', description: 'A crosscut driven off the dead drift into fresh rock.', encounterId: '', connections: ['wt3_2'], position: [790, 50], mapArea: 'tharnag_tunnels_west_top_3', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A crosscut opens off into the dark.' },
    { id: 'wt3_2', name: 'Forgotten Level', description: 'A whole level the maps forgot.', encounterId: '', connections: ['wt3_1', 'wt3_3'], position: [400, 80], mapArea: 'tharnag_tunnels_west_top_3', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The level runs on into the dark.' },
    { id: 'wt3_3', name: 'Rotten Stull', description: 'Rotten stull-timbers groan overhead.', encounterId: '', connections: ['wt3_2', 'wt3_4'], position: [80, 290], mapArea: 'tharnag_tunnels_west_top_3', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The level runs on into the dark.' },
    { id: 'wt3_4', name: 'The Glory Hole', description: 'A great open glory hole drops through the level.', encounterId: '', connections: ['wt3_3', 'wt3_5'], position: [790, 920], mapArea: 'tharnag_tunnels_west_top_3', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The level runs on into the dark.' },
    { id: 'wt3_5', name: 'Abandoned Face', description: 'An abandoned working face, tools still in the rock.', encounterId: '', connections: ['wt3_4', 'wt3_6'], position: [450, 500], mapArea: 'tharnag_tunnels_west_top_3', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The level runs on into the dark.' },
    { id: 'wt3_6', name: 'The Last Drift', description: 'The last drift anyone bothered to cut.', encounterId: '', connections: ['wt3_5', 'wt3_7'], position: [590, 340], mapArea: 'tharnag_tunnels_west_top_3', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The level runs on into the dark.' },
    { id: 'wt3_7', name: 'Worked Out', description: 'Worked out and walked away from — the end of the line.', encounterId: '', connections: ['wt3_6'], position: [690, 150], mapArea: 'tharnag_tunnels_west_top_3', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The level runs on into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'wt3_1';
  return map;
}

// === The Gate of the Deep (Part 2) ===
// The next area, reached from whichever of the 6 tunnel dead-ends was
// randomly chosen as the real exit this run. Placeholder for now — just
// the arrival node (the King's-front dialog fires here); the rest of the
// area's nodes come later.
export function createTharnagTunnelsGateOfDeepMap() {
  const map = new GameMap('tharnag_tunnels_gate_of_deep', 'The Gate of the Deep');
  map.mapImages = {
    gate_of_deep: 'Maps/TharnagTunnelsTheGateofTheDeep.jpg',
  };
  const nodes = [
    // The Gate of the Deep sits up top, linked down to the 3rd Gate. The
    // 3rd Gate is the hub: the two fronts (left + right), each a line of
    // two nodes, hang off it. The two nodes within each front also link so
    // each side reads as a line.
    { id: 'gate_arrival', name: 'The Gate of the Deep', description: 'The great gate, and the battle raging before it.', encounterId: '', connections: ['third_gate'], position: [510, 80], mapArea: 'gate_of_deep', canRevisit: true },
    // 3rd Gate — hub: links to the Gate of the Deep and the near node of
    // each front. Each front then runs deeper as a 2-node line.
    { id: 'third_gate', name: '3rd Gate', description: 'The third gate, behind the front line.', encounterId: '', connections: ['gate_arrival', 'left_front_1', 'right_front_1'], position: [510, 260], mapArea: 'gate_of_deep', canRevisit: true },
    // Left front (line of 2): 3rd Gate → Left Front → Left Front Deep.
    { id: 'left_front_1', name: 'Left Front', description: 'The left flank of the line holding before the Gate.', encounterId: '', connections: ['third_gate', 'left_front_2'], position: [270, 350], mapArea: 'gate_of_deep', canRevisit: true },
    { id: 'left_front_2', name: 'Left Front — Deep', description: 'The far end of the left flank, pressed hard.', encounterId: '', connections: ['left_front_1'], position: [260, 640], mapArea: 'gate_of_deep', canRevisit: true },
    // Right front (line of 2): 3rd Gate → Right Front → Right Front Deep.
    { id: 'right_front_1', name: 'Right Front', description: 'The right flank of the line holding before the Gate.', encounterId: '', connections: ['third_gate', 'right_front_2'], position: [750, 350], mapArea: 'gate_of_deep', canRevisit: true },
    { id: 'right_front_2', name: 'Right Front — Deep', description: 'The far end of the right flank, pressed hard.', encounterId: '', connections: ['right_front_1'], position: [810, 600], mapArea: 'gate_of_deep', canRevisit: true },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'gate_arrival';
  return map;
}

// === Stairs to the Forge (Part 2) ===
// A switchback stair off the Grand Hall's "To the Forge" node: one entry at
// the top, two zig-zag landings, down to the Forge Plaza. The Plaza cross-
// maps to The Great Forge map.
export function createStairsToForgeMap() {
  const map = new GameMap('tharnag_stairs_to_forge', 'Stairs to the Forge');
  map.mapImages = { stairs_to_forge: 'Maps/StairsToTheForge.jpg' };
  const nodes = [
    { id: 'forge_stairs_entry', name: 'Forge Stair', description: 'The stair down from the Middle Stairs toward the Great Forge.', encounterId: '', connections: ['forge_stairs_2'], position: [920, 380], mapArea: 'stairs_to_forge', canRevisit: true },
    { id: 'forge_stairs_2', name: 'Switchback', description: 'The stair doubles back, hewn into the living rock.', encounterId: '', connections: ['forge_stairs_entry', 'forge_stairs_3'], position: [550, 550], mapArea: 'stairs_to_forge', canRevisit: true },
    { id: 'forge_stairs_3', name: 'Switchback', description: 'Another switchback — the air grows hot and bright below.', encounterId: '', connections: ['forge_stairs_2', 'forge_stairs_4'], position: [650, 710], mapArea: 'stairs_to_forge', canRevisit: true },
    { id: 'forge_stairs_4', name: 'Forge Landing', description: 'A last landing before the plaza opens out — the heat rolls up the stair in waves.', encounterId: '', connections: ['forge_stairs_3', 'forge_plaza'], position: [465, 810], mapArea: 'stairs_to_forge', canRevisit: true },
    { id: 'forge_plaza', name: 'The Forge Plaza', description: 'A wide plaza before the Great Forge, ringed with idle lava channels and quenching pools.', encounterId: '', connections: ['forge_stairs_4'], position: [520, 970], mapArea: 'stairs_to_forge', canRevisit: true },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'forge_stairs_entry';
  return map;
}

// === The Great Forge (Part 2) ===
// The Forge Plaza descends here: a last stair into the forge, then the Great
// Forge itself (where the Great Pour channels are loosed). Destination
// content wired later.
export function createTharnagTheForgeMap() {
  const map = new GameMap('tharnag_the_forge', 'The Great Forge');
  map.mapImages = { the_forge: 'Maps/TharnagTheForge.jpg' };
  const nodes = [
    { id: 'the_forge_stair', name: 'Forge Stair', description: 'The stair down from the plaza into the forge proper.', encounterId: '', connections: ['the_forge_stair_2'], position: [690, 90], mapArea: 'the_forge', canRevisit: true },
    { id: 'the_forge_stair_2', name: 'Forge Steps', description: 'The steps wind down past roaring furnaces.', encounterId: '', connections: ['the_forge_stair', 'the_forge_plaza'], position: [400, 190], mapArea: 'the_forge', canRevisit: true },
    { id: 'the_forge_plaza', name: 'Forge Floor', description: 'The forge floor — anvils, crucibles, and the great lava channels running through it all.', encounterId: 'forge_floor_ambush', connections: ['the_forge_stair_2', 'the_forge_stair_3'], position: [510, 320], mapArea: 'the_forge', canRevisit: false },
    { id: 'the_forge_stair_3', name: 'Forge Descent', description: 'A final flight drops to the very heart of the forge.', encounterId: '', connections: ['the_forge_plaza', 'the_great_forge'], position: [510, 500], mapArea: 'the_forge', canRevisit: true },
    { id: 'the_great_forge', name: 'The Great Forge', description: "The Great Forge itself — the mountain's lava tamed into rivers of fire, and the channels that could loose the Great Pour.", encounterId: 'the_great_forge', connections: ['the_forge_stair_3'], position: [510, 630], mapArea: 'the_forge', canRevisit: true },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'the_forge_stair';
  return map;
}

// === Tharnag Tunnels — East Middle (Part 2) ===
// A straight line of 6 nodes off the East Top 2 map's Side Cavern. Top
// gate connects (cross-map) to Side Cavern; the rest are `discoverable`.
// Positions are first-pass placeholders pending art-aligned coords.
export function createTharnagTunnelsEastMiddleMap() {
  const map = new GameMap('tharnag_tunnels_east_middle', 'Tharnag Tunnels — East Deep');
  map.mapImages = {
    tharnag_tunnels_east_middle: 'Maps/TharnagTunnelsEastMiddle.jpg',
  };
  const nodes = [
    { id: 'em_1', name: 'Cavern Mouth', description: 'The side cavern widens into a natural cave system.', encounterId: '', connections: ['em_2'], position: [160, 70], mapArea: 'tharnag_tunnels_east_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A cave opens off into the dark.' },
    { id: 'em_2', name: 'The Grotto', description: 'A dripping grotto, pale things growing on the walls.', encounterId: '', connections: ['em_1', 'em_3'], position: [190, 210], mapArea: 'tharnag_tunnels_east_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The cave runs on into the dark.' },
    { id: 'em_3', name: 'Stalactite Hall', description: 'A hall of teeth, stone hanging from the roof.', encounterId: '', connections: ['em_2', 'em_4'], position: [420, 330], mapArea: 'tharnag_tunnels_east_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The cave runs on into the dark.' },
    { id: 'em_4', name: 'The Narrows', description: 'The cave pinches to a crawl through the rock.', encounterId: '', connections: ['em_3', 'em_5'], position: [800, 480], mapArea: 'tharnag_tunnels_east_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The cave runs on into the dark.' },
    { id: 'em_5', name: 'Crystal Drift', description: 'Crystals glitter coldly in the walls.', encounterId: '', connections: ['em_4', 'em_6'], position: [920, 700], mapArea: 'tharnag_tunnels_east_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The cave runs on into the dark.' },
    { id: 'em_6', name: 'Cavern Deep', description: 'The cave ends — for now — in deep, cold dark.', encounterId: '', connections: ['em_5'], position: [730, 960], mapArea: 'tharnag_tunnels_east_middle', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The cave runs on into the dark.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'em_1';
  return map;
}

// === Entry Corridor Map ===
export function createEntryCorridorMap() {
  const map = new GameMap('entry_corridor', 'Entry Corridor');
  map.mapImages = {
    entry_corridor: 'Maps/DwarvenCityEntryCorridorMap.jpg',
  };

  const nodes = [
    // Entry point from the volcano choice (upper path). Dialog is
    // one-shot — canRevisit:false so the arrival speech doesn't replay
    // every time the player walks back through.
    { id: 'corridor_entrance', name: 'Corridor Entrance', description: 'The entrance to the dwarven city corridor.', encounterId: 'entry_corridor_arrival', connections: ['corridor_ruins'], position: [720, 720], mapArea: 'entry_corridor', canRevisit: false, unlocks: ['corridor_ruins'], hiddenName: '???', hiddenDescription: 'A way out leads here.' },
    // Random-encounter movement node — stays ??? until walked so the
    // fog matches the lower-volcano feel.
    { id: 'corridor_ruins', name: 'Corridor Ruins', description: 'Crumbling ruins along the corridor.', encounterId: '', connections: ['corridor_entrance', 'corridor_gate_approach'], position: [650, 500], mapArea: 'entry_corridor', isLocked: true, canRevisit: true, unlocks: ['corridor_gate_approach'], hiddenName: '???', hiddenDescription: 'Something lies ahead.' },
    // Entry point from the Hall of Ancestors (backwards traversal).
    // canRevisit:true so the gate dialog replays when re-entering
    // from the upper city side.
    { id: 'corridor_gate_approach', name: 'Corridor Gate Approach', description: 'Approaching the corridor gate.', encounterId: 'corridor_gate_approach', connections: ['corridor_ruins'], position: [590, 360], mapArea: 'entry_corridor', isLocked: true, canRevisit: false, hiddenName: '???', hiddenDescription: 'A gate looms ahead.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'corridor_entrance';
  return map;
}

// === Gate Area Map ===
export function createGateAreaMap() {
  const map = new GameMap('gate_area', 'Gate Area');
  map.mapImages = {
    gate_area: 'Maps/DwarvenCityGateArea.jpg',
  };

  const nodes = [
    // Entry point from the entry_corridor map (forward).
    { id: 'gate_back_to_corridor', name: 'Gate Back to Corridor', description: 'The path back to the entry corridor.', encounterId: '', connections: ['gate_entrance'], position: [610, 750], mapArea: 'gate_area', canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leads back the way you came.' },
    // Middle hub — neighbors should stay ??? until walked.
    { id: 'gate_entrance', name: 'Gate Entrance', description: 'The main gate entrance.', encounterId: '', connections: ['gate_back_to_corridor', 'gate_guardroom', 'gate_passage'], position: [880, 660], mapArea: 'gate_area', canRevisit: true, unlocks: ['gate_guardroom', 'gate_passage'], hiddenName: '???', hiddenDescription: 'A passage continues ahead.' },
    { id: 'gate_guardroom', name: 'Gate Guardroom', description: 'A guardroom beside the gate.', encounterId: 'gate_guardroom', connections: ['gate_entrance'], position: [780, 550], mapArea: 'gate_area', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A side chamber.' },
    // Entry point from the Hall of Ancestors (backwards traversal).
    // Entry point from the Hall of Ancestors (backwards traversal).
    // PY parity: node name "Into Thorgazad", flavor about the warm
    // air rising from below.
    { id: 'gate_passage', name: 'Into Thorgazad', description: 'A broad stairway descends into the ancient dwarven city. Warm air rises from below.', encounterId: 'gate_passage', connections: ['gate_entrance'], position: [1000, 560], mapArea: 'gate_area', isLocked: true, canRevisit: false, hiddenName: '???', hiddenDescription: 'Something lies beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'gate_back_to_corridor';
  return map;
}

// === Hall of Ancestors Map ===
export function createHallOfAncestorsMap() {
  const map = new GameMap('hall_of_ancestors', 'Hall of Ancestors');
  map.mapImages = {
    hall_of_ancestors: 'Maps/DwarvenCityHallofAncestors.jpg',
  };

  // PY parity: Hall is the central hub with 3 unlockable exits +
  // 2 entry points (hall_entry from the Gate, ancestors_artisan_district
  // from the artisan side backwards). The Sky Shaft is Ruga's arena —
  // one-shot fight (canRevisit:false).
  const nodes = [
    { id: 'ancestors_entry', name: 'Hall Entry', description: 'The stairway from the northern gate opens into the vast Hall of Ancestors.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [606, 760], mapArea: 'hall_of_ancestors', canRevisit: true, unlocks: ['ancestors_sky_shaft'], hiddenName: '???', hiddenDescription: 'A stairway descends from the gate.' },
    { id: 'ancestors_sky_shaft', name: 'The Sky Shaft', description: 'The center of the hall, bathed in true sunlight from a shaft cut through the mountain above.', encounterId: 'ruga_slave_master', connections: ['ancestors_entry', 'ancestors_monument_alley', 'ancestors_artisan_district', 'ancestors_kings_district'], position: [740, 680], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: false, unlocks: ['ancestors_monument_alley', 'ancestors_artisan_district', 'ancestors_kings_district'], hiddenName: '???', hiddenDescription: 'A shaft of light filters down from above.' },
    { id: 'ancestors_monument_alley', name: 'To Monument Alley', description: 'A wide passage lined with toppled statues leads west.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [150, 620], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'An alley leads to the west.' },
    // Entry point from the Artisan District (backwards traversal).
    { id: 'ancestors_artisan_district', name: 'To the Artisan District', description: 'The eastern passage reeks of old soot and cold metal.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [1250, 620], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leads to the east.' },
    // PY had this node — JS was missing it. Climbs north toward the
    // upper city / Grand Stairs.
    { id: 'ancestors_kings_district', name: "To the King's District", description: 'A grand stairway climbs north toward the upper city. Firelight flickers above.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [730, 590], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A grand stairway climbs north.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'ancestors_entry';
  return map;
}

// === Monument Alley Map ===
export function createMonumentAlleyMap() {
  const map = new GameMap('monument_alley', 'Monument Alley');
  map.mapImages = {
    monument_alley: 'Maps/DwarvenCityMonumentAlley.jpg',
  };

  // Mirrors PY map.py:create_monument_alley_map. Six nodes in a
  // diamond: entry → south_hub branches to left/right far →
  // converge at north_hub → tomb. Random encounters fire on the
  // middle nodes (monument_south_hub, monument_left_far,
  // monument_right_far, monument_north_hub) via the dwarven-city
  // pool. monument_tomb hands off to the Tomb of the Ancestor map.
  const nodes = [
    // One-shot arrival dialog — canRevisit:false so the corridor
    // intro doesn't replay every time the party comes back from
    // the Hall. Also serves as the back-teleport node (click-on-
    // self after first visit hops back to ancestors_monument_alley).
    { id: 'monument_entry', name: 'Monument Alley Entry', description: 'The wide passage from the Hall of Ancestors opens into a long corridor lined with carved monuments.', encounterId: 'monument_alley_entry', connections: ['monument_south_hub'], position: [720, 750], mapArea: 'monument_alley', canRevisit: false, unlocks: ['monument_south_hub'] },
    { id: 'monument_south_hub', name: 'The Central Monument', description: 'A massive statue of a dwarven king sits at the center, dividing the path into two.', encounterId: '', connections: ['monument_entry', 'monument_left_far', 'monument_right_far'], position: [720, 650], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_left_far', 'monument_right_far'], hiddenName: '???', hiddenDescription: 'A central monument waits ahead.' },
    { id: 'monument_left_far', name: 'Hall of Oaths', description: 'The western alcove deepens into a chamber where ancient oaths were sworn in stone.', encounterId: '', connections: ['monument_south_hub', 'monument_north_hub'], position: [440, 440], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_north_hub'], hiddenName: '???', hiddenDescription: 'A western alcove.' },
    { id: 'monument_right_far', name: 'Chronicle Wall', description: 'A massive wall of carved text stretches floor to ceiling — the Chronicle of Thorgazad.', encounterId: '', connections: ['monument_south_hub', 'monument_north_hub'], position: [1000, 440], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_north_hub'], hiddenName: '???', hiddenDescription: 'An eastern alcove.' },
    { id: 'monument_north_hub', name: "The Ancestor's Threshold", description: 'The two paths converge before a sealed stone door. The air feels heavy here.', encounterId: '', connections: ['monument_left_far', 'monument_right_far', 'monument_tomb'], position: [720, 280], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_tomb'], hiddenName: '???', hiddenDescription: 'Paths converge ahead.' },
    { id: 'monument_tomb', name: 'Tomb of the Ancestor', description: 'A sealed stone door bearing the sigil of the first dwarven king of Thorgazad.', encounterId: '', connections: ['monument_north_hub'], position: [720, 190], mapArea: 'monument_alley', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A sealed stone door.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'monument_entry';
  return map;
}

// === Tomb of Ancestor Map ===
export function createTombOfAncestorMap() {
  const map = new GameMap('tomb_of_ancestor', 'Tomb of the Ancestor');
  map.mapImages = {
    tomb_of_ancestor: 'Maps/DwarvenCityTombOfAncestor.jpg',
  };

  const nodes = [
    // canRevisit:false so the antechamber intro plays once. The
    // node still doubles as the back-portal to Monument Alley
    // (handled in main.js arriveAtNode).
    { id: 'tomb_entry', name: 'Tomb Antechamber', description: 'A dark antechamber beyond the sealed door. The air is cold and still.', encounterId: 'tomb_of_ancestor_entry', connections: ['tomb_sarcophagus'], position: [680, 740], mapArea: 'tomb_of_ancestor', canRevisit: false, unlocks: ['tomb_sarcophagus'] },
    // canRevisit:true — if the player "Leaves them in peace"
    // without triggering the fight, they can come back and pick the
    // fight on a future visit. The startNodeEncounter hook checks
    // `ancestorSpiritsDefeated` to suppress the encounter once the
    // fight has actually been won.
    { id: 'tomb_sarcophagus', name: 'The Sarcophagus', description: "The final resting place of Durin Stoneheart, founder of Thorgazad.", encounterId: 'tomb_sarcophagus', connections: ['tomb_entry'], position: [677, 570], mapArea: 'tomb_of_ancestor', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A sarcophagus rests within.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tomb_entry';
  return map;
}

// === Grand Stairs Map ===
export function createGrandStairsMap() {
  // Mirrors PY map.py:create_grand_stairs_map — stairway to the
  // King's District. Entry from the Hall of Ancestors via
  // ancestors_kings_district → stairs_entry. Names + descriptions
  // match PY exactly: Base of the Stairs, Lower Landing (king
  // reliefs), Upper Landing (warmer + firelight), To the Throne
  // Hall (top exit).
  const map = new GameMap('grand_stairs', 'The Grand Stairs');
  map.mapImages = {
    grand_stairs: 'Maps/DwarvenCityGrandStairs.jpg',
  };

  const nodes = [
    // One-shot arrival dialog — canRevisit:false so the climb up
    // from the Hall doesn't replay the firelight/kobold-voices
    // intro every time the party comes back through.
    { id: 'stairs_entry', name: 'Base of the Stairs', description: 'A grand stairway flanked by massive pillars climbs into the darkness above.', encounterId: 'grand_stairs_entry', connections: ['stairs_lower'], position: [400, 720], mapArea: 'grand_stairs', canRevisit: false, unlocks: ['stairs_lower'] },
    { id: 'stairs_lower', name: 'Lower Landing', description: 'A wide landing where the stairs turn. Carved reliefs depict the coronation of dwarven kings.', encounterId: '', connections: ['stairs_entry', 'stairs_upper'], position: [760, 540], mapArea: 'grand_stairs', isLocked: true, canRevisit: true, unlocks: ['stairs_upper'], hiddenName: '???', hiddenDescription: 'A landing waits ahead.' },
    { id: 'stairs_upper', name: 'Upper Landing', description: 'The air grows warmer here. The faint glow of firelight spills down from above.', encounterId: '', connections: ['stairs_lower', 'stairs_to_throne'], position: [970, 400], mapArea: 'grand_stairs', isLocked: true, canRevisit: true, unlocks: ['stairs_to_throne'], hiddenName: '???', hiddenDescription: 'The stair climbs higher.' },
    { id: 'stairs_to_throne', name: 'To the Throne Hall', description: 'The top of the stairs opens into the King\'s District. A grand archway leads to the throne hall.', encounterId: '', connections: ['stairs_upper'], position: [1130, 280], mapArea: 'grand_stairs', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Something looms beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'stairs_entry';
  return map;
}

// === Dwarven Throne Room Map ===
export function createDwarvenThroneRoomMap() {
  const map = new GameMap('dwarven_throne_room', 'Dwarven Throne Room');
  map.mapImages = {
    dwarven_throne_room: 'Maps/DwarvenCityThroneRoom.jpg',
  };

  // PY parity (map.py:2593). Unlock chain: entry → dais →
  // to_map_room. Fog labels until visited.
  const nodes = [
    { id: 'throne_entry', name: 'Throne Room Entry', description: 'The grand archway opens into the ruined throne room of Thorgazad.', encounterId: 'dwarven_throne_room_entry', connections: ['throne_dais'], position: [720, 720], mapArea: 'dwarven_throne_room', canRevisit: true, unlocks: ['throne_dais'] },
    { id: 'throne_dais', name: 'The Throne', description: "The stone throne of Thorgazad's kings sits upon a raised dais, cracked but standing.", encounterId: 'throne_specter', connections: ['throne_entry', 'throne_to_map_room'], position: [750, 550], mapArea: 'dwarven_throne_room', isLocked: true, canRevisit: false, unlocks: ['throne_to_map_room'], hiddenName: '???', hiddenDescription: 'A raised dais looms ahead.' },
    { id: 'throne_to_map_room', name: 'To the Map Room', description: 'A hidden passage behind the throne leads to a chamber beyond.', encounterId: '', connections: ['throne_dais'], position: [600, 470], mapArea: 'dwarven_throne_room', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Something beyond the throne.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'throne_entry';
  return map;
}

// === Tunnel to Bridge Map ===
// PY parity (map.py:2811-2851). Three nodes — entry → mid → exit.
// Entry triggers the obsidian-tunnel dialog (artisan exit → here);
// exit teleports to the Upper Bridge map (bridge_to_dwarven).
export function createTunnelToBridgeMap() {
  const map = new GameMap('tunnel_to_bridge', 'Obsidian Tunnel');
  map.mapImages = {
    tunnel_to_bridge: 'Maps/DwarvenCityTunnelToBridge.jpg',
  };
  const nodes = [
    { id: 'bridge_tunnel_entry', name: 'Tunnel Entrance', description: 'The passage descends into a dark tunnel. Veins of obsidian glint in the walls.', encounterId: 'tunnel_to_bridge_entry', connections: ['bridge_tunnel_mid'], unlocks: ['bridge_tunnel_mid'], canRevisit: false, position: [720, 700], mapArea: 'tunnel_to_bridge', hiddenName: '???', hiddenDescription: 'A dark passage descends.' },
    { id: 'bridge_tunnel_mid', name: 'Obsidian Corridor', description: 'The tunnel grows darker. Obsidian veins thicken in the walls, drinking the torchlight.', encounterId: '', connections: ['bridge_tunnel_entry', 'bridge_tunnel_exit'], unlocks: ['bridge_tunnel_exit'], isLocked: true, canRevisit: true, position: [820, 480], mapArea: 'tunnel_to_bridge', hiddenName: '???', hiddenDescription: 'The tunnel stretches on.' },
    { id: 'bridge_tunnel_exit', name: 'To the Bridge', description: 'The tunnel opens ahead. You can hear wind howling through a vast open space.', encounterId: '', connections: ['bridge_tunnel_mid'], isLocked: true, canRevisit: true, position: [810, 330], mapArea: 'tunnel_to_bridge', hiddenName: '???', hiddenDescription: 'Wind howls from beyond.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'bridge_tunnel_entry';
  return map;
}

// === Map Room Map ===
export function createMapRoomMap() {
  const map = new GameMap('map_room', 'Map Room');
  map.mapImages = {
    map_room: 'Maps/DwarvenCityMapRoom.jpg',
  };

  // PY parity (map.py:2637-2666). 2 nodes: entry + map table. ???
  // fog on the table until first visit.
  const nodes = [
    { id: 'map_room_entry', name: 'Map Room Entry', description: 'A hidden chamber behind the throne, dominated by a massive stone map table.', encounterId: 'map_room_entry', connections: ['map_table'], position: [500, 700], mapArea: 'map_room', canRevisit: false, unlocks: ['map_table'] },
    { id: 'map_table', name: 'The Map Table', description: 'A great stone table carved with a detailed map of the entire volcano and the city beneath it.', encounterId: 'map_table', connections: ['map_room_entry'], position: [720, 450], mapArea: 'map_room', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A massive stone table.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'map_room_entry';
  return map;
}

// === Deeper Tunnels Map ===
export function createDeeperTunnelsMap() {
  const map = new GameMap('deeper_tunnels', 'Deeper Tunnels');
  map.mapImages = {
    deeper_tunnels: 'Maps/DwarvenCityDeeperTunnels.jpg',
  };

  // Mirrors PY map.py:create_deeper_tunnels_map — 4 nodes: entry
  // (back-portal to Hall), two middle movement nodes that roll the
  // dwarven-city random encounter pool, and exit (forward to
  // Artisan District). canRevisit:false on entry so the intro
  // dialog plays once and the node can be used as a back-portal
  // after.
  const nodes = [
    { id: 'tunnels_entry', name: 'Tunnel Entrance', description: 'The eastern passage from the Hall of Ancestors descends into a long, torch-lit tunnel.', encounterId: 'deeper_tunnels_entry', connections: ['tunnels_mid_1'], position: [760, 700], mapArea: 'deeper_tunnels', canRevisit: false, unlocks: ['tunnels_mid_1'], hiddenName: '???', hiddenDescription: 'A torch-lit passage descends.' },
    { id: 'tunnels_mid_1', name: 'Carved Passage', description: 'The tunnel narrows. Dwarven carvings line the walls, half-obscured by soot and kobold scratches.', encounterId: '', connections: ['tunnels_entry', 'tunnels_mid_2'], position: [750, 570], mapArea: 'deeper_tunnels', isLocked: true, canRevisit: true, unlocks: ['tunnels_mid_2'], hiddenName: '???', hiddenDescription: 'The tunnel narrows.' },
    { id: 'tunnels_mid_2', name: 'Torch Gallery', description: 'Old torch sconces still burn with a faint magical flame. The air smells of soot and hot metal.', encounterId: '', connections: ['tunnels_mid_1', 'tunnels_exit'], position: [740, 460], mapArea: 'deeper_tunnels', isLocked: true, canRevisit: true, unlocks: ['tunnels_exit'], hiddenName: '???', hiddenDescription: 'A torchlit gallery ahead.' },
    { id: 'tunnels_exit', name: 'To the Artisan District', description: 'The tunnel opens ahead. The orange glow of furnaces spills through the archway.', encounterId: '', connections: ['tunnels_mid_2'], position: [760, 360], mapArea: 'deeper_tunnels', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Light spills from beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnels_entry';
  return map;
}

// === Artisan District Map ===
export function createArtisanDistrictMap() {
  const map = new GameMap('artisan_district', 'Artisan District');
  map.mapImages = {
    artisan_district: 'Maps/DwarvenCityArtisanDistrict.jpg',
  };

  // PY parity: 7 nodes — entry → lower → upper → walkway → overlook,
  // which then unlocks both artisan_exit (back out) and the sealed
  // artisan_workshop (the forge). All middle nodes are random-
  // encounter candidates via DWARVEN_CITY_RANDOM_NODES.
  const nodes = [
    { id: 'artisan_entry', name: 'District Entry', description: 'The tunnel opens into a vast cavern of workshops and forges, lit by rivers of lava below.', encounterId: 'artisan_district_entry', connections: ['artisan_lower_shops'], position: [1340, 760], mapArea: 'artisan_district', canRevisit: false, unlocks: ['artisan_lower_shops'], hiddenName: '???', hiddenDescription: 'A wide cavern opens here.' },
    { id: 'artisan_lower_shops', name: 'Lower Workshops', description: 'Rows of abandoned workshops line the lower level. Anvils, quenching troughs, and scattered tools.', encounterId: '', connections: ['artisan_entry', 'artisan_upper_shops'], position: [1020, 640], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_upper_shops'], hiddenName: '???', hiddenDescription: 'A lower row of abandoned workshops.' },
    { id: 'artisan_upper_shops', name: 'Upper Workshops', description: 'The upper level workshops. Finer work was done here — jewelry, enchanting, runecraft.', encounterId: '', connections: ['artisan_lower_shops', 'artisan_walkway'], position: [330, 410], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_walkway'], hiddenName: '???', hiddenDescription: 'An upper row of finer workshops.' },
    { id: 'artisan_walkway', name: 'Iron Walkway', description: 'A narrow iron walkway spans the gap between workshop platforms. Lava glows far below.', encounterId: '', connections: ['artisan_upper_shops', 'artisan_overlook'], position: [620, 380], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_overlook'], hiddenName: '???', hiddenDescription: 'A narrow iron walkway.' },
    { id: 'artisan_overlook', name: 'Forge Overlook', description: 'A raised platform overlooking the entire district. The central forge sits cold and dark below.', encounterId: '', connections: ['artisan_walkway', 'artisan_exit', 'artisan_workshop'], position: [890, 260], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_exit', 'artisan_workshop'], hiddenName: '???', hiddenDescription: 'A raised platform above the district.' },
    { id: 'artisan_workshop', name: 'Intact Workshop', description: 'A sealed workshop door, untouched by kobold hands. Dwarven runes glow faintly around the frame.', encounterId: 'artisan_workshop', connections: ['artisan_overlook'], position: [580, 200], mapArea: 'artisan_district', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A sealed dwarven workshop.' },
    { id: 'artisan_exit', name: 'District Exit', description: 'A passage leads out of the Artisan District toward other parts of the city.', encounterId: '', connections: ['artisan_overlook'], position: [1240, 220], mapArea: 'artisan_district', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leading onward.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'artisan_entry';
  return map;
}

// Top of the Infinite Stairs — windswept plateau above Tharnag. Reached
// by climbing past `climbing_stairs` on the exterior map; the arrival
// node fires the "we made it; let's rest at the outpost" dialog. The
// path winds across the ridge to the Skyforge Outpost gate, which
// cross-maps into the outpost interior.
export function createTopOfInfiniteStairsMap() {
  const map = new GameMap('top_of_infinite_stairs', 'Top of the Infinite Stairs');
  map.mapImages = {
    top_of_infinite_stairs: 'Maps/TopOfStairsOfInfinite.jpg',
  };
  const nodes = [
    { id: 'top_stairs_arrival', name: 'Top of the Stairs', description: 'The Stairs of the Infinite open onto a windswept plateau.', encounterId: 'top_stairs_arrival', connections: ['top_stairs_ridge'], position: [780, 750], mapArea: 'top_of_infinite_stairs', canRevisit: false, passthroughTo: 'climbing_stairs' },
    { id: 'top_stairs_ridge', name: 'Mountain Trail', description: 'A narrow trail picks its way along the ridge.', encounterId: '', connections: ['top_stairs_arrival', 'top_stairs_overlook'], position: [910, 570], mapArea: 'top_of_infinite_stairs', canRevisit: true },
    { id: 'top_stairs_overlook', name: 'Cliffside Overlook', description: 'The trail rounds a shoulder of stone; the kingdom spreads out below.', encounterId: '', connections: ['top_stairs_ridge', 'top_stairs_approach'], position: [960, 370], mapArea: 'top_of_infinite_stairs', canRevisit: true },
    { id: 'top_stairs_approach', name: 'Outpost Approach', description: 'Dwarven banners snap against a low watchtower up ahead.', encounterId: '', connections: ['top_stairs_overlook', 'top_stairs_to_outpost'], position: [1080, 230], mapArea: 'top_of_infinite_stairs', canRevisit: true },
    { id: 'top_stairs_to_outpost', name: 'The Last Watch Gate', description: 'Iron-banded gates marked with the hammer of Moradin. A weather-beaten sign reads THE LAST WATCH.', encounterId: '', connections: ['top_stairs_approach'], position: [770, 100], mapArea: 'top_of_infinite_stairs', canRevisit: true, passthroughTo: 'last_watch_entry' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'top_stairs_arrival';
  return map;
}

// The Last Watch — dwarven garrison at the highest altitude in
// Tharnag's reach, named for being the final outpost before the
// kingdom's edge. Exterior courtyard map. The bottom gate links back
// to the ridge; the courtyard fires the Guard Captain audience
// (one-shot dialog + Rest/Leave choice). After resting at the keep
// the path Down to the Valley unlocks.
export function createLastWatchMap() {
  const map = new GameMap('last_watch', 'The Last Watch');
  map.mapImages = {
    last_watch: 'Maps/TheLastWatch.jpg',
  };
  const nodes = [
    { id: 'last_watch_entry', name: 'Watch Gate', description: 'You step through the gates of the Last Watch — the highest outpost in Tharnag.', encounterId: '', connections: ['last_watch_courtyard'], position: [920, 660], mapArea: 'last_watch', canRevisit: true, passthroughTo: 'top_stairs_to_outpost' },
    // The courtyard is just a junction now — the dialog + rest happen
    // at the Watch Keep node. Connects out to the keep AND down to the
    // valley descent (which itself gates on isWellRested at click time
    // with the "Go Rest in the Keep" toast).
    { id: 'last_watch_courtyard', name: 'Watch Courtyard', description: 'A windswept courtyard. The keep stands at the far side; a switchback path drops away to the south.', encounterId: '', connections: ['last_watch_entry', 'last_watch_keep', 'last_watch_to_valley'], position: [480, 430], mapArea: 'last_watch', canRevisit: true },
    // Watch Keep — Guard Captain audience + Rest/Leave choice. First
    // visit runs the full dialog (createLastWatchAudienceEncounter);
    // subsequent visits route to the revisit factory (choice only).
    { id: 'last_watch_keep', name: 'Watch Keep', description: 'The interior of the keep. The captain of the watch greets you here.', encounterId: 'last_watch_audience', connections: ['last_watch_courtyard', 'last_watch_supplies', 'last_watch_shrine'], position: [560, 340], mapArea: 'last_watch', canRevisit: true },
    // Supply Cache — one-time captain hand-off. Rolls 1 random item
    // from dwarven_market_loot. Latches lastWatchSupplyTaken; the
    // startNodeEncounter gate short-circuits any revisit so the
    // dialog never replays. Hangs off the keep so the player has to
    // meet the captain before the cache opens up visually.
    { id: 'last_watch_supplies', name: 'Supply Cache', description: 'A long storeroom hung with cloaks and stacked with dwarven gear.', encounterId: 'last_watch_supply_cache', connections: ['last_watch_keep'], position: [860, 240], mapArea: 'last_watch', canRevisit: true },
    // Stormwatcher's Shrine — open-air shrine to Marthammor Duin
    // (Watcher Over Wanderers), tucked above the keep where dwarves
    // bound for the surface used to come for a blessing before the
    // descent. Dormant for now: short flavor beat on first arrival,
    // no mechanical payoff yet — leaves a hook for future content
    // (rekindle the brazier, etc).
    { id: 'last_watch_shrine', name: "Stormwatcher's Shrine", description: 'A small stone shrine open to the wind, its brazier long cold.', encounterId: 'stormwatchers_shrine_dormant', connections: ['last_watch_keep'], position: [780, 440], mapArea: 'last_watch', canRevisit: true },
    // Down to the Valley — always visible. Walking onto it walks to
    // the Valley Path node on the same map; the well-rested gate is
    // enforced at click time on last_watch_to_valley (toasts "Go Rest
    // in the Keep" otherwise).
    { id: 'last_watch_to_valley', name: 'Down to the Valley', description: 'A switchback path drops away into the valley far below.', encounterId: '', connections: ['last_watch_courtyard', 'last_watch_valley_path'], position: [100, 450], mapArea: 'last_watch', canRevisit: true },
    // Valley Path — placeholder node sitting next to Down to the
    // Valley. Future content cross-maps from here into the actual
    // valley map; for now it just sits open with TODO positioning
    // (user will tune coords). Same map area as the rest of the Last
    // Watch so the player doesn't see "all nodes vanish" when the
    // descent fires (which is what happens when the cross-map jump
    // lands on a near-empty target map).
    { id: 'last_watch_valley_path', name: 'Valley Path', description: 'The path opens into the valley proper.', encounterId: '', connections: ['last_watch_to_valley'], position: [70, 350], mapArea: 'last_watch', canRevisit: true, passthroughTo: 'high_valley_1_entry' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'last_watch_entry';
  return map;
}

// High Valley — first of two valley maps below the Last Watch. Four
// nodes laid along a winding mountain trail. The entry pairs back to
// the Last Watch (Valley Path); the exit cross-maps to the second
// half (createHighValley2Map). Placeholder positions — user will
// tune.
export function createHighValley1Map() {
  const map = new GameMap('high_valley_1', 'High Valley');
  map.mapImages = {
    high_valley_1: 'Maps/HighValley1.jpg',
  };
  const nodes = [
    { id: 'high_valley_1_entry', name: 'Valley Floor', description: 'The trail flattens into the valley proper.', encounterId: 'valley_floor_arrival', connections: ['high_valley_1_b'], position: [90, 720], mapArea: 'high_valley_1', canRevisit: false, passthroughTo: 'last_watch_valley_path' },
    { id: 'high_valley_1_b',     name: 'Stone Cairn',  description: 'A stack of stones marks the trail.',           encounterId: '', connections: ['high_valley_1_entry', 'high_valley_1_c'], position: [740, 700], mapArea: 'high_valley_1', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something on the trail ahead.' },
    { id: 'high_valley_1_c',     name: 'Ridge Bend',   description: 'The path bends along a rocky ridge.',          encounterId: '', connections: ['high_valley_1_b', 'high_valley_1_exit'],    position: [820, 560], mapArea: 'high_valley_1', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The trail bends out of sight.' },
    { id: 'high_valley_1_exit',  name: 'Onward',       description: 'The valley narrows ahead.',                    encounterId: '', connections: ['high_valley_1_c'],                          position: [610, 510], mapArea: 'high_valley_1', canRevisit: true, passthroughTo: 'high_valley_2_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'The valley narrows ahead.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'high_valley_1_entry';
  return map;
}

// High Valley — second of two valley maps. Four nodes: entry, the
// Frostbloom patch (the rare flower Olbrim was after), then two
// more nodes after the patch leading deeper in. Placeholder
// positions — user will tune.
export function createHighValley2Map() {
  const map = new GameMap('high_valley_2', 'High Valley');
  map.mapImages = {
    high_valley_2: 'Maps/HighValley2.jpg',
  };
  const nodes = [
    { id: 'high_valley_2_entry',     name: 'Upper Valley', description: 'The trail opens into a quiet upper valley.', encounterId: 'upper_valley_arrival', connections: ['high_valley_2_frostbloom'], position: [750, 750], mapArea: 'high_valley_2', canRevisit: false, passthroughTo: 'high_valley_1_exit' },
    // Frostbloom patch — Olbrim's rare flower. One-shot encounter
    // awards the party a Frostbloom card on the LOOT phase.
    { id: 'high_valley_2_frostbloom', name: 'Frostbloom Patch', description: 'A scattering of pale blue flowers blooms among the rocks.', encounterId: 'frostbloom_patch', connections: ['high_valley_2_entry', 'high_valley_2_c'], position: [930, 570], mapArea: 'high_valley_2', canRevisit: false, discoverable: true, hiddenName: '???', hiddenDescription: 'Something pale catches the light ahead.' },
    { id: 'high_valley_2_c',         name: 'Cold Spring', description: 'A spring trickles out of the rock face — startlingly cold.', encounterId: '', connections: ['high_valley_2_frostbloom', 'high_valley_2_d'], position: [800, 520], mapArea: 'high_valley_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A glint of water on the rocks.' },
    { id: 'high_valley_2_d',         name: 'Deeper Path', description: 'The valley narrows further, the air thinner still.', encounterId: 'deeper_path_find', connections: ['high_valley_2_c', 'high_valley_2_cave_entrance'], position: [660, 500], mapArea: 'high_valley_2', canRevisit: false, discoverable: true, hiddenName: '???', hiddenDescription: 'The valley narrows further.' },
    // Cave Entrance — cross-maps into the Mountain Cave map at the
    // foot of the cliff face. Click also fires a short arrival
    // dialog on the new map before the player walks deeper.
    { id: 'high_valley_2_cave_entrance', name: 'Cave Entrance', description: 'A dark opening yawns at the base of the cliff face.', encounterId: '', connections: ['high_valley_2_d'], position: [750, 420], mapArea: 'high_valley_2', canRevisit: true, passthroughTo: 'mountain_cave_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'A dark opening in the cliff face.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'high_valley_2_entry';
  return map;
}

// High Valley Mountain Cave — interior cave reached from the High
// Valley 2 trail. Three nodes: the entry (pairs back to the valley),
// the Circular Ruins in the middle, and the Ice Waterfall which will
// cross-map to the next area when it's built. Placeholder positions
// — tune to taste.
export function createMountainCaveMap() {
  const map = new GameMap('mountain_cave', 'Mountain Cave');
  map.mapImages = {
    mountain_cave: 'Maps/HighValleyMountainCave.jpg',
  };
  const nodes = [
    { id: 'mountain_cave_entry',         name: 'Cave Entrance',  description: 'You step in out of the wind. Dwarven runes are scratched into the stone above the doorway.', encounterId: 'cave_entrance_arrival', connections: ['mountain_cave_ruins'], position: [900, 40], mapArea: 'mountain_cave', canRevisit: false, passthroughTo: 'high_valley_2_cave_entrance' },
    { id: 'mountain_cave_ruins',         name: 'Circular Ruins', description: 'The cave opens around a ring of broken stone — a circular ruin half-swallowed by ice.',           encounterId: 'circular_ruins_combat', connections: ['mountain_cave_entry', 'mountain_cave_ice_waterfall'], position: [750, 400], mapArea: 'mountain_cave', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Stone shapes loom in the gloom ahead.' },
    { id: 'mountain_cave_ice_waterfall', name: 'Ice Waterfall',  description: 'A frozen waterfall sheets the back wall. A narrow passage threads through the ice beyond.',  encounterId: 'ice_waterfall_climb', connections: ['mountain_cave_ruins'], position: [340, 220], mapArea: 'mountain_cave', canRevisit: false, passthroughTo: 'roc_nest_far_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'Pale light glints further in.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'mountain_cave_entry';
  return map;
}

// Roc Nest From Far — open ridge approach to the Roc's nest, glimpsed
// at distance. Entry pairs back to the Mountain Cave Ice Waterfall;
// four more nodes wind across the ridge toward the final approach.
// The last node will cross-map into the nest interior when that map
// exists. Placeholder positions — tune to taste.
export function createRocNestFromFarMap() {
  const map = new GameMap('roc_nest_far', 'Roc Nest Approach');
  map.mapImages = {
    roc_nest_far: 'Maps/RocNestFromFar.jpg',
  };
  const nodes = [
    { id: 'roc_nest_far_entry', name: 'Ridge Trail',     description: 'You step out of the cave onto a high mountain ridge. Far ahead, something massive crowns the peak.', encounterId: '', connections: ['roc_nest_far_b'], position: [450, 760], mapArea: 'roc_nest_far', canRevisit: true, passthroughTo: 'mountain_cave_ice_waterfall' },
    { id: 'roc_nest_far_b',     name: 'Windward Pass',   description: 'The wind picks up. Loose feathers — far too large for any hawk — drift across the trail.',           encounterId: '', connections: ['roc_nest_far_entry', 'roc_nest_far_c'], position: [600, 660], mapArea: 'roc_nest_far', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something blows on the wind ahead.' },
    { id: 'roc_nest_far_c',     name: 'Bone Field',       description: 'The path crosses a slope littered with bleached bones — old kills, picked clean.',                   encounterId: '', connections: ['roc_nest_far_b', 'roc_nest_far_d'],     position: [630, 470], mapArea: 'roc_nest_far', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'White shapes scattered on the slope.' },
    { id: 'roc_nest_far_d',     name: 'Final Approach',  description: 'The nest looms close now — woven from whole tree trunks. Something stirs inside.',                     encounterId: 'final_approach_check', connections: ['roc_nest_far_c', 'roc_nest_far_exit'],  position: [180, 280], mapArea: 'roc_nest_far', canRevisit: false, discoverable: true, hiddenName: '???', hiddenDescription: 'A massive shape crowns the ridge.' },
    // Exit — cross-maps into the nest interior.
    { id: 'roc_nest_far_exit',  name: 'Into the Nest',   description: 'The lip of the nest. There is no walking up here unseen.',                                            encounterId: '', connections: ['roc_nest_far_d'],                          position: [350, 240], mapArea: 'roc_nest_far', canRevisit: true, passthroughTo: 'nest_interior_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'The lip of the nest itself.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'roc_nest_far_entry';
  return map;
}

// Nest Interior — inside the Roc's nest. Two nodes for now: the
// entry (pairs back to the Roc Nest Approach map) and the middle of
// the nest. Future content fills in the actual confrontation.
export function createNestInteriorMap() {
  const map = new GameMap('nest_interior', "The Roc's Nest");
  map.mapImages = {
    nest_interior: 'Maps/NestInterior.jpg',
  };
  const nodes = [
    { id: 'nest_interior_entry',  name: 'Edge of the Nest', description: 'You crest the rim. The nest spreads out like a small clearing, woven from whole tree trunks.', encounterId: '', connections: ['nest_interior_middle'], position: [260, 520], mapArea: 'nest_interior', canRevisit: true, passthroughTo: 'roc_nest_far_exit' },
    { id: 'nest_interior_middle', name: 'Middle of the Nest', description: 'Bones and broken armor crunch underfoot. Something dark stirs deeper in the nest.',         encounterId: 'nest_middle_olbrim', connections: ['nest_interior_entry'],  position: [700, 440], mapArea: 'nest_interior', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something stirs deeper inside.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'nest_interior_entry';
  return map;
}

// === Necromancer's House (Path of the Necromancer side quest) ===
// Opening map for the side quest. Single starting node (Apprentice's
// Room) holds the intro dialog. The map art is a placeholder —
// `mapImages` points at a file that may not exist yet; the map view
// falls back to a dark fill if the asset hasn't been wired in.
// Additional nodes (Master's Room, the rest of the house, the abbey)
// get appended once the side quest is fleshed out.
export function createNecromancerHouseMap() {
  const map = new GameMap('necromancer_house', "Master Mortain's House");
  map.mapImages = {
    necromancer_house: 'Maps/UndertakerHouseFirstFloor.jpg',
  };
  // Hub-and-spokes layout. Corridor is the central junction; the four
  // rooms (Bedroom, Dining Room, Door, Upstairs) each link only back
  // to the corridor, so traversal is always Room → Corridor → Room.
  const nodes = [
    {
      id: 'bedroom',
      name: 'Bedroom',
      description: "Your small bedchamber. Empty plates and a guttered candle. The rats again behind the wall.",
      // Opening monologue fires when the player arrives here on
      // run start. Encounter id intentionally kept as 'apprentice_room'
      // (the encounter's identity is the dialog, not the room).
      // canRevisit stays false so the standard pipeline never re-runs
      // apprentice_room after the intro; the bedroom_trap_door beat
      // is fired by an early dispatch in startNodeEncounter that
      // bypasses canRunEncounter entirely (gated on studyVisited +
      // !completedEncounters.has('bedroom_trap_door')).
      encounterId: 'apprentice_room',
      connections: ['corridor', 'trap_door'],
      position: [340, 320],
      mapArea: 'necromancer_house',
      canRevisit: false,
    },
    {
      id: 'trap_door',
      name: 'Trap Door',
      description: "A heavy wooden hatch set into the floorboards beside the bed, its lock-symbols newly faded.",
      // Locked + hidden ("???") on map load. The bedroom_trap_door
      // revisit dialog flips isLocked off via the
      // 'bedroom_trap_door' completion hook in advanceEncounterPhase,
      // and the trap_door encounter is the simple peer-down beat
      // the player triggers by walking onto the node afterwards.
      encounterId: 'trap_door',
      connections: ['bedroom'],
      position: [180, 380],
      mapArea: 'necromancer_house',
      isLocked: true,
      canRevisit: false,
      hiddenName: '???',
      hiddenDescription: "Something under the floorboards — you cannot quite see what.",
    },
    {
      id: 'corridor',
      name: 'Corridor',
      description: "The hallway runs the length of the house. Doors on every wall.",
      encounterId: '',
      connections: ['bedroom', 'dining_room', 'door', 'upstairs', 'storage_area'],
      position: [600, 580],
      mapArea: 'necromancer_house',
      canRevisit: true,
    },
    {
      id: 'storage_area',
      name: 'Storage Area',
      description: "A nook crammed with crates, old linens, and tools that belonged to nobody you remember.",
      // One-shot rummage encounter — the apprentice digs through the
      // crates and finds something useful (Scraps added to deck).
      encounterId: 'storage_area',
      connections: ['corridor'],
      position: [760, 170],
      mapArea: 'necromancer_house',
      canRevisit: false,
    },
    {
      id: 'dining_room',
      name: 'Dining Room',
      description: "A long table, dust-thick. The chairs have not been pushed in since the last meal.",
      // One-shot Plague Cockroach fight; the dialog + COMBAT phase
      // fires on first arrival and the node is "done" afterwards.
      encounterId: 'dining_room',
      connections: ['corridor'],
      position: [350, 820],
      mapArea: 'necromancer_house',
      canRevisit: false,
    },
    {
      id: 'door',
      name: 'Front Door',
      description: "The heavy front door, barred and chained from the inside the way Master Mortain left it.",
      // One-shot peek-through-the-door dialog; after it fires the node
      // is "done" but still walkable (the player can wander past the
      // door without re-triggering the warning).
      encounterId: 'front_door',
      connections: ['corridor'],
      position: [560, 930],
      mapArea: 'necromancer_house',
      canRevisit: false,
    },
    {
      id: 'upstairs',
      name: 'Upstairs',
      description: "The narrow stair climbs up into the dark. Master Mortain's room is somewhere above.",
      // Repeatable gate dialog — the apprentice can put her shoulder
      // to the study door any time. The "go to study" choice swaps
      // the active map to the necromancer_study map via the
      // go_to_study handler in main.js.
      encounterId: 'upstairs',
      connections: ['corridor'],
      position: [910, 760],
      mapArea: 'necromancer_house',
      canRevisit: true,
    },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'bedroom';
  return map;
}

// === Necromancer's Study (Path of the Necromancer side quest) ===
// Reached from the Upstairs node of the undertaker's house once the
// apprentice tries the door and finds it unsealed. Single arrival
// node for now — more upstairs content (Master Mortain's library,
// the cabinet of curiosities, the back door to the abbey) gets
// appended as the side quest grows.
export function createNecromancerStudyMap() {
  const map = new GameMap('necromancer_study', "Master Mortain's Study");
  map.mapImages = {
    necromancer_study: 'Maps/NecromancerStudyMap.jpg',
  };
  const nodes = [
    {
      id: 'study_room',
      name: "Master Mortain's Study",
      description: "Master Mortain's private study. Lectern, candle stubs, a closed book lying open on the desk.",
      // Click-on-self warps the apprentice back to the stair landing
      // in the house. Wired via isCrossMapGate + the arriveAtNode
      // study_room handler in main.js — passthroughTo is informative
      // only; the handler does the actual map swap.
      encounterId: '',
      connections: ['study_desk'],
      position: [850, 910],
      mapArea: 'necromancer_study',
      canRevisit: true,
      passthroughTo: 'upstairs',
    },
    {
      id: 'study_desk',
      name: 'Desk',
      description: "Master Mortain's writing desk. An inkpot, a half-burnt candle, and a closed book waiting for the right hand to open it.",
      // One-shot — apprentice reads Master Mortain's farewell note
      // and takes the spellbook off the desk. After this fires the
      // node is "done" but stays walkable so she can pass by it.
      encounterId: 'study_desk',
      connections: ['study_room'],
      position: [610, 440],
      mapArea: 'necromancer_study',
      canRevisit: false,
    },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'study_room';
  return map;
}

// Path of the Necromancer — first underground tunnel under Master
// Mortain's house. Reached by descending through the bedroom trap
// door. Octagonal stone chamber with an altar/shrine at the top;
// 3 corridor nodes ring the room and one shrine node sits up top.
// The east corridor cross-maps into Underground Tunnel 2.
export function createUndergroundTunnel1Map() {
  const map = new GameMap('underground_tunnel_1', 'Underground Tunnels');
  map.mapImages = {
    underground_tunnel_1: 'Maps/UndergroundTunnel1.jpg',
  };
  const nodes = [
    {
      id: 'tunnel1_entry',
      name: 'Foot of the Ladder',
      description: "The wooden ladder ends at a cracked flagstone floor. Old air, old dust. The hatch you came through hangs open above your head.",
      // Click-on-self warps the apprentice back up to the bedroom
      // trap_door node — wired via the isCrossMapGate ladder + the
      // arriveAtNode tunnel1_entry handler in main.js.
      encounterId: '',
      connections: ['tunnel1_mid'],
      position: [512, 870],
      mapArea: 'underground_tunnel_1',
      canRevisit: true,
      passthroughTo: 'trap_door',
    },
    {
      id: 'tunnel1_mid',
      name: 'Stone Floor',
      description: "An octagonal stone room. Burnt-out torches in iron rings, a faint scent of incense, and an arched alcove at the far end.",
      encounterId: 'tunnel1_mid',
      connections: ['tunnel1_entry', 'tunnel1_east', 'tunnel1_shrine'],
      position: [512, 560],
      mapArea: 'underground_tunnel_1',
      // Stone-floor dialog should fire once and never again on revisit.
      canRevisit: false,
    },
    {
      id: 'tunnel1_east',
      name: 'East Corridor',
      description: "A side passage that runs east, deeper into the rock. The torchlight does not quite reach the end.",
      // First visit fires the East Corridor encounter (Forgotten
      // Specter fight). After the encounter completes, the teleport
      // branch in arriveAtNode gates on completedEncounters and warps
      // the apprentice straight through to Underground Tunnel 2 on
      // every subsequent walk-on or click.
      encounterId: 'east_corridor',
      connections: ['tunnel1_mid'],
      position: [510, 200],
      mapArea: 'underground_tunnel_1',
      canRevisit: false,
      passthroughTo: 'tunnel2_entry',
    },
    {
      id: 'tunnel1_shrine',
      name: 'Forgotten Shrine',
      description: "A small stone altar in an arched alcove. Whoever it was raised to has been forgotten for a long time.",
      // Re-firing prayer beat. canRevisit stays TRUE so the dialog
      // keeps offering Yes / No on every visit — the apprentice can
      // back off (No) and come back later to pray. Once she actually
      // gains Drain Life (Yes branch grants it via the LOOT phase),
      // the startNodeEncounter dispatch in main.js silences the node
      // by scanning player.deck.masterDeck for the 'drain_life' card.
      // So the altar pesters her until she takes the gift, then goes
      // quiet.
      encounterId: 'tunnel1_shrine',
      connections: ['tunnel1_mid'],
      position: [312, 410],
      mapArea: 'underground_tunnel_1',
      canRevisit: true,
    },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnel1_entry';
  return map;
}

// Path of the Necromancer — second underground tunnel. Linear three-
// node passage: entry from Tunnel 1 at the top, a stretch of stone
// floor in the middle, and an exit at the bottom that drops into
// Tunnel 3. Plain corridor, no shrine.
export function createUndergroundTunnel2Map() {
  const map = new GameMap('underground_tunnel_2', 'Underground Tunnels');
  map.mapImages = {
    underground_tunnel_2: 'Maps/UndergroundTunnel2.jpg',
  };
  const nodes = [
    {
      id: 'tunnel2_entry',
      name: 'Tunnel Mouth',
      description: "The east passage opens into a wider chamber. A stair climbs back toward Master Mortain's house behind you.",
      encounterId: '',
      connections: ['tunnel2_mid'],
      position: [500, 950],
      mapArea: 'underground_tunnel_2',
      canRevisit: true,
      passthroughTo: 'tunnel1_east',
    },
    {
      id: 'tunnel2_mid',
      name: 'Worn Floor',
      description: "The flagstones underfoot have been walked smooth in a single track — someone used this corridor often, once.",
      encounterId: 'tunnel2_mid',
      connections: ['tunnel2_entry', 'tunnel2_exit'],
      position: [670, 620],
      mapArea: 'underground_tunnel_2',
      // Worn-floor dialog should fire once and never again on revisit.
      canRevisit: false,
    },
    {
      id: 'tunnel2_exit',
      name: 'Ascending Stair',
      description: "A worn stairway climbs up toward a narrow landing, lit by a single guttering torch above.",
      encounterId: '',
      connections: ['tunnel2_mid'],
      position: [500, 200],
      mapArea: 'underground_tunnel_2',
      canRevisit: true,
      passthroughTo: 'tunnel3_entry',
    },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnel2_entry';
  return map;
}

// Path of the Necromancer — third underground tunnel. Two corridor
// nodes climbing toward a closed door at the top. The door is a
// placeholder for now — the encounter just says it is sealed and
// the apprentice cannot get through yet (next chapter hook).
export function createUndergroundTunnel3Map() {
  const map = new GameMap('underground_tunnel_3', 'Underground Tunnels');
  map.mapImages = {
    underground_tunnel_3: 'Maps/UndergroundTunnel3.jpg',
  };
  const nodes = [
    {
      id: 'tunnel3_entry',
      name: 'Lower Landing',
      description: "The stair from the second tunnel ends here. Ahead, the corridor climbs again — toward a heavy stone door at the top.",
      encounterId: '',
      connections: ['tunnel3_mid'],
      position: [512, 870],
      mapArea: 'underground_tunnel_3',
      canRevisit: true,
      passthroughTo: 'tunnel2_exit',
    },
    {
      id: 'tunnel3_mid',
      name: 'Stone Stair',
      description: "Worn steps climb between rough-hewn columns. Two torches still hold a faint flame — someone has kept this passage lit.",
      // Specter of Death encounter — Master Mortain's book activates
      // on the stair and grants Arcane Shield in hand before the
      // fight. One-shot; canRevisit false so the apprentice doesn't
      // re-trigger the fight on the way back down.
      encounterId: 'tunnel3_mid',
      connections: ['tunnel3_entry', 'tunnel3_door'],
      position: [512, 520],
      mapArea: 'underground_tunnel_3',
      canRevisit: false,
    },
    {
      id: 'tunnel3_door',
      name: 'Closed Door',
      description: "A heavy stone door at the top of the stair, banded in old iron. It will not open for you — not yet.",
      // First visit (pre-Stone-Stair): the door is sealed and the
      // apprentice's path stops here. Post-Stone-Stair the dispatch
      // in startNodeEncounter swaps to the Open variant — the door
      // unseals and a mini level-up fires (full heal + Necromancer
      // perk pick). canRevisit:true lets the open variant fire as a
      // second beat; a dedicated stoneDoorOpened flag latches after
      // the open variant runs so revisits after that are silent.
      encounterId: 'tunnel3_door',
      connections: ['tunnel3_mid'],
      position: [512, 80],
      mapArea: 'underground_tunnel_3',
      canRevisit: true,
    },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnel3_entry';
  return map;
}

// Temple of Moradin — post-dragon side quest side-map reached from the
// Tharnag throne room. Two nodes: the entry (teleport pair back to the
// throne) and the altar (prayer encounter — 200 gp for a Tier 2 class
// ability, mirrors the Cathedral Shrine pattern in PY).
export function createTempleOfMoradinMap() {
  const map = new GameMap('temple_of_moradin', 'Temple of Moradin');
  map.mapImages = {
    temple_of_moradin: 'Maps/TempleofMoradin.jpg',
  };
  const nodes = [
    { id: 'temple_moradin_entry', name: 'To the Throne Room', description: 'The doorway leads back to the throne room of Tharnag.', encounterId: '', connections: ['temple_moradin_altar'], position: [1230, 760], mapArea: 'temple_of_moradin', canRevisit: true, passthroughTo: 'temple_moradin_door' },
    { id: 'temple_moradin_altar', name: 'Altar of Moradin', description: 'A massive stone altar carved with the runes of Moradin, the dwarven all-father.', encounterId: 'temple_moradin_altar', connections: ['temple_moradin_entry'], position: [720, 550], mapArea: 'temple_of_moradin', canRevisit: true },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'temple_moradin_entry';
  return map;
}
