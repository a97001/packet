module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    nudge: 0,
                    value: 0n,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.nudge = (
                    $buffer[$start++]
                ) >>> 0

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                object.value =
                    BigInt($buffer[$start++]) |
                    BigInt($buffer[$start++]) << 8n |
                    BigInt($buffer[$start++]) << 16n |
                    BigInt($buffer[$start++]) << 24n |
                    BigInt($buffer[$start++]) << 32n |
                    BigInt($buffer[$start++]) << 40n |
                    BigInt($buffer[$start++]) << 48n |
                    BigInt($buffer[$start++]) << 56n

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 5)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
