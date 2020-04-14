module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0, $i = [], $I = [], $sip = []) {
        let $_, $byte
        return function parse ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    object = {

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

                    if ((sip => sip < 251)($sip[0], object.value, object)) {
                        $step = 4
                        continue
                    } else if ((sip => sip == 0xfc)($sip[0], object.value, object)) {
                        $step = 5
                        continue
                    }

                case 4:

                    object.value = (sip => sip)($sip[0])

                    $step = 7
                    continue

                case 5:

                    $_ = 0
                    $step = 6
                    $byte = 1

                case 6:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $byte * 8 >>> 0
                        $byte--
                    }

                    object.value = $_



                case 7:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
