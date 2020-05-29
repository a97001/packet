module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            for ($i0] = 0; $i0] < 2; i++) {
                $buffer.write("0faded", $start, $start + 3, 'hex')
                $start += 3
            }

            $buffer[$start++] = object.padded >>> 8 & 0xff
            $buffer[$start++] = object.padded & 0xff

            for ($i0] = 0; $i0] < 2; i++) {
                $buffer.write("facade", $start, $start + 3, 'hex')
                $start += 3
            }

            return { start: $start, serialize: null }
        }
    }
}
