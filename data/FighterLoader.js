
let fighterDataCache = null;
let fighterHistoryStack = [];
let fighterHistoryPointer = -1;
const FIGHTER_API_BASE = 'http://localhost:3001/api/fighters'; // Use this for local mock backend
let schemaVersion = 1;
let fighterTemplates = {};

/**
 * Event system for fighter data loading.
 * Usage: onFighterEvent('load', callback)
 */
const fighterEventListeners = {
    load: [],
    error: [],
    refresh: [],
};

/**
 * Subscribe to fighter loader events.
 * @param {('load'|'error'|'refresh')} eventType
 * @param {function} callback
 */
export function onFighterEvent(eventType, callback) {
    if (fighterEventListeners[eventType]) {
        fighterEventListeners[eventType].push(callback);
    }
}

// Debounce utility for event emission
function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
const debouncedEmitFighterEvent = debounce((eventType, payload) => emitFighterEvent(eventType, payload), 100);

function emitFighterEvent(eventType, payload) {
    if (fighterEventListeners[eventType]) {
        fighterEventListeners[eventType].forEach(cb => cb(payload));
    }
}
/**
 * Loads the fighter data from a given path (default: 'data/fighters.json').
 * Caches the result to avoid redundant fetches.
 * @param {string} [path='data/fighters.json'] - The path or URL to the fighters JSON file.
 * @param {function} [onError] - Optional callback for error handling.
 * @returns {Promise<Object[]>} Array of fighter objects.
 */
export async function loadFighterData(path = 'data/fighters.json', onError) {
    if (fighterDataCache) {
        return fighterDataCache;
    }
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch fighters: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!validateFighterData(data)) {
            throw new Error('Invalid fighter data format.');
        }
        fighterDataCache = migrateFighterData(data);
        saveFighterHistory();
        emitFighterEvent('load', fighterDataCache);
        return fighterDataCache;
    } catch (error) {
        emitFighterEvent('error', error);
        if (onError) {
            onError(error);
        } else {
            console.error(error);
        }
        return null;
    }
}

/**
 * Loads a single fighter by ID or name.
 * @param {string|number} identifier - Fighter ID or name.
 * @param {string} [path] - Optional path to fighters JSON.
 * @returns {Promise<Object|null>} The fighter object or null if not found.
 */
export async function loadFighterByIdOrName(identifier, path) {
    const data = await loadFighterData(path);
    if (!data) return null;
    return data.find(f => f.id === identifier || f.name === identifier) || null;
}

/**
 * Validates the structure of the fighter data array.
 * @param {any} data - The data to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateFighterData(data) {
    if (!Array.isArray(data)) return false;
    // Basic validation: check for required keys in first fighter
    if (data.length === 0) return true;
    const fighter = data[0];
    return typeof fighter.id !== 'undefined' && typeof fighter.name === 'string';
}

/**
 * Clears the fighter data cache (for testing or data refresh).
 */
export function clearFighterDataCache() {
    fighterDataCache = null;
    fighterHistoryStack = [];
    fighterHistoryPointer = -1;
    emitFighterEvent('refresh', null);
}

/**
 * --- Remote Sync & Persistence ---
 */
/**
 * Create a new fighter via backend API.
 * @param {Object} fighter
 * @returns {Promise<Object|null>}
 */
export async function createFighter(fighter) {
    const response = await fetch(FIGHTER_API_BASE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(fighter)
    });
    if (response.ok) {
        const newFighter = await response.json();
        addFightersToCache([newFighter]);
        return newFighter;
    }
    return null;
}

/**
 * Update a fighter via backend API.
 * @param {string|number} id
 * @param {Partial<Object>} updates
 * @returns {Promise<Object|null>}
 */
