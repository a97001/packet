module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                object.value = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

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

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
