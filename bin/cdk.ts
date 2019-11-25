#!/usr/bin/env node
import {DemoServiceStack} from '../lib/demo-service-stack';
import {InfraStack} from '../lib/infra-stack';
import {CdkDeployStack} from '../lib/cdk-deploy-stack';
import cdk = require('@aws-cdk/core');

const app = new cdk.App();
const defaultStackProps = {
    tags: {
        'meetup': 'true'
    }
};
const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps);
const serviceStack = new DemoServiceStack(app, 'demo-stack', defaultStackProps);
new CdkDeployStack(app, 'cdk-deploy-stack', {
    ...defaultStackProps,
    deploymentRole: infraStack.deploymentRole,
    serviceStackName: serviceStack.stackName
});
