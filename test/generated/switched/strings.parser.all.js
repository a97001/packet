module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        const object = {
            type: 0,
            value: 0,
            sentry: 0
        }

        object.type = ($buffer[$start++])

        switch (String(($ => $.type)(object))) {
        case "0":

            object.value = ($buffer[$start++])

            break

        case "1":

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

        object.sentry = ($buffer[$start++])

        return object
    }
}
