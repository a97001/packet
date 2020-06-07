module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    header: {
                        flag: 0,
                        value: 0
                    }
                }

                $step = 1

            case 1:

                $_ = 0
                $step = 2
                $bite = 0

            case 2:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                    $bite--
                }

                object.header.flag = $_ >>> 6 & 0x3

                if (($ => $.header.flag == 0)(object)) {
                    object.header.value = $_ & 0x3f
                } else if (($ => $.header.flag == 1)(object)) {
                    object.header.value = $_ & 0x3
                } else if (($ => $.header.flag == 2)(object)) {
                    object.header.value = {
                        two: 0,
                        four: 0
                    }

                    object.header.value.two = $_ >>> 4 & 0x3

                    object.header.value.four = $_ & 0xf
                }


            case 3:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
