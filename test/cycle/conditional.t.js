require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'conditional/mysql',
        define: {
            object: {
                value: [[[
                    value => value < 251, 8
                ], [
                    value => value >= 251 && value < 2 ** 16, [ 'fc', 16 ]
                ], [
                    [ 'fd', 24 ]
                ]], [ 8, [
                    sip => sip < 251, sip => sip
                ], [
                    sip => sip == 0xfc, 16
                ], [
                    24
                ]]]
            }
        },
        objects: [{ value: 250 }, { value: 251 }, { value: 2 ** 16 }]
    })
    cycle(okay, {
        name: 'conditional/sipless',
        define: {
            object: {
                type: 8,
                value: [
                    [[
                        (_, $) => $.type == 0, 16
                    ], [
                        (_, $) => $.type == 1, 24
                    ], [
                        32
                    ]],
                    [[
                        $ => $.type == 0, 16
                    ], [
                        $ => $.type == 1, 24
                    ], [
                        32
                    ]]
                ]
            }
        },
        objects: [{
            type: 0, value: 0xaaaa
        }, {
            type: 1, value: 0xaaaaaa
        }, {
            type: 2, value: 0xaaaaaaaa
        }]
    })
    cycle(okay, {
        name: 'conditional/bidirectional',
        define: {
            object: {
                type: 8,
                value: [[
                    $ => $.type == 0, 16
                ], [
                    $ => $.type == 1, 24
                ], [
                    32
                ]]
            }
        },
        objects: [{
            type: 0, value: 0xaaaa
        }, {
            type: 1, value: 0xaaaaaa
        }, {
            type: 2, value: 0xaaaaaaaa
        }]
    })
    cycle(okay, {
        name: 'conditional/packed',
        define: {
            object: {
                header: [{
                    flag: 2,
                    value: [[
                        $ => $.header.flag == 0, 6
                    ], [
                        $ => $.header.flag == 1, [ 'a', 2 ]
                    ], [
                        $ => $.header.flag == 2, [{
                            two: 2,
                            four: 4
                        }, 6 ]
                    ], [
                        [{
                            one: 1,
                            five: 5
                        }, 6 ]
                    ]]
                }, 8 ]
            }
        },
        objects: [{
            header: {
                flag: 0, value: 0x2a
            }
        }, {
            header: {
                flag: 1, value: 3
            }
        }, {
            header: {
                flag: 2,
                value: {
                    two: 2,
                    four: 10
                }
            }
        }, {
            header: {
                flag: 3,
                value: {
                    one: 1,
                    five: 0x13
                }
            }
        }]
    })
}
