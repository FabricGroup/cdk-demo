#!/usr/bin/env node
import {InfraStack} from '../lib/infra-stack';
import {CdkDeployStack} from '../lib/cdk-deploy-stack';
import cdk = require('@aws-cdk/core');
import {ServiceDeploymentStack, ServiceDeploymentStackProps} from "../lib/service-deployment-stack";

const ACCOUNT_ID = "254147059574"
const AWS_REGION = "ap-southeast-2"
const serviceStackName = 'goose-service'

const app = new cdk.App()
const defaultStackProps = {
    tags: {
        'meetup': 'true'
    }
}
const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps)

const cdkSetupStack = new CdkDeployStack(app, 'cdk-deploy-stack', {
    ...defaultStackProps,
    deploymentRole: infraStack.deploymentRole,
    serviceStackName: serviceStackName
})

const serviceDeploymentStackProps: ServiceDeploymentStackProps = {
    ...defaultStackProps,
    name: 'goose',
    env: {
        account: ACCOUNT_ID,
        region: AWS_REGION
    },
    ecrRepo: cdkSetupStack.ecrRepository,
    containerPort: 8083,
    environmentVars: {
        PORT: "8083"
    },
    hostedZone: {
        id: "Z20QY3N3V946UQ",
        name: "dev.fabricgroup.com.au"
    }
}

new ServiceDeploymentStack(app, serviceStackName, serviceDeploymentStackProps)

