#!/usr/bin/env node
import { InfraStack } from '../lib/infra-stack'
import { CdkSetupStack } from '../lib/cdk-setup-stack'
import { App } from '@aws-cdk/core'
import { ServiceSetupStack } from '../lib/service-setup-stack'

const githubTokenName = 'cdk-demo/github/goose-token'

const app = new App()
const defaultStackProps = {
    tags: {
        'meetup': 'true'
    }
}
const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps)

const serviceStack = new ServiceSetupStack(app, 'goose-service-setup-stack', {
    ...defaultStackProps,
    serviceName: 'goose',
    serviceSource: {
        repo: 'goose',
        githubTokenName: githubTokenName,
        owner: 'FabricGroup',
        branch: 'master'
    },
    hostedZone: {
        id: 'Z20QY3N3V946UQ',
        name: 'dev.fabricgroup.com.au'
    },
    deploymentRole: infraStack.deploymentRole
})

new CdkSetupStack(app, 'cdk-deploy-stack', {
    ...defaultStackProps,
    cdkSource: {
        repo: 'cdk-demo',
        githubTokenName: githubTokenName,
        owner: 'FabricGroup',
        branch: 'master2'
    },
    deploymentRole: infraStack.deploymentRole,
    serviceSetupStackName: serviceStack.stackName
})

