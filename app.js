'use strict';

const customEvents = {
    expand: new CustomEvent('expand', { bubbles: true, cancelable: true }),
    collapse: new CustomEvent('collapse', { bubbles: false, cancelable: true }),
};

const noteData = {
    uuid: '',
    content: '',
    children: [],
    style: {
        expanded: false,
        done: false,
        strong: false
    }
    // createdAt: new Date().toISOString(),
    // updatedAt: new Date().toISOString()
}

function uuidOf(div) {
    const classNames = div.className.split(' ');
    return classNames.find(cls => {
        // return cls !== 'note' && cls !== 'expanded'
        // return cls.match(/^[0-9a-f]{36}$/);
        return cls.length === 36;
    });
}
function noteIndexOf(noteDiv, parentNoteDiv) {
    const children = Array.from(parentNoteDiv.querySelector('.children').children);
    return children.indexOf(noteDiv);
}
// async function createNoteDiv(uuid, expansion = false) {
async function createNoteDiv(uuid) {
    const div = document.createElement('div');
    div.className = 'note ' + uuid;
    // div.addEventListener('expand', async (event) => renderNote(event.currentTarget, await db.get('notes', uuidOf(event.currentTarget)), true));
    // div.addEventListener('collapse', async (event) => renderNote(event.currentTarget, await db.get('notes', uuidOf(event.currentTarget)), false));
    div.addEventListener('expand', async (event) => {
        const update = {style: { expanded: true }};
        // await db.upsert('notes', { uuid: uuidOf(event.currentTarget), ...update });
        // render(event.currentTarget, await db.get('notes', uuidOf(event.currentTarget)));
        const noteData = await db.get('notes', uuidOf(event.currentTarget));
        render(event.currentTarget, noteData);
    });
    div.addEventListener('collapse', async (event) => {
        const update = {style: { expanded: false }};
        const noteData = await db.upsert('notes', { uuid: uuidOf(event.currentTarget), ...update });
        render(event.currentTarget, noteData);
    });
    const noteData = await db.get('notes', uuid);
    // await renderNote(div, noteData, expansion);
    render(div, noteData);
    return div;
}
/**
 * 
 * @param {HTMLElement} div
 * @returns {HTMLElement}
 */
async function render(div, noteData) {
    // console.log('rendering', div, 'with noteData:', noteData, 'and expansion:', expansion);
    console.log('rendering...', uuidOf(div).split('-')[0]);
    // if (!noteData) return div.remove();
    if (!noteData) {
        console.warn('Note data not found for UUID:', uuidOf(div), 'Removing note div.');
        div.remove();
        throw new Error('Note data not found for UUID: ' + uuidOf(div));
    }
    const contentDiv = div.querySelector('.content') || createContentDiv(div);

    div.append(contentDiv);

    const contentSpan = contentDiv.querySelector('span');
    if (contentSpan.textContent !== noteData.content) contentSpan.textContent = noteData.content;
    // if (expansion) {
    if (noteData.style.expanded) {
        div.classList.add('expanded');
        const childrenDiv = div.querySelector('.children') || createChildrenDiv(div);

        div.append(childrenDiv);
        
        while (childrenDiv.children.length > noteData.children.length) childrenDiv.lastChild.remove();
        await Promise.all(noteData.children.map(
            async (childUuid, index) => {
                const childDiv = childrenDiv.children[index];
                if (!childDiv) {
                    console.log('Creating child note:', childUuid);
                    childrenDiv.append(await createNoteDiv(childUuid));
                } else if (!childDiv.classList.contains(childUuid)) {
                    console.log('Replacing child note:', childDiv.className, 'with:', childUuid);
                    childDiv.replaceWith(await createNoteDiv(childUuid));
                }
            }
        ));
    } else {
        div.classList.remove('expanded');
        div.querySelector('.children')?.remove();
    }
    console.log('rendered    ', uuidOf(div).split('-')[0]);
    return div;
}

