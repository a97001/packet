module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.inc.object = function (object = {}, $step = 0, $i = []) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    object = {
                        array: []
                    }

                    $step = 1

                case 1:

                    $i[0] = 0

                case 2:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0x0) {
                        $step = 4
                        continue
                    }
                    $start++

                    $step = 3

                case 3:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0x0) {
                        $step = 4
                        parse([ 0x0 ], 0, 1)
                        continue
                    }
                    $start++

                    $step = 8
                    continue

                case 4:


                case 5:

                    $_ = 0
                    $step = 6
                    $bite = 1

                case 6:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.array[$i[0]] = $_


                case 7:

                    $i[0]++
                    $step = 2
                    continue

                case 8:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
