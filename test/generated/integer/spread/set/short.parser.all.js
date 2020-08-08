module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    nudge: 0,
                    value: 0,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                object.value =
                    ($buffer[$start++] & 0x7f) << 7 |
                    $buffer[$start++]

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
