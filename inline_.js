const join = require('./join')
const accumulations = require('./accumulations')
const inliner = require('./inliner')
const _accumulator = require('./accumulator')

class Inliner {
    constructor ({ variables, packet, direction, accumulators, parameters }) {
        this.accumulators = accumulators
        this.parameters = parameters
        this.accumulated = []
        this.buffered = []
        this.variables = variables
        this.packet = packet.name
        this.direction = direction
        this.$$ = -1
        this.stack = []
    }

    accumulations (functions) {
        return accumulations({ functions, accumulate: this })
    }

    accumulator (field) {
        return _accumulator(this, this.accumulators, this.parameters, field)
    }

    inline_ (path, inlines) {
        if (inlines.length == 0) {
            this.stack.push({ offset: 0, length: 0 })
            return { path: path, inlined: null, starts: null }
        }
        const registers = this.direction == 'serialize' ? [ path, `$$[${++this.$$}]` ] : [ path ]
        const assign = registers[registers.length - 1]
        const inline = this.inline(path, inlines, registers, assign)
        const starts = []
        for (let i = inline.buffered.offset, I = inline.buffered.length; i < I; i++) {
            starts.push(`$starts[${i}] = $start`)
        }
        this.stack.push({ ...inline.buffered })
        return {
            path: inline.register,
            inlined: inline.inlined.length != 0 ? join(inline.inlined) : null,
            starts: starts.length != 0 ? starts.join('\n') : null,
        }
    }

    inline (path, inlines, registers, assignee = null) {
        return inliner(this, path, inlines, registers, assignee)
    }

    exit () {
        return this.buffered.length != 0
            ? this.buffered.map(buffered => buffered.source).join('\n')
            : null
    }

    pop () {
        const popped = this.stack.pop()
        if (this.direction == 'serialize') {
            this.$$--
        }
        const buffered = this.buffered
            .splice(popped.offset, popped.length)
            .map(buffered => buffered.source)
        return buffered.length != 0 ? buffered.join('\n') : null
    }
}

module.exports = Inliner
