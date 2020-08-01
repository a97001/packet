module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $i = []

            $buffer[$start++] = object.nudge & 0xff

            $buffer[$start++] = object.array.length >>> 8 & 0xff
            $buffer[$start++] = object.array.length & 0xff

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = object.array[$i[0]].length >>> 8 & 0xff
                $buffer[$start++] = object.array[$i[0]].length & 0xff

                for ($i[1] = 0; $i[1] < object.array[$i[0]].length; $i[1]++) {
                    $buffer[$start++] = object.array[$i[0]][$i[1]] >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[0]][$i[1]] & 0xff
                }
            }

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
