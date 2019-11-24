module.exports = function (parsers) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                word: 0
            }

            if ($end - $start < NaN) {
                return parsers.inc.object(object, 0)($buffer, $start, $end)
            }

            object.word  = $buffer[$start++]

            return { start: $start, object: object, parse: null }
        }
    }
}
