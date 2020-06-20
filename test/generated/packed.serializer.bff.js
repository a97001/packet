module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < 5) {
                return serializers.inc.object(object, 0)($buffer, $start, $end)
            }

            $_ =
                ((0xdeaf << 16 & 0xffff0000) >>> 0) |
                (object.header.one << 15 & 0x8000) |
                (object.header.two << 12 & 0x7000) |
                (object.header.three & 0xfff)

            $buffer[$start++] = ($_ >>> 24 & 0xff)
            $buffer[$start++] = ($_ >>> 16 & 0xff)
            $buffer[$start++] = ($_ >>> 8 & 0xff)
            $buffer[$start++] = ($_ & 0xff)

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
