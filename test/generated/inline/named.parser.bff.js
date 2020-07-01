module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                value: 0,
                sentry: 0
            }

            if ($end - $start < 5) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            object.value =
                ($buffer[$start++]) * 0x1000000 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            object.value = (function ({ $_, $, $path, $i, $direction }) {
                const assert = require('assert')
                if ($direction == 'serialize') {
                    assert.deepEqual({ $_, $, $path, $i, $direction }, {
                        $_: 1,
                        $: { value: 1, sentry: 0xaa },
                        $path: [ 'object', 'value' ],
                        $i: [],
                        $direction: 'serialize'
                    })
                } else {
                    assert.deepEqual({ $_, $, $path, $i, $direction }, {
                        $_: 4294967294,
                        $: { value: 4294967294, sentry: 0 },
                        $path: [ 'object', 'value' ],
                        $i: [],
                        $direction: 'parse'
                    })
                }
                return ~$_
            })({
                $_: object.value,
                $: object,
                $path: [ 'object', 'value' ],
                $i: [],
                $direction: 'parse'
            })

            object.sentry = ($buffer[$start++])

            return { start: $start, object: object, parse: null }
        }
    }
}
