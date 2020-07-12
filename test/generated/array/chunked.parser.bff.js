module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $i = [], $I = []

                let object = {
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                $I[0] = ($buffer[$start++])

                if ($end - $start < 1 * $I[0]) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                object.array = [ $buffer.slice($start, $start + $I[0]) ]
                $start += $I[0]

                if (($ => false)(object)){
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 5, $i, $I)($buffer, $start, $end)
                    }

                    object.sentry =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                } else if (($ => true)(object)){
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 7, $i, $I)($buffer, $start, $end)
                    }

                    object.sentry = ($buffer[$start++])
                }

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
