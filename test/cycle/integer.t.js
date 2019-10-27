require('proof')(5, prove)

function prove (assert) {
    var cycle = require('./cycle')(assert)

    cycle({
        name: 'big-endian-byte',
        define: {
            object: { word: 'b8' }
        },
        object: { word: 0xab },
        buffer: [ 0xab ]
    })

    cycle({
        name: 'little-endian-word',
        define: {
            object: { word: 'l16' }
        },
        object: { word: 0xabcd },
        buffer: [ 0xcd, 0xab ]
    })

    cycle({
        name: 'big-endian-word',
        define: {
            object: { word: 'b16' }
        },
        object: { word: 0xabcd },
        buffer: [ 0xab, 0xcd ]
    })

    cycle({
        name: 'big-endian-integer',
        define: {
            object: { integer: 'b32' }
        },
        object: { integer: 0x89abcdef },
        buffer: [ 0x89, 0xab, 0xcd, 0xef ]
    })

    cycle({
        name: 'little-endian-integer',
        define: {
            object: { integer: 'l32' }
        },
        object: { integer: 0x89abcdef },
        buffer: [ 0xef, 0xcd, 0xab, 0x89 ]
    })
}
