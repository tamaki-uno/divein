'use strict';

function route() {
    const url = new URL(window.location);
    initEventListeners(url.hash === '#settings');
    init(url.searchParams.get('uuid') || crypto.randomUUID());
}

async function init(uuid) {
    console.log('Initializing app with UUID:', uuid);
    const note = new Note(uuid, 30, true);
    document.querySelector('main').appendChild(await note.init());
    document.getElementById('loading').style.display = 'none';
    return;
}

function initEventListeners(isSettings) {
    console.log('Initializing event listeners... (isSettings:', isSettings, ')');
    addEventListener('hashchange', route);
    addEventListener('popstate', route);
    addEventListener('DOMContentLoaded', route);
    const settings = new Settings(isSettings);
    if (isSettings) settings.toggle();
    document.getElementById('settings').addEventListener('click', () => settings.toggle());
    document.getElementById('sync').addEventListener('click', syncWithApis);
    document.getElementById('download').addEventListener('click', download);
    return;
}

class Note {
    constructor(uuid, fontSize = 30, isExpanded = false) {
        console.log(`Creating note with UUID: ${uuid}, fontSize: ${fontSize}, isExpanded: ${isExpanded}`);
        this.uuid = uuid;
        this.fontSize = fontSize;
        this.isExpanded = isExpanded;
    }
    async init() {
        await this.getNote();
        return this.initContainer();
    }
    async getNote() {
        // const existingNoteData = await getNote(this.uuid);
        const existingNoteData = await db.getByKey('notes', this.uuid);
        console.log('Note data:', existingNoteData);
        if (existingNoteData) {
            console.log('Note found in database:', existingNoteData);
            this.content = existingNoteData.content;
            this.children = existingNoteData.children;
            this.createdAt = existingNoteData.createdAt;
            this.updatedAt = existingNoteData.updatedAt;
            return;
        } else {
            console.log('Note not found in database, creating new note');
            const noteData = {
                uuid: this.uuid,
                content: this.content = '',
                children: this.children = [],
                createdAt: this.createdAt = new Date().toISOString(),
                updatedAt: this.updatedAt = new Date().toISOString()
            };
            // await setNote(noteData);
            await db.add('notes', noteData);
            console.log('New note created and saved:', noteData);
            return;
        }
    }
    async save() {
        console.log('Saving note:', this);
        this.updatedAt = new Date().toISOString();
        const noteData = {
            uuid: this.uuid,
            content: this.content,
            children: this.children,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
        // await setNote(noteData);
        await db.put('notes', noteData);
        console.log('Note saved:', noteData);
    }
    initContainer() {
        this.container = document.createElement('div');
        this.container.className = 'note-container radius';
        this.container.id = `note-${this.uuid}`;
        this.container.style.fontSize = `${this.fontSize}px`;
        this.container.appendChild(this.initContent());
        this.container.appendChild(this.initChildren());
        return this.container;
    }
    initContent() {
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'note-content radius';
        this.contentDiv.appendChild(this.initToggleIcon());
        this.contentDiv.appendChild(document.createTextNode(this.content));
        this.contentDiv.setAttribute('contenteditable', 'true');
        this.contentDiv.addEventListener('input', () => {});
        this.contentDiv.addEventListener('change', () => {
            this.content = this.contentDiv.textContent.trim();
            this.save()
                .then(() => console.log('Content saved:', this.content))
                .catch(error => console.error('Error saving content:', error));
        });
        this.contentDiv.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.contentDiv.blur();
                console.log('Enter pressed');
                if (event.shiftKey) {
                    console.log('Shift + Enter pressed');
                } else {
                    console.log('Enter pressed without Shift');
                }
            } else if (event.key === 'Tab') {
                event.preventDefault();
                console.log('Tab pressed');
                if (event.shiftKey) {
                    console.log('Shift + Tab pressed');
                } else {
                    console.log('Tab pressed without Shift');
                }
            }
        });
                
        return this.contentDiv;
    }
    initToggleIcon() {
        this.toggleIcon = document.createElement('img');
        this.toggleIcon.src = 'icons/toggle.svg';
        this.toggleIcon.className = 'note-toggle-icon button hover';
        this.toggleIcon.addEventListener('click', () => this.toggle());
        return this.toggleIcon;
    }
    initChildren() {
        this.childrenDiv = document.createElement('div');
        this.childrenDiv.className = 'note-children';
        this.children.forEach(childUuid => {
            const note = new Note(childUuid, this.childrenDiv, this.fontSize * 0.8);
        });
        this.childrenDiv.appendChild(this.initAddChildIcon());
        return this.childrenDiv;
    }
    initAddChildIcon() {
        this.addChildIcon = document.createElement('img');
        this.addChildIcon.src = 'icons/add.svg';
        this.addChildIcon.className = 'note-add-child-icon button hover';
        this.addChildIcon.addEventListener('click', () => this.addChild());
        return this.addChildIcon;
    }
    render() {
        this.contentDiv.textContent = this.content;
    }
    toggle() {
        this.isExpanded = !this.isExpanded;
        this.container.classList.toggle('open', this.isExpanded);
    }
    addChild() {
        const childUuid = crypto.randomUUID();
        this.children.push(childUuid);
        const childNote = new Note(childUuid, this.childrenDiv, this.fontSize * 0.8);
        this.save()
            .then(() => console.log('Child note added:', childUuid))
            .catch(error => console.error('Error adding child note:', error));
    }
}

