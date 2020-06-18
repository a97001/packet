module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $i[0] = (value => value)(object.value)

            case 1:

                $step = 2
                $bite = 1
                $_ = $i[0]

            case 2:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                    $bite--
                }


                $step = 3

            case 3:

                break

            }

            return { start: $start, serialize: null }
        }
    }
}
