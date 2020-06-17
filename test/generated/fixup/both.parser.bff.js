module.exports = function (parsers) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $_

            const object = {
                value: 0
            }

            if ($end - $start < 2) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $_ =
                $buffer[$start++] * 0x100 +
                $buffer[$start++]
            object.value = $_ & 0x8000 ? (0xffff - $_  + 1) * -1 : $_

            object.value = (value => -value)(object.value)

            return { start: $start, object: object, parse: null }
        }
    }
}
