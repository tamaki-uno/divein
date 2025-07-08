export default class Line {
    // constructor(uuid, deleteThis) {
    constructor(uuid) {
        if (!uuid) uuid = crypto.randomUUID();
        this.uuid = uuid;
        // this.deleteThis = () => deleteThis(uuid);
        this.children = JSON.parse(localStorage.getItem(`${this.uuid}-children`)) || [];
        this.content = localStorage.getItem(`${this.uuid}-content`) || '';
        this.sort = JSON.parse(localStorage.getItem(`${this.uuid}-sort`)) || defaultSort;
        this.filter = JSON.parse(localStorage.getItem(`${this.uuid}-filter`)) || defaultFilter;
        this.style = JSON.parse(localStorage.getItem(`${this.uuid}-style`)) || defaultStyle;
        this.isOpen = false;
    }
    addChild(uuid) {
        // const uuid = uuid || crypto.randomUUID();
        const childUuid = uuid || crypto.randomUUID();
        this.children.push(childUuid);
        localStorage.setItem(`${this.uuid}-children`, JSON.stringify(this.children));
    }
    // deleteChild(uuid) {
    //     this.children = this.children.filter(child => child !== uuid);
    //     localStorage.setItem(`${this.uuid}-children`, JSON.stringify(this.children));
    // }
    copyThis() {
        const newLine = new Line(crypto.randomUUID(), this.deleteThis);
        newLine.children = [...this.children];
        newLine.content = this.content;
        newLine.sort = { ...this.sort };
        newLine.filter = { ...this.filter };
        newLine.style = { ...this.style };
        return newLine;
    }
    setContent(content) {
        this.content = content;
        localStorage.setItem(`${this.uuid}-content`, this.content);
    }
    getContent() {
        this.content = localStorage.getItem(`${this.uuid}-content`) || '';
        return this.content;
    }
}

const defaultSort = {
    children: 'Custom',
    grandchildren: 'Custom'
};

const defaultFilter = {
    children: '*',
    grandchildren: '*'
}

const defaultStyle = {
    bold: false,
    italic: false,
    strikethrough: false,
    // underline: false,
    color: '#000000',
    // backgroundColor: '#ffffff',
    // fontSize: '16px',
    // fontFamily: 'Arial, sans-serif',
    // textAlign: 'left'
};