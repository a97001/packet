require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay)({
        name: 'length-encoded-words',
        define: {
            object: { array: [ 16, [{ first: 16, second: 16 }] ]  }
        },
        object: { array: [{ first: 0x1234, second: 0x4567 }, { first: 0x890a, second: 0xcdef }] },
        stopAt: 'sizeof'
    })
}
