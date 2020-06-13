require('proof')(2, okay => {
    const simplified = require('../../simplified')
    // TODO Come back and complete when you've implemented nested structures.
    okay(simplified({
        packet: {
            type: 8,
            value: [ $ => $.type, {
                0: 8,
                1: 16
            }, 32 ]
        }
    }), [{
        dotted: '',
        fixed: false,
        bits: 8,
        type: 'structure',
        fields: [{
            type: 'integer',
            dotted: '.type',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'switch',
            source: '$ => $.type',
            bits: 0,
            fixed: false,
            cases: [{
                value: '0',
                fields: [
                  {
                    type: 'integer',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    endianness: 'big',
                    compliment: false
                  }
                ]
            }, {
                value: '1',
                fields: [{
                    type: 'integer',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }]
            }],
            otherwise: [{
                type: 'integer',
                dotted: '',
                fixed: true,
                bits: 32,
                endianness: 'big',
                compliment: false
            }],
            name: 'value',
            dotted: '.value'
        }],
        name: 'packet'
    }], 'string switch')
    okay(simplified({
        packet: {
            header: [{
                type: 2,
                value: [ $ => $.type, {
                    0: 6,
                    1: [ 'a', 2 ]
                }, { two: 2, four: 4 } ]
            }, 8 ]
        }
    }), [{
        dotted: '',
        fixed: true,
        bits: 8,
        type: 'structure',
        fields: [{
            type: 'integer',
            dotted: '.header',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'header',
            fields: [{
                type: 'integer',
                dotted: '.type',
                fixed: true,
                bits: 2,
                endianness: 'big',
                compliment: false,
                name: 'type'
            }, {
                type: 'switch',
                source: '$ => $.type',
                bits: 6,
                fixed: true,
                cases: [{
                    value: '0',
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 6,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    value: '1',
                    fields: [{
                        type: 'literal',
                        dotted: '',
                        ethereal: true,
                        fixed: true,
                        bits: 6,
                        before: { repeat: 1, value: 'a', bits: 4 },
                        fields: [{
                            type: 'integer',
                            dotted: '',
                            fixed: true,
                            bits: 2,
                            endianness: 'big',
                            compliment: false
                        }],
                        after: { repeat: 0, value: '' }
                    }]
                }],
                otherwise: [{
                    dotted: '',
                    fixed: true,
                    bits: 6,
                    type: 'structure',
                    fields: [{
                        type: 'integer',
                        dotted: '.two',
                        fixed: true,
                        bits: 2,
                        endianness: 'big',
                        compliment: false,
                        name: 'two'
                    }, {
                        type: 'integer',
                        dotted: '.four',
                        fixed: true,
                        bits: 4,
                        endianness: 'big',
                        compliment: false,
                        name: 'four'
                    }]
                }],
                name: 'value',
                dotted: '.value'
            }]
        }],
        name: 'packet'
    }], 'string switch packed')
})
