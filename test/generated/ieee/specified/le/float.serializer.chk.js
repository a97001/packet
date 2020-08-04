module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_, $i = [], $$ = []

                    $$[0] = (function (value) {
                        const buffer = Buffer.alloc(4)
                        buffer.writeFloatLE(value)
                        return buffer
                    })(object.value)

                    if ($end - $start < 4) {
                        return $incremental.object(object, 1, $i, $$)($buffer, $start, $end)
                    }

                    $_ = 0
                    $$[0].copy($buffer, $start)
                    $start += $$[0].length
                    $_ += $$[0].length

                    if ($end - $start < 1) {
                        return $incremental.object(object, 3, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
