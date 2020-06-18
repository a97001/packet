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

        if (($ => $.type == 0)(object)) {
            object.value =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])
        } else if (($ => $.type == 1)(object)) {
            object.value =
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])
        } else {
            object.value =
                ($buffer[$start++]) * 0x1000000 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])
        }

        return object
    }
}
