module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {

                return { start: $start, serialize: null }
            }
        }
    } ()
}
