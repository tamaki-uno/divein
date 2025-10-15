# memo

## DOM-First Event-Driven

1. Create noteDiv (createDiv(uuid))
   1. Create noteDiv
   2. className
   3. add event-listner: expand, collapse
   4. Create contentDiv
      1. create toggleButton
         1. create img
         2. src
         3. addEventListeners: click, dblclick, drag, contextmenu
      2. create contentSpan
         1. create span
         2. contentEditable
         3. add event-listener: keydown, input
   5. Create childrenDiv
      1. create div
2. Event occurs on DOM element
   1. Edit noteDiv > contentDiv > contentSpan
      1. (on focus: )
      2. keydown: handleKeyDown(event)
      3. on input: update IDB
      4. (on change: update IDB)
      5. (on blur: update and apply style)
      6. on drag:  
   2. Collapse: change visibility of noteDiv > childrenDiv (handleCollapse)
   3. Expand: change visibility of noteDiv > childrenDiv (handleExpand)
   4. drag
   5. contextmenu
3. On updating IDB (async update(noteData))
   1. (Update IDB: db.upsert)
   2. upsert to API DB: api.upsert
   3. Update DOM:
      1. for each noteDiv.{uuid}
      2. If content changed: update contentSpan
      3. If children changed: update childrenDiv

render(noteData) -> 

## Github Pagesなどの静的ホスティングで動作するように

* 基本的にすべての機能をブラウザで動作
* +αとしてAPIとの同期機能
* バックエンドは
  * GET用の静的ホスティングハンドラ
  * POST用のAPIハンドラ
* の構成
* あとはログインとどうするか。
* ログイン機能が必要なのはRead/Writeの権限だけだからサーバーごとに管理すれば問題ないのでは
  * そもそも共有はサーバーを介してされるからローカル側は書き込み権限を無視しても
  * サーバ上のデータは権限をサーバ側で確認
* データ形状
  * ローカルデータ
    * uuid
    * type
    * content
    * childUuids
  * サーバデータ
    * サーバデータのuuid
    * ローカルデータ
    * 権限
      * 書き込み可能ユーザリスト
      * 読み取り可能ユーザリスト
    * 更新情報
      * 作成日時
      * 先祖のuuid

## プログラム構成

* api: server api programs
  * package.json
  * index.js
    * start server (get.js and/or post.js)
  * database
  * assets
  * server
    * get.js
    * post.js
* docs: client side
  * index.html
    * loading
    * main
    * toggle view
      * toggle view tree(mind map or directional graph) or not
    * menu
      * open and close menu
      * add api server
  * style.css
  * script.js
    * routeing for redirecting with ? p
    * toggle menu (#menu(or maybe #settings or #config or #options or #preferences))
  * 404.html
    * redirect to index.html with ?page=location.pathname
  * module
    * record.js
      * class record
        * constructor(uuid)
          * this.uuid
          * getDataFromIndexedDB(uuid)
          * this.type
          * this.content
          * this.childUuids
          * this.html = getHtml(this.type)
        * move
        * edit
        * render
        * sync
        * delete
        * open
        * close
    * api.js
      * manage connection to api
      * function sync 
    * database.js
      * manage access to IndexedDB
    * html.js
      * get html template and 
    * html
      * 
* memo.md
* README.md

/{uuid}
/?page={page}

## data structure

* localData
  * uuid
  * type
  * content
  * childUuids
* serverData
  * serverDataUuid
  * localData
  * permissions
    * writableUserList
    * readableUserList
  * updateInfo
    * createdAt
    * ancestorUuid

## data structure(or directory) by ui/ux (i mean how user feel and look and use)

* username(type: user)
  * preferences(type: preferences)
    * api url (type: apiUrl)
    * theme color (type: themeColor)
    * view mode (type: viewMode)
  * templates(type: templates)
    * text (type: template)
    * ul (type: template)
    * ol (type: template)
    * checklist (type: template)
    * card (type: template)
      * propertie (type: text)
    * link (type: template)
  * user


## デザインに関するメモ

## # svgの基本的なやつ

* 100x100
* 10 + 80x80 + 10
* stroke-width 12
* stroke #333
* stroke-linecap round
* stroke-linejoin round
* fill none

```svg
  <polygon
    points="20,10 20,90 89.282032302755,50"
    stroke="#333" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />
```

### 全体的な話

* theme color #333
* background #eee
* accent color #27d



## 構成

* UUID-content: kontent
* UUID-children: children


## 2025-10

data-first event-driven

{
  'uuid':'',
  'type':'',
  'content':'',
  'pubkey':'',
  'sign':''
}

types

* note 'text'
  * '{'content':'', 'style':''}'
* link 'uuid'
  * '{'uuid':'', 'style':''}'
* embed 'url'
  * ''(url)
<!-- * image
  * ''
* video
* music -->

uuid, type, content, style, pubkey, sign

types: text, container, url

uuid, type, contents[], style{}, pubkey, sign

onserver: + createdAt, updatedAt, visibleFor, editableFor

uuid, type, contents[], style{}, from, to, sign

uuid, style{}, contents[], from, to, sign, parent

uuid, style{}, contents{}, from, to, sign, parent

ex)

