
const defaultNote = {
    payload: {
        uuid: '',
        content: {
            text: 'This is default note',
        },
        type: 'default',
        css: ''
    },
    from: 'anonymous',
    sign: '',
    to: 'all',
};


async function getNote(db, uuid) {
    return await db.get('notes', uuid) || {
        ...defaultNote,
        payload: {
            ...defaultNote.payload,
            uuid: uuid,
        }
    };
}

const types = {};

const typeCache = {};

class Template {
    constructor(name, html) {
        this.name = name;
        this.html = html;
    }

    fill(content) {
        const 
    }
}

// function replaceTemplate(template, content) {
//     // # in template
//     const placeholder = template.querySelector('#content');
//     if (placeholder) {
//         placeholder.innerHTML = content;
//     }
// }

function getTemplate(name) {
    if (types[name]) return types[name];
    try {
        const response = await fetch(`types/${name}.html`);
        if (!response.ok) throw new Error('Type not found');
        const html = await response.text();
        const template = new Template(name, html);
        types[name] = template;
        return template;
    } catch (error) {
        console.error(`Error fetching type ${name}:`, error);
    }
}

async function render(db, uuid) {
    const data = await getNote(db, uuid);
    // const typeTemplate = await getType(data.payload.type);
    const 
    // const textHTML = format
    const parser = new DOMParser();
    // const templateDOM = parser.parseFromString(typeHTML, 'text/html');
    const DOM = 
    return DOM;
}