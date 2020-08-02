module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                type: 0,
                value: 0,
                sentry: 0
            }

            object.type = (
                $buffer[$start++]
            ) >>> 0

            if (($ => $.type == 0)(object)) {
                object.value = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
            } else if (($ => $.type == 1)(object)) {
                object.value = (
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
            } else {
                object.value = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
            }

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
