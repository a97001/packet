module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = [], $I = []) {
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
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 2:

                        $i[0] = 0
                        $I[0] = (() => 8)()

                        $step = 3

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = object.array[$i[0]]

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.array.length) {
                            $step = 3
                            continue
                        }

                        $_ = $i[0] * 1

                        $step = 5

                    case 5:

                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }

                        if ($_++ == $I[0] * 1) {
                            $step = 6
                            continue
                        }

                        $buffer[$start++] = 0x0

                        $step = 6

                        if ($_ != $I[0] * 1) {
                            $step = 5
                            continue
                        }

                    case 6:

                        $step = 7
                        $bite = 0
                        $_ = object.sentry

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 8

                    case 8:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
