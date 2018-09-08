# v8-coverage-merge

[![Build Status](https://travis-ci.org/bcoe/v8-coverage-merge.svg?branch=master)](https://travis-ci.org/bcoe/v8-coverage-merge)

Merges together the V8 inspector format JSON output for duplicate scripts:

```js
const merge = require('v8-coverage-merge')
const merged = merge(
  {
    scriptId: '70',
    url: '/Users/benjamincoe/oss/c8/test/fixtures/timeout.js',
    functions: [
      {
        functionName: 'bar',
        isBlockCoverage: true,
        ranges: [
          {
            startOffset: 30,
            endOffset: 221,
            count: 1
          }
        ]
      }
    ]
  },
  {
    scriptId: '71',
    url: '/Users/benjamincoe/oss/c8/test/fixtures/timeout.js',
    functions: [
      {
        functionName: 'foo',
        isBlockCoverage: true,
        ranges: [
          {
            startOffset: 70,
            endOffset: 400,
            count: 2
          }
        ]
      }
    ]
  }
)
```

Merging is necessary if coverage is output from multiple subprocesses.