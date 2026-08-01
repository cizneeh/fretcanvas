import fs from 'node:fs'

const resultPath = process.env.RESULT_PATH
const reportPath = process.env.REPORT_PATH
const codexOutcome = process.env.CODEX_OUTCOME ?? 'failure'
const runUrl = process.env.RUN_URL ?? ''

const errors = []
let result

try {
  result = JSON.parse(fs.readFileSync(resultPath, 'utf8'))
} catch (error) {
  errors.push(`results.jsonを読み込めませんでした: ${String(error)}`)
}

const isStringArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

if (result !== undefined) {
  if (result.verdict !== 'pass' && result.verdict !== 'fail') {
    errors.push('verdictがpassまたはfailではありません。')
  }
  if (typeof result.summary !== 'string') {
    errors.push('summaryが文字列ではありません。')
  }
  if (typeof result.fixApplied !== 'boolean') {
    errors.push('fixAppliedがbooleanではありません。')
  }

  for (const key of ['blockingFindings', 'warnings', 'completedChecks', 'incompleteChecks']) {
    if (!isStringArray(result[key])) {
      errors.push(`${key}が文字列の配列ではありません。`)
    }
  }

  if (
    result.verdict === 'pass' &&
    (result.blockingFindings?.length > 0 || result.incompleteChecks?.length > 0)
  ) {
    errors.push('blockingまたは未完了の確認があるのにverdictがpassです。')
  }
}

if (codexOutcome !== 'success') {
  errors.push(`Codex Actionの結果が${codexOutcome}です。`)
}

if (!fs.existsSync(reportPath)) {
  errors.push('report.mdが生成されませんでした。')
}

const resultValid = errors.length === 0
const verdict = resultValid ? result.verdict : 'fail'
const fixApplied = resultValid && result.fixApplied

fs.appendFileSync(process.env.GITHUB_OUTPUT, `result_valid=${resultValid}\n`)
fs.appendFileSync(process.env.GITHUB_OUTPUT, `verdict=${verdict}\n`)
fs.appendFileSync(process.env.GITHUB_OUTPUT, `fix_applied=${fixApplied}\n`)

const summary = [
  '# Weekly UI Audit',
  '',
  `- Run: ${runUrl}`,
  `- Codex Action: ${codexOutcome}`,
  `- Verdict: ${verdict}`,
  `- Fix prepared: ${fixApplied}`,
]

if (verdict !== 'pass') {
  summary.push('- Failure evidence: available from this run as an Artifact for 7 days')
}

if (errors.length > 0) {
  summary.push('', '## Workflow errors', '', ...errors.map((error) => `- ${error}`))
}

if (fs.existsSync(reportPath)) {
  summary.push('', '## Audit report', '', fs.readFileSync(reportPath, 'utf8'))
}

fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary.join('\n')}\n`)
