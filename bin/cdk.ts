#!/usr/bin/env node
import {InfraStack} from '../lib/infra-stack';
import {CdkSetupStack} from '../lib/cdk-setup-stack';
import cdk = require('@aws-cdk/core');
import {ServiceDeploymentStack, ServiceDeploymentStackProps} from "../lib/service-deployment-stack";

const serviceStackName = 'goose-service-stack'

const app = new cdk.App()
const defaultStackProps = {
    tags: {
        'meetup': 'true'
    }
}
const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps)

const cdkSetupStack = new CdkSetupStack(app, 'cdk-deploy-stack', {
    ...defaultStackProps,
    deploymentRole: infraStack.deploymentRole,
    serviceStackName: serviceStackName
})

const serviceDeploymentStackProps: ServiceDeploymentStackProps = {
    ...defaultStackProps,
    ecrRepo: cdkSetupStack.serviceSetupConstruct.ecrRepository,
    containerPort: 8083,
    environmentVars: {
        PORT: "8083"
    },
    dnsName: 'goose',
    hostedZone: {
        id: "Z20QY3N3V946UQ",
        name: "dev.fabricgroup.com.au"
    }
}

new ServiceDeploymentStack(app, serviceStackName, serviceDeploymentStackProps)

