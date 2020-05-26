module.exports = function (parsers) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = []

            const object = {
                array: []
            }

            if ($end - $start < 16) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $i[0] = 0
            for (;;) {
                if ($end - $start < 2) {
                    return parsers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                if (
                    $buffer[$start] == 0xd &&
                    $buffer[$start + 1] == 0xa
                ) {
                    $start += 2
                    break
                }

                object.array[$i[0]] = $buffer[$start++]
                $i[0]++
            }

            $start += (16 - $i[0]) * 1 - 2

            return { start: $start, object: object, parse: null }
        }
    }
}
