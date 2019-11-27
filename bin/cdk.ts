#!/usr/bin/env node
import 'source-map-support/register'
import { App } from '@aws-cdk/core'
import { InfraStack } from '../lib/stacks/infra-stack'
import { CdkSetupStack } from '../lib/stacks/cdk-setup-stack'
import { ServiceSetupStack } from '../lib/stacks/service-setup-stack'

const githubTokenName = 'cdk-demo/github/goose-token'

const app = new App()
const defaultStackProps = {
    tags: {
        'cdk-demo': 'true'
    }
}

const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps)

const serviceSetupStack = new ServiceSetupStack(app, 'goose-service-setup-stack', {
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
        branch: 'master'
    },
    deploymentRole: infraStack.deploymentRole,
    serviceSetupStackName: serviceSetupStack.stackName
})
