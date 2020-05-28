require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'padded',
        define: {
            object: { array: [ [ 16 ], [ 8 ], 0xd, 0xa ]  }
        },
        objects: [{ array: Buffer.from('hello, world').toJSON().data }]
    })
}
