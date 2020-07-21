module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        const assert = require('assert')

        return function (object, {
            counter = [ 0 ]
        } = {}) {
            return function ($buffer, $start, $end) {
                let $$ = [], $accumulator = {}

                $accumulator['counter'] = counter

                $$[0] = (function ({ $_, counter }) {
                    assert.deepEqual(counter, [ 0 ])
                    return $_
                })({
                    $_: object,
                    counter: $accumulator['counter']
                })

                if ($end - $start < 1) {
                    return serializers.inc.object(object, $accumulator, 2, $$, {
                        counter: [ 0 ]
                    })($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].value.first & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, $accumulator, 4, $$, {
                        counter: [ 0 ]
                    })($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].value.second & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, $accumulator, 6, $$, {
                        counter: [ 0 ]
                    })($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
