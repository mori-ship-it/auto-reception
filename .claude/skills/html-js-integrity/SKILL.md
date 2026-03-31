---
description: html_body.txt または src/app.js を編集した際に自動発動し、onclick 関数の整合性を検証する
globs:
  - html_body.txt
  - src/app.js
  - src/**/*.js
---

# HTML-JS onclick 整合性チェック

html_body.txt または src/ 配下の JS ファイルを編集したら、コミット前に以下を必ず実行すること:

1. html_body.txt 内の全 onclick="functionName(...)" から関数名を抽出する
2. src/app.js および src/ 配下の全 .js ファイルで window に公開されている関数名を抽出する
3. HTML 側にあって JS 側にない関数がある場合:
   - 該当関数のリストを表示する
   - JS 側に関数の実装を追加して window に公開する（既存コードの末尾に追記）
   - 修正後に再度チェックして不整合が解消されたことを確認する
4. 不整合が解消されるまでコミットしない
