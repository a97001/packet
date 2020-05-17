module.exports = function (parsers) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = [], $I = []

            const object = {
                array: []
            }

            if ($end - $start < 2) {
                return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
            }

            $i[0] = 0
            $I[0] =
                $buffer[$start++] * 0x100 +
                $buffer[$start++]

            for (; $i[0] < $I[0]; $i[0]++) {
                object.array[$i[0]] = {
                    first: 0,
                    second: 0
                }

                if ($end - $start < 4) {
                    return parsers.inc.object(object, 4, $i, $I)($buffer, $start, $end)
                }

                object.array[$i[0]].first =
                    $buffer[$start++] * 0x100 +
                    $buffer[$start++]

                object.array[$i[0]].second =
                    $buffer[$start++] * 0x100 +
                    $buffer[$start++]
            }

            return { start: $start, object: object, parse: null }
        }
    }
}
