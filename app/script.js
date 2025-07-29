import Line from './scripts/line.js';

const request = initDB();

window.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location);
    // route(url);
    init(url);
});

/** * Initializes the main container and appends it to the main element.
 * If a UUID is provided, it initializes a container with that UUID.
 * If no UUID is provided, it generates a new one.
 * * Displays a loading indicator while processing.
 * @param {string} uuid - The unique identifier for the container
 * @return {void}
 */
function init(url) {
    // initDatabase();
    const main = document.querySelector('main');
    const container = initContainer(url.searchParams.get('uuid'));
    main.appendChild(container);
    // domain.com/path?query=param#fragment
    switch (url.hash.slice(1)) {
        case 'menu':
            document.getElementById('menu').style.display = 'block';
            break;
        default:
            document.getElementById('menu').style.display = 'none';
            break;
    }
            
    document.getElementById('loading').style.display = 'none';
}

/** * Initializes a container with a unique ID.
 * If no UUID is provided, generates a new one.
 * The container includes a line, children, and a menu if the UUID is 'menu'.
 */
export function initContainer(uuid) {
    if (!uuid) uuid = crypto.randomUUID();
    const container = document.createElement('div');
    container.className = 'container';
    container.id = uuid;

    container.appendChild(initLine(uuid));
    container.appendChild(initChildren(uuid));
    // if (uuid === 'menu') {
    //     container.appendChild(initMenu());
    // }
    return container;
}

/** * Initializes a line with the given UUID.
 * The line includes an icon, content area, and event listeners for interaction.
 * The content area is editable and formats the text based on its content.
 * The line's content is stored in a Line instance.
 * @param {string} uuid - The unique identifier for the line
 * @return {HTMLElement} - The initialized line element
 */
export function initLine(uuid) {
    // const line = new Line(uuid);

    const line = document.createElement('div');
    line.className = 'contentLine';

    // Create the icon element and set its attributes
    const icon = document.createElement('img');
    icon.className = 'icon';
    icon.src = './icons/closed.svg';
    line.appendChild(icon);
    icon.addEventListener('click', toggleOpen);
    icon.addEventListener('contextmenu', showMenu);
    icon.addEventListener('mouseover', showMenu);
    line.appendChild(icon);

    // Create the content element and set its attributes
    const content = document.createElement('div');
    content.className = 'content';
    // content.contentEditable = true;
    content.setAttribute('contenteditable', 'true');
    // const contentText = localStorage.getItem(uuid) || 'Type your content here...';
    // const contentText = line.getContent() || 'Type your content here...';
    // content.innerHTML = 'Type your content here...';
    content.innerHTML = request.result.objectStore('records').get(uuid).then(record => record.content || 'Type your content here...');
    formatContent(content);
    // content.innerText = window.localStorage.getItem(uuid) || 'Type your content here...';
    // content.addEventListener('input', () => {
    content.addEventListener('change', () => {
        // line.setContent(content.innerText);
        formatContent(content);
        // line.setContent(content.innerHTML);
    });
    // content.addEventListener('keypress', (event) => onKeyPress(event));
    content.addEventListener('keydown', (event) => onKeyDown(event));

    line.appendChild(content);
    return line;
}

function initDB(){
    const request = window.indexedDB.open('divein'); // Open the database. also can specify version
    // setup the database if it doesn't exist
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('records')) {
            const store = db.createObjectStore('records', { keyPath: 'uuid' }); // keyPath is the unique identifier for each record. Like a primary key in SQL

            store.createIndex('content', 'content', { unique: false }); // Create an index on the content field for faster searching.
        }
    }
    return request;
}



// saveToDatabase(uuid, content) {
//     const db = window.indexedDB.open('divein', 1);
//     db.onsuccess = (event) => {
//         const db = event.target.result;
//         const transaction = db.transaction('childrenOfMenu', 'readwrite');
//         const store = transaction.objectStore('childrenOfMenu');
//         store.put({ id: uuid, content: content });
//     }
// }



/** * Shows a context menu when the icon is right-clicked or hovered over.
 * Prevents the default context menu from appearing.
 * @param {Event} event - The event that triggered the context menu
 */
