module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0, $sip = []) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    object = {
                        value: 0
                    }

                    $step = 1

                case 1:

                    $step = 2

                case 2:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    $sip[0] = $buffer[$start++]


                case 3:

                    if ((sip => sip < 251)($sip[0], object)) {
                        $step = 4
                        continue
                    } else if ((sip => sip == 0xfc)($sip[0], object)) {
                        $step = 5
                        continue
                    } else {
                        $step = 7
                        continue
                    }

                case 4:

                    object.value = (sip => sip)($sip[0])

                    $step = 9
                    continue

                case 5:

                    $_ = 0
                    $step = 6
                    $bite = 1

                case 6:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $_


                    $step = 9
                    continue

                case 7:

                    $_ = 0
                    $step = 8
                    $bite = 2

                case 8:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $_



                case 9:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
