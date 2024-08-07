const mysql = require('../module/mysql_connector')
module.exports = {
    getCount: async function(email){
        try {
            await mysql.connectAsync()
            var sql = "SELECT COUNT(*) as counted FROM tr_login WHERE email = ?";
            var [result, cache] = await mysql.executeAsync(sql, [email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    insertTr: async function (email) {
        try {
            await mysql.connectAsync()
            var sql = "INSERT INTO tr_login (email,sign_in) VALUES (?, NOW())";
            var [result, cache] = await mysql.executeAsync(sql, [email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    getLatest: async function (email) {
        try {
            await mysql.connectAsync()
            var sql = "SELECT MAX(id_tr_login) as id_tr_login FROM tr_login WHERE email = ?";
            var [result, cache] = await mysql.executeAsync(sql, [email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    getLatestData: async function (email) {
        try {
            await mysql.connectAsync()
            var sql = "SELECT * FROM tr_login WHERE id_tr_login = (SELECT MAX(id_tr_login) as id_tr_login FROM tr_login WHERE email = ?)";
            var [result, cache] = await mysql.executeAsync(sql, [email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    getLoginToday: async function(){
        try {
            await mysql.connectAsync()
            var sql = "SELECT COUNT(*) as counted FROM tr_login WHERE DATE(sign_in) = CURDATE()";
            var [result, cache] = await mysql.executeAsync(sql)
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    getAverageLogin7Days: async function(){
        try {
            await mysql.connectAsync()
            var sql = "SELECT DATE(sign_in) as date, COUNT(DISTINCT email) as active_users FROM tr_login WHERE sign_in >= CURDATE() - INTERVAL 7 DAY GROUP BY DATE(sign_in)";
            var [result, cache] = await mysql.executeAsync(sql)
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    updateSignOut: async function (id) {
        try {
            await mysql.connectAsync()
            var sql = "UPDATE tr_login SET sign_out=NOW() WHERE id_tr_login = ?";
            var [result, cache] = await mysql.executeAsync(sql, [id])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
}