module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        const object = {
            type: 0,
            value: 0
        }

        object.type = ($buffer[$start++])

        switch (($ => $.type)(object)) {
        case 0:

            object.value = ($buffer[$start++])

            break

        case 1:

            object.value =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            break

        default:

            object.value =
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            break
        }

        return object
    }
}
