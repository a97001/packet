const fiddle = require('./fiddle/unpack')
const unsign = require('./fiddle/unsign')
const join = require('./join')
const $ = require('programmatic')
const { structure } = require('./vivify')

// Generate inline function source.
const inliner = require('./inliner')

function unpack (accumulate, root, path, field, packed, offset = 0) {
    function generate (accumulate, root, path, field, packed, offset) {
        let bits = field.bits, bit = offset
        function advance (size) {
            const offset = bit
            bit += size
            return offset
        }
        function unpack (path, field) {
            switch (field.type) {
            case 'checkpoint':
                return field
            case 'literal':
                bit += field.before.bits || 0
                const unpacked = unpack(path + field.dotted, field.fields[0])
                bit += field.after.bits || 0
                return unpacked
            case 'integer':
                return {
                    type: 'integer',
                    bits: bits,
                    path: path + field.dotted,
                    packed: packed,
                    size: field.bits,
                    offset: advance(field.bits),
                    compliment: field.compliment
                }
            case 'conditional':
                return {
                    type: 'conditional',
                    bits: bits,
                    path: path + field.dotted,
                    packed: packed,
                    offset: bit,
                    size: advance(field.bits),
                    conditional: field
                }
            case 'switch':
                return {
                    type: 'switch',
                    bits: bits,
                    path: path + field.dotted,
                    packed: packed,
                    offset: bit,
                    size: advance(field.bits),
                    switched: field
                }
            }
        }
        const blocks = []
        for (const packing of field.fields.map(f => unpack(path, f))) {
            switch (packing.type) {
            case 'checkpoint':
                break
            case 'integer': {
                    const fiddled = fiddle(packing.bits, packing.offset, packing.size, packing.packed)
                    const assign = `${packing.path} = ${fiddled}`
                    if (packing.compliment) {
                        blocks.push($(`
                            `, assign, `
                            ${packing.path} =
                                `, unsign(packing.path, packing.size), `
                        `))
                    } else {
                        blocks.push(assign)
                    }
                }
                break
            case 'conditional': {
                    const { conditional, path, offset } = packing
                    let ladder = '', keywords = 'if'
                    for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
                        const condition = conditional.serialize.conditions[i]
                        // TODO Can we use the univeral vivify here? (Ugh.)
                        const vivifyed = condition.fields[0].type == 'integer' && condition.fields[0].fields
                        const source = generate.call(null, accumulate, root, path, {
                            bits: bits,
                            fields: vivifyed ? condition.fields[0].fields : condition.fields
                        }, packed, offset)
                        const vivify = vivifyed ? structure(path, condition.fields[0]) : null
                        ladder = condition.test != null ? function () {
                            const inline = inliner(accumulate, path, [ condition.test ], [])
                            return $(`
                                `, ladder, `${keywords} (`, inline.inlined.shift(), `) {
                                    `, vivify, -1, `

                                    `, source, `
                                }
                            `)
                        } () : $(`
                            `, ladder, ` else {
                                `, vivify, -1, `

                                `, source, `
                            }
                        `)
                        keywords = ' else if'
                    }
                    blocks.push(ladder)
                }
                break
            case 'switch': {
                    const { switched, path, offset } = packing, block = []
                    const cases = []
                    for (const when of switched.cases) {
                        const vivifyed = when.fields[0].type == 'integer' && when.fields[0].fields
                        const source = module.exports.call(null, accumulate, root, path, {
                            bits: bits,
                            fields: vivifyed ? when.fields[0].fields : when.fields
                        }, packed, offset)
                        const vivify = vivifyed ? structure(path, when.fields[0]) : null
                        cases.push($(`
                            ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:
                                `, vivify, -1, `

                                `, source, `

                                break
                        `))
                    }
                    const inlined = inliner(accumulate, path, [ switched.select ], [])
                    const select = switched.stringify
                        ? `String(${inlined.inlined.shift()})`
                        : inlined.inlined.shift()
                    blocks.push($(`
                        switch (`, select, `) {
                        `, join(cases), `
                        }
                    `))
                }
                break
            }
            offset += packing.bits
        }
        return join(blocks)
    }
    return generate(accumulate, root, path, field, packed, offset)
}

module.exports = unpack
