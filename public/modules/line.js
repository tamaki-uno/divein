import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public', 'template.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const htmlPath = path.join(process.cwd(), 'public', 'modules', 'line.html');

class Line {
    constructor(record = template, level = 0, renderParent = null) {
        this.record = { ...record };
        if (!record.uuid) {
            this.record.uuid = crypto.randomUUID(); // UUIDを生成
            this.record.createdAt = new Date().toISOString();
            this.record.updatedAt = new Date().toISOString();
            this.record.createdBy = window.user?.uuid || 'anonymous'; // 作成者のUUIDを設定
            this.record.updatedBy = window.user?.uuid || 'anonymous'; // 更新者のUUID
        }
        this.level = level;
        this.renderParent = renderParent;
        this.isOpen = false;
        fetch(htmlPath)
            .then(response => response.text())
            .then(html => {
                this.html = html;
                this.init();
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
        this.html.querySelector('div.content').innerText = this.record.content || 'Click to edit';
        this.html.querySelector('div.content').addEventListener('click', (event) => this.edit(event));
        this.html.querySelector('div.content').addEventListener('contextmenu', (event) => {
            event.preventDefault(); // 右クリックメニューを無効化
            this.menu(event);
        });
        this.html.querySelector('img.add-icon').addEventListener('click', () => this.addChild());
        this.html.querySelector('img.add-icon').addEventListener('contextmenu', (event) => {
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
        const contentDiv = event.target;
        const textarea = document.createElement('textarea');
        textarea.value = contentDiv.innerText;
        textarea.addEventListener('blur', () => {
            contentDiv.innerText = textarea.value;
            this.record.content = textarea.value; // レコードを更新
            this.syncDB(); // データベースと同期
        });
        contentDiv.replaceWith(textarea);
        textarea.focus();
    }
    addChild() {
        // 子要素追加処理をここに実装
        console.log('Add child button clicked');
        // 例: 新しい子要素を追加するなど
        const newChild = new Line({ content: '' }, this.level + 1, this.render);
        this.record.children.push(newChild.record.uuid); // 子要素のUUIDを追加
        this.syncDB(); // データベースと同期
        this.html.querySelector('.children').appendChild(newChild.render());

    }
    render(childrenHtml = '') {
        return this.html;
    }
    update() {
        this.pa
    }
    syncDB() {
        // データベースとの同期処理をここに実装
        console.log('Syncing record with database');
        // 例: レコードをデータベースに保存するなど
        fetch('/api/v0/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.record)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Sync response:', data);
                if (data.success) {
                    this.record = data.record; // レコードを更新
                } else {
                    console.error('Sync failed:', data.message);
                }
            })
            .catch(error => {
                console.error('Sync error:', error);
            });
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