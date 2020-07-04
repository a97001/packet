module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value = ($buffer[$start++])

                ; (({ value = 0 }) => require('assert').equal(value, 1))({
                    value: object.value
                })

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
