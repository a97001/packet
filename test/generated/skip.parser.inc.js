module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    padded: 0
                }

                $step = 1

            case 1:

                $_ = 6
                $step = 2

            case 2:

                $bite = Math.min($end - $start, $_)
                $_ -= $bite
                $start += $bite

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }

            case 3:

                $_ = 0
                $step = 4
                $bite = 1

            case 4:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                    $bite--
                }

                object.padded = $_


            case 5:

                $_ = 6
                $step = 6

            case 6:

                $bite = Math.min($end - $start, $_)
                $_ -= $bite
                $start += $bite

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }

            case 7:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
