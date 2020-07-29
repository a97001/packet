require('proof')(7, okay => {
    const language = require('../../language')
    okay(language({ packet: { value: 16 } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'integer',
            vivify: 'number',
            fixed: true,
            bits: 16,
            endianness: 'big',
            compliment: false
        }]
    }], 'short')
    okay(language({ packet: { value: ~16 } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            endianness: 'little',
            compliment: false
        }]
    }], 'little endian')
    okay(language({ packet: { value: -16 } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            endianness: 'big',
            compliment: true
        }]
    }], 'two\'s compliment')
    okay(language({ packet: { value: -~16 } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            endianness: 'little',
            compliment: true
        }]
    }], 'two\'s compliment little endian')
    okay(language({ packet: { value: ~-16 } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            endianness: 'little',
            compliment: true
        }]
    }], 'two\'s compliment little endian transposed')
    okay(language({ packet: { value: [ 16, 7, 7 ] } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            spread: [ 7, 7 ],
            upper: null,
            endianness: 'big',
            compliment: false
        }]
    }], 'spread')
    okay(language({ packet: { value: [ 16, 0x80, 7, 0x0, 7 ] } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            spread: [ 7, 7 ],
            upper: [ 128, 0 ],
            endianness: 'big',
            compliment: false
        }]
    }], 'spread set')
})
