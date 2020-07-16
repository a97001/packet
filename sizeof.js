// Node.js API.
const util = require('util')

const map = require('./map')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate invocations of accumulators before conditionals.
const accumulations = require('./accumulations')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

// Join an array of strings separated by an empty line.
const join = require('./join')

//

// Generate sizeof function for a given packet definition.

//
function generate (packet, { require = null }) {
    const variables = {
        register: true
    }
    const accumulate = {
        accumulator: {},
        accumulated: [],
        buffered: [],
        start: 0,
        variables: variables,
        packet: packet.name,
        direction: 'serialize'
    }

    let $i = -1

    // TODO Fold constants, you're doing `$_ += 1; $_ += 2` which won't fold.
    function dispatch (path, field) {
        switch (field.type) {
        case 'conditional': {
                const invocations = accumulations({
                    functions: field.serialize.conditions.map(condition => condition.test),
                    accumulate: accumulate
                })
                let ladder = '', keywords = 'if'
                for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
                    const condition = field.serialize.conditions[i]
                    const source = join(condition.fields.map(dispatch.bind(null, path)))
                    ladder = condition.test != null ? function () {
                        const registers = field.serialize.split ? [ path ] : []
                        const inline = inliner(accumulate, path, [ condition.test ], registers)
                        return $(`
                            `, ladder, `${keywords} (`, inline.inlined.shift(), `) {
                                `, source, `
                            }
                        `)
                    } () : $(`
                        `, ladder, ` else {
                            `, source, `
                        }
                    `)
                    keywords = ' else if'
                }
                return $(`
                    `, invocations, `

                    `, ladder, `
                `)
            }
        case 'literal':
        case 'integer':
            return `$start += ${field.bits >>> 3}`
        case 'fixed': {
                if (field.fixed) {
                    return $(`
                        $start += ${field.bits >>> 3}
                    `)
                } else {
                    throw new Error
                }
            }
            break
        case 'lengthEncoded':
            if (field.fields[0].fixed) {
                return field.fields[0].type == 'buffer' && !field.fields[0].concat
                ? $(`
                    $start += ${path}.reduce((sum, buffer) => sum + buffer.length, 0) +
                        ${field.fields[0].bits >>> 3} * ${path}.length
                `) : $(`
                    $start += ${field.encoding[0].bits >>> 3} +
                        ${field.fields[0].bits >>> 3} * ${path}.length
                `)
            } else {
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    $start += ${field.encoding[0].bits >>> 3}

                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, join(field.fields.map(field => dispatch(path + `[${i}]`, field))), `
                    }
                `)
                $i--
                return source
            }
        case 'terminated': {
                if (field.fields.filter(field => !field.fixed).length == 0) {
                    const bits = field.fields.reduce((sum, field) => sum + field.bits, 0)
                    return $(`
                        $start += ${bits >>> 3} * ${path}.length + ${field.terminator.length}
                    `)
                }
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, join(field.fields.map(field => dispatch(path + `[${i}]`, field))), `
                    }
                    $start += ${field.terminator.length}
                `)
                $i--
                return source
            }
            break
        case 'switch': {
                if (field.fixed) {
                    return $(`
                        $start += ${field.bits >>> 3}
                    `)
                }
                const cases = []
                for (const when of field.cases) {
                    cases.push($(`
                        ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                            `, join(when.fields.map(dispatch.bind(null, path))), `

                            break
                    `))
                }
                const invocations = accumulations({
                    functions: [ field.select ],
                    accumulate: accumulate
                })
                const inlined = inliner(accumulate, path, [ field.select ], [])
                const select = field.stringify
                    ? `String(${inlined.inlined.shift()})`
                    : inlined.inlined.shift()
                return $(`
                    `, invocations, -1, `

                    switch (`, select, `) {
                    `, join(cases), `
                    }
                `)
            }
            break
        case 'inline': {
                const inlines = field.before.filter(inline => {
                    return inline.properties.filter(property => {
                        return referenced[property]
                    }).length != 0
                })
                const inlined = inliner(accumulate, path, inlines, [ path ], '')
                const starts = []
                for (let i = inlined.buffered.start, I = inlined.buffered.end; i < I; i++) {
                    starts.push(`$starts[${i}] = $start`)
                }
                const source = map(dispatch, path, field.fields)
                // TODO Exclude if not externally referenced.
                const buffered = accumulate.buffered
                    .splice(0, inlined.buffered.end)
                    .map(buffered => {
                        return buffered.source
                    })
                return $(`
                    `, starts.length != 0 ? starts.join('\n') : null, -1, `

                    `, source, `

                    `, -1, buffered.length != 0 ? buffered.join('\n') : null, `
                `)
            }
            break
        case 'accumulator': {
                variables.accumulator = true
                const accumulators = field.accumulators
                    .filter(accumulator => referenced[accumulator.name])
                    .map(accumulator => accumulatorer(accumulate, accumulator))
                // TODO Really want to get rid of this step if the final
                // calcualtions are not referenced, if the argument is not an
                // external argument and if it is not referenced again in the
                // parse or serialize or sizeof.
                const declarations = accumulators.length != 0
                                   ? accumulators.join('\n')
                                   : null
                const source = field.fixed
                             ? `$start += ${field.bits >>> 3}`
                             : map(dispatch, path, field.fields)
                return  $(`
                    `, declarations, -1, `

                    `, source, `
                `)
            }
            break
        case 'structure': {
                if (field.fixed) {
                    return `$start += ${field.bits >>> 3}`
                }
                return map(dispatch, path, field.fields)
            }
            break
        }
    }

    const references = { accumulators: [], buffered: {} }, referenced = {}

    function dependencies (field) {
        switch (field.type) {
        case 'accumulator': {
                field.accumulators.forEach(accumulator => {
                    references.accumulators.push(accumulator.name)
                })
                field.fields.map(dependencies)
            }
            break
        case 'structure': {
                field.fields.map(dependencies)
            }
            break
        case 'fixed': {
                field.fields.map(dependencies)
            }
            break
        case 'inline': {
                field.before.forEach(inline => {
                    if (
                        inline.properties.filter(property => {
                            return /^(?:\$start|\$end)$/.test(property)
                        }).length != 0
                    ) {
                        references.accumulators.forEach(accumulator => {
                            if (inline.properties.includes(accumulator)) {
                                references.buffered[accumulator] = true
                            }
                        })
                    }
                })
                field.fields.map(dependencies)
            }
            break
        case 'conditional': {
                field.serialize.conditions.forEach(condition => {
                    if (condition.test == null) {
                        return
                    }
                    if (
                        condition.test.properties.filter(property => {
                            return /^(?:\$start|\$end)$/.test(property)
                        }).length != 0
                    ) {
                        buffered = true
                    }
                    condition.test.properties.forEach(property => {
                        if (references.buffered[property]) {
                            referenced[property] = true
                        }
                    })
                    condition.fields.map(dependencies)
                })
            }
            break
        case 'literal': {
                field.fields.map(dependencies)
            }
            break
        case 'switch': {
                if (
                    field.select.properties.filter(property => {
                        return /^(?:\$start|\$end)$/.test(property)
                    }).length != 0
                ) {
                    buffered = true
                }
                field.select.properties.forEach(property => {
                    if (references.buffered[property]) {
                        referenced[property] = true
                    }
                })
                field.cases.forEach(when => {
                    when.fields.map(dependencies)
                })
            }
            break
        case 'lengthEncoded': {
                field.fields.map(dependencies)
            }
            break
        case 'terminated':
        case 'integer':
        case 'absent':
        case 'buffer':
            break
        default: {
                throw new Error(field.type)
            }
            break
        }
    }

    dependencies(packet)

    const buffered = Object.keys(referenced).length != 0
    if (buffered) {
        variables.starts = true
    }

    const source = dispatch(packet.name, packet)
    const declarations = {
        register: '$start = 0',
        i: '$i = []',
        starts: '$starts = []',
        accumulator: '$accumulator = {}'
    }

    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])

    const requires = required(require)

    return  $(`
        sizeOf.${packet.name} = function () {
            `, requires, -1, `

            return function (${packet.name}) {
                let ${lets.join(', ')}

                `, source, `

                return $start
            }
        } ()
    `)
}

module.exports = function (packets, options = {}) {
    return join(packets.map(packet => generate(packet, options)))
}
