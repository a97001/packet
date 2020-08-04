module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_, $i = [], $I = [], $slice = null

                let object = {
                    nudge: 0,
                    array: null,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $I[0] = (() => 8)()

                $slice = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                $_ = $slice.indexOf(Buffer.from([ 10, 11 ]))
                if (~$_) {
                    $slice = $slice.slice(0, $_)
                }

                object.array = $slice

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
