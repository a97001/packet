module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += 1 * object.array.length + 4

            $start += 1

            return $start
        }
    } ()
}