module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_, $i = [], $slice = null

            let object = {
                value: null,
                sentry: 0
            }

            $slice = $buffer.slice($start, $start + 4)
            $start += 4
            object.value = $slice

            object.value = (function (value) {
                return value.readFloatLE()
            })(object.value)

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
