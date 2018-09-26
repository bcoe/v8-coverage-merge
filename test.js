/* global it, describe */

const merge = require('./')

require('chai').should()

describe('v8-coverage-merge', () => {
  it('appends functions with different names', () => {
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

    merged.functions.length.should.equal(2)
  })

  it('merges non-overlapping ranges for functions with same name', () => {
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
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 300,
                endOffset: 400,
                count: 2
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(2)
  })

  it('merges partially enclosed sub-range: a.startOffset < b.startOffset', () => {
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
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 20,
                endOffset: 150,
                count: 2
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(3)
  })

  it('merges partially enclosed sub-range: a.endOffset > b.endOffset', () => {
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
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 60,
                endOffset: 300,
                count: 0
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(3)
  })

  it('merges fully enclosed sub-range: b encloses a', () => {
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
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 70,
                endOffset: 150,
                count: 1
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(3)
  })

  it('merges fully enclosed sub-range: a encloses b', () => {
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
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 10,
                endOffset: 300,
                count: 1
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(3)
  })

  it('merges equivalent blocks', () => {
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
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(1)
  })

  it('merges multiple block ranges', () => {
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
                endOffset: 105,
                count: 1
              },
              {
                startOffset: 200,
                endOffset: 300,
                count: 2
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
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 10,
                endOffset: 60,
                count: 1
              },
              {
                startOffset: 70,
                endOffset: 100,
                count: 2
              },
              {
                startOffset: 290,
                endOffset: 310,
                count: 0
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(8)
  })

  it('merges multiple block ranges (reverse)', () => {
    const merged = merge(
      {
        scriptId: '71',
        url: '/Users/benjamincoe/oss/c8/test/fixtures/timeout.js',
        functions: [
          {
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 10,
                endOffset: 60,
                count: 1
              },
              {
                startOffset: 70,
                endOffset: 100,
                count: 2
              },
              {
                startOffset: 290,
                endOffset: 310,
                count: 0
              }
            ]
          }
        ]
      },
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
                endOffset: 105,
                count: 1
              },
              {
                startOffset: 200,
                endOffset: 300,
                count: 2
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(8)
  })

  it('discards function coverage if block exists: b is function', () => {
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
            functionName: 'bar',
            isBlockCoverage: false,
            ranges: [
              {
                startOffset: 300,
                endOffset: 400,
                count: 2
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(1)
  })

  it('discards function coverage if block exists: b is block', () => {
    const merged = merge(
      {
        scriptId: '70',
        url: '/Users/benjamincoe/oss/c8/test/fixtures/timeout.js',
        functions: [
          {
            functionName: 'bar',
            isBlockCoverage: false,
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
            functionName: 'bar',
            isBlockCoverage: true,
            ranges: [
              {
                startOffset: 300,
                endOffset: 400,
                count: 2
              }
            ]
          }
        ]
      }
    )

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(1)
  })
})
