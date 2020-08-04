module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                object.value = $buffer[$start++]

                ; (({ value = 0 }) => require('assert').equal(value, 1))({
                    value: object.value
                })

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
