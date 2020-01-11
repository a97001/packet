module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            SERIALIZE: for (;;) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 1
                    $_ = object.array.length

                case 1:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }

                    $i.push(0)

                case 2:

                    $step = 3
                    $bite = 1
                    $_ = object.array[$i[0]]

                case 3:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                    if (++$i[0] != object.array.length) {
                        $step = 2
                        continue SERIALIZE
                    }

                    $i.pop()

                    $step = 4

                case 4:

                    break SERIALIZE

                }
            }

            return { start: $start, serialize: null }
        }
    }
}
