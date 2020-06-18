module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        let $_

        const object = {
            value: 0
        }

        $_ = ($buffer[$start++])

        object.value = $lookup.object.value[$_]

        return object
    }
}
