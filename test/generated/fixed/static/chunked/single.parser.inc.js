module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $buffers = [], $length = 0

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                nudge: 0,
                                array: null,
                                sentry: 0
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]

                        case 3:

                            $_ = 0

                        case 4: {

                            const $index = $buffer.indexOf(0x0, $start)
                            if (~$index) {
                                if ($_ + $index > 8) {
                                    const $length = 8 - $_
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $_ += $length
                                    $start += $length
                                    $step = 5
                                    continue
                                } else {
                                    $buffers.push($buffer.slice($start, $index))
                                    $_ += ($index - $start) + 1
                                    $start = $index + 1
                                    $step = 5
                                    continue
                                }
                            } else if ($_ + ($end - $start) >= 8) {
                                const $length = 8 - $_
                                $buffers.push($buffer.slice($start, $start + $length))
                                $_ += $length
                                $start += $length
                                $step = 5
                                continue
                            } else {
                                $step = 4
                                $_ += $end - $start
                                $buffers.push($buffer.slice($start))
                                return { start: $end, object: null, parse: $parse }
                            }

                        }


                        case 5:

                            $_ = 8 -  Math.min($buffers.reduce((sum, buffer) => {
                                return sum + buffer.length
                            }, 1), 8)

                            object.array = $buffers
                            $buffers = []

                        case 6: {

                            const length = Math.min($_, $end - $start)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                $step = 6
                                return { start: $start, object: null, parse: $parse }
                            }

                        }

                        case 7:

                        case 8:

                            if ($start == $end) {
                                $step = 8
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
