module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                const assert = require('assert')

                let $i = [], $$ = []

                if ($end - $start < 5) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $$[0] = (function (value) {
                    const buffer = Buffer.alloc(4)
                    buffer.writeFloatLE(value)
                    return buffer
                })(object.value)

                assert.equal($$[0].length, 4)

                for ($i[0] = 0; $i[0] < $$[0].length; $i[0]++) {
                    $buffer[$start++] = ($$[0][$i[0]] & 0xff)
                }


                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
