module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 2 * object.value.length) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $buffer[$start++] = (object.value.first & 0xff)

            $buffer[$start++] = (object.value.second & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
