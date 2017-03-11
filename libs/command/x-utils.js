let utils = {
    num(val) {
        return val > 9 ? val : '0' + val;
    },
    formatDateNow(now = new Date()) {
        return `${now.getFullYear()}-${this.num(now.getMonth() + 1)}-${this.num(now.getDate())} ${this.num(now.getHours())}:${this.num(now.getMinutes())}:${this.num(now.getSeconds())}`;
    }
}
module.exports = utils;