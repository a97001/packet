// Format source code maintaining indentation.
const $ = require('programmatic')

// Convert numbers and arrays to numbers to literals with hex literals.
const hex = require('./hex')

// Generate integer packing.
const pack = require('./pack')

// Maintain a set of lookup constants.
const lookup = require('./lookup')

// Determine necessary variables.
const { serialize: declare } = require('./declare')

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

    const variables = declare(packet)

    const locals = {}

    const accumulate = {
        accumulator: {},
        accumulated: [],
        buffered: [],
        variables: variables,
        packet: packet.name,
        direction: 'serialize'
    }
    const $lookup = {}

    function absent () {
        // TODO Can we have nothing instead?
        return $(`
            case ${$step++}:

                $step = ${$step}
        `)
    }

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
        const buffered = accumulate.buffered.map(buffered => buffered.source)
        const source = $(`
            case ${$step++}:

                $step = ${$step}
                $bite = ${bite}${cast.suffix}
                `, assign, `

            case ${$step++}:

                while ($bite != ${stop}${cast.suffix}) {
                    if ($start == $end) {
                        `, buffered.length != 0 ? buffered.join('\n') : null, `
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

                        while ($bite != ${literal.value.length >>> 1}) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }

                `)
            case 2: {
                    surround = true
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

    function lengthEncoded (path, field) {
        const element = field.fields[0]
        surround = true
        const buffered = accumulate.buffered.length != 0 ? accumulate.buffered.map(buffered => {
            return $(`
                `, buffered.source, `
                $starts[${buffered.start}] = $start
            `)
        }).join('\n') : null
        if (element.type == 'buffer') {
            locals['copied'] = 0
            if (!element.concat) {
                locals['offset'] = 0
                locals['index'] = 0
                locals['length'] = 0
            }
            // New to you as of this writing is resetting `$index`. We're not
            // proagating an index from the best-foot-forward parser. Should we
            // call this incremental scope versus best-foot-forward scope?
            return element.concat
            ? $(`
                `, map(dispatch, path + '.length', field.encoding), `

                case ${$step++}: {

                    const $bytes = Math.min($end - $start, ${path}.length - $copied)
                    ${path}.copy($buffer, $start, $copied, $copied + $bytes)
                    $copied += $bytes
                    $start += $bytes

                    if ($copied != ${path}.length) {
                        `, buffered, `
                        return { start: $start, serialize }
                    }

                    $copied = 0

                    $step = ${$step}

                }
            `)
            : $(`
                case ${$step++}:

                    $length = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)

                    $step = ${$step}

                `, map(dispatch, '$length', field.encoding), `

                case ${$step++}: {

                    do {
                        const $bytes = Math.min($end - $start, ${path}[$index].length - $offset)
                        ${path}[$index].copy($buffer, $start, $offset, $offset + $bytes)
                        $copied += $bytes
                        $offset += $bytes
                        $start += $bytes
                        if ($start == $end) {
                            `, buffered, `
                            return { start: $start, serialize }
                        }
                        if ($offset == ${path}[$index].length) {
                            $index++
                            $offset = 0
                        }
                    } while ($copied != $length)

                    $index = 0
                    $copied = 0
                    $offset = 0

                    $step = ${$step}

                }
            `)
        }
        const encoding = map(dispatch, path + '.length', field.encoding)
        const redo = $step
        const i = `$i[${++$i}]`
        const source = $(`
            `, encoding, `
                ${i} = 0

            `, map(dispatch, `${path}[${i}]`, field.fields), `

                if (++${i} != ${path}.length) {
                    $step = ${redo}
                    continue
                }
        `)
        $i--
        return source
    }

    function terminated (path, field) {
        surround = true
        $i++
        const init = $step
        const again = ++$step
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const done = $step
        const buffered = accumulate.buffered.map(buffered => {
            return $(`
                `, buffered.source, `
                $starts[${buffered.start}] = $start
            `)
        })
        const terminator = join(field.terminator.map(bite => {
            return $(`
                case ${$step++}:

                    if ($start == $end) {
                        `, buffered.length != 0 ? buffered.join('\n') : null, `
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
        // We will be looping.
        surround = true
        // Get the element type contained by the array.
        const element = field.fields[field.fields.length - 1]
        // Generate any buffered function calls to process the buffer if we
        // reach the end of the buffer.
        const buffered = accumulate.buffered.length != 0
                       ? accumulate.buffered.map(buffered => buffered.source).join('\n')
                       : null
        // The byte-by-byte implementation of pad is used by byte-by-byte, of
        // course, and buffers when the terminator is multi-byte.
        //
        // **TODO** Seems like pad should use `fill` in both cases and use as
        // `fill` as much as possible when multi-byte, track the offsets, etc.
        // Would worry about it more if fixed buffers weren't such a goofball
        // case. It would be slice remainder copy, fill, slice remainder copy
        // each time.
        //
        // **TODO** Lengths seem off, array length and not byte length? I've
        // added the multiplication, let's see if it breaks.
        function pad (assignment = null) {
            if (field.pad.length == 0) {
                return `$step = ${$step}`
            }
            // First step of padding.
            const redo = $step
            // First step of next field.
            const done = $step + field.pad.length
            // Assign the padding byte to the buffer, break if we've reached the
            // end of the buffer.
            const pad = join(field.pad.map(bite => {
                return $(`
                    x
                        `, -1, null, `
                        $step = ${$step}

                    case ${$step++}:

                        if ($start == $end) {
                            `, buffered, `
                            return { start: $start, serialize }
                        }

                        if ($_++ == ${field.bits >>> 3}) {
                            $step = ${done}
                            continue
                        }

                        $buffer[$start++] = ${hex(bite)}

                        $step = ${$step}
                `)
            }))
            // Repeat the padding fill if we've not filled the buffer
            return $(`
                x
                    `, -1, null, `
                    `, assignment, -1, `

                `, pad, `

                    if ($_ != ${field.bits >>> 3}) {
                        $step = ${redo}
                        continue
                    }
            `)
        }
        //

        // If a buffer, use `copy` and `fill`.

        //
        if (element.type == 'buffer') {
            // If we have an array of buffers, we need a loop index and a
            // variable to track the offset in the specific buffer.
            let i
            if (!element.concat) {
                locals['offset'] = 0
                locals['length'] = 0
                i = `$i[${++$i}]`
            }
            const source = element.concat
            // Copy the single buffer using copy.
            ? $(`
                case ${$step++}:

                    $_ = 0

                    $step = ${$step}

                case ${$step++}: {

                        const length = Math.min($end - $start, ${path}.length - $_)
                        ${path}.copy($buffer, $start, $_, $_ + length)
                        $start += length
                        $_ += length

                        if ($_ != ${path}.length) {
                            `, buffered, `
                            return { start: $start, serialize }
                        }

                        $step = ${$step}

                    }
            `)
            // Loop through an array of buffers copying to the serialization
            // buffer using `Buffer.copy()`. Need to track the index of the
            // current buffer in the array the offset in the current buffer.
            : $(`
                case ${$step++}:

                    $_ = 0
                    $offset = 0
                    $length = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)
                    ${i} = 0

                    $step = ${$step}

                case ${$step++}: {

                    for (;;) {
                        const length = Math.min($end - $start, ${path}[${i}].length - $offset)
                        ${path}[${i}].copy($buffer, $start, $offset, $offset + length)
                        $offset += length
                        $start += length
                        $_ += length

                        if ($offset == ${path}[${i}].length) {
                            ${i}++
                            $offset = 0
                        }

                        if ($_ == $length) {
                            break
                        }

                        `, buffered, `
                        return { start: $start, serialize }
                    }

                    $step = ${$step}

                }
            `)
            // If we have an array of buffers, we need to release the allocated
            // array index.
            if (!element.concat) {
                i--
            }
            // If there is no padding, we are done.
            if (field.pad.length == 0) {
                return source
            }
            // We can use `Buffer.fill()` for single-byte padding.
            // TODO Unnecessary `$_` assignment.
            if (field.pad.length == 1) {
                return $(`
                    `, source, `

                    case ${$step++}:

                        $_ = ${field.length} - $_

                        $step = ${$step}

                    case ${$step++}: {

                        const length = Math.min($end - $start, $_)
                        $buffer.fill(${hex(field.pad[0])}, $start, $start + length)
                        $start += length
                        $_ -= length

                        if ($_ != 0) {
                            return { start: $start, serialize }
                        }

                        $step = ${$step}

                    }
                `)
            }
            // We use bite-by-bite padfor multi-byte padding.
            return $(`
                `, source, `

                `, pad(), `
            `)
        }
        // Obtain a next index from the index array.
        const i = `$i[${++$i}]`
        // Initialization step.
        const init = $step++
        // Start of element fields, loop reset.
        const redo = $step
        // Put it all together.
        const source = $(`
            case ${init}:

                ${i} = 0
                $step = ${redo}

            `, map(dispatch, `${path}[${i}]`, field.fields), `
                if (++${i} != ${path}.length) {
                    $step = ${redo}
                    continue
                }

            `, pad(`$_ = ${i} * ${element.bits >>> 3}`), `
        `)
        // Release the array index from the array of indices.
        $i--
        return source
    }

    function inline (path, field) {
        const before = field.before.length != 0 ? function () {
            const register = `$$[${++$$}]`
            const inline = inliner(accumulate, path, field.before, [
                path, register
            ], register)
            if (
                inline.inlined.length == 0 &&
                inline.buffered.start == inline.buffered.end
            ) {
                return {
                    path: path,
                    source: null,
                    buffered: inline.buffered
                }
            }
            const starts = []
            for (let i = inline.buffered.start, I = inline.buffered.end; i < I; i++) {
                starts.push(`$starts[${i}] = $start`)
            }
            return {
                path: inline.register,
                source: $(`
                    case ${$step++}:

                        `, join(inline.inlined), `
                        `, starts.length != 0 ? starts.join('\n') : null, `
                `),
                buffered: inline.buffered
            }
        } () : {
            path: path,
            source: null,
            buffered: {
                start: accumulate.buffered.length,
                end: accumulate.buffered.length
            }
        }
        if (before.path[0] != '$') {
            $$--
        }
        const source =  map(dispatch, before.path, field.fields)
        const buffered = accumulate.buffered
            .splice(0, before.buffered.end)
            .map(buffered => {
                return buffered.source
            })
        if (before.path[0] == '$') {
            $$--
        }
        return $(`
            `, before.source, -1, `

            `, source, `

                `, -1, buffered.length != 0 ? buffered.join('\n') : null, `
        `)
    }

    function conditional (path, conditional) {
        surround = true
        const accumulators = {}
        conditional.serialize.conditions.forEach(condition => {
            if (condition.test == null) {
                return
            }
            condition.test.properties.forEach(property => {
                if (accumulate.accumulator[property] != null) {
                    accumulators[property] = true
                }
            })
        })
        const invocations = accumulate.buffered.filter(accumulator => {
            return accumulator.properties.filter(property => {
                return accumulate.accumulator[property] != null
            }).length != 0
        }).map(invocation => {
            return $(`
                `, invocation.source, `
                $starts[${invocation.start}] = $start
            `)
        })
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
                const registers = conditional.serialize.split ? [ path ] : []
                const f = inliner(accumulate, path, [ condition.test ], registers)
                ladder.push( `${i == 0 ? 'if' : 'else if'} (${f.inlined.shift()})` + $(`
                    {
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

                `, invocations.length != 0 ? invocations.join('\n') : null, -1, `

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
        return $(`
            case ${$step++}:

                `, accumulatorer(accumulate, field), `

            `, map(dispatch, path, field.fields), `
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
        case 'buffer':
        case 'bigint':
        case 'integer':
            // TODO This will not include the final step, we keep it off for the
            // looping constructs.
            return integer(path, packet)
        case 'absent':
            return absent(path, packet)
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
        accumulator: '$accumulator = {}',
        starts: '$starts = []'
    }

    const signature = Object.keys(signatories)
                            .filter(key => variables[key])
                            .map(key => signatories[key])

    const lookups = Object.keys($lookup).length != 0
                  ? `const $lookup = ${JSON.stringify($lookup, null, 4)}`
                  : null

    const requires = required(require)

    const restart = variables.starts ? $(`
        if ($restart) {
            for (let $j = 0; $j < $starts.length; $j++) {
                $starts[$j] = $start
            }
        }
        $restart = true
    `) : null

    const declarations = {
        register: '$_',
        bite: '$bite',
        starts: '$restart = false',
        length: '$length = 0'
    }

    variables.register = true
    variables.bite = true

    const lets = Object.keys(declarations)
                       .filter(key => variables[key])
                       .map(key => declarations[key])
                       .concat(Object.keys(locals).map(name => `$${name} = ${locals[name]}`))

    return $(`
        serializers.inc.${packet.name} = function () {
            `, requires, -1, `

            `, lookups, -1, `

            return function (${signature.join(', ')}) {
                let ${lets.join(', ')}

                return function serialize ($buffer, $start, $end) {
                    `, restart, -1, `

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
