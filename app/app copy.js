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
    async init(schemas) {
        if (IDB.db) return (this.db = IDB.db);
        this.schemas = schemas;
        const request = window.indexedDB.open(this.dbName, this.version);
        console.log('Opening database request created:', request);
        // request.onupgradeneeded = (event) => {
        //     this.db = event.target.result;
        //     Object.entries(this.schemas).forEach(([name, schema]) => {
        //         if (this.db.objectStoreNames.contains(name)) return;
        //         console.log(`Creating object store: ${name}`);
        //         const objectStore = this.db.createObjectStore(name, schema.options);
        //         schema.indexes.forEach((index) =>
        //             objectStore.createIndex(index.name, index.name, {
        //                 unique: index.unique,
        //             })
        //         );
        //     });
        //     console.log("Object stores created:", this.db.objectStoreNames);
        // };
        // return new Promise((resolve, reject) => {
        //     request.onsuccess = (event) => {
        //         this.db = event.target.result;
        //         console.log("Database opened successfully:", this.db);
        //         resolve(this.db);
        //     };
        //     request.onerror = (event) => {
        //         console.error("Error opening database:", event.target.error);
        //         reject(event.target.error);
        //     };
        // });
        const db = await this.#eventHandler(request, "onupgradeneeded");
        console.log("Database opened request upgraded:", db);
        schemas.forEach((schema) => {
            if (db.objectStoreNames.contains(schema.name)) return;
            console.log(`Creating object store: ${schema.name}`);
            const objectStore = db.createObjectStore(schema.name, schema.options);
            schema.indexes.forEach((index) =>
                objectStore.createIndex(index.name, index.name, {
                    unique: index.unique,
                })
            );
        });
        return this.db = await this.#eventHandler(request, "success");
    }
    handleUpgradeNeeded(event) {
        this.db = event.target.result;
        this.schemas.forEach((schema) => {
            if (this.db.objectStoreNames.contains(schema.name)) return;
            console.log(`Creating object store: ${schema.name}`);
            const objectStore = this.db.createObjectStore(schema.name, schema.options);
            schema.indexes.forEach((index) =>
                objectStore.createIndex(index.name, index.name, {
                    unique: index.unique,
                })
            );
        });
        console.log("Object stores created:", this.db.objectStoreNames);
    }
    handle
    #getObjectStore(storeName, mode = "readonly") {
        if (!this.db) throw new Error("Database not initialized");
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }
    async #eventHandler(request, eventType = 'onsuccess') {
        console.log(`Waiting for event: ${eventType}`);
        // request.addEventListener(eventType, (event) => resolve(event.target.result));
        // request.addEventListener("error", (event) => reject(event.target.error));
        return new Promise((resolve, reject) => {
            // request.addEventListener(eventType, (event) => resolve(event.target.result));
            // request.addEventListener("error", (event) => reject(event.target.error));
            // request[eventType] = (event) => console.log(resolve(event.target.result))
            // request[eventType] = (event) => {
            request.onsuccess = (event) => {
                console.log(`Event ${eventType} triggered successfully`);
                resolve(event.target.result);
            };
            request.onupgradeneeded = (event) => {
                console.log(`Event ${eventType} triggered on upgrade needed`);
                resolve(event.target.result);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
    async getByKey(storeName, key) {
        const objectStore = await this.#getObjectStore(storeName, "readonly");
        // return new Promise((resolve, reject) => {
        //     const request = objectStore.get(key);
        //     request.onsuccess = (event) => resolve(event.target.result);
        //     request.onerror = (event) => {
        //         console.error('Error getting data:', event.target.error);
        //         reject(event.target.error);
        //     };
        // });
        const request = objectStore.get(key);
        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Error getting data:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    async search(storeName, query) {
        const objectStore = await this.#getObjectStore(storeName, "readonly");
        return new Promise((resolve, reject) => {
            const results = [];
            const request = objectStore.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.content.includes(query)) {
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
    }
    async getAll(storeName) {
        const objectStore = await this.#getObjectStore(storeName, "readonly");
        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Error getting all data:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    async add(storeName, data) {
        const objectStore = await this.#getObjectStore(storeName, "readwrite");
        return new Promise((resolve, reject) => {
            const request = objectStore.add(data);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Error adding data:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    async put(storeName, data) {
        const objectStore = await this.#getObjectStore(storeName, "readwrite");
        return new Promise((resolve, reject) => {
            const request = objectStore.put(data);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Error putting data:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    async upsert(storeName, data) {
        const objectStore = await this.#getObjectStore(storeName, "readwrite");
        const getRequest = objectStore.get(data[objectStore.keyPath]);
        const existingData = await this.#eventHandler(getRequest);
        if (existingData) {
            const updatedData = { ...existingData, ...data };
            const request = objectStore.put(updatedData);
            return await this.#eventHandler(request);
        } else {
            const request = objectStore.add(data);
            return await this.#eventHandler(request);
        }
    }
    async delete(storeName, key) {
        const objectStore = await this.#getObjectStore(storeName, "readwrite");
        return new Promise((resolve, reject) => {
            const request = objectStore.delete(key);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Error deleting data:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    async clear(storeName) {
        const objectStore = await this.#getObjectStore(storeName, "readwrite");
        return new Promise((resolve, reject) => {
            const request = objectStore.clear();
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Error clearing data:", event.target.error);
                reject(event.target.error);
            };
        });
    }
}

const db = new IDB('divein', 1);
// const schemas = {
//     notes: {
//         options: { keyPath: 'uuid' },
//         indexes: [
//             { name: 'content', unique: false },
//             { name: 'children', unique: false },
//         ],
//     },
//     apiUrls: {
//         options: { keyPath: 'url' },
//         indexes: [
//             { name: 'url', unique: true },
//             { name: 'data', unique: false },
//         ],
//     }
// };
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