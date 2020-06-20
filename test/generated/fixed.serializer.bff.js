module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            const assert = require('assert')

            let $i = []

            if ($end - $start < 9) {
                return serializers.inc.object(object, 0)($buffer, $start, $end)
            }

            assert.equal(object.array.length, 4)

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = (object.array[$i[0]] >>> 8 & 0xff)
                $buffer[$start++] = (object.array[$i[0]] & 0xff)
            }


            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
