module.exports = (cov1, cov2) => {
  const blockLookup = Object.create(null)
  const funcLookup = Object.create(null)
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
    // block coverage should take precedence.
    if (func.isBlockCoverage && funcLookup[func.functionName]) {
      merged.functions.splice(
        merged.functions.indexOf(funcLookup[func.functionName]),
        1
      )
      delete funcLookup[func.functionName]
    }
    if (!func.isBlockCoverage && blockLookup[func.functionName]) {
      return
    }

    if (func.isBlockCoverage && blockLookup[func.functionName]) {
      mergeFunctions(blockLookup[func.functionName], func)
    } else if (!func.isBlockCoverage && funcLookup[func.functionName]) {
      mergeFunctions(funcLookup[func.functionName], func)
    } else {
      merged.functions.push(cloneFunction(func))
    }
  })

  // we should handle function coverage before
  // block coverage.
  merged.functions.sort(() => {

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
  const ranges = func1.ranges
  ranges.sort((a, b) => {
    return a.endOffset - b.endOffset
  })
  for (const range of func2.ranges) {
    let i = 0
    for (let range2; (range2 = ranges[i]) !== undefined; i++) {
      if (range.endOffset < range2.endOffset) break
    }
    insertRange(
      Math.min(i, ranges.length - 1),
      range,
      ranges
    )
  }
  return ranges
}

function insertRange (index, newRange, ranges) {
  const oldRange = ranges.splice(index, 1)[0]
  if (rangesEqual(newRange, oldRange)) {
    //    A B
    //    | |
    //    | |
    //    | |
    //    | |
    //    | |
    newRange.count += oldRange.count
    Array.prototype.splice.apply(ranges, [index, 0, newRange])
  } else if (newRange.startOffset <= oldRange.startOffset &&
             newRange.endOffset >= oldRange.startOffset &&
             newRange.endOffset <= oldRange.endOffset) {
    //    A B
    //      |
    //    | |
    //    | |
    //    | |
    //    |
    const splitRange = {
      startOffset: oldRange.startOffset,
      endOffset: newRange.endOffset,
      count: newRange.count + oldRange.count
    }
    newRange.endOffset = oldRange.startOffset
    oldRange.startOffset = splitRange.endOffset
    Array.prototype.splice.apply(ranges, [index, 0, newRange, splitRange,
      oldRange])
  } else if (newRange.startOffset >= oldRange.startOffset &&
        newRange.startOffset <= oldRange.endOffset &&
        newRange.endOffset >= oldRange.endOffset) {
    //    A B
    //    |
    //    | |
    //    | |
    //    | |
    //      |
    const splitRange = {
      startOffset: newRange.startOffset,
      endOffset: oldRange.endOffset,
      count: newRange.count + oldRange.count
    }
    newRange.startOffset = oldRange.endOffset
    oldRange.endOffset = splitRange.startOffset
    Array.prototype.splice.apply(ranges, [index, 0, oldRange, splitRange,
      newRange])
  } else if (newRange.startOffset >= oldRange.startOffset &&
             newRange.endOffset <= oldRange.endOffset) {
    //    A B
    //    |
    //    | |
    //    | |
    //    | |
    //    |
    const splitRange = {
      startOffset: newRange.startOffset,
      endOffset: newRange.endOffset,
      count: newRange.count + oldRange.count
    }
    newRange.startOffset = oldRange.startOffset
    newRange.endOffset = splitRange.startOffset
    newRange.count = oldRange.count

    oldRange.startOffset = splitRange.endOffset
    Array.prototype.splice.apply(ranges, [index, 0, newRange, splitRange,
      oldRange])
  } else if (newRange.startOffset <= oldRange.startOffset &&
             newRange.endOffset >= oldRange.endOffset) {
    //    A B
    //      |
    //    | |
    //    | |
    //    | |
    //      |
    const originalEndOffset = newRange.endOffset
    const splitRange = {
      startOffset: newRange.startOffset,
      endOffset: oldRange.startOffset,
      count: newRange.count
    }
    newRange.startOffset = oldRange.startOffset
    newRange.endOffset = oldRange.endOffset
    newRange.count = oldRange.count + newRange.count

    oldRange.startOffset = newRange.endOffset
    oldRange.endOffset = originalEndOffset
    oldRange.count = splitRange.count
    Array.prototype.splice.apply(ranges, [index, 0, splitRange, newRange,
      oldRange])
  } else if (newRange.endOffset < oldRange.endOffset) {
    //    A B
    //      |
    //      |
    //    |
    //    |
    //    |
    Array.prototype.splice.apply(ranges, [index, 0, newRange, oldRange])
  } else {
    //    A B
    //    |
    //    |
    //    |
    //      |
    //      |
    Array.prototype.splice.apply(ranges, [index, 0, oldRange, newRange])
  }
}

function rangesEqual (range1, range2) {
  return range1.startOffset === range2.startOffset &&
         range1.endOffset === range2.endOffset
}
