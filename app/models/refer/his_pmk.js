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
const maxLimit = 250;
const hcode = process.env.HOSPCODE;
const dbName = process.env.HIS_DB_NAME;
const dbClient = process.env.HIS_DB_CLIENT;
class HisPmkModel {
    getTableName(db) {
        if (dbClient === 'oracledb') {
            return db.raw(`select * from ALL_TABLES where OWNER = '${dbName}'`);
        }
        else {
            return db('information_schema.tables')
                .select('TABLE_NAME')
                .where('TABLE_SCHEMA', '=', dbName);
        }
    }
    getReferOut(db, date, hospCode = hcode) {
        return __awaiter(this, void 0, void 0, function* () {
            let where = `REFER_IN_DATETIME=TO_DATE('${date}', 'YYYY-MM-DD HH24:MI:SS')`;
            const result = yield db('PATIENTS_REFER_HX as referout')
                .join('OPDS', 'referout.OPD_NO', 'OPDS.OPD_NO')
                .join('PATIENTS as patient', function () {
                this.on('OPDS.PAT_RUN_HN', '=', 'patient.RUN_HN')
                    .andOn('OPDS.PAT_YEAR_HN', '=', 'patient.YEAR_HN');
            })
                .select(db.raw(`'${hospCode}' AS "hospcode"`))
                .select(db.raw(`concat(concat(to_char(OPDS.PAT_RUN_HN),'/'),to_char(OPDS.PAT_YEAR_HN)) AS "hn"`))
                .select('referout.OPD_NO as seq', 'referout.OPD_NO as vn', 'referout.REFER_NO as referid', 'referout.HOS_IN_CARD as hosp_destination', 'referout.REFER_IN_DATETIME as refer_date', 'patient.ID_CARD as cid', 'patient.PRENAME as prename', 'patient.NAME as fname', 'patient.SURNAME as lname', 'patient.BIRTHDAY as dob')
                .select(db.raw(`case when SEX='F' then 2 else 1 end as "sex"`))
                .whereRaw(db.raw(where));
            return result;
            const sql = `
                o.an as an,
                refer.pdx as dx
        `;
        });
    }
    getPerson(db, columnName, searchText) {
        columnName = columnName === 'hn' ? 'HN' : columnName;
        columnName = columnName === 'pid' ? 'HN' : columnName;
        columnName = columnName === 'cid' ? 'ID_CARD' : columnName;
        columnName = columnName === 'fname' ? 'NAME' : columnName;
        columnName = columnName === 'lname' ? 'SURNAME' : columnName;
        return db('PATIENTS')
            .select('RUN_HN', 'YEAR_HN')
            .select('HN as hn', 'ID_CARD as cid', 'PRENAME as prename', 'NAME as fname', 'SURNAME as lname', 'BIRTHDAY as dob')
            .select(db.raw(`case when SEX='F' then 2 else 1 end as sex`))
            .select('HOME as address', 'VILLAGE as moo', 'ROAD as road')
            .select(db.raw(`'' as soi`))
            .select('TAMBON as addcode', 'TEL as tel')
            .select(db.raw(`'' as zip`))
            .select(db.raw(`'' as occupation`))
            .whereRaw(db.raw(` ${columnName}='${searchText}' `))
            .limit(maxLimit);
    }
    getService(db, columnName, searchText, hospCode = hcode) {
        let where = {};
        let cdate = '';
        if (columnName === 'date') {
            cdate = `OPD_DATE=TO_DATE('${searchText}', 'YYYY-MM-DD HH24:MI:SS')`;
        }
        else if (columnName === 'hn') {
            const _hn = searchText.split('/');
            where['PAT_RUN_HN'] = _hn[0];
            where['PAT_YEAR_HN'] = _hn[1];
        }
        else if (columnName === 'visitNo') {
            where['OPD_NO'] = searchText;
        }
        return db(`OPDS`)
            .select(db.raw(`'${hospCode}' AS "hospcode"`))
            .select(db.raw(`concat(concat(to_char(OPDS.PAT_RUN_HN),'/'),to_char(OPDS.PAT_YEAR_HN)) AS "hn"`))
            .select('PAT_RUN_HN as RUN_HN', 'PAT_YEAR_HN as YEAR_HN')
            .select('OPD_NO as visitno', 'OPD_DATE as date')
            .select(db.raw(`TO_CHAR(DATE_CREATED, 'HH24:MI:SS') AS time`))
            .select('BP_SYSTOLIC as bp_systolic', 'BP_DIASTOLIC as bp_diastolic', 'BP_SYSTOLIC as bp1', 'BP_DIASTOLIC as bp2', 'PALSE as pr', 'RESPIRATORY_RATE as rr', 'WT_KG as weight', 'HEIGHT_CM as height', 'TEMP_C as tem')
            .where(where)
            .whereRaw(db.raw(cdate))
            .limit(maxLimit);
    }
    getDiagnosisOpd(db, visitno) {
        return db('OPDDIAGS')
            .select('PAT_RUN_HN as RUN_HN', 'PAT_YEAR_HN as YEAR_HN')
            .select(db.raw(`concat(concat(to_char(PAT_RUN_HN),'/'),to_char(PAT_YEAR_HN)) AS hn`))
            .select('OPD_OPD_NO as visitno', 'ICD_CODE as diagcode', 'TYPE as diag_type')
            .where('OPD_OPD_NO', "=", visitno);
    }
    getProcedureOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('procedure_opd')
            .where(columnName, "=", searchNo);
    }
    getChargeOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('charge_opd')
            .where(columnName, "=", searchNo);
    }
    getDrugOpd(db, columnName, searchNo, hospCode) {
        return db('DOC_DRUG_REQUEST_HEADER as drug')
            .select('PAT_RUN_HN as RUN_HN', 'PAT_YEAR_HN as YEAR_HN')
            .select(db.raw(`concat(concat(to_char(PAT_RUN_HN),'/'),to_char(PAT_YEAR_HN)) AS hn`))
            .select('*')
            .where(columnName, "=", searchNo);
    }
    getAdmission(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('admission')
            .where(columnName, "=", searchNo);
    }
    getDiagnosisIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('diagnosis_ipd')
            .where(columnName, "=", searchNo);
    }
    getProcedureIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('procedure_ipd')
            .where(columnName, "=", searchNo);
    }
    getChargeIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('charge_ipd')
            .where(columnName, "=", searchNo);
    }
    getDrugIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('drug_ipd')
            .where(columnName, "=", searchNo);
    }
    getAccident(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('accident')
            .where(columnName, "=", searchNo);
    }
    getAppointment(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('appointment')
            .where(columnName, "=", searchNo);
    }
    getData(knex, tableName, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from(tableName)
            .where(columnName, "=", searchNo)
            .limit(5000);
    }
}
exports.HisPmkModel = HisPmkModel;
//# sourceMappingURL=his_pmk.js.map