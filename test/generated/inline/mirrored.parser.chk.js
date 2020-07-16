module.exports = function ({ parsers }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 4) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value =
                    ($buffer[$start++]) * 0x1000000 +
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                object.value = (value => ~value)(object.value)

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
