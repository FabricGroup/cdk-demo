#!/usr/bin/env node
import {ServiceSetupStack} from '../lib/service-setup-stack';
import {InfraStack} from '../lib/infra-stack';
import {CdkDeployStack} from '../lib/cdk-deploy-stack';
import cdk = require('@aws-cdk/core');
import {ServiceDeploymentStack, ServiceDeploymentStackProps} from "../lib/service-deployment-stack";

const ACCOUNT_ID = "254147059574"
const AWS_REGION = "ap-southeast-2"

const app = new cdk.App();
const defaultStackProps = {
    tags: {
        'meetup': 'true'
    }
};
const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps);
const serviceSetupStack = new ServiceSetupStack(app, 'demo-service-setup-stack', defaultStackProps);

const serviceDeploymentStackProps: ServiceDeploymentStackProps = {
    ... defaultStackProps,
    env: {
        account: ACCOUNT_ID,
        region: AWS_REGION
    },
    ecrRepo: serviceSetupStack.ecrRepo,
    containerPort: 8083,
    environmentVars: {
        PORT: "8083"
    }
}

const serviceDeploymentStack = new ServiceDeploymentStack(app, 'demo-service-deployment-stack', serviceDeploymentStackProps)

new CdkDeployStack(app, 'cdk-deploy-stack', {
    ...defaultStackProps,
    deploymentRole: infraStack.deploymentRole,
    serviceStackName: serviceSetupStack.stackName,
});
