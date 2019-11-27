#!/usr/bin/env node
import 'source-map-support/register'
import { App } from '@aws-cdk/core'
import { InfraStack } from '../lib/stacks/infra-stack'
import { CdkSetupStack } from '../lib/stacks/cdk-setup-stack'

const githubTokenName = 'cdk-demo/github/goose-token'

const app = new App()
const defaultStackProps = {
    tags: {
        'cdk-demo': 'true'
    }
}

const infraStack = new InfraStack(app, 'infra-stack', defaultStackProps)

new CdkSetupStack(app, 'cdk-deploy-stack', {
    ...defaultStackProps,
    cdkSource: {
        repo: 'cdk-demo',
        githubTokenName: githubTokenName,
        owner: 'FabricGroup',
        branch: 'master'
    },
    deploymentRole: infraStack.deploymentRole
})
