import * as Knex from 'knex';
import * as moment from 'moment';
const maxLimit = 250;
const hcode = process.env.HOSPCODE;
const dbName = process.env.HIS_DB_NAME;
const dbClient = process.env.HIS_DB_CLIENT;

export class HisEzhospModel {
    check() {
        return true;
    }

    getTableName(db: Knex, dbname = dbName) {
        const whereDB = dbClient === 'mssql' ? 'TABLE_CATALOG' : 'TABLE_SCHEMA';
        return db('information_schema.tables')
            .where(whereDB, dbname);
    }

    async getPerson1(db: Knex, columnName, searchText) {
        // columnName => cid, hn
        const sql = `
            select xxx from xxx
            where ${columnName}="${searchText}"
            order by mmm `;
        const result = await db.raw(sql);
        return result[0];
    }

    // select รายชื่อเพื่อแสดงทะเบียน
    getReferOut(db: Knex, date, hospCode = hcode) {
        return db('hospdata.refer_out as refer')
            .leftJoin('hospdata.patient as pt', 'refer.hn', 'pt.hn')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select(db.raw('concat(refer_date, " " , refer_time) as refer_date'))
            .select('refer_no as referid',
                'refer.refer_hcode as hosp_destination',
                'refer.hn', 'pt.no_card as cid', 'refer.vn as seq', 'refer.an',
                'pt.title as prename', 'pt.name as fname', 'pt.surname as lname',
                'pt.birth as dob', 'pt.sex', 'refer.icd10 as dx'
            )
            .where('refer.refer_date', date)
            .where('refer.hcode', hospCode)
            .orderBy('refer.refer_date')
            .limit(maxLimit);
    }

    getPerson(db: Knex, columnName, searchText, hospCode = hcode) {
        //columnName = cid, hn
        columnName = columnName === 'cid' ? 'no_card' : columnName;
        return db('hospdata.view_patient')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select(db.raw('4 as typearea'))
            .select('no_card as cid', 'hn as pid', 'title as prename',
                'name', 'surname as lname', 'hn',
                'birth', 'sex', 'marry_std as mstatus', 'blood as abogroup',
                'occ_std as occupation_new', 'race_std as race',
                'nation_std as nation', 'religion_std as religion',
                'edu_std as education', 'tel as telephone',
                'lastupdate as d_update')
            .where(columnName, "=", searchText)
            .limit(maxLimit);
    }

    getAddress(db, columnName, searchNo, hospCode = hcode) {
        columnName = columnName === 'cid' ? 'no_card' : columnName;
        return db('view_address')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')    // ตาม 43 แฟ้ม
            .where(columnName, "=", searchNo)
            .limit(maxLimit);
    }

    getService(db, columnName, searchText, hospCode = hcode) {
        //columnName => visitNo, hn
        columnName = columnName === 'visitNo' ? 'vn' : columnName;
        return db('view_opd_visit as visit')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('hn as pid', 'hn', 'vn as seq', 'date as date_serv',
                'hospmain as main', 'hospsub as hsub',
                'refer as referinhosp')
            .select(db.raw(' case when time="" or time="08:00" then time_opd else time end as time_serv '))
            .select(db.raw('"1" as servplace'))
            .select('t as btemp', 'bp as sbp', 'bp1 as dbp',
                'puls as pr', 'rr',
                'no_card as cid', 'pttype_std as instype', 'no_ptt as insid')
            .select(db.raw('concat(date, " " , time) as d_update'))
            .where(columnName, searchText)
            .orderBy('date', 'desc')
            .limit(maxLimit);
    }

