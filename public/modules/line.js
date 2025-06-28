// import { saveRecordToIndexedDB,getRecordFromIndexedDB, syncDB } from './database';
import { saveRecordToIndexedDB, getRecordFromIndexedDB, syncDB } from '/modules/database.js';


// const recordTemplatePath = path.join(process.cwd(), 'public', 'record.json');
// const lineHtmlPath = path.join(process.cwd(), 'public', 'modules', 'line.html');
// const menuHtmlPath = path.join(process.cwd(), 'public', 'modules', 'menu.html');
const recordTemplatePath = '/record.json';
const lineHtmlPath = '/modules/line.html';
const menuHtmlPath = '/modules/menu.html';


export default class Line {
    // コンストラクタ
    constructor(uuid, level = 0) {
        this.uuid = uuid;
        this.level = level;
        // this.renderParent is undefined, remove or define as needed
        this.isOpen = false;
        syncDB(uuid).then(record => {
                this.record = record;
            })
            .catch(error => {
                console.error('Error syncing with IndexedDB:', error);
                getRecordFromIndexedDB(uuid)
                    .then(record => {
                        this.record = record;
                        if (!this.record) {
                            console.error(`Record with UUID ${uuid} not found in IndexedDB`);
                            return this.loadTemplate().then(template => {
                                this.record = template; // Use the loaded template if record not found
                                saveRecordToIndexedDB(this.record)
                                    .then(() => {
                                        console.log('Record saved to IndexedDB:', this.record);
                                    })
                                    .catch(error => {
                                        console.error('Error saving record to IndexedDB:', error);
                                    });
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error getting record from IndexedDB:', error);
                        throw error;
                    });
            })

        this.loadHtml()
            .then(html => {
                this.html = html.html;
                this.menuHtml = html.menu;
                this.init();
            })
            .catch(error => {
                console.error('Error loading HTML:', error);
            });
    }
    // recordのテンプレートをロード
    async loadTemplate() {
        try {
            const response = await fetch(recordTemplatePath);
            // const template = await response.json();
            this.record = await response.json();
            return template;
        } catch (error) {
            console.error('Failed to load record template:', error);
            throw error;
        }
    }
    // HTMLテンプレートをロード
    async loadHtml() {
        const lineHtml = await fetch(lineHtmlPath)
            .then(response => {
                const html = response.text();
                return new DOMParser().parseFromString(html, 'text/html');
            })
            .catch(error => {
                console.error('Failed to load HTML template:', error);
            });
        const menuHtml = await fetch(menuHtmlPath)
            .then(response => {
                const html = response.text();
                return new DOMParser().parseFromString(html, 'text/html');
            })
            .catch(error => {
                console.error('Failed to load menu HTML template:', error);
            });
        this.html = lineHtml;
        this.menuHtml = menuHtml;
        return {
            html: lineHtml,
            menu: menuHtml
        };
    }
    // 初期化処理
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
    // トグルボタンのクリックイベント
    toggle(event) {
        console.log('Toggle icon clicked');
        const icon = event.target;
        this.isOpen = !this.isOpen;
        icon.src = this.isOpen ? '/icon/opened.svg' : '/icon/closed.svg';
        this.html.querySelector('.children').classList.toggle('hidden', !this.isOpen);
    }
    // 右クリックメニューの表示
    menu(event) {
        // 右クリックメニューの表示処理をここに実装
        console.log('Right-click menu triggered at', event.clientX, event.clientY);
        // 例: カスタムメニューを表示するなど
    }
    // コンテンツの編集イベント
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
    // 子要素追加ボタンのクリックイベント
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




// export function clickIcon(event) {
//     const icon = event.target;
//     if (icon.tagName !== 'IMG') return; // クリックされたのが画像でない場合は無視

//     // アイコンの親要素を取得
//     const line = icon.closest('.line');
//     if (!line) return; // 親要素が見つからない場合は無視

//     // トグルボタンのアイコンを切り替え
//     const toggleButton = line.querySelector('.toggle-button');
//     if (toggleButton) {
//         const isOpen = toggleButton.classList.toggle('open');
//         icon.src = isOpen ? '/icon/opened.svg' : '/icon/closed.svg';
//     }
// }

// expor