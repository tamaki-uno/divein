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

export function initContainer(uuid) {
    if (!uuid) uuid = crypto.randomUUID();
    const container = document.createElement('div');
    container.className = 'container';
    container.id = uuid;

    container.appendChild(initLine(uuid));
    container.appendChild(initChildren());
    return container;
}

export function initLine(uuid) {
    const contentLine = document.createElement('div');
    contentLine.className = 'contentLine';

    const icon = document.createElement('img');
    icon.src = './icons/closed.svg';
    contentLine.appendChild(icon);
    icon.addEventListener('click', toggleOpen);
    contentLine.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'content';
    content.innerText = window.localStorage.getItem(uuid) || 'Type your content here...';
    content.addEventListener('input', () => {
        window.localStorage.setItem(uuid, content.innerText);
    });
    contentLine.appendChild(content);
    return contentLine;
}

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

    const propDiv = document.createElement('div');
    propDiv.className = 'props';
    propDiv.innerText = 'Props';
    childrenDiv.appendChild(propDiv);

    return childrenDiv;
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