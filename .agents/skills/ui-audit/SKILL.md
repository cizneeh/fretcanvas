---
name: ui-audit
description: Fret Canvas の UI を Chrome で軽量に監査する。週次 GitHub Actions、手動の動作確認、見た目・主要操作・Undo/Redo・永続化・PNG export の確認、短い監査レポート、再現できる軽微な不具合の修正 PR が必要なときに使う。
---

# UI Audit

Fret Canvas の主要フローをブラウザで確認し、結果を `tmp/report1` に保存する。
週次監査では身軽さを優先し、複数 OS・複数ブラウザの網羅は行わない。

## 標準環境

週次 GitHub Actions では次を標準にする。

- GitHub-hosted Linux runner
- Chrome headless
- Chrome DevTools MCP
- desktop viewport `1440x900`
- CI 内で production build を起動した local URL

手動監査では local または staging を対象にしてよい。レポートに実行環境と URL を書く。
狭い viewport は必要と思われる場合に初期表示だけ確認する。Safari、Edge、OS 別確認、複数
viewport の詳細監査は、ユーザーが明示的に求めた場合だけ行う。

## 監査方針

- 最初はブラウザだけを使い、ソースコード全体を読まない。
- 問題を再現できた箇所だけ、原因調査のために関連コードを読む。
- Console error、ページエラー、失敗した Network request を確認する。
- Performance trace や詳細な速度計測は、性能監査を明示された場合だけ行う。
- 日本語では言語切替、主要文言、レイアウトだけ確認し、主要操作を繰り返さない。
- スクリーンショットは初期表示、主要操作後、PNG preview で撮る。問題があれば追加する。

## 標準シナリオ

同じブラウザセッションで、次を一連のシナリオとして確認する。

1. 初期表示と主要 UI のレイアウトを確認する。
2. `Add Scale Notes` を実行し、Undo、Redo を確認する。
3. chord mode へ切り替え、手動入力を `Enter` で適用する。
4. `Add Chord Tones` を実行する。今回の複雑操作の代表として Undo、Redo を確認する。
5. ノートの context menu を開き、代表的な操作が反映されることを確認する。
6. tuning menu から preset を Apply する。
7. reload 後に tuning、適用済み chord、export range、background opacity、language の永続化を確認する。
8. Export Settings で PNG preview を確認し、実際に download する。
9. 日本語へ切り替え、主要文言とレイアウトを確認する。

PNG download は次を確認する。

- ファイルが保存される。
- 拡張子が `.png` である。
- サイズが 0 ではない。
- PNG signature を満たす。

SVG export は現在 UI で無効なため監査対象にしない。

## 追加監査

次は標準シナリオに含めず、関連変更がある場合かユーザーが求めた場合だけ確認する。

- selection context menu と一括操作
- `Emphasize`、`Dim`、`Bend` の全パターン
- connection の作成と削除
- Export Range ハンドルの詳細な drag 操作
- 全操作の Undo、Redo
- custom tuning preset
- 狭い viewport の詳細操作
- 複数ブラウザ、複数 OS
- performance trace

## 判定

次を blocking failure とする。

- アプリが開かない、blank screen、HTTP 5xx
- 未処理の JavaScript error
- 標準シナリオの主要操作を完了できない
- 状態が明らかに破損する
- PNG preview または download を生成できない
- ブラウザや監査処理の異常で監査を完了できない
- 必須レポートを生成できない

軽微なレイアウト差、文言、操作性の提案、確信のない視覚的な違和感は warning にする。
blocking failure が 1 件以上あれば verdict を `fail`、それ以外は `pass` にする。

## 軽微な修正

次をすべて満たす問題は、その場で修正してよい。

- ブラウザで再現でき、期待動作が明確である。
- 変更範囲が小さく、仕様・デザイン判断を必要としない。
- dependencies、workflow、権限、secret、リリース設定を変更しない。
- 関連フロー、`npm run lint`、`npm run test:e2e` で検証できる。

修正後は、失敗したフローを再実行する。GitHub への write 権限がある週次 CI では、専用ブランチに
commit して Ready for review の PR を作成してよい。直接 `main` へ push または merge しない。
権限がない、検証に失敗した、または修正方針に判断が必要な場合はコードを変更せず報告する。

## 成果物

次を必ず作る。

- `tmp/report1/report.md`
- `tmp/report1/results.json`
- `tmp/report1` 配下の主要スクリーンショット

必要なら download した PNG、Console や Network の証拠を追加する。

`results.json` には最低限次を入れる。

- `verdict`: `pass` または `fail`
- `blockingFindings`: blocking failure の配列
- `warnings`: warning の配列
- `completedChecks`: 完了した確認項目の配列
- `incompleteChecks`: 完了できなかった確認項目の配列
- `pullRequestUrl`: 修正 PR を作った場合の URL。それ以外は省略する。

`report.md` は日本語で簡潔に書く。

- 実施日、環境、対象 URL
- verdict
- 各チェックの PASS / FAIL
- blocking findings
- warnings
- Console error と Network failure の件数
- 修正内容と再確認結果
- 修正 PR の URL

不具合がなければコード変更なしと明記する。GitHub Actions では `tmp/report1` を、監査が失敗した
場合も Artifact として保存する。
