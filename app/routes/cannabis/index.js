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
var http = require('http');
const cannabis_1 = require("../../models/cannabis");
const cannabisModel = new cannabis_1.CannabisModel();
const router = (fastify, {}, next) => {
    var db = fastify.dbCannabis;
    fastify.get('/', { preHandler: [fastify.serviceMonitoring] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.send({ api: 'Cannabis API Serivce' });
    }));
    fastify.post('/test-connection', { preHandler: [fastify.serviceMonitoring] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield cannabisModel.testConnection(db);
            reply.send({
                statusCode: HttpStatus.OK,
                rows: result
            });
        }
        catch (error) {
            reply.send({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }));
    fastify.post('/patient', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const cid = req.body.cid;
        if (cid) {
            try {
                const result = yield cannabisModel.searchPatient(db, cid);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('patient', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'not found parameter.'
            });
        }
    }));
    fastify.post('/visit', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        if (hn) {
            try {
                const result = yield cannabisModel.searchVisit(db, hn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('visit', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/patient-info', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        if (hn) {
            try {
                const result = yield cannabisModel.patientInfo(db, hn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('patient-info', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/lab', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        const vn = req.body.vn || '';
        if (hn && vn) {
            try {
                const result = yield cannabisModel.getVisitLab(db, hn, vn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('lab', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/drug', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        const vn = req.body.vn || '';
        if (hn && vn) {
            try {
                const result = yield cannabisModel.getVisitDrug(db, hn, vn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('getVisitDrug', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/appointment', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        const vn = req.body.vn || '';
        if (hn && vn) {
            try {
                const result = yield cannabisModel.getVisitAppointment(db, hn, vn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('getVisitAppointment', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/diag-text', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        const vn = req.body.vn || '';
        if (hn && vn) {
            try {
                const result = yield cannabisModel.getVisitDiagText(db, hn, vn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('diag-text', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/diagnosis', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        const vn = req.body.vn || '';
        if (hn && vn) {
            try {
                const result = yield cannabisModel.getVisitDiagnosis(db, hn, vn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('diagnosis', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/procedure', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        const vn = req.body.vn || '';
        if (hn && vn) {
            try {
                const result = yield cannabisModel.getVisitProcedure(db, hn, vn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('procedure', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    fastify.post('/screening', { preHandler: [fastify.serviceMonitoring, fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn || '';
        const vn = req.body.vn || '';
        if (hn && vn) {
            try {
                const result = yield cannabisModel.getVisitScreening(db, hn, vn);
                reply.send({
                    statusCode: HttpStatus.OK,
                    rows: result
                });
            }
            catch (error) {
                console.log('screening', error.message);
                reply.send({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
        else {
            reply.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'parameter not found.'
            });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=index.js.map