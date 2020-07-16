module.exports = function ({ parsers }) {
    parsers.chk.object = function () {
        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    value: null
                }

                object.value = null

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
