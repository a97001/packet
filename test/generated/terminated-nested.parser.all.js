module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        let $i = []

        const object = {
            array: []
        }

        $i[0] = 0
        for (;;) {
            if (
                $buffer[$start] == 0x0 &&
                $buffer[$start + 1] == 0x0
            ) {
                $start += 2
                break
            }

            object.array[$i[0]] = []

            $i[1] = 0
            for (;;) {
                if (
                    $buffer[$start] == 0x0 &&
                    $buffer[$start + 1] == 0x0
                ) {
                    $start += 2
                    break
                }

                object.array[$i[0]][$i[1]] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[1]++
            }
            $i[0]++
        }

        return object
    }
}
