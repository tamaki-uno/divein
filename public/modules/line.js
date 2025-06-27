import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public', 'template.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const htmlPath = path.join(process.cwd(), 'public', 'modules', 'line.html');

class Line {
    constructor(record = template, level = 0) {
        this.record = { ...record };
        this.level = level;
        fetch(htmlPath)
            .then(response => response.text())
            .then(html => {
                this.html = html;
            })
            .catch(error => console.error('Error loading line template:', error));
    }
    init() {
        if (!this.html) {
            console.error('HTML template not loaded yet.');
            return;
        }
        this.html.querySelector('button.toggle-button').addEventListener('click', () => this.toggle());
        this.html.querySelector('img.toggle-icon').addEventListener('click', (event) => {
            event.stopPropagation(); // イベントのバブリングを防ぐ
    openToggle() {
        const toggleButton = this.html.querySelector('.toggle-button');
        if (toggleButton) {
            toggleButton.classList.toggle('open');
            const icon = toggleButton.querySelector('.toggle-icon');
            icon.src = toggleButton.classList.contains('open') ? '/icon/opened.svg' : '/icon/closed.svg';
        }
    }
    addChild() {}
}




export function clickIcon(event) {
    const icon = event.target;
    if (icon.tagName !== 'IMG') return; // クリックされたのが画像でない場合は無視

    // アイコンの親要素を取得
    const line = icon.closest('.line');
    if (!line) return; // 親要素が見つからない場合は無視

    // トグルボタンのアイコンを切り替え
    const toggleButton = line.querySelector('.toggle-button');
    if (toggleButton) {
        const isOpen = toggleButton.classList.toggle('open');
        icon.src = isOpen ? '/icon/opened.svg' : '/icon/closed.svg';
    }
}

expor