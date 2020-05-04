const assert = require('assert')
const coalesce = require('extant')

function integer (value, packed, extra = {}) {
    if (!packed && Math.abs(value % 8) == 1) {
        if (value < 0) {
            return {
                ...extra,
                type: 'integer',
                fixed: true,
                bits: ~value,
                endianness: 'little',
                compliment: false
            }
        }
        return {
            ...extra,
            type: 'integer',
            fixed: true,
            bits: ~-value,
            endianness: 'little',
            compliment: true
        }
    }
    return {
        ...extra,
        type: 'integer',
        fixed: true,
        bits: Math.abs(value),
        endianness: 'big',
        compliment: value < 0
    }
}

function packed (definitions, extra = {}) {
    const fields = []
    let bits = 0
    for (const field in definitions) {
        switch (typeof definitions[field]) {
        case 'string': {
                bits += definitions[field].length * 4
                fields.push({
                    type: 'literal',
                    fixed: true,
                    bits: definitions[field].length * 4,
                    value: definitions[field]
                })
            }
            break
        case 'number': {
                const definition = integer(definitions[field], true, { name: field, dotted: `.${field}` })
                bits += definition.bits
                fields.push(definition)
            }
            break
        case 'object': {
                if (Array.isArray(definitions[field])) {
                    const when = []
                    switch (typeof definitions[field][0]) {
                    case 'object': {
                            if (Array.isArray(definitions[field][1])) {
                                console.log('yup',definitions)
                                console.log(definitions)
                            } else {
                                console.log('nope')
                            }
                        }
                        break
                    case 'function': {
                            switch (typeof definitions[field][1]) {
                            case 'object':
                                if (Array.isArray(definitions[field][1])) {
                                } else if (definitions[field][1] == null) {
                                } else {
                                    let bits2 = -1
                                    for (const value in definitions[field][1]) {
                                        const def1 = definitions[field][1][value]
                                        switch (typeof def1) {
                                        case 'object':
                                            if (Array.isArray(def1)) {
                                                const bits1 = def1[0]
                                                const literal = def1[1]
                                                if (bits2 == -1) {
                                                    bits2 = bits1
                                                } else {
                                                    assert(bits2 == bits1)
                                                }
                                                when.push({
                                                    value, type: 'integer', endianness: 'big', bits: bits1, literal
                                                })
                                            } else {
                                                const packed2 = []
                                                when.push(packed(def1, field, { value }))
                                                console.log(when)
                                            }
                                        }
                                    }
                                }
                            }
                            fields.push({
                                type: 'switch',
                                value: definitions[field][0].toString(),
                                name: field,
                                when: when
                            })
                        }
                        break
                    case 'number': {
                            // Two things here for now, a translation and length
                            // encoded arrays. For length encoded arrays, we
                            // assume either a simple type, like an integer, or
                            // a structure. For translations we exect there to
                            // be more than one value, otherwise what's the
                            // point? Ah, no, we're packed here.
                            const extra = { name: field }
                            if (Array.isArray(definitions[field][1])) {
                                extra.indexOf = definitions[field][1]
                            }
                            const definition = integer(definitions[field][0], true, extra)
                            bits += definition.bits
                            fields.push(definition)
                        }
                        break
                    }
                } else {
                    console.log('xxx', definitions)
                }
            }
            break
        }
    }
    return { ...integer(bits, false, extra), fields }
}

