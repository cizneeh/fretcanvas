---
name: ui-audit
description: Use when the user wants broad UI and end-to-end verification for this app, including browser/profile coverage, visual checks, interaction flows, undo/redo, persistence, and export validation, with findings written to tmp/report1.
---

# UI Audit

このスキルは、このプロジェクトで広めの UI 監査と E2E 確認を行うときに使う。

対象:

- アプリ全体の見た目確認
- 主要操作フローの動作確認
- Undo / Redo の重点確認
- reload 後の永続化確認
- PNG / SVG の preview と実 export 確認
- 結果を `tmp/report1` に Markdown レポートとして保存

## 対象環境

監査開始時に、まず対象環境を 1 つ決める。

- `local`
- `staging`

`local`

- 手元で起動したアプリを対象にする
- 例: `http://127.0.0.1:4321`, `http://127.0.0.1:4173`
- 開発中の差分確認、軽微修正後の再確認に向く

`staging`

- ネットワーク越しに見えるステージング環境を対象にする
- 検証環境が ブランチごとに作られるため、ステージングで確認する場合はユーザーにURLの確認を求めてください
- 実デプロイ状態に近い確認に向く

レポートには必ず対象環境と対象 URL を明記する。

このスキルを使うときは、何かしらの変更をプロダクションに入れるときです。
そのため、開発中のブランチでの変更内容を重点的に動作確認してください。

## 使うとき

次のような依頼で使う。

- 複数ブラウザや複数 OS 想定で動作確認してほしい
- UI 崩れを見ながら修正してほしい
- 履歴、context menu、export まで含めて広く監査してほしい
- 画面スクリーンショット付きのレポートを `tmp/report1` に出してほしい

## 前提

- 実行対象は `local` または `staging`
- スクリーンショットとレポートは必ずプロジェクト内の `tmp/report1` に保存する
- 軽微な不具合はその場で修正してよい
- 修正方針に判断が必要な不具合はレポートに残し、勝手に仕様変更しない
- UI が激しく変わる時期は、一時的な監査スクリプトは `tmp/report1` に置いてよい。ユーザーが求めない限り永続化前提にしない

## プロファイル

可能なら以下の 4 プロファイルを対象にする。

1. `macOS + Chrome`
2. `macOS + Safari`
3. `Windows + Chrome`
4. `Windows + Microsoft Edge`

ローカル環境で実機が無い場合は次の近似でよい。

- `macOS + Chrome`: ローカルの Chrome 実バイナリ
- `macOS + Safari`: Playwright `WebKit`
- `Windows + Chrome`: Windows UA / viewport の近似
- `Windows + Microsoft Edge`: Edge UA / viewport の近似

レポートには必ず制約を書く。

- Windows 実機ではない場合は、その旨を書く
- Safari.app 直ではなく WebKit 近似なら、その旨を書く
- 実機フォント描画やネイティブスクロールバー差分は未確認と明記する

## 基本フロー

1. 対象環境を `local` か `staging` から決める
2. `local` の場合だけ必要に応じてアプリを起動する
3. 対象 URL を確定する
4. `tmp/report1` を作る
5. 各プロファイルで同じ主要フローを確認する
6. コンソールエラーとページエラーを記録する
7. 主要状態のスクリーンショットを保存する
8. 軽微な不具合があれば修正し、必要なら再確認する
9. `tmp/report1/report.md` に結果を書く

## 環境ごとの扱い

### local

- 必要ならローカルサーバーを起動する
- 問題を見つけたら、そのまま修正して再確認してよい
- 修正した場合は、どの確認を再実施したかレポートに書く

### staging

- ステージング環境そのものは変更しない
- 問題を見つけたら再現手順と観測結果をレポートに残す
- 手元で修正まで進める場合は、ステージング監査とローカル修正確認を分けて記録する

## 最低限確認する項目

各プロファイルで最低限これを確認する。

- アプリ初期表示
- `Add Scale Notes`
- chord mode での手動入力
- 手動入力の `Enter` 適用
- ノートのコンテキストメニュー表示
- tuning menu の preset 適用
- Export Settings 内の `PNG / SVG` preview

## 詳細監査で確認する項目

広めの監査では、以下を確認する。

- `Add Scale Notes` の追加、Undo、Redo
- chord 手動入力の `Enter` 適用
- `Add Chord Tones` の追加、Undo、Redo
- 単ノートの context menu 操作
- `Emphasize`
- `Dim`
- `Bend`
- 選択矩形からの selection context menu 操作
- 一括 `Dim`
- 一括 `Emphasize`
- 一括削除
- ノート間ドラッグによる connection 作成
- Export Range ハンドルのドラッグ
- `Background Opacity` の変更
- tuning preset の Apply
- reload 後の永続化確認
- 実ファイルとしての `PNG` / `SVG` export

## 履歴まわりの重点確認

履歴は特に重点的に見る。

- `Add Scale Notes` の Undo / Redo
- `Add Chord Tones` の Undo / Redo
- 単ノート `Emphasize / Dim / Bend` の Undo / Redo
- 一括 `Dim / Emphasize / Delete` の Undo / Redo
- connection 作成の Undo / Redo
- Export Range ドラッグの Undo / Redo
- `Background Opacity` 変更の Undo / Redo
- tuning Apply の Undo / Redo

tuning Apply 時は、現仕様どおり次を確認する。

- `displayedNotes / connections / bends` がクリアされる
- chord、export range、background opacity など保持対象が維持される

## 永続化確認

reload 後に次を確認する。

- tuning の弦数と弦名
- 適用済み chord
- export range
- background opacity
- language 設定

履歴復元と永続化が矛盾していないかも見る。

## Export 検証

preview だけで終わらせず、実際に download されたファイルも確認する。

- PNG が実際に保存される
- SVG が実際に保存される
- 拡張子が選択形式と一致する
- サイズ 0 ではない
- PNG は PNG シグネチャを満たす
- SVG は `<svg` を含む

## 画面確認の観点

目視では次を見る。

- 初期表示のレイアウト崩れ
- 言語切替後の表示崩れ
- tuning menu や context menu の位置ズレ
- 狭い画面幅での崩れ
- preview modal や export settings の崩れ
- ブラウザ差による文字詰まりや配置ズレ

## 成果物

必須成果物:

- `tmp/report1/report.md`
- `tmp/report1` 配下のスクリーンショット

必要に応じて追加してよいもの:

- `tmp/report1/results.json`
- `tmp/report1/ui-audit.mjs`
- download した PNG / SVG の実ファイル

レポートには最低限これを書く。

- 実施日
- 対象環境
- 対象 URL
- 実行プロファイル一覧
- 各プロファイルの実行方式
- 主要チェック項目と PASS / FAIL
- コンソールエラー件数
- ページエラー件数
- 近似確認の制約
- 見つかった不具合
- その場で修正したかどうか
- 残る確認事項

## 修正方針

- 軽微な不具合はその場で人間に確認せず、修正してよい
- 仕様判断が必要なものはレポートに残す
- 修正後は、該当フローを最低限再確認する
- 不具合が無ければ「コード変更なし」と明記する

## 実行メモ

- Playwright を優先して使う
- 必要なら一時的な監査スクリプトを作ってよい
- スクリーンショットは撮りすぎず、主要状態と問題箇所に絞る
- レポートは日本語で書く
- 複数 OS / 複数ブラウザと言っても、近似確認なら近似と明記する
