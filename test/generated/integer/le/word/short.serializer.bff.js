module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    if ($end - $start < 2) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value & 0xff
                    $buffer[$start++] = object.value >>> 8 & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
