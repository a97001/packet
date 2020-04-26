module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $byte
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    header: {
                        one: 0,
                        two: 0,
                        three: 0
                    }
                }
                $step = 1

            case 1:

                $_ = 0
                $step = 2
                $byte = 3

            case 2:

                while ($byte != -1) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += $buffer[$start++] << $byte * 8 >>> 0
                    $byte--
                }

                object.header.one = $_ >>> 15 & 0x1
                object.header.two = $_ >>> 12 & 0x7
                object.header.two =
                    object.header.two & 0x4 ? (0x7 - object.header.two  + 1) * -1 : object.header.two
                object.header.three = $_ & 0xfff


            case 3:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
