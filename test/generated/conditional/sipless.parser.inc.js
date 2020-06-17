module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    object = {
                        type: 0,
                        value: 0
                    }

                    $step = 1

                case 1:

                    $step = 2

                case 2:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.type = $buffer[$start++]



                case 3:

                    if (($ => $.type == 0)(object)) {
                        $step = 4
                        continue
                    } else if (($ => $.type == 1)(object)) {
                        $step = 6
                        continue
                    } else {
                        $step = 8
                        continue
                    }

                case 4:

                    $_ = 0
                    $step = 5
                    $bite = 1

                case 5:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $_


                    $step = 10
                    continue

                case 6:

                    $_ = 0
                    $step = 7
                    $bite = 2

                case 7:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $_


                    $step = 10
                    continue

                case 8:

                    $_ = 0
                    $step = 9
                    $bite = 3

                case 9:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $_



                case 10:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