function createContentDiv(noteDiv) {
    const div = document.createElement('div');
    div.className = 'content';
    div.addEventListener('contextmenu', handleContextMenu);
    div.addEventListener('dblclick', handleDoubleClick);
    const img = document.createElement('img');
    img.src = 'icons/toggle.svg';
    img.addEventListener('click', async (event) => {
        event.stopPropagation();
        const noteDiv = event.target.closest('.note');
        const noteData = await db.get('notes', uuidOf(noteDiv));
        console.log('Toggling note:', noteData);
        const dataUpdate = { style: { expanded: !noteData.style.expanded } };
        const newNoteData = await db.upsert('notes', { uuid: uuidOf(noteDiv), ...dataUpdate });
        await update(uuidOf(noteDiv));
        // const eventType = noteDiv.classList.contains('expanded') ? 'collapse' : 'expand';
        // event.target.dispatchEvent(customEvents[eventType]);
    });
    const span = document.createElement('span');
    span.setAttribute('contenteditable', 'true');
    span.addEventListener('input', (event) => {
        event.stopPropagation();
        const noteDiv = event.target.closest('.note');
        const uuid = uuidOf(noteDiv);
        db.upsert('notes', { uuid: uuid, content: event.target.textContent });
    });
    span.addEventListener('keydown', handleKeyDown);
    span.addEventListener('blur', (event) => {
        const noteDiv = event.target.closest('.note');
        // update(uuidOf(noteDiv));
        // renderNote(noteDiv, await db.get('notes', uuidOf(noteDiv)));
    });
    div.append(img, span);
    noteDiv.append(div);
    return div;
}
function createChildrenDiv(noteDiv) {
    const div = document.createElement('div');
    div.className = 'children';
    noteDiv.append(div);
    return div;
}
async function update(uuid){
    const noteData = await db.get('notes', uuid);
    const noteDivs = document.querySelectorAll('.note.' + CSS.escape(uuid));
    // console.log('noteData:', noteData, 'noteDivs:', noteDivs);
    console.log('Updating note:', uuid, 'with data:', noteData, 'and divs:', noteDivs);
    return await Promise.all(Array.from(noteDivs).map(
        // async (noteDiv) => renderNote(noteDiv, noteData, noteDiv.classList.contains('expanded'))
        async (noteDiv) => render(noteDiv, noteData)
    ));
}
function handleContextMenu(event) {
    event.preventDefault();
    console.log('Context menu opened for note:', uuidOf(event.target.closest('.note')), '(', event, ')');
    const div = document.createElement('div');
    div.className = 'context-menu';
    div.innerHTML = `
        <div class="context-menu-item" data-action="edit">Edit</div>
        <div class="context-menu-item" data-action="delete">Delete</div>
    `;
    document.body.appendChild(div);
}
function handleDoubleClick(event) {
    event.stopPropagation();
    console.log('Double click on note:', uuidOf(event.target.closest('.note')), '(', event, ')');
    // const span = event.target;
    // span.focus();
    // document.execCommand('selectAll', false, null);
}
async function handleKeyDown(event) {
    const noteDiv = event.target.closest('.note');
    const uuid = noteDiv.className.split(' ').find(cls => cls !== 'note');
    const parentNoteDiv = noteDiv.parentNode.closest('.note') || noteDiv;
    if (event.key === "Enter") handleEnter(event);
    else if (event.key === "Tab") handleTab(event);
    else if (event.key === "Backspace") handleBackspace(event);
    else if (event.key === "Escape") span.blur();
    else if (event.key === "ArrowUp") moveFocus(noteDiv, -1);
    else if (event.key === "ArrowDown") moveFocus(noteDiv, 1);
}
async function handleEnter(event) {
    event.preventDefault();
    const noteDiv = event.target.closest('.note');
    const parentNoteDiv = noteDiv.parentNode.closest('.note') || noteDiv;
    const parentNoteUuid = uuidOf(parentNoteDiv);
    const index = Math.max(Array.from(parentNoteDiv.querySelector('.children').children).indexOf(noteDiv), 0);
    // const parentData = await db.get('notes', parentNoteUuid);
    const newNoteData = {
        ...noteData,
        uuid: crypto.randomUUID()
    };
    await db.add('notes', newNoteData);
    console.log('Added new note:', newNoteData);
    await spliceNote(parentNoteUuid, index + 1, 0, newNoteData.uuid);
    moveFocus(noteDiv, 1);
}

