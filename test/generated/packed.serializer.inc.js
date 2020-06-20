module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $step = 1
                $bite = 3
                $_ =
                    ((0xdeaf << 16 & 0xffff0000) >>> 0) |
                    (object.header.one << 15 & 0x8000) |
                    (object.header.two << 12 & 0x7000) |
                    (object.header.three & 0xfff)

            case 1:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                    $bite--
                }


            case 2:

                $step = 3
                $bite = 0
                $_ = object.sentry

            case 3:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                    $bite--
                }


                $step = 4

            case 4:

                break

            }

            return { start: $start, serialize: null }
        }
    }
}
