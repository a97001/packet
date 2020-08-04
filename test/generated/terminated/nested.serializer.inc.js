module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $step = 1
                            $bite = 0
                            $_ = object.nudge

                        case 1:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                        case 2:

                            $i[0] = 0
                            $step = 3

                        case 3:

                            $i[1] = 0
                            $step = 4

                        case 4:

                            $step = 5
                            $bite = 1
                            $_ = object.array[$i[0]][$i[1]]

                        case 5:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[1] != object.array[$i[0]].length) {
                                $step = 4
                                continue
                            }

                            $step = 6

                        case 6:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                            $step = 7

                        case 7:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                            $step = 8

                        case 8:
                            if (++$i[0] != object.array.length) {
                                $step = 3
                                continue
                            }

                            $step = 9

                        case 9:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                            $step = 10

                        case 10:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                            $step = 11

                        case 11:

                        case 12:

                            $step = 13
                            $bite = 0
                            $_ = object.sentry

                        case 13:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                            $step = 14

                        case 14:

                            break

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
