addEventListener('DOMContentLoaded', async () => {
    const settings = new Settings();
    document.getElementById('settings').addEventListener('click', settings.open.bind(settings));
    // document.getElementById('sync').addEventListener('click', syncWithApis);
    document.getElementById('sync').addEventListener('click', async () => await syncWithApis());
    document.getElementById('download').addEventListener('click', download);

    const url = new URL(window.location);
    const main = document.querySelector('main');
    const uuid = url.searchParams.get('uuid') || crypto.randomUUID();
    url.searchParams.set('uuid', uuid);
    window.history.replaceState({}, '', url.toString());
    const note = new Note(uuid, main);

    document.getElementById('loading').style.display = 'none';
});

class Note {
    constructor(uuid, parentNode, fontSize = 30) {
        console.log(`Creating note with UUID: ${uuid}, parentNode:`, parentNode, `fontSize: ${fontSize}`);
        this.uuid = uuid;
        this.parentNode = parentNode;
        this.fontSize = fontSize;
        this.isExpanded = false;
        this.getNote()
            .then(() => {
                console.log('Note data loaded:', this);
                this.init();
                parentNode.appendChild(this.container);
            });
    }
    async getNote() {
        const existingNoteData = await getNote(this.uuid);
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
            await setNote(noteData);
            console.log('New note created and saved:', noteData);
            return;
        }
    }
    init() {
        this.initToggleIcon();
        this.initContent();
        this.initAddChildIcon();
        this.initChildren();
        this.initContainer();
    }
    initContainer() {
        this.container = document.createElement('div');
        this.container.className = 'note-container radius';
        this.container.id = `note-${this.uuid}`;
        this.container.style.fontSize = `${this.fontSize}px`;
        this.container.appendChild(this.contentDiv);
        this.container.appendChild(this.childrenDiv);
    }
    initContent() {
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'note-content radius';
        this.contentDiv.setAttribute('contenteditable', 'true');
        this.contentDiv.appendChild(this.toggleIcon);
        this.contentDiv.textContent = this.content;
    }
    initToggleIcon() {
        this.toggleIcon = document.createElement('img');
        this.toggleIcon.src = 'icons/toggle.svg';
        this.toggleIcon.className = 'note-toggle-icon button hover';
        this.toggleIcon.addEventListener('click', () => this.toggle());
    }
    initChildren() {
        this.childrenDiv = document.createElement('div');
        this.childrenDiv.className = 'note-children';
        this.children.forEach(childUuid => {
            const note = new Note(childUuid, this.childrenDiv, this.fontSize * 0.8);
        });
        this.childrenDiv.appendChild(this.addChildIcon);
    }
    initAddChildIcon() {
        this.addChildIcon = document.createElement('img');
        this.addChildIcon.src = 'icons/add.svg';
        this.addChildIcon.className = 'note-add-child-icon button hover';
        this.addChildIcon.addEventListener('click', () => this.addChild());
    }
    toggle() {
        this.isExpanded = !this.isExpanded;
        this.container.classList.toggle('open', this.isExpanded);
    }
    addChild
}

const objectStores = {
    notes: {
        keyPath: 'uuid',
        autoIncrement: false
    }
};

async function getIDB() {
    return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('divein', 1);
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        for (const [storeName, options] of Object.entries(objectStores)) {
            if (!db.objectStoreNames.contains(storeName)) {
                // console.log(`Creating object store: ${storeName}, options:`, options);
                console.log(`Creating object store: ${storeName}`);
                db.createObjectStore(storeName, options);
            }
        }
    }
    request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
    }
    request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
        // return db;
    };
    });
}

async function DELETEIDB() {
    const request = window.indexedDB.deleteDatabase('divein');
    request.onsuccess = (event) => {
        console.log('Database deleted successfully');
    };
    request.onerror = (event) => {
        console.error('Error deleting database:', event.target.error);
    };
}

async function getNote(uuid) {
    const db = await getIDB();
    const transaction = db.transaction('notes', 'readonly');
    const objectStore = transaction.objectStore('notes');
    return await new Promise((resolve, reject) => {
        const request = objectStore.get(uuid);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event_1) => {
            console.error('Error getting note:', event_1.target.error);
            reject(event_1.target.error);
        };
    });
}

