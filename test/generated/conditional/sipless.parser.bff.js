module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    type: 0,
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.type = ($buffer[$start++])

                if (($ => $.type == 0)(object)) {
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 4)($buffer, $start, $end)
                    }

                    object.value =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                } else if (($ => $.type == 1)(object)) {
                    if ($end - $start < 3) {
                        return parsers.inc.object(object, 6)($buffer, $start, $end)
                    }

                    object.value =
                        ($buffer[$start++]) * 0x10000 +
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                } else {
                    if ($end - $start < 4) {
                        return parsers.inc.object(object, 8)($buffer, $start, $end)
                    }

                    object.value =
                        ($buffer[$start++]) * 0x1000000 +
                        ($buffer[$start++]) * 0x10000 +
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 10)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
