module.exports = function ({ serializers }) {
    serializers.chk.object = function () {
        const twiddle = require('../../../test/cycle/twiddle')

        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = []

                $$[0] = (value => twiddle(value))(object.value)

                if ($end - $start < 4) {
                    return serializers.inc.object(object, 1, $$)($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0] >>> 24 & 0xff)
                $buffer[$start++] = ($$[0] >>> 16 & 0xff)
                $buffer[$start++] = ($$[0] >>> 8 & 0xff)
                $buffer[$start++] = ($$[0] & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 3, $$)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
