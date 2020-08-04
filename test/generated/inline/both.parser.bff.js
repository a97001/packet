module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_

                    let object = {
                        value: 0,
                        sentry: 0
                    }

                    if ($end - $start < 3) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    $_ = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0
                    object.value = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                    object.value = (value => -value)(object.value)

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
