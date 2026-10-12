/** Data-driven level setup shared by the objectives popup and gameplay systems. */
export const LEVELS = Object.freeze({
  1: Object.freeze({ level: 1, floors: 3, studentsPerFloor: Object.freeze([1, 1, 2]), rivalSpawnSeconds: 10, targetConquests: 4, targetScore: 1000 }),
  2: Object.freeze({ level: 2, floors: 4, studentsPerFloor: Object.freeze([1, 2, 2, 3]), rivalSpawnSeconds: 9, targetConquests: 5, targetScore: 1200 }),
  3: Object.freeze({ level: 3, floors: 4, studentsPerFloor: Object.freeze([1, 2, 3, 4]), rivalSpawnSeconds: 8, targetConquests: 6, targetScore: 1440 }),
  4: Object.freeze({ level: 4, floors: 5, studentsPerFloor: Object.freeze([2, 3, 4, 4]), rivalSpawnSeconds: 7, targetConquests: 7, targetScore: 1728 }),
  5: Object.freeze({ level: 5, floors: 5, studentsPerFloor: Object.freeze([3, 4, 5]), rivalSpawnSeconds: 6, targetConquests: 8, targetScore: 2074 }),
});

export function levelDefinition(level) { return LEVELS[level] || LEVELS[1]; }

export function createLevelObjectives(level) {
  const { targetConquests, targetScore } = levelDefinition(level);
  return { targetConquests, targetScore, actualConquests: 0, actualScore: 0, objectivesMet: false };
}