async function handleTab(event) {
    event.preventDefault();
    console.log('Tab key pressed on note:', uuidOf(event.target.closest('.note')), '(', event, ')');
    const noteDiv = event.target.closest('.note');
    const parentNoteDiv = noteDiv.parentNode?.closest('.note');
    if (!parentNoteDiv) return console.warn('Could not move note, due to missing parent');
    // await update(uuidOf(parentNoteDiv));
    // if (event.shiftKey) {
    //     const grandParentDiv = parentNoteDiv.parentNode?.closest('.note');
    //     if (grandParentDiv) {
    //         const parentIndex = noteIndexOf(parentNoteDiv, grandParentDiv);
    //         await spliceNote(uuidOf(grandParentDiv), parentIndex + 1, 0, uuidOf(noteDiv));
    //         await update(uuidOf(grandParentDiv));
    //         // moveFocus(noteDiv, 0);
    //         moveFocus(parentNoteDiv, 1);
    //     }
    // } else {
    //     const newParentNoteDiv = noteDiv.previousSibling;
    //     if (!newParentNoteDiv) return console.warn('Could not find new parent note');
    //     await spliceNote(uuidOf(newParentNoteDiv), 0, 0, uuidOf(noteDiv));
    //     await update(uuidOf(parentNoteDiv));
    //     await update(uuidOf(newParentNoteDiv));
    //     await renderNote(newParentNoteDiv, await db.get('notes', uuidOf(newParentNoteDiv)), true);
    //     moveFocus(newParentNoteDiv, 1);
    // }
    const newParentDiv = event.shiftKey ? parentNoteDiv.parentNode?.closest('.note') : noteDiv.previousSibling;
    if (!newParentDiv) return console.warn('Could not find new parent note');
    const newParentData = await db.upsert('notes', { uuid: uuidOf(newParentDiv), style: { expanded: true } });
    const newIndex = event.shiftKey ? noteIndexOf(parentNoteDiv, newParentDiv) + 1 : newParentData.children.length;
    const update = {style: { expanded: true }};
    await db.upsert('notes', { uuid: uuidOf(newParentDiv), ...update });
    await spliceNote(uuidOf(newParentDiv), newIndex, 0, uuidOf(noteDiv));

    const index = noteIndexOf(noteDiv, parentNoteDiv);
    await spliceNote(uuidOf(parentNoteDiv), index, 1);
    // await update(uuidOf(parentNoteDiv));
    // await update(uuidOf(newParentDiv));
    // await renderNote(newParentDiv, await db.get('notes', uuidOf(newParentDiv)), true);
    // render(newParentDiv, newParentData);
    moveFocus(newParentDiv, 1);
}

async function handleBackspace(event) {
    event.preventDefault();
    const noteDiv = event.target.closest('.note');
    const span = noteDiv.querySelector('.content > span');
    if (span.textContent.trim()) {
        // If the span is not empty, just remove the last character
        span.textContent = span.textContent.slice(0, -1);
    } else {
        // If the span is empty, remove the note
        const parentNoteDiv = noteDiv.parentNode.closest('.note');
        if (!parentNoteDiv) return; // Do nothing if there's no parent
        const index = Array.from(parentNoteDiv.querySelector('.children').children).indexOf(noteDiv);
        await spliceNote(uuidOf(parentNoteDiv), index, 1);
        moveFocus(noteDiv, -1);
        await update(uuidOf(parentNoteDiv));
    }
}

