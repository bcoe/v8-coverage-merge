const benchmark = require('benchmark')
const fs = require('fs')
const path = require('path')
const v8CoverageMerge = require('../')

async function main () {
  const suite = new benchmark.Suite()

  for (const benchmarkName of getBenchmarks()) {
    const coverages = await readCoverages(benchmarkName)
    const urlToScriptCoverages = groupByUrl(coverages)
    suite.add(benchmarkName, () => mergeAll(urlToScriptCoverages))
  }

  suite.on('cycle', (event) => {console.log(event.target.toString())})
  suite.run({'async': true})
}

function getBenchmarks () {
  return fs.readdirSync(__dirname)
    .filter((child) => fs.statSync(path.join(__dirname, child)).isDirectory())
}

function readCoverages (name) {
  const dir = path.join(__dirname, name)
  const children = fs.readdirSync(dir)
  const promises = []
  for (const child of children) {
    promises.push(fs.promises.readFile(path.join(dir, child), {encoding: 'UTF-8'}).then(s => JSON.parse(s).result))
  }
  return Promise.all(promises)
}

function groupByUrl (coverages) {
  const result = new Map()
  for (const coverage of coverages) {
    for (const scriptCoverage of coverage) {
      if (!result.has(scriptCoverage.url)) {
        result.set(scriptCoverage.url, [])
      }
      result.get(scriptCoverage.url).push(scriptCoverage)
    }
  }
  return result
}

function mergeAll (urlToScriptCoverages) {
  const result = new Map()
  for (const [url, scriptCoverages] of urlToScriptCoverages) {
    result.set(url, mergeOne(scriptCoverages))
  }
  return result
}

function mergeOne (scriptCoverages) {
  let result = scriptCoverages[0]
  for (const scriptCoverage of scriptCoverages.slice(1)) {
    result = v8CoverageMerge(result, scriptCoverage)
  }
  return result
}

main()
