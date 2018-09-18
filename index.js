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
    // Look for the first `i` so that `ranges[i]` ends after `range` using
    // binary search.
    let minIndex = 0, maxIndex = ranges.length - 1
    while (minIndex !== maxIndex) {
      const middle = (minIndex + maxIndex) >>> 1
      if (range.endOffset < ranges[middle].endOffset)
        maxIndex = middle
      else
        minIndex = middle + 1
    }

    insertRange(
      minIndex,
      range,
      ranges
    )
  }
  return ranges
}

function insertRange (index, newRange, ranges) {
  const oldRange = ranges[index]
  if (rangesEqual(newRange, oldRange)) {
    //    A B
    //    | |
    //    | |
    //    | |
    //    | |
    //    | |
    newRange.count += oldRange.count
    ranges[index] = newRange
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
    ranges.splice(index, 0, newRange, splitRange)
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
    ranges.splice(index + 1, 0, splitRange, newRange)
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
    ranges.splice(index, 0, newRange, splitRange)
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
    ranges.splice(index, 0, splitRange, newRange)
  } else if (newRange.endOffset < oldRange.endOffset) {
    //    A B
    //      |
    //      |
    //    |
    //    |
    //    |
    ranges.splice(index, 0, newRange)
  } else {
    //    A B
    //    |
    //    |
    //    |
    //      |
    //      |
    ranges.splice(index + 1, 0, newRange)
  }
}

function rangesEqual (range1, range2) {
  return range1.startOffset === range2.startOffset &&
         range1.endOffset === range2.endOffset
}
