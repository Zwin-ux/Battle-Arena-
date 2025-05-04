import { Low, JSONFile } from 'lowdb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Low(new JSONFile(path.resolve(__dirname, '../db.json')));
await db.read();

// Example migration: add 'speed' to stats if missing
let changed = false;
for (const fighter of db.data.fighters) {
  if (!fighter.stats) fighter.stats = { hp: 100, atk: 10, def: 10, speed: 5 };
  if (typeof fighter.stats.speed === 'undefined') {
    fighter.stats.speed = 5;
    changed = true;
  }
  // Add future migrations here
}
if (changed) {
  await db.write();
  console.log('Migration complete: Fighters updated.');
} else {
  console.log('No migration needed.');
}