function showMenu(event) {
    console.log('Show menu');
    event.preventDefault();
}

/** * Formats the content of a div based on its text.
 * If the text starts with 'http://' or 'https://', it fetches the page title and creates a link.
 * If the text starts with a hashtag ('#' or '＃'), it formats it as a hashtag.
 * If the text starts with an exclamation mark ('!' or '！'), it formats it as a command.
 * Otherwise, it leaves the text as plain text.
 * @param {HTMLElement} div - The div element containing the content to format
 * @return {Promise<void>} - A promise that resolves when the content is formatted
 */
async function formatContent(div) {
    const contentText = div.innerText.trim();
    // localStorage.setItem(div.closest('.container').id + '-content', contentText);
    if (contentText.startsWith('http://') || contentText.startsWith('https://')) {
        const previewedTitle = await fetch(contentText)
            .then(response => response.text())
            .then(text => new DOMParser().parseFromString(text, 'text/html'))
            .then(doc => doc.querySelector('title').innerText)
            .catch(() => 'Link Preview');
        div.innerHTML = `<a href="${contentText}" target="_blank">${previewedTitle}</a>`;
    } else if (contentText.startsWith('#') || contentText.startsWith('＃')) {
        // const previewedTitle = contentText.slice(1).trim() || 'Hashtag Preview';
        div.innerHTML = `<span class="hashtag">${contentText}</span>`;
    } else if (contentText.startsWith('!') || contentText.startsWith('！')) {
        div.innerHTML = `<span class="command">${contentText}</span>`;
    } else {
        div.innerHTML = contentText; // Just plain text
    }
}

/**
 * Handles keydown events for the content area.
 * If the Enter key is pressed, it adds a new line.
 * If the Tab key or full-width space (　) is pressed, it becomes a child of the current line.
 * Prevents the default action of adding a new line or tab character.
 * @param {KeyboardEvent} event - The keydown event
 * @return {void}
 * */
// function onKeyPress(event) {
function onKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents the default action of adding a new line
        addNewLine(event.currentTarget);
    } else if (event.key === 'Tab' || event.key === '　') {
        event.preventDefault(); // Prevents the default action of adding a tab character
        becomeChild(event.currentTarget);
    }
}

function addNewLine(target) {
    console.log('Adding new line in', target);
}
function becomeChild(target, line) {
    console.log('Becoming child of', target, 'with line', line);
}



export function initContent(uuid) {}

/**
 * Generates a div element containing the props for the current line.
 * This function is currently a placeholder and does not extract any props from the DOM.
 */
export function initChildren() {
    // const props = {};
   // const containers = document.querySelectorAll('.container');
   // containers.forEach(container => {
   //     const uuid = container.id;
   //     const content = container.querySelector('.content').innerText;
   //     props[uuid] = content;
   // });
   // return props;

    const childrenDiv = document.createElement('div');
    childrenDiv.className = 'children';

    // childrenDiv.appendChild(initContainer('menu'));
    // if (!.closest('.container').classList.contains('menu')) {
    //     childrenDiv.appendChild(initMenu());
    // }

    // const propDiv = document.createElement('div');
    // propDiv.className = 'props';
    // propDiv.innerText = 'Props';
    // childrenDiv.appendChild(propDiv);

    return childrenDiv;
}

export function initMenu() {
    for (const child of JSON.parse(localStorage.getItem('childrenOfMenu'))) {
        const childContainer = initContainer(child);
        document.getElementById('menu').appendChild(childContainer);
    }
    return initContainer('menu');
}

/**
 * Toggles the open/closed state of a container.
 * @param {Event} event - The click event that triggered the toggle
 */
export function toggleOpen(event) {
    const container = event.currentTarget.closest('.container');
    const icon = container.querySelector('.icon');
    const children = container.querySelector('.children');
    if (container.classList.contains('open')) {
        container.classList.remove('open');
        children.style.display = 'none';
        icon.src = './icons/closed.svg';
    } else {
        container.classList.add('open');
        children.style.display = 'block';
        icon.src = './icons/open.svg';
    }
}