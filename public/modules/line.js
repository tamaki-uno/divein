import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public', 'template.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const htmlPath = path.join(process.cwd(), 'public', 'modules', 'line.html');

class Line {
    constructor(record = template, level = 0) {
        this.record = { ...record };
        this.level = level;
        this.isOpen = false;
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
        this.html.querySelector('img.toggle-icon').addEventListener('click', (event) => this.toggle(event));
        this.html.querySelector('img.toggle-icon').addEventListener('contextmenu', (event) => {
            event.preventDefault(); // 右クリックメニューを無効化
            this.menu(event);
        });
        this.html.querySelector('div.content').addEventListener('click', (event) => this.edit(event));
        this.html.querySelector('div.content').addEventListener('contextmenu', (event) => {
            event.preventDefault(); // 右クリックメニューを無効化
            this.menu(event);
        });
        this.html.querySelector('button.add-button').addEventListener('click', () => this.addChild());
        this.html.querySelector('button.add-button').addEventListener('contextmenu', (event) => {
            event.preventDefault(); // 右クリックメニューを無効化
            this.menu(event);
        });
    }
    toggle(event) {
        console.log('Toggle icon clicked');
        const icon = event.target;
        this.isOpen = !this.isOpen;
        icon.src = this.isOpen ? '/icon/opened.svg' : '/icon/closed.svg';
        this.html.querySelector('.children').classList.toggle('hidden', !this.isOpen);
        // if (icon.tagName !== 'IMG') return; // クリックされたのが画像でない場合は無視

        // // アイコンの親要素を取得
        // const line = icon.closest('.line');
        // if (!line) return; // 親要素が見つからない場合は無視

        // // トグルボタンのアイコンを切り替え
        // const toggleButton = line.querySelector('.toggle-button');
        // if (toggleButton) {
        //     this.isOpen = toggleButton.classList.toggle('open');
        //     icon.src = this.isOpen ? '/icon/open.svg' : '/icon/closed.svg';
        //     line.querySelector('.content').classList.toggle('hidden', !isOpen);
        // }
    }
    menu(event) {
        // 右クリックメニューの表示処理をここに実装
        console.log('Right-click menu triggered at', event.clientX, event.clientY);
        // 例: カスタムメニューを表示するなど
    }
    edit(event) {
        // コンテンツの編集処理をここに実装
        console.log('Content clicked for editing');
        // 例: テキストエリアを表示して編集できるようにするなど
    }
    addChild() {
        // 子要素追加処理をここに実装
        console.log('Add child button clicked');
        // 例: 新しい子要素を追加するなど
    }
    render() {
        return this.html;
    }
    syncDB() {
        
    }
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