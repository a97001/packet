module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            if ((value => value < 251)(object.value)) {
                                $step = 1
                                continue
                            } else if ((value => value >= 251 && value < 2 ** 16)(object.value)) {
                                $step = 3
                                continue
                            } else {
                                $step = 7
                                continue
                            }

                        case 1:

                            $bite = 0
                            $_ = object.value

                        case 2:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 2
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                            $step = 11
                            continue

                        case 3:

                            $step = 4
                            $bite = 0
                            $_ = [ 252 ]

                        case 4:

                            while ($bite != 1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_[$bite++]
                            }


                        case 5:

                            $bite = 1
                            $_ = object.value

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                            $step = 11
                            continue

                        case 7:

                            $step = 8
                            $bite = 0
                            $_ = [ 253 ]

                        case 8:

                            while ($bite != 1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_[$bite++]
                            }


                        case 9:

                            $bite = 2
                            $_ = object.value

                        case 10:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 10
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                        case 11:

                            $bite = 0
                            $_ = object.sentry

                        case 12:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 12
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                            $step = 13

                        case 13:

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
