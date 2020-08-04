module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                        for ($i[1] = 0; $i[1] < object.array[$i[0]].length; $i[1]++) {
                            if ($end - $start < 2) {
                                return $incremental.object(object, 4, $i)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.array[$i[0]][$i[1]] >>> 8 & 0xff
                            $buffer[$start++] = object.array[$i[0]][$i[1]] & 0xff
                        }

                        if ($end - $start < 2) {
                            return $incremental.object(object, 6, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = 0x0
                        $buffer[$start++] = 0x0
                    }

                    if ($end - $start < 2) {
                        return $incremental.object(object, 9, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = 0x0
                    $buffer[$start++] = 0x0

                    if ($end - $start < 1) {
                        return $incremental.object(object, 12, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
