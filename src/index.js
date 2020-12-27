const log4js = require('log4js');
const publicIp = require('public-ip');
const package = require('./package.json');

log4js.configure({
    appenders: { out: {
        type: 'stdout' 
    } },
    categories: { default: { 
        appenders: [ 'out' ], 
        level: 'info' 
    } }
});
const logger = log4js.getLogger();

logger.info(`${package.name}(${package.version})`);

logger.info('Checking environment variables...');
[
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'hosted_zone_id',
    'name'
]
.forEach((key) => {
    if(process.env[key]) {
        logger.info(`${key} OK`);
    } else {
        logger.error(`${key} is not found.`);
        process.exit(1);
    }
});

logger.info('Configuring AWS...');
const AWS = require('aws-sdk');
const Route53 = new AWS.Route53({ apiVersion: '2013-04-01' });

let previousIPv4 = null;

const run = async () => {
    try {
        const ipv4 = await publicIp.v4();
        if(ipv4 && previousIPv4 != ipv4) {
            previousIPv4 = ipv4;
            Route53.changeResourceRecordSets({
                ChangeBatch: {
                    Changes: [
                        {
                            Action: 'UPSERT',
                            ResourceRecordSet: {
                                Name: process.env.name,
                                ResourceRecords: [ {
                                    Value: ipv4
                                } ],
                                TTL: process.env.ttl | '300',
                                Type: 'A'
                            },
                        }
                    ]
                },
                HostedZoneId: process.env.hosted_zone_id
            }, (error) => {
                if(error) {
                    logger.error('Couldn\'t upsert records to AWS Route 53.');
                    logger.error(error);
                } else {
                    logger.info(`Updated. - Name: ${process.env.name}, IPv4: ${ipv4}`);
                }
            });
        } else {
            logger.info('No changes.');
        }
    } catch(error) {
        logger.warn('Couldn\'t find IPv4');
        logger.error(error);
    }
};

run();

setInterval(async () => run(), process.env.interval | 300000);