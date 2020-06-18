module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.inc.object = function (object = {}, $step = 0, $i = [], $I = []) {
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

                    $_ = 0
                    $step = 2
                    $bite = 1

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    $I[0] = $_

                    $i[0] = 0
                case 3:

                    object.array[$i[0]] = []

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

                    $I[1] = $_

                    $i[1] = 0
                case 6:


                case 7:

                    $_ = 0
                    $step = 8
                    $bite = 1

                case 8:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.array[$i[0]][$i[1]] = $_

                    if (++$i[1] != $I[1]) {
                        $step = 6
                        continue
                    }
                    if (++$i[0] != $I[0]) {
                        $step = 3
                        continue
                    }

                case 9:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
