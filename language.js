var definition = {
    frame: {
        header: [ 16, {
            fin: 1, rsv1: 1, rsv2: 1, rsv3: 1, opcode: 4,
            mask: 1, length: 7
        } ],
        length: [ function (object) {
            switch (object.header.length) {
                case 127:
                    return 0
                case 126:
                    return 1
                default:
                    object.length = object.header.length
            }
        }, 16, 32 ],
        mask: [ function (object) {
            return object.mask ? 1 : 0
        }, 0, 16 ]
    },
    mysql: {
        value: [ 8, function (value) {
            if (value < 0xfb) {
                return 0
            } else if (value & 0xfc) {
                return 1
            }
        }, 'b8', [ 'x8', 'b16' ] ]
    }
}

var packets = {
    frame: function (object, parsing) {
        if (!parsing) {
            header.mask = object.mask == null ? 0 : 1
        }
        _(object.header, {
            fin: 1, rsv1: 1, rsv2: 2, rsv3: 3, opcode: 4,
            mask: 1, length: 7
        })
        if (header.length == 127) {
            _(header.length, 16)
        } else if (header.length == 126) {
            _(header.length, 32)
        } else if (parsing) {
            object.length = header.length
        }
        if (header.mask) {
            _(object.mask, 16)
        }
    },
    mysql: function (object) {
        if (parsing) {
            _(object.value, 8)
            if (object.value & 0x0fc) {
                _(object.value, 16)
            } else if (object.value & 0xfd) {
                _(object.value, 24)
            } else if (object.value & 0xfe) {
                _(object.value, 64)
            }
        } else {
            if (object.value < 251) {
                _(object.value, 8)
            } else if (object.value > 251 && object.value < 0xffff) {
                _(0xfc)
                _(object.value, 16)
            } else if (object.value >= 0xffff && object.value < 0xffffff) {
                _(0xfd)
                _(object.value, 24)
            } else {
                _(0xfe)
                _(object.value, 64)
            }
        }
    },
    nested: function (object) {
        _(object.numbers, 16, [32])
        _(object.structures, 16, [function (struct) {
            _(struct.count, packets.mysql)
            _(struct.string, [8], [0])
        }])
    }
}

var packets = {
    frame: function (object) {
        if (serializing) {
            header.mask = object.mask == null ? 0 : 1
        }
        header = packed(object.header, 16, {
            fin: 1, rsv1: 1, rsv2: 2, rsv3: 3, opcode: 4,
            mask: 1, length: 7
        })
        switch (header.length) {
        case 127:
            unsigned(header.length, 16)
        case 126:
            unsigned(header.length, 32)
        default:
            if (parsing) {
                object.length = header.length
            }
        }
        if (header.mask) {
            unsigned(object.mask, 16)
        }
    },
    mysql: function (object) {
        object.value = get(8)
        if (object.value & 0xfc) {
            object.value = get(16)
        }
    },
    nested: function (object) {
    }
}
