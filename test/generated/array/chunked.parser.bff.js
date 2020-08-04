module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $i = [], $I = []

                    let object = {
                        nudge: 0,
                        array: [],
                        sentry: 0
                    }

                    if ($end - $start < 2) {
                        return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $I[0] = $buffer[$start++]

                    if ($end - $start < 1 + 1 * $I[0]) {
                        return $incremental.object(object, 5, $i, $I)($buffer, $start, $end)
                    }

                    object.array = [ $buffer.slice($start, $start + $I[0]) ]
                    $start += $I[0]

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
