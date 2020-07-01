module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                const object = {
                    padded: 0,
                    sentry: 0
                }

                if ($end - $start < 15) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $start += 6

                object.padded =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                $start += 6

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
