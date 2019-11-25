import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import { CdkDeployStack } from '../lib/cdk-deploy-stack'
import { InfraStack } from '../lib/infra-stack'
import cdk = require('@aws-cdk/core')

test('Service Repo should be created', () => {
  const app = new cdk.App()
  const infraStack = new InfraStack(app, 'infra-stack')
  const role = infraStack.deploymentRole
  const stack = new CdkDeployStack(app, 'CdkDeployStack', {serviceStackName: 'test', deploymentRole: role})
  expectCDK(stack).to(haveResourceLike('AWS::ECR::Repository', {
    Properties: {
      RepositoryName: 'goose-repo'
    },
    DeletionPolicy: 'Retain'
  }, ResourcePart.CompleteDefinition))
})
