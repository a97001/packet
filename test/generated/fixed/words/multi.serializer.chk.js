module.exports = function ({ serializers }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 16) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = (object.array[$i[0]] & 0xff)
                }

                for (;;) {
                    if ($i[0] == 16) {
                        break
                    }
                    $buffer[$start++] = 0xd
                    $i[0]++

                    if ($i[0] == 16) {
                        break
                    }
                    $buffer[$start++] = 0xa
                    $i[0]++
                }

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 5, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
