import db from '../data/store.js';

/**
 * Smart Matching Engine
 * Scores volunteers for a task based on:
 *   1. Skill match     (weight: 50)
 *   2. Location match  (weight: 30)
 *   3. Availability    (weight: 20)
 */

const WEIGHTS = { skill: 50, location: 30, availability: 20 };

function skillScore(volunteerSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 1;
  const matched = requiredSkills.filter(s => volunteerSkills.includes(s)).length;
  return matched / requiredSkills.length;
}

function locationScore(volunteerLocation, taskLocation) {
  if (!taskLocation) return 1;
  return volunteerLocation.toLowerCase() === taskLocation.toLowerCase() ? 1 : 0.2;
}

function availabilityScore(availability) {
  const scores = { full_time: 1.0, weekdays: 0.7, weekends: 0.5 };
  return scores[availability] || 0.3;
}

export function findBestMatch(taskId) {
  const task = db.tasks.findById(taskId);
  if (!task) return { error: 'Task not found' };

  const profiles = db.volunteerProfiles.findAll();

  // Filter out volunteers already assigned to other active tasks
  const allTasks = db.tasks.findAll();
  const busyVolunteerIds = allTasks
    .filter(t => t.status === 'assigned' && t.assignedVolunteerId)
    .map(t => t.assignedVolunteerId);

  const candidates = profiles.map((profile) => {
    const user = db.users.findById(profile.userId);
    if (!user) return null;

    const skill = skillScore(profile.skills, task.requiredSkills);
    const location = locationScore(profile.location, task.location);
    const avail = availabilityScore(profile.availability);
    const totalScore =
      skill * WEIGHTS.skill +
      location * WEIGHTS.location +
      avail * WEIGHTS.availability;

    const isBusy = busyVolunteerIds.includes(profile.userId);

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      skills: profile.skills,
      location: profile.location,
      availability: profile.availability,
      scores: {
        skill: Math.round(skill * 100),
        location: Math.round(location * 100),
        availability: Math.round(avail * 100),
        total: Math.round(totalScore),
      },
      isBusy,
    };
  });

  const validCandidates = candidates
    .filter(Boolean)
    .sort((a, b) => {
      // Prefer non-busy volunteers, then sort by score
      if (a.isBusy !== b.isBusy) return a.isBusy ? 1 : -1;
      return b.scores.total - a.scores.total;
    });

  return {
    task: { id: task.id, title: task.title, location: task.location, requiredSkills: task.requiredSkills },
    bestMatch: validCandidates[0] || null,
    allCandidates: validCandidates,
  };
}

export function autoAssign(taskId) {
  const result = findBestMatch(taskId);
  if (result.error) return result;
  if (!result.bestMatch) return { error: 'No volunteers available' };

  const updated = db.tasks.update(taskId, {
    assignedVolunteerId: result.bestMatch.userId,
    status: 'assigned',
  });

  // Create notification
  db.notifications.create({
    userId: result.bestMatch.userId,
    message: `You have been assigned to "${updated.title}" in ${updated.location}.`,
    read: false,
  });

  return { task: updated, assignedTo: result.bestMatch };
}