function moveFocus(div, direction) {
    if (!div) return console.error('No div found to move focus');
    console.log('move focus', direction, 'from:', div);
    const parentDiv = div.parentNode?.closest('.note');
    // const childrenDivs = div.querySelector('.children')?.children;
    const childDivs = div.querySelector('.children')?.children;
    if (direction === 0) div.querySelector('.content > span').focus();
    // else if (0 < direction && childrenDivs && direction <= childrenDivs.length) {
        // childrenDivs[direction - 1].querySelector('.content > span').focus();
    else if (0 < direction && childDivs && direction <= childDivs.length) {
        const span = childDivs[direction - 1].querySelector('.content > span');
        if (span) span.focus();
        else console.error('No span found to move focus in childDivs:', childDivs, '( index:', direction - 1, ', childDiv:', childDivs[direction - 1], ')');
    } else if (parentDiv) {
        const index = Array.from(parentDiv.querySelector('.children').children).indexOf(div);
        // const index = childDivs.indexOf(div);
        // const grandChildrenLength = parentDiv.querySelector(`.children > .note:nth-child(${index}) .children`)?.children.length || 0;
        // const grandChildrenLength = childDivs[]?.querySelector('.children')?.children.length || 0;
        // const newDirection = direction + 1 + index;
        const adjustedIndex = index - (direction > 0 ? childDivs?.length || 0 : 0);
        const newDirection = direction + 1 + adjustedIndex;
        // console.log('Moving focus to parent:', parentDiv, 'with new direction:', newDirection, 'direction:', direction, 'index:', index, 'grandChildrenLength:', grandChildrenLength);
        console.log('Moving focus to parent:', parentDiv, 'with new direction:', newDirection, 'direction:', direction, 'index:', index, 'childDivs.length:', childDivs?.length || 0);
        moveFocus(parentDiv, newDirection);
    // } else {
    //     // console.log('no more parents');
    //     console.warn('No more parents');
    // }
    } else if (direction < 0) {
        console.warn('direction out of bounds (-)');
        div.querySelector('.content > span').focus();
    } else {
        console.warn('direction out of bounds (+)');
        childDivs[childDivs.length - 1].querySelector('.content > span').focus();
    }
}

async function spliceNote(uuid, start, deleteCount, ...children) {
    console.log('Splicing note', uuid, 'at', start, 'deleting', deleteCount, 'and inserting', children);
    const noteData = await db.get('notes', uuid);
    if (!noteData) throw new Error('Note not found: ' + uuid);
    const updatedChildren = [
        ...noteData.children.slice(0, start),
        ...children,
        ...noteData.children.slice(start + deleteCount)
    ];
    await db.upsert('notes', { uuid, children: updatedChildren });
    // moveFocus()
    await update(uuid);
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
const defaultNoteData = {
    uuid: '',
    content: '',
    children: [],
    style: {
        expanded: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
async function init() {
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
    const url = new URL(location.href);
    if (!url.searchParams.has('uuid')) {
        console.log('No UUID found in URL. Redirecting to home...');
        if (!localStorage.getItem('home')) {
            console.log('No home UUID found in localStorage. Creating a new one...');
            const uuid = crypto.randomUUID();
            localStorage.setItem('home', uuid);
            // await db.add('notes', {
            //     ...defaultNoteData,
            //     uuid: uuid,
            //     content: 'home',
            //     createdAt: new Date().toISOString(),
            //     updatedAt: new Date().toISOString()
            // });
            await db.upsert('notes', {
                ...noteData,
                uuid: uuid,
                content: 'home',
                style: {
                    expanded: true
                }
            });
        }
        url.searchParams.set('uuid', localStorage.getItem('home'));
        history.replaceState({}, '', url.toString());
    }
    const uuid = url.searchParams.get('uuid');
    main.innerHTML = '';
    // main.append(await createNoteDiv(uuid, customEvents.expand));
    // main.append(await createNoteDiv(uuid, true));
    main.append(await createNoteDiv(uuid));
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

function resetAllAndImSureToDeleteEverything() {
    // db.clear('notes');
    // db.clear('apiUrls');
    indexedDB.deleteDatabase('divein'); // Clear IndexedDB
    localStorage.clear(); // Clear localStorage
    history.replaceState({}, '', location.href.split('?')[0]); // Clear URL parameters
    location.reload(); // Reload the page
}