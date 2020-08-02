module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $i = []

            let object = {
                nudge: 0,
                array: [],
                sentry: 0
            }

            object.nudge = (
                $buffer[$start++]
            ) >>> 0

            $i[0] = 0
            do {
                if (
                    $buffer[$start] == 0xd &&
                    $buffer[$start + 1] == 0xa
                ) {
                    $start += 2
                    break
                }

                object.array[$i[0]] = (
                    $buffer[$start++]
                ) >>> 0
            } while (++$i[0] != 16)

            $start += 16 != $i[0]
                    ? (16 - $i[0]) * 1 - 2
                    : 0

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
