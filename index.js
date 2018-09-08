module.exports = (cov1, cov2) => {
  const blockLookup = {}
  const funcLookup = {}
  const merged = {
    url: cov1.url,
    scriptId: cov1.scriptId,
    functions: []
  }
  cov1.functions.forEach(func => {
    func = cloneFunction(func)
    if (func.isBlockCoverage) blockLookup[func.functionName] = func
    else funcLookup[func.functionName] = func
    merged.functions.push(func)
  })
  cov2.functions.forEach(func => {
    if (func.isBlockCoverage && blockLookup[func.functionName]) {
      mergeFunctions(blockLookup[func.functionName], func)
    } else if (!func.isBlockCoverage && funcLookup[func.functionName]) {
      mergeFunctions(funcLookup[func.functionName], func)
    } else {
      merged.functions.push(cloneFunction(func))
    }
  })

  return merged
}

function cloneFunction (func) {
  const ranges = []
  func.ranges.forEach(range => {
    ranges.push(cloneRange(range))
  })
  return {
    functionName: func.functionName,
    isBlockCoverage: func.isBlockCoverage,
    ranges: ranges
  }
}

function cloneRange (range) {
  return {
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    count: range.count
  }
}

function mergeFunctions (func1, func2) {
  const ranges = []
  func1.ranges.forEach(range => {
    ranges.push(cloneRange(range))
  })
  ranges.sort((a, b) => {
    return a.endOffset - b.endOffset
  })
  for (const range of func2.ranges) {
    let i = 0
    for (let range2; (range2 = ranges[i]) !== undefined; i++) {
      if (range.endOffset < range2.endOffset) break;
    }
    insertRange(i, range, ranges)
  }
}

function insertRange (index, range, ranges) {
  const oldRange = ranges.splice(index, 1)
}
