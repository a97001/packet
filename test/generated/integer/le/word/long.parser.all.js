module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: 0
            }

            object.value =
                BigInt($buffer[$start++]) +
                (BigInt($buffer[$start++]) << 8n) +
                (BigInt($buffer[$start++]) << 16n) +
                (BigInt($buffer[$start++]) << 24n) +
                (BigInt($buffer[$start++]) << 32n) +
                (BigInt($buffer[$start++]) << 40n) +
                (BigInt($buffer[$start++]) << 48n) +
                (BigInt($buffer[$start++]) << 56n)

            return object
        }
    } ()
}
