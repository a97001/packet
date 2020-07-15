module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $_, $i = [], $slice = null

            let object = {
                value: null,
                sentry: 0
            }

            $slice = $buffer.slice($start, $start + 8)
            $start += 8
            object.value = $slice

            object.value = (function (value) {
                return value.readDoubleBE()
            })(object.value)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
