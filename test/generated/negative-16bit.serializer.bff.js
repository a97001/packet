module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 2) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $buffer[$start++] = (object.word >>> 8 & 0xff)
            $buffer[$start++] = (object.word & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
