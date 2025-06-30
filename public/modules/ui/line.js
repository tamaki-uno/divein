import Record from './record.js';

export default class Line extends Record {
    constructor(uuid, parentNode) {
        super(uuid, parentNode);
        this.HTML_URL = '/modules/ui/html/line.html'; // Line HTMLのURL
    }
}