    getDiagnosisOpd(db, visitno, hospCode = hcode) {
        return db('view_opd_dx as dx')
            .leftJoin('patient', 'dx.hn', 'patient.hn')
            .select(db.raw('"' + hospCode + '" as hospcode'))
            .select('dx.hn as pid', 'dx.vn as seq',
                'dx.type as diagtype', 'dx.diag as diagcode', 'dx.desc as diagname',
                'dx.clinic_std as clinic', 'dx.dr_dx as provider',
                'patient.no_card as cid')
            .select(db.raw('concat(dx.date," ",dx.time_in) as date_serv'))
            .select(db.raw('concat(dx.date," ",dx.time_in) as d_update'))
            .select(db.raw(' "IT" as codeset'))
            .where('vn', visitno)
            .limit(maxLimit);
    }

    getProcedureOpd(db, visitno, hospCode = hcode) {
        return db('view_opd_op')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('vn as visitno', 'date', 'hn', 'op as op_code', 'op as procedcode',
                'desc as procedname', 'icd_9 as icdcm', 'dr as provider',
                'clinic_std as clinic', 'price as serviceprice')
            .select(db.raw('concat(date," ",time_in) as date_serv'))
            .select(db.raw('concat(date," ",time_in) as d_update'))
            .where('vn', "=", visitno)
            .limit(maxLimit);
    }

    getChargeOpd(db, visitNo, hospCode = hcode) {
        return db('view_opd_charge_item')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('vn', visitNo)
            .limit(maxLimit);
    }

    getLabRequest(db, columnName, searchNo, hospCode = hcode) {
        columnName = columnName === 'visitNo' ? 'vn' : columnName;
        return db('view_lab_request_item as lab')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('vn as visitno', 'lab.hn as hn', 'lab.an as an',
                'lab.lab_no as request_id',
                'lab.lab_code as lab_code',
                'lab.lab_name as lab_name',
                'lab.loinc as loinc',
                'lab.icdcm as icdcm',
                'lab.standard as cgd',
                'lab.cost as cost',
                'lab.lab_price as price',
                'lab.date as request_date')
            .where(columnName, "=", searchNo)
            .limit(maxLimit);
    }

    getLabResult(db, columnName, searchNo, referID='', hospCode = hcode) {
        columnName = columnName === 'visitNo' ? 'vn' : columnName;
        return db('hospdata.view_lab_result as result')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select(db.raw('"' + hcode+referID +'" as REFERID'))
            .select(db.raw('"' + referID +'" as REFERID_PROVINCE'))
            .select(db.raw('"LAB" as TYPEINVEST'))
            .select(db.raw('CONCAT(result.date," ",result.time) as DATETIME_INVEST'))
            .select('result.hn as PID', 'result.vn as SEQ', 'result.pid as CID'
                , 'an as AN', 'result.type_result as LH'
                , 'result.lab_code as LOCALCODE', 'result.icdcm as INVESTCODE'
                , 'result.lab_name as INVESTNAME'
                , 'result.result as INVESTVALUE', 'result.unit as UNIT'
                , 'result.result_obj as INVESTRESULT'
                , 'result.minresult as NORMAL_MIN', 'result.maxresult as NORMAL_MAX'
                , 'result.date_result as DATETIME_REPORT')
            .select(db.raw('CONCAT(result.date," ",result.time) as D_UPDATE'))
            .where(columnName, "=", searchNo)
            .limit(maxLimit);

            // `LOINC` varchar(20) DEFAULT NULL,
        }

    async getDrugOpd(db, visitNo, hospCode = hcode) {
        const sql = `
            SELECT '${hospCode}' as hospcode, drug.hn as pid, drug.vn as seq
                , concat(visit.date,' ',visit.time) as date_serv
                , visit.clinic, std.stdcode as didstd, drug.drugname as dname
                , drug.no as amount, drug.unit, drug.price as drugprice
                , concat('ว',visit.dr) as provider
                , now() as d_update, patient.no_card as cid
                , concat(drug.methodname, ' ' , drug.no_use, ' ', drug.unit_use, ' ',drug.freqname, ' ', timesname) as drug_usage
                , drug.caution
                FROM view_pharmacy_opd_drug_item as drug
                    LEFT JOIN opd_visit as visit on drug.vn=visit.vn
                    LEFT JOIN patient on drug.hn=patient.hn
                    LEFT JOIN pharmacy_inventory_stdcode as std on drug.drugcode=std.drugcode and 
                    std.code_group='OPD' and std.type='CODE24' and (isnull(std.expire) or std.expire='0000-00-00')
                WHERE drug.vn='${visitNo}'
                limit 1000`;
        const result = await db.raw(sql);
        return result[0];
    }

