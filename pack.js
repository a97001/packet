const $ = require('programmatic')
const snuggle = require('./snuggle')
const join = require('./join')

const fiddle = require('./fiddle/pack')

function _fiddle (pack) {
    return fiddle(pack.bits, pack.offset, pack.size, pack.value)
}

function flatten (flattened, path, fields, assignment = '=') {
    for (const field of fields) {
        switch (field.type) {
        case 'literal':
            if (field.before.repeat != 0) {
                flattened.push({
                    type: 'integer',
                    compliment: false,
                    bits: field.before.bits,
                    value: '0x' + field.before.value
                })
            }
            flatten(flattened, path + field.dotted, field.fields)
            if (field.after.repeat != 0) {
                flattened.push({
                    type: 'literal',
                    compliment: false,
                    bits: field.after.bits,
                    value: '0x' + field.after.value
                })
            }
            break
        case 'integer':
            flattened.push({
                type: 'integer',
                bits: field.bits,
                compliment: field.compliment,
                value: path + field.dotted
            })
            break
        case 'conditional':
            flattened.push({
                type: 'conditional',
                path: path + field.dotted,
                assignment: assignment,
                conditional: field
            })
            break
        case 'switch':
            flattened.push({
                type: 'switch',
                path: path + field.dotted,
                assignment: assignment,
                switched: field
            })
            break
        }
        assignment = '|='
    }
    return flattened
}

function subPack (root, path, bits, offset, fields) {
    const packed = [[]]
    for (const field of fields) {
        switch (field.type) {
        case 'integer': {
                packed[0].push({
                    bits: bits,
                    offset: offset,
                    size: field.bits,
                    value: field.value
                })
                offset += field.bits
            }
            break
        case 'conditional': {
                const { conditional, path, assignment } = field, ladder = []
                for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
                    const condition = conditional.serialize.conditions[i]
                    const source = module.exports.call(null, root, {
                        bits: bits,
                        fields: condition.fields[0].type == 'integer' && condition.fields[0].fields
                              ? condition.fields[0].fields
                              : condition.fields
                    }, path, '$_', assignment, offset)
                    if (condition.test != null) {
                        ladder.push($(`
                            ${i == 0 ? 'if' : 'else if'} ((${condition.test.source})(${root.name})) {
                                `, source, `
                            }
                        `))
                    } else {
                        ladder.push($(`
                            else {
                                `, source, `
                            }
                        `))
                    }
                }
                offset += conditional.bits
                packed.unshift(snuggle(ladder))
            }
            break
        case 'switch': {
                const { switched, path, assignment } = field, block = []
                const cases = []
                for (const when of switched.cases) {
                    const source = module.exports.call(null, root, {
                        bits: bits,
                        fields: when.fields[0].type == 'integer' && when.fields[0].fields
                              ? when.fields[0].fields
                              : when.fields
                    }, path, '$_', assignment, offset)
                    cases.push($(`
                        case ${JSON.stringify(when.value)}:

                            `, source, `

                            break
                    `))
                }
                if (switched.otherwise != null) {
                    const source = module.exports.call(null, root, {
                        bits: bits,
                        fields: switched.otherwise[0].type == 'integer' && switched.otherwise[0].fields
                              ? switched.otherwise[0].fields
                              : switched.otherwise
                    }, path, '$_', assignment, offset)
                    cases.push($(`
                        default:

                            `, source, `

                            break
                    `))
                }
                const select = switched.stringify
                    ? `String((${switched.source})(${root.name}))`
                    : `(${switched.source})(${root.name})`
                packed.unshift($(`
                    switch (${select}) {
                    `, join(cases), `
                    }
                `))
            }
            break
        }
    }
    return packed.reverse()
}

// A recent implementation of packing, but one that is now untested and stale.
// Removing from the `serialize.all` generator for visibility.
module.exports = function (root, field, path, stuff, assignment = '=', offset = 0) {
    const block = [], flattened = flatten([], path, field.fields, assignment)
    for (const packed of subPack(root, path, field.bits, offset, flattened)) {
        if (typeof packed == 'string') {
            block.push(packed)
        } else if (packed.length != 0) {
            block.push($(`
                ${stuff} ${assignment}
                    `, packed.map(_fiddle).join(' |\n'), `
            `))
        }
        assignment = '|='
    }
    return join(block)
}
