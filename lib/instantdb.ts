import { init, i } from '@instantdb/react';

const APP_ID = 'd9cb0c2b-d29b-4828-9dd3-f7698413da9f';

// Define the schema
const schema = i.schema({
  entities: {
    games: i.entity({
      gameCode: i.string(),
      names: i.json<string[]>(),
      exclusions: i.json<{ [key: string]: string[] }>(),
      adminPassword: i.string(),
      createdAt: i.number(),
      // Pre-generated assignments to prevent deadlocks
      assignments: i.json<{ [picker: string]: string }>().optional(),
    }),
    picks: i.entity({
      gameId: i.string(),
      pickerName: i.string(),
      recipientName: i.string(),
      ticketNumber: i.number(),
      timestamp: i.number(),
    }),
  },
});

type Schema = typeof schema;

export const db = init<Schema>({ appId: APP_ID });

// Helper to generate a short game ID
export function generateGameId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate valid Secret Santa assignments using backtracking
// Returns null if no valid assignment is possible
export function generateAssignments(
  names: string[],
  exclusions: { [key: string]: string[] }
): { [picker: string]: string } | null {
  const shuffledNames = [...names].sort(() => Math.random() - 0.5);
  const assignments: { [picker: string]: string } = {};
  const assigned = new Set<string>();

  function canAssign(picker: string, recipient: string): boolean {
    if (picker === recipient) return false;
    if (assigned.has(recipient)) return false;
    if (exclusions[picker]?.includes(recipient)) return false;
    return true;
  }

  function getValidRecipients(picker: string, remaining: string[]): string[] {
    return remaining.filter(r => canAssign(picker, r));
  }

  // Check if assignment is still possible for remaining pickers
  function isAssignmentPossible(
    remainingPickers: string[],
    availableRecipients: string[]
  ): boolean {
    if (remainingPickers.length === 0) return true;

    // Simple check: each remaining picker must have at least one valid option
    for (const picker of remainingPickers) {
      const validOptions = availableRecipients.filter(r =>
        r !== picker && !exclusions[picker]?.includes(r)
      );
      if (validOptions.length === 0) return false;
    }
    return true;
  }

  function backtrack(index: number): boolean {
    if (index === shuffledNames.length) return true;

    const picker = shuffledNames[index];
    const availableRecipients = names.filter(n => !assigned.has(n));
    const validRecipients = getValidRecipients(picker, availableRecipients);

    // Shuffle valid recipients for randomness
    const shuffledRecipients = [...validRecipients].sort(() => Math.random() - 0.5);

    for (const recipient of shuffledRecipients) {
      // Tentatively assign
      assignments[picker] = recipient;
      assigned.add(recipient);

      // Check if remaining assignments are still possible
      const remainingPickers = shuffledNames.slice(index + 1);
      const remainingRecipients = names.filter(n => !assigned.has(n));

      if (isAssignmentPossible(remainingPickers, remainingRecipients)) {
        if (backtrack(index + 1)) return true;
      }

      // Backtrack
      delete assignments[picker];
      assigned.delete(recipient);
    }

    return false;
  }

  // Try multiple times with different shuffle orders for better randomness
  for (let attempt = 0; attempt < 10; attempt++) {
    shuffledNames.sort(() => Math.random() - 0.5);
    Object.keys(assignments).forEach(k => delete assignments[k]);
    assigned.clear();

    if (backtrack(0)) {
      return assignments;
    }
  }

  return null;
}
