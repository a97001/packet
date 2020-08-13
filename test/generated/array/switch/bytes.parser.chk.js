module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $i = [], $I = []

                    let object = {
                        type: 0,
                        array: [],
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                    }

                    object.type = $buffer[$start++]

                    switch (($ => $.type)(object)) {
                    case 0:
                        if ($end - $start < 1) {
                            return $incremental.object(object, 4, $i, $I)($buffer, $start, $end)
                        }

                        $I[0] = $buffer[$start++]

                        break

                    default:
                        if ($end - $start < 2) {
                            return $incremental.object(object, 6, $i, $I)($buffer, $start, $end)
                        }

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        break
                    }
                    $i[0] = 0

                    if ($end - $start < 1 * $I[0]) {
                        return $incremental.object(object, 8, $i, $I)($buffer, $start, $end)
                    }

                    for (; $i[0] < $I[0]; $i[0]++) {
                        object.array[$i[0]] = $buffer[$start++]
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 11, $i, $I)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
