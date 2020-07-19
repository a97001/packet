module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite, $length = 0

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

                    case 4:

                        $step = 4

                        if ($i[0] == 16) {
                            $step = 10
                            continue
                        }

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start] != 0xd) {
                            $step = 6
                            continue
                        }
                        $start++

                        $step = 5

                    case 5:

                        $step = 5

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start] != 0xa) {
                            $step = 6
                            $parse(Buffer.from([ 0xd ]), 0, 1)
                            continue
                        }
                        $start++

                        $step = 10
                        continue

                    case 6:


                    case 7:

                        $step = 8

                    case 8:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.array[$i[0]] = $buffer[$start++]


                    case 9:

                        $i[0]++
                        $step = 4
                        continue

                    case 10:

                        $_ = 16 != $i[0]
                            ? (16 - $i[0]) * 1 - 2
                            : 0

                        $step = 11

                    case 11: {

                        const length = Math.min($_, $end - $start)
                        $start += length
                        $_ -= length

                        if ($_ != 0) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        $step = 12

                    }

                    case 12:

                        $step = 13

                    case 13:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 14:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
