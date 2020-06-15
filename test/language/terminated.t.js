require('proof')(2, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: {
        value: [ [ 16 ], 0x0, 0x0 ] }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'terminated',
            fixed: false,
            bits: 0,
            terminator: [ 0, 0 ],
            fields: [{
                type: 'integer',
                dotted: '',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'terminated-fixed')
    okay(simplified({ packet: {
        value: [ [ [ [ 16 ], 0x0, 0x0 ] ], 0x0, 0x0 ] }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'terminated',
            fixed: false,
            bits: 0,
            terminator: [ 0, 0 ],
            fields: [{
                type: 'terminated',
                fixed: false,
                bits: 0,
                terminator: [ 0, 0 ],
                fields: [{
                    type: 'integer',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'terminated-nested')
})
