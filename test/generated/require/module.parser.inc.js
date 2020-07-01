module.exports = function ({ parsers }) {
    parsers.inc.object = function () {
        const twiddle = require('../../../test/cycle/twiddle')

        return function (object = {}, $step = 0) {
            let $_, $bite
            return function parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        value: 0,
                        sentry: 0
                    }

                    $step = 1

                case 1:

                    $_ = 0
                    $step = 2
                    $bite = 3

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $_

                    object.value = (value => twiddle(value))(object.value)

                case 3:

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.sentry = $buffer[$start++]


                case 5:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
