const merge = require('./')

require('chai').should()

describe('v8-coverage-merge', () => {
  it('appends functions with different names', () => {
    const merged = merge(
      {
        scriptId: "70",
        url: "/Users/benjamincoe/oss/c8/test/fixtures/timeout.js",
        functions: [
          {
            functionName: "bar",
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
        scriptId: "71",
        url: "/Users/benjamincoe/oss/c8/test/fixtures/timeout.js",
        functions: [
          {
            functionName: "foo",
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
        scriptId: "70",
        url: "/Users/benjamincoe/oss/c8/test/fixtures/timeout.js",
        functions: [
          {
            functionName: "bar",
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
        scriptId: "71",
        url: "/Users/benjamincoe/oss/c8/test/fixtures/timeout.js",
        functions: [
          {
            functionName: "bar",
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

    merged.functions.length.should.equal(1)
    merged.functions[0].ranges.length.should.equal(2)
  })
})
