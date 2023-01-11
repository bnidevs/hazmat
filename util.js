const { server_whitelist } = require('./config.json');

const urlRegex =
    /\b(https?|ftp|file):\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_|]/g;

const urlCheck = (u) => {
    const containsUrl = urlRegex.test(u);

    return !containsUrl ? containsUrl : u.matchAll(urlRegex);
};

const isNum = (c) => {
    return !isNaN(c * 1);
};

const upperLowerScan = (s) => {
    for (let i = 0; i < s.length; i++) {
        let arr = [];
        if (i - 1 >= 0 && !isNum(s.charAt(i - 1))) {
            arr.push(s.charAt(i - 1));
        }

        if (i + 1 < s.length && !isNum(s.charAt(i + 1))) {
            arr.push(s.charAt(i + 1));
        }

        if (!isNum(s.charAt(i))) {
            arr.push(s.charAt(i));
        }

        arr = arr.map((c) => c == c.toUpperCase());

        const result = [0, arr.length].includes(arr.filter((b) => b).length);
        if (!result) {
            return !result;
        }
    }

    return false;
};

const numLetterScan = (s) => {
    for (let i = 0; i < s.length; i++) {
        let arr = [];
        if (i - 1 >= 0) {
            arr.push(s.charAt(i - 1));
        } else {
            arr.push(false);
        }

        arr.push(s.charAt(i));

        if (i + 1 < s.length) {
            arr.push(s.charAt(i + 1));
        } else {
            arr.push(false);
        }

        arr = arr.map((c) => isNum(c));

        const result = [false, true, false].every((value, index) => {
            return value === arr[index];
        });

        if (result) {
            return result;
        }
    }

    return false;
};

const urlScanner = (urls) => {
    [...urls].forEach((u) => {
        const urlobj = new URL(u);
        const host = urlobj.hostname.split('.');

        const basehostname = host[host.length - 2];
        // tld is host[host.length - 1];

        if (upperLowerScan(basehostname) || numLetterScan(basehostname)) {
            return true;
        }
    });

    return false;
};

const getServerSnowflake = async (url) => {
    const raw_html = await fetch(url);
    const search_string = 'content="https://cdn.discordapp.com/icons/';

    const snowflake_loc = raw_html.indexOf(search_string) + search_string.length;
    if(snowflake_loc == -1){
        return null;
    }
    return raw_html.substring(snowflake_loc, snowflake_loc + 18);
}

const discordChecker = (urls) => {
    [...urls].forEach((u) => {
        let result = u.includes('discord.gg') && !(getServerSnowflake(u) in server_whitelist);
        if (result) {
            return result;
        }
    });
    return false;
}

module.exports = { urlCheck, urlScanner, discordChecker };