function map (definitions, packet, depth, extra = {}) {
    const definition = { parse: null, serialize: null }
    switch (typeof packet) {
    case 'string': {
            return [{ ...extra, ...definitions[packet] }]
        }
        break
    case 'object': {
            // Please resist the urge to refactor based on, oh look, I'm
            // performing this test twice. A single if/else ladder will be
            // easier to return to for maintainence and expansion.
            // Outer array.
            if (Array.isArray(packet)) {
                // Seems that we could still have an object for integer with
                // padding before and after, we could make literals wrappers.
                // [ 'ac', 16 ] or [ 'ac', [ 'utf8' ] ]
                if (packet.filter(item => typeof item == 'string').length != 0) {
                    const fields = []
                    for (const part of packet) {
                        if (typeof part == 'string') {
                            assert(part.length % 2 == 0)
                            fields.push({
                                type: 'literal',
                                fixed: true,
                                bits: part.length * 4,
                                value: part
                            })
                        } else {
                            fields.push.apply(fields, map(definitions, part, depth, extra))
                        }
                    }
                    return fields
                // Terminated arrays.
                } else if (typeof packet[packet.length - 1] == 'number') {
                    const fields = []
                    const terminator = []
                    for (let i = 1, I = packet.length; i < I; i++) {
                        terminator.push(packet[i])
                    }
                    return [{
                        ...extra,
                        type: 'terminated',
                        bits: 0,
                        fixed: false,
                        terminator: terminator,
                        fields: map(definitions, packet[0][0], depth, {})
                    }]
                // Fixed length arrays.
                } else if (
                    Array.isArray(packet[packet.length - 2]) &&
                    Array.isArray(packet[packet.length - 1]) &&
                    typeof packet[packet.length - 2][0] == 'number'
                ) {
                    const pad = []
                    while (typeof packet[0] == 'number')  {
                        pad.push(packet.shift())
                    }
                    if (pad.length == 0) {
                        pad.push(0x0)
                    }
                    const fields = [].concat.apply([], packet[1].map(field => map(definitions, field, false, {})))
                    const fixed = fields.filter(field => ! field.fixed).length == 0
                    const bits = fixed
                               ? fields.reduce((bits, field) => bits + field.bits, 0)
                               : 0
                    return [{
                        type: 'array',
                        length: packet[0],
                        ...extra,
                        pad,
                        fixed,
                        align: 'left',
                        length: packet[0][0],
                        bits: bits * packet[0][0],
                        fields
                    }]
                } else if (packet.length == 2) {
                    if (typeof packet[0] == 'number') {
                        const fields = []
                        assert(Array.isArray(packet[1]))
                        const length = integer(packet[0], false, {})
                        fields.push({
                            ...length,
                            type: 'lengthEncoding',
                            ...extra
                        })
                        if (typeof packet[1][0] == 'number') {
                            const element = integer(packet[1][0], false, {})
                            fields.push({
                                ...extra,
                                type: 'lengthEncoded',
                                fixed: false,
                                bits: 0,
                                element: element
                            })
                        } else {
                            const struct = map(definitions, packet[1][0], false, {}).shift()
                            fields.push({
                                ...extra,
                                type: 'lengthEncoded',
                                bits: 0,
                                fixed: false,
                                // TODO Length encode a structure.
                                element: struct
                            })
                        }
                        return fields
                    } else if (
                        Array.isArray(packet[0]) &&
                        Array.isArray(packet[1]) &&
                        Array.isArray(packet[0][0]) &&
                        typeof packet[0][0][0] == 'function'
                    ) {
                        const fields = []
                        const serialize = function () {
                            const conditions = []
                            for (const serialize of packet[0]) {
                                const [ test, packet ] = serialize
                                conditions.push({
                                    source: test.toString(),
                                    airty: test.length,
                                    fields: map(definitions, packet, false, {})
                                })
                            }
                            return { conditions }
                        } ()
                        const parse = function () {
                            const [ ...parse ] = packet[1]
                            const sip = map(definitions, parse.shift(), false, {})
                            const conditions = []
                            for (const serialize of parse) {
                                const [ test, packet ] = serialize
                                conditions.push({
                                    source: test.toString(),
                                    airty: 1,
                                    fields: map(definitions, packet, false, {})
                                })
                            }
                            return { sip, conditions }
                        } ()
                        // TODO Is fixed if all the alternations are the same
                        // length.
                        fields.push({
                            type: 'conditional',
                            bits: 0,
                            fixed: false,
                            serialize, parse, ...extra
                        })
                        return fields
                    } else {
                        throw new Error
                    }
                }
            } else if (depth == 0) {
                // TODO It's not depth == 0, more like start of structure.
                const fields = []
                for (const name in packet) {
                    fields.push.apply(fields, map(definitions, packet[name], 1, {
                        name, dotted: `.${name}`
                    }))
                }
                const fixed = fields.reduce((fixed, field) => {
                    return fixed && field.fixed
                }, true)
                const bits = fields.reduce((sum, field) => sum + field.bits, 0)
                return [ { ...extra, fixed, bits, type: 'structure', fields } ]
            } else {
                return [ packed(packet, extra) ]
            }
        }
        break
    case 'number': {
            return [ integer(packet, false, extra) ]
        }
    case 'function': {
            return [{
                type: 'function',
                source: packet.toString(),
                airty: packet.length
            }]
        }
    }
    return [ definition ]
}

function visit (packet, f) {
    f(packet)
    switch (packet.type) {
    case 'structure':
        for (const field of packet.fields) {
            visit(field, f)
        }
        break
    }
}

module.exports = function (packets) {
    const definitions = []
    for (const packet in packets) {
        definitions.push.apply(definitions, map(definitions, packets[packet], 0, { name: packet }))
    }
    for (const definition of definitions) {
        visit(definition, (packet) => {
            if (packet.type == 'lengthEncoded') {
                definition.lengthEncoded = true
            }
            if (packet.type == 'terminated' || packet.type == 'array') {
                definition.arrayed = true
            }
        })
    }
    return definitions
}
