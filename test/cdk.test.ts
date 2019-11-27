import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import { InfraStack } from '../lib/stacks/infra-stack'
import cdk = require('@aws-cdk/core')
import { CdkSetupStack } from '../lib/stacks/cdk-setup-stack'

test('Should create infra stack', () => {
    const app = new cdk.App()
    // WHEN
    const stack = new InfraStack(app, 'InfraStack')
    // THEN
    expectCDK(stack).to(haveResourceLike('AWS::IAM::Role', {
        Properties: {
            RoleName: 'cdk-deployer'
        }
    }, ResourcePart.CompleteDefinition))
})

test('CDK setup stack should create pipeline', () => {
    const app = new cdk.App()
    const infraStack = new InfraStack(app, 'infra-stack')
    const props = {
        cdkSource: {
            repo: 'test-repo',
            githubTokenName: '/awesome/token',
            owner: 'Acme',
            branch: 'master'
        },
        deploymentRole: infraStack.deploymentRole
    }

    const stack = new CdkSetupStack(app, 'CdkDeployStack', props)

    expectCDK(stack).to(haveResourceLike('AWS::CodePipeline::Pipeline', {
        Properties: {
            Name: 'cdk-deployment-pipeline'
        }
    }, ResourcePart.CompleteDefinition))
})
