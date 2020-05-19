const join = require('./join')
const map = require('./map')
const snuggle = require('./snuggle')
const unpack = require('./unpack')
const unsign = require('./fiddle/unsign')
const $ = require('programmatic')
const vivify = require('./vivify')
const ARRAYED = [ 'lengthEncoding', 'terminated' ]

function generate (packet) {
    let $step = 0, $i = -1, $sip = -1, _conditional = false, _terminated = false

    const lets = { packet: true, step: true }

    function integer (path, field) {
        const bytes = field.bits / 8
        if (bytes == 1) {
            return $(`
                case ${$step++}:

                    $step = ${$step}

                case ${$step++}:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    ${path} = $buffer[$start++]

            `)
        }
        const start = field.endianness == 'big' ? bytes - 1 : 0
        const stop = field.endianness == 'big' ? -1 : bytes
        const direction = field.endianness == 'big' ?  '--' : '++'
        const assign = field.fields ? unpack(path, field, '$_')
                     : field.compliment ? `${path} = ${unsign('$_', field.bits)}`
                     : `${path} = $_`
        return $(`
            case ${$step++}:

                $_ = 0
                $step = ${$step}
                $bite = ${start}

            case ${$step++}:

                while ($bite != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                    $bite${direction}
                }

                `, assign, `

        `)
    }

    function literal (path, field) {
        function write (literal) {
            if (literal.repeat == 0) {
                return null
            }
            return $(`
                case ${$step++}:

                    $_ = ${literal.value.length / 2}
                    $step = ${$step}

                case ${$step++}:

                    $bite = Math.min($end - $start, $_)
                    $_ -= $bite
                    $start += $bite

                    if ($_ != 0) {
                        return { start: $start, object: null, parse }
                    }
            `)
        }
        return $(`
            `, write(field.before, 1), `

            `, map(dispatch, path, field.fields), `

            `, write(field.after, -1), `
        `)
    }

    function lengthEncoded (path, packet) {
        lets.i = true
        lets.I = true
        const i = `$i[${$i}]`
        const I = `$I[${$i}]`
        // var integer = integer(packet.length, 'length')
        // Invoked here to set `again`.
        const again = $step
        const source = $(`
            case ${$step++}:

                `, vivify.array(`${path}[${i}]`, packet), `

            `, map(dispatch,`${path}[${i}]`, packet.fields), `
                if (++${i} != ${I}) {
                    $step = ${again}
                    continue
                }
        `)
        $i--
        return source
    }

    function lengthEncoding (path, field) {
        $i++
        const i = `$i[${$i}]`
        const I = `$I[${$i}]`
        return $(`
            `, integer([ I ], field), `
                ${i} = 0
        `)
    }

    // We will have a special case for bite arrays where we can use index of to
    // find the terminator, when the termiantor is zero or `\n\n` or the like,
    // because we can use `indexOf` to find the boundary. Maybe byte arrays
    // should always be returned as `Buffer`s?

    // We will have a another special case for word arrays where the terminated
    // word because we can jump right ito them.

    // Seems like in the past I would read the terminator into an array and if
    // it didn't match, I'd feed the array to the parser, this would handle long
    // weird terminators.
    function terminated (path, field) {
        lets.i = true
        $i++
        const i = `$i[${$i}]`
        _terminated = true
        const init = $step
        let sip = ++$step
        const redo = $step
        const begin = $step += field.terminator.length
        $step++
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const literal = field.terminator.map(bite => `0x${bite.toString(16)}`)
        const terminator = join(field.terminator.map((bite, index) => {
            if (index != field.terminator.length - 1) {
                return $(`
                    case ${sip++}:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            continue
                        }
                        $start++

                        $step = ${sip}
                `)
            } else {
                return $(`
                    case ${sip++}:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            parse([ ${literal.slice(0, index).join(', ')} ], 0, ${index})
                            continue
                        }
                        $start++

                        $step = ${$step + 1}
                        continue
                `)
            }
        }))
        const source = $(`
            case ${init}:

                ${i} = 0

            `, terminator, `

            case ${begin}:

                `, vivify.array(`${path}[${i}]`, field), `

            `, looped, `

            case ${$step++}:

                ${i}++
                $step = ${redo}
                continue
        `)
        $i--
        return source
    }

    function conditional (path, conditional) {
        lets.sip = true
        $sip++
        const { parse } = conditional
        const sip = join(parse.sip.map(field => dispatch(`$sip[${$sip}]`, field)))
        const start = $step++
        const steps = []
        for (const condition of parse.conditions) {
            steps.push({
                number: $step,
                source: join(condition.fields.map(field => dispatch(path, field)))
            })
        }
        const ladder = []
        for (let i = 0, I = parse.conditions.length; i < I; i++) {
            const condition = parse.conditions[i]
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            ladder.push($(`
                ${keyword} ((${condition.source})($sip[${$sip}], ${path}, ${packet.name})) {
                    $step = ${steps[i].number}
                    continue
                }
            `))
        }
        const done = $(`
            $step = ${$step}
            continue
        `)
        $sip--
        return $(`
            `, sip, `

            case ${start}:

                `, snuggle(ladder), `

            `, join(steps.map((step, i) => {
                return $(`
                    `, step.source, `

                        `, steps.length - 1 != i ? done : null, `
                `)
            })), `
        `)
    }

    // We will have a special case for bite arrays where we can use index of to
    // find the terminator, when the termiantor is zero or `\n\n` or the like,
    // because we can use `indexOf` to find the boundary. Maybe byte arrays
    // should always be returned as `Buffer`s?

    // We will have a another special case for word arrays where the terminated
    // word because we can jump right ito them.

    // Seems like in the past I would read the terminator into an array and if
    // it didn't match, I'd feed the array to the parser, this would handle long
    // weird terminators.
    function fixed (path, field) {
        lets.i = true
        $i++
        const i = `$i[${$i}]`
        _terminated = true
        const init = $step
        let sip = ++$step
        const redo = $step
        const begin = $step += field.pad.length
        $step++
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const literal = field.pad.map(bite => `0x${bite.toString(16)}`)
        // TODO Seems like there ought to be some rules. I'm only going to
        // support multi-character string terminators, really. If you have an
        // terminated array of variable structures that could also be fixed,
        // that's a horrible format.
        const fit = Math.ceil(field.pad.length / (field.bits / 8))
        const remaining
            = field.fixed ? $(`
                if (${field.length} - ${i} < ${field.pad.length}) {
                    $step = ${$step + 1}
                    continue
                }
            `) : null
        const terminator = join(field.pad.map((bite, index) => {
            if (index != field.pad.length - 1) {
                return $(`
                    case ${sip++}:

                        `, remaining, 1, `

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            continue
                        }
                        $start++

                        $step = ${sip}
                `)
            } else {
                return $(`
                    case ${sip++}:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            parse([ ${literal.slice(0, index).join(', ')} ], 0, ${index})
                            continue
                        }
                        $start++

                        $step = ${$step + 1}
                        continue
                `)
            }
        }))
        const source = $(`
            case ${init}:

                ${i} = 0

            `, terminator, `

            case ${begin}:

                `, vivify.array(`${path}[${i}]`, field), `

            `, looped, `

            case ${$step++}:

                ${i}++
                $step = ${redo}
                continue

            case ${$step++}:

                $_ = (${field.length} - ${i}) * ${field.bits / field.length / 8} - ${field.pad.length}
                $step = ${$step}

            case ${$step++}:

                $bite = Math.min($end - $start, $_)
                $_ -= $bite
                $start += $bite

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }

                $step = ${$step}
        `)
        $i--
        return source
    }

    function dispatch (path, packet, depth, arrayed) {
        switch (packet.type) {
        case 'structure':
            return map(dispatch, path, packet.fields)
        case 'conditional':
            return conditional(path, packet)
        case 'fixed':
            return fixed(path, packet)
        case 'terminated':
            return terminated(path, packet)
        case 'lengthEncoding':
            return lengthEncoding(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'integer':
            return integer(path, packet)
        case 'function':
            return $(`
                case ${$step++}:

                    ${path} = (${packet.source})($sip[0])
            `)
        case 'literal':
            return literal(path, packet)
        }
    }

    let source = $(`
        switch ($step) {
        case ${$step++}:

            `, vivify.structure(packet.name, packet), `

            $step = ${$step}

        `, dispatch(packet.name, packet, 0), `

        case ${$step}:

            return { start: $start, object: ${packet.name}, parse: null }
        }
    `)

    const signatories = {
        packet: `${packet.name} = {}`,
        step: '$step = 0',
        i: '$i = []',
        I: '$I = []',
        sip: '$sip = []'
    }
    const signature = Object.keys(signatories)
                            .filter(key => lets[key])
                            .map(key => signatories[key])
    if (lets.i || lets.sip) {
        source = $(`
            for (;;) {
                `, source, `
                break
            }
        `)
    }

    const object = `parsers.inc.${packet.name}`
    return $(`
        ${object} = function (${signature.join(', ')}) {
            let $_, $bite
            return function parse ($buffer, $start, $end) {
                `, source, `
            }
        }
    `)
}

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet))))
}
