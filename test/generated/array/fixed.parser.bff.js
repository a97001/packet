module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = [], $I = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 3) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                object.nudge = ($buffer[$start++])

                $I[0] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[0] = 0

                if ($end - $start < 1 + 4 * $I[0]) {
                    return parsers.inc.object(object, 5, $i, $I)($buffer, $start, $end)
                }

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = {
                        first: 0,
                        second: 0
                    }

                    object.array[$i[0]].first =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])

                    object.array[$i[0]].second =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
