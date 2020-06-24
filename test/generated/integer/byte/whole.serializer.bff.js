module.exports = function ({ serializers }) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 1) {
                return serializers.inc.object(object, 0)($buffer, $start, $end)
            }

            $buffer[$start++] = (object.word & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
