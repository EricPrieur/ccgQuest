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
    wip = false, discoverable = false, caveEntrance = false,
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
    // caveEntrance: marks a node as the mouth of a gnoll cave. Set on the 7
    // chasm-map nodes that lead into the cave sub-maps. A later pass rolls each
    // one into a Boss / Guard / generic cave and wires the teleport in.
    this.caveEntrance = caveEntrance;
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
    // Into the Dark — the Underdark entrance. First arrival fires the
    // recognition dialog (encounterId 'underdark_entrance'); choosing "Lets go
    // in." teleports to the Underdark Gnoll Entrance map. Once unlocked the two
    // act as a bidirectional teleporter (passthroughTo + arriveAtNode branches).
    { id: 'c7_8', name: 'Into the Dark', description: 'The dwarf road bores down into true blackness, deeper into the gnoll-held dark — with no end to it in sight.', encounterId: 'underdark_entrance', connections: ['c7_7'], position: [350, 600], mapArea: 'east_mountain_crags_chasm_07', passthroughTo: 'ug_entry', ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c7_1';
  return map;
}

// Underdark Gnoll Entrance — the first Underdark map, reached through the "Into
// the Dark" node (c7_8) on Crags & Chasm 07. A line down into the true dark that
// forks in two at The Long Deep. ug_entry is the threshold: it teleports back to
// c7_8 (passthroughTo + arriveAtNode branch). No random encounters here yet.
export function createUnderdarkGnollEntranceMap() {
  const map = new GameMap('underdark_gnoll_entrance', 'The Underdark');
  const AREA = 'underdark_gnoll_entrance';
  map.mapImages = { [AREA]: 'Maps/UnderdarkGnollEntrance01.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — the teleport node back to the surface (c7_8). Always visible.
    { id: 'ug_entry', name: 'Underdark Threshold', description: 'You step through the gnoll-gnawed mouth of the dwarf road and into the true dark. The air changes — colder, older, alive with a faint dripping echo. Behind you, the way back up.', encounterId: '', connections: ['ug_2'], position: [50, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'c7_8' },
    { id: 'ug_2', name: 'The First Descent', description: 'The floor tilts away, dwarf-cut steps worn to ramps by countless clawed feet.', encounterId: '', connections: ['ug_entry', 'ug_3'], position: [130, 350], ...D },
    { id: 'ug_3', name: 'Fungal Gallery', description: 'Pale luminous fungus climbs the walls, throwing a sick blue glow across the cavern.', encounterId: '', connections: ['ug_2', 'ug_4'], position: [430, 720], ...D },
    { id: 'ug_4', name: 'The Deep Fork', description: 'The passage splits and rejoins around a great stone pillar, gnoll-sign scratched into its base.', encounterId: '', connections: ['ug_3', 'ug_5'], position: [590, 260], ...D },
    { id: 'ug_5', name: 'Whispering Dark', description: 'Something moves in the black beyond your torchlight — or the dark itself is breathing.', encounterId: '', connections: ['ug_4', 'ug_6'], position: [1070, 330], ...D },
    // The Long Deep forks in two, on into the Underdark proper.
    { id: 'ug_6', name: 'The Long Deep', description: 'The cavern opens into a vast, lightless gulf. The Underdark proper waits below — the way splits ahead.', connections: ['ug_5', 'ug_7', 'ug_8'], position: [1130, 670], ...D, encounterId: 'underdark_brad_meeting', canRevisit: false },
    { id: 'ug_7', name: 'The Sunless Sea', description: 'One fork drops toward the lap of black water against unseen stone — a sea that has never known the sun.', connections: ['ug_6'], position: [860, 870], ...D, encounterId: 'underdark_sunless_sea', canRevisit: false },
    // The Deepening Way is a teleporter down to the second Underdark map
    // (UnderdarkGnollEntrance02). Walk-onto / click-on-self hops both ways.
    { id: 'ug_8', name: 'The Deepening Way', description: 'The other fork bores on downward, the dark thickening with every step into the roots of the world.', encounterId: '', connections: ['ug_6'], position: [1160, 840], ...D, passthroughTo: 'ud2_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'ug_entry';
  return map;
}

// Underdark Gnoll Entrance 02 — the second Underdark map, reached down The
// Deepening Way (ug_8) on the first Underdark map. 7 nodes in a line, boring
// deeper into the true dark. ud2_entry is the threshold: it teleports back up to
// ug_8 (passthroughTo + arriveAtNode branch). No random encounters here yet.
export function createUnderdarkGnollEntrance02Map() {
  const map = new GameMap('underdark_gnoll_entrance_2', 'The Underdark');
  const AREA = 'underdark_gnoll_entrance_2';
  map.mapImages = { [AREA]: 'Maps/UnderdarkGnollEntrance02.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back up to The Deepening Way (ug_8). Always visible.
    { id: 'ud2_entry', name: 'The Deepening Descent', description: 'The way down opens out again — the dwarf-cut steps long gone, only raw stone worn smooth by ages of black water. The path back up climbs behind you.', encounterId: '', connections: ['ud2_2'], position: [370, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'ug_8' },
    { id: 'ud2_2', name: 'Dripstone Hall', description: 'A cathedral of stone teeth, water ticking off a thousand points in the dark.', encounterId: '', connections: ['ud2_entry', 'ud2_3'], position: [40, 340], ...D },
    { id: 'ud2_3', name: 'The Blind Warren', description: 'Tunnels branch and rejoin like the burrow of something vast and long gone.', encounterId: '', connections: ['ud2_2', 'ud2_4'], position: [490, 430], ...D },
    { id: 'ud2_4', name: 'Spore Cavern', description: 'The air thickens with drifting spores that glow a faint, sickly green.', encounterId: '', connections: ['ud2_3', 'ud2_5'], position: [880, 120], ...D },
    { id: 'ud2_5', name: 'The Sunken Stair', description: 'A grand stair, half-drowned, spirals down into a pool of perfect black.', encounterId: '', connections: ['ud2_4', 'ud2_6'], position: [1180, 560], ...D },
    { id: 'ud2_6', name: 'Whisperwell', description: 'A round shaft plunges away beneath your feet, and out of it rises a sound almost like voices.', encounterId: '', connections: ['ud2_5', 'ud2_7'], position: [720, 770], ...D },
    // The Far Deep teleports on down to the third Underdark map.
    { id: 'ud2_7', name: 'The Far Deep', description: 'The tunnel gives onto a lightless immensity — the deep roads of the Underdark, running on past any torch.', encounterId: '', connections: ['ud2_6'], position: [680, 510], ...D, passthroughTo: 'ud3_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'ud2_entry';
  return map;
}

// Underdark Gnoll Entrance 03 — the third Underdark map, reached on from The Far
// Deep (ud2_7) on the second Underdark map. 6 nodes in a line, out along the deep
// roads of the Underdark proper. ud3_entry is the threshold: it teleports back to
// ud2_7 (passthroughTo + arriveAtNode branch). No random encounters here yet.
export function createUnderdarkGnollEntrance03Map() {
  const map = new GameMap('underdark_gnoll_entrance_3', 'The Underdark');
  const AREA = 'underdark_gnoll_entrance_3';
  map.mapImages = { [AREA]: 'Maps/UnderdarkGnollEntrance03.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back up to The Far Deep (ud2_7). Always visible.
    { id: 'ud3_entry', name: 'The Deep Roads', description: 'You come out onto a road — an actual road, cut and paved by hands long dead, running straight into the black. Something built this, once. The way back climbs behind you.', encounterId: '', connections: ['ud3_2'], position: [300, 50], mapArea: AREA, canRevisit: true, passthroughTo: 'ud2_7' },
    { id: 'ud3_2', name: 'The Ghostlight Span', description: 'A bridge of pale stone arcs across a chasm, lit from below by a cold, sourceless glow.', encounterId: '', connections: ['ud3_entry', 'ud3_3'], position: [100, 220], ...D },
    { id: 'ud3_3', name: 'The Silent March', description: 'A long colonnade runs on into the dark, every pillar carved with faces worn smooth.', encounterId: '', connections: ['ud3_2', 'ud3_3b'], position: [200, 580], ...D },
    { id: 'ud3_3b', name: 'The Watchers', description: 'The carved faces give way to statues — tall, hooded figures lining the road, heads bowed as if they are still listening for something.', encounterId: '', connections: ['ud3_3', 'ud3_4'], position: [440, 290], ...D },
    { id: 'ud3_4', name: 'The Rift', description: 'The road skirts the lip of a rift so deep the dropped stone never lands.', encounterId: '', connections: ['ud3_3b', 'ud3_5'], position: [830, 140], ...D },
    { id: 'ud3_5', name: 'The Broken Bridge', description: 'The road ends at a bridge sheared in two — the far span lost across the gulf.', encounterId: '', connections: ['ud3_4', 'ud3_6'], position: [850, 610], ...D },
    // The Underhome teleports on to the South Crossroad map.
    { id: 'ud3_6', name: 'The Underhome', description: 'Far below and ahead, points of light — too ordered to be anything but a city. Something down here is awake.', encounterId: '', connections: ['ud3_5'], position: [1070, 870], ...D, passthroughTo: 'usx_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'ud3_entry';
  return map;
}

// Underdark South Crossroad — the fourth Underdark map, reached on from The
// Underhome (ud3_6). A crossroad laid out as a "+": a 2-node entry arm leads in
// to the central crossroad (usx_xroad), and three more 2-node branches strike
// off north / west / east. 9 nodes total. usx_entry is the threshold: it
// teleports back up to ud3_6. No random encounters here yet.
export function createUnderdarkSouthXRoad04Map() {
  const map = new GameMap('underdark_south_xroad_4', 'The Underdark');
  const AREA = 'underdark_south_xroad_4';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthXRoad04.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Entry arm — threshold teleports back up to The Underhome (ud3_6). Fires
    // the crossroad arrival dialog once, the moment the party enters this map.
    { id: 'usx_entry', name: 'The Southward Road', description: 'The city lights fall behind you and the road opens out into the deep of the Underdark. The way back to the Underhome climbs behind you.', encounterId: 'underdark_south_xroad_arrival', connections: ['usx_2'], position: [306, 220], mapArea: AREA, canRevisit: false, passthroughTo: 'ud3_6' },
    { id: 'usx_2', name: 'The Waystone', description: 'A worn marker-stone stands at the roadside, its carved runes long since scoured blank.', encounterId: '', connections: ['usx_entry', 'usx_xroad'], position: [456, 330], ...D },
    // The crossroad — the "+" hub.
    { id: 'usx_xroad', name: 'The South Crossroad', description: 'The road opens into a vast chamber, ways running off into the dark on every side.', encounterId: '', connections: ['usx_2', 'usx_n1', 'usx_w1', 'usx_e1'], position: [616, 434], ...D },
    // North branch (Thorb's road).
    { id: 'usx_n1', name: 'The Northreach', description: 'The north road climbs, the air growing dry and dead as it goes.', encounterId: '', connections: ['usx_xroad', 'usx_n2'], position: [796, 250], ...D },
    // The Sealed Arch teleports on to North Path 26 — the gate stands open now.
    { id: 'usx_n2', name: 'The Sealed Arch', description: 'A vast arch of black stone spans the way north, its gate long sealed — and standing open a hand\'s width, on dark that goes back a very long way.', encounterId: '', connections: ['usx_n1'], position: [946, 30], ...D, passthroughTo: 'unp26_entry' },
    // South-ish branch (Raena's water / rest road).
    { id: 'usx_w1', name: 'The Westward Dark', description: 'This road slopes down toward the sound of running water, somewhere out in the dark.', encounterId: '', connections: ['usx_xroad', 'usx_w2'], position: [490, 644], ...D },
    // The Weeping Gallery teleports on to the South Path map (rest/resupply road).
    { id: 'usx_w2', name: 'The Weeping Gallery', description: 'Water runs endlessly down the walls of a long gallery, pooling black on the floor — a place a party might rest, and drink. The road runs on south from here.', encounterId: '', connections: ['usx_w1'], position: [360, 854], ...D, passthroughTo: 'usp_entry' },
    // East branch (Val's mushroom-lit road).
    { id: 'usx_e1', name: 'The Eastward Dark', description: 'A faint bloom of pale mushroom-light glows somewhere down the eastern road.', encounterId: '', connections: ['usx_xroad', 'usx_e2'], position: [790, 584], ...D },
    { id: 'usx_e2', name: 'The Sunken Market', description: 'The east road runs through the ruin of a market — empty stalls of stone under a soft glow of luminous fungus, drowned to the knees in still water. Past the far stalls a path picks its way on, deeper east into the glow.', encounterId: '', connections: ['usx_e1'], position: [940, 694], ...D, passthroughTo: 'uep14_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usx_entry';
  return map;
}

// Underdark South Path — the fifth Underdark map, reached on south from The
// Weeping Gallery (usx_w2) on the South Crossroad map. 5 nodes in a line, the
// road running on toward running water. usp_entry is the threshold: it teleports
// back to usx_w2. No random encounters here yet.
export function createUnderdarkSouthPath05Map() {
  const map = new GameMap('underdark_south_path_5', 'The Underdark');
  const AREA = 'underdark_south_path_5';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath05.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back up to The Weeping Gallery (usx_w2). Always visible.
    { id: 'usp_entry', name: 'The Weeping Road', description: 'The gallery narrows to a road again, water running with you now down a channel worn smooth in the stone. The way back to the crossroad climbs behind you.', encounterId: '', connections: ['usp_2'], position: [80, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'usx_w2' },
    { id: 'usp_2', name: 'The Runnels', description: 'A dozen little streams thread the floor, all running the same way — downhill, into the dark.', encounterId: '', connections: ['usp_entry', 'usp_3'], position: [430, 200], ...D },
    { id: 'usp_3', name: 'The Still Pool', description: 'The streams gather into a wide, motionless pool, its surface black and perfect as glass.', encounterId: '', connections: ['usp_2', 'usp_4'], position: [670, 370], ...D },
    { id: 'usp_4', name: 'The Cistern Steps', description: 'Broad, shallow steps descend into the water and out the far side, dwarf-cut and ancient.', encounterId: '', connections: ['usp_3', 'usp_5'], position: [890, 600], ...D },
    // The Underspring teleports on to the next stretch of the South Path.
    { id: 'usp_5', name: 'The Underspring', description: 'A spring wells clean and cold out of the living rock — the first good water since the surface. The road runs on south beyond it.', encounterId: '', connections: ['usp_4'], position: [960, 860], ...D, passthroughTo: 'usp6_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp_entry';
  return map;
}

// Underdark South Path 06 — the sixth Underdark map, reached on south from The
// Underspring (usp_5). 5 nodes in a line, the water road running deeper. usp6_entry
// is the threshold: it teleports back to usp_5. No random encounters here yet.
export function createUnderdarkSouthPath06Map() {
  const map = new GameMap('underdark_south_path_6', 'The Underdark');
  const AREA = 'underdark_south_path_6';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath06.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back up to The Underspring (usp_5). Always visible.
    { id: 'usp6_entry', name: 'The Springhead Trail', description: 'The road picks up again below the spring, following the new stream down into the deeper dark. The way back to the water climbs behind you.', encounterId: '', connections: ['usp6_2'], position: [1090, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'usp_5' },
    { id: 'usp6_2', name: 'The Fluted Narrows', description: 'The passage tightens to a fluted slot, its walls carved into ribs by ages of running water.', encounterId: '', connections: ['usp6_entry', 'usp6_3'], position: [810, 110], ...D },
    { id: 'usp6_3', name: 'The Glowpool Cavern', description: 'A cavern of still pools, each ringed with a faint blue-white glow from the things that live in them.', encounterId: '', connections: ['usp6_2', 'usp6_4'], position: [550, 270], ...D },
    { id: 'usp6_4', name: 'The Drowned Steps', description: 'A flight of steps runs down under the water and does not come back up.', encounterId: '', connections: ['usp6_3', 'usp6_5'], position: [320, 500], ...D },
    // The Underfalls teleports on down to the next stretch of the South Path.
    { id: 'usp6_5', name: 'The Underfalls', description: 'The stream pours over a lip of black stone into a roaring dark below — and a slick path picks its way down beside the falls.', encounterId: '', connections: ['usp6_4'], position: [70, 770], ...D, passthroughTo: 'usp7_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp6_entry';
  return map;
}

// Underdark South Path 07 — the seventh Underdark map, reached down beside The
// Underfalls (usp6_5). 9 nodes: a 2-node entry, then a diamond loop where the
// road forks in two (the High and Low roads, 2 nodes each) and rejoins at The
// Confluence, then runs on 2 more to The Deep Gate. usp7_entry is the threshold:
// it teleports back to usp6_5. No random encounters here yet.
export function createUnderdarkSouthPath07Map() {
  const map = new GameMap('underdark_south_path_7', 'The Underdark');
  const AREA = 'underdark_south_path_7';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath07.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Entry — threshold teleports back up to The Underfalls (usp6_5).
    { id: 'usp7_entry', name: 'The Falls Base', description: 'The path lets you down at last onto flat stone at the foot of the falls, spray hanging cold in the torchlight. The climb back up runs behind you.', encounterId: '', connections: ['usp7_2'], position: [370, 150], mapArea: AREA, canRevisit: true, passthroughTo: 'usp6_5' },
    // Fork.
    { id: 'usp7_2', name: 'The Forked Way', description: 'The cavern divides around a spur of black rock — a high road and a low road, both running on into the dark.', encounterId: '', connections: ['usp7_entry', 'usp7_l1', 'usp7_r1'], position: [480, 240], ...D },
    // High road (upper branch).
    { id: 'usp7_l1', name: 'The High Road', description: 'The high road hugs a dry ledge above the water, the going quick but the drop close on one side.', encounterId: '', connections: ['usp7_2', 'usp7_l2'], position: [710, 210], ...D },
    { id: 'usp7_l2', name: 'The Dry Gallery', description: 'A long dry gallery, dust thick on the floor where no water has run in an age.', encounterId: '', connections: ['usp7_l1', 'usp7_c'], position: [890, 340], ...D },
    // Low road (lower branch).
    { id: 'usp7_r1', name: 'The Low Road', description: 'The low road wades the streambed itself, water to the ankle and the current pulling gently onward.', encounterId: '', connections: ['usp7_2', 'usp7_r2'], position: [380, 450], ...D },
    { id: 'usp7_r2', name: 'The Wet Gallery', description: 'A flooded gallery, the water rising to the knee, cold and black and slow.', encounterId: '', connections: ['usp7_r1', 'usp7_c'], position: [510, 600], ...D },
    // Rejoin, then the tail on to the gate.
    { id: 'usp7_c', name: 'The Confluence', description: 'High road and low road spill back together where the water gathers again, the cavern opening out ahead.', encounterId: '', connections: ['usp7_l2', 'usp7_r2', 'usp7_d'], position: [810, 570], ...D },
    { id: 'usp7_d', name: 'The Long Landing', description: 'A broad landing of worked stone, the first sign in a long while that the road was built for something to walk it.', encounterId: '', connections: ['usp7_c', 'usp7_e'], position: [970, 690], ...D },
    // The Deep Gate opens on down to the next stretch of the South Path.
    { id: 'usp7_e', name: 'The Deep Gate', description: 'The road ends at a gate — dwarf-work, or older, but it stands open a crack, and the way on runs through it.', encounterId: '', connections: ['usp7_d'], position: [1130, 830], ...D, passthroughTo: 'usp8_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp7_entry';
  return map;
}

// Underdark South Path 08 — the eighth Underdark map, reached through The Deep
// Gate (usp7_e). 4 nodes in a line, on beyond the gate. usp8_entry is the
// threshold: it teleports back to usp7_e. No random encounters here yet.
export function createUnderdarkSouthPath08Map() {
  const map = new GameMap('underdark_south_path_8', 'The Underdark');
  const AREA = 'underdark_south_path_8';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath08.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back up to The Deep Gate (usp7_e). Always visible.
    { id: 'usp8_entry', name: 'Beyond the Gate', description: 'The gate groans shut behind you, and the road runs on into air that has not been breathed in a very long time. The way back climbs behind you.', encounterId: '', connections: ['usp8_2'], position: [90, 90], mapArea: AREA, canRevisit: true, passthroughTo: 'usp7_e' },
    { id: 'usp8_2', name: 'The Warded Hall', description: 'A long hall lined with dwarf-runes that still hold a faint, watchful charge, prickling at the skin as you pass.', encounterId: '', connections: ['usp8_entry', 'usp8_3'], position: [400, 310], ...D },
    { id: 'usp8_3', name: 'The Sentinel Well', description: 'A dry well at the hall\'s heart, ringed by broken statues that once stood guard over it.', encounterId: '', connections: ['usp8_2', 'usp8_4'], position: [720, 590], ...D },
    // The Inner Door opens on to the next stretch of the South Path.
    { id: 'usp8_4', name: 'The Inner Door', description: 'The hall ends at a second door, smaller and stranger than the last — you work the bar loose and it swings open on the dark beyond.', encounterId: '', connections: ['usp8_3'], position: [380, 860], ...D, passthroughTo: 'usp9_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp8_entry';
  return map;
}

// Underdark South Path 09 — the ninth Underdark map, reached through The Inner
// Door (usp8_4). 3 nodes in a line; the middle node fires Raena's dialog (they've
// been following an underground river and should be near the lake now).
// usp9_entry is the threshold: it teleports back to usp8_4. No random encounters.
export function createUnderdarkSouthPath09Map() {
  const map = new GameMap('underdark_south_path_9', 'The Underdark');
  const AREA = 'underdark_south_path_9';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath09.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back up to The Inner Door (usp8_4). Always visible.
    { id: 'usp9_entry', name: 'The River Path', description: 'Beyond the inner door the road meets running water again — a real river now, broad and black, sliding through the dark. The way back climbs behind you.', encounterId: '', connections: ['usp9_2'], position: [1000, 230], mapArea: AREA, canRevisit: true, passthroughTo: 'usp8_4' },
    // Middle node — Raena's "following the river, near the lake" beat.
    { id: 'usp9_2', name: 'The Underground River', description: 'The river runs on beside the road, wide and slow and cold.', encounterId: 'underdark_south_river', connections: ['usp9_entry', 'usp9_3'], position: [650, 540], ...D, canRevisit: false },
    // The Widening Dark opens on to the next stretch of the South Path.
    { id: 'usp9_3', name: 'The Widening Dark', description: 'The cavern opens out ahead, the far walls falling away — and the river\'s voice broadens, as if it is spilling into something vast.', encounterId: '', connections: ['usp9_2'], position: [250, 860], ...D, passthroughTo: 'usp10_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp9_entry';
  return map;
}

// Underdark South Path 10 — the tenth Underdark map, reached on from The Widening
// Dark (usp9_3). 7 nodes in a line, the river running out toward the lakeshore.
// usp10_entry is the threshold: it teleports back to usp9_3. No random encounters.
export function createUnderdarkSouthPath10Map() {
  const map = new GameMap('underdark_south_path_10', 'The Underdark');
  const AREA = 'underdark_south_path_10';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath10.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the Underdark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back up to The Widening Dark (usp9_3). Always visible.
    { id: 'usp10_entry', name: 'The River Mouth', description: 'The tunnel gives out onto a wide shelf of stone where the river slows and spreads — the cavern beyond is huge, and full of the sound of water. The way back climbs behind you.', encounterId: '', connections: ['usp10_2'], position: [1050, 230], mapArea: AREA, canRevisit: true, passthroughTo: 'usp9_3' },
    { id: 'usp10_2', name: 'The Shallows', description: 'The path runs along a shingle beach, the black water lapping quiet at its edge.', encounterId: '', connections: ['usp10_entry', 'usp10_3'], position: [890, 330], ...D },
    { id: 'usp10_3', name: 'The Reed Forest', description: 'Pale, root-like growths crowd the shallows in a drowned thicket, swaying though there is no wind.', encounterId: '', connections: ['usp10_2', 'usp10_4'], position: [730, 440], ...D },
    { id: 'usp10_4', name: 'The Broken Jetty', description: 'A ruined jetty of black stone runs out into the water and stops short, its far end long collapsed.', encounterId: '', connections: ['usp10_3', 'usp10_5'], position: [520, 540], ...D },
    { id: 'usp10_5', name: 'The Ferry Stones', description: 'A line of great flat stones steps out across the water — a crossing, for anyone bold enough to use it.', encounterId: '', connections: ['usp10_4', 'usp10_6'], position: [320, 630], ...D },
    { id: 'usp10_6', name: 'The Far Shore', description: 'The path climbs onto a farther shore, and the ceiling lifts away into a dark that feels, for the first time, almost open.', encounterId: '', connections: ['usp10_5', 'usp10_7'], position: [250, 780], ...D },
    // The Lake's Edge opens on to the final stretch of the South Path.
    { id: 'usp10_7', name: 'The Lake\'s Edge', description: 'The cavern opens at last onto a vast underground lake, its surface black and still and endless — and somewhere far across it, a faint grey suggestion of light.', encounterId: '', connections: ['usp10_6'], position: [360, 880], ...D, passthroughTo: 'usp11_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp10_entry';
  return map;
}

// Underdark South Path 11 — the eleventh Underdark map, reached along the shore
// from The Lake's Edge (usp10_7). 6 nodes in a line, following the lakeshore
// toward the grey hint of daylight. usp11_entry is the threshold: it teleports
// back to usp10_7. No random encounters here yet.
export function createUnderdarkSouthPath11Map() {
  const map = new GameMap('underdark_south_path_11', 'The Underdark');
  const AREA = 'underdark_south_path_11';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath11.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Along the shore of the underground lake.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Lake's Edge (usp10_7). Always visible.
    { id: 'usp11_entry', name: 'The Shoreline Path', description: 'A path picks its way along the lakeshore, the great black water on one hand and the cavern wall on the other. The way back runs behind you.', encounterId: '', connections: ['usp11_2'], position: [950, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'usp10_7' },
    { id: 'usp11_2', name: 'The Pale Strand', description: 'A crescent of pale, gritty sand, littered with the clean-picked bones of things that came to drink and did not leave.', encounterId: '', connections: ['usp11_entry', 'usp11_3'], position: [1050, 200], ...D },
    { id: 'usp11_3', name: 'The Drowned Wood', description: 'Petrified trees stand in the shallows, drowned when the lake was young, grey and hard as stone.', encounterId: '', connections: ['usp11_2', 'usp11_4'], position: [1070, 370], ...D },
    { id: 'usp11_4', name: 'The Fisher\'s Camp', description: 'The cold remains of a camp — a fire-ring, a drying-rack, nets rotted to lace. Someone lived down here, once.', encounterId: '', connections: ['usp11_3', 'usp11_5'], position: [1060, 530], ...D },
    { id: 'usp11_5', name: 'The Cave Mouth', description: 'Ahead the cavern narrows to a mouth, and through it the grey light is stronger now — daylight, real daylight, off water.', encounterId: '', connections: ['usp11_4', 'usp11_6'], position: [1000, 720], ...D },
    // Threshold of Day — now a forward teleporter into South Path 12 (usp12_entry).
    { id: 'usp11_6', name: 'The Threshold of Day', description: 'The path climbs the last stretch toward the light and the open air beyond — the way out of the Underdark, at last.', encounterId: '', connections: ['usp11_5'], position: [860, 870], ...D, passthroughTo: 'usp12_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp11_entry';
  return map;
}

// The Underdark — South Path 12. Beyond The Threshold of Day (usp11_6). Two
// entry nodes (the stem) that fork into a Y: a short 3-node branch and a longer
// 5-node branch. Entry teleports back to the Threshold of Day.
export function createUnderdarkSouthPath12Map() {
  const map = new GameMap('underdark_south_path_12', 'The Underdark');
  const AREA = 'underdark_south_path_12';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath12.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper along the underground way.', mapArea: AREA };
  const nodes = [
    // Stem (2 entry nodes). The threshold teleports back to usp11_6. Always visible.
    { id: 'usp12_entry', name: 'Past the Threshold', description: 'You step through toward the pale light — and find not the open sky, but a vast lit cavern, daylight falling in a shaft from some sinkhole far overhead. The way back climbs behind you.', encounterId: '', connections: ['usp12_2'], position: [270, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'usp11_6' },
    { id: 'usp12_2', name: 'The Parting of Ways', description: 'The lit cavern floor splits the road in two — one way short and close, the other winding off long into the greater dark.', encounterId: '', connections: ['usp12_entry', 'usp12_a1', 'usp12_b1'], position: [460, 160], ...D },
    // Branch A — the short way (3 nodes).
    { id: 'usp12_a1', name: 'The Fern Hollow', description: 'Pale ferns crowd a hollow lit by the shaft above, thriving where the daylight reaches.', encounterId: '', connections: ['usp12_2', 'usp12_a2'], position: [350, 340], ...D },
    { id: 'usp12_a2', name: 'The Weeping Wall', description: 'Water threads down a sheer wall in a hundred bright rills, catching the light.', encounterId: '', connections: ['usp12_a1', 'usp12_a3'], position: [210, 510], ...D },
    { id: 'usp12_a3', name: 'The Quiet Pool', description: 'The short way ends at a still, clear pool fed by the weeping wall — untainted water, apart from the black lake.', encounterId: 'quiet_pool', connections: ['usp12_a2'], position: [370, 690], ...D },
    // Branch B — the long way (5 nodes). The Far Arch teleports on to South Path 13.
    { id: 'usp12_b1', name: 'The Root Bridge', description: 'A great root, thick as a tree, arches the way onward like a bridge over the dark.', encounterId: '', connections: ['usp12_2', 'usp12_b2'], position: [650, 280], ...D },
    { id: 'usp12_b2', name: 'The Glowing Shelf', description: 'A shelf of stone furred with soft blue glow-moss, cool light in the deepening dark.', encounterId: '', connections: ['usp12_b1', 'usp12_b3'], position: [840, 420], ...D },
    { id: 'usp12_b3', name: 'The Deep Landing', description: 'A wide worked landing where the daylight fails at last and the true dark begins again.', encounterId: '', connections: ['usp12_b2', 'usp12_b4'], position: [1050, 560], ...D },
    { id: 'usp12_b4', name: 'The Old Stair', description: 'Dwarf-cut steps climb away into the black, worn smooth by ages of feet.', encounterId: '', connections: ['usp12_b3', 'usp12_b5'], position: [900, 740], ...D },
    { id: 'usp12_b5', name: 'The Far Arch', description: 'A tall arch of old stone marks the end of the long way — and the dark road presses on through it, deeper still.', encounterId: '', connections: ['usp12_b4'], position: [760, 880], ...D, passthroughTo: 'usp13_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp12_entry';
  return map;
}

// The Underdark — South Path 13. Beyond The Far Arch (usp12_b5). 3 nodes in a
// line, ending at The Bottomless Lake. Entry teleports back to the Far Arch.
export function createUnderdarkSouthPath13Map() {
  const map = new GameMap('underdark_south_path_13', 'The Underdark');
  const AREA = 'underdark_south_path_13';
  map.mapImages = { [AREA]: 'Maps/UnderdarkSouthPath13.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper along the underground way.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Far Arch (usp12_b5). Always visible.
    { id: 'usp13_entry', name: 'Beyond the Arch', description: 'Through the old arch the road runs on into a colder, blacker dark, the last of the daylight lost behind you.', encounterId: '', connections: ['usp13_2'], position: [1130, 50], mapArea: AREA, canRevisit: true, passthroughTo: 'usp12_b5' },
    { id: 'usp13_2', name: 'The Black Shore', description: 'The passage opens onto a shore of wet black stone, and the sound of vast, still water breathing in the dark.', encounterId: '', connections: ['usp13_entry', 'usp13_3'], position: [1180, 300], ...D },
    // The Bottomless Lake — the Deep Kraken reveal + fight-or-flee dialog.
    { id: 'usp13_3', name: 'The Bottomless Lake', description: 'A lake without a far shore fills the cavern, black and depthless, fed by a waterfall out of the dark far above.', encounterId: 'bottomless_lake', connections: ['usp13_2'], position: [1060, 460], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'usp13_entry';
  return map;
}

// Underdark East Path 14 — the eastern road off the South Crossroad, reached on
// east from The Sunken Market (usx_e2). 4 nodes in a line through the fungal deep
// (the mushroom-light Valdrisa clocked and Brad tied to the Svirfneblin). uep14_entry
// is the threshold: it teleports back to usx_e2. The last node (uep14_4) teleports
// on to East Path 15. No random encounters here yet.
export function createUnderdarkEastPath14Map() {
  const map = new GameMap('underdark_east_path_14', 'The Underdark');
  const AREA = 'underdark_east_path_14';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath14.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the eastern dark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Sunken Market (usx_e2). Always visible.
    { id: 'uep14_entry', name: 'The Glowcap Road', description: 'The road picks up past the drowned market, the pale fungal light thickening with every step east. The way back to the crossroad lies behind you.', encounterId: '', connections: ['uep14_2'], position: [90, 90], mapArea: AREA, canRevisit: true, passthroughTo: 'usx_e2' },
    { id: 'uep14_2', name: 'The Spore Drifts', description: 'Slow clouds of luminous spores drift across the road, glowing a soft blue-green where your torch stirs them.', encounterId: '', connections: ['uep14_entry', 'uep14_3'], position: [380, 390], ...D },
    { id: 'uep14_3', name: 'The Luminous Grove', description: 'A forest of towering mushrooms crowds the cavern, their caps throwing a cold, steady glow across everything.', encounterId: '', connections: ['uep14_2', 'uep14_4'], position: [720, 540], ...D },
    // The last node teleports on to East Path 15.
    { id: 'uep14_4', name: 'The Myconid Hollow', description: 'The grove opens into a still hollow where the fungus grows in ordered rings — too ordered. Something tends this place. The road runs on east.', encounterId: '', connections: ['uep14_3'], position: [800, 870], ...D, passthroughTo: 'uep15_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep14_entry';
  return map;
}

// Underdark East Path 15 — the second eastern stretch, reached from The Myconid
// Hollow (uep14_4). 4 nodes through the outskirts of deep-gnome country. uep15_entry
// teleports back to uep14_4; the last node (uep15_4) teleports on to East Path 16.
export function createUnderdarkEastPath15Map() {
  const map = new GameMap('underdark_east_path_15', 'The Underdark');
  const AREA = 'underdark_east_path_15';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath15.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the eastern dark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Myconid Hollow (uep14_4). Always visible.
    { id: 'uep15_entry', name: "The Warren's Edge", description: 'Past the hollow the walls grow pocked with small, round doorways, cut low and neat. Someone lives out here. The way back to the grove lies behind you.', encounterId: '', connections: ['uep15_2'], position: [240, 50], mapArea: AREA, canRevisit: true, passthroughTo: 'uep14_4' },
    { id: 'uep15_2', name: 'The Whistling Dark', description: 'A thin, wandering whistle threads the tunnels ahead — a signal, passed hand to hand through the black by watchers you never see.', encounterId: '', connections: ['uep15_entry', 'uep15_3'], position: [320, 330], ...D },
    { id: 'uep15_3', name: 'The Rope Bridges', description: 'Slender rope-and-stone bridges span a lattice of chasms, strung by hands far smaller than yours.', encounterId: '', connections: ['uep15_2', 'uep15_4'], position: [540, 500], ...D },
    // The last node teleports on to East Path 16.
    { id: 'uep15_4', name: 'The Svirfneblin Gate', description: 'A low gate of fitted stone bars the road, carved with the wary sigils of the deep gnomes. It stands open a crack — an invitation, or a warning. The road runs on beyond it.', encounterId: '', connections: ['uep15_3'], position: [860, 860], ...D, passthroughTo: 'uep16_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep15_entry';
  return map;
}

// Underdark East Path 16 — the third eastern stretch, reached from The Svirfneblin
// Gate (uep15_4). 4 nodes into deep-gnome country proper. uep16_entry teleports back
// to uep15_4. The final node (uep16_4) is a dead end for now — the road stops here
// until the eastern content continues.
export function createUnderdarkEastPath16Map() {
  const map = new GameMap('underdark_east_path_16', 'The Underdark');
  const AREA = 'underdark_east_path_16';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath16.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the eastern dark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Svirfneblin Gate (uep15_4). Always visible.
    // Fires the one-shot "caverns have shifted" dialog on first arrival. canRevisit:false
    // (like usx_entry) so the beat plays once; the passthroughTo teleporter still works
    // (handled by the arriveAtNode/isCrossMapGate pair, not canRevisit).
    { id: 'uep16_entry', name: 'Beyond the Gate', description: 'Through the deep-gnome gate the tunnels turn tidy and worked, the stone smoothed by small careful hands. The gate lies behind you.', encounterId: 'underdark_east_gate', connections: ['uep16_2'], position: [210, 60], mapArea: AREA, canRevisit: false, passthroughTo: 'uep15_4' },
    { id: 'uep16_2', name: 'The Stone Gardens', description: 'Beds of pale, cultivated fungus grow in neat stone plots, tended and trimmed — a farm, of a kind, in the lightless deep.', encounterId: '', connections: ['uep16_entry', 'uep16_3'], position: [460, 390], ...D },
    { id: 'uep16_3', name: 'The Lantern Path', description: 'Tiny glowstone lanterns line the road at knee height, lit and cared for, leading on into the dark.', encounterId: '', connections: ['uep16_2', 'uep16_4'], position: [790, 590], ...D },
    { id: 'uep16_4', name: 'The Deep Gnome Outpost', description: 'The lanterns lead to a huddle of low stone dwellings dug into the cavern wall — a Svirfneblin outpost, watchful and still. A tended path runs on past it, deeper east.', encounterId: '', connections: ['uep16_3'], position: [1120, 840], ...D, passthroughTo: 'uep17_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep16_entry';
  return map;
}

// Underdark East Path 17 — the fourth eastern stretch, reached past The Deep Gnome
// Outpost (uep16_4). 5 nodes in a line, the tended road running on through the
// deep-gnome reach. uep17_entry teleports back to uep16_4; the last node (uep17_5)
// teleports on to East Path 18.
export function createUnderdarkEastPath17Map() {
  const map = new GameMap('underdark_east_path_17', 'The Underdark');
  const AREA = 'underdark_east_path_17';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath17.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the eastern dark.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Deep Gnome Outpost (uep16_4). Always visible.
    { id: 'uep17_entry', name: 'The Tended Road', description: 'Past the outpost the road stays worked and clean, glowstone lanterns marking the way on into deep-gnome country. The outpost lies behind you.', encounterId: '', connections: ['uep17_2'], position: [900, 180], mapArea: AREA, canRevisit: true, passthroughTo: 'uep16_4' },
    { id: 'uep17_2', name: 'The Glimmer Terraces', description: 'The road climbs past terraced beds of luminous fungus, each step tended and trimmed with small, patient care.', encounterId: '', connections: ['uep17_entry', 'uep17_3'], position: [700, 420], ...D },
    { id: 'uep17_3', name: 'The Quiet Bells', description: 'Tiny stone chimes hang from the cavern roof, turning slow and soundless in the still, dead air.', encounterId: '', connections: ['uep17_2', 'uep17_4'], position: [400, 580], ...D },
    { id: 'uep17_4', name: 'The Warden Stones', description: 'Squat carved sentinels line the road, deep-gnome wards watching the way with blind stone eyes.', encounterId: '', connections: ['uep17_3', 'uep17_5'], position: [700, 750], ...D },
    // The last node teleports on to East Path 18.
    { id: 'uep17_5', name: 'The Deepening Reach', description: 'The lanterns thin and the cavern widens ahead, the tended road giving way to something older and less kept. The way runs on east.', encounterId: '', connections: ['uep17_4'], position: [1110, 820], ...D, passthroughTo: 'uep18_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep17_entry';
  return map;
}

// Underdark East Path 18 — the fifth eastern stretch, reached from The Deepening
// Reach (uep17_5). Branching layout: a 3-node entry line (uep18_entry → _2 → _3),
// then _3 forks into two paths — a 2-node spur (uep18_p1a → uep18_p1b, the Sealed
// Vault, which teleports on to East Path 19) and a single node (uep18_c1) that
// opens onto a 5-node loop (c1 → c2 → c3 → c4 → c5 → back to c1). uep18_entry
// teleports back to uep17_5.
export function createUnderdarkEastPath18Map() {
  const map = new GameMap('underdark_east_path_18', 'The Underdark');
  const AREA = 'underdark_east_path_18';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath18.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the eastern dark.', mapArea: AREA };
  const nodes = [
    // Entry line (3 nodes). Threshold teleports back to The Deepening Reach (uep17_5).
    { id: 'uep18_entry', name: 'The Old Deep', description: 'Beyond the tended reach the caverns turn wild and old again, the deep-gnome road petering out into raw, worked-once stone. The way back lies behind you.', encounterId: '', connections: ['uep18_2'], position: [570, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'uep17_5' },
    { id: 'uep18_2', name: 'The Sunken Colonnade', description: 'A row of broken pillars marches off into the dark, half-drowned in still black water.', encounterId: '', connections: ['uep18_entry', 'uep18_3'], position: [330, 260], ...D },
    // The fork — splits into the dead-end spur and the loop.
    { id: 'uep18_3', name: 'The Parting of Ways', description: 'The passage divides around a great fallen slab: one way climbs, the other drops toward a ring of deeper dark.', encounterId: '', connections: ['uep18_2', 'uep18_p1a', 'uep18_c1'], position: [270, 590], ...D },
    // Path 1 — 2-node dead-end spur.
    { id: 'uep18_p1a', name: 'The High Gallery', description: 'The climbing way opens onto a dry gallery, dust thick and undisturbed underfoot.', encounterId: '', connections: ['uep18_3', 'uep18_p1b'], position: [170, 740], ...D },
    // The Sealed Vault teleports on to East Path 19 (behind the vault door).
    { id: 'uep18_p1b', name: 'The Sealed Vault', description: 'The gallery ends at a vault door, barred from the far side and long since gone silent. It stands ajar now, a hand\'s width of deeper black beyond it.', encounterId: '', connections: ['uep18_p1a'], position: [60, 870], ...D, passthroughTo: 'uep19_entry' },
    // Path 2 — single node that opens onto the loop (c1 is the loop start).
    { id: 'uep18_c1', name: 'The Ringway', description: 'The lower way opens into a great round cavern, a ring-road running away into the dark on both hands.', encounterId: '', connections: ['uep18_3', 'uep18_c2', 'uep18_c5'], position: [480, 580], ...D },
    // The four beds on the ring — someone farms this loop. Each carries the
    // `mushroom_farm` harvest encounter (50% for one pick, once per rest; see
    // the startNodeEncounter special-case). The Spore Garden also holds the
    // one and only Rare Mushroom, guaranteed on its first harvest.
    { id: 'uep18_c2', name: 'The Watered Beds', description: 'Water beads down a black stone arch and runs off along cut channels, feeding row after row of pale caps below.', encounterId: 'mushroom_farm', connections: ['uep18_c1', 'uep18_c3'], position: [650, 410], ...D },
    { id: 'uep18_c3', name: 'The Spore Garden', description: 'A basin at the ring\'s far edge brims with glowing water, and the beds around it are the best-kept in the whole loop — thinned, weeded, and heavy with growth.', encounterId: 'mushroom_farm', connections: ['uep18_c2', 'uep18_c4'], position: [880, 390], ...D },
    { id: 'uep18_c4', name: 'The Compost Midden', description: 'A drift of old bones and cave litter has been raked into a long heap against the ring wall, and mushrooms grow out of it in fat, deliberate rows.', encounterId: 'mushroom_farm', connections: ['uep18_c3', 'uep18_c5'], position: [830, 630], ...D },
    { id: 'uep18_c5', name: 'The Cap Rows', description: 'The ring curves back on itself past rank upon rank of planted caps, each row spaced a small arm\'s length from the next.', encounterId: 'mushroom_farm', connections: ['uep18_c4', 'uep18_c1'], position: [630, 680], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep18_entry';
  return map;
}

// Underdark East Path 19 — behind The Sealed Vault (uep18_p1b). 9 nodes, all
// branches, no loop. uep19_entry is the doorway itself (teleports back to
// uep18_p1b) and links only to uep19_2, which forks into two ways. The left way
// is a 2-node dead-end spur (uep19_a1 → uep19_a2). The right way runs two nodes
// (uep19_b1 → uep19_b2), then uep19_b2 forks again — the Suspicious Entrance
// (uep19_c1, which teleports on to Gnome Village 20) and a 3-node descent
// (uep19_d1 → uep19_d2 → uep19_d3).
export function createUnderdarkEastPath19Map() {
  const map = new GameMap('underdark_east_path_19', 'The Underdark');
  const AREA = 'underdark_east_path_19';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath19.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the vault.', mapArea: AREA };
  const nodes = [
    // Threshold — the doorway itself. Teleports back to The Sealed Vault
    // (uep18_p1b) and links on to Beyond the Vault Door. Always visible.
    { id: 'uep19_entry', name: 'The Vault Door', description: 'The great door stands open on its ruined bar, the gallery at your back and the vault breathing its dry, dead air out past you.', encounterId: '', connections: ['uep19_2'], position: [820, 50], mapArea: AREA, canRevisit: true, passthroughTo: 'uep18_p1b' },
    // The fork — splits into the left spur and the right way.
    { id: 'uep19_2', name: 'Beyond the Vault Door', description: 'Past the door the air is dry and dead as a tomb, and the hall beyond splits two ways around a fallen strongbox.', encounterId: '', connections: ['uep19_entry', 'uep19_a1', 'uep19_b1'], position: [780, 170], ...D },
    // Left way — 2-node dead-end spur.
    { id: 'uep19_a1', name: 'The Toppled Shelves', description: 'Rows of stone shelving lie thrown down across the floor, their contents long since carried off or crumbled to dust.', encounterId: '', connections: ['uep19_2', 'uep19_a2'], position: [840, 480], ...D },
    { id: 'uep19_a2', name: 'The Dry Cistern', description: 'A great basin sits empty in the floor, its channels cracked and its stone bleached pale by centuries without water.', encounterId: '', connections: ['uep19_a1'], position: [1160, 780], ...D },
    // Right way — 2 nodes, then a second fork at uep19_b2.
    { id: 'uep19_b1', name: 'The Coin Drift', description: 'Old coin lies scattered along the hall like gravel, blackened past reading and not worth the stooping.', encounterId: '', connections: ['uep19_2', 'uep19_b2'], position: [550, 280], ...D },
    { id: 'uep19_b2', name: "The Warden's Antechamber", description: 'A cramped guardroom where the hall divides — one door barred, one stair falling away into the dark.', encounterId: '', connections: ['uep19_b1', 'uep19_c1', 'uep19_d1'], position: [250, 480], ...D },
    // Fork 1 — the way on to the deep gnome village (Gnome Village 20).
    { id: 'uep19_c1', name: 'Suspicious Entrance', description: 'Behind the barred door the stone turns worked and tidy — a low round doorway cut for smaller folk, swept clean and lately used.', encounterId: '', connections: ['uep19_b2'], position: [140, 350], ...D, passthroughTo: 'ugv20_entry' },
    // Fork 2 — 3-node descent.
    { id: 'uep19_d1', name: 'The Long Stair', description: 'The stair drops in a straight, narrow flight, each step worn hollow by feet that stopped coming a long age ago.', encounterId: '', connections: ['uep19_b2', 'uep19_d2'], position: [170, 680], ...D },
    { id: 'uep19_d2', name: 'The Under-Vault', description: 'The stair bottoms out in a low chamber under the vault proper, its ceiling held up by squat, over-thick pillars.', encounterId: '', connections: ['uep19_d1', 'uep19_d3'], position: [500, 810], ...D },
    // The Black Coffer teleports on to East Path 23.
    { id: 'uep19_d3', name: 'The Black Coffer', description: 'A single coffer of black stone stands at the chamber\'s end, lidless and empty, and far too heavy to have been carried here. Behind it the wall is broken through, and a corridor runs on east.', encounterId: '', connections: ['uep19_d2'], position: [660, 450], ...D, passthroughTo: 'uep23_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep19_entry';
  return map;
}

// Underdark Gnome Village 20 — behind the Suspicious Entrance (uep19_c1), the
// deep gnome village proper. 16 nodes. A 5-node approach (ugv20_entry → _1b →
// _2 → _3 → _4) forks at _4 into the bridge road (ugv20_b2 → b3) and a 4-node
// cellar spur (ugv20_s0 → s1 → s1b → s2). The bridge road forks again at b3 into
// two 3-node branches — the market side (ugv20_m1 → m2 → m3) and the warren side
// (ugv20_t1 → t2 → t3). ugv20_entry teleports back to uep19_c1; the Quiet Hearth
// (ugv20_s2) teleports on to Gnome Village 21, and the Deep Well (ugv20_m3) on
// to Gnome Village 22.
//
// The village is INHABITED — the Svirfneblin are home, just hiding from the
// party at first (shutters closing, faces ducking back). Keep that read in any
// new node text here. All three village maps are in NO_FOG_MAPS (no black
// overlay — you can see the town art whole) but their nodes are still
// `discoverable`, so the nodes themselves reveal one hop at a time like the
// rest of the Underdark.
export function createUnderdarkGnomeVillage20Map() {
  const map = new GameMap('underdark_gnome_village_20', 'The Underdark');
  const AREA = 'underdark_gnome_village_20';
  map.mapImages = { [AREA]: 'Maps/UnderdarkGnomeVillage20.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the deep gnome village.', mapArea: AREA };
  const nodes = [
    // Approach — 5 nodes. Threshold teleports back to the Suspicious Entrance
    // (uep19_c1).
    // canRevisit:false so the "we actually found it" beat plays once; the
    // passthroughTo teleporter still works (same shape as uep16_entry).
    { id: 'ugv20_entry', name: 'The Low Door', description: 'You stoop through the little round door into a passage cut for folk half your height. Somewhere ahead a shutter claps shut, and the lamplight beyond it goes out.', encounterId: 'gnome_village_found', connections: ['ugv20_1b'], position: [630, 70], mapArea: AREA, canRevisit: false, passthroughTo: 'uep19_c1' },
    { id: 'ugv20_1b', name: 'The Lamplit Bend', description: 'The passage bends past a row of glowstone lamps, each one freshly oiled. Small footprints cross the swept floor, all of them heading away from you.', encounterId: '', connections: ['ugv20_entry', 'ugv20_2'], position: [565, 220], ...D },
    { id: 'ugv20_2', name: 'The Watching Niche', description: 'A carved alcove sits at shoulder height, a stool inside it still warm. Whoever was watching the road ducked out of it a heartbeat before your light arrived.', encounterId: '', connections: ['ugv20_1b', 'ugv20_3'], position: [610, 350], ...D },
    { id: 'ugv20_3', name: 'The Glowstone Stair', description: 'Shallow steps drop away between rails of set glowstone, worn smooth by small, steady traffic. Below, a whispered argument cuts off the moment your boot lands.', encounterId: '', connections: ['ugv20_2', 'ugv20_4'], position: [480, 440], ...D },
    // The first fork — bridge road or the cellar spur.
    // Cornis meets the party here — one-shot (canRevisit:false), then it's a
    // plain junction again.
    { id: 'ugv20_4', name: 'The Village Overlook', description: 'The stair ends on a shelf of rock, and below it the chasm is full of lanterns — a whole town of them, strung across the dark on bridges. One by one, as they catch sight of you, the shutters swing closed.', encounterId: 'cornis_welcome', connections: ['ugv20_3', 'ugv20_b2', 'ugv20_s0'], position: [550, 530], ...D, canRevisit: false },
    // Bridge road — 2 nodes, forks again at b3.
    { id: 'ugv20_b2', name: 'The Lantern Bridge', description: 'Glowstone lamps hang the length of the span, throwing soft green light down into a chasm with no bottom you can see. Small faces watch from the far rail, and not one of them comes closer.', encounterId: '', connections: ['ugv20_4', 'ugv20_b3'], position: [680, 500], ...D },
    { id: 'ugv20_b3', name: 'The Bridgehead', description: 'The spans meet on a broad landing where the village proper begins. A knot of deep gnomes backs away as you step off the bridge — hands full of tools, not weapons, and eyes never leaving you.', encounterId: '', connections: ['ugv20_b2', 'ugv20_m1', 'ugv20_t1'], position: [780, 450], ...D },
    // Cellar spur — 3 nodes; the Quiet Hearth teleports on to Village 21.
    { id: 'ugv20_s0', name: 'The Cellar Way', description: 'A side passage drops away from the shelf, cool air coming up it, and a lamp swinging where someone hurried down ahead of you.', encounterId: '', connections: ['ugv20_4', 'ugv20_s1'], position: [600, 680], ...D },
    { id: 'ugv20_s1', name: 'The Mushroom Cellars', description: 'Racks of pale fungus stand stacked to the ceiling in the damp. Between them, a grower crouches very still with her arms around two children, hoping the dark is enough.', encounterId: '', connections: ['ugv20_s0', 'ugv20_s1b'], position: [500, 780], ...D },
    { id: 'ugv20_s1b', name: 'The Drying Racks', description: 'Cut caps hang in rows to dry, still swinging where someone pushed through them at a run a moment before you.', encounterId: '', connections: ['ugv20_s1', 'ugv20_s2'], position: [350, 780], ...D },
    { id: 'ugv20_s2', name: 'The Quiet Hearth', description: 'The cellars open on a little hearth room, a pot steaming over a fire nobody is tending. An inner door stands shut, and past it the lanes of the village run on.', encounterId: '', connections: ['ugv20_s1b'], position: [260, 860], ...D, passthroughTo: 'ugv21_entry' },
    // Market side — 3 nodes.
    { id: 'ugv20_m1', name: 'The Stone Market', description: 'Low stalls line a covered street, their goods still laid out — and every seller crouched down behind the counter, listening to you pass.', encounterId: '', connections: ['ugv20_b3', 'ugv20_m2'], position: [960, 510], ...D },
    { id: 'ugv20_m2', name: "The Gemcutter's Row", description: 'Workbenches run the length of the street, half-cut stones still clamped and glittering. The cutters watch from their doorways, hammers down, saying nothing at all.', encounterId: '', connections: ['ugv20_m1', 'ugv20_m3'], position: [1100, 410], ...D },
    // The Deep Well teleports on to Gnome Village 22 (the way down to the shrine).
    { id: 'ugv20_m3', name: 'The Deep Well', description: 'The street ends at a round stone well. Two gnomes freeze at the rope as you come up, then let the bucket drop and back away without a word. A stair goes down beside the shaft, into worked dark.', encounterId: '', connections: ['ugv20_m2'], position: [1190, 260], ...D, passthroughTo: 'ugv22_entry' },
    // Warren side — 3 nodes.
    { id: 'ugv20_t1', name: 'The Warren Stairs', description: 'Round doorways climb the chasm wall in tiers, linked by stairs no wider than your shoulders. Doors shut in ones and twos the whole way up as you climb.', encounterId: '', connections: ['ugv20_b3', 'ugv20_t2'], position: [730, 330], ...D },
    { id: 'ugv20_t2', name: 'The Mushroom Stairs', description: 'The stair narrows and the fungus takes over — caps crowding every tread, pale growth furring the walls to either side. Nobody has cut it back. The old keeper stands aside at the turn, hands folded, and watches you climb past.', encounterId: '', connections: ['ugv20_t1', 'ugv20_t3'], position: [830, 240], ...D },
    { id: 'ugv20_t3', name: 'Altar of Psilofyr', description: 'At the top of the tiers a squat stone figure sits in a scooped-out alcove, and the fungus has taken it — pale caps crowding its shoulders, a soft ruff of grey growth up one arm, the face lost under it. Nobody has cleaned it. Cleaning it is the one thing you must never do.', encounterId: 'psilofyr_altar', connections: ['ugv20_t2'], position: [940, 140], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'ugv20_entry';
  return map;
}

// Underdark Gnome Village 21 — through the Quiet Hearth (ugv20_s2), the lanes of
// the village proper. 14 nodes: a 2-node approach (ugv21_entry → _2), then _2
// forks four ways, each branch 3 nodes — the west row (ugv21_a1 → a2 → a3,
// houses), the fountain way (ugv21_b1 → b2 → b3), the upper terrace (ugv21_c1 →
// c2 → c3, houses) and the far row (ugv21_d1 → d2 → d3, houses). ugv21_entry
// teleports back to ugv20_s2. No onward link. Same inhabited-but-hiding read as
// Village 20, and the same no-fog + still-discoverable treatment.
export function createUnderdarkGnomeVillage21Map() {
  const map = new GameMap('underdark_gnome_village_21', 'The Underdark');
  const AREA = 'underdark_gnome_village_21';
  map.mapImages = { [AREA]: 'Maps/UnderdarkGnomeVillage21.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Another lane of the deep gnome village.', mapArea: AREA };
  const nodes = [
    // Approach — 2 nodes. Threshold teleports back to The Quiet Hearth (ugv20_s2).
    { id: 'ugv21_entry', name: 'The Hearth Passage', description: 'Past the hearth room the passage runs out under a low arch into open lanes, warm with lamplight and far too quiet for the number of doors on it.', encounterId: '', connections: ['ugv21_2'], position: [550, 90], mapArea: AREA, canRevisit: true, passthroughTo: 'ugv20_s2' },
    // The hub — four ways part here.
    { id: 'ugv21_2', name: 'The Lantern Square', description: 'The lanes open on a little square hung with lamps, four ways leading off it. A ball rolls to a stop against your boot; the child who kicked it is already gone.', encounterId: '', connections: ['ugv21_entry', 'ugv21_a1', 'ugv21_b1', 'ugv21_c1', 'ugv21_d1'], position: [610, 290], ...D },
    // West row — houses.
    { id: 'ugv21_a1', name: 'The Low Row', description: 'A run of round doors set close together, each one shut, each one with a light moving behind its shutter.', encounterId: '', connections: ['ugv21_2', 'ugv21_a2'], position: [500, 290], ...D },
    { id: 'ugv21_a2', name: "The Weavers' Burrows", description: 'Looms stand half-strung in the doorways, spools still rocking where they were set down in a hurry.', encounterId: '', connections: ['ugv21_a1', 'ugv21_a3', 'ugv21_cornis_house'], position: [410, 320], ...D },
    // Cornis points out the two doors here — one-shot beat, then a plain node.
    { id: 'ugv21_a3', name: 'The Old Burrows', description: 'The oldest doors in the village, sills worn to a dip. An ancient gnome sits out on his step and does not move, watching you come and watching you go.', encounterId: 'cornis_two_doors', connections: ['ugv21_a2', 'ugv21_our_house'], position: [280, 360], ...D, canRevisit: false },
    // The two doors themselves — each teleports into its own little map.
    { id: 'ugv21_cornis_house', name: "Cornis's House", description: 'A round door with a mithril hand-plate screwed to it at gnome height, polished bright where he pushes it open.', encounterId: '', connections: ['ugv21_a2'], position: [400, 240], ...D, passthroughTo: 'ch41_entry' },
    { id: 'ugv21_our_house', name: 'Our Borrowed House', description: 'The door across the lane stands open on a dark little room nobody has lived in for a while. It is yours for the night, apparently.', encounterId: '', connections: ['ugv21_a3'], position: [270, 280], ...D, passthroughTo: 'bh42_entry' },
    // Fountain way.
    { id: 'ugv21_b1', name: 'The Water Steps', description: 'Wet stone steps climb between the houses, worn into channels by generations of carried buckets.', encounterId: '', connections: ['ugv21_2', 'ugv21_b2'], position: [570, 450], ...D },
    { id: 'ugv21_b2', name: 'The Cistern Channel', description: 'A cut stone channel runs the length of the lane, clear water going by fast and cold, and washing left out along its edge.', encounterId: '', connections: ['ugv21_b1', 'ugv21_b3'], position: [470, 640], ...D },
    { id: 'ugv21_b3', name: 'The Glowstone Fountain', description: 'The channel feeds a broad basin lit from beneath by sunk glowstone — the heart of the village, and the one place its people have not entirely abandoned to you.', encounterId: 'glowstone_fountain', connections: ['ugv21_b2'], position: [450, 810], ...D },
    // Upper terrace — houses.
    { id: 'ugv21_c1', name: 'The Upper Terrace', description: 'A shelf of houses stands above the square, their doorsteps swept and their shutters barred one after another as you climb.', encounterId: '', connections: ['ugv21_2', 'ugv21_c2'], position: [760, 260], ...D },
    { id: 'ugv21_c2', name: "The Toolmakers' Doors", description: 'Picks and chisels hang in racks beside every door, and behind one shutter someone is very quietly telling a child to be still.', encounterId: '', connections: ['ugv21_c1', 'ugv21_c3', 'ugv21_c4'], position: [1000, 260], ...D },
    // The town's toolshop. Same shape as The Spore & Sprig: canRevisit, with
    // the dialog shortening to a one-beat greeting after the first visit.
    { id: 'ugv21_c4', name: 'The Deep Tinker', description: 'The widest door on the terrace, propped open on a workshop that smells of hot metal and lamp oil. Something inside is ticking.', encounterId: 'deep_tinker', connections: ['ugv21_c2'], position: [1050, 190], ...D },
    { id: 'ugv21_c3', name: 'The Nursery Burrows', description: 'The smallest doors in the village, cut for the smallest folk. Every one of them is shut, and behind them you can hear breathing.', encounterId: '', connections: ['ugv21_c2'], position: [1130, 340], ...D },
    // Far row — houses.
    { id: 'ugv21_d1', name: 'The Far Row', description: 'The lane runs out east past a line of newer burrows, their stone still pale where it was cut.', encounterId: '', connections: ['ugv21_2', 'ugv21_d2'], position: [740, 580], ...D },
    { id: 'ugv21_d2', name: 'The Deep Doors', description: 'Here the houses are dug back hard into the rock, deep enough that a family could sit out a bad week without ever coming to the door.', encounterId: '', connections: ['ugv21_d1', 'ugv21_d3'], position: [940, 580], ...D },
    { id: 'ugv21_d3', name: 'Apothecary Square', description: 'The row opens into a little square strung with drying lines, every one of them hung with caps and stalks and split fungus going slowly leathery in the lamp-warm air.', encounterId: '', connections: ['ugv21_d2', 'ugv21_d4'], position: [1090, 620], ...D },
    // The village's one storefront. canRevisit so the shop can be walked
    // back into; the dialog itself shortens to a one-line greeting after
    // the first visit (see the startNodeEncounter dispatch in main.js).
    { id: 'ugv21_d4', name: 'The Spore & Sprig', description: 'A shopfront at the low end of the square, its shutters folded back on shelves of jars, bundles and boxed caps. Somebody in there is humming.', encounterId: 'spore_and_sprig', connections: ['ugv21_d3'], position: [1110, 530], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'ugv21_entry';
  return map;
}

// Cornis's House (Village 41) — through the door off The Weavers' Burrows
// (ugv21_cornis_house). 2 nodes: the room you step into and his workbench.
// ch41_entry teleports back to the village lane. In NO_FOG_MAPS with the rest
// of the village.
export function createCornisHouseMap() {
  const map = new GameMap('cornis_house_41', 'The Underdark');
  const AREA = 'cornis_house_41';
  map.mapImages = { [AREA]: 'Maps/CornisHouseGnomeVillage41.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further into the house.', mapArea: AREA };
  const nodes = [
    // The feast beat hangs off this node. It carries the encounterId even before
    // the party has slept, because startNodeEncounter is only reached when a
    // node HAS one — the gate for "not yet" lives in that handler.
    { id: 'ch41_entry', name: "Cornis's Front Room", description: 'You come through the round door on your hands and knees and stand up into a room built for someone four feet tall — warm, low, and smelling of hot metal and mushroom bread. The lane lies behind you.', encounterId: 'cornis_feast', connections: ['ch41_bench'], position: [430, 730], mapArea: AREA, canRevisit: true, passthroughTo: 'ugv21_cornis_house' },
    { id: 'ch41_bench', name: 'The Workbench', description: 'The back half of the room is all bench: vices, files, a small forge banked low, and a rack of spare mithril fingers, sized and numbered.', encounterId: 'cornis_workbench', connections: ['ch41_entry'], position: [740, 500], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'ch41_entry';
  return map;
}

// Our Borrowed House (Village 42) — through the door off The Old Burrows
// (ugv21_our_house). 4 nodes: the doorway, the middle of the room, and the
// bench and bed hanging off that middle. The bed is a full rest. bh42_entry
// teleports back to the village lane.
export function createBorrowedHouseMap() {
  const map = new GameMap('borrowed_house_42', 'The Underdark');
  const AREA = 'borrowed_house_42';
  map.mapImages = { [AREA]: 'Maps/OurBorrowedHouseGnomeVillage42.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further into the borrowed house.', mapArea: AREA };
  const nodes = [
    { id: 'bh42_entry', name: 'The Borrowed Room', description: 'A single low room with a swept floor, a cold hearth, and a ceiling every one of you can touch without stretching. The lane lies behind you.', encounterId: 'borrowed_house_arrival', connections: ['bh42_center'], position: [650, 760], mapArea: AREA, canRevisit: false, passthroughTo: 'ugv21_our_house' },
    // The middle of the room — the junction the bed and the bench hang off, so
    // neither has to route through the doorway (which teleports).
    { id: 'bh42_center', name: 'The Middle of the Room', description: 'Four paces of swept floor with a cold hearth on one side. Standing in it, any one of you can touch both walls.', encounterId: '', connections: ['bh42_entry', 'bh42_bench', 'bh42_bed'], position: [850, 660], ...D },
    { id: 'bh42_bench', name: 'The Bench', description: 'A long bench runs the length of the wall under the shuttered window, worn smooth by generations of small backs.', encounterId: '', connections: ['bh42_center'], position: [400, 520], ...D },
    { id: 'bh42_bed', name: 'The Bed', description: 'One bed, built for a gnome. Whatever happens here tonight, it is going to be undignified.', encounterId: 'borrowed_house_bed', connections: ['bh42_center'], position: [1280, 520], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'bh42_entry';
  return map;
}

// Underdark Gnome Village 22 — down the stair beside The Deep Well (ugv20_m3).
// A single line of 7 nodes descending from the village to its holy place, the
// Hall of Callarduran — Callarduran Smoothhands, the Svirfneblin god of stone,
// deep places and the quiet earth, whose sign is a signet ring set with a
// star-cut ruby. ugv22_entry teleports back to ugv20_m3. No onward link yet.
// Same no-fog + still-discoverable treatment as the other two village maps.
export function createUnderdarkGnomeVillage22Map() {
  const map = new GameMap('underdark_gnome_village_22', 'The Underdark');
  const AREA = 'underdark_gnome_village_22';
  map.mapImages = { [AREA]: 'Maps/UnderdarkGnomeVillage22.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further down the stair below the village.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Deep Well (ugv20_m3).
    { id: 'ugv22_entry', name: 'The Well Stair', description: 'The stair winds down around the well shaft, close enough to touch the wet rope. The market lamplight thins to nothing above you.', encounterId: '', connections: ['ugv22_2'], position: [40, 660], mapArea: AREA, canRevisit: true, passthroughTo: 'ugv20_m3' },
    { id: 'ugv22_2', name: 'The Dripping Landing', description: 'A landing halfway down, its floor slick and its walls beaded with water. Someone has set a lamp here and left it burning.', encounterId: '', connections: ['ugv22_entry', 'ugv22_3'], position: [210, 560], ...D },
    { id: 'ugv22_3', name: 'The Ring Gate', description: 'A low arch marks the bottom of the stair, carved over and over with the same sign — a signet ring, a star cut into its stone.', encounterId: '', connections: ['ugv22_2', 'ugv22_4'], position: [360, 420], ...D },
    { id: 'ugv22_4', name: "The Pilgrims' Rest", description: 'Stone benches line a wide passage, worn to a shine by the sitting of small folk waiting their turn to go down.', encounterId: '', connections: ['ugv22_3', 'ugv22_5'], position: [530, 370], ...D },
    { id: 'ugv22_5', name: 'The Star Stones', description: 'Rough boulders stand along the way, each split open to show a heart of red crystal that catches your light and holds it.', encounterId: '', connections: ['ugv22_4', 'ugv22_6'], position: [690, 480], ...D },
    { id: 'ugv22_6', name: 'The Smooth Hall', description: 'Here the walls give up their tool marks entirely — the stone runs on smooth as poured water, shaped by no chisel you know of.', encounterId: '', connections: ['ugv22_5', 'ugv22_7'], position: [850, 600], ...D },
    // The end of the line — the village's holy place.
    { id: 'ugv22_7', name: 'The Hall of Callarduran', description: 'The smooth stone opens on a doorway cut for small folk, and past it the dark goes very large. Callarduran Smoothhands, who keeps the deep places, is in there. The whole village prays here, and something is answering.', encounterId: '', connections: ['ugv22_6'], position: [920, 430], ...D, passthroughTo: 'hoc_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'ugv22_entry';
  return map;
}

// The Hall of Callarduran — the interior of the village's holy place, through
// the small-folk doorway at the end of the well stair (ugv22_7). Two nodes: the
// threshold you step into (fires the one-shot arrival beat, teleports back out)
// and the hand itself, which is this chapter's enchanting altar — the same
// two-page picker the Corrupted Shrine uses, paid in Rare Mushroom + gold.
// NO_FOG_MAPS: it is one open room, so the hand is visible from the doorway
// rather than fogged until you walk up on it.
export function createHallOfCallarduranMap() {
  const map = new GameMap('hall_of_callarduran', 'The Underdark');
  const AREA = 'hall_of_callarduran';
  map.mapImages = { [AREA]: 'Maps/HallOfCallarduran.jpg' };
  const nodes = [
    // Threshold — teleports back up to The Hall of Callarduran door (ugv22_7).
    // canRevisit:false so the arrival description plays exactly once; the
    // passthrough back out still works (same setup as umc25_entry).
    { id: 'hoc_entry', name: 'The Threshold', description: 'Just inside the door, where the smooth stone opens out and the sound of your own breathing goes somewhere and does not come back.', encounterId: 'hall_of_callarduran_arrival', connections: ['hoc_altar'], position: [350, 770], mapArea: AREA, canRevisit: false, passthroughTo: 'ugv22_7' },
    { id: 'hoc_altar', name: 'The Open Hand', description: 'A hand of living rock reaches out of the far wall, palm up and open, big enough to stand in. Something red burns low in it. The gnomes leave what they can spare on the fingers.', encounterId: 'callarduran_altar', connections: ['hoc_entry'], position: [740, 650], mapArea: AREA, canRevisit: true },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'hoc_entry';
  return map;
}

// Underdark East Path 23 — through the broken wall behind The Black Coffer
// (uep19_d3). 4 nodes in a line, a worked corridor running on east away from the
// vault. uep23_entry teleports back to uep19_d3; the last node (uep23_4)
// teleports on to East Path 24.
export function createUnderdarkEastPath23Map() {
  const map = new GameMap('underdark_east_path_23', 'The Underdark');
  const AREA = 'underdark_east_path_23';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath23.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the corridor.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Black Coffer (uep19_d3). Always visible.
    { id: 'uep23_entry', name: 'The Broken Wall', description: 'You climb through the gap behind the coffer into a corridor that was cut, not carved — square, level, and running straight off east. The under-vault lies behind you.', encounterId: '', connections: ['uep23_2'], position: [760, 860], mapArea: AREA, canRevisit: true, passthroughTo: 'uep19_d3' },
    { id: 'uep23_2', name: 'The Square Passage', description: 'The corridor holds its shape for a long, dull stretch, every joint in the stone still tight after all this time.', encounterId: '', connections: ['uep23_entry', 'uep23_3'], position: [700, 600], ...D },
    { id: 'uep23_3', name: 'The Sconce Line', description: 'Iron sconces are set into the wall at even spacing, each one holding a stub of candle burned down to nothing.', encounterId: '', connections: ['uep23_2', 'uep23_4'], position: [360, 450], ...D },
    { id: 'uep23_4', name: 'The Slumped Arch', description: 'The corridor sags where the rock above shifted, the arch here re-cut and re-braced by hands in a hurry. The way runs on east.', encounterId: '', connections: ['uep23_3'], position: [360, 320], ...D, passthroughTo: 'uep24_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep23_entry';
  return map;
}

// Underdark East Path 24 — the corridor's second stretch, reached from The
// Slumped Arch (uep23_4). 4 nodes in a line. uep24_entry teleports back to
// uep23_4. No onward link yet.
export function createUnderdarkEastPath24Map() {
  const map = new GameMap('underdark_east_path_24', 'The Underdark');
  const AREA = 'underdark_east_path_24';
  map.mapImages = { [AREA]: 'Maps/UnderdarkEastPath24.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the corridor.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Slumped Arch (uep23_4). Always visible.
    { id: 'uep24_entry', name: 'Past the Bracing', description: 'Beyond the propped arch the corridor picks up its old square line again, colder here, and carrying a faint draught from somewhere ahead. The way back lies behind you.', encounterId: '', connections: ['uep24_2'], position: [320, 860], mapArea: AREA, canRevisit: true, passthroughTo: 'uep23_4' },
    { id: 'uep24_2', name: 'The Cross-Cut', description: 'A second passage crosses this one and is walled off on both hands, the blocking stone laid from your side.', encounterId: '', connections: ['uep24_entry', 'uep24_3'], position: [730, 620], ...D },
    { id: 'uep24_3', name: 'The Drainage Grate', description: 'A grate in the floor breathes cold air up at you, and far below it something moves water in the dark.', encounterId: '', connections: ['uep24_2', 'uep24_4'], position: [420, 470], ...D },
    // The Far Threshold teleports on to the Mushroom Circle (Map 25).
    { id: 'uep24_4', name: 'The Far Threshold', description: 'The corridor ends at a doorway with its door long gone, and past it the air opens out — a bigger dark, waiting.', encounterId: '', connections: ['uep24_3'], position: [480, 330], ...D, passthroughTo: 'umc25_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'uep24_entry';
  return map;
}

// Underdark Mushroom Circle 25 — past The Far Threshold (uep24_4). Only 2 nodes:
// the chamber you step into (umc25_entry, which fires the one-shot
// `mushroom_circle_arrival` beat — Raena feels a way through here) and the ring
// itself (umc25_2, the `mushroom_circle` step-in / step-back choice). The entry
// is canRevisit:false so the arrival beat plays once; its passthroughTo back to
// uep24_4 still works (same setup as uep16_entry). The circle node stays
// revisitable — stepping back leaves it un-completed so the choice can be taken
// again.
export function createUnderdarkMushroomCircle25Map() {
  const map = new GameMap('underdark_mushroom_circle_25', 'The Underdark');
  const AREA = 'underdark_mushroom_circle_25';
  map.mapImages = { [AREA]: 'Maps/UnderdarkMushroomCircle25.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something further into the chamber.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Far Threshold (uep24_4). Fires the
    // arrival dialog once (canRevisit:false).
    { id: 'umc25_entry', name: 'The Ring Chamber', description: 'The corridor lets out into a round, high chamber where the air sits heavy and strangely still. The way back lies behind you.', encounterId: 'mushroom_circle_arrival', connections: ['umc25_2'], position: [370, 860], mapArea: AREA, canRevisit: false, passthroughTo: 'uep24_4' },
    { id: 'umc25_2', name: 'The Mushroom Circle', description: 'A perfect ring of pale mushrooms grows out of the chamber floor, and the air inside it is not quite the same air as the air outside it.', encounterId: 'mushroom_circle', connections: ['umc25_entry'], position: [650, 530], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'umc25_entry';
  return map;
}

// The Ancient Druid Circle — the far end of the Mushroom Circle ring (umc25_2),
// and the first surface map since the party went underground: a standing ring in
// the Silverwood, close to Kar-Eden. 2 nodes — the circle itself (adc_center,
// where the party materializes and the one-shot `ancient_druid_circle` beat
// fires) and the way out into the trees (adc_exit, no onward map yet).
// adc_center is canRevisit:false so the arrival beat plays once; its
// passthroughTo sends the party back down to umc25_2 (same setup as
// uep16_entry). In NO_FOG_MAPS — a small open clearing, seen whole on arrival.
export function createAncientDruidCircleMap() {
  const map = new GameMap('ancient_druid_circle', 'The Silverwood');
  const AREA = 'ancient_druid_circle';
  map.mapImages = { [AREA]: 'Maps/AncientDruidCircle.jpg' };
  const nodes = [
    { id: 'adc_center', name: 'The Ancient Druid Circle', description: 'A ring of leaning standing stones in a forest clearing, the grass inside it worn bare. The ring leads back down into the dark.', encounterId: 'ancient_druid_circle', connections: ['adc_exit'], position: [660, 600], mapArea: AREA, canRevisit: false, passthroughTo: 'umc25_2' },
    // The Silverwood Path teleports on to the Kar-Eden road south (map 01).
    { id: 'adc_exit', name: 'The Silverwood Path', description: 'A track leaves the clearing under the old trees — north to Kar-Eden, south the long way round toward Qualibaf. Raena knows every step of both.', encounterId: '', connections: ['adc_center'], position: [520, 870], mapArea: AREA, canRevisit: true, passthroughTo: 'kep01_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'adc_center';
  return map;
}

// The Kar-Eden road south — three surface maps chaining the Silverwood clearing
// down to the North Crossroad above Qualibaf: 01 (3 nodes) → 02 (5) → 03 (5).
// Each map's ENTRY node teleports back to the previous stretch and its LAST node
// teleports on to the next. Outdoor trail treatment, matching the East Mountain
// Trail: in NO_FOG_MAPS (no black overlay) but every node past the entry is
// `discoverable`, so the road still reveals one hop at a time.
export function createKarEdenPath01Map() {
  const map = new GameMap('kar_eden_path_01', 'The Silverwood');
  const AREA = 'kar_eden_path_01';
  map.mapImages = { [AREA]: 'Maps/KarEdenPathtoQualibaf01.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further down the wood road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Silverwood Path (adc_exit).
    { id: 'kep01_entry', name: 'The Wood Road', description: 'The track drops away south from the clearing under a roof of old silver-barked trees, the light coming down green and moving. The circle lies behind you.', encounterId: '', connections: ['kep01_2'], position: [620, 440], mapArea: AREA, canRevisit: true, passthroughTo: 'adc_exit' },
    { id: 'kep01_2', name: 'The Elder Boughs', description: 'The oldest trees in this stretch lean their branches across the road until it runs through a green tunnel, and every sound comes back soft.', encounterId: '', connections: ['kep01_entry', 'kep01_3'], position: [460, 550], ...D },
    // The last node teleports on to map 02.
    { id: 'kep01_3', name: 'The Fallen Marker', description: 'A carved elven waystone lies toppled in the ferns, its script worn but still readable: south, and the number of days. The road runs on.', encounterId: '', connections: ['kep01_2'], position: [680, 860], ...D, passthroughTo: 'kep02_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'kep01_entry';
  return map;
}

// Kar-Eden road 02 — the middle stretch, out of the deep wood and into open
// country. 5 nodes in a line, from The Fallen Marker (kep01_3) on to map 03.
export function createKarEdenPath02Map() {
  const map = new GameMap('kar_eden_path_02', 'The Silverwood');
  const AREA = 'kar_eden_path_02';
  map.mapImages = { [AREA]: 'Maps/KarEdenPathtoQualibaf02.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further down the road south.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Fallen Marker (kep01_3).
    { id: 'kep02_entry', name: 'Past the Marker', description: 'South of the waystone the silver trees begin to thin, and for the first time in weeks there is sky in front of you as well as above. The wood road lies behind you.', encounterId: '', connections: ['kep02_2'], position: [490, 40], mapArea: AREA, canRevisit: true, passthroughTo: 'kep01_3' },
    { id: 'kep02_2', name: 'The Thinning Wood', description: 'The trees stand further apart here, and grass and bramble have taken the ground between them.', encounterId: '', connections: ['kep02_entry', 'kep02_3'], position: [520, 200], ...D },
    { id: 'kep02_3', name: 'The Ford', description: 'A shallow stream crosses the road over flat stones, cold and quick and clean — and after the black water of the deep, worth stopping for.', encounterId: '', connections: ['kep02_2', 'kep02_4'], position: [670, 500], ...D },
    { id: 'kep02_4', name: 'The Burnt Stand', description: 'A stand of trees off the road went up years ago, black trunks still standing in a ring of new green.', encounterId: '', connections: ['kep02_3', 'kep02_5'], position: [910, 650], ...D },
    // The last node teleports on to map 03.
    { id: 'kep02_5', name: "The Wood's Edge", description: 'The Silverwood ends, plainly and all at once, and the road runs out of it into rolling open country. The way south lies ahead.', encounterId: '', connections: ['kep02_4'], position: [1150, 820], ...D, passthroughTo: 'kep03_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'kep02_entry';
  return map;
}

// Kar-Eden road 03 — the last stretch, open country running down to Qualibaf.
// 5 nodes in a line. The last node (kep03_5) teleports on to the North Crossroad
// (north_crossroad) on the north_qualibaf map.
export function createKarEdenPath03Map() {
  const map = new GameMap('kar_eden_path_03', 'North of Qualibaf');
  const AREA = 'kar_eden_path_03';
  map.mapImages = { [AREA]: 'Maps/KarEdenPathtoQualibaf03.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further down the road to Qualibaf.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Wood's Edge (kep02_5).
    { id: 'kep03_entry', name: 'The Open Road', description: 'Out from under the trees the road runs straight across open ground, and the wind has room to move. The Silverwood stands at your back.', encounterId: '', connections: ['kep03_2'], position: [560, 200], mapArea: AREA, canRevisit: true, passthroughTo: 'kep02_5' },
    { id: 'kep03_2', name: 'The Long Hedge', description: 'A field hedge runs beside the road for the better part of a mile — planted, kept, and a sure sign of people not far off.', encounterId: '', connections: ['kep03_entry', 'kep03_3'], position: [880, 320], ...D },
    { id: 'kep03_3', name: 'The Milestone', description: 'A squat road-marker gives the distance to Qualibaf in a hand you actually recognize. Somebody has scratched a rude comment under the number.', encounterId: '', connections: ['kep03_2', 'kep03_4'], position: [780, 480], ...D },
    { id: 'kep03_4', name: 'The Cart Ruts', description: 'The track widens into a proper road, rutted deep by cart wheels and printed all over with the day\'s traffic.', encounterId: '', connections: ['kep03_3', 'kep03_5'], position: [610, 820], ...D },
    // The last node teleports on to the Silverwood Road, the way-in node beside
    // the North Crossroad above Qualibaf.
    { id: 'kep03_5', name: 'The Crossroad Rise', description: 'The road tops a low rise, and there below you is a crossroad you have stood on before — and past it, smoke and rooftops. Qualibaf.', encounterId: '', connections: ['kep03_4'], position: [1060, 880], ...D, passthroughTo: 'silverwood_road' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'kep03_entry';
  return map;
}

// Underdark North Path 26 — through The Sealed Arch (usx_n2), the north road off
// the South Crossroad. 6 nodes: a 3-node approach (unp26_entry → _2 → _3) that
// forks at _3 into a single node (unp26_a1, which teleports on to North Path 27)
// and a 2-node way (unp26_b1 → b2, which teleports on to North Path 28).
// unp26_entry teleports back to usx_n2.
export function createUnderdarkNorthPath26Map() {
  const map = new GameMap('underdark_north_path_26', 'The Underdark');
  const AREA = 'underdark_north_path_26';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPath26.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the north road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Sealed Arch (usx_n2). Always visible.
    { id: 'unp26_entry', name: 'Through the Arch', description: 'You squeeze past the sealed gate into air that has not been breathed in a very long time — dry, dead, and cold enough to ache. The crossroad lies behind you.', encounterId: '', connections: ['unp26_2'], position: [710, 860], mapArea: AREA, canRevisit: true, passthroughTo: 'usx_n2' },
    { id: 'unp26_2', name: 'The Dust Road', description: 'The road runs on under a finger of grey dust, unmarked by any track but your own.', encounterId: '', connections: ['unp26_entry', 'unp26_3'], position: [890, 470], ...D },
    // The fork.
    { id: 'unp26_3', name: 'The Split Stone', description: 'A single great slab has cracked clean down its middle, and the road goes around it both ways — one climbing, one holding level.', encounterId: '', connections: ['unp26_2', 'unp26_a1', 'unp26_b1'], position: [650, 340], ...D },
    // Path A — one node, teleports on to North Path 27.
    { id: 'unp26_a1', name: 'The Climbing Way', description: 'The high road rises past the slab toward a colder draught coming down out of the dark ahead.', encounterId: '', connections: ['unp26_3'], position: [710, 180], ...D, passthroughTo: 'unp27_entry' },
    // Path B — two nodes, the second teleports on to North Path 28.
    { id: 'unp26_b1', name: 'The Level Road', description: 'The low road holds its line, the walls closing in until the way is barely two abreast.', encounterId: '', connections: ['unp26_3', 'unp26_b2'], position: [390, 300], ...D },
    { id: 'unp26_b2', name: 'The Narrow Gate', description: 'A doorway of fitted stone stands at the end of the low road, narrow enough that you go through it one at a time. The way runs on beyond.', encounterId: '', connections: ['unp26_b1'], position: [230, 160], ...D, passthroughTo: 'unp28_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unp26_entry';
  return map;
}

// Underdark North Path 27 — up the high road from The Climbing Way (unp26_a1).
// 8 nodes. unp27_entry teleports back to unp26_a1 and links ONLY to The Steps
// Down (unp27_b0) — that node is the map's junction, connecting the landing,
// the wall route (unp27_a0 → a1 → a2) and the floor route (b1 → b2 → b3). The
// entry is deliberately kept off the branch-to-branch path: it's a teleporter,
// so walking over it to cross between branches would yank the party off the
// map. No onward links yet.
export function createUnderdarkNorthPath27Map() {
  const map = new GameMap('underdark_north_path_27', 'The Underdark');
  const AREA = 'underdark_north_path_27';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPath27.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the high road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Climbing Way (unp26_a1). Forks here.
    // Threshold — teleports back down to The Climbing Way. It links ONLY to
    // The Steps Down, so crossing between the two branches never has to touch
    // the landing (walking onto it would teleport the party off the map).
    { id: 'unp27_entry', name: 'The High Landing', description: 'The climb tops out on a wide landing where the cold draught comes from. The road down lies behind you.', encounterId: '', connections: ['unp27_b0'], position: [540, 840], mapArea: AREA, canRevisit: true, passthroughTo: 'unp26_a1' },
    // Way A — 3 nodes, reached off The Steps Down.
    { id: 'unp27_a0', name: 'The Ledge Head', description: 'The landing narrows to a shoulder of rock where the wall-ledge begins, a single cut step marking the start of it.', encounterId: '', connections: ['unp27_b0', 'unp27_a1'], position: [350, 720], ...D },
    { id: 'unp27_a1', name: 'The Wall Walk', description: 'A ledge runs along the cavern wall, worn smooth at shoulder height by hands that steadied themselves here.', encounterId: '', connections: ['unp27_a0', 'unp27_a2'], position: [170, 590], ...D },
    // The Watch Cut teleports on to North Path Middle 33.
    { id: 'unp27_a2', name: 'The Watch Cut', description: 'The ledge ends at a squared notch cut through to the open dark — a lookout, angled at the road far below. Behind the watch-post a passage runs on, back into the rock.', encounterId: '', connections: ['unp27_a1'], position: [160, 260], ...D, passthroughTo: 'unm33_entry' },
    // Way B — 4 nodes. The Steps Down is the real junction of this map: the
    // landing, the wall route and the floor route all meet here.
    { id: 'unp27_b0', name: 'The Steps Down', description: 'A short flight of shallow steps drops off the landing to the cavern floor, each one dished in the middle by long use. The ways part here — one along the wall, one out across the open floor.', encounterId: '', connections: ['unp27_entry', 'unp27_a0', 'unp27_b1'], position: [620, 750], ...D },
    { id: 'unp27_b1', name: 'The Open Floor', description: 'The floor of the cavern runs flat and bare for a long stretch, and your steps come back at you off walls you cannot see.', encounterId: '', connections: ['unp27_b0', 'unp27_b2'], position: [700, 640], ...D },
    { id: 'unp27_b2', name: 'The Fallen Column', description: 'A worked column lies broken across the floor, its drums scattered like dropped coins.', encounterId: '', connections: ['unp27_b1', 'unp27_b3'], position: [820, 470], ...D },
    // The Cold Draught teleports on to North Path Right 37.
    { id: 'unp27_b3', name: 'The Cold Draught', description: 'Here the draught is strong enough to pull at your torch, coming steady out of a dark the light will not cross. Whatever it comes from is that way, and the floor runs on toward it.', encounterId: '', connections: ['unp27_b2'], position: [920, 290], ...D, passthroughTo: 'unr37_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unp27_entry';
  return map;
}

// Underdark North Path 28 — beyond The Narrow Gate (unp26_b2). 4 nodes in a
// line. unp28_entry teleports back to unp26_b2. No onward link yet.
export function createUnderdarkNorthPath28Map() {
  const map = new GameMap('underdark_north_path_28', 'The Underdark');
  const AREA = 'underdark_north_path_28';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPath28.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the low road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Narrow Gate (unp26_b2). Always visible.
    { id: 'unp28_entry', name: 'Past the Narrow Gate', description: 'Through the doorway the passage opens up again, the walls falling back into dark on both hands. The gate lies behind you.', encounterId: '', connections: ['unp28_2'], position: [300, 860], mapArea: AREA, canRevisit: true, passthroughTo: 'unp26_b2' },
    { id: 'unp28_2', name: 'The Rope Line', description: 'A rotted line of rope runs waist-high along the wall, pegged every few paces — a guide for walking this stretch blind.', encounterId: '', connections: ['unp28_entry', 'unp28_3'], position: [490, 610], ...D },
    { id: 'unp28_3', name: 'The Dry Sump', description: 'A deep basin cut into the floor stands empty, its inflow channel choked with grey silt.', encounterId: '', connections: ['unp28_2', 'unp28_4'], position: [770, 380], ...D },
    // The Far Dark teleports on to North Path Left 29.
    { id: 'unp28_4', name: 'The Far Dark', description: 'The passage runs on past the reach of any light you carry, and keeps running.', encounterId: '', connections: ['unp28_3'], position: [740, 150], ...D, passthroughTo: 'unl29_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unp28_entry';
  return map;
}

// The Underdark north-left road — four maps chaining on from The Far Dark
// (unp28_4): 29 (5 in a line) → 30 (2 in, then a fork of two 2-node branches) →
// the LEFT branch runs on to 31 (5 in a line) → 32 (4 in a line). The last node
// of 32 is the current end of the road: walking onto it toasts a
// "not built yet" notice instead of teleporting (see the arriveAtNode case).
export function createUnderdarkNorthPathLeft29Map() {
  const map = new GameMap('underdark_north_left_29', 'The Underdark');
  const AREA = 'underdark_north_left_29';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathLeft29.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the left-hand road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Far Dark (unp28_4). Always visible.
    { id: 'unl29_entry', name: 'Out of the Far Dark', description: 'The long blind stretch finally gives out, and the passage takes a definite turn left and downward. The way you came lies behind you.', encounterId: '', connections: ['unl29_2'], position: [670, 830], mapArea: AREA, canRevisit: true, passthroughTo: 'unp28_4' },
    { id: 'unl29_2', name: 'The Leftward Bend', description: 'The road holds its new heading, bending steadily left as though it were going around something very large.', encounterId: '', connections: ['unl29_entry', 'unl29_3'], position: [880, 620], ...D },
    { id: 'unl29_3', name: 'The Chalk Marks', description: 'Somebody has drawn a run of chalk marks along the wall at knee height — counting something, in a hand that got shakier as it went.', encounterId: '', connections: ['unl29_2', 'unl29_4'], position: [1120, 420], ...D },
    { id: 'unl29_4', name: 'The Slumped Wall', description: 'A whole section of wall has slumped inward, and the road picks its way over the spill in a rough scramble.', encounterId: '', connections: ['unl29_3', 'unl29_5'], position: [920, 230], ...D },
    // The last node teleports on to map 30.
    { id: 'unl29_5', name: 'The Quiet Reach', description: 'Past the spill the passage runs straight and clean again, and quiet — quiet enough that you find yourself listening for what is missing. The way runs on.', encounterId: '', connections: ['unl29_4'], position: [770, 40], ...D, passthroughTo: 'unl30_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unl29_entry';
  return map;
}

// North Path Left 30 — from The Quiet Reach (unl29_5). 6 nodes: a 2-node entry
// (unl30_entry → _2) that forks at _2 into a 2-node left branch (unl30_l1 → l2,
// which teleports on to map 31) and a 2-node right branch (unl30_r1 → r2, a dead
// end for now). unl30_entry teleports back to unl29_5.
export function createUnderdarkNorthPathLeft30Map() {
  const map = new GameMap('underdark_north_left_30', 'The Underdark');
  const AREA = 'underdark_north_left_30';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathLeft30.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the left-hand road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Quiet Reach (unl29_5). Always visible.
    { id: 'unl30_entry', name: 'The Long Approach', description: 'The road runs on out of the quiet into a wider dark, the floor swept oddly clean underfoot. The way back lies behind you.', encounterId: '', connections: ['unl30_2'], position: [480, 840], mapArea: AREA, canRevisit: true, passthroughTo: 'unl29_5' },
    // The fork.
    { id: 'unl30_2', name: 'The Parting Stone', description: 'A standing stone sits square in the middle of the way, worn smooth on both sides where traffic has gone by it left and right.', encounterId: '', connections: ['unl30_entry', 'unl30_l1', 'unl30_r1'], position: [680, 630], ...D },
    // Left branch — runs on to map 31.
    { id: 'unl30_l1', name: 'The Left Hand Way', description: 'The left road keeps to the level and holds its heading, the walls squared off by old tools.', encounterId: '', connections: ['unl30_2', 'unl30_l2'], position: [510, 510], ...D },
    { id: 'unl30_l2', name: 'The Worked Passage', description: 'Here the tool marks are everywhere — floor, walls, ceiling — all of it cut by hand, and all of it going somewhere. The way runs on.', encounterId: '', connections: ['unl30_l1'], position: [410, 300], ...D, passthroughTo: 'unl31_entry' },
    // Right branch — dead end for now.
    { id: 'unl30_r1', name: 'The Right Hand Way', description: 'The right road climbs a little and narrows, the cut stone giving way to raw rock within a dozen paces.', encounterId: '', connections: ['unl30_2', 'unl30_r2'], position: [1020, 500], ...D },
    // Not blind after all — the far side of the rock face opens onto the
    // middle road (unm34_a1). Two-way once the party finds it from either end.
    { id: 'unl30_r2', name: 'The Blind End', description: 'The right road stops at a face of raw rock — but the fall of stone at its foot is loose, and behind it the dark keeps going. Whatever dug this from the far side very nearly met the diggers coming this way.', encounterId: '', connections: ['unl30_r1'], position: [1170, 270], ...D, passthroughTo: 'unm34_a1' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unl30_entry';
  return map;
}

// North Path Left 31 — from The Worked Passage (unl30_l2). 5 nodes in a line;
// the last teleports on to map 32. unl31_entry teleports back to unl30_l2.
export function createUnderdarkNorthPathLeft31Map() {
  const map = new GameMap('underdark_north_left_31', 'The Underdark');
  const AREA = 'underdark_north_left_31';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathLeft31.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper down the worked road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Worked Passage (unl30_l2). Always visible.
    { id: 'unl31_entry', name: 'The Cut Road', description: 'The worked passage opens into a proper cut road, squared and level and running dead straight ahead. The way back lies behind you.', encounterId: '', connections: ['unl31_2'], position: [520, 860], mapArea: AREA, canRevisit: true, passthroughTo: 'unl30_l2' },
    { id: 'unl31_2', name: 'The Drain Grooves', description: 'Shallow grooves run the length of the road on both sides, cut to carry water that has not run here in a very long time.', encounterId: '', connections: ['unl31_entry', 'unl31_3'], position: [610, 620], ...D },
    { id: 'unl31_3', name: 'The Empty Sockets', description: 'Square sockets are cut into the walls at even spacing, every one of them empty — whatever stood in them was taken, not broken.', encounterId: '', connections: ['unl31_2', 'unl31_4'], position: [380, 620], ...D },
    { id: 'unl31_4', name: 'The Turning Post', description: 'A squat stone post stands where the road widens, its top dished and polished by rope.', encounterId: '', connections: ['unl31_3', 'unl31_5'], position: [180, 400], ...D },
    // The last node teleports on to map 32.
    { id: 'unl31_5', name: 'The Under Gate', description: 'The road ends at a gateway cut clean through the rock, its lintel a single stone longer than your party standing end to end. Beyond it, the road goes on.', encounterId: '', connections: ['unl31_4'], position: [130, 130], ...D, passthroughTo: 'unl32_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unl31_entry';
  return map;
}

// North Path Left 32 — through The Under Gate (unl31_5). 4 nodes in a line and
// the current end of this road: walking onto the last node (unl32_4) fires a
// "this area isn't built yet" toast (handled in arriveAtNode) and leaves the
// party standing there. unl32_entry teleports back to unl31_5.
export function createUnderdarkNorthPathLeft32Map() {
  const map = new GameMap('underdark_north_left_32', 'The Underdark');
  const AREA = 'underdark_north_left_32';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathLeft32.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Beyond the under gate.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Under Gate (unl31_5). Always visible.
    { id: 'unl32_entry', name: 'Beyond the Under Gate', description: 'Through the gate the road keeps its square, careful line, and the dark ahead has the feel of a made place rather than a dug one. The gate lies behind you.', encounterId: '', connections: ['unl32_2'], position: [980, 850], mapArea: AREA, canRevisit: true, passthroughTo: 'unl31_5' },
    { id: 'unl32_2', name: 'The Paved Way', description: 'The floor turns to fitted paving, every slab still sitting level after however many centuries this has been down here.', encounterId: '', connections: ['unl32_entry', 'unl32_3'], position: [880, 630], ...D },
    { id: 'unl32_3', name: 'The Marker Stones', description: 'Waist-high stones stand at intervals along the paving, each one carved with a mark none of you can read — and all of them pointing the same way on.', encounterId: '', connections: ['unl32_2', 'unl32_4'], position: [530, 470], ...D },
    // End of the built road for now — see the toast case in arriveAtNode.
    { id: 'unl32_4', name: 'The Road Goes On', description: 'The paving runs on into a dark that swallows your light whole, and keeps going. Whatever is down there, it is further than you can reach today.', encounterId: '', connections: ['unl32_3'], position: [380, 300], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unl32_entry';
  return map;
}

// The Underdark north-MIDDLE road — four maps chaining on from The Watch Cut
// (unp27_a2): 33 (4 in a line) → 34 (2 in, then a fork: a 1-node way that comes
// out at The Blind End on Left 30, and a 2-node way on to 35) → 35 (2 in, then a
// fork: a 4-node dead-end way and a 3-node way on to 36) → 36 (4 in a line).
// The last node of 36 toasts the same "not built yet" notice as Left 32.
export function createUnderdarkNorthPathMiddle33Map() {
  const map = new GameMap('underdark_north_middle_33', 'The Underdark');
  const AREA = 'underdark_north_middle_33';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathMiddle33.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the middle road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Watch Cut (unp27_a2). Always visible.
    { id: 'unm33_entry', name: 'Behind the Watch', description: 'Behind the lookout the passage runs back into the rock, squared and deliberate — whoever watched that road came and went this way. The cut lies behind you.', encounterId: '', connections: ['unm33_2'], position: [810, 860], mapArea: AREA, canRevisit: true, passthroughTo: 'unp27_a2' },
    { id: 'unm33_2', name: 'The Guard Room', description: 'A small squared chamber off the passage, its stone bench worn to a dip and a rack on the wall with nothing left in it.', encounterId: '', connections: ['unm33_entry', 'unm33_3'], position: [630, 720], ...D },
    { id: 'unm33_3', name: 'The Signal Post', description: 'A shaft goes up out of sight here, and a rusted bell-frame hangs at the bottom of it, its rope long since rotted away.', encounterId: '', connections: ['unm33_2', 'unm33_4'], position: [500, 530], ...D },
    // The last node teleports on to map 34.
    { id: 'unm33_4', name: 'The Inner Door', description: 'A door-frame of dressed stone stands open on the deeper passage, its door taken off and carried away rather than broken. The way runs on.', encounterId: '', connections: ['unm33_3'], position: [250, 380], ...D, passthroughTo: 'unm34_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unm33_entry';
  return map;
}

// North Path Middle 34 — from The Inner Door (unm33_4). 5 nodes: a 2-node entry
// (unm34_entry → _2) forking at _2 into a single node (unm34_a1, which teleports
// through to The Blind End on Left 30 — the two roads very nearly met) and a
// 2-node way (unm34_b1 → b2, on to map 35). unm34_entry teleports back to unm33_4.
export function createUnderdarkNorthPathMiddle34Map() {
  const map = new GameMap('underdark_north_middle_34', 'The Underdark');
  const AREA = 'underdark_north_middle_34';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathMiddle34.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the middle road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Inner Door (unm33_4). Always visible.
    { id: 'unm34_entry', name: 'Past the Inner Door', description: 'Beyond the empty door-frame the passage widens and the air moves again, coming from more than one direction. The door lies behind you.', encounterId: '', connections: ['unm34_2'], position: [520, 850], mapArea: AREA, canRevisit: true, passthroughTo: 'unm33_4' },
    // The fork.
    { id: 'unm34_2', name: 'The Draught Split', description: 'Two draughts meet here and argue over your torch — one dry and close, one long and cold. The passage divides to match.', encounterId: '', connections: ['unm34_entry', 'unm34_a1', 'unm34_b1'], position: [620, 590], ...D },
    // Short way — comes out at The Blind End (unl30_r2) on Left 30.
    { id: 'unm34_a1', name: 'The Unfinished Cut', description: 'The close way ends in a working face, tools\' marks still sharp on it — and a spill of loose stone at the foot where somebody, from the far side, got very nearly through.', encounterId: '', connections: ['unm34_2'], position: [330, 390], ...D, passthroughTo: 'unl30_r2' },
    // Long way — on to map 35.
    { id: 'unm34_b1', name: 'The Cold Way', description: 'The long draught comes down this passage steady and unbroken, carrying a faint smell of water and old stone.', encounterId: '', connections: ['unm34_2', 'unm34_b2'], position: [860, 410], ...D },
    { id: 'unm34_b2', name: 'The Stair Head', description: 'The passage arrives at the head of a broad stair going down, wide enough for four abreast and cut with a handrail groove. The way runs on below.', encounterId: '', connections: ['unm34_b1'], position: [970, 180], ...D, passthroughTo: 'unm35_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unm34_entry';
  return map;
}

// North Path Middle 35 — down the stair from The Stair Head (unm34_b2). 9 nodes:
// a 2-node entry (unm35_entry → _2) forking at _2 into a 4-node dead-end way
// (unm35_a1 → a4) and a 3-node way (unm35_b1 → b3, on to map 36).
// unm35_entry teleports back to unm34_b2.
export function createUnderdarkNorthPathMiddle35Map() {
  const map = new GameMap('underdark_north_middle_35', 'The Underdark');
  const AREA = 'underdark_north_middle_35';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathMiddle35.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper below the stair.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Stair Head (unm34_b2). Always visible.
    { id: 'unm35_entry', name: 'The Stair Foot', description: 'The stair lets you down into a hall with a ceiling too high for your light to find. The steps climb away behind you.', encounterId: '', connections: ['unm35_2'], position: [270, 880], mapArea: AREA, canRevisit: true, passthroughTo: 'unm34_b2' },
    // The fork.
    { id: 'unm35_2', name: 'The Divided Hall', description: 'A spine of rock splits the hall down its length, and the floor runs on either side of it into separate dark.', encounterId: '', connections: ['unm35_entry', 'unm35_a1', 'unm35_b1'], position: [510, 870], ...D },
    // Way A — 4 nodes, dead end.
    { id: 'unm35_a1', name: 'The Left Aisle', description: 'The near side of the spine runs past a row of squared alcoves, each one deep enough to stand a person in.', encounterId: '', connections: ['unm35_2', 'unm35_a2'], position: [790, 810], ...D },
    { id: 'unm35_a2', name: 'The Broken Cistern', description: 'A great cistern has split along one wall, its contents long gone and its floor crusted white.', encounterId: '', connections: ['unm35_a1', 'unm35_a3'], position: [1010, 690], ...D },
    { id: 'unm35_a3', name: 'The Sunken Store', description: 'A storeroom sits half a step below the floor level, its shelves collapsed into a mat of grey rot.', encounterId: '', connections: ['unm35_a2', 'unm35_a4'], position: [1120, 470], ...D },
    // Not a dead end — the back of the alcove is a doorway through to the
    // right-hand road (unr39_a2). Two-way once found from either side.
    { id: 'unm35_a4', name: 'The Last Alcove', description: 'The aisle ends at a final alcove, larger than the rest, with a step up into it and nothing whatsoever inside — until your light finds the back of it, and there is no back. The stone opens on a passage running away east.', encounterId: '', connections: ['unm35_a3'], position: [1110, 80], ...D, passthroughTo: 'unr39_a2' },
    // Way B — 3 nodes, on to map 36.
    { id: 'unm35_b1', name: 'The Right Aisle', description: 'The far side of the spine is the wider road, its floor swept by the draught coming through the hall.', encounterId: '', connections: ['unm35_2', 'unm35_b2'], position: [680, 690], ...D },
    { id: 'unm35_b2', name: 'The Standing Pillars', description: 'Four squat pillars carry the roof here, each cut with a band of chisel-work at chest height.', encounterId: '', connections: ['unm35_b1', 'unm35_b3'], position: [780, 510], ...D },
    { id: 'unm35_b3', name: 'The Hall Mouth', description: 'The hall narrows to a mouth of dressed stone, and past it the made road picks up again and runs on.', encounterId: '', connections: ['unm35_b2'], position: [790, 320], ...D, passthroughTo: 'unm36_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unm35_entry';
  return map;
}

// North Path Middle 36 — through The Hall Mouth (unm35_b3). 4 nodes in a line
// and the current end of this road: walking onto unm36_4 fires the same
// "not built yet" toast as Left 32 (see arriveAtNode). unm36_entry teleports
// back to unm35_b3.
export function createUnderdarkNorthPathMiddle36Map() {
  const map = new GameMap('underdark_north_middle_36', 'The Underdark');
  const AREA = 'underdark_north_middle_36';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathMiddle36.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Beyond the hall mouth.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Hall Mouth (unm35_b3). Always visible.
    { id: 'unm36_entry', name: 'Past the Hall Mouth', description: 'Through the mouth the road runs on, and the work of it is finer here — closer joints, cleaner lines, no wasted cut. The hall lies behind you.', encounterId: '', connections: ['unm36_2'], position: [800, 860], mapArea: AREA, canRevisit: true, passthroughTo: 'unm35_b3' },
    { id: 'unm36_2', name: 'The Kerbed Road', description: 'A raised kerb runs along both sides of the way, as though something was expected to come down it fast enough to need keeping on.', encounterId: '', connections: ['unm36_entry', 'unm36_3'], position: [870, 680], ...D },
    { id: 'unm36_3', name: 'The Wide Threshold', description: 'The road passes under a threshold three times wider than it needs to be, its jambs cut with sockets for a gate that is no longer there.', encounterId: '', connections: ['unm36_2', 'unm36_4'], position: [700, 480], ...D },
    // End of the built road for now — see the toast case in arriveAtNode.
    { id: 'unm36_4', name: 'The Way Ahead', description: 'Past the threshold the road runs on level and straight into a dark your light cannot dent. Whatever it was built to reach is still out there, further than today.', encounterId: '', connections: ['unm36_3'], position: [460, 330], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unm36_entry';
  return map;
}

// The Underdark north-RIGHT road — four maps chaining on from The Cold Draught
// (unp27_b3): 37 (4 in a line) → 38 (4 in a line) → 39 (2 in, then a fork: a
// 2-node way that comes out at The Last Alcove on Middle 35, and a 3-node way on
// to 40) → 40 (4 in a line). The last node of 40 toasts the same "not built yet"
// notice as Left 32 / Middle 36.
export function createUnderdarkNorthPathRight37Map() {
  const map = new GameMap('underdark_north_right_37', 'The Underdark');
  const AREA = 'underdark_north_right_37';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathRight37.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the right-hand road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Cold Draught (unp27_b3). Always visible.
    { id: 'unr37_entry', name: 'Into the Draught', description: 'You walk into the cold coming the other way, and it does not let up. The open floor lies behind you.', encounterId: '', connections: ['unr37_2'], position: [950, 870], mapArea: AREA, canRevisit: true, passthroughTo: 'unp27_b3' },
    { id: 'unr37_2', name: 'The Wind Gallery', description: 'The passage narrows and the draught quickens through it, moaning off some edge of stone you never find.', encounterId: '', connections: ['unr37_entry', 'unr37_3'], position: [850, 680], ...D },
    { id: 'unr37_3', name: 'The Scoured Floor', description: 'Centuries of moving air have swept this stretch down to bare rock, polished and clean and printless.', encounterId: '', connections: ['unr37_2', 'unr37_4'], position: [1160, 270], ...D },
    // The last node teleports on to map 38.
    { id: 'unr37_4', name: 'The Sounding Bend', description: 'The passage turns, and the draught turns with it — and somewhere past the bend the moan drops to a note you feel in your chest more than hear. The way runs on.', encounterId: '', connections: ['unr37_3'], position: [910, 40], ...D, passthroughTo: 'unr38_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unr37_entry';
  return map;
}

// North Path Right 38 — from The Sounding Bend (unr37_4). 4 nodes in a line;
// the last teleports on to map 39. unr38_entry teleports back to unr37_4.
export function createUnderdarkNorthPathRight38Map() {
  const map = new GameMap('underdark_north_right_38', 'The Underdark');
  const AREA = 'underdark_north_right_38';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathRight38.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the right-hand road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Sounding Bend (unr37_4). Always visible.
    { id: 'unr38_entry', name: 'Past the Bend', description: 'Around the turn the passage runs on into the low note, and the cold comes with it. The bend lies behind you.', encounterId: '', connections: ['unr38_2'], position: [430, 870], mapArea: AREA, canRevisit: true, passthroughTo: 'unr37_4' },
    { id: 'unr38_2', name: 'The Vent Shafts', description: 'A row of narrow shafts pierces the wall at head height, and the draught pours out of every one of them at once.', encounterId: '', connections: ['unr38_entry', 'unr38_3'], position: [500, 600], ...D },
    { id: 'unr38_3', name: 'The Grille', description: 'A grille of black iron blocks a side opening, its bars thick as your wrist and its lock long since rusted solid.', encounterId: '', connections: ['unr38_2', 'unr38_4'], position: [790, 300], ...D },
    // The last node teleports on to map 39.
    { id: 'unr38_4', name: 'The Air Well', description: 'The passage passes the mouth of a shaft going straight down, and the cold is coming up out of it. Somewhere far below, something very large is breathing. The way runs on.', encounterId: '', connections: ['unr38_3'], position: [690, 90], ...D, passthroughTo: 'unr39_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unr38_entry';
  return map;
}

// North Path Right 39 — from The Air Well (unr38_4). 7 nodes: a 2-node entry
// (unr39_entry → _2) forking at _2 into a 2-node way (unr39_a1 → a2, which
// teleports through to The Last Alcove on Middle 35) and a 3-node way
// (unr39_b1 → b3, on to map 40). unr39_entry teleports back to unr38_4.
export function createUnderdarkNorthPathRight39Map() {
  const map = new GameMap('underdark_north_right_39', 'The Underdark');
  const AREA = 'underdark_north_right_39';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathRight39.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Further along the right-hand road.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Air Well (unr38_4). Always visible.
    { id: 'unr39_entry', name: 'Past the Air Well', description: 'You leave the shaft and its breathing behind, and nobody suggests looking down it again. The way back lies behind you.', encounterId: '', connections: ['unr39_2'], position: [580, 870], mapArea: AREA, canRevisit: true, passthroughTo: 'unr38_4' },
    // The fork.
    { id: 'unr39_2', name: 'The Crossing Ways', description: 'Two passages meet the road here at an angle neither of them was cut for — one going west into worked stone, one going on north.', encounterId: '', connections: ['unr39_entry', 'unr39_a1', 'unr39_b1'], position: [600, 730], ...D },
    // West way — comes out at The Last Alcove (unm35_a4) on Middle 35.
    { id: 'unr39_a1', name: 'The West Cut', description: 'The western passage is older work, its walls dressed and its floor dipping gently down.', encounterId: '', connections: ['unr39_2', 'unr39_a2'], position: [420, 770], ...D },
    { id: 'unr39_a2', name: 'The Back Door', description: 'The cut ends at a squared opening looking into a deep stone alcove — a way in that whoever built the hall beyond plainly never meant to advertise.', encounterId: '', connections: ['unr39_a1'], position: [200, 520], ...D, passthroughTo: 'unm35_a4' },
    // North way — on to map 40.
    { id: 'unr39_b1', name: 'The North Way', description: 'The northern passage keeps the road\'s line and the road\'s squared walls, running level and dead straight.', encounterId: '', connections: ['unr39_2', 'unr39_b2'], position: [540, 550], ...D },
    { id: 'unr39_b2', name: 'The Cut Steps', description: 'A short run of steps lifts the way onto a higher floor, each tread cut deep enough for boots much larger than yours.', encounterId: '', connections: ['unr39_b1', 'unr39_b3'], position: [350, 340], ...D },
    { id: 'unr39_b3', name: 'The Upper Landing', description: 'The steps top out on a landing where the walls fall away to either side, and the road runs on into the open dark ahead.', encounterId: '', connections: ['unr39_b2'], position: [480, 100], ...D, passthroughTo: 'unr40_entry' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unr39_entry';
  return map;
}

// North Path Right 40 — from The Upper Landing (unr39_b3). 4 nodes in a line and
// the current end of this road: walking onto unr40_4 fires the same
// "not built yet" toast as Left 32 / Middle 36 (see arriveAtNode).
// unr40_entry teleports back to unr39_b3.
export function createUnderdarkNorthPathRight40Map() {
  const map = new GameMap('underdark_north_right_40', 'The Underdark');
  const AREA = 'underdark_north_right_40';
  map.mapImages = { [AREA]: 'Maps/UnderdarkNorthPathRight40.jpg' };
  const D = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Beyond the upper landing.', mapArea: AREA };
  const nodes = [
    // Threshold — teleports back to The Upper Landing (unr39_b3). Always visible.
    { id: 'unr40_entry', name: 'Off the Landing', description: 'The road leaves the landing and runs out across a floor whose far side your light never reaches. The landing lies behind you.', encounterId: '', connections: ['unr40_2'], position: [950, 870], mapArea: AREA, canRevisit: true, passthroughTo: 'unr39_b3' },
    { id: 'unr40_2', name: 'The Standing Marks', description: 'Cut marks run along the floor in a straight line beside the road, spaced like the footings of something that was carried this way on rollers.', encounterId: '', connections: ['unr40_entry', 'unr40_3'], position: [630, 660], ...D },
    { id: 'unr40_3', name: 'The Second Gate', description: 'Another gateway stands across the road, twin to the one behind you, and just as thoroughly stripped of its gate.', encounterId: '', connections: ['unr40_2', 'unr40_4'], position: [530, 350], ...D },
    // End of the built road for now — see the toast case in arriveAtNode.
    { id: 'unr40_4', name: 'The Long Approach North', description: 'Past the second gate the road straightens and widens and goes on, and every instinct you have says it is an approach to something. Not today, though.', encounterId: '', connections: ['unr40_3'], position: [500, 70], ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'unr40_entry';
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
    { id: 'c8_3', name: 'Cracked Vault', description: 'A vaulted chamber, its ceiling split, rubble strewn across the floor.', encounterId: '', connections: ['c8_2', 'c8_4', 'c8_cave_a'], position: [200, 530], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_4', name: 'The Still Water', description: 'A black pool fills the lower chamber, perfectly still.', encounterId: '', connections: ['c8_3', 'c8_5'], position: [540, 320], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_5', name: 'Drowned Doorway', description: 'A dwarf archway stands half-submerged, the way pressing on beneath the water.', encounterId: '', connections: ['c8_4', 'c8_6', 'c8_cave_b'], position: [440, 160], mapArea: 'east_mountain_crags_chasm_08', ...D },
    { id: 'c8_6', name: 'The Deep Stair', description: 'Stairs descend into the flood and the dark, sinking deeper still.', encounterId: '', connections: ['c8_5'], position: [590, 40], mapArea: 'east_mountain_crags_chasm_08', ...D },
    // Gnoll cave mouths — branch off the vault + the drowned doorway. Walk/click
    // one to drop into its rolled Boss / Guard / generic cave (handleGnollCaveArrival).
    { id: 'c8_cave_a', name: 'Cave Mouth', description: 'A low cleft gapes in the vault wall, breathing cold, foul air — a gnoll-cave sunk into the dark.', encounterId: '', connections: ['c8_3'], position: [150, 400], mapArea: 'east_mountain_crags_chasm_08', caveEntrance: true, ...D },
    { id: 'c8_cave_b', name: 'Cave Mouth', description: 'Beside the drowned arch, a black cave mouth cuts back into the rock.', encounterId: '', connections: ['c8_5'], position: [420, 70], mapArea: 'east_mountain_crags_chasm_08', caveEntrance: true, ...D },
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
    { id: 'c9_2', name: 'The Old Diggings', description: 'Tool-marks and a collapsed shaft — dwarves mined here once, long ago.', encounterId: '', connections: ['c9_1', 'c9_3', 'c9_cave_a'], position: [380, 300], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_3', name: 'Spider Hollow', description: 'Thick webs choke a side-cavern; something large shifts in the dark.', encounterId: '', connections: ['c9_2', 'c9_4'], position: [700, 420], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_4', name: 'The Narrow Way', description: 'The passage squeezes down to a crawl over cold stone.', encounterId: '', connections: ['c9_3', 'c9_5'], position: [540, 550], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_5', name: 'Gnoll Outpost', description: 'A crude barricade and a cold watch-fire — the gnolls hold this junction.', encounterId: '', connections: ['c9_4', 'c9_6'], position: [880, 740], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_6', name: 'The Underway', description: 'A wide worked tunnel runs off level and straight into the deep.', encounterId: '', connections: ['c9_5', 'c9_7'], position: [630, 910], mapArea: 'east_mountain_crags_chasm_09', ...D },
    { id: 'c9_7', name: 'The Lower Gate', description: 'Another sealed dwarf gate bars the way down — locked fast, with no opening it from this side.', encounterId: '', connections: ['c9_6', 'c9_cave_b'], position: [310, 810], mapArea: 'east_mountain_crags_chasm_09', ...D },
    // Gnoll cave mouths — branch off the old diggings + the lower gate. Walk/click
    // one to drop into its rolled Boss / Guard / generic cave (handleGnollCaveArrival).
    { id: 'c9_cave_a', name: 'Cave Mouth', description: 'The old dig-shaft opens on a natural cave that runs off into the gnoll-dark.', encounterId: '', connections: ['c9_2'], position: [320, 210], mapArea: 'east_mountain_crags_chasm_09', caveEntrance: true, ...D },
    { id: 'c9_cave_b', name: 'Cave Mouth', description: 'A cave mouth breaks the wall short of the sealed gate, black and low.', encounterId: '', connections: ['c9_7'], position: [220, 680], mapArea: 'east_mountain_crags_chasm_09', caveEntrance: true, ...D },
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
    { id: 'c10_3', name: 'Gnoll Shrine', description: 'A crude shrine of bone and hide — the gnolls worship something down here.', encounterId: '', connections: ['c10_2', 'c10_4', 'c10_cave_a'], position: [170, 610], mapArea: 'east_mountain_crags_chasm_10', ...D },
    { id: 'c10_4', name: 'Drowned Crossroad', description: 'Flooded passages branch off in the dark; the gnoll-trail holds to one.', encounterId: '', connections: ['c10_3', 'c10_5', 'c10_cave_b'], position: [770, 370], mapArea: 'east_mountain_crags_chasm_10', ...D },
    { id: 'c10_5', name: 'The Deep Pool', description: 'A still, deep pool fills the cavern wall to wall; the trail skirts its edge.', encounterId: '', connections: ['c10_4', 'c10_6'], position: [420, 200], mapArea: 'east_mountain_crags_chasm_10', ...D },
    // The Sealed Deep — now a cave mouth: the road-end collapse opens a
    // gnoll-cave off to one side. Walk/click to drop into the rolled cave.
    { id: 'c10_6', name: 'Cave Mouth', description: 'The way ends at a great collapse of stone and water — but a low cave mouth gapes in the rock beside it, breathing cold air into the dark.', encounterId: '', connections: ['c10_5'], position: [510, 110], mapArea: 'east_mountain_crags_chasm_10', caveEntrance: true, ...D },
    // Gnoll cave mouths — branch off the shrine + the drowned crossroad. Walk/click
    // one to drop into its rolled Boss / Guard / generic cave (handleGnollCaveArrival).
    { id: 'c10_cave_a', name: 'Cave Mouth', description: 'Behind the bone-shrine, a black cave mouth swallows the gnoll-trail into the deep.', encounterId: '', connections: ['c10_3'], position: [110, 490], mapArea: 'east_mountain_crags_chasm_10', caveEntrance: true, ...D },
    { id: 'c10_cave_b', name: 'Cave Mouth', description: 'One of the flooded branches narrows to a cave mouth, low and dripping.', encounterId: '', connections: ['c10_4'], position: [860, 270], mapArea: 'east_mountain_crags_chasm_10', caveEntrance: true, ...D },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'c10_1';
  return map;
}

// === Gnoll Caves (branch off the deep-chasm cave mouths) ===
// Three cave layouts, each reached through one of the 7 chasm cave-mouths. The
// runtime rolls which mouth leads to the (unique) Boss cave, which to the
// (unique) Guard cave, and the other five to the generic single-room cave.
// `mapId` is UNIQUE per instance (gnoll_cave_<entranceId>) so each cave caches
// + tracks state separately; `mapArea` is SHARED per cave TYPE so every
// instance of a type renders the same art (one preload per type). All interior
// nodes are `discoverable` (dark: ??? until the party is a hop away).

// Boss cave (unique) — GnollBossCave01 (1456x816). Entry forks in a Y: branch A
// runs long (Cramped Run → … → Broken Stair → Dead-End Hollow → Corrupted
// Shrine), branch B is the short pack-leader's ground (Wide Gallery → Cook-Fires
// → Pack-Leader's Den). The Pack-Leader's Den links back to the Broken Stair, so
// the two branches loop and the entry is a pure exit (walk onto it → teleport out).
export function createGnollBossCaveMap(mapId) {
  const map = new GameMap(mapId, 'Gnoll Cave');
  const AREA = 'gnoll_boss_cave';
  map.mapImages = { [AREA]: 'Maps/GnollBossCave01.jpg' };
  const P = mapId;
  const F = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the gnoll-dark.', mapArea: AREA };
  const nodes = [
    { id: `${P}_entry`, name: 'Cave Mouth', description: 'The cave opens into a low gnoll-warren, the trail forking ahead into the dark.', encounterId: '', connections: [`${P}_a1`, `${P}_b1`], position: [1018, 760], ...F },
    // Branch A — the long way, ending at the Corrupted Shrine.
    { id: `${P}_a1`, name: 'Cramped Run', description: 'A cramped gnoll-run twists off to one side.', encounterId: '', connections: [`${P}_entry`, `${P}_a2`], position: [1140, 430], ...F },
    { id: `${P}_a2`, name: 'Narrow Passage', description: 'The passage narrows, gnawed bones underfoot.', encounterId: '', connections: [`${P}_a1`, `${P}_a3`], position: [900, 280], ...F },
    { id: `${P}_a3`, name: 'Reeking Den', description: 'A reeking den of hide-scraps and old kills.', encounterId: '', connections: [`${P}_a2`, `${P}_a4`], position: [520, 70], ...F },
    { id: `${P}_a4`, name: 'Broken Stair', description: 'The run climbs over a fall of broken stone.', encounterId: '', connections: [`${P}_a3`, `${P}_a5`, `${P}_b3`], position: [550, 330], ...F },
    { id: `${P}_a5`, name: 'Dead-End Hollow', description: 'A deep hollow at the run\'s dead end.', encounterId: '', connections: [`${P}_a4`, `${P}_a6`], position: [280, 370], ...F },
    { id: `${P}_a6`, name: 'Corrupted Shrine', description: 'A defiled shrine at the hollow\'s end — bones and black ichor heaped where the gnolls worship something worse than themselves.', encounterId: 'corrupted_shrine', connections: [`${P}_a5`], position: [120, 470], ...F },
    // Branch B — the short pack-leader's ground; loops back to the Broken Stair.
    { id: `${P}_b1`, name: 'Wide Gallery', description: 'A wider gallery opens off the other fork.', encounterId: '', connections: [`${P}_entry`, `${P}_b2`], position: [790, 420], ...F },
    { id: `${P}_b2`, name: 'Cook-Fires', description: 'Cold cook-fires and gnoll-sign foul the air.', encounterId: '', connections: [`${P}_b1`, `${P}_b3`], position: [680, 640], ...F },
    { id: `${P}_b3`, name: "Pack-Leader's Den", description: 'A great den at the gallery\'s end — the pack-leader\'s ground.', encounterId: '', connections: [`${P}_b2`, `${P}_a4`], position: [420, 670], ...F },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = `${P}_entry`;
  map._caveType = 'boss';
  return map;
}

// Generic cave (reused, up to 5 instances) — GnollCave02 (1232x928). A single
// dead-end room you enter and nothing more.
export function createGnollCaveMap(mapId) {
  const map = new GameMap(mapId, 'Gnoll Cave');
  const AREA = 'gnoll_cave';
  map.mapImages = { [AREA]: 'Maps/GnollCave02.jpg' };
  const P = mapId;
  map.addNode(new MapNode({
    id: `${P}_entry`, name: 'Gnoll Den', description: 'A single low cave, rank with gnoll-sign — a dead-end warren.', encounterId: '', connections: [], position: [616, 460], mapArea: AREA, canRevisit: true,
  }));
  map.currentNodeId = `${P}_entry`;
  map._caveType = 'generic';
  return map;
}

// Guard cave (unique) — GnollCaveGuards03 (1232x928). 4 nodes in a line, a
// guard-post run down to the Prisoner Hole where a captive is held.
export function createGnollGuardsCaveMap(mapId) {
  const map = new GameMap(mapId, 'Gnoll Cave');
  const AREA = 'gnoll_guards_cave';
  map.mapImages = { [AREA]: 'Maps/GnollCaveGuards03.jpg' };
  const P = mapId;
  const F = { canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Deeper into the gnoll-dark.', mapArea: AREA };
  const nodes = [
    { id: `${P}_entry`, name: 'Cave Mouth', description: 'The cave opens on a guarded gnoll-run bending away into the dark.', encounterId: '', connections: [`${P}_g2`], position: [1080, 100], ...F },
    { id: `${P}_g2`, name: 'Guard Post', description: 'A crude barricade and a cold watch-fire block the run.', encounterId: '', connections: [`${P}_entry`, `${P}_g3`], position: [900, 390], ...F },
    { id: `${P}_g3`, name: 'Inner Run', description: 'The passage presses on past the guard-post.', encounterId: '', connections: [`${P}_g2`, `${P}_g4`], position: [500, 520], ...F },
    // canRevisit:false (overriding F) so the one-shot rescue dialog fires once
    // and the node falls silent afterward — you can still stand on it, but the
    // prisoners aren't re-rescued every visit.
    { id: `${P}_g4`, name: 'Prisoner Hole', description: 'A deep pit-den at the run\'s end — a captive is held here, guarded.', encounterId: 'gnoll_prisoner_hole', connections: [`${P}_g3`], position: [270, 540], ...F, canRevisit: false },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = `${P}_entry`;
  map._caveType = 'guards';
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
    { id: 'north_crossroad', name: 'North Crossroad', description: 'A crossroad north of the city.', encounterId: 'north_crossroad', connections: ['north_gate_return', 'filibaf_entrance', 'north_road', 'silverwood_road'], position: [580, 170], mapArea: 'north_qualibaf', unlocks: ['filibaf_entrance'] },
    { id: 'filibaf_entrance', name: 'Filibaf Entrance', description: 'The entrance to Filibaf Forest.', encounterId: 'filibaf_entrance', connections: ['north_crossroad'], position: [825, 160], mapArea: 'north_qualibaf', isLocked: true, canRevisit: true, hiddenName: '???' },
    // Armorer's-son side quest — opens once the crossroad quest dialog is
    // finished (handleEncounterChoiceClick unlocks it). Goes nowhere yet:
    // no encounter, a placeholder node for the rescue beat to come.
    { id: 'north_road', name: 'The North Road', description: 'The road climbs north toward the smoke-hazed hills.', encounterId: '', connections: ['north_crossroad'], position: [620, 95], mapArea: 'north_qualibaf', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'The road runs on into the northern hills.' },
    // Chapter 3 — the road the party comes down out of the Silverwood, and the
    // way back up it. Stays locked (and so undrawn) until they arrive from
    // Kar-Eden road 03; the _karEdenRoadUnlocked latch re-applies the unlock in
    // hydrateMapFromGlobalState after a reload. Teleports to kep03_5.
    { id: 'silverwood_road', name: 'The Silverwood Road', description: 'The northwest road runs up out of the farm country toward the elven wood — and the standing stones the party came through.', encounterId: '', connections: ['north_crossroad'], position: [470, 100], mapArea: 'north_qualibaf', isLocked: true, canRevisit: true, passthroughTo: 'kep03_5' },
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
