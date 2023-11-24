"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CRYPTER {
    constructor() {
        /**
         * #### Encrypt strings, objects, arrays, etc.
         * Example:
         * ```
         * const crypto = new CRYPTER;
         * const encrypt = crypto.encrypt('hello'); //bUpmUlcrUERTUDUlU1A1JTQ4NDVXc0Vz
         * ```
         */
        this.encrypt = (string) => {
            const letters = {
                "A": 'LS&W', "B": 'MD&W', "C": '7dW+', "D": '!&&s', "E": 'k{^D', "F": '@esa',
                "G": 'Mc{s', "H": 'N@dO', "I": '&FS@', "J": 'Vx+W', "K": '!osW', "L": 'GP5%',
                "M": 'mjHs', "N": '7s#5', "O": '4a45', "P": 'TbY$', "Q": 'X<$4', "R": '@V7z',
                "S": 'm^lb', "T": 'p$8o', "U": 'LxQd', "V": 'ksWa', "W": '$&PS', "X": 'Ps!T',
                "Y": '4#@A', "Z": 'L%Q@',
                'a': "QpsT", 'b': "LiME", 'c': "aois", 'd': "MEaP", 'e': "W+PD", 'f': "MjFs",
                'g': "WbHs", 'h': "mJfR", 'i': "lRNs", 'j': "ksUi", 'k': "4@89", 'l': "SP5%",
                'm': "mjHd", 'n': "7sW5", 'o': "4845", 'p': "mbYs", 'q': "XzS4", 'r': "Av7z",
                's': "msla", 't': "psxo", 'u': 'PSxo', 'v': 'PsXo', 'w': 'WsEs', 'x': 'bNas',
                'y': '4#sa', 'z': 'LsQn',
                '1': 'kosp', '2': 'cixv', '3': 'mwfe', '4': 'vkpo', '5': 'vocp', '6': 'mfwl',
                '7': 'vcos', '8': 'sddk', '9': 'apsc', '0': 'osdv',
                '-': 'LxSo', '/': '@3Sa', '*': '4568', '+': '1234', '$': '85Sb', '?': '6lk8',
                '<': '7fdg', '>': '4bag', '.': '89di', ',': '06ga', '!': '9f4g', '"': 's65d',
                "'": 'adf5', '`': 'afhp', '№': 'erty', ':': 'xvws', '=': 'f9qw', '_': 'v5qz',
                '|': 'f8qw', ' ': 'srix', '{': 'vjda', '}': 'vspx', '[': 'cdax', ']': 'vfio',
                '(': 'vadv', ')': 'vcli', ';': 'csiq', '~': 'cx;p', '&': 'x!@d', '%': '&!=d',
                '#': 's*/$', '@': '@#$%', '<br/>': '*s/$', '^': '#!s%'
            };
            /\n/.test(string) ? string = string.replace(/\n/g, '<br/> ') : undefined;
            let word = '';
            for (let i = 0; i < string.length; i++) {
                word += letters[string[i]];
            }
            word = Buffer.from(word).toString("base64url");
            return word;
        };
        /**
         * #### Decrypt encrypted data
         *
         * Example:
         *  ```
         * const crypto = new CRYPTER;
         * crypto.decrypt('bUpmUlcrUERTUDUlU1A1JTQ4NDVXc0Vz'); //hello
         * ```
         */
        this.decrypt = (string) => {
            const letters = {
                "LS&W": 'A', "MD&W": 'B', "7dW+": 'C', "!&&s": 'D', "k{^D": 'E', "@esa": 'F',
                "Mc{s": 'G', "N@dO": 'H', "&FS@": 'I', "Vx+W": 'J', "!osW": 'K', "GP5%": 'L',
                "mjHs": 'M', "7s#5": 'N', "4a45": 'O', "TbY$": 'P', "X<$4": 'Q', "@V7z": 'R',
                "m^lb": 'S', "p$8o": 'T', 'LxQd': 'U', 'ksWa': 'V', '$&PS': 'W', 'Ps!T': 'X',
                '4#@A': 'Y', 'L%Q@': 'Z',
                "QpsT": 'a', "LiME": 'b', "aois": 'c', "MEaP": 'd', "W+PD": 'e', "MjFs": 'f',
                "WbHs": 'g', "mJfR": 'h', "lRNs": 'i', "ksUi": 'j', "4@89": 'k', "SP5%": 'l',
                "mjHd": 'm', "7sW5": 'n', "4845": 'o', "mbYs": 'p', "XzS4": 'q', "Av7z": 'r',
                "msla": 's', "psxo": 't', 'PSxo': 'u', 'PsXo': 'v', 'WsEs': 'w', 'bNas': 'x',
                '4#sa': 'y', 'LsQn': 'z',
                'kosp': '1', 'cixv': '2', 'mwfe': '3', 'vkpo': '4', 'vocp': '5', 'mfwl': '6',
                'vcos': '7', 'sddk': '8', 'apsc': '9', 'osdv': '0',
                'LxSo': '-', '@3Sa': '/', '4568': '*', '1234': '+', '85Sb': '$', '6lk8': '?',
                '7fdg': '<', '4bag': '>', '89di': '.', '06ga': ',', '9f4g': '!', 's65d': '"',
                'adf5': "'", 'afhp': '`', 'erty': '№', 'xvws': ':', 'f9qw': '=', 'v5qz': '_',
                'f8qw': '|', 'srix': ' ', 'vjda': '{', 'vspx': '}', 'cdax': '[', 'vfio': ']',
                'vadv': '(', 'vcli': ')', 'csiq': ';', 'cx;p': '~', 'x!@d': '&', '&!=d': '%',
                's*/$': '#', '@#$%': '@', '*s/$': '<br/>', '#!s%': '^'
            };
            string = Buffer.from(string, 'base64url').toString('ascii');
            let word = '';
            for (let i = 0; i - 1 < string.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    const s = `${string[i - 4]}${string[i - 3]}${string[i - 2]}${string[i - 1]}`;
                    word += letters[s];
                }
            }
            ;
            /<br>/.test(word) ? word = word.replace(/<br\/>/g, '\n') : null;
            return word;
        };
        /**
         * #### Clear data from HTML
         *
         * Example:
         * ```
         * const user = {
         *     name: '<h1>Alex</h1>',
         *     gender: '<script>console.log(hello)</script>'
         * }
         * const crypto = new CRYPTER;
         * crypto.clearHTML(user);
         * user = {
         *     name: 'Alex',
         *     gender:  'scriptconsole.log(hello)script'
         * }
         * ```
         */
        this.clearHTML = (param) => {
            if (typeof param === "object" && Object.keys(param).length > 0) {
                for (let [key, value] of Object.entries(param)) {
                    param[key] = value.toString().trim().replace(/[^aA-zZаА-яЯ0-9-.,!@_+() ]/g, '');
                }
                return param;
            }
            else if (typeof param === "string") {
                return param.toString().trim().replace(/[^aA-zZаА-яЯ0-9-.,!@_+() ]/g, '');
            }
        };
    }
}
exports.default = CRYPTER;
