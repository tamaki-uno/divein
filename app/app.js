'use strict';

function route() {
    const url = new URL(window.location);
    initEventListeners(url.hash === '#settings');
    let uuid;
    if (url.searchParams.has('uuid')) {
        uuid = url.searchParams.get('uuid');
        init(uuid);
    } else {
        if (localStorage.getItem('homeUuid')) {
            uuid = localStorage.getItem('homeUuid');
        } else {
            uuid = crypto.randomUUID();
            localStorage.setItem('homeUuid', uuid);
        }
        url.searchParams.set('uuid', uuid);
        window.history.replaceState({}, '', url.toString());
        init(uuid, true);
    }
}

async function init(uuid, isHome = false) {
    console.log('Initializing app with UUID:', uuid);
    const note = new Note(uuid, 30, true, isHome);
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
    // if (isSettings) settings.toggle();
    document.getElementById('home').addEventListener('click', home);
    document.getElementById('settings').addEventListener('click', () => settings.toggle());
    document.getElementById('sync').addEventListener('click', syncWithApis);
    document.getElementById('download').addEventListener('click', download);
    document.getElementById('upload').addEventListener('click', upload);
    return;
}

class Note {
    constructor(uuid, fontSize = 30, isExpanded = false, isHome = false) {
        // console.log(`Creating note with UUID: ${uuid}, fontSize: ${fontSize}, isExpanded: ${isExpanded}`);
        this.uuid = uuid;
        this.fontSize = fontSize;
        this.isExpanded = isExpanded;
        this.isHome = isHome;
    }
    async init() {
        await this.get();
        return this.initContainer();
    }
    async get() {
        const existingNoteData = await db.getByKey('notes', this.uuid);
        if (existingNoteData) {
            this.content = existingNoteData.content;
            this.children = existingNoteData.children;
            this.createdAt = existingNoteData.createdAt;
            this.updatedAt = existingNoteData.updatedAt;
            return;
        } else {
            const noteData = {
                uuid: this.uuid,
                content: this.content = this.isHome ? 'home' : '',
                children: this.children = [],
                createdAt: this.createdAt = new Date().toISOString(),
                updatedAt: this.updatedAt = new Date().toISOString()
            };
            await db.add('notes', noteData);
            return;
        }
    }
    async save() {
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
        this.container.id = this.uuid;
        this.container.className = 'note-container radius hover' + (this.isExpanded ? ' expanded' : '');
        this.container.style.fontSize = `${this.fontSize}px`;
        this.container.addEventListener('dblclick', (event) => {
            console.log('Note double-clicked:', this.uuid);
            event.preventDefault();
            event.stopPropagation();
            location.search = `?uuid=${this.uuid}`;
            route();
        });
        this.container.appendChild(this.initContent());
        this.container.appendChild(this.initChildren());
        return this.container;
    }
    initContent() {
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'note-content radius hover';
        this.contentDiv.appendChild(this.initToggleIcon());
        this.contentDiv.appendChild(this.initContentSpan());
        this.contentDiv.appendChild(this.initMenu());
        this.contentDiv.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            console.log('Context menu opened for note:', this.uuid);
            this.menu.style.display = 'block';
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
    toggle() {
        console.log(`Toggling note expansion to ${!this.isExpanded} for UUID: ${this.uuid}`);
        this.isExpanded = !this.isExpanded;
        this.container.classList.toggle('expanded', this.isExpanded);
        this.toggleIcon.classList.toggle('expanded', this.isExpanded);
    }
    initContentSpan() {
        this.contentSpan = document.createElement('span');
        this.contentSpan.className = 'note-content-span radius hover';
        this.contentSpan.setAttribute('contenteditable', 'true');
        this.suggestion = new Suggestion(this);
        this.contentSpan.appendChild(this.suggestion.div);
        this.contentSpan.addEventListener('focus', () => {
            console.log('Content span focused:', this.uuid);
            this.contentSpan.innerHTML = this.contentSpan.textContent; // Preserve formatting
        });
        this.contentSpan.addEventListener('input', () => {
            this.suggestion.update(this.contentSpan.textContent);
        });
        this.contentSpan.addEventListener('blur', () => {
            if (this.contentSpan.textContent.trim() === this.content) return;
            this.content = this.contentSpan.textContent.trim();
            console.log('Content updated:', this.content);
            this.renderContent();
            this.save();
        });
        this.contentSpan.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.contentSpan.blur();
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
        this.renderContent();
        return this.contentSpan;
    }
    renderContent() {
        if (this.content.startsWith('http://') || this.content.startsWith('https://')) {
            const link = document.createElement('a');
            link.href = this.content;
            link.textContent = this.content;
            link.target = '_blank';
            this.contentSpan.innerHTML = '';
            this.contentSpan.appendChild(link);
        } else if (this.content.startsWith('\\') || this.content.startsWith('>')) {
            this.contentSpan.innerHTML = '';
            this.contentSpan.appendChild(document.createTextNode(this.content));
        } else if (this.content.startsWith('![')) {
            const img = document.createElement('img');
            img.src = this.content.slice(2, -1);
            img.alt = this.content.slice(2, -1);
            img.className = 'note-image';
            this.contentSpan.innerHTML = '';
            this.contentSpan.appendChild(img);
        } else {
            this.contentSpan.innerHTML = '';
            this.contentSpan.appendChild(document.createTextNode(this.content));
        }
    }
    initMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'note-menu radius hover';
        this.menu.style.display = 'none';
        // this.menu.appendChild(this.initDeleteButton());
        // this.menu.appendChild(this.initEditButton());
        // this.menu.appendChild(this.initSyncButton());
        // this.menu.appendChild(this.initDownloadButton());
        return this.menu;
    }
    initChildren() {
        this.childrenDiv = document.createElement('div');
        this.childrenDiv.className = 'note-children';
        this.renderChildren();
        return this.childrenDiv;
    }
    async renderChildren() {
        this.childrenDiv.innerHTML = '';
        for (const childUuid of this.children) {
            const childNote = new Note(childUuid, this.fontSize * 0.8);
            this.childrenDiv.appendChild(await childNote.init());
        }
        // this.childrenDiv.appendChild(this.initAddChildIcon());
        // await Promise.all(this.children.map(async (childUuid) => {
        //     const childNote = new Note(childUuid, this.fontSize * 0.8);
        //     const childElement = await childNote.init();
        //     this.childrenDiv.appendChild(childElement);
        // })).then(() => {
        //     this.childrenDiv.appendChild(this.initAddChildIcon());
        //     console.log('Children rendered:', this.children);
        // }).catch(error => {
        //     console.error('Error rendering children:', error);
        // });
    }
    initAddChildIcon() {
        this.addChildIcon = document.createElement('img');
        this.addChildIcon.src = 'icons/add.svg';
        this.addChildIcon.className = 'note-add-child-icon button hover';
        this.addChildIcon.addEventListener('click', () => this.addChild());
        return this.addChildIcon;
    }
    addChild() {
        console.log(`Adding child note to ${this.uuid}`);
        const childUuid = crypto.randomUUID();
        this.children.push(childUuid);
        this.renderChildren();
        this.save()
            .then(() => console.log('Child note added:', childUuid))
            .catch(error => console.error('Error adding child note:', error));
    }
}

