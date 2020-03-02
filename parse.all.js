const join = require('./join')
const unpackAll = require('./unpack')
const $ = require('programmatic')

function map (packet, bff) {
    let index = -1
    let step = 1

    // TODO Create a null entry, then assign a value later on.
    function vivifier (asignee, packet) {
        const fields = []
        packet.fields.forEach(function (field) {
            switch (field.type) {
            case 'checkpoint':
            case 'lengthEncoding':
                break
            case 'lengthEncoded':
                fields.push(field.name + ': new Array')
                break
            case 'integer':
                fields.push(`${field.name}: 0`)
                break
            default:
                if (field.type == 'structure' || field.fields == null) {
                    fields.push(field.name + ': null')
                } else {
                    field.fields.forEach(function (field) {
                        fields.push(field.name + ': null')
                    })
                }
                break
            }
        })
        if (fields.length == 0) {
            return object + ' = {}'
        }
        return $(`
            ${asignee} = {
                `, fields.join(',\n'), `
            }
        `)
    }

    function integer (field, assignee) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const reads = []
        while (bite != stop) {
            reads.unshift('$buffer[$start++]')
            if (bite) {
                reads[0] += ' * 0x' + Math.pow(256, bite).toString(16)
            }
            bite += direction
        }
        if (bytes == 1) {
            return `${assignee} = ${reads.join('')}`
        }
        step += 2
        return $(`
            ${assignee} =
                `, reads.reverse().join(' +\n'), `
        `)
    }

    function lengthEncoding (field) {
        index++
        return $(`
            $i[${index}] = 0
            `, integer(field, `$I[${index}]`), `
        `)
    }

    function lengthEncoded (path, field) {
        step += 2
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        index--
        const looped = dispatch(path, {
            ...field.element,
            name: `${field.name}[${i}]`
        })
        return $(`
            for (; ${i} < ${I}; ${i}++) {
                `, looped, `
            }
        `)
    }

    function dispatch (path, field) {
        switch (field.type) {
        case 'checkpoint':
            return checkpoint(field)
        case 'structure': {
                const descent = path.concat(field.name)
                const asignee = path.length == 0 ? `const ${descent[0]}` : descent.join('.')
                return $(`
                    `, vivifier(asignee, field), `

                    `, join(field.fields.map(function (field) {
                        return dispatch(descent, field)
                    }.bind(this))), `
                `)
            }
        case 'lengthEncoding':
            return lengthEncoding(field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        default:
            return integer(field, path.concat(field.name).join('.'))
        }
    }

    function checkpoint (checkpoint, depth, arrayed) {
        const signature = [ packet.name, step ]
        if (packet.lengthEncoded) {
            signature.push('$i', '$I')
        }
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return parsers.inc.${packet.name}(${signature.join(', ')})($buffer, $start, $end)
            }
        `)
    }

    const source = dispatch([], packet)
    const variables = packet.lengthEncoded ? 'let $i = [], $I = []' : null

    if (bff) {
        return $(`
            parsers.bff.${packet.name} = function () {
                return function parse ($buffer, $start, $end) {
                    `, variables, `

                    `, source, `

                    return { start: $start, object: object, parse: null }
                }
            }
        `)
    }

    return $(`
        parsers.all.${packet.name} = function ($buffer, $start) {
            `, variables, `

            `, source, `

            return ${packet.name}
        }
    `)
}

function bff (path, packet) {
    let index = -1
    let checkpoint = { type: 'checkpoint', lengths: [ 0 ] }, fields = [ checkpoint ]
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = packet.fields[i]
        switch (field.type) {
        case 'lengthEncoding':
            checkpoint.lengths[0] += field.bits / 8
            break
        case 'lengthEncoded':
            index++
            fields.push(checkpoint = { type: 'checkpoint', lengths: [] })
            switch (field.element.type) {
            case 'structure':
                if (field.element.fixed = true) {
                    checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                } else {
                    field.element.fields = bff(field.element)
                }
                break
            default:
                checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                break
            }
            index--
            break
        default:
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        fields.push(field)
    }
    return fields
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff([ packet.name ], packet)
        }
        return map(packet, options.bff)
    }))
    return compiler(source)
}