    getAdmission(db, columnName, searchNo, hospCode = hcode) {
        columnName = columnName === 'visitNo' ? 'ipd.vn' : columnName;
        return db('view_ipd_ipd as ipd')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('ipd.hn as pid', 'ipd.vn as seq',
                'ipd.an')
            .select(db.raw('concat(ipd.admite, " " , ipd.time) as datetime_admit'))
            .select('ipd.ward_std as wardadmit', 'ipd.pttype_std1 as instype')
            .select(db.raw('case when ipd.refer="" then 1 else 3 end as typein '))
            .select('ipd.refer as referinhosp')
            .select(db.raw('1 as causein'))
            .select('ipd.weight as admitweight', 'ipd.height as admitheight')
            .select(db.raw('concat(ipd.disc, " " , ipd.timedisc) as datetime_disch'))
            .select('ipd.ward_std as warddisch', 'ipd.dischstatus', 'ipd.dischtype',
                'ipd.price', 'ipd.paid as payprice')
            .select(db.raw('0 as actualpay'))
            .select('ipd.dr_disc as provider')
            .select(db.raw('concat(ipd.disc, " " , ipd.timedisc) as d_update'))
            .select('ipd.drg', 'ipd.rw', 'ipd.adjrw', 'ipd.drg_error as error',
                'ipd.drg_warning as warning', 'ipd.los as actlos',
                'ipd.grouper_version', 'ipd.no_card as cid')
            .where(columnName, "=", searchNo)
            .limit(maxLimit);
    }

    getDiagnosisIpd(db, columnName, searchNo, hospCode = hcode) {
        columnName = columnName === 'visitNo' ? 'dx.vn' : columnName;
        return db('view_ipd_dx as dx')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('hn as pid', 'an')
            .select(db.raw('concat(admite, " " , time) as datetime_admit'))
            .select('clinic_std as warddiag', 'dx as diagcode', 'type as diagtype',
                'dr as provider', 'dx.desc as diagname',
                'cid', 'lastupdate as d_update')
            .where(columnName, "=", searchNo)
            .orderBy('an')
            .orderBy('type')
            .limit(maxLimit);
    }

    getProcedureIpd(db, an, hospCode = hcode) {
        return db('view_ipd_op as op')
            .select(db.raw('"' + hcode + '" as HOSPCODE'))
            .select('hn as PID', 'an as AN', 'vn as SEQ')
            .select(db.raw('concat(admite, " " , timeadmit) as DATETIME_ADMIT'))
            .select('clinic_std as WARDSTAY', 'op as PROCEDCODE',
                'desc as PROCEDNAME', 'dr as PROVIDER',
                'price as SERVICEPRICE',
                'cid as CID', 'lastupdate as D_UPDATE')
            .where('an', an)
            .limit(maxLimit);
    }
    // TIMESTART: row.TIMESTART || row.timestart || '',
    // TIMEFINISH: row.TIMEFINISH || row.timefinish || '',

    getChargeIpd(db, an, hospCode = hcode) {
        return db('charge_ipd')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('an', "=", an)
            .limit(maxLimit);
    }

    getDrugIpd(db, an, hospCode = hcode) {
        return db('view_pharmacy_ipd_psctmc as drug')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('hn as pid', 'an')
            .select(db.raw('concat(admite, " " , timeadmit) as datetime_admit'))
            .select('clinic_std as wardstay', 'drugname as dname',
                'total as amount', 'unitsale as unit',
                'dr_disc as provider', 'warning as caution',
                'cid', 'lastupdate as d_update')
            .where('an', an)
            .where('odr_type', '1')     // เฉพาะ Homemed
            .limit(maxLimit);
    }

