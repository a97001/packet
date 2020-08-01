module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.nudge & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.value.length & 0xff

                for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                    if ($end - $start < 1) {
                        return serializers.inc.object(object, 4, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value[$i[0]] & 0xff
                }

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 6, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
