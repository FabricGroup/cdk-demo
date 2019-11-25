import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import { CdkSetupStack } from '../lib/cdk-setup-stack'
import { InfraStack } from '../lib/infra-stack'
import cdk = require('@aws-cdk/core')

test('Service Repo should be created', () => {
  const app = new cdk.App()
  const infraStack = new InfraStack(app, 'infra-stack')
  const role = infraStack.deploymentRole
  const stack = new CdkSetupStack(app, 'CdkDeployStack', {serviceStackName: 'test', deploymentRole: role})
  expectCDK(stack).to(haveResourceLike('AWS::ECR::Repository', {
    Properties: {
      RepositoryName: 'goose-repo'
    },
    DeletionPolicy: 'Retain'
  }, ResourcePart.CompleteDefinition))
})
