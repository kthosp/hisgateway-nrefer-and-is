"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus = require("http-status-codes");
const users_1 = require("../../models/isonline/users");
const userModel = new users_1.IsUserModel;
const router = (fastify, {}, next) => {
    var db = fastify.dbISOnline;
    fastify.post('/', { preHandler: [fastify.serviceMonitoring] }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        verifyToken(req, res);
        let id = req.body.idSeach;
        userModel.list(db, id)
            .then((results) => {
            if (id > 0) {
                console.log("is_user id: " + id);
                res.send({ ok: true, rows: results[0] });
            }
            else {
                console.log("is_user. " + results.length + ' record<s> founded.');
                res.send({ ok: true, rows: results });
            }
        })
            .catch(error => {
            res.send({ ok: false, error: error });
        });
    }));
    fastify.post('/getbyid', { preHandler: [fastify.serviceMonitoring] }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        verifyToken(req, res);
        let id = req.body.idSeach;
        userModel.getByID(db, id)
            .then((results) => {
            console.log("user id: " + id + ', ' + results.length + ' record<s> founded.');
            res.send({ ok: true, rows: results[0] });
        })
            .catch(error => {
            res.send({ ok: false, error: error });
        });
    }));
    fastify.post('/getbyusername', { preHandler: [fastify.serviceMonitoring] }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        verifyToken(req, res);
        let userName = req.body.userName;
        userModel.getByUserName(db, userName)
            .then((results) => {
            res.send({ ok: true, rows: results[0] });
        })
            .catch(error => {
            res.send({ ok: false, error: error });
        });
    }));
    fastify.post('/selectData', { preHandler: [fastify.serviceMonitoring] }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        verifyToken(req, res);
        let tableName = req.body.tableName;
        let selectText = req.body.selectText;
        let whereText = req.body.whereText;
        let groupBy = req.body.groupBy;
        let orderText = req.body.orderText;
        userModel.selectSql(db, tableName, selectText, whereText, groupBy, orderText)
            .then((results) => {
            console.log("\nget: " + tableName + ' = ' + results[0].length + ' record<s> founded.');
            res.send({ ok: true, rows: results[0] });
        })
            .catch(error => {
            res.send({ ok: false, error: error });
        });
    }));
    fastify.post('/save', { preHandler: [fastify.serviceMonitoring] }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        verifyToken(req, res);
        let id = req.body.id;
        let data = req.body.data;
        userModel.saveUser(db, id, data)
            .then((results) => {
            console.log("\save: user id: " + id);
            res.send({ ok: true, rows: results[0] });
        })
            .catch(error => {
            res.send({ ok: false, error: error });
        });
    }));
    fastify.post('/remove', { preHandler: [fastify.serviceMonitoring] }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        verifyToken(req, res);
        let id = req.body.id;
        userModel.remove(db, id)
            .then((results) => {
            console.log("\delete: user id: " + id);
            res.send({ ok: true, id: id });
        })
            .catch(error => {
            res.send({ ok: false, error: error });
        });
    }));
    function verifyToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = null;
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                token = req.headers.authorization.split(' ')[1];
            }
            else if (req.query && req.query.token) {
                token = req.query.token;
            }
            else if (req.body && req.body.token) {
                token = req.body.token;
            }
            try {
                yield fastify.jwt.verify(token);
                return true;
            }
            catch (error) {
                console.log('authen fail!', error.message);
                res.status(HttpStatus.UNAUTHORIZED).send({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: error.message
                });
            }
        });
    }
    next();
};
module.exports = router;
//# sourceMappingURL=user.js.map