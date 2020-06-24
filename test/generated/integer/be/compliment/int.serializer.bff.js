module.exports = function ({ serializers }) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 4) {
                return serializers.inc.object(object, 0)($buffer, $start, $end)
            }

            $buffer[$start++] = (object.value >>> 24 & 0xff)
            $buffer[$start++] = (object.value >>> 16 & 0xff)
            $buffer[$start++] = (object.value >>> 8 & 0xff)
            $buffer[$start++] = (object.value & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
