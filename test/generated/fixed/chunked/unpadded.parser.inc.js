module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite, $buffers = []

            return function parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        array: [],
                        sentry: 0
                    }

                    $step = 1

                case 1:

                    $_ = 0

                    $step = 2

                case 2: {

                    const length = Math.min($end - $start, 8 - $_)
                    $buffers.push($buffer.slice($start, $start + length))
                    $start += length
                    $_ += length

                    if ($_ != 8) {
                        return { start: $start, parse }
                    }

                    object.array = $buffers
                    $buffers = []

                    $step = 3

                }

                case 3:

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.sentry = $buffer[$start++]


                case 5:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
