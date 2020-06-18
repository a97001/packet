module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            $buffer[$start++] = (object.array.length >>> 8 & 0xff)
            $buffer[$start++] = (object.array.length & 0xff)

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = (object.array[$i[0]].first >>> 8 & 0xff)
                $buffer[$start++] = (object.array[$i[0]].first & 0xff)

                $buffer[$start++] = (object.array[$i[0]].second >>> 8 & 0xff)
                $buffer[$start++] = (object.array[$i[0]].second & 0xff)
            }

            return { start: $start, serialize: null }
        }
    }
}
