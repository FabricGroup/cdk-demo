import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import { InfraStack } from '../lib/infra-stack'
import { ServiceSetupStack } from '../lib/service-setup-stack'
import { CdkSetupStack } from '../lib/cdk-setup-stack'
import cdk = require('@aws-cdk/core')

test('CDK stack should create pipeline', () => {
    const app = new cdk.App()
    const infraStack = new InfraStack(app, 'infra-stack')
    const props = {
        cdkSource: {
            repo: 'test-repo',
            githubTokenName: '/awesome/token',
            owner: 'Acme',
            branch: 'master'
        },
        deploymentRole: infraStack.deploymentRole,
        serviceSetupStackName: 'awesome-service-stack'
    }

    const stack = new CdkSetupStack(app, 'CdkDeployStack', props)

    expectCDK(stack).to(haveResourceLike('AWS::CodePipeline::Pipeline', {
        Properties: {
            Name: 'cdk-deployment-pipeline'
        }
    }, ResourcePart.CompleteDefinition))
})

test('Service Repo should be created', () => {
    const app = new cdk.App()
    const infraStack = new InfraStack(app, 'infra-stack')
    const props = {
        serviceName: 'test-service',
        serviceSource: {
            repo: 'test-repo',
            githubTokenName: '/awesome/token',
            owner: 'Acme',
            branch: 'master'
        },
        hostedZone: {
            id: 'Z20QY3N3V946UQ',
            name: 'dev.fabricgroup.com.au'
        },
        deploymentRole: infraStack.deploymentRole
    }

    const stack = new ServiceSetupStack(app, 'CdkDeployStack', props)

    expectCDK(stack).to(haveResourceLike('AWS::ECR::Repository', {
        Properties: {
            RepositoryName: 'goose-repo'
        },
        DeletionPolicy: 'Delete'
    }, ResourcePart.CompleteDefinition))
})


