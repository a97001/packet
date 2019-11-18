module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < 4) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0, [])
                }
            }

            $_ = object.word

            $buffer[$start++] = $_ >>> 24 & 0xff
            $buffer[$start++] = $_ >>> 16 & 0xff
            $buffer[$start++] = $_ >>> 8 & 0xff
            $buffer[$start++] = $_ & 0xff

            return { start: $start, serialize: null }
        }
    }
}
