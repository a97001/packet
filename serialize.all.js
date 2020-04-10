const join = require('./join')
const pack = require('./pack')
const $ = require('programmatic')

function bff (path, packet, index = 0, rewind = 0) {
    let checkpoint
    const fields = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind } ]
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = JSON.parse(JSON.stringify(packet.fields[i]))
        switch (field.type) {
        case 'lengthEncoding':
            checkpoint.lengths[0] += field.bits / 8
            break
        case 'lengthEncoded':
            switch (field.element.type) {
            case 'structure':
                if (field.element.fixed) {
                    checkpoint.lengths.push(`${field.element.bits / 8} * ${path.concat(field.name).join('.')}.length`)
                } else {
                    field.element.fields = bff(path.concat(`${field.name}[$i[${index}]]`), field.element, index + 1, 2)
                }
                break
            default:
                checkpoint.lengths.push(`${field.element.bits / 8} * ${path.concat(field.name).join('.')}.length`)
                break
            }
            break
        default:
            checkpoint.path = path.concat(packet.name)
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        fields.push(field)
    }
    return fields
}

function generate (packet, bff) {
    let step = 0
    let index = -1

    function word (field, variable) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const shifts = []
        while (bite != stop) {
            const shift = bite ? variable + ' >>> ' + bite * 8 : variable
            shifts.push(`$buffer[$start++] = ${shift} & 0xff`)
            bite += direction
        }
        return shifts.join('\n')
    }

    function integer (path, field) {
        step += 2
        if (field.fields) {
            const pack = _pack(field, '$_')
            return $(`
                {
                    `, pack, `

                    `, word(field, 'value'), `
                }
            `)
        } else {
            return word(field, `${path.join('.')}.${field.name}`)
        }
    }

    function lengthEncoding (path, field) {
        step += 2
        return word(field, `${path.join('.')}.${field.name}.length`)
    }

    function lengthEncoded (path, field) {
        step += 2
        const i = `$i[${++index}]`
        const looped = dispatch(path, {
            ...field.element,
            name: `${field.name}[${i}]`
        })
        const source = $(`
            for (${i} = 0; ${i} < ${path.join('.')}.${field.name}.length; ${i}++) {
                `, looped, `
            }
        `)
        index--
        return source
    }

    function checkpoint (checkpoint) {
        const i = packet.lengthEncoded ? '$i' : '[]'
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(${packet.name}, ${step - checkpoint.rewind}, ${i})
                }
            }
        `)
    }

    function dispatch (path, packet) {
        switch (packet.type) {
        case 'checkpoint':
            return checkpoint(packet)
        case 'structure':
            return join(packet.fields.map(field => {
                return dispatch(path.concat(packet.name), field)
            }))
            return $(`
                {
                    let ${packet.name} = object.${packet.name}

                    `, source, `
                }
            `)
            break
        case 'lengthEncoding':
            return lengthEncoding(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'buffer':
            return buffer(packet)
        case 'integer':
            return integer(path, packet)
        case 'literal':
            console.log(path, packet)
            return $(`
                $buffer.write(${JSON.stringify(packet.value)}, $start, $start + ${packet.value.length / 2}, 'hex')
                $start += ${packet.value.length / 2}
            `)
            throw new Error
        }
    }

    const source = join(packet.fields.map(f => {
        return dispatch([ packet.name ], f)
    }))
    const lets = packet.lengthEncoded ? 'let $i = []' : null
    return $(`
        serializers.${bff ? 'bff' : 'all'}.${packet.name} = function (${packet.name}) {
            return function ($buffer, $start, $end) {
                `, lets, `

                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff([ packet.name ], packet)
        }
        return generate(packet, options.bff)
    }))
    return compiler(source)
}
