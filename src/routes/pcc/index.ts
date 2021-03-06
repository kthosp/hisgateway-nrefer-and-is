/// <reference path="../../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';

import { PccHisJhcisModel } from '../../models/pcc/his_jhcis.model';
import { PccHisEzhospModel } from '../../models/pcc/his_ezhosp.model';

import { HisEzhospModel } from '../../models/refer/his_ezhosp';
import { HisThiadesModel } from '../../models/refer/his_thiades';
import { HisHosxpv3Model } from '../../models/refer/his_hosxpv3';
import { HisHosxpv4Model } from '../../models/refer/his_hosxpv4';
import { HisJhcisModel } from '../../models/refer/his_jhcis';
import { HisMdModel } from '../../models/refer/his_md';
import { HisKpstatModel } from '../../models/refer/his_kpstat';
import { HisMkhospitalModel } from '../../models/refer/his_mkhospital';
import { HisModel } from '../../models/refer/his';
import { HisNemoModel } from '../../models/refer/his_nemo';


const hisProvider = process.env.HIS_PROVIDER;
var pccHisModel: any;
var hisModel: any;

switch (hisProvider) {
  case 'ezhosp':
    pccHisModel = new PccHisEzhospModel();
    hisModel = new HisEzhospModel();
    break;
  case 'thiades':
    hisModel = new HisThiadesModel();
    break;
  case 'hosxpv3':
    hisModel = new HisHosxpv3Model();
    break;
  case 'hosxpv4':
    hisModel = new HisHosxpv4Model();
    break;
  case 'mkhospital':
    hisModel = new HisMkhospitalModel();
    break;
  case 'nemo':
  case 'nemo_refer':
    hisModel = new HisNemoModel();
    break;
  case 'ssb':
    // hisModel = new HisSsbModel();
    break;
  case 'infod':
    // hisModel = new HisInfodModel();
    break;
  case 'hi':
    // hisModel = new HisHiModel();
    break;
  case 'himpro':
    // hisModel = new HisHimproModel();
    break;
  case 'jhcis':
    hisModel = new HisJhcisModel();
    pccHisModel = new PccHisJhcisModel();
    break;
  case 'hosxppcu':
    // hisModel = new HisHosxppcuModel();
    break;
  case 'hospitalos':
    // hisModel = new HisHospitalOsModel();
    break;
  case 'jhos':
    // hisModel = new HisJhosModel();
    break;
  case 'pmk':
    // hisModel = new HisPmkModel();
    break;
  case 'md':
    hisModel = new HisMdModel();
    break;
  case 'spdc':
  case 'kpstat':
    hisModel = new HisKpstatModel();
    break;
  default:
    hisModel = new HisModel();
}

