module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            nudge: 0,
                            array: null,
                            sentry: 0
                        }

                    case 1:

                    case 2:

                        if ($start == $end) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.nudge = $buffer[$start++]

                    case 3:

                        $_ = 0

                    case 4: {

                        const length = Math.min($end - $start, 8 - $_)
                        $buffers.push($buffer.slice($start, $start + length))
                        $start += length
                        $_ += length

                        if ($_ != 8) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers = []

                    }

                    case 5:

                    case 6:

                        if ($start == $end) {
                            $step = 6
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                    }

                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
