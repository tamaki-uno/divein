import Line from './scripts/line.js';

window.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location);
    route(url);
});

export default function route(url) {
    if (url.searchParams.has('page')) return route(url.searchParams.get('page'));
    document.getElementById('loading').style.display = 'block';
    window.history.replaceState({}, '', url.pathname);
    // const line = initLine(url.pathname.replace('/divein', '').replace(/^\//, ''));
    // const line = initLine();
    // initLocalStorage();
    const line = initContainer(url.pathname.replace('/divein', '').replace(/^\//, ''));
    document.body.appendChild(line);
    document.getElementById('loading').style.display = 'none';
}

export function initContainer(uuid) {
    if (!uuid) uuid = crypto.randomUUID();
    const container = document.createElement('div');
    container.className = 'container';
    container.id = uuid;

    container.appendChild(initLine(uuid));
    container.appendChild(initChildren());
    if (uuid === 'menu') {
        container.appendChild(initMenu());
    }
    return container;
}

export function initLine(uuid) {
    const line = new Line(uuid);

    const contentLine = document.createElement('div');
    contentLine.className = 'contentLine';

    const icon = document.createElement('img');
    icon.className = 'icon';
    icon.src = './icons/closed.svg';
    contentLine.appendChild(icon);
    icon.addEventListener('click', toggleOpen);
    contentLine.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'content';
    // content.contentEditable = true;
    content.setAttribute('contenteditable', 'true');
    // const contentText = localStorage.getItem(uuid) || 'Type your content here...';
    const contentText = line.getContent() || 'Type your content here...';
    formatContent(content);
    // content.innerText = window.localStorage.getItem(uuid) || 'Type your content here...';
    // content.addEventListener('input', () => {
    content.addEventListener('change', () => {
        // line.setContent(content.innerText);
        formatContent(content);
        line.setContent(content.innerHTML);
    });
    content.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents the default action of adding a new line
            addNewLine(contentLine, line);
        // } else if (event.key === 'Tab') {
        } else if (event.key === 'Tab' || event.key === '　') {
            event.preventDefault(); // Prevents the default action of adding a tab character
            becomeChild(contentLine, line);
        }
    });

    contentLine.appendChild(content);
    return contentLine;
}

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