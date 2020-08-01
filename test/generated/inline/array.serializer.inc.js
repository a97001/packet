module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = [], $$ = []) {
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

                        $$[0] = (function ($_) {
                            return $_.slice().reverse()
                        })(object.value)

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = $$[0].length

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                        $i[0] = 0

                    case 5:

                        $step = 6
                        $bite = 0
                        $_ = $$[0][$i[0]]

                    case 6:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                        if (++$i[0] != $$[0].length) {
                            $step = 5
                            continue
                        }

                    case 7:

                        $step = 8
                        $bite = 0
                        $_ = object.sentry

                    case 8:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                        $step = 9

                    case 9:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
