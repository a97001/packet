module.exports = function ({ sizeOf }) {
    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 3

        return $_
    }
}