export async function updateFighter(id, updates) {
    const response = await fetch(`${FIGHTER_API_BASE}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates)
    });
    if (response.ok) {
        const updated = await response.json();
        updateFighterInCache(id, updated);
        return updated;
    }
    return null;
}

/**
 * Delete a fighter via backend API.
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function deleteFighter(id) {
    const response = await fetch(`${FIGHTER_API_BASE}/${id}`, { method: 'DELETE' });
    if (response.ok) {
        removeFightersFromCache([id]);
        return true;
    }
    return false;
}

/**
 * Sync all fighters to backend (bulk update).
 * @returns {Promise<boolean>}
 */
export async function syncFighterData() {
    if (!fighterDataCache) return false;
    const response = await fetch(FIGHTER_API_BASE, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(fighterDataCache)
    });
    return response.ok;
}

/**
 * --- Versioning & Change History ---
 */
function saveFighterHistory() {
    // Truncate redo stack
    fighterHistoryStack = fighterHistoryStack.slice(0, fighterHistoryPointer + 1);
    fighterHistoryStack.push(JSON.parse(JSON.stringify(fighterDataCache)));
    fighterHistoryPointer++;
}

export function undoFighterChange() {
    if (fighterHistoryPointer > 0) {
        fighterHistoryPointer--;
        fighterDataCache = JSON.parse(JSON.stringify(fighterHistoryStack[fighterHistoryPointer]));
        emitFighterEvent('refresh', fighterDataCache);
        return true;
    }
    return false;
}

export function redoFighterChange() {
    if (fighterHistoryPointer < fighterHistoryStack.length - 1) {
        fighterHistoryPointer++;
        fighterDataCache = JSON.parse(JSON.stringify(fighterHistoryStack[fighterHistoryPointer]));
        emitFighterEvent('refresh', fighterDataCache);
        return true;
    }
    return false;
}

/**
 * --- Schema Evolution & Migration ---
 */
function migrateFighterData(data) {
    // Example: upgrade all fighters to latest schema version
    return data.map(f => {
        if (!f.schemaVersion || f.schemaVersion < schemaVersion) {
            // Example migration: add missing fields, rename, etc.
            let migrated = {...f};
            if (!migrated.stats) migrated.stats = {hp: 100, atk: 10, def: 10};
            migrated.schemaVersion = schemaVersion;
            return migrated;
        }
        return f;
    });
}

/**
 * --- Computed Properties & Derived Stats ---
 */
/**
 * Compute derived stats for a fighter.
 * @param {Object} fighter
 * @returns {Object} Fighter with computed properties
 */
export function getComputedFighter(fighter) {
    // Example: totalPower = atk + def + hp/10
    const {atk, def, hp} = fighter.stats || {};
    const totalPower = (atk || 0) + (def || 0) + ((hp || 0) / 10);
    return {...fighter, totalPower};
}

/**
 * --- Localization/Internationalization ---
 */
/**
 * Get localized field for a fighter.
 * @param {Object} fighter
 * @param {string} field
 * @param {string} locale
 * @returns {string}
 */
export function getLocalizedFighterField(fighter, field, locale) {
    if (fighter.i18n && fighter.i18n[locale] && fighter.i18n[locale][field]) {
        return fighter.i18n[locale][field];
    }
    return fighter[field] || '';
}

/**
 * --- Fighter Grouping & Tagging ---
 */
/**
 * Group fighters by a tag or property.
 * @param {string} tag
 * @returns {Object[]} Fighters with the tag
 */
export function getFightersByTag(tag) {
    if (!fighterDataCache) return [];
    return fighterDataCache.filter(f => f.tags && f.tags.includes(tag));
}

/**
 * --- Data Integrity Checks ---
 */
/**
 * Run integrity checks on the cache.
 * @returns {{warnings: string[], errors: string[]}}
 */
export function runIntegrityChecks() {
    const warnings = [], errors = [];
    if (!fighterDataCache) return {warnings, errors};
    const ids = new Set();
    fighterDataCache.forEach((f, i) => {
        if (ids.has(f.id)) errors.push(`Duplicate ID: ${f.id}`);
        else ids.add(f.id);
        if (!f.name) errors.push(`Missing name at index ${i}`);
        if (!f.stats) warnings.push(`Missing stats for fighter ${f.id}`);
        // Add more checks as needed
    });
    return {warnings, errors};
}

/**
 * --- Hot Reloading/Live Editing ---
 */
let hotReloadInterval = null;
/**
 * Start polling for fighter data changes.
 * @param {number} intervalMs
 * @param {string} [path]
 */
export function startHotReload(intervalMs = 2000, path) {
    if (hotReloadInterval) clearInterval(hotReloadInterval);
    hotReloadInterval = setInterval(async () => {
        const data = await loadFighterData(path);
        emitFighterEvent('refresh', data);
    }, intervalMs);
}

export function stopHotReload() {
    if (hotReloadInterval) clearInterval(hotReloadInterval);
    hotReloadInterval = null;
}

/**
 * --- Fighter Templates & Inheritance ---
 */
/**
 * Register a fighter template.
 * @param {string} templateName
 * @param {Object} template
 */
export function registerFighterTemplate(templateName, template) {
    fighterTemplates[templateName] = template;
}

/**
 * Resolve a fighter's template inheritance.
 * @param {Object} fighter
 * @returns {Object}
 */
export function resolveFighterTemplate(fighter) {
    if (fighter.template && fighterTemplates[fighter.template]) {
        return {...fighterTemplates[fighter.template], ...fighter};
    }
    return fighter;
}

/**
 * Filters fighters by a predicate function.
 * @param {function(Object):boolean} predicate
 * @returns {Object[]} Filtered fighters from cache, or empty array if not loaded.
 */
export function filterFighters(predicate) {
    if (!fighterDataCache) return [];
    return fighterDataCache.filter(predicate);
}

/**
 * Sorts fighters in the cache by a comparator function.
 * @param {function(Object,Object):number} comparator
 * @returns {Object[]} Sorted fighters (new array), or empty array if not loaded.
 */
export function sortFighters(comparator) {
    if (!fighterDataCache) return [];
    return [...fighterDataCache].sort(comparator);
}

/**
 * Updates a fighter in the cache by id. Does not persist to backend.
 * @param {string|number} id
 * @param {Partial<Object>} updates
 * @returns {boolean} True if updated, false otherwise.
 */
export function updateFighterInCache(id, updates) {
    if (!fighterDataCache) return false;
    const idx = fighterDataCache.findIndex(f => f.id === id);
    if (idx === -1) return false;
    fighterDataCache[idx] = {...fighterDataCache[idx], ...updates};
    emitFighterEvent('refresh', fighterDataCache);
    return true;
}

/**
 * Bulk add fighters to the cache. Avoids duplicates by id.
 * @param {Object[]} newFighters
 */
export function addFightersToCache(newFighters) {
    if (!fighterDataCache) fighterDataCache = [];
    const existingIds = new Set(fighterDataCache.map(f => f.id));
    newFighters.forEach(f => {
        if (!existingIds.has(f.id)) {
            fighterDataCache.push(f);
        }
    });
    emitFighterEvent('refresh', fighterDataCache);
}

/**
 * Bulk remove fighters from cache by ids.
 * @param {Array<string|number>} ids
 */
export function removeFightersFromCache(ids) {
    if (!fighterDataCache) return;
    fighterDataCache = fighterDataCache.filter(f => !ids.includes(f.id));
    emitFighterEvent('refresh', fighterDataCache);
}

/**
 * Enhanced validation: checks all fighters and returns detailed errors.
 * @param {any[]} data
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateFighterDataDetailed(data) {
    const errors = [];
    if (!Array.isArray(data)) {
        errors.push('Data is not an array.');
        return {valid: false, errors};
    }
    data.forEach((f, i) => {
        if (typeof f.id === 'undefined') errors.push(`Fighter at index ${i} missing id.`);
        if (typeof f.name !== 'string') errors.push(`Fighter at index ${i} missing or invalid name.`);
        // Add more schema checks here as needed
    });
    return {valid: errors.length === 0, errors};
}
