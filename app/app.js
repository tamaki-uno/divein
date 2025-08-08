"use strict";


function setStyles(Element, styles) {
    Object.entries(styles).forEach(([key, value]) => {
        Element.style[key] = value;
    });
}

function addEventListners(Element, events) {
    Object.entries(events).forEach(([event, handler]) => {
        Element.addEventListener(event, handler);
    });
}

function appendChildren(Element, children) {
    children.forEach(child => {
        Element.appendChild(child);
    });
}

class Note {
    constructor(uuid, parentNote, expand = false) {
        this.uuid = uuid;
        this.parentNote = parentNote;
        this.isExpanded = expand;
        this.childNotes = [];
    }
    async init() {
        await this.get();
        return this.initContainer();
    }
    async get() {
        const noteData = await db.getByKey("notes", this.uuid) || this.createNoteData();
        this.content = noteData.content;
        this.children = noteData.children.map((childUuid) => new Note(childUuid, this, false));
        this.createdAt = noteData.createdAt;
        this.updatedAt = noteData.updatedAt;
        this.save();
        return noteData;
    }
    async save() {
        if (await this.hasChanged()) {
            await db.put("notes", this.createNoteData());
            return true;
        }
        return false;
    }
    createNoteData() {
        return {
            uuid: this.uuid,
            content: this.content || (this.parentNote ? "" : "HOME"),
            children: this.children ? this.children.map((child) => child.uuid) : [],
            createdAt: this.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    async hasChanged() {
        const existingNote = await db.getByKey("notes", this.uuid);
        if (!existingNote) return true;
        const noteData = this.createNoteData();
        const isContentChanged = existingNote.content !== noteData.content;
        const isChildrenChanged = JSON.stringify(existingNote.children) !== JSON.stringify(noteData.children);
        if (isContentChanged) {
            console.log(`Content changed for note ${this.uuid}:`, existingNote.content, "->", noteData.content);
        }
        if (isChildrenChanged) {
            console.log(`Children changed for note ${this.uuid}:`, existingNote.children, "->", noteData.children);
        }
        return isContentChanged || isChildrenChanged;
    }
    initContainer() {
        // this.baseZIndex = this.parentNote ? this.parentNote.baseZIndex-- : "auto";
        // this.baseZIndex = "auto";
        // this.container = this.createContainerElement();
        this.container = document.createElement("div");
        this.container.id = this.uuid;
        setStyles(this.container, {
            display: "flex",
            flexDirection: "column",
            fontSize: "max(0.7em, 16px)",
            // overflow: "hidden",
            position: "relative",
            // zIndex: this.baseZIndex,
            backgroundColor: "var(--sub-background)",
            margin: "0.1rem",
        });
        this.container.addEventListener("dblclick", (event) => this.handleDoubleClick(event));
        this.container.appendChild(this.initContent());
        this.container.appendChild(this.initChildren());
        this.isExpanded ? this.expand() : this.collapse();
        return this.container;
    }
    // createContainerElement() {
    //     const container = document.createElement("div");
    //     container.id = this.uuid;
    //     setStyles(container, {
    //         display: "flex",
    //         flexDirection: "column",
    //         fontSize: "max(0.7em, 16px)",
    //         overflow: "hidden",
    //         position: "relative",
    //         zIndex: this.parentNote ? this.parentNote.zIndex - 1 : "auto",
    //         backgroundColor: "var(--sub-background)",
    //         margin: "0.1rem",
    //         height: this.isExpanded ? "auto" : "fit-content",
    //     });
    //     container.addEventListener("dblclick", this.handleDoubleClick.bind(this));
    //     return container;
    // }
    handleDoubleClick(event) {
        console.log("Note double-clicked:", this.uuid);
        event.preventDefault();
        event.stopPropagation();
        location.search = `?uuid=${this.uuid}`;
        route();
    }
    initContent() {
        this.contentDiv = document.createElement("div");
        this.contentDiv.className = "radius";
        setStyles(this.contentDiv, {
            display: "flex",
            flexDirection: "row",
            flexGrow: "1",
            position: "relative",
            // zIndex: "1000",
            // zIndex: this.baseZIndex + 1,
            fontSize: "inherit",
            padding: "0.1em",
            backgroundColor: "var(--main-background)",
        });
        this.contentDiv.appendChild(this.initToggleIcon());
        this.contentDiv.appendChild(this.initContentSpan());
        this.suggestion = new Suggestion(this);
        this.menu = new Menu(this);
        this.contentDiv.appendChild(this.menu.init());
        this.contentDiv.addEventListener("contextmenu", (event) => this.handleContextMenu(event));
        return this.contentDiv;
    }
    handleContextMenu(event) {
        event.preventDefault();
        console.log("Context menu opened for note:", this.uuid);
        this.menu.style.display = "block";
    }
    initToggleIcon() {
        this.toggleIcon = document.createElement("img");
        this.toggleIcon.src = "icons/toggle.svg";
        this.toggleIcon.className = "icon button hover";
        this.toggleIcon.style.transition = "transform 0.2s ease";
        this.toggleIcon.addEventListener("click", (event) => (this.isExpanded ? this.collapse() : this.expand()));
        this.toggleIcon.addEventListener("dblclick", (event) => event.stopPropagation());
        return this.toggleIcon;
    }
    expand() {
        if (this.parentNote) this.parentNote.expand();
        this.isExpanded = true;
        this.toggleIcon.style.transform = "rotate(90deg)";
        this.container.style.height = "auto";
        // this.contentDiv.style.height = "auto";
        // this.contentSpan.style.height = "auto";
        this.contentSpan.style.height = "auto";
        this.contentSpan.style.overflow = "auto";
        this.childrenDiv.style.display = "flex";
    }
    collapse() {
        this.isExpanded = false;
        this.toggleIcon.style.transform = "rotate(0deg)";
        // this.container.style.height = "fit-content";
        // this.container.style.height = 1 + 0.2*2 + 0.1*2 + "em";
        this.container.style.height = "2em";
        // this.contentDiv.style.height = "1.5em";
        // this.contentSpan.style.height = "1.5em";
        this.contentSpan.style.height = "1.5em";
        this.contentSpan.style.overflow = "hidden";
        this.childrenDiv.style.display = "none";
    }
    initContentSpan() {
        this.contentSpan = document.createElement("span");
        this.contentSpan.className = "radius hover";
        setStyles(this.contentSpan, {
            backgroundColor: "var(--sub-background)",
            padding: "0.2em 0.5em",
            // fontSize: "0.8em",
            flexGrow: "1",
            outline: "none"
        });
        this.contentSpan.setAttribute("contenteditable", "true");
        // this.suggestion = new Suggestion(this);
        // this.contentSpan.appendChild(this.suggestion.init());
        // console.log("suggestion appended to contentSpan", this.contentSpan);
        // this.contentSpan.addEventListener("focus", (event) => this.handleFocus(event));
        // this.contentSpan.addEventListener("keydown", (event) => this.handleKeyDown(event));
        // this.contentSpan.addEventListener("input", (event) => this.handleInput(event));
        // this.contentSpan.addEventListener("blur", (event) => this.handleBlur(event));
        addEventListners(this.contentSpan, {
            focus: (event) => this.handleFocus(event),
            keydown: (event) => this.handleKeyDown(event),
            input: (event) => this.handleInput(event),
            blur: (event) => this.handleBlur(event)
        });
        this.renderContent();
        // console.log("ContentSpan initialized", this.contentSpan);
        return this.contentSpan;
    }
    handleFocus(event) {
        // this.contentSpan.innerHTML = this.content;
        this.renderContent(["none"]);
        this.contentSpan.focus();
        this.suggestion.update(this.content);
    }
    handleKeyDown(event) {
        if (event.key === "Enter") {
            this.handleEnterKey(event);
        } else if (event.key === "Tab") {
            this.handleTabKey(event);
        } else if (event.key === "ArrowUp") {
            this.moveFocus(-1);
        } else if (event.key === "ArrowDown") {
            this.moveFocus(1);
        } else if (event.key === "Escape") {
            this.handleEscapeKey(event);
        }
    }
    handleEnterKey(event) {
        event.preventDefault();
        this.contentSpan.blur();
        if (event.shiftKey) {
            console.log("Shift + Enter pressed");
        } else {
            console.log("Enter pressed without Shift");
            if (this.parentNote) {
                const index = this.parentNote.children.indexOf(this);
                this.parentNote.createChild(index + 1);
            } else {
                this.createChild();
            }
        }
    }
    handleTabKey(event) {
        event.preventDefault();
        if (event.shiftKey) {
            console.log("Shift + Tab pressed");
            const grandparentNote = this.parentNote.parentNote;
            if (grandparentNote) {
                const index = grandparentNote.children.indexOf(this.parentNote);
                this.moveTo(grandparentNote, index - 1);
            }
        } else {
            console.log("Tab pressed without Shift");
            if (this.parentNote) {
                const index = this.parentNote.children.indexOf(this);
                this.moveTo(this.parentNote.children[index - 1]);
            }
        }
    }
    moveFocus(direction) {
        this.contentSpan.blur();
        if (direction === 0) {
            this.contentSpan.focus();
        } else if (0 < direction && direction <= this.children.length) {
            const index = direction - 1;
            const target = this.children[index];
            target.contentSpan.focus();
            this.collapse();
            target.expand();
        } else if (this.parentNote) {
            const index = this.parentNote.children.indexOf(this);
            let newDirection = direction + (index + 1);
            if (0 < direction) newDirection -= this.children.length;
            this.parentNote.moveFocus(newDirection);
        } else {
            console.warn("Cannot move focus, no note found");
            this.contentSpan.focus();
        }
    }
    handleEscapeKey(event) {
        event.preventDefault();
        this.contentSpan.blur();
    }
    async handleInput(event) {
        this.content = this.contentSpan.textContent.trim();
        if (await this.save()) {
            this.suggestion.update(this.content);
            console.log("Note saved and suggestion updated", this.content);
        }
    }
    handleBlur(event) {
        this.content = this.contentSpan.textContent.trim();
        this.save();
        this.renderContent();
        this.suggestion.hide();
    }
    renderContent(styles = ["render"]) {
        this.contentSpan.innerHTML = "";
        if (styles.includes("render")) {
            if (
                this.content.startsWith("http://") ||
                this.content.startsWith("https://")
            ) {
                const link = document.createElement("a");
                link.href = this.content;
                link.textContent = this.content;
                link.target = "_blank";
                this.contentSpan.appendChild(link);
            } else if (false) {
                console.log("how did you get here?");
            } else {
                this.contentSpan.textContent = this.content;
            }
        } else {
            this.contentSpan.textContent = this.content;
        }
    }
    moveTo(newParent, index = 0) {
        console.log(
            `Moving note ${this.uuid} from ${this.parentNote || "root"} to ${newParent}`
        );
        if (!this.parentNote) return console.warn("Cannot move root note");
        if (!newParent) return console.warn("Cannot move to null parent note");
        this.parentNote.children = this.parentNote.children.filter((child) => child !== this);
        this.container.remove();
        this.parentNote.save();
        this.parentNote = newParent;
        this.parentNote.children.splice(index, 0, this);
        this.parentNote.childrenDiv.insertBefore(this.container, this.parentNote.childrenDiv.children[index]);
        this.parentNote.save();
        this.parentNote.expand();
        this.contentSpan.focus();
    }
    initChildren() {
        this.childrenDiv = document.createElement("div");
        this.childrenDiv.className = "";
        setStyles(this.childrenDiv, {
            flexDirection: "column",
            // display: "sticky",
            marginLeft: "1.5em",
            fontSize: "inherit",
        });
        this.children.forEach(async (childNote) =>
            this.childrenDiv.appendChild(await childNote.init())
        );
        return this.childrenDiv;
    }
    async addChild(childNote, index = 0) {
        console.log(`Adding child note to ${this.uuid}`);
        this.children.splice(index, 0, childNote);
        this.childrenDiv.insertBefore(
            await childNote.init(),
            this.childrenDiv.children[index] || null
        );
        db.put("notes", this.createNoteData());
        childNote.contentSpan.focus();
    }
    async createChild(index = 0) {
        const newNoteUuid = crypto.randomUUID();
        const newNote = new Note(newNoteUuid, this, false);
        return await this.addChild(newNote, index);
    }
}

class Suggestion {
    constructor(note) {
        // console.log('Creating suggestion for note:', note);
        this.note = note;
        this.results = [];
        this.div = this.div || this.initDiv();
        this.renderSuggestion();
        this.div.style.display = "none"; // Initially hide the suggestion div
    }
    async update(content) {
        this.results = await db.search("notes", content.trim());
        this.results.sort((a, b) => {
            return a.content.localeCompare(b.content);
        });
        this.renderSuggestion();
        console.log("Suggestion updated with results:", this.results);
        console.log("Suggestion div:", this.div);
        console.log("note content div:", this.note.contentDiv);
    }
    initDiv() {
        this.div = document.createElement("div");
        this.div.className = "radius shadow";
        setStyles(this.div, {
            position: "absolute",
            // position: "relative",
            top: "100%",
            // left: "0",
            left: "1.5em",
            // width: "100%",
            width: "20em",
            maxHeight: "20em",
            overflowX: "hidden",
            overflowY: "auto",
            backgroundColor: "var(--sub-background)",
            zIndex: "10",
        });
        return this.div;
    }
    renderSuggestion() {
        this.div.innerHTML = "";
        this.div.style.display = "block";
        // setStyles(this.div, {
        //     display: "block",
        //     position: "absolute",
        //     top: "100%",
        //     // left: "0",
        //     left: "1.5em",
        //     // width: "100%",
        //     width: "20em",
        //     maxHeight: "20em",
        //     overflowX: "hidden",
        //     // overflowY: "auto",
        //     overflowY: "scroll",
        //     backgroundColor: "var(--sub-background)",
        //     zIndex: "1000",
        // });
        // this.div.appendChild(document.createElement("h3")).textContent = "Suggestions";
        this.results.forEach((note) => this.div.appendChild(this.createNoteDiv(note)));
        this.note.contentDiv.appendChild(this.div);
    }
    createNoteDiv(note) {
        const noteDiv = document.createElement("div");
        noteDiv.textContent = note.content;
        noteDiv.className = "hover";
        setStyles(noteDiv, {
            fontSize: "0.8em",
            padding: "0.5em 1em",
            overflow: "hidden",
            borderBottom: "1px solid var(--border-color)",
            cursor: "pointer",
        });
        noteDiv.addEventListener("click", () => {
            console.log("Suggestion clicked:", note.uuid);
            this.note.uuid = note.uuid;
            this.note.renderContent();
        });
        return noteDiv;
    }
    hide() {
        console.log("Hiding suggestion ", this.div);
        this.div.style.display = "none";
    }
}
class Menu {
    constructor(note) {
        this.note = note;
    }
    init() {
        this.div = document.createElement("div");
        this.div.className = "note-menu radius hover";
        this.div.style.display = "none";
        this.div.appendChild(this.initAddChildButton());
        this.div.appendChild(this.initDeleteButton());
        this.div.appendChild(this.initSyncButton());
        this.div.appendChild(this.initDownloadButton());
        return this.div;
    }
    initAddChildButton() {
        this.addChildButton = document.createElement("img");
        this.addChildButton.src = "icons/add.svg";
        this.addChildButton.className = "button hover";
        this.addChildButton.addEventListener("click", () => {
            console.log("Add child button clicked for note:", this.note.uuid);
        });
        return this.addChildButton;
    }
    initDeleteButton() {
        this.deleteButton = document.createElement("img");
        this.deleteButton.src = "icons/delete.svg";
        this.deleteButton.className = "button hover";
        this.deleteButton.addEventListener("click", () => {
            console.log("Delete button clicked for note:", this.note.uuid);
        });
        return this.deleteButton;
    }
    initSyncButton() {
        this.syncButton = document.createElement("img");
        this.syncButton.src = "icons/sync.svg";
        this.syncButton.className = "button hover";
        this.syncButton.addEventListener("click", () => {
            console.log("Sync button clicked for note:", this.note.uuid);
        });
        return this.syncButton;
    }
    initDownloadButton() {
        this.downloadButton = document.createElement("img");
        this.downloadButton.src = "icons/download.svg";
        this.downloadButton.className = "button hover";
        this.downloadButton.addEventListener("click", () => {
            console.log("Download button clicked for note:", this.note.uuid);
        });
        return this.downloadButton;
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
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            Object.entries(this.schemas).forEach(([name, schema]) => {
                if (!this.db.objectStoreNames.contains(name)) {
                    console.log(`Creating object store: ${name}`);
                    const objectStore = this.db.createObjectStore(name, schema.options);
                    schema.indexes.forEach((index) =>
                        objectStore.createIndex(index.name, index.name, {
                            unique: index.unique,
                        })
                    );
                }
            });
            console.log("Object stores created:", this.db.objectStoreNames);
        };
        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database opened successfully:", this.db);
                resolve(this.db);
            };
            request.onerror = (event) => {
                console.error("Error opening database:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    createObjectStore(storeName, options) {
        const transaction = this.db.transaction(
            this.db.objectStoreNames,
            "versionchange"
        );
        const objectStore = transaction.objectStore(storeName);
        if (!objectStore) {
            console.log(`Creating object store: ${storeName}`);
            const newObjectStore = this.db.createObjectStore(storeName, options);
        }
    }
    getObjectStore(storeName, mode = "readonly") {
        if (!this.db) throw new Error("Database not initialized");
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }
    async getByKey(storeName, key) {
        const objectStore = await this.getObjectStore(storeName, "readonly");
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
        const objectStore = await this.getObjectStore(storeName, "readonly");
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
        const objectStore = await this.getObjectStore(storeName, "readonly");
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
        const objectStore = await this.getObjectStore(storeName, "readwrite");
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
        const objectStore = await this.getObjectStore(storeName, "readwrite");
        return new Promise((resolve, reject) => {
            const request = objectStore.put(data);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Error putting data:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    async delete(storeName, key) {
        const objectStore = await this.getObjectStore(storeName, "readwrite");
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
        const objectStore = await this.getObjectStore(storeName, "readwrite");
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

// button handlers
function home() {
    console.log("Home button clicked");
    const homeUuid = localStorage.getItem("homeUuid");
    if (homeUuid) {
        console.log("Navigating to home UUID:", homeUuid);
        location.search = `?uuid=${homeUuid}`;
        route();
    } else {
        location.search = "";
        route();
    }
}
class Settings {
    static instance = null;
    constructor(isShowing = false) {
        if (Settings.instance) {
            console.warn(
                "Settings instance already exists, returning existing instance"
            );
            return Settings.instance;
        }
        Settings.instance = this;
        this.isShowing = isShowing;
        this.initDiv();
    }
    async initDiv() {
        this.div = this.createDiv();
        this.isShowing ? this.show() : this.hide();
        this.div.appendChild(document.createElement("h2")).textContent = "Settings";
        this.div.appendChild(this.initCloseButton());
        this.div.appendChild(await this.initUrlList());
        this.div.appendChild(this.initThemeButton());
        document.body.appendChild(this.div);
    }
    createDiv() {
        this.div = document.createElement("div");
        this.div.id = "settingsDiv";
        this.div.className = "radius shadow";
        setStyles(this.div, {
            display: "none",
            flexDirection: "column",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "0.4em",
            padding: "1em",
            zIndex: "1000",
            width: "min(30em, 90vw)",
            backgroundColor: "var(--sub-background)",
        });
        return this.div;
    }
    initCloseButton() {
        this.closeButton = document.createElement("img");
        this.closeButton.src = "icons/cancel.svg";
        this.closeButton.className = "icon button hover";
        setStyles(this.closeButton, {
            fontSize: "30px",
            position: "absolute",
            top: "1em",
            right: "1em",
        });
        this.closeButton.addEventListener("click", () => this.hide());
        return this.closeButton;
    }
    show() {
        this.isShowing = true;
        this.div.style.display = "flex";
        const url = new URL(window.location);
        url.hash = "#settings";
        window.history.replaceState({}, "", url.toString());
    }
    hide() {
        this.isShowing = false;
        this.div.style.display = "none";
        const url = new URL(window.location);
        url.hash = "";
        window.history.replaceState({}, "", url.toString());
    }
    async initUrlList() {
        this.urlList = document.createElement("div");
        const urlListTitle = document.createElement("h3");
        urlListTitle.textContent = "API URLs";
        urlListTitle.style.margin = "0.5em 0";
        this.urlList.appendChild(urlListTitle);
        this.apiUrls = await db.getAll("apiUrls");
        this.apiUrls.forEach((apiUrl) => {
            this.urlList.appendChild(this.initUrl(apiUrl));
        });
        this.urlList.appendChild(this.initAddButton());
        return this.urlList;
    }
    initUrl(apiUrl) {
        const urlDiv = document.createElement("div");
        urlDiv.className = "hover radius";
        setStyles(urlDiv, {
            position: "relative",
            margin: "0.2em",
            padding: "0.2em 0.5em",
            backgroundColor: "var(--main-background)",
        });
        const urlSpan = document.createElement("span");
        urlSpan.className = "api-url-text";
        urlSpan.textContent = apiUrl.url;
        urlDiv.appendChild(urlSpan);
        const removeButton = document.createElement("img");
        removeButton.src = "icons/cancel.svg";
        removeButton.className = "icon button hover";
        removeButton.style.position = "absolute";
        removeButton.style.right = "0.5em";
        removeButton.addEventListener("click", () => {
            db.delete("apiUrls", apiUrl.url);
            urlDiv.remove();
        });
        urlDiv.appendChild(removeButton);
        return urlDiv;
    }
    initAddButton() {
        const addUrl = document.createElement("img");
        addUrl.src = "icons/add.svg";
        addUrl.className = "icon button hover";
        addUrl.addEventListener("click", () => {
            const url = prompt("Enter API URL:");
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
            db.add("apiUrls", { url, addedAt: new Date().toISOString() });
            return true;
        } catch (e) {
            return false;
        }
    }
    initThemeButton() {
        const themeTitle = document.createElement("h3");
        themeTitle.textContent = "Theme";
        themeTitle.style.margin = "0.5em 0";
        this.div.appendChild(themeTitle);
        if (!localStorage.getItem("theme")) localStorage.setItem("theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        this.themeButton = document.createElement("img");
        this.themeButton.src = `icons/${localStorage.getItem("theme") === "dark" ? "light" : "dark"}.svg`;
        this.themeButton.className = "icon button hover";
        setStyles(this.themeButton, {
            fontSize: "2em",
        });
        this.themeButton.addEventListener("click", () => this.toggleTheme());
        return this.themeButton;
    }
    toggleTheme() {
        this.themeButton.src = `icons/${localStorage.getItem("theme")}.svg`;
        localStorage.setItem("theme", localStorage.getItem("theme") === "dark" ? "light" : "dark");
        document.documentElement.classList = localStorage.getItem("theme");
    }
}
async function syncWithApis() {
    const urls = await db
        .getAll("apiUrls")
        .then((urls) => urls.map((urlObj) => urlObj.url));
    if (urls.length === 0)
        return alert("No API URLs configured. Please add an API URL in settings.");
    console.log(`Syncing with API at ${urls}`);
    const localNotes = await db.getAll("notes");
    try {
        const remoteNotesArray = await Promise.all(
            urls.map(async (url) => {
                const response = await fetch(`${url}/sync`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(localNotes),
                });
                if (!response.ok) {
                    throw new Error(`Failed to sync with ${url}: ${response.statusText}`);
                }
                const remoteNotes = JSON.parse(await response.text());
                return remoteNotes;
            })
        );
        const remoteNotes = remoteNotesArray.flat();
        await Promise.all(
            remoteNotes.map(async (remoteNote) => {
                const localNote = localNotes.find(
                    (note) => note.uuid === remoteNote.uuid
                );
                if (
                    !localNote ||
                    new Date(localNote.updatedAt) < new Date(remoteNote.updatedAt)
                ) {
                    await db.put("notes", remoteNote);
                }
            })
        );
    } catch (error) {
        console.error(error);
    } finally {
        console.log("Sync completed");
    }
}
async function download() {
    console.log("Downloading notes...");
    const notes = await db.getAll("notes");
    if (notes.length === 0) return alert("No notes to download.");
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
async function upload() {
    console.log("Uploading notes...");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.type !== "application/json") {
            return alert("Please upload a valid JSON file.");
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const notes = JSON.parse(e.target.result);
                if (!Array.isArray(notes)) {
                    return alert(
                        "Invalid file format. Please upload a valid JSON file containing an array of notes."
                    );
                }
                await Promise.all(
                    notes.map(async (note) => {
                        if (
                            !note.uuid ||
                            !note.content ||
                            !note.createdAt ||
                            !note.updatedAt
                        ) {
                            return alert("Invalid note format in uploaded file.");
                        }
                        const existingNote = await db.getByKey("notes", note.uuid);
                        if (existingNote) {
                            if (new Date(existingNote.updatedAt) < new Date(note.updatedAt)) {
                                await db.put("notes", note);
                            }
                        } else {
                            await db.add("notes", note);
                        }
                    })
                );
                alert("Notes uploaded successfully.");
                location.reload();
            } catch (error) {
                console.error("Error uploading notes:", error);
                alert(
                    "Failed to upload notes. Please ensure the file is a valid JSON file."
                );
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            alert("Failed to read file. Please try again.");
        };
        reader.readAsText(file);
    });
    input.click();
}

// Main initialization function
async function init() {
    console.log("Initializing application...");
    await Promise.all([
        new Promise((resolve) => addEventListener("DOMContentLoaded", resolve)),
        initDB(),
    ]);
    await route();
}
const dbSchemas = {
    notes: {
        options: {
            keyPath: "uuid",
            autoIncrement: false,
        },
        indexes: [
            { name: "uuid", unique: true },
            { name: "content", unique: false },
            { name: "createdAt", unique: false },
            { name: "updatedAt", unique: false },
        ],
    },
    apiUrls: {
        options: {
            keyPath: "url",
        },
        indexes: [{ name: "url", unique: true }],
    },
};
const defaultApiUrls = [
    {
        url: "https://api.example.com/sync",
        name: "Example API",
        addedAt: new Date().toISOString(),
    },
    {
        url: "https://api.anotherexample.com/sync",
        name: "Another Example API",
        addedAt: new Date().toISOString(),
    },
];
async function initDB() {
    await db.init(dbSchemas);
    await Promise.all(
        defaultApiUrls.map(async (apiUrl) => {
            const existingUrl = await db.getByKey("apiUrls", apiUrl.url);
            if (!existingUrl) await db.add("apiUrls", apiUrl);
            return;
        })
    );
}
async function route() {
    document.documentElement.classList = localStorage.getItem("theme");
    const url = new URL(window.location);
    initEventListeners(url.hash === "#settings");
    let uuid;
    if (url.searchParams.has("uuid")) {
        uuid = url.searchParams.get("uuid");
    } else {
        uuid = localStorage.getItem("homeUuid") || crypto.randomUUID();
        if (!localStorage.getItem("homeUuid"))
            localStorage.setItem("homeUuid", uuid);
        url.searchParams.set("uuid", uuid);
        window.history.replaceState({}, "", url.toString());
    }
    const note = new Note(uuid, null, true);
    document.querySelector("main").appendChild(await note.init());
    document.getElementById("loading").style.display = "none";
    return;
}
function initEventListeners(isSettings) {
    console.log("Initializing event listeners... (isSettings:", isSettings, ")");
    addEventListener("hashchange", route);
    addEventListener("popstate", route);
    addEventListener("DOMContentLoaded", route);
    const settings = new Settings(isSettings);
    document.getElementById("home").addEventListener("click", home);
    document.getElementById("settings").addEventListener("click", () => settings.show());
    document.getElementById("sync").addEventListener("click", syncWithApis);
    document.getElementById("download").addEventListener("click", download);
    document.getElementById("upload").addEventListener("click", upload);
    return;
}

const db = new IDB("divein", 1);
init();
