# memo

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
