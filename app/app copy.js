'use strict';

const customEvents = {
    expand: new CustomEvent('expand', { bubbles: true, cancelable: true }),
    collapse: new CustomEvent('collapse', { bubbles: false, cancelable: true }),
};
async function renderNote(uuid) {
    
}
function createNoteDiv(uuid, expand, content = '') {
    const div = document.createElement('div');
    div.className = 'note ' + uuid;
    div.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        init(uuid);
    });
    div.addEventListener('expand', handleExpand);
    div.addEventListener('collapse', handleCollapse);
    div.append(createContentDiv());
    updateDOM(div, expand, content);
    return div;
}
async function updateDOM(noteDiv, expand) {
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    const noteData = await db.get('notes', uuid);
    console.log('updating DOM for ', noteDiv, '\nwith ', noteData);
    noteDiv.querySelector('.content > span').textContent = noteData.content;
    noteDiv.querySelector('.content > span').focus();
    if (expand) {
        noteDiv.classList.add('expanded');
        const childrenDiv = noteDiv.querySelector('.children') || document.createElement('div');
        childrenDiv.className = 'children';
        childrenDiv.append(...noteData.children.map((childUuid) => {
            // const existingNoteDiv = childrenDiv.querySelector(`.note.${childUuid}`);
            const existingNoteDiv = childrenDiv.querySelector(`.note.${CSS.escape(childUuid)}`);
            if (existingNoteDiv) { 
                return existingNoteDiv.dispatchEvent(
                    existingNoteDiv.classList.contains('expanded') ? customEvents.expand : customEvents.collapse
                );
            }
            return createNoteDiv(childUuid);
        }));
        noteDiv.append(childrenDiv);
    } else {
        noteDiv.classList.remove('expanded');
        noteDiv.querySelector('.children')?.remove();
    }

}
async function handleCollapse(event) {
    console.log('collapsed!!', event);
    const noteDiv = event.currentTarget;
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    updateDOM(noteDiv, false);
}
async function handleExpand(event) {
    console.log('expanded!!', event);
    const noteDiv = event.currentTarget;
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    updateDOM(noteDiv, true);
}
function createContentDiv() {
    const div = document.createElement('div');
    div.className = 'content';
    const img = document.createElement('img');
    img.src = 'icons/toggle.svg';
    img.addEventListener('click', (event) => {
        event.stopPropagation();
        const noteDiv = event.target.closest('.note');
        const eventType = noteDiv.classList.contains('expanded') ? 'collapse' : 'expand';
        event.target.dispatchEvent(customEvents[eventType]);
    });
    const span = document.createElement('span');
    span.setAttribute('contenteditable', 'true');
    // span.addEventListener('input', handleInput);
    span.addEventListener('keydown', handleKeyDown);
    div.append(img, span);
    return div;
}
async function handleKeyDown(event) {
    const span = event.currentTarget;
    const noteDiv = span.closest('.note');
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    const noteData = await db.upsert('notes', { uuid: uuid, content: span.textContent });
    const parentNoteDiv = noteDiv.parentNode.closest('.note') || noteDiv;
    if (event.key === "Enter") {
        event.preventDefault();
        span.blur();
        // const targetNoteDiv = parentNoteDiv || noteDiv;
        // const nextSibling = parentNoteDiv ? (event.shiftKey ? noteDiv : noteDiv.nextSibling) : noteDiv.querySelector('.children')?.firstChild;
        // console.log('targetNode:', targetNoteDiv, 'nextSibling:', nextSibling);
        // targetNoteDiv.querySelector('.children').insertBefore(createNoteDiv(crypto.randomUUID()), nextSibling);
        // targetNoteDiv.dispatchEvent(customEvents.expand);
        const parentUuid = parentNoteDiv.className.split(' ').find(cls => cls !== 'note');
        const parentData = await db.get('notes', parentUuid);
        const index = parentData.children.findIndex(child => child.uuid === uuid);
        const newChildUuid = crypto.randomUUID();
        const updates = {
            uuid: parentUuid,
            children: [
                ...parentData.children.slice(0, index + 1),
                newChildUuid,
                ...parentData.children.slice(index + 1)
            ]
        };
        // const newParentData = await db.upsert('notes', updates);
        await Promise.all([
            db.add('notes', { ...defaultNoteData, uuid: newChildUuid }),
            db.upsert('notes', updates)
        ]);
        parentNoteDiv.dispatchEvent(customEvents.expand);
    } else if (event.key === "Tab") {
        event.preventDefault();
        const grandParentNoteDiv = parentNoteDiv?.parentNode.closest('.note');
        // if (event.shiftKey) parentNoteDiv.parentNode.querySelector('.children').append(noteDiv);
        if (event.shiftKey && grandParentNoteDiv) {
            grandParentNoteDiv.querySelector('.children').insertBefore(noteDiv, parentNoteDiv.nextSibling);
        } else noteDiv.prevSibling?.append(noteDiv);
        noteDiv.dispatchEvent(customEvents.expand);
    } else if (event.key === "Backspace" && !span.textContent.trim()) {
        noteDiv.remove();
    } else if (event.key === "Escape") {
        span.blur();
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        span.blur();
        noteDiv.prevSibling?.querySelector('.content > span').focus();
    } else if (event.key === "ArrowDown") {
        event.preventDefault();
        span.blur();
        if (noteDiv.querySelector('.children').firstChild) {
            noteDiv.querySelector('.children').firstChild.querySelector('.content > span').focus();
        } else {
            let targetNoteDiv = noteDiv;
            do {
                if (targetNoteDiv.nextSibling) {
                    targetNoteDiv.nextSibling.querySelector('.content > span').focus();
                    break;
                } else targetNoteDiv = targetNoteDiv.parentNode.closest('.note');
            } while (targetNoteDiv);
        }
    }
}