class IDB {
    static db = null;
    static schemas = {
        notes: {
            options: {
                keyPath: 'uuid',
                autoIncrement: false
            },
            indexes: [
                { name: 'uuid', unique: true },
                { name: 'content', unique: false },
                { name: 'createdAt', unique: false },
                { name: 'updatedAt', unique: false }
            ]
        }
    };
    constructor(schemas) {
        console.log('Initializing IDB with schemas:', schemas);
        this.schemas = { ...IDB.schemas, ...schemas };
    }
    async init(schemas) {
        if (IDB.db) return this.db = IDB.db;
        this.schemas = { ...schemas };
        const request = window.indexedDB.open('divein', 1);
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            Object.entries(this.schemas).forEach(([name, schema]) => {
                if (!this.db.objectStoreNames.contains(name)) {
                    console.log(`Creating object store: ${name}`);
                    const objectStore = this.db.createObjectStore(name, schema.options);
                    schema.indexes.forEach(index => objectStore.createIndex(index.name, index.name, { unique: index.unique }));
                }
            });
            console.log('Object stores created:', this.db.objectStoreNames);
        }
        request.onerror = (event) => console.error('Database error:', event.target.error);
        request.onsuccess = (event) => this.db = event.target.result;
        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database opened successfully:', this.db);
                resolve(this.db);
            };
            request.onerror = (event) => {
                console.error('Error opening database:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    async getObjectStore(storeName, mode = 'readonly') {
        if (!this.db) throw new Error('Database not initialized');
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }
    async getByKey(storeName, key) {
        const objectStore = await this.getObjectStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = objectStore.get(key);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error('Error getting data:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    async search(storeName, query) {
        const objectStore = await this.getObjectStore(storeName, 'readonly');
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
                console.error('Error searching data:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    async getAll(storeName) {
        const objectStore = await this.getObjectStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error('Error getting all data:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    async add(storeName, data) {
        const objectStore = await this.getObjectStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = objectStore.add(data);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error('Error adding data:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    async put(storeName, data) {
        const objectStore = await this.getObjectStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = objectStore.put(data);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error('Error putting data:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    async delete(storeName, key) {
        const objectStore = await this.getObjectStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = objectStore.delete(key);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error('Error deleting data:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}

// const schemas = {
//     notes: {
//         options: {
//             keyPath: 'uuid',
//             autoIncrement: false
//         },
//         indexes: [
//             { name: 'uuid', unique: true },
//             { name: 'content', unique: false },
//             { name: 'children', unique: false },
//             { name: 'createdAt', unique: false },
//             { name: 'updatedAt', unique: false }
//         ]
//     }
// };

// async function getIDB() {
//     return new Promise((resolve, reject) => {
//     const request = window.indexedDB.open('divein', 1);
//     request.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         for (const [storeName, options] of Object.entries(objectStores)) {
//             if (!db.objectStoreNames.contains(storeName)) {
//                 // console.log(`Creating object store: ${storeName}, options:`, options);
//                 console.log(`Creating object store: ${storeName}`);
//                 // db.createObjectStore(storeName, options);
//                 const objectStore = db.createObjectStore(storeName, { keyPath: options.keyPath, autoIncrement: options.autoIncrement });
//                 options.indexes.forEach(index => {
//                     objectStore.createIndex(index.name, index.name, { unique: index.unique });
//                 });
//             }
//         }
//     }
//     request.onerror = (event) => {
//         console.error('Database error:', event.target.error);
//         reject(event.target.error);
//     }
//     request.onsuccess = (event) => {
//         const db = event.target.result;
//         resolve(db);
//         // return db;
//     };
//     });
// }

// async function DELETEIDB() {
//     const request = window.indexedDB.deleteDatabase('divein');
//     request.onsuccess = (event) => {
//         console.log('Database deleted successfully');
//     };
//     request.onerror = (event) => {
//         console.error('Error deleting database:', event.target.error);
//     };
// }

// async function getNote(uuid) {
//     const db = await getIDB();
//     const transaction = db.transaction('notes', 'readonly');
//     const objectStore = transaction.objectStore('notes');
//     return await new Promise((resolve, reject) => {
//         const request = objectStore.get(uuid);
//         request.onsuccess = (event) => {
//             resolve(event.target.result);
//         };
//         request.onerror = (event_1) => {
//             console.error('Error getting note:', event_1.target.error);
//             reject(event_1.target.error);
//         };
//     });
// }

// async function getAllNotes() {
//     const db = await getIDB();
//     const transaction = db.transaction('notes', 'readonly');
//     const objectStore = transaction.objectStore('notes');
//     return await new Promise((resolve, reject) => {
//         const request = objectStore.getAll();
//         request.onsuccess = (event) => {
//             // resolve(event.target.result);
//             const notes = event.target.result;
//             resolve(notes);
//         };
//         request.onerror = (event_1) => {
//             console.error('Error getting all notes:', event_1.target.error);
//             reject(event_1.target.error);
//         };
//     });
// }

// async function setNote(note) {
//     const db = await getIDB();
//     const transaction = db.transaction('notes', 'readwrite');
//     const objectStore = transaction.objectStore('notes');
//     note.updatedAt = new Date().toISOString();
//     return await new Promise((resolve, reject) => {
//         const request = objectStore.put(note);
//         request.onsuccess = (event) => {
//             resolve(event.target.result);
//         };
//         request.onerror = (event_1) => {
//             console.error('Error setting note:', event_1.target.error);
//             reject(event_1.target.error);
//         };
//     });
// }

class Settings {
    constructor(show = false) {
        console.log(`Initializing Settings (show: ${show})`);
        if (document.getElementById('settingsDiv')) {
            this.div = document.getElementById('settingsDiv');
        } else {
            document.body.appendChild(this.initDiv());
        }
        if (show) this.toggle();
    }
    initDiv() {
        this.div = document.createElement('div');
        this.div.className = 'settingsDiv radius hover';
        this.div.style.display = 'none';
        this.div.id = 'settingsDiv';
        const title = document.createElement('h2');
        title.textContent = 'Urls';
        this.div.appendChild(title);
        this.div.appendChild(this.initCloseButton());
        this.div.appendChild(this.initUrlList());
        return this.div;
    }
    initCloseButton() {
        this.closeButton = document.createElement('img');
        this.closeButton.src = 'icons/cancel.svg';
        this.closeButton.className = 'button hover';
        this.closeButton.style.fontSize = '30px';
        this.closeButton.addEventListener('click', this.toggle.bind(this));
        return this.closeButton;
    }
    initUrlList() {
        this.urlList = document.createElement('div');
        this.urlList.className = 'api-url-list';
        this.apiUrls = getApiUrls();
        this.apiUrls.forEach(url => {
            this.urlList.appendChild(this.initUrl(url));
        });
        this.urlList.appendChild(this.initAddButton());
        return this.urlList;
    }
    initUrl(url) {
        const urlDiv = document.createElement('div');
        urlDiv.className = 'api-url';
        urlDiv.textContent = url;
        const removeButton = document.createElement('img');
        removeButton.src = 'icons/cancel.svg';
        removeButton.className = 'button hover';
        removeButton.addEventListener('click', () => {
            removeApiUrl(url);
            urlDiv.remove();
        });
        urlDiv.appendChild(removeButton);
        return urlDiv;
    }
    initAddButton() {
        const addUrl = document.createElement('img');
        addUrl.src = 'icons/add.svg';
        addUrl.className = 'button hover';
        addUrl.addEventListener('click', () => {
            const url = prompt('Enter API URL:');
            if (url && this.validateAndSaveUrl(url)) {
                this.urlList.appendChild(this.initUrl(url));
            }
        });
        return addUrl;
    }

    validateAndSaveUrl(url) {
        try {
            new URL(url);
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                alert('Please enter a valid URL starting with http:// or https://');
                return false;
            }
            addApiUrl(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    validateAndSaveUrl(url) {
        try {
            new URL(url);
            addApiUrl(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    toggle() {
        if (this.div.style.display === 'block') {
            this.div.style.display = 'none';
            const url = new URL(window.location);
            url.hash = '';
            window.history.replaceState({}, '', url.toString());
        } else {
            this.div.style.display = 'block';
            const url = new URL(window.location);
            url.hash = '#settings';
            window.history.replaceState({}, '', url.toString());
        }
    }
}


function getApiUrls() {
    const urls = JSON.parse(localStorage.getItem('apiUrls')) || [];
    return urls;
}

function addApiUrl(url) {
    const urls = getApiUrls();
    if (!urls.includes(url)) {
        urls.push(url);
        localStorage.setItem('apiUrls', JSON.stringify(urls));
    }
}

function removeApiUrl(url) {
    let urls = getApiUrls();
    urls = urls.filter(existingUrl => existingUrl !== url);
    localStorage.setItem('apiUrls', JSON.stringify(urls));
}

async function syncWithApis() {
    const urls = getApiUrls();
    if (urls.length === 0) return alert('No API URLs configured. Please add an API URL in settings.');
    console.log(`Syncing with API at ${urls}`);
    const localNotes = await getAllNotes();
    try {
        const remoteNotesArray = await Promise.all(urls.map(async url => {
            const response = await fetch(`${url}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(localNotes)
            });
            if (!response.ok) {
                throw new Error(`Failed to sync with ${url}: ${response.statusText}`);
            }
            const remoteNotes = JSON.parse(await response.text());
            return remoteNotes;
        }));
        const remoteNotes = remoteNotesArray.flat();
        await Promise.all(remoteNotes.map(async (remoteNote) => {
            const localNote = localNotes.find(note => note.uuid === remoteNote.uuid);
            if (!localNote || new Date(localNote.updatedAt) < new Date(remoteNote.updatedAt)) {
                await setNote(remoteNote);
            }
        }));
    } catch (error) {
        console.error(error);
    } finally {
        console.log('Sync completed');
    }
}

async function download() {
    console.log('Downloading notes...');
    const notes = await getAllNotes();
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}








const objectStores = {
    notes: {
        options: {
            keyPath: 'uuid',
            autoIncrement: false
        },
        indexes: [
            { name: 'uuid', unique: true },
            { name: 'content', unique: false },
            { name: 'createdAt', unique: false },
            { name: 'updatedAt', unique: false }
        ]
    }
};
const db = new IDB(objectStores);
db.init(objectStores)
    // .then(() => console.log('Database initialized'))
    .then(() => {
        console.log('Database initialized');
        route();
    })
    .catch(error => console.error('Error initializing database:', error));
// addEventListener('DOMContentLoaded', route);