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
    initLocalStorage();
    const line = initContainer(url.pathname.replace('/divein', '').replace(/^\//, ''));
    document.body.appendChild(line);
    document.getElementById('loading').style.display = 'none';
}

// export function showLoading() {
//     const loading = document.getElementById('loading');
//     loading.style.display = 'block';
// }
// export function hideLoading() {
//     const loading = document.getElementById('loading');
//     loading.style.display = 'none';
// }

export function initLocalStorage() {
    if (!localStorage.getItem('menu')) {
        localStorage.setItem('menu', 'Menu');
        localStorage.setItem('childrenOfMenu', JSON.stringify([
            'sort',
            'filter',
            'style',
        ]));
    }
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
    const contentText = localStorage.getItem(uuid) || 'Type your content here...';
    if (contentText.startsWith('http://') || contentText.startsWith('https://')) {
    } else if (contentText.startsWith('#') || contentText.startsWith('＃')) {
    } else if (contentText.startsWith('!') || contentText.startsWith('！')) {
    } else {
        content.innerText = contentText;
    }
    // content.innerText = window.localStorage.getItem(uuid) || 'Type your content here...';
    content.addEventListener('input', () => {
        window.localStorage.setItem(uuid, content.innerText);
    });
    contentLine.appendChild(content);
    return contentLine;
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