module.exports = function ({ parsers }) {
    parsers.chk.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $_, $i = [], $I = [], $slice = null

                let object = {
                    type: 0,
                    value: null,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                object.type = ($buffer[$start++])

                switch (String(($ => $.type)(object))) {
                case "0":
                    object.value = {
                        value: 0
                    }

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 4, $i, $I)($buffer, $start, $end)
                    }

                    object.value.value = ($buffer[$start++])

                    break

                case "1":
                    object.value = []

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 6, $i, $I)($buffer, $start, $end)
                    }

                    $I[0] = ($buffer[$start++])
                    $i[0] = 0

                    if ($end - $start < 1 * $I[0]) {
                        return parsers.inc.object(object, 8, $i, $I)($buffer, $start, $end)
                    }

                    for (; $i[0] < $I[0]; $i[0]++) {
                        object.value[$i[0]] = ($buffer[$start++])
                    }

                    break

                case "2":
                    object.value = []

                    $i[0] = 0
                    for (;;) {
                        if ($end - $start < 1) {
                            return parsers.inc.object(object, 12, $i, $I)($buffer, $start, $end)
                        }

                        if (
                            $buffer[$start] == 0x0
                        ) {
                            $start += 1
                            break
                        }

                        if ($end - $start < 1) {
                            return parsers.inc.object(object, 14, $i, $I)($buffer, $start, $end)
                        }

                        object.value[$i[0]] = ($buffer[$start++])

                        $i[0]++
                    }

                    break

                case "3":
                    object.value = []

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 18, $i, $I)($buffer, $start, $end)
                    }

                    $I[0] = ($buffer[$start++])

                    if ($end - $start < 1 * $I[0]) {
                        return parsers.inc.object(object, 20, $i, $I)($buffer, $start, $end)
                    }

                    object.value = $buffer.slice($start, $start + $I[0])
                    $start += $I[0]

                    break

                case "4":
                    object.value = []

                    if ($end - $start < 3) {
                        return parsers.inc.object(object, 21, $i, $I)($buffer, $start, $end)
                    }

                    $i[0] = 0
                    for (;;) {
                        object.value[$i[0]] = ($buffer[$start++])
                        $i[0]++

                        if ($i[0] == 3) {
                            break
                        }
                    }


                    break

                default:
                    if ($end - $start < 3) {
                        return parsers.inc.object(object, 26, $i, $I)($buffer, $start, $end)
                    }

                    $slice = $buffer.slice($start, $start + 3)
                    $start += 3
                    object.value = $slice

                    break
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 28, $i, $I)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
