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
    const noteData = await db.getByKey('notes', uuid) || {
        uuid: uuid,
        content: 'home',
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    noteDiv.querySelector('.content > span').textContent = noteData.content;
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
        const noteDiv = event.currentTarget.closest('.note');
        const eventType = noteDiv.classList.contains('expanded') ? 'collapse' : 'expand';
        noteDiv.dispatchEvent(customEvents[eventType]);
    });
    const span = document.createElement('span');
    span.setAttribute('contenteditable', 'true');
    span.addEventListener('input', handleInput);
    div.append(img, span);
    return div;
}
async function handleInput(event) {
    const span = event.currentTarget;
    const content = span.textContent.trim();
    const noteDiv = span.closest('.note');
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    if (content) {
        await db.update('notes', {
            uuid: uuid,
            content: content,
            updatedAt: new Date().toISOString(),
        });
    } else {
        await db.delete('notes', uuid);
        noteDiv.remove();
    }
}

// IndexedDB wrapper class
class IDB {
    static db = null;
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
        if (IDB.db) return (this.db = IDB.db);
        this.schemas = schemas;
        const request = window.indexedDB.open(this.dbName, this.version);
        console.log('Opening database request created:', request);
        request.addEventListener('upgradeneeded', (event) => this.#handleUpgrade(event));
        try {
            this.db = await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error opening database:", error);
        }
        console.log("Object stores created:", this.db.objectStoreNames);
        return this.db;
    }
    #handleUpgrade(event) {
        const db = event.target.result;
        console.log("Database upgrade needed:", db);
        this.schemas.forEach((schema) => {
            if (db.objectStoreNames.contains(schema.name)) return;
            console.log(`Creating object store: ${schema.name}`);
            const objectStore = db.createObjectStore(schema.name, schema.options);
            schema.indexes.forEach((index) =>
                objectStore.createIndex(index.name, index.name, {
                    unique: index.unique,
                })
            );
        });
        console.log("Object stores created:", db.objectStoreNames);
    }
    async add(storeName, data) {
        try {
            const transaction = this.db.transaction(storeName, "readwrite");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.add(data);
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error adding data:", error);
            throw error;
        }
    }
    async put(storeName, data) {
        try {
            const transaction = this.db.transaction(storeName, "readwrite");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.put(data);
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error putting data:", error);
            throw error;
        }
    }
    async upsert(storeName, data) {
        try {
            const transaction = this.db.transaction(storeName, "readwrite");
            const objectStore = transaction.objectStore(storeName);
            const getRequest = objectStore.get(data[objectStore.keyPath]);
            const existingData = await this.#eventWrapper(getRequest, "success");
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
    async getByKey(storeName, key) {
        try {
            const transaction = this.db.transaction(storeName, "readonly");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.get(key);
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
            const transaction = this.db.transaction(storeName, "readonly");
            const objectStore = transaction.objectStore(storeName);
            const results = [];
            const request = objectStore.openCursor();
            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (cursor.value[key].includes(query)) {
                            results.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
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
            const transaction = this.db.transaction(storeName, "readwrite");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.delete(key);
            return await this.#eventWrapper(request, "success");
        } catch (error) {
            console.error("Error deleting data:", error);
            throw error;
        }
    }
    async clear(storeName) {
        try {
            const transaction = this.db.transaction(storeName, "readwrite");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.clear();
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
    await Promise.all([
        db.init(schemas),
        new Promise((resolve) => addEventListener('DOMContentLoaded', resolve))
    ]);
    body.className = localStorage.getItem('theme') || matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    main.innerHTML = '';
    main.append(await createNoteDiv(uuid));
}

init();