```js
{
  'uuid': '550e8400-e29b-41d4-a716-446655440000',
  'style': {
    'url': 'https://github.com/tamaki-uno/divein/styles/text.submarine',
  },
  'content': {
    'text': 'hello, world',
  },
  'from': 'ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAsotK4PbdadfhbXbTPIsxvwKFIg+8Lmp0pXKckAOuSnoaaT516ddj9rnIJlE/JaJf0cltp+087R6Ov8LPY+QeQvzzUfGiAQQVdwBiMrVQVqXylIoidU86uz/w8GITXltu1m+fXO+O26dEESQWsAgiNfVOzB57OCadGX1iCy6/2CxvNEB3mnHkvmC+H3azP27tTARHXqTBThuxjwR9iZBkx2iYSW3tVg0cDdzuLP3ULVrJXHrrLCr1HGaAzQEs0M+vtrV+G8gLlkeqbKy4YKWKUY/xkM8c/20jnSKP36SeU4fezbRQREkYqRjx4a3kx97K1sfch/WKwzuHWqhYYMtvEw== taro@test.kyoto-u.ac.jp',
  'to': 'ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAsotK4PbdadfhbXbTPIsxvwKFIg+8Lmp0pXKckAOuSnoaaT516ddj9rnIJlE/JaJf0cltp+087R6Ov8LPY+QeQvzzUfGiAQQVdwBiMrVQVqXylIoidU86uz/w8GITXltu1m+fXO+O26dEESQWsAgiNfVOzB57OCadGX1iCy6/2CxvNEB3mnHkvmC+H3azP27tTARHXqTBThuxjwR9iZBkx2iYSW3tVg0cDdzuLP3ULVrJXHrrLCr1HGaAzQEs0M+vtrV+G8gLlkeqbKy4YKWKUY/xkM8c/20jnSKP36SeU4fezbRQREkYqRjx4a3kx97K1sfch/WKwzuHWqhYYMtvEw== taro@test.kyoto-u.ac.jp',
  'sign': 'asdlfkjaeionlasdkjoaiemlkmcdslafel23948hg9842jwe0923h',
  'parents': [
    'anoeilsdkjfanoviasdlkj',
    'asnnlisvksdjlielndskfa'
  ]
}
```

styles/text.submarine

```html
<div>
  <p>

  </p>
</div>
```

```js
{
  'payload': {
    'uuid': '',
    'content': {
      '': '',
    },
    'dhtml': 'https://',
    'dstyle': 'https://',
    'parents': [
      'lfjie',
      'asofije',
      'ajlsife'
    ]
  },
  'from': 'ssh-rsa',
  'sign': 'asieji',
  'to': 'ssh-rsa',
}
```

```js
'payload': {
  'uuid': '',
  'content': {
    'text':'ahodsfiel',
  },
  // 'type': '/types/',
  // 'css': 'div {background-color: }',
  'style': {
    'type': '',
    'css': ''
  }
  'parents':
}
```

```html
<div>
  <p>
    #text
  </p>
</div>
```
