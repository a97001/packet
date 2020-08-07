module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 0
                            $_ = object.nudge

                        case 1:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 1
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                        case 2:

                            $i[0] = 0
                            $step = 3

                        case 3:

                            $bite = 1
                            $_ = object.array[$i[0]]

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[0] != object.array.length) {
                                $step = 3
                                continue
                            }

                            $step = 5

                        case 5:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                            $step = 6

                        case 6:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                            $step = 7

                        case 7:

                        case 8:

                            $bite = 0
                            $_ = object.sentry

                        case 9:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                            $step = 10

                        case 10:

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
