module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            const twiddle = require('../../cycle/twiddle')

            return function () {
                return function ($buffer, $start, $end) {
                    let object = {
                        value: 0,
                        sentry: 0
                    }

                    if ($end - $start < 4) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.value = (
                        $buffer[$start++] << 24 |
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    object.value = (value => twiddle(value))(object.value)

                    if ($end - $start < 1) {
                        return $incremental.object(object, 3)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
