module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 10) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                object.nudge = (
                    $buffer[$start++]
                ) >>> 0

                $i[0] = 0
                do {
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 4, $i)($buffer, $start, $end)
                    }

                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    object.array[$i[0]] = (
                        $buffer[$start++]
                    ) >>> 0
                } while (++$i[0] != 8)

                $start += 8 != $i[0]
                        ? (8 - $i[0]) * 1 - 1
                        : 0

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
