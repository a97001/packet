module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        const object = {
            value: 0,
            sentry: 0
        }

        object.value =
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])

        object.sentry = ($buffer[$start++])

        return object
    }
}