class Suggestion {
    constructor(note) {
        console.log('Creating suggestion for note:', note);
        this.note = note;
        this.result = [];
        this.renderSuggestion();
    }
    async update(content) {
        console.log('Updating suggestion with content:', content);
        this.result = await db.search('notes', content.trim());
        this.renderSuggestion();
    }
    renderSuggestion() {
        this.div = document.createElement('div');
        this.div.className = 'suggestion';
        this.div.style.display = this.result.length > 0 ? 'block' : 'none';
        for (const note of this.result) {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'suggestion-note';
            noteDiv.textContent = note.content;
            noteDiv.addEventListener('click', () => {
                console.log('Suggestion clicked:', note.uuid);
                this.note.uuid = note.uuid;
                this.note.renderContent();
            });
            this.div.appendChild(noteDiv);
        }
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
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
        const request = window.indexedDB.open(dbName, version);
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
    createObjectStore(storeName, options) {
        const transaction = this.db.transaction(this.db.objectStoreNames, 'versionchange');
        const objectStore = transaction.objectStore(storeName);
        if (!objectStore) {
            console.log(`Creating object store: ${storeName}`);
            const newObjectStore = this.db.createObjectStore(storeName, options);
        }
    }
    getObjectStore(storeName, mode = 'readonly') {
        if (!this.db) throw new Error('Database not initialized');
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }
    async getByKey(storeName, key) {
        const objectStore = await this.getObjectStore(storeName, 'readonly');
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
    async clear(storeName) {
        const objectStore = await this.getObjectStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = objectStore.clear();
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error('Error clearing data:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}

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
        title.textContent = 'Settings';
        this.div.appendChild(title);
        this.div.appendChild(this.initCloseButton());
        const urlsTitle = document.createElement('h3');
        urlsTitle.textContent = 'API URLs';
        this.div.appendChild(urlsTitle);
        this.div.appendChild(this.initUrlList());
        this.div.appendChild(document.createElement('h3')).textContent = 'Theme';
        this.div.appendChild(this.initThemeButton());
        return this.div;
    }
    initCloseButton() {
        this.closeButton = document.createElement('img');
        this.closeButton.src = 'icons/cancel.svg';
        this.closeButton.className = 'button hover';
        this.closeButton.style.fontSize = '30px';
        this.closeButton.addEventListener('click', () => this.toggle());
        return this.closeButton;
    }
    initThemeButton() {
        if (localStorage.getItem('theme')) localStorage.setItem('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.themeButton = document.createElement('img');
        this.themeButton.src = `icons/${localStorage.getItem('theme') === 'dark' ? 'light' : 'dark'}.svg`;
        this.themeButton.className = 'button hover';
        this.themeButton.style.fontSize = '30px';
        this.themeButton.addEventListener('click', () => this.toggleTheme());
        return this.themeButton;
    }
    toggleTheme() {
        this.themeButton.src = `icons/${localStorage.getItem('theme')}.svg`;
        localStorage.setItem('theme', localStorage.getItem('theme') === 'dark' ? 'light' : 'dark');
        console.log(`Theme changed to: ${localStorage.getItem('theme')}`);
        // document.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
        document.documentElement.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
    initUrlList() {
        this.urlList = document.createElement('div');
        this.urlList.className = 'api-url-list';
        this.apiUrls = JSON.parse(localStorage.getItem('apiUrls')) || [];
        this.apiUrls.forEach(url => {
            this.urlList.appendChild(this.initUrl(url));
        });
        this.urlList.appendChild(this.initAddButton());
        return this.urlList;
    }
    initUrl(url) {
        const urlDiv = document.createElement('div');
        urlDiv.className = 'api-url';
        urlDiv.appendChild(document.createElement('span')).textContent = url;
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
    const localNotes = await db.getAll('notes');
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
                await db.put('notes', remoteNote);
            }
        }));
    } catch (error) {
        console.error(error);
    } finally {
        console.log('Sync completed');
    }
}
function home() {
    console.log('Home button clicked');
    const homeUuid = localStorage.getItem('homeUuid');
    if (homeUuid) {
        console.log('Navigating to home UUID:', homeUuid);
        location.search = `?uuid=${homeUuid}`;
        route();
    } else {
        location.search = '';
        route();
    }
}
async function download() {
    console.log('Downloading notes...');
    const notes = await db.getAll('notes');
    if (notes.length === 0) return alert('No notes to download.');
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
async function upload() {
    console.log('Uploading notes...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.type !== 'application/json') {
            return alert('Please upload a valid JSON file.');
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const notes = JSON.parse(e.target.result);
                if (!Array.isArray(notes)) {
                    return alert('Invalid file format. Please upload a valid JSON file containing an array of notes.');
                }
                await Promise.all(notes.map(async (note) => {
                    if (!note.uuid || !note.content || !note.createdAt || !note.updatedAt) {
                        return alert('Invalid note format in uploaded file.');
                    }
                    const existingNote = await db.getByKey('notes', note.uuid);
                    if (existingNote) {
                        if (new Date(existingNote.updatedAt) < new Date(note.updatedAt)) {
                            await db.put('notes', note);
                        }
                    } else {
                        await db.add('notes', note);
                    }
                }));
                alert('Notes uploaded successfully.');
                location.reload();
            } catch (error) {
                console.error('Error uploading notes:', error);
                alert('Failed to upload notes. Please ensure the file is a valid JSON file.');
            }
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('Failed to read file. Please try again.');
        };
        reader.readAsText(file);
    });
    input.click();
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

