import { homedir } from 'os';
import { join } from 'path';
import fs from 'fs';

const prefPath = join(
  process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'),
  'masscode',
  'v2',
  'preferences.json'
);

export interface Preferences {
  [key: string]: unknown;
}

export function getPreferences(): Preferences {
  const data = fs.readFileSync(prefPath, 'utf8');
  return JSON.parse(data) as Preferences;
}

let storagePath: string | null = null;
let lastModified = 0;

export interface DbMeta {
  dbPath: string;
  lastModified: number;
  isModified: boolean;
}

export function getDbMeta(): DbMeta {
  if (!storagePath) {
    storagePath = getPreferences().storagePath as string;
  }
  const dbPath = join(storagePath, 'db.json');
  const currentModified = fs.statSync(dbPath).mtimeMs;
  const isModified = currentModified > lastModified;
  lastModified = currentModified;
  return { dbPath, lastModified, isModified };
}
