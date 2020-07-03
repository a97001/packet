module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let object = {
                value: 0
            }

            object.value =
                ($buffer[$start++]) * 0x1000000 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            return object
        }
    } ()
}
