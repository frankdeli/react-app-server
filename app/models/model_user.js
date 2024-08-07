const mysql = require('../module/mysql_connector')
module.exports = {
    get: async function (id) {
        try {
            await mysql.connectAsync()
            var sql = "SELECT * FROM ms_user WHERE id_ms_user = ?";
            var [result, cache] = await mysql.executeAsync(sql, [id])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    getAll: async function () {
        try {
            await mysql.connectAsync()
            var sql = "SELECT * FROM ms_user";
            var [result, cache] = await mysql.queryAsync(sql)
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    getCount: async function () {
        try {
            await mysql.connectAsync()
            var sql = "SELECT COUNT(*) as counted FROM ms_user";
            var [result, cache] = await mysql.queryAsync(sql)
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    getByEmail: async function (email) {
        try {
            await mysql.connectAsync()
            var sql = "SELECT * FROM ms_user WHERE email = ?";
            var [result, cache] = await mysql.executeAsync(sql, [email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    insertUser: async function (data) {
        try {
            await mysql.connectAsync()
            var sql = "INSERT INTO ms_user (username,email,password,is_verified_email,created_at,updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
            var [result, cache] = await mysql.executeAsync(sql, [data.username, data.email, data.password, data.is_verified_email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    updateUser: async function (data) {
        try {
            await mysql.connectAsync()
            var sql = "UPDATE ms_user SET username=?, updated_at=NOW() WHERE email = ?";
            var [result, cache] = await mysql.executeAsync(sql, [data.username,data.email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    updateVerifiedEmail: async function(email) {
        try {
            await mysql.connectAsync()
            var sql = "UPDATE ms_user SET is_verified_email=1, updated_at=NOW() WHERE email = ?";
            var [result, cache] = await mysql.executeAsync(sql, [email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    },
    resetPassword: async function(data) {
        try {
            await mysql.connectAsync()
            var sql = "UPDATE ms_user SET password=?, updated_at=NOW() WHERE email = ?";
            var [result, cache] = await mysql.executeAsync(sql, [data.password, data.email])
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            await mysql.endPool()
            return [null, error]
        }
    }
}