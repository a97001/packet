module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $$ = []) {
            let $bite, $stop, $_

            return function serialize ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    ; (({ $_ = 0 }) => require('assert').equal($_, 1))({
                        $_: object.value
                    })

                case 1:

                    $step = 2
                    $bite = 0
                    $_ = object.value

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                case 3:

                    $step = 4
                    $bite = 0
                    $_ = object.sentry

                case 4:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                    $step = 5

                case 5:

                    break

                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
