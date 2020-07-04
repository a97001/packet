// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate integer packing.
const pack = require('./pack')

// Maintain a set of lookup constants.
const lookup = require('./lookup')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

const map = require('./map')

// Format source code maintaining indentation.
const join = require('./join')

// Join an array of strings with first line of subsequent element catenated to
// last line of previous element.
const snuggle = require('./snuggle')

function generate (packet, { require = null }) {
    let $step = 0, $i = -1, $$ = -1, surround = false

    const variables = { packet: true, step: true }
    const constants = { assert: false }
    const accumulate = { accumulator: {}, variables, packet, direction: 'serialize' }
    const $lookup = {}

    function integer (path, field) {
        const endianness = field.endianness || 'big'
        const bytes = field.bits / 8
        const direction = field.endianness == 'big' ? '--' : '++'
        let bite = field.endianness == 'big' ? bytes - 1 : 0
        let stop = field.endianness == 'big' ? -1 : bytes
        if (field.lookup) {
            lookup($lookup, path, field.lookup.slice())
        }
        const assign = field.fields
            ? pack(packet, field, path, '$_')
            : field.lookup
                ? `$_ = $lookup.${path}.indexOf(${path})`
                : `$_ = ${path}`
        const cast = field.bits > 32
            ? { suffix: 'n', from: 'Number', shift: '>>' }
            : { suffix: '', from: '', shift: '>>>' }
        const source = $(`
            case ${$step++}:

                $step = ${$step}
                $bite = ${bite}${cast.suffix}
                `, assign, `

            case ${$step++}:

                while ($bite != ${stop}${cast.suffix}) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = ${cast.from}($_ ${cast.shift} $bite * 8${cast.suffix} & 0xff${cast.suffix})
                    $bite${direction}
                }

        `)
        return source
    }

    function literal (path, field) {
        function write (literal) {
            const bytes = []
            for (let i = 0, I = literal.value.length; i < I; i += 2) {
                bytes.push(parseInt(literal.value.substring(i, i + 2), 16))
            }
            switch (literal.repeat) {
            case 0:
                return null
            case 1:
                return $(`
                    case ${$step++}:

                        $step = ${$step}
                        $bite = 0
                        $_ = ${JSON.stringify(bytes)}

                    case ${$step++}:

                        while ($bite != ${literal.value.length / 2}) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }

                `)
            case 2: {
                    surround = true
                    variables.i = true
                    const redo = $step
                    return $(`
                        case ${$step++}:

                            $i[${$i + 1}] = 0

                        `, write({ ...literal, repeat: 1 }), `

                        case ${$step++}:

                            if (++$i[${$i + 1}] < ${literal.repeat}) {
                                $step = ${redo + 1}
                                continue
                            }
                    `)
                }
            }
        }
        return $(`
            `, write(field.before), -1, `

            `, map(dispatch, path, field.fields), `

            `, write(field.after), -1, `
        `)
    }

    // TODO I don't need to push and pop $i.
    function lengthEncoded (path, packet) {
        surround = true
        variables.i = true
        $i++
        const i = `$i[${$i}]`
        const encoding = map(dispatch, path + '.length', packet.encoding)
        const again = $step
        const source = $(`
            `, encoding, `
                ${i} = 0

            `, map(dispatch, `${path}[${i}]`, packet.fields), `

                if (++${i} != ${path}.length) {
                    $step = ${again}
                    continue
                }
        `)
        $i--
        return source
    }

    function terminated (path, field) {
        surround = true
        variables.i = true
        $i++
        const init = $step
        const again = ++$step
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const done = $step
        const terminator = join(field.terminator.map(bite => {
            return $(`
                case ${$step++}:

                    if ($start == $end) {
                        return { start: $start, serialize }
                    }

                    $buffer[$start++] = 0x${bite.toString(16)}

                    $step = ${$step}
            `)
        }))
        const source = $(`
            case ${init}:

                ${i} = 0
                $step = ${again}

            `, looped, `
                if (++${i} != ${path}.length) {
                    $step = ${again}
                    continue
                }

                $step = ${done}

            `, terminator, `
        `)
        $i--
        return source
    }

    function fixed (path, field) {
        surround = true
        variables.i = true
        $i++
        const init = $step
        const again = ++$step
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const done = $step
        const pad = join(field.pad.map(bite => {
            return $(`
                case ${$step++}:

                    if ($start == $end) {
                        return { start: $start, serialize }
                    }

                    if (${i}++ == ${field.length}) {
                        $step = ${done + field.pad.length}
                        continue
                    }

                    $buffer[$start++] = 0x${bite.toString(16)}

                    $step = ${$step}
            `)
        }))
        const assertion = (constants.assert = field.pad.length == 0)
                        ? `assert.equal(${path}.length, ${field.length})`
                        : null
        const source = $(`
            case ${init}:

                ${i} = 0
                $step = ${again}
                `, assertion, -1, `

            `, looped, `
                if (++${i} != ${path}.length) {
                    $step = ${again}
                    continue
                }

                $step = ${done}

            `, pad, `

                if (${i} != ${field.length}) {
                    $step = ${done}
                    continue
                }
        `)
        $i--
        return source
    }

    function inline (path, field) {
        const before = field.before.length != 0 ? function () {
            variables.stack = true
            const register = `$$[${++$$}]`
            const inline = inliner(accumulate, path, field.before, register, [
                path, register
            ])
            if (inline.inlined.length == 0) {
                return { path: path, source: null }
            }
            return {
                path: inline.register,
                source: $(`
                    case ${$step++}:

                        `, join(inline.inlined), `
                `)
            }
        } () : { path: path, source: null }
        if (before.path[0] != '$') {
            $$--
        }
        const source =  $(`
            `, before.source, -1, `

            `, map(dispatch, before.path, field.fields), `
        `)
        if (before.path[0] == '$') {
            $$--
        }
        return source
    }

    function conditional (path, conditional) {
        surround = true
        const start = $step++
        const steps = []
        for (const condition of conditional.serialize.conditions) {
            steps.push({
                step: $step,
                source: join(condition.fields.map(field => dispatch(path, field)))
            })
        }
        const ladder = []
        for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
            const condition = conditional.serialize.conditions[i]
            if (condition.test != null) {
                const signature = []
                if (conditional.serialize.split) {
                    signature.push(path)
                }
                signature.push(packet.name)
                ladder.push($(`
                    ${i == 0 ? 'if' : 'else if'} ((${condition.test.source})(${signature.join(', ')})) {
                        $step = ${steps[i].step}
                        continue
                    }
                `))
            } else {
                ladder.push($(`
                    else {
                        $step = ${steps[i].step}
                        continue
                    }
                `))
            }
        }
        const done = $(`
            $step = ${$step}
            continue
        `)
        // TODO Instead of choping the literal source, prevent adding the
        // trailing line, maybe. Or maybe this is best.
        return $(`
            case ${start}:

                `, snuggle(ladder), `

            `, join(steps.map((step, i) => {
                return $(`
                    `, step.source, `
                        `, -1, steps.length - 1 != i ? done : null, `
                `)
            })), `
        `)
    }

    function switched (path, field) {
        surround = true
        const start = $step++
        const cases = []
        const steps = []
        for (const when of field.cases) {
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                    $step = ${$step}
                    continue
            `))
            steps.push(join(when.fields.map(field => dispatch(path, field))))
        }
        const select = field.stringify
            ? `String((${field.source})(${packet.name}))`
            : `(${field.source})(${packet.name})`
        // TODO Slicing here is because of who writes the next step, which seems
        // to be somewhat confused.
        return $(`
            case ${start}:

                switch (${select}) {
                `, join(cases), `
                }

            `, join([].concat(steps.slice(steps, steps.length - 1).map(step => $(`
                `, step, `
                    $step = ${$step}
                    continue
            `)), steps.slice(steps.length -1))), `
        `)
    }

    function accumulator (path, field) {
        variables.accumulator = true
        return $(`
            case ${$step++}:

                `, accumulatorer(accumulate, field), `

            `, map(dispatch, path + field.dotted, field.fields), `
        `)
    }

    function dispatch (path, packet) {
        switch (packet.type) {
        case 'structure':
            return join(packet.fields.map(field => {
                const source = dispatch(path + field.dotted, field)
                return $(`
                    `, source, `
                `)
            }))
        case 'accumulator':
            return accumulator(path, packet)
        case 'switch':
            return switched(path, packet)
        case 'conditional':
            return conditional(path, packet)
        case 'inline':
            return inline(path, packet)
        case 'fixed':
            return fixed(path, packet)
        case 'terminated':
            return terminated(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'literal':
            return literal(path, packet)
        case 'bigint':
        case 'integer':
            // TODO This will not include the final step, we keep it off for the
            // looping constructs.
            return integer(path, packet)
        }
    }

    let source = $(`
        switch ($step) {
        `, dispatch(packet.name, packet), `

            $step = ${$step}

        case ${$step}:

            break

        }
    `)

    if (surround) {
        source = $(`
            for (;;) {
                `, source, `

                break
            }
        `)
    }

    const signatories = {
        packet: `${packet.name}`,
        step: '$step = 0',
        i: '$i = []',
        stack: '$$ = []',
        accumulator: '$accumulator = {}'
    }

    const declarations = {
        assert: `assert = require('assert')`
    }

    const signature = Object.keys(signatories)
                            .filter(key => variables[key])
                            .map(key => signatories[key])

    const consts = Object.keys(declarations)
                         .filter(key => constants[key])
                         .map(key => declarations[key])

    const lookups = Object.keys($lookup).length != 0
                  ? `const $lookup = ${JSON.stringify($lookup, null, 4)}`
                  : null

    const requires = required(require)

    return $(`
        serializers.inc.${packet.name} = function () {
            `, requires, -1, `

            `, lookups, -1, `

            return function (${signature.join(', ')}) {
                let $bite, $stop, $_

                `, consts.length != 0 ? `const ${consts.join(', ')}` : null, -1, `

                return function serialize ($buffer, $start, $end) {
                    `, source, `

                    return { start: $start, serialize: null }
                }
            }
        } ()
    `)
}

module.exports = function (definition, options) {
    return join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet, options)))
}
