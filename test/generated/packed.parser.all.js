module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        let $_

        const object = {
            header: {
                one: 0,
                two: 0,
                three: 0
            }
        }

        $_ =
            $buffer[$start++] * 0x1000000 +
            $buffer[$start++] * 0x10000 +
            $buffer[$start++] * 0x100 +
            $buffer[$start++]

        object.header.one = $_ >>> 15 & 0x1
        object.header.two = $_ >>> 12 & 0x7
        object.header.three = $_ & 0xfff

        return object
    }
}
