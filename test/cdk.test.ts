import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import { InfraStack } from '../lib/infra-stack'
import cdk = require('@aws-cdk/core')

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
