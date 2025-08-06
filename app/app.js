'use strict';

class Note {
    constructor(uuid, parentNote, fontSize = 30, isExpanded = false) {
        // console.log(`Creating note with UUID: ${uuid}, fontSize: ${fontSize}, isExpanded: ${isExpanded}`);
        this.uuid = uuid;
        this.parentNote = parentNote;
        this.fontSize = fontSize;
        this.isExpanded = isExpanded;
        this.childNotes = [];
    }
    async init() {
        const noteData = await this.get();
        this.content = noteData.content;
        this.children = noteData.children.map(childUuid => new Note(childUuid, this, this.fontSize * 0.8, false));
        this.createdAt = noteData.createdAt;
        this.updatedAt = noteData.updatedAt;
        this.save();
        return this.initContainer();
    }
    async get() {
        const defaultNoteData = {
            uuid: this.uuid,
            content: this.parentNote ? '' : 'HOME',
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return await db.getByKey('notes', this.uuid) || defaultNoteData;
    }
    async save() {
        const noteData = {
            uuid: this.uuid,
            content: this.content,
            children: this.children.map(child => child.uuid),
            createdAt: this.createdAt,
            updatedAt: new Date().toISOString()
        };
        const existingNote = await db.getByKey('notes', this.uuid);
        const changed = !existingNote || existingNote.content !== noteData.content || existingNote.children !== noteData.children;
        if (changed) {
            await db.put('notes', noteData);
            console.log('Note saved:', noteData);
        }
    }
    initContainer() {
        this.container = document.createElement('div');
        this.container.id = this.uuid;
        this.container.className = 'radius flex-column' + (this.isExpanded ? ' expanded' : '');
        this.container.style.fontSize = `${this.fontSize}px`;
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';
        this.container.style.backgroundColor = 'var(--sub-background)';
        this.container.style.padding = '0.2em';
        this.container.style.margin = '0.2em';
        this.container.style.height = this.isExpanded ? 'auto' : 'fit-content';
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
        this.contentDiv.className = 'radius flex-row';
        this.contentDiv.style.position = 'relative';
        this.contentDiv.style.padding = '0.2em';
        this.contentDiv.style.backgroundColor = 'var(--main-background)';
        this.contentDiv.appendChild(this.initToggleIcon());
        this.contentDiv.appendChild(this.initContentSpan());
        this.menu = new Menu(this);
        this.contentDiv.appendChild(this.menu.init());
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
        this.toggleIcon.className = 'note-toggle-icon icon button hover';
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
            // console.log('Content span focused:', this.uuid);
            this.contentSpan.innerHTML = this.contentSpan.textContent; // Preserve formatting
        });
        this.contentSpan.addEventListener('input', () => {
            this.suggestion.update(this.contentSpan.textContent);
            this.content = this.contentSpan.textContent.trim();
            this.save();
        });
        // this.contentSpan.addEventListener('blur', () => {
        //     if (this.contentSpan.textContent.trim() === this.content) return;
        //     this.content = this.contentSpan.textContent.trim();
        //     console.log('Content updated:', this.content);
        //     this.renderContent();
        //     this.save();
        // });
        this.contentSpan.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.contentSpan.blur();
                this.save();
                if (event.shiftKey) {
                    console.log('Shift + Enter pressed');
                } else {
                    console.log('Enter pressed without Shift');
                    const newNoteUuid = crypto.randomUUID();
                    this.parentNote ? this.parentNote.addChild(newNoteUuid, this.uuid) : this.addChild(newNoteUuid);
                }
            } else if (event.key === 'Tab') {
                event.preventDefault();
                this.save();
                if (event.shiftKey) {
                    console.log('Shift + Tab pressed');
                } else {
                    console.log('Tab pressed without Shift');
                    if (this.parentNote) {
                        const index = this.parentNote.children.indexOf(this);
                        this.moveTo(this.parentNote.children[index - 1].uuid);
                    }
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
    getRelativeSet(n=1, noteSet = new Set()) {
        // n --;
        noteSet.add(this);
        if (this.parentNote) {
            noteSet.add(this.parentNote);
            this.parentNote.children.forEach(child => noteSet.add(child));
        }
        this.children.forEach(child => noteSet.add(child));
        // if (n > 0) {
        //     noteSet.forEach(note => {
        //         const relativeSet = note.getRelativeSet(n, noteSet);
        //         relativeSet.forEach(relativeNote => noteSet.add(relativeNote));
        //     });
        // }
        return noteSet;
    }
    moveTo(newParentUuid, index = 0) {
        console.log(`Moving note ${this.uuid} from ${this.parentNote ? this.parentNote.uuid : 'root'} to ${newParentUuid}`);
        if (!this.parentNote) return console.warn('Cannot move root note');
        const noteArray = Array.from(this.getRelativeSet());
        // this.parentNote.deleteChild(this.uuid);
        // this.parentNote = noteArray.find(note => note.uuid === newParentUuid);
        // const elderSibling = this.parentNote.children.find((child, index, siblings) => {
        //     return siblings(index + 1) === this.uuid;
        // });
        this.parentNote.children = this.parentNote.children.filter((child, index, siblings) => {
            if (child.uuid === this.uuid) {
                console.log(`Removing note ${this.uuid} from its parent ${this.parentNote.uuid}`);
                child.container.remove();
                return false;
            } else if (siblings[index] && siblings[index].uuid === newParentUuid) {
                // elderSibling = child;
                this.parentNote = child;
                this.parentNote.addChild(this.uuid, siblings[index + 1].uuid, -1);
            }
            return true;
        })
        // this.parentNote.addChild(this.uuid, elderSibling);
    }
    initChildren() {
        this.childrenDiv = document.createElement('div');
        this.childrenDiv.className = 'note-children';
        this.children.forEach(async (childNote) => this.childrenDiv.appendChild(await childNote.init()));
        return this.childrenDiv;
    }
    async addChild(childUuid, siblingUuid) {
        console.log(`Adding child note to ${this.uuid}`);
        const uuid = childUuid;
        const index = siblingUuid ? this.children.findIndex(child => child.uuid === siblingUuid) + 1 : 0;
        const childNote = new Note(uuid, this, this.fontSize * 0.8, false);
        this.children.splice(index, 0, childNote);
        this.childrenDiv.insertBefore(await childNote.init(), this.childrenDiv.children[index] || null);
        this.save();
        childNote.contentSpan.focus();

    }
    deleteChild(childUuid) {
        this.children = this.children.filter(child => {
            if (child.uuid === childUuid) {
                console.log(`Deleting child note with UUID: ${childUuid}`);
                child.container.remove();
                return false;
            }
            return true;
        });
    }
}

class Menu {
    constructor(note) {
        this.note = note;
    }
    init() {
        this.div = document.createElement('div');
        this.div.className = 'note-menu radius hover';
        this.div.style.display = 'none';
        this.div.appendChild(this.initAddChildButton());
        this.div.appendChild(this.initDeleteButton());
        this.div.appendChild(this.initSyncButton());
        this.div.appendChild(this.initDownloadButton());
        return this.div;
    }
    initAddChildButton() {
        this.addChildButton = document.createElement('img');
        this.addChildButton.src = 'icons/add.svg';
        this.addChildButton.className = 'button hover';
        this.addChildButton.addEventListener('click', () => {
            console.log('Add child button clicked for note:', this.note.uuid);
            this.note.addChild();
        });
        return this.addChildButton;
    }
    initDeleteButton() {
        this.deleteButton = document.createElement('img');
        this.deleteButton.src = 'icons/delete.svg';
        this.deleteButton.className = 'button hover';
        this.deleteButton.addEventListener('click', () => {
            console.log('Delete button clicked for note:', this.note.uuid);
            this.note.delete();
        });
        return this.deleteButton;
    }
    initSyncButton() {
        this.syncButton = document.createElement('img');
        this.syncButton.src = 'icons/sync.svg';
        this.syncButton.className = 'button hover';
        this.syncButton.addEventListener('click', () => {
            console.log('Sync button clicked for note:', this.note.uuid);
            this.note.sync();
        });
        return this.syncButton;
    }
    initDownloadButton() {
        this.downloadButton = document.createElement('img');
        this.downloadButton.src = 'icons/download.svg';
        this.downloadButton.className = 'button hover';
        this.downloadButton.addEventListener('click', () => {
            console.log('Download button clicked for note:', this.note.uuid);
            this.note.download();
        });
        return this.downloadButton;
    }
}
class Suggestion {
    constructor(note) {
        // console.log('Creating suggestion for note:', note);
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
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
    }
    async init(schemas) {
        if (IDB.db) return this.db = IDB.db;
        this.schemas = schemas;
        const request = window.indexedDB.open(this.dbName, this.version);
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

// button handlers
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
class Settings {
    constructor(show = false) {
        console.log(`Initializing Settings (show: ${show})`);
        if (document.getElementById('settingsDiv')) {
            this.div = document.getElementById('settingsDiv');
        } else {
            // document.body.appendChild(this.initDiv());
            this.initDiv();
        }
        if (show) this.toggle();
    }
    async initDiv() {
        this.div = document.createElement('div');
        this.div.className = 'settingsDiv radius hover-shadow';
        this.div.style.display = 'none';
        this.div.id = 'settingsDiv';
        const title = document.createElement('h2');
        title.textContent = 'Settings';
        this.div.appendChild(title);
        this.div.appendChild(this.initCloseButton());
        const urlsTitle = document.createElement('h3');
        urlsTitle.textContent = 'API URLs';
        this.div.appendChild(urlsTitle);
        this.div.appendChild(await this.initUrlList());
        this.div.appendChild(document.createElement('h3')).textContent = 'Theme';
        this.div.appendChild(this.initThemeButton());
        // return this.div;
        document.body.appendChild(this.div);
    }
    initCloseButton() {
        this.closeButton = document.createElement('img');
        this.closeButton.src = 'icons/cancel.svg';
        this.closeButton.className = 'icon button hover';
        this.closeButton.style.fontSize = '30px';
        this.closeButton.style.position = 'absolute';
        this.closeButton.style.top = '1em';
        this.closeButton.style.right = '1em';
        this.closeButton.addEventListener('click', () => this.toggle());
        return this.closeButton;
    }
    initThemeButton() {
        if (!localStorage.getItem('theme')) localStorage.setItem('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.themeButton = document.createElement('img');
        this.themeButton.src = `icons/${localStorage.getItem('theme') === 'dark' ? 'light' : 'dark'}.svg`;
        this.themeButton.className = 'icon button hover';
        this.themeButton.style.fontSize = '30px';
        this.themeButton.addEventListener('click', () => this.toggleTheme());
        return this.themeButton;
    }
    toggleTheme() {
        this.themeButton.src = `icons/${localStorage.getItem('theme')}.svg`;
        localStorage.setItem('theme', localStorage.getItem('theme') === 'dark' ? 'light' : 'dark');
        console.log(`Theme changed to: ${localStorage.getItem('theme')}`);
        document.documentElement.classList = localStorage.getItem('theme');
    }
    async initUrlList() {
        this.urlList = document.createElement('div');
        this.urlList.className = 'api-url-list';
        this.apiUrls = await db.getAll('apiUrls');
        this.apiUrls.forEach(apiUrl => {
            this.urlList.appendChild(this.initUrl(apiUrl));
        });
        this.urlList.appendChild(this.initAddButton());
        return this.urlList;
    }
    initUrl(apiUrl) {
        const urlDiv = document.createElement('div');
        urlDiv.className = 'api-url hover radius';
        urlDiv.style.position = 'relative';
        urlDiv.style.padding = '0.5em';
        const urlSpan = document.createElement('span');
        urlSpan.className = 'api-url-text';
        urlSpan.textContent = apiUrl.url;
        urlDiv.appendChild(urlSpan);
        const removeButton = document.createElement('img');
        removeButton.src = 'icons/cancel.svg';
        removeButton.className = 'icon button hover';
        removeButton.style.position = 'absolute';
        removeButton.style.right = '0.5em';
        removeButton.addEventListener('click', () => {
            db.delete('apiUrls', apiUrl.url);
            urlDiv.remove();
        });
        urlDiv.appendChild(removeButton);
        return urlDiv;
    }
    initAddButton() {
        const addUrl = document.createElement('img');
        addUrl.src = 'icons/add.svg';
        addUrl.className = 'icon button hover';
        addUrl.addEventListener('click', () => {
            const url = prompt('Enter API URL:');
            if (url && this.validateAndSaveUrl(url)) {
                // this.urlList.appendChild(this.initUrl(url));
                this.urlList.insertBefore(this.initUrl(url), this.urlList.lastChild);
            }
        });
        return addUrl;
    }
    validateAndSaveUrl(url) {
        try {
            new URL(url);
            db.add('apiUrls', { url, addedAt: new Date().toISOString() });
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
async function syncWithApis() {
    const urls = JSON.parse(localStorage.getItem('apiUrls'));
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

// Main initialization function
async function init() {
    console.log('Initializing application...');
    await Promise.all([
        new Promise(resolve => addEventListener('DOMContentLoaded', resolve)),
        initDB(),
    ]);
    await route();
    console.log('Routing completed successfully.');
}
const dbSchemas = {
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
    },
    apiUrls: {
        options: {
            keyPath: 'url'
        },
        indexes: [
            { name: 'url', unique: true }
        ]
    }
};
const defaultApiUrls = [
    {
        url: 'https://api.example.com/sync',
        name: 'Example API',
        addedAt: new Date().toISOString()
    },
    {
        url: 'https://api.anotherexample.com/sync',
        name: 'Another Example API',
        addedAt: new Date().toISOString()
    }
];
async function initDB() {
    console.log('Initializing database...');
    await db.init(dbSchemas);
    console.log('Database initialized successfully.');
    await Promise.all(defaultApiUrls.map(async apiUrl => {
        const existingUrl = await db.getByKey('apiUrls', apiUrl.url);
        if (!existingUrl) {
            await db.add('apiUrls', apiUrl);
            console.log(`Default API URL added: ${apiUrl.url}`);
        }
        return;
    }));
}
async function route() {
    document.documentElement.classList = localStorage.getItem('theme');
    const url = new URL(window.location);
    initEventListeners(url.hash === '#settings');
    let uuid;
    if (url.searchParams.has('uuid')) {
        uuid = url.searchParams.get('uuid');
    } else {
        uuid = localStorage.getItem('homeUuid') || crypto.randomUUID();
        if (!localStorage.getItem('homeUuid')) localStorage.setItem('homeUuid', uuid);
        url.searchParams.set('uuid', uuid);
        window.history.replaceState({}, '', url.toString());
    }
    const note = new Note(uuid, null, 30, true);
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
    document.getElementById('home').addEventListener('click', home);
    document.getElementById('settings').addEventListener('click', () => settings.toggle());
    document.getElementById('sync').addEventListener('click', syncWithApis);
    document.getElementById('download').addEventListener('click', download);
    document.getElementById('upload').addEventListener('click', upload);
    return;
}

const db = new IDB('divein', 1);
init();


// for debugging purposes
addEventListener('error', (event) => {
    setTimeout(() => location.reload(), 10000);
});