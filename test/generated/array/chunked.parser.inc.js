module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = [], $I = []) {
            let $_, $bite, $index = 0, $buffers = []

            return function parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        array: [],
                        sentry: 0
                    }

                    $step = 1

                case 1:

                    $step = 2

                case 2:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    $I[0] = $buffer[$start++]


                    $step = 3

                case 3:

                    const $length = Math.min($I[0] - $index, $end - $start)
                    $buffers.push($buffer.slice($start, $start + $length))
                    $index += $length
                    $start += $length

                    if ($index != $I[0]) {
                        return { start: $start, parse }
                    }

                    object.array = $buffers

                    $index = 0
                    $buffers = []

                    $step = 4

                case 4:

                    $step = 5

                case 5:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.sentry = $buffer[$start++]


                case 6:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}