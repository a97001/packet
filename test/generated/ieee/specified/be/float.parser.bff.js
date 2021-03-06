module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_, $i = [], $slice = null

                    let object = {
                        value: null,
                        sentry: 0
                    }

                    if ($end - $start < 5) {
                        return $incremental.object(object, 1, $i)($buffer, $start, $end)
                    }

                    $slice = $buffer.slice($start, $start + 4)
                    $start += 4
                    object.value = $slice

                    object.value = (function (value) {
                        return value.readFloatBE()
                    })(object.value)

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