async function getAllNotes() {
    const db = await getIDB();
    const transaction = db.transaction('notes', 'readonly');
    const objectStore = transaction.objectStore('notes');
    return await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = (event) => {
            // resolve(event.target.result);
            const notes = event.target.result;
            resolve(notes);
        };
        request.onerror = (event_1) => {
            console.error('Error getting all notes:', event_1.target.error);
            reject(event_1.target.error);
        };
    });
}

async function setNote(note) {
    const db = await getIDB();
    const transaction = db.transaction('notes', 'readwrite');
    const objectStore = transaction.objectStore('notes');
    note.updatedAt = new Date().toISOString();
    return await new Promise((resolve, reject) => {
        const request = objectStore.put(note);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event_1) => {
            console.error('Error setting note:', event_1.target.error);
            reject(event_1.target.error);
        };
    });
}

class Settings {
    constructor() {
        console.log('Settings initialized');
        if (document.getElementById('settingsDiv')) {
            this.div = document.getElementById('settingsDiv');
        } else {
            this.init();
        }
    }

    init() {
        this.div = document.createElement('div');
        this.div.className = 'settingsDiv radius hover';
        this.div.style.display = 'none';
        this.div.id = 'settingsDiv';
        this.div.appendChild(this.initCloseButton());
        this.div.appendChild(this.initContent());

        document.body.appendChild(this.div);
    }

    initCloseButton() {
        const closeButton = document.createElement('img');
        closeButton.src = 'icons/close.svg';
        closeButton.className = 'button hover';
        closeButton.style.fontSize = '40px';
        closeButton.addEventListener('click', () => {
            this.div.style.display = 'none';
        });
        return closeButton;
    }

    initContent() {
        const content = document.createElement('div');
        content.className = 'settings-content';
        const title = document.createElement('h2');
        
        title.textContent = 'Urls';
        content.appendChild(title);
        const urlList = this.initUrlList();
        content.appendChild(urlList);
        const addUrl = this.initAddUrl();
        content.appendChild(addUrl);

        return content;
    }

    initUrlList() {
        const urlList = document.createElement('ul');
        urlList.className = 'api-url-list';
        const apiUrls = getApiUrls();
        apiUrls.forEach(url => {
            const urlDiv = document.createElement('div');
            urlDiv.className = 'api-url';
            urlDiv.textContent = url;
            urlDiv.appendChild(this.initRemoveApiUrl(url));
            urlList.appendChild(urlDiv);
        });

        return urlList;
    }
    initAddUrl() {
        const addUrl = document.createElement('img');
        addUrl.src = 'icons/add.svg';
        addUrl.className = 'button hover';
        addUrl.addEventListener('click', () => {
            const url = prompt('Enter API URL:');
            if (url) {
                addApiUrl(url);
                const urlList = this.div.querySelector('.api-url-list');
                const urlDiv = document.createElement('div');
                urlDiv.className = 'api-url';
                urlDiv.textContent = url;
                const removeButton = document.createElement('img');
                removeButton.src = 'icons/remove.svg';
                removeButton.className = 'button hover';
                removeButton.addEventListener('click', () => {
                    this.removeApiUrl(url);
                    urlDiv.remove();
                });
                urlDiv.appendChild(removeButton);
                urlList.appendChild(urlDiv);
            }
        });
        return addUrl;
    }
    initRemoveApiUrl(url) {
        const removeButton = document.createElement('img');
        removeButton.src = 'icons/delete.svg';
        removeButton.className = 'button hover';
        removeButton.addEventListener('click', () => {
            this.removeApiUrl(url);
            const urlDiv = document.querySelector(`.api-url:contains('${url}')`);
            if (urlDiv) {
                urlDiv.remove();
            }
        });
        return removeButton;
    }

    open() {
        if (this.div.style.display === 'none') {
            this.div.style.display = 'block';
        } else {
            this.div.style.display = 'none';
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
                body: JSON.stringify(notes)
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