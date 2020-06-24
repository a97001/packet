module.exports = function ({ serializers }) {
    serializers.inc.object = function (object, $step = 0) {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $step = 1
                $bite = 0
                $_ = $lookup.object.value.indexOf(object.value)

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
