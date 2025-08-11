'use strict';

const customEvents = {
    expand: new CustomEvent('expand', { bubbles: true, cancelable: true }),
    collapse: new CustomEvent('collapse', { bubbles: false, cancelable: true }),
};

function createNoteDiv(uuid, initEvent = customEvents.collapse) {
    const div = document.createElement('div');
    div.className = 'note ' + uuid;
    div.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        init(uuid);
    });
    div.addEventListener('expand', handleExpand);
    div.addEventListener('collapse', handleCollapse);
    div.append(createContentDiv());
    div.dispatchEvent(initEvent);
    return div;
}    
async function handleCollapse(event) {
    console.log('collapsed!!', event);
    const noteDiv = event.currentTarget;
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    noteDiv.classList.remove('expanded');
    const noteData = await db.get('notes', uuid) || {
        uuid: uuid,
        content: 'home',
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    noteDiv.querySelector('.content > span').textContent = noteData.content;
    noteDiv.querySelector('.content > span').focus();
    noteDiv.querySelector('.children')?.remove();
    return noteData;
}
async function handleExpand(event) {
    console.log('expanded!!', event);
    const noteDiv = event.currentTarget;
    const noteData = await handleCollapse(event);
    noteDiv.classList.add('expanded');
    const childrenDiv = document.createElement('div');
    childrenDiv.className = 'children';
    childrenDiv.append(
        ...noteData.children.map(childUuid => createNoteDiv(childUuid))
    );
    noteDiv.append(childrenDiv);
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
    span.addEventListener('input', handleInput);
    div.append(img, span);
    return div;
}
async function handleInput(event) {
    const span = event.currentTarget;
    const noteDiv = span.closest('.note');
    const parentNoteDiv = noteDiv.parentNode.closest('.note');
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    const noteData = await db.upsert('notes', { uuid: uuid, content: span.textContent });
    if (event.key === "Enter") {
        event.preventDefault();
        span.blur();
        const targetNoteDiv = parentNoteDiv || noteDiv;
        const nextSibling = parentNoteDiv ? (event.shiftKey ? noteDiv : noteDiv.nextSibling) : noteDiv.querySelector('.children').firstChild;
        targetNoteDiv.querySelector('.children').insertBefore(createNoteDiv(crypto.randomUUID()), nextSibling);
        targetNoteDiv.dispatchEvent(customEvents.expand);
        // if (parentNoteDiv) {
        //     const nextSibling = event.shiftKey ? noteDiv : noteDiv.nextSibling;
        //     parentNoteDiv.querySelector('.children').insertBefore(createNoteDiv(uuid), nextSibling);
        //     parentNoteDiv.dispatchEvent(customEvents.expand);
        // } else {
        //     noteDiv.querySelector('.children').insertBefore(createNoteDiv(uuid), noteDiv.querySelector('.children').firstChild);
        //     noteDiv.dispatchEvent(customEvents.expand);
        // }
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
        // const prevSibling = noteDiv.previousElementSibling;
        // if (prevSibling) {
        //     prevSibling.dispatchEvent(customEvents.expand);
        // }
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
                // const nextSibling = noteDiv.nextSibling;
                // if (nextSibling) {
                //     nextSibling.dispatchEvent(customEvents.expand);
            // } while (noteDiv = noteDiv.parentNode.closest('.note'));
            } while (targetNoteDiv);
        }
        // const nextSibling = noteDiv.nextElementSibling;
        // if (nextSibling) {
        //     nextSibling.dispatchEvent(customEvents.expand);
        // }
    }
}

// IndexedDB wrapper class
class IDB {
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
    }
    async #eventWrapper(request, eventType = 'success') {
        return new Promise((resolve, reject) => {
            request.addEventListener(eventType, (event) => resolve(event.target.result));
            request.addEventListener('error', (event) => reject(event.target.error));
        });
    }
    async init(schemas) {
        this.schemas = schemas;
        try {
            const request = window.indexedDB.open(this.dbName, this.version);
            request.addEventListener('upgradeneeded', (event) => this.#handleUpgrade(event));
            this.db = await this.#eventWrapper(request, "success");
            console.log("Database opened:", this.db);
            return this.db;
        } catch (error) {
            console.error("Error opening database:", error);
        }
    }
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
    async add(storeName, data) {
        try {
            const request = this.db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .add(data);
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error adding data:", error);
            throw error;
        }
    }
    async put(storeName, data) {
        try {
            const request = this.db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .put(data);
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error putting data:", error);
            throw error;
        }
    }
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
                return await this.#eventWrapper(request, "success");
            } else {
                const request = objectStore.add(data);
                return await this.#eventWrapper(request, "success");
            }
        } catch (error) {
            console.error("Error upserting data:", error);
            throw error;
        }
    }
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
    async find(storeName, key, query) {
        try {
            const results = [];
            const request = this.db.transaction(storeName, "readonly")
                .objectStore(storeName)
                .openCursor();
            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (!cursor) resolve(results);
                    if (cursor.value[key].includes(query)) results.push(cursor.value);
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
async function init() {
    const url = new URL(location.href);
    const uuid = url.searchParams.get('uuid') || localStorage.getItem('home') || crypto.randomUUID();
    localStorage.setItem('home', uuid);
    url.searchParams.set('uuid', uuid);
    history.replaceState({}, '', url.toString());
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