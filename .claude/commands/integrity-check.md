html_body.txt の onclick 属性で呼ばれている関数名をすべて抽出し、src/app.js（および src/ 配下の他の .js ファイル）で window に公開されている関数名と突き合わせてください。

手順:
1. html_body.txt から onclick="functionName(...)" パターンを grep で抽出し、関数名の一覧を作る
2. src/app.js および src/ 配下の .js ファイルから window.functionName = または window[k] = パターンを grep で抽出し、公開関数名の一覧を作る
3. HTML側にあって JS側にない関数（未実装）を差分として表示する
4. 不整合があれば一覧で報告し、修正案を提示する
