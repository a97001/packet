module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_

                let object = {
                    value: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ =
                    $buffer[$start++] +
                    $buffer[$start++] * 0x100
                object.value = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
