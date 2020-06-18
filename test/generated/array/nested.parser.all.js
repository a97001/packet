module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        let $i = [], $I = []

        const object = {
            array: []
        }

        $i[0] = 0
        $I[0] =
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])

        for (; $i[0] < $I[0]; $i[0]++) {
            object.array[$i[0]] = []

            $i[1] = 0
            $I[1] =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            for (; $i[1] < $I[1]; $i[1]++) {

                object.array[$i[0]][$i[1]] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            }
        }

        return object
    }
}
