module.exports = function ({ serializers }) {
    serializers.all.object = function () {
        const assert = require('assert')

        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = [], $accumulator = {}

                $accumulator['counter'] = [ 0 ]

                $$[0] = (function ($_) {
                    return $_
                })(object)

                $buffer[$start++] = ($$[0].value.first & 0xff)

                $buffer[$start++] = ($$[0].value.second & 0xff)

                $buffer[$start++] = ($$[0].sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
