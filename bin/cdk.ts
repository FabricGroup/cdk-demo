#!/usr/bin/env node
import {ServiceSetupStack} from '../lib/service-setup-stack';
import {InfraStack} from '../lib/infra-stack';
import {CdkDeployStack} from '../lib/cdk-deploy-stack';
import cdk = require('@aws-cdk/core');
import {ServiceDeploymentStack} from "../lib/service-deployment-stack";

const app = new cdk.App();
const defaultStackProps = {
    tags: {
        'meetup': 'true'
    }
};
const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps);
const serviceStack = new ServiceSetupStack(app, 'demo-service-setup-stack', defaultStackProps);
const serviceDeploymentStack = new ServiceDeploymentStack(app, 'demo-service-deployment-stack', defaultStackProps)
new CdkDeployStack(app, 'cdk-deploy-stack', {
    ...defaultStackProps,
    deploymentRole: infraStack.deploymentRole,
    serviceStackName: serviceStack.stackName,
});
