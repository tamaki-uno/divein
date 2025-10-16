'use strict';

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