const router = (fastify, { }, next) => {
  var dbHIS: Knex = fastify.dbHIS;

  fastify.post('/person', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hospcode = req.body.hospcode;
    const searchType = req.body.searchType;
    const searchValue = req.body.searchValue;

    if (searchType && searchValue) {
      try {
        const result = await pccHisModel.getPerson(dbHIS, searchType, searchValue);
        reply.status(HttpStatus.OK).send({
          statusCode: HttpStatus.OK,
          rows: result
        });
      } catch (error) {
        console.log('person', searchValue, error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/person-by-name', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hospcode = req.body.hospcode;
    const fname = req.body.fname;
    const lname = req.body.lname;

    if (fname + lname) {
      try {
        const result = await pccHisModel.getPersonByName(dbHIS, fname, lname);
        reply.status(HttpStatus.OK).send({
          statusCode: HttpStatus.OK,
          rows: result
        });
      } catch (error) {
        console.log('person', fname, lname, error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/person-chronic', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hospcode = req.body.hospcode;
    const cid = req.body.cid;
    const pid = req.body.pid;

    if (cid || pid) {
      try {
        const result = await pccHisModel.getChronic(dbHIS, pid, cid);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('person-chronic', cid, pid, error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/drug-allergy', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hospcode = req.body.hospcode;
    const pid = req.body.pid;
    const cid = req.body.cid;

    if (pid || cid) {
      try {
        const result = await pccHisModel.getDrugAllergy(dbHIS, pid, cid);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
          });
        }
      } catch (error) {
        console.log('drug-allergy', cid, pid, error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/visit', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hospcode = req.body.hospcode;
    const hn = req.body.hn;
    const cid = req.body.cid;
    const visitNo = req.body.visitNo;
    const date = req.body.date;

    if (hn + cid) {
      try {
        const result = await pccHisModel.getServiceByHn(dbHIS, hn, cid, date, visitNo);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log(error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/diagnosis', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const visitNo = req.body.visitNo;

    if (visitNo) {
      try {
        const result = await pccHisModel.getDiagnosis(dbHIS, visitNo);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('opd-diagnosis', error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/diagnosis-by-hn', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hn = req.body.hn;

    if (hn) {
      try {
        const result = await pccHisModel.getDiagnosisByHn(dbHIS, hn);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('opd-diagnosis-by-hn', error.message);
        reply.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/drug', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const visitNo = req.body.visitNo;

    if (visitNo) {
      try {
        const result = await pccHisModel.getDrug(dbHIS, visitNo);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('drug', error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/drug-by-hn', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hn = req.body.hn;

    if (hn) {
      try {
        const result = await pccHisModel.getDrugByHn(dbHIS, hn);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('drug-by-hn', error.message);
        reply.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/anc', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const visitNo = req.body.visitNo;

    if (visitNo) {
      try {
        const result = await pccHisModel.getAnc(dbHIS, visitNo);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('anc', error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/anc-by-hn', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hn = req.body.hn;

    if (hn) {
      try {
        const result = await pccHisModel.getAncByHn(dbHIS, hn);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('anc-by-hn', error.message);
        reply.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/epi', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const visitNo = req.body.visitNo;

    if (visitNo) {
      try {
        const result = await pccHisModel.getEpi(dbHIS, visitNo);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('epi', error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/epi-by-hn', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hn = req.body.hn;

    if (hn) {
      try {
        const result = await pccHisModel.getEpiByHn(dbHIS, hn);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log(process.env.HOSPCODE, 'epi-by-hn', error.message);
        reply.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/fp', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const visitNo = req.body.visitNo;

    if (visitNo) {
      try {
        const result = await pccHisModel.getFp(dbHIS, visitNo);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('fp', error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/fp-by-hn', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hn = req.body.hn;

    if (hn) {
      try {
        const result = await pccHisModel.getFpByHn(dbHIS, hn);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('fp-by-hn', error.message);
        reply.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/nutrition', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const visitNo = req.body.visitNo;

    if (visitNo) {
      try {
        const result = await pccHisModel.getNutrition(dbHIS, visitNo);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('nutrition', error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/nutrition-by-hn', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const hn = req.body.hn;

    if (hn) {
      try {
        const result = await pccHisModel.getNutritionByHn(dbHIS, hn);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('nutrition-by-hn', error.message);
        reply.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/lab-result', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const searchType = req.body.searchType || 'pid';
    const searchValue = req.body.searchValue;

    if (searchType && searchValue) {
      try {
        const result = await pccHisModel.getLabResult(dbHIS, searchType, searchValue);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('lab-result', error.message);
        reply.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })

  fastify.post('/lib-drug', { preHandler: [fastify.serviceMonitoring, fastify.checkRequestKey] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const searchType = req.body.searchType;
    const searchValue = req.body.searchValue;

    if (searchType && searchValue) {
      try {
        const result = await pccHisModel.libDrug(dbHIS, searchType, searchValue);
        if (result) {
          reply.status(HttpStatus.OK).send({
            statusCode: HttpStatus.OK,
            rows: result
          });
        } else {
          reply.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'record not found'
          });
        }
      } catch (error) {
        console.log('drug', error.message);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message
        });
      }
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST)
      });
    }
  })


  next();
}


module.exports = router;