    getAccident(db, visitNo, hospCode = hcode) {
        return db('accident')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('vn', visitNo)
            .limit(maxLimit);
    }

    getDrugAllergy(db, hn, hospCode = hcode) {
        return db('view_drug_allergy')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('hn', hn)
            .limit(maxLimit);
    }

    getAppointment(db, visitNo, hospCode = hcode) {
        return db('view_opd_fu')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('vn', "=", visitNo)
            .limit(maxLimit);
    }

    async getReferHistory(db, columnName, searchNo, hospCode = hcode) {
        //columnName = visitNo, referNo
        columnName = columnName === 'visitNo' ? 'refer.vn' : ('refer.' + columnName);
        columnName = columnName === 'refer.referNo' ? 'refer.refer_no' : columnName;
        const sql = `
            SELECT ${hospCode} as hospcode, refer.refer_no as referid
                , concat('${hospCode}',refer.refer_no) as referid_province
                , refer.hn as pid, refer.vn as seq, refer.an
                , concat(refer.date_service,' ',refer.refer_time) as datetime_serv
                , concat(ipd.admite,' ',ipd.time) as datetime_admit
                , concat(refer.refer_date,' ',refer.refer_time) as datetime_refer
                , visit.clinic as clinic_refer, refer.refer_hcode as hosp_destination
                , vs.nurse_pi as chiefcomp, vs.nurse_ph as physicalexam, visit.dx1 as diaglast
                , case when visit.dep=1 then 3 else 1 end as ptype
                , '5' as emergency, '99' as ptypedis, '1' as causeout
                , concat('ว',visit.dr) as provider
                , now() as d_update
            from refer_out as refer 
            LEFT JOIN opd_visit as visit on refer.vn=visit.vn
            LEFT JOIN opd_vs as vs on refer.vn=vs.vn
            LEFT JOIN ipd_ipd as ipd on refer.an=ipd.an
            WHERE refer.hcode='${hospCode}' and ${columnName}='${searchNo}'
            limit ${maxLimit};
        `;
        const result = await db.raw(sql);
        return result[0];
    }

    getClinicalRefer(db, referNo, hospCode = hcode) {
        return db('view_clinical_refer')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('refer_no', "=", referNo)
            .limit(maxLimit);
    }

    getInvestigationRefer(db, referNo, hospCode = hcode) {
        return db('view_investigation_refer')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('refer_no', "=", referNo)
            .limit(maxLimit);
    }

    getCareRefer(db, referNo, hospCode = hcode) {
        return db('view_care_refer')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('refer_no', "=", referNo)
            .limit(maxLimit);
    }

    getReferResult(db, hospDestination, referNo, hospCode = hcode) {
        return db('view_refer_result')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where('refer_hcode', "=", hospDestination)
            .where('refer_no', "=", referNo)
            .limit(maxLimit);
    }

    getProvider(db, columnName, searchNo, hospCode = hcode) {
        columnName = columnName === 'licenseNo' ? 'code' : columnName;
        const now = moment().locale('th').format('YYYYMMDDHHmmss');
        return db('view_lib_dr')
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('code as provider', 'code as council',
                'councilno as registerno', 'cid', 'title as prename',
                'name as fname', 'surname as lname', 'sex',
                'dob as birth', 'branch as providertype')
            .select(db.raw('"" as startdate'))
            .select('expire as outdate')
            .select(db.raw('"" as movefrom'))
            .select(db.raw('"" as moveto'))
            .select(db.raw('"' + now + '" as d_update'))
            .where(columnName, "=", searchNo)
            .limit(maxLimit);
    }

    getData(db, tableName, columnName, searchNo, hospCode = hcode) {
        return db(tableName)
            .select(db.raw('"' + hcode + '" as hospcode'))
            .select('*')
            .where(columnName, "=", searchNo)
            .limit(maxLimit);
    }
}
