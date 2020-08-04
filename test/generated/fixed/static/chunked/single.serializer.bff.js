module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_, $i = []

                    if ($end - $start < 10) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $_ = 0
                    for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                        object.array[$i[0]].copy($buffer, $start)
                        $start += object.array[$i[0]].length
                        $_ += object.array[$i[0]].length
                    }

                    $_ = 8 - $_
                    $buffer.fill(0x0, $start, $start + $_)
                    $start += $_

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