const defaultApiUrl = 'https://api.example.com';

// const db = new IDB(objectStores);
// db.init(objectStores)
//     // .then(() => console.log('Database initialized'))
//     .then(() => {
//         console.log('Database initialized');
//         route();
//     })
//     .catch(error => console.error('Error initializing database:', error));
// addEventListener('DOMContentLoaded', route);
const db = new IDB();
// localStorage.setItem('apiUrls', JSON.stringify(defaultApiUrls));
addApiUrl(defaultApiUrl);
db.init(objectStores)
    .then(() => {
        console.log('Database initialized');
        route();
    })
    .catch(error => console.error('Error initializing database:', error));

addEventListener('error', (event) => {
    console.error('Error event:', event);
    setTimeout(() => location.reload(), 1000);
});

addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    setTimeout(() => location.reload(), 1000);
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Prevent infinite reload loops
    const lastReload = localStorage.getItem('lastErrorReload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload) > 5000) {
        localStorage.setItem('lastErrorReload', now.toString());
        setTimeout(() => location.reload(), 2000);
    }
});

// IndexedDB specific error handling
const originalConsoleError = console.error;
console.error = function(...args) {
    originalConsoleError.apply(console, args);
    
    // Check for database-related errors
    if (args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('database') || arg.includes('IndexedDB') || arg.includes('IDB'))
    )) {
        console.warn('Database error detected, attempting recovery...');
        // Clear potentially corrupted database
        if ('indexedDB' in window) {
            indexedDB.deleteDatabase('divein');
            setTimeout(() => location.reload(), 1000);
        }
    }
};

// Wrap async functions with error handling
const originalRoute = route;
window.route = async function() {
    try {
        await originalRoute();
    } catch (error) {
        console.error('Route error:', error);
        document.getElementById('loading').innerHTML = `
            <div style="color: red; text-align: center;">
                <h3>Error loading application</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()">Reload</button>
            </div>
        `;
    }
};