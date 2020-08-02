module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                nudge: 0,
                array: [],
                sentry: 0
            }

            object.nudge = (
                $buffer[$start++]
            ) >>> 0

            $I[0] = (
                $buffer[$start++]
            ) >>> 0

            object.array = $buffer.slice($start, $start + $I[0])
            $start += $I[0]

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