// IndexedDB wrapper class
class IDB {
    /**
     * Create an instance of the IDB class.
     * @param {string} dbName - The name of the IndexedDB database.
     * @param {number} version - The version of the IndexedDB database.
     */
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.initialized = new Promise((resolve) => {
            this.resolveInit = resolve;
        });
        this.db = null;
    }
    /**
     * Wrap an IndexedDB request in a promise.
     * @param {IDBRequest} request - The IndexedDB request to wrap.
     * @param {string} eventType - The event type to listen for (default: 'success').
     * @returns {Promise} - A promise that resolves with the request result or rejects with an error.
     */
    async #eventWrapper(request, eventType = 'success') {
        return new Promise((resolve, reject) => {
            request.addEventListener(eventType, (event) => resolve(event.target.result));
            request.addEventListener('error', (event) => reject(event.target.error));
        });
    }
    /**
     * Handle the database upgrade event.
     * @param {Event} event - The upgrade event.
     */
    #handleUpgrade(event) {
        const db = event.target.result;
        console.log("Database upgrade needed:", db);
        this.schemas.forEach((schema) => {
            if (db.objectStoreNames.contains(schema.name)) return;
            console.log(`Creating object store: ${schema.name}`);
            const objectStore = db.createObjectStore(schema.name, schema.options);
            schema.indexes.forEach((index) =>
                objectStore.createIndex(index.name, index.name, { unique: index.unique })
            );
        });
        console.log("Object stores created:", db.objectStoreNames);
    }
    /**
     * Initialize the database and create object stores.
     * @param {Array} schemas - An array of schema objects defining the object stores.
     * @returns {Promise} - A promise that resolves when the database is initialized.
     */
    async init(schemas) {
        this.schemas = schemas;
        try {
            const request = window.indexedDB.open(this.dbName, this.version);
            request.addEventListener('upgradeneeded', (event) => this.#handleUpgrade(event));
            this.db = await this.#eventWrapper(request, "success");
            console.log("Database opened:", this.db);
            this.resolveInit(this.db);
            return this.db;
        } catch (error) {
            console.error("Error opening database:", error);
        }
    }
    /**
     * Add data to the specified object store.
     * @param {string} storeName - The name of the object store to add data to.
     * @param {*} data - The data to add to the object store.
     * @returns {Promise} - A promise that resolves when the data is added.
     */
    async add(storeName, data) {
        try {
            const request = this.db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .add(data);
            await this.#eventWrapper(request, "success");
            return data;
        } catch (error) {
            console.error("Error adding data:", error);
            throw error;
        }
    }
    /**
     * Update data in the specified object store.
     * @param {string} storeName - The name of the object store to update data in.
     * @param {*} data - The data to update in the object store.
     * @returns {Promise} - A promise that resolves when the data is updated.
     */
    async put(storeName, data) {
        try {
            const request = this.db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .put(data);
            await this.#eventWrapper(request, "success");
            return data;
        } catch (error) {
            console.error("Error putting data:", error);
            throw error;
        }
    }
    /**
     * Upsert data in the specified object store.
     * @param {string} storeName - The name of the object store to upsert data in.
     * @param {*} data - The data to upsert in the object store.
     * @returns {Promise} - A promise that resolves when the data is upserted.
     */
    async upsert(storeName, data) {
        try {
            const objectStore = this.db.transaction(storeName, "readwrite")
                .objectStore(storeName);
            const request = objectStore.get(data[objectStore.keyPath]);
            const existingData = await this.#eventWrapper(request, "success");
            if (existingData) {
                const updatedData = { ...existingData, ...data };
                if (JSON.stringify(existingData) === JSON.stringify(updatedData)) return existingData;
                const request = objectStore.put(updatedData);
                await this.#eventWrapper(request, "success");
                return updatedData;
            } else {
                const request = objectStore.add(data);
                await this.#eventWrapper(request, "success");
                return data;
            }
        } catch (error) {
            console.error("Error upserting data:", error);
            throw error;
        }
    }
    /**
     * Get data from the specified object store by key.
     * @param {string} storeName - The name of the object store to retrieve data from.
     * @param {*} key - The key of the data to retrieve.
     * @returns {Promise} - A promise that resolves to the retrieved data.
     */
    async get(storeName, key) {
        try {
            const request = this.db.transaction(storeName, "readonly")
                .objectStore(storeName)
                .get(key);
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error getting data:", error);
            throw error;
        }
    }
    /**
     * Get all data from the specified object store.
     * @param {string} storeName - The name of the object store to retrieve data from.
     * @returns {Promise<Array>} - A promise that resolves to an array of all data objects in the store.
     */
    async getAll(storeName) {
        try {
            const transaction = this.db.transaction(storeName, "readonly");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error getting all data:", error);
            throw error;
        }
    }
    /**
     * Find data in the specified object store based on the provided queries.
     * @param {string} storeName - The name of the object store to search.
     * @param {Array} queries - An array of query objects, each containing a key and value to match.
     * @param {string} queries[].key - The key to search for in the data objects.
     * @param {string} queries[].value - The value to match against the key.
     * @returns A promise that resolves to an array of matching data objects.
     * @example
     * const results = await db.find('notes', { key: 'content', value: 'example' }, { key: 'title', value: 'test' });
     */
    async find(storeName, ...queries) {
        console.log("Finding data in store:", storeName, "with queries:", queries);
        try {
            const results = [];
            const request = this.db.transaction(storeName, "readonly")
                .objectStore(storeName)
                .openCursor();
            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (!cursor) return resolve(results);
                    // if (cursor.value[key].includes(query)) results.push(cursor.value);
                    if (queries.every(query => cursor.value[query.key]?.includes(query.value))) results.push(cursor.value); // use some instead of every for OR of query
                    cursor.continue();
                };
                request.onerror = (event) => {
                    console.error("Error searching data:", event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error("Error searching data:", error);
            throw error;
        }
    }
    /**
     * Delete data from the specified object store by key.
     * @param {string} storeName - The name of the object store to delete data from.
     * @param {*} key - The key of the data to delete.
     * @returns {Promise} - A promise that resolves when the data is deleted.
     */
    async delete(storeName, key) {
        try {
            const request = this.db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .delete(key);
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error deleting data:", error);
            throw error;
        }
    }
    /**
     * Clear all data from the specified object store.
     * @param {string} storeName - The name of the object store to clear data from.
     * @returns {Promise} - A promise that resolves when the data is cleared.
     */
    async clear(storeName) {
        try {
            const request = this.db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .clear();
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error clearing data:", error);
            throw error;
        }
    }
}

const db = new IDB('divein', 1);
const schemas = [
    {
        name: 'notes',
        options: { keyPath: 'uuid' },
        indexes: [
            { name: 'content', unique: false },
            { name: 'children', unique: false },
        ],
    },
    {
        name: 'apiUrls',
        options: { keyPath: 'url' },
        indexes: [
            { name: 'url', unique: true },
            { name: 'data', unique: false },
        ],
    }
];
const defaultNoteData = {
    uuid: '',
    content: '',
    children: [],
    style: {
        expanded: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
async function init() {
    localStorage.setItem('theme', localStorage.getItem('theme') || matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    body.className = localStorage.getItem('theme');
    await Promise.all([
        db.init(schemas),
        new Promise((resolve) => addEventListener('DOMContentLoaded', resolve))
    ]);
    document.getElementById('home').addEventListener('click', home);
    document.getElementById('settings').addEventListener('click', showSettings);
    document.getElementById('sync').addEventListener('click', sync);
    document.getElementById('download').addEventListener('click', download);
    document.getElementById('upload').addEventListener('click', upload);
    document.getElementById('reload').addEventListener('click', reload);
    // document.getElementById('search').addEventListener('click', search);
    const url = new URL(location.href);
    if (!url.searchParams.has('uuid')) {
        console.log('No UUID found in URL. Redirecting to home...');
        if (!localStorage.getItem('home')) {
            console.log('No home UUID found in localStorage. Creating a new one...');
            const uuid = crypto.randomUUID();
            localStorage.setItem('home', uuid);
            await db.add('notes', {
                ...defaultNoteData,
                uuid: uuid,
                content: 'home',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        url.searchParams.set('uuid', localStorage.getItem('home'));
        history.replaceState({}, '', url.toString());
    }
    const uuid = url.searchParams.get('uuid');
    main.innerHTML = '';
    main.append(createNoteDiv(uuid, customEvents.expand));
    document.getElementById('loading').remove();
}

init();

function showMenu() {
    // const menu = document.getElementById('menu') || document.createElement('div');
}
function home() {
    const url = new URL(location.href);
    url.searchParams.set('uuid', localStorage.getItem('home'));
    history.replaceState({}, '', url.toString());
    init();
}
function showSettings() {
    const settings = document.getElementById('settings') || document.createElement('div');
    settings.classList.toggle('hidden');
}
function sync() {
    console.log('Syncing...');
    // Implement sync logic here
}
function download() {
    console.log('Downloading...');
    // Implement download logic here
}
function upload() {
    console.log('Uploading...');
    // Implement upload logic here
}
function reload() {
    console.log('Reloading...');
    location.reload();
}
function search() {
    console.log('Searching...');
    // Implement search logic here
}

function resetAllAndImSureToDeleteEverything() {
    // db.clear('notes');
    // db.clear('apiUrls');
    indexedDB.deleteDatabase('divein'); // Clear IndexedDB
    localStorage.clear(); // Clear localStorage
    history.replaceState({}, '', location.href.split('?')[0]); // Clear URL parameters
    location.reload(); // Reload the page
}