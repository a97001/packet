module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                nudge: 0,
                                array: [],
                                sentry: 0
                            }

                            $step = 1

                        case 1:

                            $step = 2

                        case 2:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]


                        case 3:

                            $i[0] = 0
                            $I[0] = (() => 2)()

                        case 4:

                            object.array[$i[0]] = []

                        case 5:

                            $step = 6

                        case 6:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[1] = $buffer[$start++]

                            $i[1] = 0
                        case 7:

                            $step = 8

                        case 8:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]][$i[1]] = $buffer[$start++]

                            if (++$i[1] != $I[1]) {
                                $step = 7
                                continue
                            }

                        case 9:

                            $i[0]++

                            if ($i[0] != $I[0]) {
                                $step = 4
                                continue
                            }

                            $step = 10


                        case 10:

                            $step = 11

                        case 11:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 12:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
